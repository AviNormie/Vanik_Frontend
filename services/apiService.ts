import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_MARKETPLACE_BACKEND_URL || 'http://10.12.139.49:3001'; // Marketplace Backend URL

interface CropListing {
  id: string;
  farmerId: string;
  cropType: string;
  quantityKg: number;
  expectedPrice: number;
  location: string;
  status: string;
  createdAt: string;
  offers?: Offer[];
}

interface Offer {
  id: string;
  retailerId: string;
  listingId: string;
  pricePerKg: number;
  createdAt: string;
}

interface CreateOfferDto {
  listingId: string;
  pricePerKg: number;
}

class ApiService {
  private async getAuthToken(): Promise<string | null> {
    try {
      // Try multiple possible token keys
      let token = await AsyncStorage.getItem('authToken');
      if (!token) {
        token = await AsyncStorage.getItem('token');
      }
      if (!token) {
        // Try to get from tokenData object
        const tokenData = await AsyncStorage.getItem('tokenData');
        if (tokenData) {
          const parsed = JSON.parse(tokenData);
          token = parsed.token;
        }
      }
      
      console.log('🔑 Auth token found:', !!token);
      if (token) {
        console.log('🔑 Token preview:', token.substring(0, 20) + '...');
      }
      return token;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Debug function to check auth status
  async checkAuthStatus(): Promise<{ hasToken: boolean; tokenPreview?: string }> {
    const token = await this.getAuthToken();
    return {
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 20) + '...' : undefined
    };
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    const token = await this.getAuthToken();
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    };

    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        ...config,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed - please log in again');
        } else if (response.status === 403) {
          throw new Error('Access denied - insufficient permissions');
        } else if (response.status >= 500) {
          throw new Error('Server error - please try again later');
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
      }
      
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error(`API request failed for ${endpoint}:`, error);
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request timeout - please check your internet connection and backend server');
      }
      
      throw error;
    }
  }

  // Retailer endpoints
  async getAllOpenListings(): Promise<CropListing[]> {
    return this.makeRequest('/retailer/listings');
  }

  async createOffer(createOfferDto: CreateOfferDto): Promise<Offer> {
    return this.makeRequest('/retailer/offers', {
      method: 'POST',
      body: JSON.stringify(createOfferDto),
    });
  }

  async getRetailerOffers(): Promise<Offer[]> {
    return this.makeRequest('/retailer/offers');
  }

  // Local storage helpers for when backend is unavailable
  private async saveListingLocally(listing: CropListing): Promise<void> {
    try {
      const existingListings = await this.getLocalListings();
      const updatedListings = [listing, ...existingListings];
      await AsyncStorage.setItem('farmer_listings', JSON.stringify(updatedListings));
      console.log('📱 Listing saved locally:', listing.id);
    } catch (error) {
      console.error('Error saving listing locally:', error);
    }
  }

  private async getLocalListings(): Promise<CropListing[]> {
    try {
      const stored = await AsyncStorage.getItem('farmer_listings');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error getting local listings:', error);
      return [];
    }
  }

  private async removeLocalListing(id: string): Promise<void> {
    try {
      const existingListings = await this.getLocalListings();
      const updatedListings = existingListings.filter(listing => listing.id !== id);
      await AsyncStorage.setItem('farmer_listings', JSON.stringify(updatedListings));
      console.log('📱 Listing removed locally:', id);
    } catch (error) {
      console.error('Error removing local listing:', error);
    }
  }

  // Farmer endpoints with local fallback
  async createListing(listingData: {
    cropType: string;
    quantityKg: number;
    expectedPrice: number;
    location: string;
  }): Promise<CropListing> {
    try {
      // Try API first
      return await this.makeRequest('/farmer/listings', {
        method: 'POST',
        body: JSON.stringify(listingData),
      });
    } catch (error) {
      console.warn('API failed, saving listing locally');
      
      // Create local listing when API fails
      const localListing: CropListing = {
        id: `local_${Date.now()}`,
        farmerId: 'farmer1', // This should come from auth context
        cropType: listingData.cropType,
        quantityKg: listingData.quantityKg,
        expectedPrice: listingData.expectedPrice,
        location: listingData.location,
        status: 'OPEN',
        createdAt: new Date().toISOString(),
        offers: []
      };
      
      await this.saveListingLocally(localListing);
      return localListing;
    }
  }

  async getFarmerListings(): Promise<CropListing[]> {
    try {
      // Try API first
      const apiListings = await this.makeRequest('/farmer/listings');
      return apiListings;
    } catch (error) {
      console.warn('API failed, loading local listings');
      
      // Fallback to local listings
      const localListings = await this.getLocalListings();
      
      if (localListings.length === 0) {
        // If no local listings, show some sample data so the UI isn't empty
        const sampleListings: CropListing[] = [
          {
            id: 'sample_1',
            farmerId: 'farmer1',
            cropType: 'Rice',
            quantityKg: 100,
            expectedPrice: 3200,
            location: 'Sample Location',
            status: 'OPEN',
            createdAt: new Date().toISOString(),
            offers: []
          }
        ];
        return sampleListings;
      }
      
      return localListings;
    }
  }

  async getListing(id: string): Promise<CropListing> {
    return this.makeRequest(`/farmer/listings/${id}`);
  }

  async deleteListing(id: string): Promise<void> {
    try {
      // Try API first
      await this.makeRequest(`/farmer/listings/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.warn('API failed, removing listing locally');
      
      // Remove from local storage if API fails
      await this.removeLocalListing(id);
    }
  }

  async updateListing(id: string, listingData: {
    cropType: string;
    quantityKg: number;
    expectedPrice: number;
    location: string;
  }): Promise<CropListing> {
    return this.makeRequest(`/farmer/listings/${id}`, {
      method: 'PUT',
      body: JSON.stringify(listingData),
    });
  }

  // Market data endpoints - try API first, fallback to static data
  async getMarketData(): Promise<any[]> {
    try {
      // Try to get real market data from API
      return await this.makeRequest('/market/prices');
    } catch (error) {
      console.warn('Market data API failed, using static data');
      // Fallback to static data when API is unavailable
      return [
        {
          crop: 'Rice',
          currentPrice: '₹3,200/q',
          msp: '₹2,183/q',
          mandiPrice: '₹3,100/q',
          trend: '+2.5%',
          prediction: 'Prices expected to rise',
          confidence: 85,
        },
        {
          crop: 'Banana',
          currentPrice: '₹2,750/q',
          msp: '₹2,500/q',
          mandiPrice: '₹2,650/q',
          trend: '+1.8%',
          prediction: 'Stable market conditions',
          confidence: 78,
        },
        {
          crop: 'Wheat',
          currentPrice: '₹2,050/q',
          msp: '₹2,015/q',
          mandiPrice: '₹2,000/q',
          trend: '-0.5%',
          prediction: 'Slight decline expected',
          confidence: 72,
        },
        {
          crop: 'Vegetables',
          currentPrice: '₹1,450/q',
          msp: '₹1,200/q',
          mandiPrice: '₹1,400/q',
          trend: '+3.2%',
          prediction: 'High demand season',
          confidence: 90,
        },
      ];
    }
  }

  // Search and filter listings
  async searchListings(params: {
    query?: string;
    cropType?: string;
    location?: string;
    minPrice?: number;
    maxPrice?: number;
  }): Promise<CropListing[]> {
    const listings = await this.getAllOpenListings();
    
    return listings.filter(listing => {
      // General query search across crop type, location, and farmer ID
      if (params.query) {
        const query = params.query.toLowerCase();
        const searchableText = [
          listing.cropType,
          listing.location,
          listing.farmerId
        ].join(' ').toLowerCase();
        
        if (!searchableText.includes(query)) {
          return false;
        }
      }
      
      if (params.cropType && !listing.cropType.toLowerCase().includes(params.cropType.toLowerCase())) {
        return false;
      }
      if (params.location && !listing.location.toLowerCase().includes(params.location.toLowerCase())) {
        return false;
      }
      if (params.minPrice && listing.expectedPrice < params.minPrice) {
        return false;
      }
      if (params.maxPrice && listing.expectedPrice > params.maxPrice) {
        return false;
      }
      return true;
    });
  }
}

export const apiService = new ApiService();
export type { CropListing, Offer, CreateOfferDto };
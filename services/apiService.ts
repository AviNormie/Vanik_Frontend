import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_AUTH_BACKEND_URL || 'http://10.12.139.117:3000'; // Marketplace Backend URL

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
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
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

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
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

  // Farmer endpoints
  async createListing(listingData: {
    cropType: string;
    quantityKg: number;
    expectedPrice: number;
    location: string;
  }): Promise<CropListing> {
    return this.makeRequest('/farmer/listings', {
      method: 'POST',
      body: JSON.stringify(listingData),
    });
  }

  async getFarmerListings(): Promise<CropListing[]> {
    return this.makeRequest('/farmer/listings');
  }

  async getListing(id: string): Promise<CropListing> {
    return this.makeRequest(`/farmer/listings/${id}`);
  }

  // Market data endpoints (mock for now, can be replaced with real API)
  async getMarketData(): Promise<any[]> {
    // This would be replaced with real market data API
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
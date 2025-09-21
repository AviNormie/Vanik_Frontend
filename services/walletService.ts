// Mock wallet service for demonstration
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  lastUpdated: string;
}

export interface Escrow {
  id: string;
  retailerId: string;
  farmerId: string;
  listingId: string;
  amountLocked: number;
  status: 'LOCKED' | 'RELEASED' | 'DISPUTE';
  createdAt: string;
  updatedAt: string;
}

export interface Offer {
  id: string;
  retailerId: string;
  farmerId: string;
  listingId: string;
  pricePerKg: number;
  quantity: number;
  totalAmount: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  escrowId?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

// Mock data storage with initial retailer balance
let mockWallets: Wallet[] = [
  {
    id: '1',
    userId: 'retailer1',
    balance: 10000, // Initial balance for retailer
    lastUpdated: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'farmer1',
    balance: 0,
    lastUpdated: new Date().toISOString(),
  },
];

// Initialize retailer wallets with default balance
const initializeRetailerWallet = (userId: string) => {
  const existingWallet = mockWallets.find(w => w.userId === userId);
  if (!existingWallet && userId.includes('retailer')) {
    mockWallets.push({
      id: Date.now().toString(),
      userId,
      balance: 10000, // Default retailer balance
      lastUpdated: new Date().toISOString(),
    });
  }
};

let mockEscrows: Escrow[] = [];
let mockOffers: Offer[] = [];
let mockTransactions: Transaction[] = [];

export class WalletService {
  // Get wallet balance for user
  static async getWalletBalance(userId: string): Promise<number> {
    // Initialize retailer wallet if it doesn't exist
    if (userId.includes('retailer')) {
      initializeRetailerWallet(userId);
    }
    
    const wallet = mockWallets.find(w => w.userId === userId);
    return wallet?.balance || 0;
  }

  // Top up wallet (mock implementation)
  static async topUpWallet(userId: string, amount: number): Promise<boolean> {
    try {
      const walletIndex = mockWallets.findIndex(w => w.userId === userId);
      
      if (walletIndex >= 0) {
        mockWallets[walletIndex].balance += amount;
        mockWallets[walletIndex].lastUpdated = new Date().toISOString();
      } else {
        // Create new wallet if doesn't exist
        mockWallets.push({
          id: Date.now().toString(),
          userId,
          balance: amount,
          lastUpdated: new Date().toISOString(),
        });
      }
      
      // Add transaction record
      mockTransactions.push({
        id: Date.now().toString() + '_' + userId,
        type: 'credit',
        amount,
        description: 'Wallet top-up',
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Error topping up wallet:', error);
      return false;
    }
  }

  // Get transactions for user
  static async getTransactions(userId: string): Promise<Transaction[]> {
    // Return only transactions related to this user
    return mockTransactions.filter(transaction => {
      // Filter by userId in transaction ID or description
      return transaction.id.includes(userId) || transaction.description.includes(userId);
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  // Make an offer with escrow
  static async makeOffer(
    retailerId: string,
    farmerId: string,
    listingId: string,
    pricePerKg: number,
    quantity: number
  ): Promise<{ success: boolean; message: string; offerId?: string }> {
    try {
      const totalAmount = pricePerKg * quantity;
      const retailerWallet = mockWallets.find(w => w.userId === retailerId);
      
      if (!retailerWallet || retailerWallet.balance < totalAmount) {
        return {
          success: false,
          message: 'Insufficient wallet balance. Please top up your wallet.',
        };
      }
      
      // Deduct amount from retailer wallet
      retailerWallet.balance -= totalAmount;
      retailerWallet.lastUpdated = new Date().toISOString();
      
      // Create escrow
      const escrowId = Date.now().toString();
      const escrow: Escrow = {
        id: escrowId,
        retailerId,
        farmerId,
        listingId,
        amountLocked: totalAmount,
        status: 'LOCKED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      mockEscrows.push(escrow);
      
      // Create offer
      const offerId = `offer_${Date.now()}`;
      const offer: Offer = {
        id: offerId,
        retailerId,
        farmerId,
        listingId,
        pricePerKg,
        quantity,
        totalAmount,
        status: 'PENDING',
        escrowId,
        createdAt: new Date().toISOString(),
      };
      mockOffers.push(offer);
      
      return {
        success: true,
        message: 'Offer submitted successfully. Amount locked in escrow.',
        offerId,
      };
    } catch (error) {
      console.error('Error making offer:', error);
      return {
        success: false,
        message: 'Failed to submit offer. Please try again.',
      };
    }
  }

  // Release escrow (after delivery confirmation)
  static async releaseEscrow(escrowId: string): Promise<boolean> {
    try {
      const escrowIndex = mockEscrows.findIndex(e => e.id === escrowId);
      
      if (escrowIndex < 0) {
        return false;
      }
      
      const escrow = mockEscrows[escrowIndex];
      
      // Update escrow status
      escrow.status = 'RELEASED';
      escrow.updatedAt = new Date().toISOString();
      
      // Add amount to farmer's wallet
      const farmerWalletIndex = mockWallets.findIndex(w => w.userId === escrow.farmerId);
      
      if (farmerWalletIndex >= 0) {
        mockWallets[farmerWalletIndex].balance += escrow.amountLocked;
        mockWallets[farmerWalletIndex].lastUpdated = new Date().toISOString();
      } else {
        // Create farmer wallet if doesn't exist
        mockWallets.push({
          id: Date.now().toString(),
          userId: escrow.farmerId,
          balance: escrow.amountLocked,
          lastUpdated: new Date().toISOString(),
        });
      }
      
      // Record transaction for farmer
      mockTransactions.push({
        id: Date.now().toString() + '_' + escrow.farmerId,
        type: 'credit',
        amount: escrow.amountLocked,
        description: `Payment received from retailer for listing ${escrow.listingId}`,
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Error releasing escrow:', error);
      return false;
    }
  }

  // Dispute escrow
  static async disputeEscrow(escrowId: string): Promise<boolean> {
    try {
      const escrowIndex = mockEscrows.findIndex(e => e.id === escrowId);
      
      if (escrowIndex < 0) {
        return false;
      }
      
      mockEscrows[escrowIndex].status = 'DISPUTE';
      mockEscrows[escrowIndex].updatedAt = new Date().toISOString();
      
      return true;
    } catch (error) {
      console.error('Error disputing escrow:', error);
      return false;
    }
  }

  // Get user's offers
  static async getUserOffers(userId: string): Promise<Offer[]> {
    return mockOffers.filter(offer => 
      offer.retailerId === userId || offer.farmerId === userId
    );
  }

  // Get user's escrows
  static async getUserEscrows(userId: string): Promise<Escrow[]> {
    return mockEscrows.filter(escrow => 
      escrow.retailerId === userId || escrow.farmerId === userId
    );
  }

  // Accept offer (farmer action)
  static async acceptOffer(offerId: string): Promise<boolean> {
    try {
      const offerIndex = mockOffers.findIndex(o => o.id === offerId);
      
      if (offerIndex < 0) {
        return false;
      }
      
      mockOffers[offerIndex].status = 'ACCEPTED';
      
      return true;
    } catch (error) {
      console.error('Error accepting offer:', error);
      return false;
    }
  }

  // Reject offer (farmer action)
  static async rejectOffer(offerId: string): Promise<boolean> {
    try {
      const offerIndex = mockOffers.findIndex(o => o.id === offerId);
      
      if (offerIndex < 0) {
        return false;
      }
      
      const offer = mockOffers[offerIndex];
      offer.status = 'REJECTED';
      
      // If offer is rejected, release the escrow back to retailer
      if (offer.escrowId) {
        const escrowIndex = mockEscrows.findIndex(e => e.id === offer.escrowId);
        
        if (escrowIndex >= 0) {
          const escrow = mockEscrows[escrowIndex];
          
          // Return money to retailer wallet
          const retailerWalletIndex = mockWallets.findIndex(w => w.userId === escrow.retailerId);
          
          if (retailerWalletIndex >= 0) {
            mockWallets[retailerWalletIndex].balance += escrow.amountLocked;
            mockWallets[retailerWalletIndex].lastUpdated = new Date().toISOString();
          }
          
          // Remove escrow
          mockEscrows.splice(escrowIndex, 1);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error rejecting offer:', error);
      return false;
    }
  }

  // Process bulk payment for multiple farmers
  static async processBulkPayment(
    retailerId: string,
    payments: Array<{ farmerId: string; amount: number; listingId: string }>
  ): Promise<boolean> {
    try {
      const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
      const retailerWallet = mockWallets.find(w => w.userId === retailerId);
      
      if (!retailerWallet || retailerWallet.balance < totalAmount) {
        return false;
      }
      
      // Deduct total amount from retailer
      retailerWallet.balance -= totalAmount;
      retailerWallet.lastUpdated = new Date().toISOString();
      
      // Record transaction for retailer
      mockTransactions.push({
        id: Date.now().toString() + '_' + retailerId,
        type: 'debit',
        amount: totalAmount,
        description: `Bulk purchase from ${payments.length} farmers`,
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      // Create escrows for each payment
      payments.forEach(payment => {
        const escrowId = `bulk_escrow_${Date.now()}_${Math.random()}`;
        const escrow: Escrow = {
          id: escrowId,
          retailerId,
          farmerId: payment.farmerId,
          listingId: payment.listingId,
          amountLocked: payment.amount,
          status: 'LOCKED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        mockEscrows.push(escrow);
      });
      
      return true;
    } catch (error) {
      console.error('Error processing bulk payment:', error);
      return false;
    }
  }

  // Withdraw money from farmer wallet (simulate UPI transfer)
  static async withdrawMoney(userId: string, amount: number, upiId: string): Promise<boolean> {
    try {
      const walletIndex = mockWallets.findIndex(w => w.userId === userId);
      
      if (walletIndex < 0) {
        return false;
      }
      
      const wallet = mockWallets[walletIndex];
      
      if (wallet.balance < amount) {
        return false;
      }
      
      // Deduct amount from wallet
      wallet.balance -= amount;
      wallet.lastUpdated = new Date().toISOString();
      
      // Add transaction record
      mockTransactions.push({
        id: Date.now().toString() + '_' + userId,
        type: 'debit',
        amount,
        description: `Withdrawal to UPI: ${upiId}`,
        date: new Date().toISOString(),
        status: 'completed'
      });
      
      return true;
    } catch (error) {
      console.error('Error withdrawing money:', error);
      return false;
    }
  }

  // Get all wallets (for debugging)
  static async getAllWallets(): Promise<Wallet[]> {
    return mockWallets;
  }
}
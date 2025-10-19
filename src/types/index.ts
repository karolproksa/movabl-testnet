export interface PropertyListing {
  id: string;
  name: string;
  description: string;
  photo: string;
  totalPrice: number;
  shares: number;
  pricePerShare: number;
  createdAt: string;
}

export interface WalletState {
  isConnected: boolean;
  address?: string;
  chainId?: number;
}

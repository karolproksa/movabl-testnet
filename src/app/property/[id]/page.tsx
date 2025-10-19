'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PropertyListing } from '@/types';
import { ArrowLeft, MapPin, DollarSign, Users, Calendar, Share2, Wallet, Shield, CheckCircle } from 'lucide-react';

export default function PropertyListingPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  
  const [property, setProperty] = useState<PropertyListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [sharesToBuy, setSharesToBuy] = useState(1);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isBuying, setIsBuying] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    // Load property from localStorage
    const savedProperties = localStorage.getItem('realEstateProperties');
    if (savedProperties) {
      const properties = JSON.parse(savedProperties);
      const foundProperty = properties.find((p: PropertyListing) => p.id === propertyId);
      setProperty(foundProperty || null);
    }
    setLoading(false);
  }, [propertyId]);

  const connectWallet = async () => {
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        
        if (accounts.length > 0) {
          setWalletConnected(true);
          setWalletAddress(accounts[0]);
        }
      } else {
        alert('Please install MetaMask or another Web3 wallet to connect.');
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
    }
  };

  const signMessage = async (message: string): Promise<string | null> => {
    try {
      if (!window.ethereum) {
        throw new Error('No wallet found');
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, walletAddress],
      });

      return signature;
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  };

  const handleBuyShares = async () => {
    if (!property) return;
    
    if (!walletConnected) {
      alert('Please connect your wallet to buy shares.');
      return;
    }

    if (sharesToBuy <= 0) {
      alert('Please enter a valid number of shares to buy.');
      return;
    }

    setIsBuying(true);
    setIsSigning(true);

    try {
      const totalCost = sharesToBuy * property.pricePerShare;
      
      // Create the message to sign
      const message = `I am purchasing shares in this property:
      
Property: ${property.name}
Shares to Buy: ${sharesToBuy}
Price per Share: $${property.pricePerShare.toLocaleString()}
Total Cost: $${totalCost.toLocaleString()}

This signature confirms my purchase of ${sharesToBuy} shares in ${property.name}.`;

      // Request signature from user
      const signature = await signMessage(message);
      
      if (!signature) {
        throw new Error('Signature was cancelled or failed');
      }

      setIsSigning(false);

      // Simulate successful purchase
      alert(`Successfully purchased ${sharesToBuy} shares in ${property.name} for $${totalCost.toLocaleString()}!`);
      
      // Reset form
      setSharesToBuy(1);
      
    } catch (error) {
      console.error('Error buying shares:', error);
      setIsSigning(false);
      if (error instanceof Error && error.message.includes('User rejected')) {
        alert('Purchase was cancelled. Please try again.');
      } else {
        alert('Failed to purchase shares. Please try again.');
      }
    } finally {
      setIsBuying(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Property Not Found</h3>
          <p className="text-gray-600 mb-6">The property you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Properties
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Image and Basic Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="relative">
                <img
                  src={property.photo}
                  alt={property.name}
                  className="w-full h-96 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-gray-800">
                    {property.shares} shares available
                  </span>
                </div>
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.name}</h1>
                <p className="text-gray-600 text-lg leading-relaxed mb-6">{property.description}</p>
                
                {/* Property Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 py-6 border-t border-b border-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="text-sm text-gray-500">Total Value</div>
                    <div className="font-semibold text-gray-900">{formatPrice(property.totalPrice)}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Share2 className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="text-sm text-gray-500">Price per Share</div>
                    <div className="font-semibold text-gray-900">{formatPrice(property.pricePerShare)}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="text-sm text-gray-500">Total Shares</div>
                    <div className="font-semibold text-gray-900">{property.shares}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-orange-600" />
                    </div>
                    <div className="text-sm text-gray-500">Listed</div>
                    <div className="font-semibold text-gray-900">{formatDate(property.createdAt)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Purchase Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Purchase Shares</h2>
              
              {/* Wallet Connection */}
              {!walletConnected ? (
                <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">Wallet Required</span>
                  </div>
                  <p className="text-sm text-yellow-700 mb-3">
                    Connect your wallet to purchase shares
                  </p>
                  <button
                    onClick={connectWallet}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                  </button>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Wallet Connected</span>
                    </div>
                    <div className="text-sm text-green-700">
                      {formatAddress(walletAddress)}
                    </div>
                  </div>
                </div>
              )}

              {/* Shares Input */}
              <div className="mb-6">
                <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Shares
                </label>
                <input
                  type="number"
                  id="shares"
                  value={sharesToBuy}
                  onChange={(e) => setSharesToBuy(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  min="1"
                  max={property.shares}
                />
                <p className="text-sm text-gray-500 mt-1">
                  Maximum: {property.shares} shares
                </p>
              </div>

              {/* Cost Calculation */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Shares</span>
                  <span className="font-medium">{sharesToBuy}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Price per Share</span>
                  <span className="font-medium">{formatPrice(property.pricePerShare)}</span>
                </div>
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-900">Total Cost</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatPrice(sharesToBuy * property.pricePerShare)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Buy Button */}
              <button
                onClick={handleBuyShares}
                disabled={isBuying || !walletConnected}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isSigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing...</span>
                  </>
                ) : isBuying ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Buy Shares</span>
                  </>
                )}
              </button>

              {/* Additional Info */}
              <div className="mt-6 text-xs text-gray-500 space-y-1">
                <p>• You'll need to sign a message to confirm your purchase</p>
                <p>• No gas fees required for the signature</p>
                <p>• Shares are stored on the blockchain</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PropertyListing } from '@/types';
import { ArrowLeft, Upload, DollarSign, Users, Image as ImageIcon, Wallet, Shield } from 'lucide-react';

export default function CreateListingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    photo: '',
    totalPrice: '',
    shares: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [isSigning, setIsSigning] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Property name is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.photo.trim()) {
      newErrors.photo = 'Photo URL is required';
    } else if (!isValidUrl(formData.photo)) {
      newErrors.photo = 'Please enter a valid URL';
    }

    if (!formData.totalPrice.trim()) {
      newErrors.totalPrice = 'Total price is required';
    }

    if (!formData.shares.trim()) {
      newErrors.shares = 'Number of shares is required';
    } else if (isNaN(Number(formData.shares)) || Number(formData.shares) <= 0) {
      newErrors.shares = 'Please enter a valid number of shares';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

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

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!walletConnected) {
      alert('Please connect your wallet to create a listing.');
      return;
    }

    setIsSubmitting(true);
    setIsSigning(true);

    try {
      // Create the message to sign
      const message = `I am creating a new property listing:
      
Property: ${formData.name.trim()}
Description: ${formData.description.trim()}
Total Price: $${Number(formData.totalPrice).toLocaleString()}
Shares: ${formData.shares}
Price per Share: $${(Number(formData.totalPrice) / Number(formData.shares)).toLocaleString()}

This signature proves I am the owner of this wallet and authorized to create this listing.`;

      // Request signature from user
      const signature = await signMessage(message);
      
      if (!signature) {
        throw new Error('Signature was cancelled or failed');
      }

      setIsSigning(false);

      const newProperty: PropertyListing = {
        id: Date.now().toString(),
        name: formData.name.trim(),
        description: formData.description.trim(),
        photo: formData.photo.trim(),
        totalPrice: Number(formData.totalPrice),
        shares: Number(formData.shares),
        pricePerShare: Number(formData.totalPrice) / Number(formData.shares),
        createdAt: new Date().toISOString(),
      };

      // Get existing properties from localStorage
      const existingProperties = JSON.parse(
        localStorage.getItem('realEstateProperties') || '[]'
      );

      // Add new property
      const updatedProperties = [...existingProperties, newProperty];

      // Save to localStorage
      localStorage.setItem('realEstateProperties', JSON.stringify(updatedProperties));

      // Reset form
      setFormData({
        name: '',
        description: '',
        photo: '',
        totalPrice: '',
        shares: '',
      });

      // Redirect to home page
      router.push('/');
    } catch (error) {
      console.error('Error creating listing:', error);
      setIsSigning(false);
      if (error instanceof Error && error.message.includes('User rejected')) {
        alert('Signature was cancelled. Please try again.');
      } else {
        alert('Failed to create listing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Create New Property Listing</h1>
          <p className="text-gray-600 mt-2">Tokenize your real estate property and make it available for fractional ownership</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Wallet Connection Section */}
          <div className="mb-8 p-6 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Wallet Authentication Required</h3>
                  <p className="text-sm text-gray-600">
                    Connect your wallet and sign a message to create a listing
                  </p>
                </div>
              </div>
              
              {walletConnected ? (
                <div className="flex items-center space-x-3">
                  <div className="text-sm text-gray-600">
                    Connected: {formatAddress(walletAddress)}
                  </div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={connectWallet}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2"
                >
                  <Wallet className="w-4 h-4" />
                  <span>Connect Wallet</span>
                </button>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Property Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Ocean View Villa"
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Describe your property in detail. Include location, features, amenities, and what makes it special..."
              />
              <div className="flex justify-between mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500">{formData.description.length} characters</p>
              </div>
            </div>

            {/* Photo URL */}
            <div>
              <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
                Photo URL *
              </label>
              <div className="relative">
                <input
                  type="url"
                  id="photo"
                  value={formData.photo}
                  onChange={(e) => handleInputChange('photo', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                    errors.photo ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com/property-photo.jpg"
                />
                <ImageIcon className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
              {errors.photo && <p className="mt-1 text-sm text-red-600">{errors.photo}</p>}
              <p className="mt-1 text-sm text-gray-500">
                Use a high-quality image URL (e.g., from Unsplash, your own hosting, etc.)
              </p>
            </div>

            {/* Price and Shares */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="totalPrice" className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Total Property Value *
                </label>
                <input
                  type="number"
                  id="totalPrice"
                  value={formData.totalPrice}
                  onChange={(e) => handleInputChange('totalPrice', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                    errors.totalPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="2500000"
                  min="0"
                  step="1000"
                />
                {errors.totalPrice && <p className="mt-1 text-sm text-red-600">{errors.totalPrice}</p>}
                {formData.totalPrice && !errors.totalPrice && (
                  <p className="mt-1 text-sm text-gray-600">
                    {formatPrice(Number(formData.totalPrice))}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="shares" className="block text-sm font-medium text-gray-700 mb-2">
                  <Users className="w-4 h-4 inline mr-1" />
                  Number of Shares *
                </label>
                <input
                  type="number"
                  id="shares"
                  value={formData.shares}
                  onChange={(e) => handleInputChange('shares', e.target.value)}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black ${
                    errors.shares ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1000"
                  min="1"
                  step="1"
                />
                {errors.shares && <p className="mt-1 text-sm text-red-600">{errors.shares}</p>}
                {formData.shares && formData.totalPrice && !errors.shares && !errors.totalPrice && (
                  <p className="mt-1 text-sm text-gray-600">
                    Price per share: {formatPrice(Number(formData.totalPrice) / Number(formData.shares))}
                  </p>
                )}
              </div>
            </div>

            {/* Preview */}
            {formData.name && formData.photo && (
              <div className="border-t pt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={formData.photo}
                      alt="Property preview"
                      className="w-32 h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/128x96?text=Invalid+URL';
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{formData.name || 'Property Name'}</h4>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {formData.description || 'Property description will appear here...'}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                        {formData.totalPrice && (
                          <span>Total: {formatPrice(Number(formData.totalPrice))}</span>
                        )}
                        {formData.shares && (
                          <span>Shares: {formData.shares}</span>
                        )}
                        {formData.totalPrice && formData.shares && (
                          <span className="text-blue-600 font-medium">
                            Per share: {formatPrice(Number(formData.totalPrice) / Number(formData.shares))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-6 border-t">
              {!walletConnected && (
                <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Shield className="w-5 h-5 text-yellow-600" />
                    <p className="text-sm text-yellow-800">
                      Please connect your wallet above to create a listing. You'll need to sign a message to authenticate your ownership.
                    </p>
                  </div>
                </div>
              )}
              
              <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !walletConnected}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
              >
                {isSigning ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Signing Message...</span>
                  </>
                ) : isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Create Listing</span>
                  </>
                )}
              </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

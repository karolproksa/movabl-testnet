'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { PropertyListing } from '@/types';
import { MapPin, DollarSign, Users, Calendar } from 'lucide-react';

// Mock data for initial properties
const mockProperties: PropertyListing[] = [
  {
    id: '1',
    name: 'Ocean View Villa',
    description: 'Luxurious beachfront villa with panoramic ocean views, private pool, and modern amenities. Perfect for vacation rentals or permanent residence.',
    photo: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&h=600&fit=crop',
    totalPrice: 2500000,
    shares: 1000,
    pricePerShare: 2500,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: '2',
    name: 'Mountain Retreat Cabin',
    description: 'Cozy log cabin nestled in the mountains with stunning forest views, fireplace, and hiking trails nearby. Ideal for nature lovers.',
    photo: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop',
    totalPrice: 450000,
    shares: 450,
    pricePerShare: 1000,
    createdAt: '2024-01-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Downtown Penthouse',
    description: 'Modern penthouse in the heart of the city with floor-to-ceiling windows, rooftop terrace, and premium finishes throughout.',
    photo: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&h=600&fit=crop',
    totalPrice: 1800000,
    shares: 900,
    pricePerShare: 2000,
    createdAt: '2024-02-01T09:15:00Z',
  },
  {
    id: '4',
    name: 'Historic Brownstone',
    description: 'Beautifully restored historic brownstone with original architectural details, modern kitchen, and private garden.',
    photo: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
    totalPrice: 1200000,
    shares: 600,
    pricePerShare: 2000,
    createdAt: '2024-02-10T16:45:00Z',
  },
  {
    id: '5',
    name: 'Lakefront Estate',
    description: 'Sprawling estate on pristine lakefront property with boat dock, tennis court, and multiple guest houses.',
    photo: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
    totalPrice: 3500000,
    shares: 1750,
    pricePerShare: 2000,
    createdAt: '2024-02-15T11:20:00Z',
  },
  {
    id: '6',
    name: 'Desert Oasis Villa',
    description: 'Modern villa in desert landscape with infinity pool, outdoor kitchen, and stunning sunset views over the mountains.',
    photo: 'https://images.unsplash.com/photo-1600596542815-ffad4c69b9a8?w=800&h=600&fit=crop',
    totalPrice: 950000,
    shares: 950,
    pricePerShare: 1000,
    createdAt: '2024-02-20T13:10:00Z',
  },
];

export default function HomePage() {
  const [properties, setProperties] = useState<PropertyListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load properties from localStorage or use mock data
    const savedProperties = localStorage.getItem('realEstateProperties');
    if (savedProperties) {
      const parsedProperties = JSON.parse(savedProperties);
      setProperties(parsedProperties);
    } else {
      // Initialize with mock data
      setProperties(mockProperties);
      localStorage.setItem('realEstateProperties', JSON.stringify(mockProperties));
    }
    setLoading(false);
  }, []);

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
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Invest in Real Estate from as little as $1
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Tokenized Real Estate Products
            </p>
            <div className="flex justify-center space-x-8 text-lg">
              <div className="flex items-center space-x-2">
                <Users className="w-6 h-6" />
                <span>{properties.length} Properties</span>
              </div>
              <div className="flex items-center space-x-2">
                <DollarSign className="w-6 h-6" />
                <span>Starting from $1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Available Properties</h2>
          <p className="text-gray-600">Browse our curated selection of tokenized real estate investments</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((property) => (
            <div key={property.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
              <div className="relative">
                <img
                  src={property.photo}
                  alt={property.name}
                  className="w-full h-64 object-cover"
                />
                <div className="absolute top-4 right-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                  <span className="text-sm font-semibold text-gray-800">
                    {property.shares} shares
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{property.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{property.description}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Total Value</span>
                    <span className="font-semibold text-gray-900">{formatPrice(property.totalPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Price per Share</span>
                    <span className="font-semibold text-blue-600">{formatPrice(property.pricePerShare)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Listed</span>
                    <span className="text-sm text-gray-600">{formatDate(property.createdAt)}</span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Link
                    href={`/property/${property.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center"
                  >
                    View Details
                  </Link>
                  <Link
                    href={`/property/${property.id}`}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors text-center"
                  >
                    Buy Shares
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {properties.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Properties Available</h3>
            <p className="text-gray-600 mb-6">Be the first to create a property listing!</p>
            <Link
              href="/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
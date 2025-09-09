import { Property } from '@/lib/types';
import { MapPin, Bed, Bath, Square, Car, Heart } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';
import { useState } from 'react';

interface PropertyCardProps {
  property: Property;
  className?: string;
  showFavorite?: boolean;
  onFavoriteToggle?: (propertyId: string) => void;
  isFavorited?: boolean;
  relevanceScore?: number;
}

export function PropertyCard({ 
  property, 
  className, 
  showFavorite = false,
  onFavoriteToggle,
  isFavorited = false,
  relevanceScore
}: PropertyCardProps) {
  const [imageError, setImageError] = useState(false);
  
  // Get primary image or first image
  const primaryImage = property.images?.find(img => img.is_primary) || property.images?.[0];
  
  // Format price based on listing type
  const formatPrice = () => {
    if (property.listing_type?.name === 'rent' && property.monthly_rent) {
      return `$${property.monthly_rent.toLocaleString()}/month`;
    } else if (property.list_price) {
      return `$${property.list_price.toLocaleString()}`;
    }
    return 'Price on request';
  };

  // Format location
  const location = [
    property.city?.name,
    property.province?.code || property.province?.name
  ].filter(Boolean).join(', ');

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(property.id);
  };

  return (
    <Link href={`/property/${property.id}`}>
      <div className={clsx(
        'bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer',
        className
      )}>
        {/* Image Section */}
        <div className="relative h-48 bg-gray-200">
          {primaryImage && !imageError ? (
            <img
              src={primaryImage.image_url}
              alt={primaryImage.caption || property.title}
              className="w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <Square className="w-12 h-12 text-gray-400" />
            </div>
          )}
          
          {/* Property Type Badge */}
          {property.property_type?.name && (
            <div className="absolute top-2 left-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
              {property.property_type.name}
            </div>
          )}
          
          {/* Listing Type Badge */}
          {property.listing_type?.name && (
            <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium capitalize">
              {property.listing_type.name}
            </div>
          )}
          
          {/* Relevance Score Badge */}
          {relevanceScore && (
            <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
              {Math.round(relevanceScore * 100)}% match
            </div>
          )}
          
          {/* Favorite Button */}
          {showFavorite && (
            <button
              onClick={handleFavoriteClick}
              className="absolute bottom-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
            >
              <Heart 
                className={clsx(
                  'w-4 h-4',
                  isFavorited ? 'fill-red-500 text-red-500' : 'text-gray-400'
                )}
              />
            </button>
          )}
        </div>

        {/* Content Section */}
        <div className="p-4">
          {/* Price */}
          <div className="text-xl font-bold text-gray-900 mb-1">
            {formatPrice()}
          </div>
          
          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-800 mb-2 line-clamp-1">
            {property.title}
          </h3>
          
          {/* Location */}
          <div className="flex items-center text-gray-600 mb-3">
            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="text-sm truncate">{location}</span>
          </div>
          
          {/* Property Details */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-4">
              {property.bedrooms !== undefined && (
                <div className="flex items-center">
                  <Bed className="w-4 h-4 mr-1" />
                  <span>{property.bedrooms}</span>
                </div>
              )}
              
              {property.bathrooms !== undefined && (
                <div className="flex items-center">
                  <Bath className="w-4 h-4 mr-1" />
                  <span>{property.bathrooms}</span>
                </div>
              )}
              
              {property.total_area_sqft && (
                <div className="flex items-center">
                  <Square className="w-4 h-4 mr-1" />
                  <span>{property.total_area_sqft.toLocaleString()} sq ft</span>
                </div>
              )}
              
              {property.parking_spaces > 0 && (
                <div className="flex items-center">
                  <Car className="w-4 h-4 mr-1" />
                  <span>{property.parking_spaces}</span>
                </div>
              )}
            </div>
          </div>
          
          {/* Status */}
          {property.status?.name && (
            <div className="mt-3">
              <span className={clsx(
                'inline-block px-2 py-1 rounded-full text-xs font-medium',
                property.status.is_available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              )}>
                {property.status.name}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

interface PropertyGridProps {
  properties: Property[];
  loading?: boolean;
  className?: string;
  showFavorites?: boolean;
  onFavoriteToggle?: (propertyId: string) => void;
  favoritedProperties?: Set<string>;
  relevanceScores?: number[];
}

export function PropertyGrid({ 
  properties, 
  loading = false, 
  className,
  showFavorites = false,
  onFavoriteToggle,
  favoritedProperties = new Set(),
  relevanceScores
}: PropertyGridProps) {
  if (loading) {
    return (
      <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
        {Array.from({ length: 6 }).map((_, index) => (
          <PropertyCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <Square className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No properties found</h3>
        <p className="text-gray-500">Try adjusting your search filters</p>
      </div>
    );
  }

  return (
    <div className={clsx('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6', className)}>
      {properties.map((property, index) => (
        <PropertyCard
          key={property.id}
          property={property}
          showFavorite={showFavorites}
          onFavoriteToggle={onFavoriteToggle}
          isFavorited={favoritedProperties.has(property.id)}
          relevanceScore={relevanceScores?.[index]}
        />
      ))}
    </div>
  );
}

// Skeleton component for loading state
function PropertyCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 bg-gray-200 animate-pulse" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4" />
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-3 w-1/2" />
        <div className="flex justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
        </div>
      </div>
    </div>
  );
}
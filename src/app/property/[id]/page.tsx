import { notFound } from 'next/navigation';
import { getPropertyById } from '@/lib/database';
import { PropertyGallery } from '@/components/property/property-gallery';
import { MapPin, Bed, Bath, Square, Car, Calendar, DollarSign, User, Phone, Mail, Building, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { clsx } from 'clsx';
import Link from 'next/link';

interface PropertyPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  const { id } = await params;
  const property = await getPropertyById(id);
  
  if (!property) {
    notFound();
  }

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
    property.street_address,
    property.unit_number,
    property.city?.name,
    property.province?.code || property.province?.name
  ].filter(Boolean).join(', ');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link href="/search" className="hover:text-blue-600">Search</Link>
            <span>/</span>
            <span className="text-gray-900">Property Details</span>
          </nav>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{location}</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">{formatPrice()}</div>
            </div>
            
            {/* Status Badge */}
            {property.status && (
              <div className={clsx(
                'px-4 py-2 rounded-full text-sm font-medium',
                property.status.is_available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              )}>
                {property.status.name}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            {property.images && property.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <PropertyGallery images={property.images} propertyTitle={property.title} />
              </div>
            )}

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Property Details</h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                {/* Basic Info */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Property Type</span>
                    <span className="font-medium">{property.property_type?.name || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Listing Type</span>
                    <span className="font-medium capitalize">{property.listing_type?.name || 'N/A'}</span>
                  </div>
                  
                  {property.bedrooms !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Bed className="w-4 h-4 mr-2" />
                        Bedrooms
                      </span>
                      <span className="font-medium">{property.bedrooms}</span>
                    </div>
                  )}
                  
                  {property.bathrooms !== undefined && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Bath className="w-4 h-4 mr-2" />
                        Bathrooms
                      </span>
                      <span className="font-medium">{property.bathrooms}</span>
                    </div>
                  )}
                  
                  {property.total_area_sqft && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Square className="w-4 h-4 mr-2" />
                        Total Area
                      </span>
                      <span className="font-medium">{property.total_area_sqft.toLocaleString()} sq ft</span>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="space-y-4">
                  {property.year_built && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        Year Built
                      </span>
                      <span className="font-medium">{property.year_built}</span>
                    </div>
                  )}
                  
                  {property.parking_spaces > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <Car className="w-4 h-4 mr-2" />
                        Parking
                      </span>
                      <span className="font-medium">
                        {property.parking_spaces} space{property.parking_spaces > 1 ? 's' : ''}
                        {property.parking_type && ` (${property.parking_type})`}
                      </span>
                    </div>
                  )}
                  
                  {property.lot_size_sqft && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Lot Size</span>
                      <span className="font-medium">{property.lot_size_sqft.toLocaleString()} sq ft</span>
                    </div>
                  )}
                  
                  {property.floors && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Floors</span>
                      <span className="font-medium">{property.floors}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Pet Friendly</span>
                    <span className="font-medium">{property.pet_friendly ? 'Yes' : 'No'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-gray-600">Furnished</span>
                    <span className="font-medium">{property.furnished ? 'Yes' : 'No'}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 leading-relaxed">{property.description}</p>
                </div>
              )}

              {/* Features */}
              {property.features && property.features.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Features & Amenities</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {property.features.map((feature) => (
                      <div key={feature.id} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Pricing Details */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Pricing Information</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {property.list_price && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        List Price
                      </span>
                      <span className="font-medium text-lg">${property.list_price.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {property.monthly_rent && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600 flex items-center">
                        <DollarSign className="w-4 h-4 mr-2" />
                        Monthly Rent
                      </span>
                      <span className="font-medium text-lg">${property.monthly_rent.toLocaleString()}</span>
                    </div>
                  )}
                  
                  {property.price_per_sqft && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Price per Sq Ft</span>
                      <span className="font-medium">${property.price_per_sqft.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {property.maintenance_fee && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Maintenance Fee</span>
                      <span className="font-medium">${property.maintenance_fee.toLocaleString()}/month</span>
                    </div>
                  )}
                  
                  {property.property_taxes_annual && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Property Taxes</span>
                      <span className="font-medium">${property.property_taxes_annual.toLocaleString()}/year</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Price/Status History */}
            {property.history && property.history.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">Price & Status History</h2>
                
                <div className="space-y-4">
                  {property.history.map((historyItem) => (
                    <div key={historyItem.id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-lg">
                      <div className="flex-shrink-0 mt-1">
                        {historyItem.event_type === 'price_change' && historyItem.price_change && (
                          <div className={`p-2 rounded-full ${
                            historyItem.price_change > 0 
                              ? 'bg-red-100 text-red-600' 
                              : 'bg-green-100 text-green-600'
                          }`}>
                            {historyItem.price_change > 0 ? (
                              <TrendingUp className="w-4 h-4" />
                            ) : (
                              <TrendingDown className="w-4 h-4" />
                            )}
                          </div>
                        )}
                        {historyItem.event_type === 'status_change' && (
                          <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                            <Activity className="w-4 h-4" />
                          </div>
                        )}
                        {historyItem.event_type === 'listing' && (
                          <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                            <Calendar className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-medium text-gray-900 capitalize">
                            {historyItem.event_type.replace('_', ' ')}
                          </h3>
                          <span className="text-sm text-gray-500">
                            {historyItem.event_date.toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          {historyItem.event_type === 'price_change' && (
                            <div className="space-y-1">
                              {historyItem.old_value && (
                                <div>Previous: ${parseFloat(historyItem.old_value).toLocaleString()}</div>
                              )}
                              {historyItem.new_value && (
                                <div>New: ${parseFloat(historyItem.new_value).toLocaleString()}</div>
                              )}
                              {historyItem.price_change && (
                                <div className={`font-medium ${
                                  historyItem.price_change > 0 ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {historyItem.price_change > 0 ? '+' : ''}
                                  ${Math.abs(historyItem.price_change).toLocaleString()} 
                                  ({((historyItem.price_change / parseFloat(historyItem.old_value || '1')) * 100).toFixed(1)}%)
                                </div>
                              )}
                            </div>
                          )}
                          
                          {historyItem.event_type === 'status_change' && (
                            <div className="space-y-1">
                              {historyItem.old_value && (
                                <div>Previous: {historyItem.old_value}</div>
                              )}
                              {historyItem.new_value && (
                                <div>New: {historyItem.new_value}</div>
                              )}
                            </div>
                          )}
                          
                          {historyItem.event_type === 'listing' && (
                            <div>Property was listed</div>
                          )}
                          
                          {historyItem.notes && (
                            <div className="mt-2 text-gray-500 italic">
                              {historyItem.notes}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {property.history.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>No price or status history available</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Agent Information */}
            {property.agent && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Agent</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <User className="w-5 h-5 text-gray-400 mr-3" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {property.agent.first_name} {property.agent.last_name}
                      </div>
                      {property.agent.agency_name && (
                        <div className="text-sm text-gray-600">{property.agent.agency_name}</div>
                      )}
                    </div>
                  </div>
                  
                  {property.agent.phone && (
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <a 
                        href={`tel:${property.agent.phone}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {property.agent.phone}
                      </a>
                    </div>
                  )}
                  
                  {property.agent.email && (
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <a 
                        href={`mailto:${property.agent.email}`}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        {property.agent.email}
                      </a>
                    </div>
                  )}
                  
                  {property.agent.years_experience && (
                    <div className="flex items-center">
                      <Building className="w-5 h-5 text-gray-400 mr-3" />
                      <span className="text-gray-600">
                        {property.agent.years_experience} years experience
                      </span>
                    </div>
                  )}
                  
                  {property.agent.rating && (
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2">★</span>
                      <span className="text-gray-600">
                        {property.agent.rating}/5 ({property.agent.total_reviews} reviews)
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 space-y-2">
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Contact Agent
                  </button>
                  <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    Schedule Viewing
                  </button>
                </div>
              </div>
            )}

            {/* Property Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Summary</h3>
              
              <div className="space-y-3">
                {property.mls_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">MLS #</span>
                    <span className="font-medium">{property.mls_number}</span>
                  </div>
                )}
                
                {property.listed_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Listed</span>
                    <span className="font-medium">
                      {new Date(property.listed_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                {property.available_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available</span>
                    <span className="font-medium">
                      {new Date(property.available_date).toLocaleDateString()}
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated</span>
                  <span className="font-medium">
                    {new Date(property.last_updated).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Location Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Location</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">City</span>
                  <span className="font-medium">{property.city?.name}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Province</span>
                  <span className="font-medium">{property.province?.name}</span>
                </div>
                
                {property.neighborhood?.name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Neighborhood</span>
                    <span className="font-medium">{property.neighborhood.name}</span>
                  </div>
                )}
                
                {property.postal_code && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Postal Code</span>
                    <span className="font-medium">{property.postal_code}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
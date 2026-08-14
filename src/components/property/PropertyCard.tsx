import { Link } from 'react-router-dom';
import { BedDouble, Bath, Square, Heart, MapPin } from 'lucide-react';
import type { Database } from '../../types/database.types';


type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyCardProps {
  property: Property;
  imageUrl?: string;
}

const PropertyCard = ({ property, imageUrl }: PropertyCardProps) => {
  const isForSale = property.listing_type === 'sale';
  
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col fade-up">
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={property.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image Available
          </div>
        )}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white shadow-sm ${isForSale ? 'bg-primary' : 'bg-gold'}`}>
            For {isForSale ? 'Sale' : 'Rent'}
          </span>
          {property.featured && (
            <span className="bg-white text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm">
              Featured
            </span>
          )}
        </div>
        <button className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-full text-gray-400 hover:text-red-500 hover:bg-white transition-colors shadow-sm">
          <Heart className="h-5 w-5" />
        </button>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-xl font-heading font-bold text-primary line-clamp-1">{property.title}</h3>
        </div>
        <p className="text-muted text-sm flex items-center gap-1.5 mb-4">
          <MapPin className="h-4 w-4 text-gold shrink-0" />
          <span className="line-clamp-1">{property.address}, {property.location}</span>
        </p>

        <div className="text-2xl font-bold text-primary mb-6">
          ${property.price.toLocaleString()}
          {!isForSale && <span className="text-base text-muted font-normal">/month</span>}
        </div>

        <div className="grid grid-cols-3 gap-4 border-y border-gray-100 py-4 mb-6">
          <div className="flex flex-col items-center justify-center text-center">
            <BedDouble className="h-5 w-5 text-gray-400 mb-1" />
            <span className="text-sm font-medium text-primary">{property.bedrooms}</span>
            <span className="text-xs text-muted">Beds</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-gray-100">
            <Bath className="h-5 w-5 text-gray-400 mb-1" />
            <span className="text-sm font-medium text-primary">{property.bathrooms}</span>
            <span className="text-xs text-muted">Baths</span>
          </div>
          <div className="flex flex-col items-center justify-center text-center border-l border-gray-100">
            <Square className="h-5 w-5 text-gray-400 mb-1" />
            <span className="text-sm font-medium text-primary">{property.area}</span>
            <span className="text-xs text-muted">Sq Ft</span>
          </div>
        </div>

        <Link 
          to={`/properties/${property.id}`}
          className="mt-auto w-full bg-background text-primary border border-gray-200 py-3 rounded-lg font-medium text-center hover:bg-primary hover:text-white hover:border-primary transition-colors block"
        >
          View Property
        </Link>
      </div>
    </div>
  );
};

export default PropertyCard;

import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import gsap from 'gsap';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import { BedDouble, Bath, Square, MapPin, Check, Phone, Mail, Calendar } from 'lucide-react';
import ViewingModal from '../../components/booking/ViewingModal';
import './PropertyDetails.css';

type Property = Database['public']['Tables']['properties']['Row'];
type PropertyImage = Database['public']['Tables']['property_images']['Row'];
type Agent = Database['public']['Tables']['agents']['Row'];

const PropertyDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [property, setProperty] = useState<Property | null>(null);
  const [images, setImages] = useState<PropertyImage[]>([]);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      setLoading(true);
      
      if (!id) {
        setLoading(false);
        return;
      }

      // Fetch Property
      const { data: propData } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
        
      if (propData) setProperty(propData);

      // Fetch Images
      const { data: imgData } = await supabase
        .from('property_images')
        .select('*')
        .eq('property_id', id)
        .order('is_primary', { ascending: false });
        
      if (imgData && imgData.length > 0) {
        setImages(imgData);
        setSelectedImage(imgData[0].image_url);
      }

      // Fetch Agent
      if (propData?.agent_id) {
        const { data: agentData } = await supabase
          .from('agents')
          .select('*')
          .eq('id', propData.agent_id)
          .single();
        if (agentData) setAgent(agentData);
      }

      // Fetch Amenities
      const { data: amenityData } = await supabase
        .from('property_amenities')
        .select('amenities(name)')
        .eq('property_id', id);
        
      if (amenityData) {
        setAmenities(amenityData.map((a: any) => a.amenities.name));
      }

      setLoading(false);
    };

    fetchPropertyDetails();
  }, [id]);

  useEffect(() => {
    if (!loading && property) {
      const ctx = gsap.context(() => {
        gsap.from('.fade-up', {
          y: 40,
          opacity: 0,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out'
        });
      }, contentRef);
      return () => ctx.revert();
    }
  }, [loading, property]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner-large"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="not-found-screen">
        <h2 className="not-found-title">Property Not Found</h2>
        <Link to="/properties" className="not-found-link">Back to Properties</Link>
      </div>
    );
  }

  return (
    <div className="property-details-page" ref={contentRef}>
      <div className="property-details-container">
        
        {/* Header */}
        <div className="pd-header fade-up">
          <div>
            <div className="pd-tags">
              <span className={`pd-tag-status ${property.listing_type === 'sale' ? 'pd-tag-status-sale' : 'pd-tag-status-rent'}`}>
                For {property.listing_type === 'sale' ? 'Sale' : 'Rent'}
              </span>
              <span className="pd-tag-type">{property.property_type}</span>
            </div>
            <h1 className="pd-title">{property.title}</h1>
            <p className="pd-address">
              <MapPin className="pd-address-icon" />
              {property.address}, {property.location}
            </p>
          </div>
          <div className="pd-price-container">
            <div className="pd-price">
              ${property.price.toLocaleString()}
              {property.listing_type === 'rent' && <span className="pd-price-period">/mo</span>}
            </div>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="pd-gallery fade-up">
          <div className="pd-main-image-container">
            {selectedImage ? (
              <img src={selectedImage} alt={property.title} className="pd-main-image" />
            ) : (
              <div className="pd-no-image">No Image Available</div>
            )}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbnails">
              {images.map((img) => (
                <button 
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`pd-thumbnail-btn ${selectedImage === img.image_url ? 'pd-thumbnail-active' : 'pd-thumbnail-inactive'}`}
                >
                  <img src={img.image_url} alt="Thumbnail" className="pd-thumbnail-img" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd-content-grid">
          
          {/* Main Details */}
          <div className="pd-main-details">
            
            {/* Key Features */}
            <div className="pd-key-features fade-up">
              <div className="pd-feature-item">
                <div className="pd-feature-icon-wrapper"><BedDouble className="pd-feature-icon" /></div>
                <div>
                  <div className="pd-feature-label">Bedrooms</div>
                  <div className="pd-feature-value">{property.bedrooms}</div>
                </div>
              </div>
              <div className="pd-feature-item">
                <div className="pd-feature-icon-wrapper"><Bath className="pd-feature-icon" /></div>
                <div>
                  <div className="pd-feature-label">Bathrooms</div>
                  <div className="pd-feature-value">{property.bathrooms}</div>
                </div>
              </div>
              <div className="pd-feature-item">
                <div className="pd-feature-icon-wrapper"><Square className="pd-feature-icon" /></div>
                <div>
                  <div className="pd-feature-label">Area</div>
                  <div className="pd-feature-value">{property.area} sq ft</div>
                </div>
              </div>
              <div className="pd-feature-item">
                <div className="pd-feature-icon-wrapper"><Calendar className="pd-feature-icon" /></div>
                <div>
                  <div className="pd-feature-label">Year Built</div>
                  <div className="pd-feature-value">{property.year_built || 'N/A'}</div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="fade-up">
              <h2 className="pd-section-title">Property Description</h2>
              <div className="pd-description-content">
                <p>{property.description || 'No description available for this property.'}</p>
              </div>
            </div>

            {/* Amenities */}
            {amenities.length > 0 && (
              <div className="fade-up">
                <h2 className="pd-amenities-title">Amenities & Features</h2>
                <div className="pd-amenities-grid">
                  {amenities.map((amenity, idx) => (
                    <div key={idx} className="pd-amenity-item">
                      <div className="pd-amenity-icon-wrapper">
                        <Check className="pd-amenity-icon" />
                      </div>
                      <span className="pd-amenity-label">{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="pd-sidebar fade-up">
            
            {/* Booking Card */}
            <div className="pd-booking-card">
              <h3 className="pd-booking-title">Interested in this property?</h3>
              <p className="pd-booking-desc">Schedule a viewing or contact our agent for more details.</p>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="pd-booking-btn-primary"
              >
                Schedule a Viewing
              </button>
              
              <button className="pd-booking-btn-secondary">
                Contact Agent
              </button>
            </div>

            {/* Agent Info */}
            {agent && (
              <div className="pd-agent-card">
                <h3 className="pd-agent-header">Listed By</h3>
                <div className="pd-agent-profile">
                  <div className="pd-agent-photo-wrapper">
                    {agent.photo_url ? (
                      <img src={agent.photo_url} alt={agent.name} className="pd-agent-photo" />
                    ) : (
                      <div className="pd-agent-no-photo">No Photo</div>
                    )}
                  </div>
                  <div>
                    <div className="pd-agent-name">{agent.name}</div>
                    <div className="pd-agent-position">{agent.position}</div>
                  </div>
                </div>
                <div className="pd-agent-contact">
                  <div className="pd-agent-contact-item">
                    <Phone className="pd-agent-contact-icon" />
                    {agent.phone || 'N/A'}
                  </div>
                  <div className="pd-agent-contact-item">
                    <Mail className="pd-agent-contact-icon" />
                    <a href={`mailto:${agent.email}`} className="pd-agent-contact-link">{agent.email}</a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ViewingModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        property={property} 
      />
    </div>
  );
};

export default PropertyDetails;

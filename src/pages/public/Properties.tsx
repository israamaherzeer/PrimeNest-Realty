import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { Search, SlidersHorizontal } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/database.types';
import PropertyCard from '../../components/property/PropertyCard';
import './Properties.css';

type Property = Database['public']['Tables']['properties']['Row'];

interface PropertyWithImage extends Property {
  primary_image?: string;
}

const Properties = () => {
  const [properties, setProperties] = useState<PropertyWithImage[]>([]);
  const [loading, setLoading] = useState(true);

  const gridRef = useRef<HTMLDivElement>(null);

  // =========================
  // Filter states
  // =========================
  const [listingType, setListingType] = useState<string>('all');
  const [propertyType, setPropertyType] = useState<string>('all');

  const [locationStr, setLocationStr] = useState<string>('');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  const [bedrooms, setBedrooms] = useState<string>('any');
  const [sortBy, setSortBy] = useState<string>('newest');

  // =========================
  // Fetch properties
  // =========================
  const fetchProperties = async () => {
    setLoading(true);

    try {
      let query = supabase
        .from('properties')
        .select(`
          *,
          property_images (
            image_url,
            is_primary
          )
        `);

      // =========================
      // Listing type
      // =========================
      if (listingType !== 'all') {
        query = query.eq('listing_type', listingType);
      }

      // =========================
      // Property type
      // =========================
      if (propertyType !== 'all') {
        query = query.eq('property_type', propertyType);
      }

      // =========================
      // Minimum price
      // =========================
      if (minPrice.trim() !== '') {
        const min = Number(minPrice);

        if (!Number.isNaN(min)) {
          query = query.gte('price', min);
        }
      }

      // =========================
      // Maximum price
      // =========================
      if (maxPrice.trim() !== '') {
        const max = Number(maxPrice);

        if (!Number.isNaN(max)) {
          query = query.lte('price', max);
        }
      }

      // =========================
      // Bedrooms
      // =========================
      if (bedrooms !== 'any') {
        const bedroomCount = Number(bedrooms);

        if (!Number.isNaN(bedroomCount)) {
          query = query.gte('bedrooms', bedroomCount);
        }
      }

      // =========================
      // Location / Address search
      // =========================
      const searchText = locationStr.trim();

      if (searchText !== '') {
        const safeSearchText = searchText
          .replace(/%/g, '\\%')
          .replace(/_/g, '\\_');

        query = query.or(
          `location.ilike.%${safeSearchText}%,address.ilike.%${safeSearchText}%`
        );
      }

      // =========================
      // Sorting
      // =========================
      if (sortBy === 'newest') {
        query = query.order('created_at', {
          ascending: false,
        });
      }

      if (sortBy === 'price_low') {
        query = query.order('price', {
          ascending: true,
        });
      }

      if (sortBy === 'price_high') {
        query = query.order('price', {
          ascending: false,
        });
      }

      // =========================
      // Execute query
      // =========================
      const { data, error } = await query;

      if (error) {
        console.error('Error fetching properties:', error);
        setProperties([]);
        return;
      }

      // =========================
      // Format data
      // =========================
      const formattedData: PropertyWithImage[] = (data || []).map(
        (item: any) => {
          const images = item.property_images || [];

          const primaryImage =
            images.find((img: any) => img.is_primary === true)?.image_url ||
            images[0]?.image_url ||
            undefined;

          return {
            ...item,
            primary_image: primaryImage,
          };
        }
      );

      setProperties(formattedData);
    } catch (error) {
      console.error('Unexpected error:', error);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // Initial load + automatic
  // filters except text/price
  // =========================
  useEffect(() => {
    fetchProperties();
  }, [listingType, propertyType, bedrooms, sortBy]);

  // =========================
  // Search button
  // =========================
  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    fetchProperties();
  };

  // =========================
  // GSAP animation
  // =========================
  useEffect(() => {
    if (!loading && properties.length > 0 && gridRef.current) {
      const ctx = gsap.context(() => {
        gsap.fromTo(
          '.fade-up',
          {
            y: 30,
            opacity: 0,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            stagger: 0.1,
            ease: 'power2.out',
            clearProps: 'all',
          }
        );
      }, gridRef);

      return () => ctx.revert();
    }
  }, [loading, properties]);

  // =========================
  // Clear filters
  // =========================
  const clearFilters = () => {
    setListingType('all');
    setPropertyType('all');
    setLocationStr('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('any');
    setSortBy('newest');

    // Fetch unfiltered properties immediately
    setTimeout(() => {
      fetchProperties();
    }, 0);
  };

  return (
    <div className="properties-page">
      <div className="properties-container">

        {/* =========================
            Header
        ========================== */}
        <div className="properties-header">
          <h1 className="properties-title">
            Find Your Property
          </h1>

          {/* =========================
              Search / Filters
          ========================== */}
          <div className="properties-filters-container">

            <form
              onSubmit={handleSearch}
              className="properties-search-form"
            >

              {/* Location */}
              <div>
                <label className="filter-label">
                  Search Location
                </label>

                <div className="filter-input-wrapper">
                  <input
                    type="text"
                    value={locationStr}
                    onChange={(e) => setLocationStr(e.target.value)}
                    placeholder="City, ZIP, Neighborhood"
                    className="filter-input"
                  />

                  <Search className="filter-icon" />
                </div>
              </div>

              {/* Listing type */}
              <div>
                <label className="filter-label">
                  Purpose
                </label>

                <select
                  value={listingType}
                  onChange={(e) => setListingType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">Any Status</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                </select>
              </div>

              {/* Property type */}
              <div>
                <label className="filter-label">
                  Property Type
                </label>

                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Types</option>
                  <option value="house">House</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="condo">Condo</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              {/* Search button */}
              <div className="search-btn-wrapper">
                <button
                  type="submit"
                  disabled={loading}
                  className="search-btn"
                >
                  <Search className="search-btn-icon" />

                  {loading ? 'Searching...' : 'Search'}
                </button>
              </div>
            </form>

            {/* =========================
                Advanced filters
            ========================== */}
            <div className="advanced-filters">

              {/* Price */}
              <div>
                <label className="adv-filter-label">
                  Price Range
                </label>

                <div className="price-range-wrapper">
                  <input
                    type="number"
                    min="0"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    className="price-input"
                  />

                  <span className="price-separator">-</span>

                  <input
                    type="number"
                    min="0"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    className="price-input"
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div>
                <label className="adv-filter-label">
                  Bedrooms
                </label>

                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="adv-filter-select"
                >
                  <option value="any">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>

              {/* Sort */}
              <div className="sort-wrapper">
                <label className="adv-filter-label">
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="adv-filter-select"
                >
                  <option value="newest">Newest First</option>
                  <option value="price_low">
                    Price: Low to High
                  </option>
                  <option value="price_high">
                    Price: High to Low
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* =========================
            Results Header
        ========================== */}
        <div className="results-header">
          <p className="results-count-text">
            Showing{' '}
            <span className="results-count-value">
              {properties.length}
            </span>{' '}
            properties
          </p>

          {(locationStr ||
            minPrice ||
            maxPrice ||
            listingType !== 'all' ||
            propertyType !== 'all' ||
            bedrooms !== 'any') && (
              <button
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear all filters
              </button>
            )}
        </div>

        {/* =========================
            Loading
        ========================== */}
        {loading ? (
          <div className="loading-wrapper">
            <div className="loading-spinner" />
          </div>
        ) : properties.length > 0 ? (

          /* =========================
             Property Grid
          ========================== */
          <div
            ref={gridRef}
            className="properties-grid"
          >
            {properties.map((property) => (
              <div
                key={property.id}
                className="fade-up"
              >
                <PropertyCard
                  property={property}
                  imageUrl={property.primary_image}
                />
              </div>
            ))}
          </div>

        ) : (

          /* =========================
             No Results
          ========================== */
          <div className="no-results-container">

            <SlidersHorizontal className="no-results-icon" />

            <h3 className="no-results-title">
              No properties found
            </h3>

            <p className="no-results-text">
              Try adjusting your filters to find what you&apos;re looking for.
            </p>

            <button
              onClick={clearFilters}
              className="no-results-btn"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Properties;
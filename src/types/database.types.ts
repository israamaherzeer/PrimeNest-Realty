export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          email: string
          phone: string | null
          role: 'admin' | 'agent' | 'user'
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          full_name: string
          email: string
          phone?: string | null
          role?: 'admin' | 'agent' | 'user'
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          full_name?: string
          email?: string
          phone?: string | null
          role?: 'admin' | 'agent' | 'user'
          avatar_url?: string | null
          created_at?: string
        }
      }
      agents: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          photo_url: string | null
          position: string | null
          bio: string | null
          years_experience: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          bio?: string | null
          years_experience?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          photo_url?: string | null
          position?: string | null
          bio?: string | null
          years_experience?: number
          created_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          title: string
          description: string | null
          property_type: 'house' | 'apartment' | 'villa' | 'condo' | 'townhouse' | null
          listing_type: 'sale' | 'rent' | null
          price: number
          location: string
          address: string
          bedrooms: number
          bathrooms: number
          area: number
          year_built: number | null
          featured: boolean
          latitude: number | null
          longitude: number | null
          agent_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          property_type?: 'house' | 'apartment' | 'villa' | 'condo' | 'townhouse' | null
          listing_type?: 'sale' | 'rent' | null
          price: number
          location: string
          address: string
          bedrooms?: number
          bathrooms?: number
          area?: number
          year_built?: number | null
          featured?: boolean
          latitude?: number | null
          longitude?: number | null
          agent_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          property_type?: 'house' | 'apartment' | 'villa' | 'condo' | 'townhouse' | null
          listing_type?: 'sale' | 'rent' | null
          price?: number
          location?: string
          address?: string
          bedrooms?: number
          bathrooms?: number
          area?: number
          year_built?: number | null
          featured?: boolean
          latitude?: number | null
          longitude?: number | null
          agent_id?: string | null
          created_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          image_url: string
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          image_url: string
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          image_url?: string
          is_primary?: boolean
          created_at?: string
        }
      }
      amenities: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
      }
      property_amenities: {
        Row: {
          property_id: string
          amenity_id: string
        }
        Insert: {
          property_id: string
          amenity_id: string
        }
        Update: {
          property_id?: string
          amenity_id?: string
        }
      }
      viewing_slots: {
        Row: {
          id: string
          property_id: string
          viewing_date: string
          start_time: string
          end_time: string
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          viewing_date: string
          start_time: string
          end_time: string
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          viewing_date?: string
          start_time?: string
          end_time?: string
          is_available?: boolean
          created_at?: string
        }
      }
      viewing_requests: {
        Row: {
          id: string
          property_id: string
          slot_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          visitors: number
          message: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          slot_id: string
          customer_name: string
          customer_email: string
          customer_phone: string
          visitors?: number
          message?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          slot_id?: string
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          visitors?: number
          message?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

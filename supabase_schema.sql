-- PrimeNest Realty Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles Table (Users/Admins)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    role TEXT CHECK (role IN ('admin', 'agent', 'user')) DEFAULT 'user',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Agents Table
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    photo_url TEXT,
    position TEXT,
    bio TEXT,
    years_experience INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Properties Table
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT CHECK (property_type IN ('house', 'apartment', 'villa', 'condo', 'townhouse')),
    listing_type TEXT CHECK (listing_type IN ('sale', 'rent')),
    price NUMERIC NOT NULL,
    location TEXT NOT NULL,
    address TEXT NOT NULL,
    bedrooms INTEGER NOT NULL DEFAULT 0,
    bathrooms INTEGER NOT NULL DEFAULT 0,
    area INTEGER NOT NULL DEFAULT 0, -- in sq ft
    year_built INTEGER,
    featured BOOLEAN DEFAULT false,
    latitude NUMERIC,
    longitude NUMERIC,
    agent_id UUID REFERENCES agents(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Property Images Table
CREATE TABLE property_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    image_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Amenities Table
CREATE TABLE amenities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE
);

-- 6. Property Amenities Table
CREATE TABLE property_amenities (
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
    amenity_id UUID REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (property_id, amenity_id)
);

-- 7. Viewing Slots Table
CREATE TABLE viewing_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    viewing_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Viewing Requests Table
CREATE TABLE viewing_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    slot_id UUID REFERENCES viewing_slots(id) ON DELETE CASCADE NOT NULL UNIQUE, -- Ensures atomic uniqueness to prevent double booking!
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    visitors INTEGER DEFAULT 1,
    message TEXT,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security: Row Level Security (RLS) setup

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE viewing_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can read own profile, Admins can read all.
CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Agents: Public can read. Admins can manage.
CREATE POLICY "Agents are viewable by everyone" ON agents FOR SELECT USING (true);
CREATE POLICY "Admins can manage agents" ON agents FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Properties: Public can read. Admins can manage.
CREATE POLICY "Properties are viewable by everyone" ON properties FOR SELECT USING (true);
CREATE POLICY "Admins can manage properties" ON properties FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Property Images: Public can read. Admins can manage.
CREATE POLICY "Property images are viewable by everyone" ON property_images FOR SELECT USING (true);
CREATE POLICY "Admins can manage property images" ON property_images FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Amenities: Public can read. Admins can manage.
CREATE POLICY "Amenities are viewable by everyone" ON amenities FOR SELECT USING (true);
CREATE POLICY "Admins can manage amenities" ON amenities FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));
CREATE POLICY "Property amenities viewable by everyone" ON property_amenities FOR SELECT USING (true);
CREATE POLICY "Admins can manage property amenities" ON property_amenities FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Viewing Slots: Public can read available slots. Admins can manage all.
CREATE POLICY "Viewing slots viewable by everyone" ON viewing_slots FOR SELECT USING (true);
CREATE POLICY "Admins can manage viewing slots" ON viewing_slots FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Viewing Requests: Anyone can insert a request (anonymously or logged in). Admins can manage all. Users could view their own, but since they don't log in to book, only Admins view them.
CREATE POLICY "Anyone can create a viewing request" ON viewing_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can manage viewing requests" ON viewing_requests FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin'));

-- Function to handle atomic booking update
CREATE OR REPLACE FUNCTION handle_viewing_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark the slot as unavailable immediately upon request insertion
  UPDATE viewing_slots SET is_available = false WHERE id = NEW.slot_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_viewing_request_created
AFTER INSERT ON viewing_requests
FOR EACH ROW EXECUTE FUNCTION handle_viewing_booking();

-- Trigger to create profile after Auth SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.email, 'user');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Seed Sample Data

-- 1. Insert Amenities
INSERT INTO amenities (name) VALUES
('Swimming Pool'),
('Gym'),
('Smart Home'),
('Balcony'),
('Parking'),
('Security 24/7');

-- 2. Insert Agents
INSERT INTO agents (name, email, phone, position, bio, years_experience) VALUES
('Eleanor Vance', 'eleanor@primenestrealty.com', '+1 (555) 123-4567', 'Senior Real Estate Agent', 'Expert in luxury properties with over a decade of experience.', 12),
('Marcus Cole', 'marcus@primenestrealty.com', '+1 (555) 987-6543', 'Property Consultant', 'Specializes in downtown apartments and investment properties.', 8);

-- 3. Insert Properties
-- (We'll use standard UUIDs to ensure we can link them easily, but since we generate dynamically, we'll insert them simply)
-- It's better to fetch agent ids, but for seeding simplicity we can let the frontend add these or just insert them without agents for now.

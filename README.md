🏡 PrimeNest Realty

A modern, elegant real-estate platform for discovering properties, exploring detailed listings, and scheduling property viewings — supported by a secure Supabase backend and a dedicated admin management dashboard.

📖 Project Overview

PrimeNest Realty is a full-featured real-estate web application designed to provide a polished experience for property discovery and viewing management.

The public-facing website allows visitors to explore available properties, view detailed property information, learn more about the company, and submit viewing requests for available time slots.

The platform also includes a dedicated Admin Portal where authorized administrators can manage properties, create and manage viewing slots, review customer viewing requests, and control booking availability.

The project combines a premium real-estate visual identity with a practical booking workflow, responsive layouts, GSAP animations, and Supabase-powered data management.

✨ Features

📱 Responsive Design — Optimized layouts for desktop, tablet, and mobile screen sizes.

🏠 Property Discovery — Browse available properties through a dedicated properties page.

🔎 Property Details — View detailed information including price, location, bedrooms, bathrooms, area, agent information, images, and amenities.

📅 Viewing Requests — Customers can select an available viewing date and time and submit their contact information.

🔄 Availability Re-check — The selected viewing slot is checked again before the customer continues with the request.

🛡️ Double-Booking Protection — A unique database constraint on the viewing slot prevents multiple requests from booking the same slot.

⚡ Automatic Slot Availability — A Supabase database trigger marks a viewing slot as unavailable when a request is created.

🔐 Admin Authentication — Admin users sign in through Supabase Authentication and are verified through their profile role.

🖥️ Admin Dashboard — Dedicated dashboard for managing the real-estate platform.

🏘️ Property Management — Admins can manage property records through the dashboard.

🕐 Viewing Slot Management — Admins can create, edit, filter, and delete available viewing slots.

💬 Viewing Request Management — Admins can review customer requests and confirm or cancel pending requests.

🎞️ GSAP Animations — Smooth entrance animations are used throughout the public interface.

🎨 Luxury Real-Estate UI/UX — A refined visual style built around neutral tones, dark accents, and gold highlights.

🧭 Client-Side Routing — Public and admin pages are organized using React Router.

🗄️ Supabase Integration — PostgreSQL-backed data management, authentication, Row Level Security, triggers, and database policies.

🛠️ Technologies Used

React 19 — Component-based UI development.

TypeScript — Type-safe and maintainable application code.

Vite — Fast development server and production build tooling.

Tailwind CSS 4 — Utility-first styling and design system configuration.

Supabase — Database, authentication, Row Level Security, and database functions/triggers.

React Router — Client-side navigation and route management.

GSAP — Smooth UI and entrance animations.

Lucide React — Modern icon library.

React Hook Form — Form-handling support.

Oxlint — JavaScript/TypeScript linting.

Modern ES6+ JavaScript — Modern syntax and development practices.


🚀 Installation and Setup

Follow these steps to run the project locally:

# Clone the repository
git clone <>

# Navigate to the project directory
cd primenest_final

# Install dependencies
npm install

# Start the development server
npm run dev

The application will then be available through the local Vite development server.

🔐 Supabase Configuration

The application uses Supabase for its backend services. Configure the required Supabase environment variables in a local environment file before running the application.

VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

Never commit real credentials or service-role keys to the repository.

🏗️ Build for Production

To create an optimized production build:

npm run build

To preview the production build locally:

npm run preview

The project also includes a linting command:

npm run lint

📅 Viewing & Booking System

PrimeNest includes a multi-step property viewing request flow designed to prevent stale availability and duplicate bookings.

Customer Flow

Open Property Details
        ↓
Schedule a Viewing
        ↓
Load available future slots
        ↓
Select a viewing date
        ↓
Select a viewing time
        ↓
Re-check slot availability
        ↓
Enter customer information
        ↓
Submit viewing request
        ↓
Request stored in Supabase
        ↓
Viewing slot becomes unavailable
        ↓
Success confirmation shown

Available Slots

Customers only receive viewing slots that are marked:

is_available = true

The booking modal also filters slots from the current date onward and refreshes the availability data after booking-related changes.

Availability Re-check

Before the customer proceeds after selecting a time, the application queries Supabase again to verify that the selected slot is still available.

This protects the interface from stale data when another customer books the same time while the first customer still has the viewing modal open.

Double-Booking Protection

The database provides the final protection against concurrent booking attempts through a unique constraint on:

viewing_requests.slot_id

If two customers attempt to submit the same slot, the database rejects the duplicate request and the application refreshes the available slots and informs the customer that the viewing time is no longer available.

Automatic Slot Update

When a new viewing request is inserted, the database trigger:

on_viewing_request_created

executes the handle_viewing_booking() function, which immediately updates the associated slot to:

is_available = false

🔄 Booking Status Lifecycle

The application uses the following request states:

Status

Meaning

Available

The viewing slot has no request and is_available is true.

Pending

A customer has submitted a viewing request and it is awaiting admin action.

Confirmed

The admin has confirmed the customer's viewing request.

Cancelled

The admin has cancelled the request.

When a request is cancelled, the associated slot is made available again through the admin request-management flow, allowing customers to book that original time again.

🖥️ Admin Portal

PrimeNest includes a separate administration area accessible through:

/admin/login

Admin Authentication

The login system uses Supabase Authentication with email and password.

After successful authentication, the application checks the user's record in the profiles table and requires:

role = 'admin'

Users without admin privileges are signed out and denied access to the admin dashboard.

Admin Dashboard Sections

📊 Overview — Dashboard overview and platform information.

🏠 Properties — Manage property records.

📅 Viewing Slots — Create, edit, filter, and delete available viewing slots.

💬 Requests — Review and manage customer viewing requests.

🚪 Logout — Securely sign out through Supabase Authentication.

The admin dashboard also includes a responsive sidebar that can be opened and closed on smaller screens.

🗄️ Database

PrimeNest uses Supabase/PostgreSQL with the following main tables:

Table

Purpose

profiles

Stores user/admin profile information and roles.

agents

Stores real-estate agent information.

properties

Stores property listings and core property details.

property_images

Stores property image URLs and primary-image information.

amenities

Stores available property amenities.

property_amenities

Connects properties with their amenities.

viewing_slots

Stores available property viewing dates and times.

viewing_requests

Stores customer requests for property viewings.

Database Relationships

profiles

agents
  │
  └── properties
        │
        ├── property_images
        │
        ├── property_amenities ─── amenities
        │
        └── viewing_slots
                │
                └── viewing_requests

Important Constraints

UUID primary keys are used throughout the schema.

agents.email is unique.

amenities.name is unique.

property_amenities uses a composite primary key of property_id and amenity_id.

viewing_requests.slot_id is unique to prevent double booking.

Foreign keys use cascading behavior where appropriate.

Property types are restricted to supported values such as house, apartment, villa, condo, and townhouse.

Listing types are restricted to sale and rent.

Viewing request status is restricted to pending, confirmed, and cancelled.

🔐 Security & Row Level Security

Row Level Security (RLS) is enabled on all major application tables.

The database policies provide different access levels for public users and administrators.

Public Access

Public users can read property-related information such as:

Properties

Agents

Property images

Amenities

Property-amenity relationships

Viewing slots

Profiles according to the configured policies

Customers can also insert viewing requests without requiring an authenticated account.

Admin Access

Administrative management operations are protected through policies that verify the authenticated user's profile role:

profiles.role = 'admin'

This applies to administrative management of properties, agents, images, amenities, property relationships, viewing slots, and viewing requests.

🎨 Design & UI Details

The visual identity of PrimeNest Realty focuses on a premium and sophisticated real-estate experience.

🖤 Dark Primary Color — A strong charcoal tone creates a professional foundation.

🥂 Gold Accent — Gold is used as a refined highlight throughout the interface.

🤍 Warm Background — A soft off-white background keeps the experience elegant and comfortable.

✍️ Clean Typography — Inter is used for a modern, readable visual identity.

🏡 Luxury Real-Estate Aesthetic — Large property imagery, spacious layouts, and premium presentation support the brand identity.

📐 Responsive Layouts — Public pages and the admin dashboard adapt to smaller screen sizes.

🎞️ Smooth Motion — GSAP animations provide polished entrance effects on key sections.

🎬 Animations & Interactions

GSAP is used on the home page for polished entrance animations, including:

Hero content reveal animations.

Staggered feature-card animations.

Smooth upward movement combined with opacity transitions.

The application also uses interactive elements such as:

Viewing modal step navigation.

Responsive admin sidebar.

Property navigation.

Admin filtering controls.

Loading and submission states.

Success and error feedback.

📸 Screenshots

Add project screenshots here to showcase the main interfaces:

Home Page

Properties Page

Property Details

Schedule a Viewing Modal

Admin Login

Admin Dashboard

Viewing Slots

Viewing Requests

🌐 Live Demo

Live Demo: [Add deployment link]

👩‍💻 Author

Created by: Israa Maher

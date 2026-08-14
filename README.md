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
git clone <https://github.com/israamaherzeer/PrimeNest-Realty.git>

# Navigate to the project directory
cd primenest_final

# Install dependencies
npm install

# Start the development server
npm run dev

The application will then be available through the local Vite development server.




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

Stores real-estate agent information.

properties

Stores property listings and core property details.

property_images

Stores property image URLs and primary-image information.


viewing_slots

Stores available property viewing dates and times.

viewing_requests

Stores customer requests for property viewings.

Database Relationships

profiles

Important Constraints

UUID primary keys are used throughout the schema.


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

 Dark Primary Color — A strong charcoal tone creates a professional foundation.

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

<img width="1892" height="908" alt="Screenshot 2026-08-14 173911" src="https://github.com/user-attachments/assets/f7fb95b9-ea46-42d8-8db0-539457fa7f4e" />
<img width="1906" height="916" alt="Screenshot 2026-08-14 174013" src="https://github.com/user-attachments/assets/c1c53c88-0079-4223-a8b3-dc18e77b3ece" />
<img width="1902" height="908" alt="Screenshot 2026-08-14 174101" src="https://github.com/user-attachments/assets/e4d93120-f742-46a3-a6a7-eeefd89eccec" />
<img width="1902" height="897" alt="Screenshot 2026-08-14 174138" src="https://github.com/user-attachments/assets/f6af9931-8b62-45b5-b0aa-39158d080394" />
<img width="1917" height="913" alt="Screenshot 2026-08-14 174240" src="https://github.com/user-attachments/assets/71d0832f-9caf-4df1-aaad-2369f640170b" />
<img width="1918" height="910" alt="Screenshot 2026-08-14 174341" src="https://github.com/user-attachments/assets/7ff94ae0-69fc-480d-b3ee-d0d76fcfb9e0" />
<img width="1917" height="913" alt="Screenshot 2026-08-14 174240" src="https://github.com/user-attachments/assets/b44c5cb0-a264-4f3a-acc9-9e6dfb4df24a" />
<img width="1912" height="912" alt="Screenshot 2026-08-14 174259" src="https://github.com/user-attachments/assets/437f1a70-bf22-47d5-9c6e-878aee810b11" />






🌐 Live Demo

Live Demo:

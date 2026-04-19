# Dhanwantari Clinic Management System - Setup Instructions

Welcome to the Dhanwantari Clinic Management System! This is a complete React-based clinic management application built with Vite, Tailwind CSS, and Supabase.

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Installation Steps](#installation-steps)
- [Environment Configuration](#environment-configuration)
- [Supabase Setup](#supabase-setup)
- [Database Tables](#database-tables)
- [Running the Application](#running-the-application)
- [Features Overview](#features-overview)
- [User Roles](#user-roles)

## 🔧 Prerequisites

Make sure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- A **Supabase account** (create one at https://supabase.com)

## 📦 Installation Steps

1. **Navigate to the project directory:**
   ```bash
   cd project
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Verify all packages are installed:**
   ```bash
   npm list
   ```

## 🔐 Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp .env.example .env.local
   ```

2. **Update `.env.local` with your Supabase credentials:**
   ```env
   VITE_SUPABASE_URL=your_supabase_url_here
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   ```

## 🗄️ Supabase Setup

### Step 1: Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign in
2. Create a new project
3. Wait for the project to be initialized
4. Go to **Project Settings** > **API** to get your credentials

### Step 2: Run Database Migrations
1. Go to **SQL Editor** in your Supabase dashboard
2. Create the tables using the migration file or SQL commands below

### Database Schema

Run the following SQL in your Supabase SQL editor:

```sql
-- Create users (profiles) table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'doctor', 'receptionist')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create patients table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(10) CHECK (gender IN ('male', 'female', 'other')),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  blood_group VARCHAR(5),
  emergency_contact VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create appointments table
CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  reason TEXT,
  status VARCHAR(20) CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create prescriptions table
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  diagnosis TEXT,
  instructions TEXT,
  medications JSONB DEFAULT '[]',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create medical records table
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
  visit_date DATE NOT NULL,
  symptoms TEXT,
  diagnosis TEXT,
  blood_pressure VARCHAR(20),
  temperature DECIMAL(5,2),
  weight DECIMAL(7,2),
  height DECIMAL(7,2),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (Optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
```

### Step 3: Enable Authentication
1. Go to **Authentication** > **Providers**
2. Make sure **Email** provider is enabled (it should be by default)
3. Go to **URL Configuration** and set your redirect URLs:
   - Development: `http://localhost:5173`
   - Production: Your production domain

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🎯 Features Overview

### Authentication
- **Email/Password Login** - Secure user authentication via Supabase
- **User Registration** - Sign up as Doctor or Receptionist
- **Role-Based Access Control** - Different features based on user role

### Dashboards
1. **Admin Dashboard** - System overview and statistics
2. **Doctor Dashboard** - Today's appointments and patient management
3. **Receptionist Dashboard** - Daily schedule and appointment bookings

### Core Modules

#### Patient Management
- Register new patients
- View all patients
- Search patients by name, phone, or ID
- Edit patient information
- Delete patient records
- Patient demographics (DOB, gender, blood group, etc.)

#### Appointment Management
- Schedule appointments
- Select patient and doctor
- Set appointment date and time
- Manage appointment status (scheduled, completed, cancelled)
- Search and filter appointments
- Edit and delete appointments

#### Prescription Management
- Create prescriptions for patients
- Add multiple medications with dosage
- Include diagnosis and instructions
- Download prescriptions
- View prescription history
- Delete prescriptions

#### Medical Records
- Create medical records for patient visits
- Record vital signs (BP, temperature, weight, height)
- Document symptoms and diagnosis
- Add clinical notes
- View patient visit history
- Edit and delete records

### UI Components
- **Sidebar Navigation** - Collapsible sidebar with role-based menu items
- **Navbar** - Top navigation with search and user profile
- **Dashboard Cards** - Statistics and overview cards
- **Responsive Tables** - Data tables with search and pagination
- **Modal Forms** - Pop-up forms for data entry
- **Protected Routes** - Authentication-protected pages

## 👥 User Roles

### Admin
- Access to all system features
- View system statistics and reports
- Manage user accounts
- System configuration

**Permissions:**
- View Dashboard
- Manage Patients
- Manage Appointments
- Create Prescriptions
- View Medical Records

### Doctor
- Manage their own appointments
- Create prescriptions for patients
- View and manage medical records
- Access to patient information

**Permissions:**
- View Dashboard
- Manage Patients
- Manage Appointments
- Create Prescriptions
- View Medical Records

### Receptionist
- Schedule and manage appointments
- Register new patients
- View appointment schedule
- Basic patient information access

**Permissions:**
- View Dashboard
- Manage Patients
- Manage Appointments

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

The sidebar collapses on smaller screens, and all forms are optimized for touch input.

## 🎨 UI/UX Design

**Color Scheme:**
- **Primary Color:** Green (#22c55e)
- **Background:** Light Gray
- **Cards:** White
- **Accents:** Blue, Purple, Yellow

**Design Features:**
- Clean and professional layout
- Clinic-friendly branding
- Easy-to-use forms
- Clear visual hierarchy
- Accessibility-focused

## 🔒 Security Features

1. **Authentication** - Supabase handles secure authentication
2. **Protected Routes** - Routes are protected with authentication checks
3. **Role-Based Access** - Different views based on user roles
4. **Environment Variables** - Sensitive data stored in .env.local
5. **Row Level Security** - Database security policies (optional setup)

## 📝 Technology Stack

- **Frontend Framework:** React 18
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router v7
- **Database/Auth:** Supabase
- **Icons:** Lucide React
- **HTTP Client:** Supabase JavaScript Client

## 🐛 Troubleshooting

### Issue: "Missing Supabase credentials"
**Solution:** Make sure your `.env.local` file has the correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` values.

### Issue: Cannot connect to Supabase
**Solution:** 
- Check your internet connection
- Verify Supabase credentials are correct
- Make sure your Supabase project is active
- Check if the database tables are created

### Issue: Routes not working
**Solution:** 
- Clear browser cache
- Restart the development server
- Check that all dependencies are installed (`npm install`)

## 📚 Project Structure

```
project/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── Sidebar.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/              # Page components
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   └── Dashboard.jsx
│   ├── dashboards/         # Role-specific dashboards
│   │   ├── AdminDashboard.jsx
│   │   ├── DoctorDashboard.jsx
│   │   └── ReceptionistDashboard.jsx
│   ├── modules/            # Feature modules
│   │   ├── PatientManagement.jsx
│   │   ├── AppointmentManagement.jsx
│   │   ├── PrescriptionManagement.jsx
│   │   └── MedicalRecords.jsx
│   ├── context/            # React Context
│   │   └── AuthContext.jsx
│   ├── lib/                # Utilities
│   │   └── supabase.js
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Global styles
├── public/                 # Static assets
├── .env.example            # Environment template
├── .env.local              # Environment variables (create locally)
├── vite.config.js          # Vite configuration
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
└── package.json            # Dependencies and scripts
```

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review Supabase documentation: https://supabase.com/docs
3. Check React documentation: https://react.dev
4. Check Vite documentation: https://vitejs.dev

## 📄 License

This project is for educational purposes.

---

**Ready to start?** Run `npm run dev` and open `http://localhost:5173` in your browser!

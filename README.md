# Dhanwantari Clinic Management System

A complete, modern web-based clinic management system for healthcare providers, built with React, Supabase, and Tailwind CSS.

![Clinic Management System](https://img.shields.io/badge/Status-Production_Ready-green)
![React](https://img.shields.io/badge/React-18.3.1-blue)
![Supabase](https://img.shields.io/badge/Supabase-Database-green)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-blue)

## Overview

Dhanwantari Clinic Management System is a comprehensive solution designed specifically for Dhanwantari Clinic in Mumbai. This system enables efficient management of patients, appointments, prescriptions, and medical records with role-based access control.

## Key Features

- **User Authentication**: Secure login/signup with role-based access
- **Patient Management**: Complete patient registration and record management
- **Appointment Scheduling**: Easy appointment booking and tracking
- **Prescription Management**: Digital prescription creation with medication details
- **Medical Records**: Comprehensive patient visit history and vital signs tracking
- **Role-Based Dashboards**: Custom views for Admin, Doctor, and Receptionist
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Search & Filter**: Quick search functionality across all modules
- **Real-time Updates**: Live data synchronization with Supabase

## Technology Stack

- **Frontend**: React 18.3.1 (JSX)
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS with custom green healthcare theme
- **Routing**: React Router DOM
- **Backend**: Supabase (PostgreSQL + Auth)
- **Icons**: Lucide React
- **State Management**: React Context API

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Modern web browser

### Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   - Copy `.env.example` to `.env`
   - Fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with your Supabase project values

3. **Database Setup**
   - Database schema is automatically created
   - Includes all tables and security policies

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   The application will open at `http://localhost:5173`

5. **Build for Production**
   ```bash
   npm run build
   ```

## User Roles

### Admin
- Full system access
- View system statistics
- Manage all data
- User management capabilities

### Doctor
- View and manage appointments
- Create and manage prescriptions
- Maintain medical records
- Access patient information

### Receptionist
- Register new patients
- Schedule appointments
- View patient information
- Manage appointment calendar

## Main Modules

### 1. Patient Management
Register and manage patient information including demographics, contact details, blood group, and emergency contacts.

### 2. Appointment Management
Schedule and track patient appointments with doctors, including date, time, reason, and status tracking.

### 3. Prescription Management
Create digital prescriptions with multiple medications, dosage instructions, and diagnosis information.

### 4. Medical Records
Maintain comprehensive medical history including symptoms, diagnosis, vital signs, and clinical notes.

## Project Structure

```
src/
├── components/         # Reusable UI components
├── pages/             # Main pages (Login, Signup, Dashboard)
├── dashboards/        # Role-specific dashboard views
├── modules/           # Feature modules (Patients, Appointments, etc.)
├── context/           # React Context for state management
└── lib/              # Utilities and configurations
```

## Database Schema

The system uses 5 main tables:
- **users**: User accounts with role information
- **patients**: Patient demographic and contact information
- **appointments**: Appointment scheduling data
- **prescriptions**: Digital prescription records
- **medical_records**: Patient visit history and vital signs

All tables have Row Level Security (RLS) enabled for data protection.

## Security Features

- Supabase authentication with secure password handling
- Row Level Security on all database tables
- Role-based access control throughout the application
- Protected routes requiring authentication
- Secure API communication

## Documentation

- **[QUICK_START_GUIDE.md](./QUICK_START_GUIDE.md)**: Step-by-step guide for first-time users
- **[PROJECT_DOCUMENTATION.md](./PROJECT_DOCUMENTATION.md)**: Complete technical documentation

## Usage Examples

### Register a Patient
1. Navigate to Patients page
2. Click "Add Patient"
3. Fill in required information
4. Submit the form

### Schedule an Appointment
1. Go to Appointments page
2. Click "Schedule Appointment"
3. Select patient and doctor
4. Choose date and time
5. Save the appointment

### Create a Prescription
1. Open Prescriptions module
2. Click "Create Prescription"
3. Select patient and add medications
4. Include diagnosis and instructions
5. Submit the prescription

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- React JSX (not TypeScript)
- Functional components with hooks
- Tailwind CSS for styling
- Modular component structure

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Academic Project

This system was developed as an academic software project for Dhanwantari Clinic, Mumbai. It demonstrates:
- Full-stack web development
- Healthcare information system design
- Database design and management
- User authentication and authorization
- Modern React development practices

## Future Enhancements

- Lab test management
- Billing and invoicing system
- Insurance claim processing
- SMS/Email notifications
- Advanced reporting and analytics
- Mobile app version
- Telemedicine integration

## License

Academic project for Dhanwantari Clinic, Mumbai.

## Support

For questions or issues, please refer to the documentation files or contact the development team.

---

**Developed for Dhanwantari Clinic, Mumbai**

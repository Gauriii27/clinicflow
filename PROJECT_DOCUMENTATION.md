# Dhanwantari Clinic Management System

A comprehensive web-based clinic management system built with React, Supabase, and Tailwind CSS for Dhanwantari Clinic, Mumbai.

## Overview

This is a full-featured clinic management system designed for healthcare providers to manage patients, appointments, prescriptions, and medical records efficiently. The system supports role-based access control with three distinct user roles: Admin, Doctor, and Receptionist.

## Features

### Authentication
- Email/password based authentication using Supabase
- Secure login and signup pages
- Role-based access control
- Protected routes

### User Roles

#### Admin
- View system statistics and overview
- Manage all users in the system
- Access to all modules
- System configuration and settings

#### Doctor
- View today's appointments
- Manage patient records
- Create and manage prescriptions
- Maintain medical records
- Track patient visit history

#### Receptionist
- Register new patients
- Schedule appointments
- View appointment calendar
- Manage patient information

### Core Modules

#### 1. Patient Management
- Register new patients
- Search and filter patients
- Edit patient information
- View patient demographics
- Emergency contact information
- Blood group tracking

#### 2. Appointment Management
- Schedule patient appointments
- Assign doctors to appointments
- Set appointment date and time
- Track appointment status (Scheduled, Completed, Cancelled)
- View appointment history

#### 3. Prescription Management
- Create digital prescriptions
- Add multiple medications
- Specify dosage, frequency, and duration
- Include diagnosis and instructions
- View prescription history
- Download prescriptions

#### 4. Medical Records
- Record patient visit history
- Document symptoms and diagnosis
- Track vital signs (BP, temperature, weight, height)
- Add clinical notes
- Maintain comprehensive medical history

## Technology Stack

- **Frontend**: React 18.3.1 with JSX
- **Build Tool**: Vite 5.4.2
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx          # Navigation sidebar with role-based menu
│   ├── Navbar.jsx            # Top navigation bar with search and user info
│   └── ProtectedRoute.jsx    # Route protection wrapper
│
├── pages/
│   ├── Login.jsx             # Login page
│   ├── Signup.jsx            # User registration page
│   └── Dashboard.jsx         # Main dashboard layout
│
├── dashboards/
│   ├── AdminDashboard.jsx    # Admin role dashboard
│   ├── DoctorDashboard.jsx   # Doctor role dashboard
│   └── ReceptionistDashboard.jsx  # Receptionist role dashboard
│
├── modules/
│   ├── PatientManagement.jsx      # Patient CRUD operations
│   ├── AppointmentManagement.jsx  # Appointment scheduling
│   ├── PrescriptionManagement.jsx # Prescription creation
│   └── MedicalRecords.jsx         # Medical record management
│
├── context/
│   └── AuthContext.jsx       # Authentication state management
│
├── lib/
│   └── supabase.js          # Supabase client configuration
│
├── App.jsx                  # Main app component with routing
└── main.jsx                 # Application entry point
```

## Database Schema

### Tables

1. **users**
   - Stores user account information
   - Links to Supabase auth.users
   - Fields: id, email, full_name, role, created_at

2. **patients**
   - Patient demographic and contact information
   - Fields: id, first_name, last_name, date_of_birth, gender, phone, email, address, blood_group, emergency_contact, created_at

3. **appointments**
   - Appointment scheduling and tracking
   - Fields: id, patient_id, doctor_id, appointment_date, appointment_time, reason, status, created_at

4. **prescriptions**
   - Digital prescription records
   - Fields: id, patient_id, doctor_id, prescription_date, diagnosis, medications (JSONB), instructions, created_at

5. **medical_records**
   - Patient visit and medical history
   - Fields: id, patient_id, doctor_id, visit_date, symptoms, diagnosis, blood_pressure, temperature, weight, height, notes, created_at

### Security

All tables have Row Level Security (RLS) enabled with policies that:
- Restrict data access based on user roles
- Ensure users can only view/modify authorized data
- Protect sensitive medical information
- Maintain HIPAA-like privacy standards

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - The `.env` file is already configured with Supabase credentials
   - Variables included:
     - VITE_SUPABASE_URL
     - VITE_SUPABASE_ANON_KEY

4. The database schema has been automatically created

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Build for production:
   ```bash
   npm run build
   ```

## First Time Setup

### Creating the First Admin User

1. Go to the signup page
2. Create an account with role "Doctor" or "Receptionist"
3. After account creation, manually update the role in Supabase dashboard:
   - Go to Supabase dashboard > Table Editor > users
   - Find your user record
   - Change the role to "admin"
4. Log out and log back in to access admin features

## Usage Guide

### For Receptionists

1. **Register New Patients**
   - Navigate to Patients page
   - Click "Add Patient" button
   - Fill in patient information
   - Submit the form

2. **Schedule Appointments**
   - Navigate to Appointments page
   - Click "Schedule Appointment"
   - Select patient and doctor
   - Choose date and time
   - Add reason for visit
   - Submit

### For Doctors

1. **View Today's Appointments**
   - Check the dashboard for scheduled appointments
   - Click on appointments to view details

2. **Create Prescriptions**
   - Navigate to Prescriptions page
   - Click "Create Prescription"
   - Select patient
   - Add medications with dosage, frequency, and duration
   - Include diagnosis and instructions
   - Submit

3. **Maintain Medical Records**
   - Navigate to Medical Records page
   - Click "Create Record"
   - Select patient and enter visit details
   - Document symptoms, diagnosis, and vital signs
   - Add clinical notes
   - Submit

### For Admins

1. **Monitor System**
   - View dashboard statistics
   - Check total patients, doctors, and appointments
   - Review system status

2. **Manage Users**
   - Access system settings
   - Add or remove users as needed

## Design Features

- **Clean and Professional UI**: Healthcare-focused design with green color scheme
- **Responsive Layout**: Works on desktop, tablet, and mobile devices
- **Intuitive Navigation**: Role-based sidebar menu
- **Search Functionality**: Quick search across all modules
- **Modal Forms**: Easy data entry with modal dialogs
- **Status Indicators**: Visual feedback for appointment and system status
- **Data Tables**: Organized display of records with sorting and filtering

## Security Features

- Supabase authentication with JWT tokens
- Row Level Security on all database tables
- Role-based access control
- Protected routes
- Secure API communication
- Password encryption

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Future Enhancements

Potential features for future versions:
- Lab test management
- Billing and invoicing
- Insurance management
- SMS/Email notifications
- Report generation
- Analytics dashboard
- Telemedicine integration
- Multi-language support

## Academic Project Information

This project was developed as an academic software project for Dhanwantari Clinic, Mumbai. It demonstrates:
- Full-stack web development
- Database design and management
- User authentication and authorization
- Role-based access control
- Healthcare information management
- Modern React development practices

## Support

For issues or questions about this project, please contact the development team.

## License

This is an academic project developed for Dhanwantari Clinic.

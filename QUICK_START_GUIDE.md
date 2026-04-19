# Quick Start Guide - Dhanwantari Clinic Management System

## Getting Started

Follow these steps to start using the Dhanwantari Clinic Management System.

## Step 1: First User Registration

1. The application will automatically start when you open it
2. You'll see the login page for Dhanwantari Clinic
3. Click on "Sign Up" to create your first account

## Step 2: Create Your Account

1. Fill in the registration form:
   - **Full Name**: Enter your full name (e.g., "Dr. Rajesh Kumar")
   - **Email**: Your professional email address
   - **Password**: Choose a secure password (minimum 6 characters)
   - **Role**: Select your role
     - Choose "Doctor" if you're a medical professional
     - Choose "Receptionist" if you handle appointments and registration

2. Click "Sign Up" button

3. You'll be redirected to the login page after successful registration

## Step 3: First Login

1. Enter your email and password
2. Click "Sign In"
3. You'll be taken to your role-specific dashboard

## Step 4: Understanding Your Dashboard

### For Doctors
Your dashboard shows:
- Today's appointments
- Total patients
- Prescriptions created
- Quick access buttons to:
  - View appointments
  - Create prescriptions
  - View patients

### For Receptionists
Your dashboard shows:
- Today's appointments
- Total patients
- Scheduled appointments
- Quick access buttons to:
  - Register new patient
  - Schedule appointment
  - View all patients

## Step 5: Common Tasks

### Register a New Patient (Receptionists)

1. Click "Patients" in the sidebar
2. Click the "Add Patient" button (top right)
3. Fill in patient information:
   - First Name and Last Name (required)
   - Date of Birth (required)
   - Gender (required)
   - Phone Number (required)
   - Email (optional)
   - Address (optional)
   - Blood Group (optional)
   - Emergency Contact (optional)
4. Click "Add Patient"

### Schedule an Appointment (Receptionists)

1. Click "Appointments" in the sidebar
2. Click "Schedule Appointment" button
3. Select the patient from dropdown
4. Select the doctor from dropdown
5. Choose appointment date
6. Choose appointment time
7. Enter reason for visit
8. Select status (default is "Scheduled")
9. Click "Schedule Appointment"

### Create a Prescription (Doctors Only)

1. Click "Prescriptions" in the sidebar
2. Click "Create Prescription" button
3. Select the patient
4. Enter the diagnosis
5. Add medications:
   - Click "+ Add Medication" to add more medicines
   - For each medication, enter:
     - Medicine name (e.g., "Amoxicillin")
     - Dosage (e.g., "500mg")
     - Frequency (e.g., "Twice daily")
     - Duration (e.g., "7 days")
6. Add any additional instructions
7. Click "Create Prescription"

### Create a Medical Record (Doctors Only)

1. Click "Medical Records" in the sidebar
2. Click "Create Record" button
3. Select the patient
4. Choose the visit date
5. Describe symptoms (required)
6. Enter diagnosis (required)
7. Record vital signs (optional):
   - Blood Pressure (e.g., "120/80")
   - Temperature (e.g., "98.6°F")
   - Weight (e.g., "70 kg")
   - Height (e.g., "170 cm")
8. Add any additional notes
9. Click "Create Record"

## Navigation Tips

### Sidebar Menu
The sidebar on the left shows available options based on your role:
- **Dashboard**: Your home page with statistics
- **Patients**: Patient management (All roles)
- **Appointments**: Appointment scheduling (All roles)
- **Prescriptions**: Prescription management (Doctors only)
- **Medical Records**: Medical history (Doctors only)
- **Logout**: Sign out of the system

### Collapsible Sidebar
Click the arrow button on the right edge of the sidebar to collapse/expand it for more screen space.

### Search Functionality
Use the search bar at the top of each module to:
- Search patients by name, phone, or ID
- Search appointments by patient or doctor name
- Search prescriptions by patient or diagnosis
- Search medical records by patient or diagnosis

## Managing Records

### Edit Records
1. Find the record you want to edit
2. Click the blue edit icon (pencil)
3. Modify the information
4. Click "Update" or "Save"

### View Details
1. Find the record you want to view
2. Click the view icon (eye) if available
3. Review the complete information
4. Close the modal when done

### Delete Records
1. Find the record you want to delete
2. Click the red delete icon (trash)
3. Confirm the deletion
4. The record will be permanently removed

## Status Management

### Appointment Status
You can update appointment status to:
- **Scheduled**: Appointment is confirmed
- **Completed**: Patient has been seen
- **Cancelled**: Appointment was cancelled

## Tips for Best Use

1. **Regular Updates**: Keep patient information up to date
2. **Complete Records**: Fill in as much information as possible for better patient care
3. **Search First**: Before adding a new patient, search to avoid duplicates
4. **Schedule Ahead**: Book appointments in advance to manage clinic flow
5. **Document Everything**: Add detailed notes in medical records for continuity of care

## Creating an Admin User

Currently, only Doctors and Receptionists can sign up through the interface. To create an Admin user:

1. First, create a Doctor or Receptionist account
2. Contact your system administrator to update your role to "Admin" in the database
3. Log out and log back in to access Admin features

Admin users have access to:
- System statistics
- All modules
- User management (future feature)

## Troubleshooting

### Can't Log In?
- Verify your email and password are correct
- Ensure you registered successfully
- Check your internet connection

### Don't See Expected Features?
- Verify you're logged in with the correct role
- Some features are role-specific:
  - Prescriptions: Doctors and Admin only
  - Medical Records: Doctors and Admin only

### Data Not Showing?
- Check if you have the necessary permissions
- Verify the data exists in the system
- Try refreshing the page

## Getting Help

For additional support or questions:
- Refer to the complete PROJECT_DOCUMENTATION.md file
- Contact your system administrator
- Check the error messages for specific guidance

## Security Reminders

- Keep your password secure and don't share it
- Log out when you're done using the system
- Patient data is confidential - handle with care
- Report any security concerns immediately

---

**Welcome to Dhanwantari Clinic Management System!**

We hope this system helps streamline your clinic operations and improve patient care.

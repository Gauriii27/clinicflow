import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import PatientManagement from './modules/PatientManagement';
import AppointmentManagement from './modules/AppointmentManagement';
import PrescriptionManagement from './modules/PrescriptionManagement';
import MedicalRecords from './modules/MedicalRecords';
import RegisterPatientDoctor from './pages/RegisterPatientDoctor';
import DoctorPatientRecords from './pages/DoctorPatientRecords';
import ExternalVisits from './modules/ExternalVisits';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patients"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <PatientManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient-management"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <PatientManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointments"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor', 'receptionist']}>
                <AppointmentManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <PrescriptionManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/medical-records"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <MedicalRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/register-patient"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <RegisterPatientDoctor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/patient-records"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <DoctorPatientRecords />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/external-visits"
            element={
              <ProtectedRoute allowedRoles={['admin', 'doctor']}>
                <ExternalVisits />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

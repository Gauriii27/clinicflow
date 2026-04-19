import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AdminDashboard from '../dashboards/AdminDashboard';
import DoctorDashboard from '../dashboards/DoctorDashboard';
import ReceptionistDashboard from '../dashboards/ReceptionistDashboard';
import bgImage from '../assets/medical_bg.png';

const Dashboard = () => {
  const { userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-teal-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return <AdminDashboard />;
      case 'doctor':
        return <DoctorDashboard />;
      case 'receptionist':
        return <ReceptionistDashboard />;
      default:
        return <Navigate to="/login" replace />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900">
      {/* Dynamic Background Layer */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-teal-400/20 blur-3xl animate-float" />
        <div className="absolute top-[60%] right-[10%] w-80 h-80 rounded-full bg-blue-400/20 blur-3xl animate-float-delayed" />
        <div className="absolute bottom-[5%] left-[15%] w-48 h-48 rounded-full bg-cyan-300/10 blur-2xl animate-float" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen backdrop-blur-[2px]">
        {/* Top Navigation replacing Sidebar */}
        <Navbar />
        
        <main className="flex-1 w-full flex justify-center py-10 px-6">
          <div className="w-full max-w-6xl transition-all duration-500 ease-in-out">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

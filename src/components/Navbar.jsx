import { LogOut, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { userRole, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const roleTitle = {
    admin: 'Admin Dashboard',
    doctor: 'Doctor Dashboard',
    receptionist: 'Receptionist Dashboard'
  }[userRole] || 'Dashboard';

  return (
    <div className="w-full px-8 py-5 flex items-center justify-between sticky top-0 z-50 glass-nav border-b border-white/20">
      {/* Clinic Logo and Title with Glow */}
      <div className="flex items-center gap-4 group cursor-pointer" onClick={() => navigate('/dashboard')}>
        <div className="bg-white/90 p-2.5 rounded-2xl shadow-xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          <Activity className="text-teal-600 w-7 h-7" />
        </div>
        <div className="flex flex-col">
          <h1 className="text-white text-2xl font-bold leading-tight m-0 tracking-tight drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
            Dhanwantari
          </h1>
          <span className="text-teal-100 text-sm font-medium opacity-80 mt-0.5 uppercase tracking-widest text-[0.7rem]">
            {roleTitle}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
        {[
          { title: 'Dashboard', path: '/dashboard' },
          { title: 'Patients', path: '/patients' },
          { title: 'Appointments', path: '/appointments' },
          { title: 'Prescriptions', path: '/prescriptions' },
          { title: 'Records', path: '/medical-records' }
        ].map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 ${
              window.location.pathname === item.path
                ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/30 ring-1 ring-white/20'
                : 'text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            {item.title}
          </button>
        ))}
      </nav>

      {/* Logout Button as Glass Element */}
      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 bg-white/10 hover:bg-red-500/20 text-white font-semibold px-6 py-2.5 rounded-xl backdrop-blur-md border border-white/10 transition-all duration-300 hover:border-red-500/30 group"
      >
        <LogOut className="w-5 h-5 text-red-200 group-hover:text-red-400" />
        <span className="group-hover:text-red-100 transition-colors">Logout</span>
      </button>
    </div>
  );
};

export default Navbar;

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const { data, error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    navigate('/dashboard');
    setLoading(false);
  };

  return (
    <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-6 overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-110 pointer-events-none" 
           style={{ backgroundImage: `url('/src/assets/medical_bg.png')` }} />
      
      {/* Floating Bubbles */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-teal-500/20 blur-[100px] animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-blue-500/20 blur-[100px] animate-float-delayed" />
      </div>

      <div className="glass-card w-full max-w-[450px] rounded-[2.5rem] p-8 md:p-10 border-white/5 shadow-2xl relative z-10 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)]">
              <Activity className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">ClinicFlow</h1>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Welcome Back</h2>
          <p className="text-white/50 text-sm font-medium">Log in to your clinical control center</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center">
            <p className="text-sm font-bold text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="overflow-y-auto custom-scrollbar pr-2 pb-4 flex-1">
          <form onSubmit={handleSubmit} className="space-y-5 mb-8">
            <div className="space-y-2">
              <label className="block text-[0.65rem] font-black uppercase tracking-widest text-white/50 pl-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-slate-900/80 transition-all focus:ring-1 focus:ring-teal-500/50"
                  placeholder="doctor@clinic.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[0.65rem] font-black uppercase tracking-widest text-white/50 pl-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all focus:ring-1 focus:ring-teal-500/50"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="p-5 bg-white/5 border border-white/5 rounded-2xl">
            <p className="text-[0.65rem] font-black tracking-[0.2em] uppercase text-white/40 mb-3 text-center">Demo Credentials</p>
            <div className="space-y-2">
              {['Admin', 'Doctor', 'Reception'].map(roleLabel => (
                <div key={roleLabel} className="flex justify-between items-center bg-black/20 px-3 py-2 rounded-xl">
                  <span className="text-teal-300 text-xs font-bold">{roleLabel}</span>
                  <span className="text-white/60 text-[0.65rem] font-mono">{roleLabel.toLowerCase()}@dhanwantari.com / {roleLabel.toLowerCase()}12{roleLabel === 'Admin' ? '' : '3'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Signup Link */}
        <div className="text-center pt-6 mt-2 border-t border-white/5">
          <p className="text-white/50 text-sm font-medium">
            Don't have an account?{' '}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-bold hover:underline transition-all">
              Register Clinic
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
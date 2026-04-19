import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState('doctor');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const styles = {
    container: {
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
    },
    wrapper: {
      width: '100%',
      maxWidth: '450px'
    },
    header: {
      textAlign: 'center',
      marginBottom: '48px'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '12px',
      marginBottom: '24px'
    },
    logoIcon: {
      backgroundColor: '#16a34a',
      color: 'white',
      padding: '8px',
      borderRadius: '8px'
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#111827',
      margin: 0
    },
    subtitle: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px',
      margin: 0
    },
    description: {
      color: '#6b7280',
      margin: 0
    },
    formGroup: {
      marginBottom: '24px'
    },
    label: {
      display: 'block',
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      marginBottom: '8px'
    },
    inputContainer: {
      position: 'relative'
    },
    input: {
      width: '100%',
      paddingLeft: '40px',
      paddingRight: '16px',
      paddingTop: '12px',
      paddingBottom: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      transition: 'all 0.3s',
      fontFamily: 'inherit'
    },
    inputWithToggle: {
      paddingRight: '40px'
    },
    select: {
      width: '100%',
      paddingLeft: '16px',
      paddingRight: '16px',
      paddingTop: '12px',
      paddingBottom: '12px',
      border: '1px solid #d1d5db',
      borderRadius: '8px',
      fontSize: '16px',
      boxSizing: 'border-box',
      outline: 'none',
      cursor: 'pointer',
      fontFamily: 'inherit'
    },
    button: {
      width: '100%',
      backgroundColor: '#16a34a',
      color: 'white',
      paddingTop: '12px',
      paddingBottom: '12px',
      borderRadius: '8px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontFamily: 'inherit'
    },
    errorBox: {
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px'
    },
    successBox: {
      marginBottom: '24px',
      padding: '16px',
      backgroundColor: '#f0fdf4',
      border: '1px solid #bbf7d0',
      borderRadius: '8px'
    },
    errorText: {
      fontSize: '14px',
      color: '#b91c1c',
      margin: 0
    },
    successText: {
      fontSize: '14px',
      color: '#15803d',
      margin: 0
    },
    form: {
      marginBottom: '24px'
    },
    link: {
      color: '#16a34a',
      fontWeight: '600',
      textDecoration: 'none'
    },
    centerText: {
      textAlign: 'center',
      marginBottom: '32px',
      color: '#6b7280',
      margin: 0
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!fullName || !email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    const { data, error: signUpError } = await signUp(email, password, fullName, role);

    if (signUpError) {
      setError(signUpError.message || 'Failed to create account');
      setLoading(false);
      return;
    }

    if (data) {
      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
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
          <h2 className="text-xl font-bold text-white mb-2">Create Account</h2>
          <p className="text-white/50 text-sm font-medium">Join the intelligent clinical network</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl">
            <p className="text-sm font-bold text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
            <p className="text-sm font-bold text-teal-400 text-center">{success}</p>
          </div>
        )}

        {/* Form */}
        <div className="overflow-y-auto custom-scrollbar pr-2 pb-4 flex-1">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name Input */}
          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-white/50 pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-900/60 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-slate-900/80 transition-all focus:ring-1 focus:ring-teal-500/50"
                placeholder="Dr. Rajesh Kumar"
              />
            </div>
          </div>

          {/* Email Input */}
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

          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-white/50 pl-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 pl-12 pr-12 text-white placeholder:text-white/30 focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all focus:ring-1 focus:ring-teal-500/50"
                placeholder="Min 6 characters"
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

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="block text-[0.65rem] font-black uppercase tracking-widest text-white/50 pl-1">System Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-teal-500/50 focus:bg-white/5 transition-all focus:ring-1 focus:ring-teal-500/50 appearance-none cursor-pointer"
            >
              <option value="doctor" className="bg-slate-900 text-white">Doctor</option>
              <option value="admin" className="bg-slate-900 text-white">Administrator</option>
            </select>
          </div>

          {/* Sign Up Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white py-3.5 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Initializing Profile...' : 'Register Profile'}
          </button>
        </form>
        </div>

        {/* Sign In Link */}
        <div className="text-center pt-6 mt-2 border-t border-white/5">
          <p className="text-white/50 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-bold hover:underline transition-all">
              Secure Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

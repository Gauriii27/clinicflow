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


  const fillDemoCredentials = (role) => {
  if (role === "admin") {
    setEmail("admin@dhanwantari.com");
    setPassword("admin12");
  }

  if (role === "doctor") {
    setEmail("doctor@dhanwantari.com");
    setPassword("doctor123");
  }

  if (role === "reception") {
    setEmail("reception@dhanwantari.com");
    setPassword("reception123");
  }
};

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

  console.log(data, error);

  if (error) {
    setError(error.message);
    setLoading(false);
    return;
  }

  navigate('/dashboard'); // ✅ directly navigate
  setLoading(false);
};

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ width: '100%', maxWidth: '450px' }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#16a34a', color: 'white', padding: '8px', borderRadius: '8px' }}>
              <Activity size={32} />
            </div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#111827', margin: 0 }}>
              Dhanwantari Clinic
            </h1>
          </div>
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#111827', marginBottom: '8px', margin: 0 }}>
            Welcome back
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Sign in to your account</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Email Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail style={{ position: 'absolute', left: '12px', top: '12px', width: '20px', height: '20px', color: '#9ca3af' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
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
                }}
                placeholder="Enter your email"
                onFocus={(e) => {
                  e.target.style.borderColor = '#16a34a';
                  e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock style={{ position: 'absolute', left: '12px', top: '12px', width: '20px', height: '20px', color: '#9ca3af' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  paddingLeft: '40px',
                  paddingRight: '40px',
                  paddingTop: '12px',
                  paddingBottom: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'all 0.3s',
                  fontFamily: 'inherit'
                }}
                placeholder="Enter your password"
                onFocus={(e) => {
                  e.target.style.borderColor = '#16a34a';
                  e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '12px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0
                }}
                onMouseEnter={(e) => (e.target.style.color = '#6b7280')}
                onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: loading ? '#9ca3af' : '#16a34a',
              color: 'white',
              paddingTop: '12px',
              paddingBottom: '12px',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s',
              fontFamily: 'inherit'
            }}
            onMouseEnter={(e) => {
              if (!loading) e.target.style.backgroundColor = '#15803d';
            }}
            onMouseLeave={(e) => {
              if (!loading) e.target.style.backgroundColor = '#16a34a';
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Sign Up Link */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Don't have an account?{' '}
            <Link
              to="/signup"
              style={{ color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.target.style.color = '#15803d')}
              onMouseLeave={(e) => (e.target.style.color = '#16a34a')}
            >
              Sign up
            </Link>
          </p>
        </div>

        {/* Demo Credentials */}
        <div style={{ padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
          <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '12px', margin: 0 }}>Demo Credentials:</p>
          <div style={{ spacingY: '8px' }}>
            <p style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0' }}>Admin: admin@dhanwantari.com / admin123</p>
            <p style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0' }}>Doctor: doctor@dhanwantari.com / doctor123</p>
            <p style={{ fontSize: '13px', color: '#4b5563', margin: '8px 0' }}>Receptionist: reception@dhanwantari.com / reception123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
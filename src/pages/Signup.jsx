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
            Create Account
          </h2>
          <p style={{ color: '#6b7280', margin: 0 }}>Join the clinic management system</p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', color: '#b91c1c', margin: 0 }}>{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{ marginBottom: '24px', padding: '16px', backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px' }}>
            <p style={{ fontSize: '14px', color: '#15803d', margin: 0 }}>{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '24px' }}>
          {/* Full Name Input */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Full Name
            </label>
            <div style={{ position: 'relative' }}>
              <User style={{ position: 'absolute', left: '12px', top: '12px', width: '20px', height: '20px', color: '#9ca3af' }} />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
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
                placeholder="Enter your full name"
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
              Password (Min 6 characters)
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
                  padding: 0
                }}
                onMouseEnter={(e) => (e.target.style.color = '#6b7280')}
                onMouseLeave={(e) => (e.target.style.color = '#9ca3af')}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {/* Role Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
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
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#16a34a';
                e.target.style.boxShadow = '0 0 0 3px rgba(22, 163, 74, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d1d5db';
                e.target.style.boxShadow = 'none';
              }}
            >
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {/* Sign Up Button */}
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        {/* Sign In Link */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Already have an account?{' '}
            <Link
              to="/login"
              style={{ color: '#16a34a', fontWeight: '600', textDecoration: 'none' }}
              onMouseEnter={(e) => (e.target.style.color = '#15803d')}
              onMouseLeave={(e) => (e.target.style.color = '#16a34a')}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;

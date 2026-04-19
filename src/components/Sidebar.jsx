import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  FolderOpen,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
} from 'lucide-react';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, userRole, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const menuItems = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      roles: ['admin', 'doctor', 'receptionist'],
    },
    {
      name: 'Patients',
      icon: Users,
      path: '/patients',
      roles: ['admin', 'doctor', 'receptionist'],
    },
    {
      name: 'Appointments',
      icon: Calendar,
      path: '/appointments',
      roles: ['admin', 'doctor', 'receptionist'],
    },
    {
      name: 'Prescriptions',
      icon: FileText,
      path: '/prescriptions',
      roles: ['admin', 'doctor'],
    },
    {
      name: 'Medical Records',
      icon: FolderOpen,
      path: '/medical-records',
      roles: ['admin', 'doctor'],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <div
      style={{
        width: collapsed ? '80px' : '256px',
        backgroundColor: '#1f2937',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        zIndex: 40
      }}
    >
      {/* Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #374151',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '8px', backgroundColor: '#16a34a', borderRadius: '8px' }}>
              <Activity color="white" size={24} />
            </div>
            <div>
              <h1 style={{ fontWeight: 'bold', fontSize: '18px', color: 'white', margin: 0 }}>Dhanwantari</h1>
              <p style={{ fontSize: '12px', color: '#d1d5db', margin: 0 }}>Clinic Manager</p>
            </div>
          </div>
        )}
        {collapsed && (
          <div style={{ margin: '0 auto', padding: '8px', backgroundColor: '#16a34a', borderRadius: '8px' }}>
            <Activity color="white" size={24} />
          </div>
        )}
      </div>

      {/* Menu Items */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingTop: '24px',
        paddingBottom: '24px'
      }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '12px', paddingRight: '12px' }}>
          {filteredMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  transition: 'all 0.2s',
                  textDecoration: 'none',
                  backgroundColor: isActive ? '#16a34a' : 'transparent',
                  color: isActive ? 'white' : '#d1d5db',
                  boxShadow: isActive ? '0 10px 15px -3px rgba(22, 163, 74, 0.3)' : 'none'
                }}
                title={collapsed ? item.name : ''}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#374151';
                    e.currentTarget.style.color = '#f3f4f6';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#d1d5db';
                  }
                }}
              >
                <Icon size={20} style={{ flexShrink: 0 }} />
                {!collapsed && <span style={{ fontWeight: '600', fontSize: '14px' }}>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Info & Logout */}
      <div style={{
        borderTop: '1px solid #374151',
        padding: '16px'
      }}>
        {!collapsed && (
          <div style={{
            marginBottom: '16px',
            paddingLeft: '12px',
            paddingRight: '12px',
            paddingTop: '12px',
            paddingBottom: '12px',
            backgroundColor: '#374151',
            borderRadius: '8px'
          }}>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white', margin: 0 }}>
              {user?.full_name || user?.email}
            </p>
            <p style={{ fontSize: '12px', color: '#d1d5db', marginTop: '4px', margin: 0, textTransform: 'capitalize' }}>
              {userRole || 'User'}
            </p>
          </div>
        )}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '8px 16px',
            borderRadius: '8px',
            color: '#fca5a5',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            transition: 'all 0.3s',
            fontWeight: '600',
            fontSize: '14px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(153, 27, 27, 0.2)';
            e.currentTarget.style.color = '#fecaca';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#fca5a5';
          }}
          title={collapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={{
          position: 'absolute',
          right: '-12px',
          top: '80px',
          backgroundColor: '#16a34a',
          border: '2px solid white',
          borderRadius: '9999px',
          padding: '6px',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
          cursor: 'pointer',
          transition: 'all 0.3s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#15803d';
          e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#16a34a';
          e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
        }}
      >
        {collapsed ? (
          <ChevronRight size={16} color="white" />
        ) : (
          <ChevronLeft size={16} color="white" />
        )}
      </button>
    </div>
  );
};

export default Sidebar;

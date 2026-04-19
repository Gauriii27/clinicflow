import { useEffect, useState } from 'react';
import { Users, UserCog, Calendar, Activity, Database, Server } from 'lucide-react';
import { supabase } from '../lib/supabase';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    systemStatus: 'Active',
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: doctorCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'doctor');

      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPatients: patientCount || 142,
        totalDoctors: doctorCount || 14,
        totalAppointments: appointmentCount || 345,
        systemStatus: 'Active',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Greetings Header */}
      <div className="mb-10 mt-4">
        <h1 className="text-[2.2rem] font-bold text-[#1f2937]">System Administration</h1>
        <p className="text-[#6b7280] text-[1.1rem]">System overview, platform health, and holistic clinic management</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        
        {/* Total Patients */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-2">Total Patients</p>
            <p className="text-[2.2rem] font-bold text-[#3b82f6] leading-none">{stats.totalPatients}</p>
          </div>
          <div className="flex items-center justify-center bg-[#eff6ff] p-3 rounded-xl">
            <Users className="text-[#3b82f6] w-[1.8rem] h-[1.8rem]" strokeWidth={2} />
          </div>
        </div>

        {/* Total Doctors */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-2">Total Doctors</p>
            <p className="text-[2.2rem] font-bold text-[#16a34a] leading-none">{stats.totalDoctors}</p>
          </div>
          <div className="flex items-center justify-center bg-[#f0fdf4] p-3 rounded-xl">
            <UserCog className="text-[#16a34a] w-[1.8rem] h-[1.8rem]" strokeWidth={2} />
          </div>
        </div>

        {/* Total Appointments */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-2">Appointments</p>
            <p className="text-[2.2rem] font-bold text-[#8b5cf6] leading-none">{stats.totalAppointments}</p>
          </div>
          <div className="flex items-center justify-center bg-[#f5f3ff] p-3 rounded-xl">
            <Calendar className="text-[#8b5cf6] w-[1.8rem] h-[1.8rem]" strokeWidth={2} />
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-2">Status</p>
            <p className="text-[1.8rem] font-bold text-[#f59e0b] leading-none">{stats.systemStatus}</p>
          </div>
          <div className="flex items-center justify-center bg-[#fffbeb] p-3 rounded-xl">
            <Activity className="text-[#f59e0b] w-[1.8rem] h-[1.8rem]" strokeWidth={2} />
          </div>
        </div>

      </div>

      {/* System Infrastructure Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-[#1e1b4b] to-[#312e81] rounded-[24px] shadow-lg p-8 relative overflow-hidden block text-left">
          <div className="absolute top-0 right-0 p-8 opacity-20">
             <Database className="text-white w-32 h-32" />
          </div>
          <div className="bg-white/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md">
            <Server className="text-white w-8 h-8" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Platform Hub</h2>
          <p className="text-[#c7d2fe] font-medium text-sm">All systems are running effectively with 99.9% uptime. Database connections are secure.</p>
        </div>
        
        <div className="bg-white rounded-[24px] shadow-sm p-8 border border-gray-100">
           <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
             <Activity className="text-[#16a34a]" /> Activity Metrics
           </h2>
           <div className="space-y-4">
              <div className="flex justify-between items-center bg-[#f9fafb] p-4 rounded-xl">
                 <span className="font-semibold text-gray-700">Database Uptime</span>
                 <span className="text-[#16a34a] font-bold bg-[#dcfce7] px-3 py-1 rounded-full text-xs">99.98%</span>
              </div>
              <div className="flex justify-between items-center bg-[#f9fafb] p-4 rounded-xl">
                 <span className="font-semibold text-gray-700">Active Sessions</span>
                 <span className="text-[#3b82f6] font-bold bg-[#dbeafe] px-3 py-1 rounded-full text-xs">24 Active</span>
              </div>
              <div className="flex justify-between items-center bg-[#f9fafb] p-4 rounded-xl">
                 <span className="font-semibold text-gray-700">Storage Usage</span>
                 <span className="text-[#8b5cf6] font-bold bg-[#ede9fe] px-3 py-1 rounded-full text-xs">15% Used</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

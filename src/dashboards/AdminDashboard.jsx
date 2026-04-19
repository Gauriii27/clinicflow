import { useEffect, useState } from 'react';
import { Users, UserCog, Calendar, Activity, Database, Server, Settings, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';
import bgImage from '../assets/medical_bg.png';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    systemStatus: 'Active',
  });

  async function fetchStats() {
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
        totalPatients: patientCount || 0,
        totalDoctors: doctorCount || 0,
        totalAppointments: appointmentCount || 0,
        systemStatus: 'Optimal',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="relative min-h-screen font-['Outfit']">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-110 pointer-events-none" 
           style={{ backgroundImage: `url(${bgImage})` }} />
      
      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] right-[5%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[20%] left-[10%] w-64 h-64 rounded-full bg-purple-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full space-y-10 animate-fade-in">
        {/* Greetings Header */}
        <div className="mb-10 mt-2">
          <h1 className="text-[2.6rem] font-bold text-white tracking-tight drop-shadow-md">
            System <span className="text-blue-400">Administration</span>
          </h1>
          <p className="text-teal-50/60 text-[1.1rem] font-medium max-w-2xl mt-1">
            Global system health and platform oversight.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: 'Total Patients', val: stats.totalPatients, icon: Users, color: 'blue' },
            { label: 'Total Doctors', val: stats.totalDoctors, icon: UserCog, color: 'teal' },
            { label: 'Total Visits', val: stats.totalAppointments, icon: Calendar, color: 'purple' },
            { label: 'System Guard', val: stats.systemStatus, icon: ShieldCheck, color: 'orange' },
          ].map((item, idx) => (
            <div key={idx} className="glass-card rounded-[2rem] p-8 border-white/5 hover:bg-white/5 transition-all group overflow-hidden">
               <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl bg-${item.color}-500/20 flex items-center justify-center border border-${item.color}-500/30`}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                  <span className="text-[0.6rem] font-black uppercase tracking-widest text-white/30">Live Data</span>
               </div>
               <p className="text-[2.8rem] font-black text-white leading-none tracking-tighter mb-1">{item.val}</p>
               <p className="text-white/50 text-[0.7rem] font-black uppercase tracking-widest">{item.label}</p>
            </div>
          ))}
        </div>

        {/* System Infrastructure Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-card bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-[2.5rem] p-10 border-white/5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:opacity-20 transition-opacity">
               <Database className="text-white w-40 h-40" strokeWidth={1} />
            </div>
            <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mb-8 backdrop-blur-md border border-white/10">
              <Server className="text-white w-8 h-8" />
            </div>
            <h2 className="text-white text-3xl font-black mb-2 tracking-tight">Platform Core</h2>
            <p className="text-blue-100/60 font-medium text-lg leading-relaxed max-w-sm">All systems operations are nominal. Real-time data synchronization is active with 99.9% health.</p>
          </div>
          
          <div className="glass-card rounded-[2.5rem] p-10 border-white/5">
             <h2 className="text-2xl font-black text-white mb-8 flex items-center gap-3 uppercase tracking-tighter italic">
               <Activity className="text-teal-400" /> Infrastructure Metrics
             </h2>
             <div className="space-y-6">
                {[
                  { label: 'Database Integrity', status: 'Healthy', val: '99.9%', color: 'teal' },
                  { label: 'Active Sessions', status: 'Live', val: '24 Nodes', color: 'blue' },
                  { label: 'Cloud Storage', status: 'Active', val: '15% LOAD', color: 'purple' },
                ].map((m, i) => (
                  <div key={i} className="flex justify-between items-center bg-white/5 p-6 rounded-2xl border border-white/5">
                     <span className="font-bold text-white/70 text-sm tracking-tight">{m.label}</span>
                     <div className="flex items-center gap-4">
                        <span className="text-white font-black text-xs uppercase tracking-widest">{m.val}</span>
                        <span className={`text-${m.color}-400 font-bold bg-${m.color}-500/10 px-4 py-1 rounded-full text-[0.6rem] uppercase tracking-widest border border-${m.color}-500/20`}>{m.status}</span>
                     </div>
                  </div>
                ))}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

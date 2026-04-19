import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, UserPlus, Plus, X, Search, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import bgImage from '../assets/medical_bg.png';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    scheduledAppointments: 0,
  });
  const [todayList, setTodayList] = useState([]);
  const [showVisitsModal, setShowVisitsModal] = useState(false);

  async function fetchStats() {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: todayData, count: todayCount } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name)
        `, { count: 'exact' })
        .gte('appointment_date', today)
        .lt('appointment_date', new Date(Date.now() + 86400000).toISOString().split('T')[0])
        .order('appointment_time', { ascending: true });

      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: scheduledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      setStats({
        todayAppointments: todayCount || 0,
        totalPatients: patientCount || 0,
        scheduledAppointments: scheduledCount || 0,
      });
      setTodayList(todayData || []);
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
        <div className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[10%] left-[-5%] w-72 h-72 rounded-full bg-teal-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full space-y-10 animate-fade-in">
        {/* Greetings Header */}
        <div className="mb-10 mt-2">
          <h1 className="text-[2.6rem] font-bold text-white tracking-tight drop-shadow-md">
            Front Desk <span className="text-teal-300">Operations</span>
          </h1>
          <p className="text-teal-50/60 text-[1.1rem] font-medium max-w-2xl mt-1">
            Manage registrations, schedules, and patient intake.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
          <div 
            onClick={() => setShowVisitsModal(true)}
            className="glass-card rounded-[2rem] p-8 border-white/5 hover:bg-white/5 transition-all group overflow-hidden cursor-pointer"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                <Calendar className="text-teal-300 w-6 h-6" />
              </div>
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-teal-100/50">Today's Intake</p>
            </div>
            <p className="text-[3.5rem] font-black text-white leading-none tracking-tighter mb-1">{stats.todayAppointments}</p>
            <span className="text-teal-300 text-[0.6rem] font-black uppercase tracking-widest bg-teal-500/10 px-3 py-1 rounded-full">Live Queue</span>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border-white/5 hover:bg-white/5 transition-all group overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                <Users className="text-blue-300 w-6 h-6" />
              </div>
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-blue-100/50">Patient Registry</p>
            </div>
            <p className="text-[3.5rem] font-black text-white leading-none tracking-tighter mb-1">{stats.totalPatients}</p>
            <span className="text-blue-400 text-[0.6rem] font-black uppercase tracking-widest bg-blue-500/10 px-3 py-1 rounded-full">Managed</span>
          </div>

          <div className="glass-card rounded-[2rem] p-8 border-white/5 hover:bg-white/5 transition-all group overflow-hidden">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                <Clock className="text-purple-300 w-6 h-6" />
              </div>
              <p className="text-[0.65rem] font-black uppercase tracking-widest text-purple-100/50">Upcoming</p>
            </div>
            <p className="text-[3.5rem] font-black text-white leading-none tracking-tighter mb-1">{stats.scheduledAppointments}</p>
            <span className="text-purple-400 text-[0.6rem] font-black uppercase tracking-widest bg-purple-500/10 px-3 py-1 rounded-full">Scheduled</span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link to="/patients" state={{ openAddModal: true }} className="glass-card rounded-[2.5rem] p-10 border-white/5 hover:bg-white/10 group shadow-2xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
              <UserPlus className="text-white w-8 h-8" strokeWidth={2.5} />
            </div>
            <h2 className="text-white text-3xl font-black mb-2 tracking-tight">Register Member</h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Direct enrollment portal</p>
          </Link>

          <Link to="/appointments" className="glass-card rounded-[2.5rem] p-10 border-white/5 hover:bg-white/10 group shadow-2xl transition-all">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center mb-10 group-hover:scale-110 transition-transform">
              <Plus className="text-white w-8 h-8" strokeWidth={2.5} />
            </div>
            <h2 className="text-white text-3xl font-black mb-2 tracking-tight">Book Visit</h2>
            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Schedule clinical interactions</p>
          </Link>
        </div>

        {/* Visits Modal */}
        {showVisitsModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-fade-in shadow-2xl">
            <div className="glass-card w-full max-w-2xl rounded-[3rem] border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
              <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest">Today's Intake</h2>
                  <p className="text-teal-400 text-[0.6rem] font-black uppercase tracking-widest mt-1 italic">{new Date().toLocaleDateString()}</p>
                </div>
                <button onClick={() => setShowVisitsModal(false)} className="p-3 hover:bg-white/10 rounded-2xl transition-colors"><X className="w-8 h-8 text-white/40" /></button>
              </div>
              
              <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                {todayList.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {todayList.map((visit) => (
                      <div key={visit.id} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group hover:bg-teal-500/10 transition-all">
                        <div>
                          <p className="text-white font-black text-xl tracking-tight mb-1 group-hover:text-teal-300 transition-colors">
                            {visit.patients?.first_name} {visit.patients?.last_name}
                          </p>
                          <div className="flex items-center gap-3 text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em]">
                            <Clock className="w-3 h-3" />
                            <span>{visit.appointment_time?.slice(0, 5)}</span>
                          </div>
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-[0.6rem] font-black uppercase tracking-widest border border-white/5 ${
                          visit.status === 'completed' ? 'bg-teal-500/20 text-teal-300' :
                          visit.status === 'cancelled' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-300'
                        }`}>
                          {visit.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 opacity-20">
                    <Calendar className="w-20 h-20 mx-auto mb-4" strokeWidth={1} />
                    <p className="font-black text-xs uppercase tracking-[0.25em]">No records for today</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceptionistDashboard;

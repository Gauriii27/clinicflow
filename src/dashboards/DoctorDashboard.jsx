import { useEffect, useState } from 'react';
import { Clock, Users, FileText, Plus, X, Calendar, Building, Pill, Search, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    pendingPrescriptions: 0,
    visitedToday: 0
  });
  const [todayList, setTodayList] = useState([]);
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [showQuickAddModal, setShowQuickAddModal] = useState(false);
  const [modalType, setModalType] = useState('waiting'); // 'waiting' or 'completed'
  const [patients, setPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  async function fetchPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, phone')
        .order('first_name');
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }

  async function fetchStats() {
    if (!user) return;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      console.log('Refetching queue for date:', todayStr);

      const { data: allData, error: fetchError } = await supabase
        .from('appointments')
        .select(`
           *,
           patients (first_name, last_name)
        `)
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;
      
      const todayData = (allData || []).filter(app => {
        const appDate = app.appointment_date?.split('T')[0];
        return appDate === todayStr;
      });

      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: prescriptionCount } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true });

      setStats({
        todayAppointments: (todayData || []).filter(v => v.status !== 'completed').length,
        totalPatients: patientCount || 0,
        pendingPrescriptions: prescriptionCount || 0,
        visitedToday: (todayData || []).filter(v => v.status === 'completed').length
      });

      const sortedQueue = (todayData || []).sort((a, b) => {
        if (a.status === 'scheduled' && b.status !== 'scheduled') return -1;
        if (a.status !== 'scheduled' && b.status === 'scheduled') return 1;
        return 0;
      });
      setTodayList(sortedQueue);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  }

  async function addToQueue(patientId) {
    if (!user) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const time = new Date().toTimeString().split(' ')[0].slice(0, 5);

      const { data: insertData, error } = await supabase
        .from('appointments')
        .insert([{
          patient_id: patientId,
          doctor_id: user?.id,
          appointment_date: today,
          appointment_time: time,
          reason: 'Walk-in Visit',
          status: 'scheduled'
        }])
        .select();

      if (error) throw error;
      setShowQuickAddModal(false);
      fetchStats(); 
    } catch (error) {
      console.error('Error adding to queue:', error);
      alert('Failed to add to queue: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!user) return;
    
    fetchStats();
    if (showQuickAddModal) {
      fetchPatients();
    }

    const subscription = supabase
      .channel('appointments_queue')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'appointments' 
      }, () => {
        fetchStats();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, showQuickAddModal]);

  return (
    <div className="relative min-h-screen">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-overlay scale-110 pointer-events-none" 
           style={{ backgroundImage: `url('/src/assets/medical_bg.png')` }} />
      
      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[-5%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[20%] right-[-5%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 w-full space-y-10 animate-fade-in">
      {/* Greetings Header */}
      <div className="mb-8 mt-2 relative">
        <h1 className="text-[2.6rem] font-bold text-white tracking-tight drop-shadow-md">
          Welcome, <span className="text-teal-300">Dr. {user?.full_name?.split(' ')[0] || 'Rajesh'}</span>
        </h1>
        <p className="text-teal-50/80 text-[1.1rem] font-medium max-w-2xl mt-1">
          Your clinical control center. Monitor patient flow and manage visits in real-time.
        </p>
      </div>

      {/* Stats row with Glass Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div 
          onClick={() => { setModalType('waiting'); setShowVisitsModal(true); }}
          className="glass-card rounded-[2rem] p-8 flex flex-col relative justify-between min-h-[160px] cursor-pointer hover:shadow-2xl hover:bg-white/5 border-white/5 hover:border-teal-500/30 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Clock className="w-24 h-24 text-teal-600" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <Users className="w-5 h-5 text-teal-200" />
            </div>
            <p className="text-teal-100/70 text-sm font-bold tracking-widest uppercase">Waiting in Queue</p>
          </div>
          <div className="flex items-end justify-between mt-auto relative z-10">
            <p className="text-[3.5rem] font-black text-white leading-none tracking-tighter">
              {stats.todayAppointments}
            </p>
            <div className="flex flex-col items-end">
              <span className="text-teal-300 text-xs font-bold bg-teal-500/20 px-3 py-1 rounded-full mb-2">Active Wait</span>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-white/30 bg-teal-500 blur-[1px]" />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div 
          onClick={() => { setModalType('completed'); setShowVisitsModal(true); }}
          className="glass-card rounded-[2rem] p-8 flex flex-col relative justify-between min-h-[160px] cursor-pointer hover:shadow-2xl hover:bg-white/5 border-white/5 hover:border-blue-500/30 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-blue-600" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
              <Activity className="w-5 h-5 text-blue-200" />
            </div>
            <p className="text-blue-100/70 text-sm font-bold tracking-widest uppercase">Visited Today</p>
          </div>
          <div className="flex items-end justify-between mt-auto relative z-10">
            <p className="text-[3.5rem] font-black text-white leading-none tracking-tighter">
              {stats.visitedToday}
            </p>
            <span className="text-blue-300 text-xs font-bold bg-blue-500/20 px-3 py-1 rounded-full">Completed</span>
          </div>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { color: 'teal', icon: Plus, title: 'New Patient', desc: 'Register profiles', link: '/doctor/register-patient', label: 'Quick Start' },
          { color: 'blue', icon: FileText, title: 'Medical Records', desc: 'Patient history', link: '/doctor/patient-records', label: 'Search' },
          { color: 'orange', icon: Users, title: 'Add to Queue', desc: 'Daily walk-ins', onClick: () => setShowQuickAddModal(true), label: 'Active' },
          { color: 'purple', icon: Building, title: 'External Shifts', desc: 'Off-site logs', link: '/doctor/external-visits', label: 'Travel' },
        ].map((item, idx) => {
          const CardContent = (
            <div className={`glass-card rounded-[1.8rem] p-7 border-white/5 hover:bg-white/10 group hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 relative overflow-hidden h-full cursor-pointer`}>
              <div className={`absolute -top-10 -right-10 w-32 h-32 bg-${item.color}-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity`} />
              <div className="flex items-center justify-between mb-6">
                <div className={`bg-${item.color}-500/20 w-14 h-14 rounded-2xl flex items-center justify-center border border-${item.color}-500/20 transition-transform group-hover:rotate-6`}>
                  <item.icon className={`text-white w-7 h-7`} strokeWidth={2.5} />
                </div>
                <span className={`text-[0.6rem] font-black uppercase tracking-[0.2em] px-2.5 py-1 rounded-full bg-teal-500/10 text-teal-300`}>
                  {item.label}
                </span>
              </div>
              <h2 className="text-white text-xl font-bold mb-1 tracking-tight">{item.title}</h2>
              <p className="text-white/50 text-[0.85rem] font-medium leading-relaxed">{item.desc}</p>
            </div>
          );
          return item.link ? (
            <Link key={idx} to={item.link}>{CardContent}</Link>
          ) : (
            <div key={idx} onClick={item.onClick}>{CardContent}</div>
          );
        })}
      </div>

      {/* Live Walk-In Queue Section */}
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_8px_rgba(20,184,166,0.8)]" />
            <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-sm opacity-80">Live Patient Queue</h2>
          </div>
          <button 
            onClick={() => fetchStats()}
            className="text-teal-300 text-xs font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            Refresh List
          </button>
        </div>

        <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-8 py-6 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-[0.25em]">Status</th>
                  <th className="px-8 py-6 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-[0.25em]">Patient Name</th>
                  <th className="px-8 py-6 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-[0.25em]">Time</th>
                  <th className="px-8 py-6 text-right text-[0.65rem] font-black text-white/40 uppercase tracking-[0.25em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {todayList.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-4 opacity-20">
                        <Users className="w-16 h-16 text-white" strokeWidth={1} />
                        <p className="text-white font-bold tracking-widest uppercase text-xs">No patients in queue</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  todayList.map((appointment) => (
                    <tr key={appointment.id} className="group hover:bg-white/5 transition-colors">
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[0.6rem] font-black uppercase tracking-widest ${
                          appointment.status === 'scheduled' 
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' 
                            : 'bg-teal-500/20 text-teal-300 border border-teal-500/20'
                        }`}>
                          {appointment.status === 'scheduled' ? 'Waiting' : 'Completed'}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <p className="text-white font-bold text-lg tracking-tight group-hover:text-teal-300 transition-colors">
                          {appointment.patients?.first_name} {appointment.patients?.last_name}
                        </p>
                        <p className="text-white/30 text-xs uppercase tracking-widest font-black">ID: {appointment.patient_id.slice(0,8)}</p>
                      </td>
                      <td className="px-8 py-5 text-white/60 font-mono text-sm">
                        {appointment.appointment_time?.slice(0, 5)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link
                          to={`/prescriptions?patientId=${appointment.patient_id}&appointmentId=${appointment.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-white rounded-xl border border-teal-500/20 transition-all font-black text-[0.65rem] uppercase tracking-widest"
                        >
                          Treat Patient
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Visits Modal */}
      {showVisitsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 transition-all animate-fade-in">
          <div className="glass-card w-full max-w-4xl rounded-[2.5rem] border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.1)] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${modalType === 'waiting' ? 'bg-amber-500' : 'bg-teal-500'} animate-pulse`} />
                <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-sm">
                  {modalType === 'waiting' ? 'Current Waiting List' : 'Today\'s Completed Visits'}
                </h2>
              </div>
              <button 
                onClick={() => setShowVisitsModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 gap-4">
                {todayList.filter(v => modalType === 'waiting' ? v.status === 'scheduled' : v.status === 'completed').length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-white font-bold tracking-widest uppercase text-xs">No records found</p>
                  </div>
                ) : (
                  todayList.filter(v => modalType === 'waiting' ? v.status === 'scheduled' : v.status === 'completed').map((visit) => (
                    <div key={visit.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:bg-white/10 transition-all">
                      <div>
                        <p className="text-white font-black text-xl tracking-tight mb-1">
                          {visit.patients?.first_name} {visit.patients?.last_name}
                        </p>
                        <div className="flex gap-4 text-xs font-black text-white/40 uppercase tracking-widest">
                          <span>{visit.appointment_time?.slice(0, 5)}</span>
                          <span>{visit.reason}</span>
                        </div>
                      </div>
                      <Link
                        to={`/prescriptions?patientId=${visit.patient_id}&appointmentId=${visit.id}`}
                        onClick={() => setShowVisitsModal(false)}
                        className="px-6 py-3 bg-white/5 hover:bg-teal-500 text-white rounded-xl border border-white/10 transition-all font-black text-[0.6rem] uppercase tracking-widest"
                      >
                        {modalType === 'waiting' ? 'Treat Now' : 'View Summary'}
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add To Queue Modal */}
      {showQuickAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-fade-in">
          <div className="glass-card w-full max-w-2xl rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <Plus className="w-5 h-5 text-teal-400" />
                <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-sm">Add Patient to Queue</h2>
              </div>
              <button onClick={() => setShowQuickAddModal(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors group">
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
              </button>
            </div>
            
            <div className="p-8">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  type="text"
                  placeholder="SEARCH REGISTERED PATIENTS..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-white/40 font-black text-xs uppercase tracking-widest focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"
                />
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[40vh] pr-2 custom-scrollbar">
                {patients.filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 ? (
                  <div className="text-center py-10 opacity-30">
                    <p className="text-white text-xs font-black uppercase tracking-widest">No matching patients</p>
                    <Link to="/doctor/register-patient" className="text-teal-400 underline mt-2 block">Register New Patient</Link>
                  </div>
                ) : (
                  patients
                    .filter(p => `${p.first_name} ${p.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(patient => (
                      <div 
                        key={patient.id} 
                        className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between hover:bg-white/10 hover:border-teal-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500/20 to-blue-500/20 flex items-center justify-center border border-white/5 overflow-hidden">
                            <span className="text-white font-black text-lg">{patient.first_name[0]}</span>
                          </div>
                          <div>
                            <p className="text-white font-black text-lg tracking-tight group-hover:text-teal-300 transition-colors">
                              {patient.first_name} {patient.last_name}
                            </p>
                            <p className="text-white/30 text-[0.65rem] font-bold uppercase tracking-widest">{patient.phone}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => addToQueue(patient.id)}
                          disabled={loading}
                          className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-white rounded-xl transition-all font-black text-[0.65rem] uppercase tracking-widest disabled:opacity-50"
                        >
                          {loading ? 'Adding...' : 'Add to Queue'}
                        </button>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default DoctorDashboard;

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Building, Calendar, Clock, Plus, Trash2, ArrowLeft, Hospital, CheckCircle2, XCircle, Bell, BellOff, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import bgImage from '../assets/medical_bg.png';

const ExternalVisits = () => {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  
  // Form State
  const [hospitalName, setHospitalName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [activeReminder, setActiveReminder] = useState(null);

  useEffect(() => {
    fetchVisits();
  }, [user]);

  // Simulated Reminder Engine
  useEffect(() => {
    if (visits.length === 0) return;

    const checkReminders = () => {
      const now = new Date();
      const upcoming = visits.find(v => {
        if (v.status === 'completed' || !v.reminder_enabled) return false;
        
        const visitDate = new Date(v.visit_date);
        const [hours, minutes] = v.start_time.split(':');
        visitDate.setHours(parseInt(hours), parseInt(minutes), 0);
        
        const diff = visitDate.getTime() - now.getTime();
        return diff > 0 && diff < 30 * 60 * 1000; // Within 30 minutes
      });

      if (upcoming) {
        setActiveReminder(upcoming);
      }
    };

    const interval = setInterval(checkReminders, 60000);
    checkReminders();
    return () => clearInterval(interval);
  }, [visits]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('external_visits')
        .select('*')
        .eq('doctor_id', user?.id)
        .order('visit_date', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          console.warn('external_visits table does not exist yet.');
        } else {
          console.error('Error fetching external visits:', error);
        }
      }
      setVisits(data || []);
    } catch (error) {
      console.error('Error loading external visits:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVisit = async (e) => {
    e.preventDefault();
    try {
      setAdding(true);
      const { data, error } = await supabase
        .from('external_visits')
        .insert([{
          doctor_id: user.id,
          hospital_name: hospitalName,
          visit_date: visitDate,
          start_time: startTime,
          end_time: endTime,
          notes: notes,
          status: 'scheduled',
          reminder_enabled: reminderEnabled
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setVisits([data[0], ...visits]);
        setHospitalName('');
        setVisitDate('');
        setStartTime('');
        setEndTime('');
        setNotes('');
        setReminderEnabled(true);
      }
    } catch (error) {
      console.error('Error creating external visit:', error);
      alert('Failed to save visit!');
    } finally {
      setAdding(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('external_visits')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      setVisits(visits.map(v => v.id === id ? { ...v, status: newStatus } : v));
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleToggleReminder = async (id, currentState) => {
    try {
      const { error } = await supabase
        .from('external_visits')
        .update({ reminder_enabled: !currentState })
        .eq('id', id);

      if (error) throw error;
      setVisits(visits.map(v => v.id === id ? { ...v, reminder_enabled: !currentState } : v));
    } catch (error) {
      console.error('Error toggling reminder:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this visit?')) return;
    try {
      const { error } = await supabase.from('external_visits').delete().eq('id', id);
      if (error) throw error;
      setVisits(visits.filter(v => v.id !== id));
    } catch (error) {
      console.error('Error deleting visit:', error);
    }
  };

  const getRenderState = () => {
    if (loading) {
       return (
         <div className="p-10 text-center">
           <div className="w-10 h-10 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
           <p className="text-white/40 font-black text-xs uppercase tracking-widest">Accessing schedule...</p>
         </div>
       );
    }
    if (visits.length === 0) {
       return (
         <div className="glass-card rounded-[2.5rem] border-white/5 p-16 text-center shadow-2xl">
            <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 border border-white/5 group">
              <Building className="w-10 h-10 text-white/20 group-hover:text-teal-400 transition-colors" />
            </div>
            <h3 className="text-2xl font-black text-white mb-2 tracking-tight">No External Logs</h3>
            <p className="text-white/30 text-sm font-black uppercase tracking-widest">Your hospital shift register is currently clear</p>
         </div>
       );
    }

    return (
       <div className="space-y-6">
         {visits.map(visit => (
           <div key={visit.id} className="glass-card rounded-[2.2rem] border-white/5 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/5 transition-all group">
             <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-teal-500/10 rounded-xl border border-teal-500/20">
                    <Hospital className="w-6 h-6 text-teal-300" />
                  </div>
                  <h3 className="text-2xl font-black text-white italic tracking-tight">
                    {visit.hospital_name}
                  </h3>
                </div>
                
                <div className="flex flex-wrap items-center gap-5">
                   <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                     <Calendar className="w-4 h-4 text-teal-400/60" />
                     <span className="text-xs font-black text-white/70 uppercase tracking-widest">
                       {new Date(visit.visit_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                     </span>
                   </div>
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/5">
                      <Clock className="w-4 h-4 text-blue-400/60" />
                      <span className="text-xs font-black text-white/70 uppercase tracking-widest">
                        {visit.start_time.slice(0,5)} — {visit.end_time.slice(0,5)}
                      </span>
                    </div>
                    
                    {/* Status Pill */}
                    <div className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border ${
                      visit.status === 'completed' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' :
                      visit.status === 'missed' ? 'bg-red-500/10 border-red-500/30 text-red-300' :
                      'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}>
                      <span className="text-[0.6rem] font-black uppercase tracking-widest">
                        {visit.status || 'scheduled'}
                      </span>
                    </div>

                    {/* Reminder Status */}
                    <button 
                      onClick={() => handleToggleReminder(visit.id, visit.reminder_enabled)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all ${
                        visit.reminder_enabled ? 'bg-blue-500/10 border-blue-500/30 text-blue-300' : 'bg-white/5 border-white/5 text-white/20'
                      }`}
                    >
                      {visit.reminder_enabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />}
                      <span className="text-[0.6rem] font-black uppercase tracking-widest">{visit.reminder_enabled ? 'Active' : 'Silent'}</span>
                    </button>
                 </div>
                
                {visit.notes && (
                  <div className="mt-6 p-5 bg-white/5 rounded-[1.5rem] border border-white/5 relative group-hover:bg-white/10 transition-colors">
                    <p className="text-sm text-teal-50/40 font-medium leading-relaxed italic">"{visit.notes}"</p>
                  </div>
                )}
             </div>
              <div className="flex flex-col gap-2">
                 <div className="flex items-center gap-2">
                   <button 
                     onClick={() => handleUpdateStatus(visit.id, 'completed')}
                     className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all border ${
                       visit.status === 'completed' ? 'bg-teal-500 text-white border-teal-500' : 'bg-white/5 text-white/20 border-white/5 hover:bg-teal-500/20 hover:text-teal-400'
                     }`}
                     title="Mark as Done"
                   >
                     <CheckCircle2 className="w-5 h-5" />
                   </button>
                   <button 
                     onClick={() => handleUpdateStatus(visit.id, 'missed')}
                     className={`w-12 h-12 flex items-center justify-center rounded-xl transition-all border ${
                       visit.status === 'missed' ? 'bg-red-500 text-white border-red-500' : 'bg-white/5 text-white/20 border-white/5 hover:bg-red-500/20 hover:text-red-400'
                     }`}
                     title="Mark as Missed"
                   >
                     <XCircle className="w-5 h-5" />
                   </button>
                 </div>
                 <button 
                   onClick={() => handleDelete(visit.id)}
                   className="w-full h-10 flex items-center justify-center bg-white/5 text-white/10 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all border border-white/5 active:scale-95"
                   title="Delete Entry"
                 >
                   <Trash2 className="w-4 h-4" />
                 </button>
              </div>
           </div>
         ))}
       </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900 animate-fade-in">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[10%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 w-full max-w-6xl mx-auto py-10 px-6 space-y-12">
          {/* Active Reminder Alert */}
          {activeReminder && (
            <div className="bg-gradient-to-r from-blue-600 to-teal-600 p-6 rounded-[2rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 border border-white/20 animate-bounce-subtle">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                   <Bell className="w-7 h-7 text-white animate-ring" />
                </div>
                <div>
                   <p className="text-white/70 text-[0.6rem] font-black uppercase tracking-widest mb-1">Upcoming External Shift</p>
                   <h3 className="text-white text-xl font-black italic tracking-tight">{activeReminder.hospital_name}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right hidden md:block">
                   <p className="text-white/60 text-[0.55rem] font-black uppercase tracking-widest">Time Slot</p>
                   <p className="text-white font-black">{activeReminder.start_time.slice(0, 5)} — {activeReminder.end_time.slice(0, 5)}</p>
                 </div>
                 <button 
                   onClick={() => setActiveReminder(null)}
                   className="px-6 py-3 bg-white text-blue-600 rounded-xl font-black text-[0.6rem] uppercase tracking-widest hover:bg-blue-50 transition-colors shadow-lg"
                 >
                   Dismiss Alert
                 </button>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link to="/dashboard" className="inline-flex items-center text-teal-400 font-black text-xs uppercase tracking-[0.2em] hover:text-teal-300 transition-colors mb-3 group">
                <ArrowLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
                Clinic Dashboard
              </Link>
              <h1 className="text-[2.5rem] font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
                <Building className="w-10 h-10 text-teal-300" />
                External Registry
              </h1>
              <p className="text-teal-50/60 font-medium text-lg mt-1 ml-1 font-black uppercase tracking-widest text-[0.7rem] opacity-50">
                Hospital Network & External Shift Records
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
             {/* Form Section */}
             <div className="lg:col-span-1">
                <div className="glass-card rounded-[3rem] p-10 border-white/10 shadow-2xl sticky top-28">
                   <h2 className="text-2xl font-black text-white mb-10 italic tracking-tight flex items-center gap-4">
                     <div className="p-2 bg-teal-500/20 rounded-xl">
                       <Plus className="w-5 h-5 text-teal-300" strokeWidth={3} />
                     </div>
                     Log Shift
                   </h2>
                   <form onSubmit={handleCreateVisit} className="space-y-8">
                     <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Hospital Name</label>
                       <input
                         type="text"
                         required
                         value={hospitalName}
                         onChange={(e) => setHospitalName(e.target.value)}
                         className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium"
                         placeholder="e.g. Metro Care"
                       />
                     </div>
                     
                     <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Appointed Date</label>
                       <input
                         type="date"
                         required
                         value={visitDate}
                         onChange={(e) => setVisitDate(e.target.value)}
                         className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium appearance-none"
                       />
                     </div>

                     <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                         <label className="text-[0.55rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-1">Start</label>
                         <input
                           type="time"
                           required
                           value={startTime}
                           onChange={(e) => setStartTime(e.target.value)}
                           className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium appearance-none"
                         />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[0.55rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-1">End</label>
                         <input
                           type="time"
                           required
                           value={endTime}
                           onChange={(e) => setEndTime(e.target.value)}
                           className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium appearance-none"
                         />
                       </div>
                     </div>

                      <div className="space-y-2">
                        <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Internal Notes</label>
                        <textarea
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows="2"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium resize-none"
                          placeholder="Department or task..."
                        ></textarea>
                      </div>

                      <div className="flex items-center justify-between bg-white/5 p-5 rounded-2xl border border-white/5">
                        <div className="flex items-center gap-3">
                           <Bell className={`w-5 h-5 ${reminderEnabled ? 'text-teal-400' : 'text-white/20'}`} />
                           <div>
                             <p className="text-white text-[0.7rem] font-black uppercase tracking-widest">Reminders</p>
                             <p className="text-white/30 text-[0.5rem] font-bold uppercase tracking-widest">Notify 30m before shift</p>
                           </div>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setReminderEnabled(!reminderEnabled)}
                          className={`w-12 h-6 rounded-full relative transition-all duration-300 ${reminderEnabled ? 'bg-teal-500' : 'bg-white/10'}`}
                        >
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 ${reminderEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                      </div>

                     <button
                       type="submit"
                       disabled={adding}
                       className="w-full py-5 px-4 bg-teal-500 hover:bg-teal-400 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                     >
                       {adding ? 'Archiving...' : 'Confirm Entry'}
                     </button>
                   </form>
                </div>
             </div>

             {/* Log List Section */}
             <div className="lg:col-span-2">
                <h2 className="text-sm font-black text-white/20 uppercase tracking-[0.4em] mb-8 italic border-b border-white/5 pb-4">
                  Archive Timeline
                </h2>
                {getRenderState()}
             </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ExternalVisits;

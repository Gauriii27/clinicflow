import { useEffect, useState } from 'react';
import { Users, Clock, Activity, Plus, FileText, Building, X, Search, Pill, Calendar, Info, MapPin, Phone, Code, Cpu, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

const DoctorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalPatients: 0,
    pendingPrescriptions: 0,
    visitedToday: 0
  });
  const [showVisitsModal, setShowVisitsModal] = useState(false);
  const [completedVisits, setCompletedVisits] = useState([]);

  async function fetchStats() {
    if (!user) return;
    try {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;
      
      const { data: rawAppointments, error: fetchError } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_time', { ascending: true });

      if (fetchError) throw fetchError;

      const todayCompleted = (rawAppointments || []).filter(app => {
        const appDate = app.appointment_date?.split('T')[0];
        return appDate === todayStr && app.status === 'completed';
      });

      const patientIds = [...new Set(todayCompleted.map(a => a.patient_id))].filter(Boolean);

      let patientsMap = {};
      if (patientIds.length > 0) {
        const { data: patientsData, error: patientsError } = await supabase
          .from('patients')
          .select('id, first_name, last_name')
          .in('id', patientIds);
          
        if (!patientsError && patientsData) {
          patientsData.forEach(p => { patientsMap[p.id] = p; });
        }
      }

      const finalCompletedData = todayCompleted.map(app => ({
        ...app,
        patients: patientsMap[app.patient_id] || { first_name: 'Unknown', last_name: 'Patient' }
      }));
      setCompletedVisits(finalCompletedData);

      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: prescriptionCount } = await supabase
        .from('prescriptions')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPatients: patientCount || 0,
        pendingPrescriptions: prescriptionCount || 0,
        visitedToday: finalCompletedData.length
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      alert('DATABASE ERROR IN DASHBOARD: ' + (error.message || JSON.stringify(error)));
    }
  }

  useEffect(() => {
    if (!user) return;
    fetchStats();
  }, [user]);

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
          className="glass-card rounded-[2rem] p-8 flex flex-col relative justify-between min-h-[160px] border-white/5 hover:border-teal-500/30 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-teal-600" strokeWidth={1} />
          </div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
              <Users className="w-5 h-5 text-teal-200" />
            </div>
            <p className="text-teal-100/70 text-sm font-bold tracking-widest uppercase">Total Registered Patients</p>
          </div>
          <div className="flex items-end justify-start mt-auto relative z-10">
            <p className="text-[3.5rem] font-black text-white leading-none tracking-tighter">
              {stats.totalPatients}
            </p>
          </div>
        </div>

        <div 
          onClick={() => setShowVisitsModal(true) }
          className="glass-card rounded-[2rem] p-8 flex flex-col relative justify-between min-h-[160px] cursor-pointer hover:shadow-2xl hover:bg-white/5 border-white/5 hover:border-blue-500/30 transition-all duration-300 group overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Activity className="w-24 h-24 text-blue-600" strokeWidth={1} />
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
          { color: 'amber', icon: Pill, title: 'Prescription Vault', desc: 'Archives & issuance', link: '/prescriptions', label: 'Pharmacy' },
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

      {/* Informational & Utility Modules */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-10">
        
        {/* About The Developer */}
        <div className="lg:col-span-2 glass-card rounded-[2.5rem] p-8 md:p-10 border-white/5 relative overflow-hidden group hover:bg-white/5 transition-all duration-500 hover:border-teal-500/20">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <Code className="w-48 h-48 text-teal-400" strokeWidth={0.5} />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-5 mb-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-[0_0_30px_rgba(20,184,166,0.3)]">
                <Cpu className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-[1.8rem] leading-none font-black text-white tracking-tight mb-2">About The Developer</h2>
                <p className="text-teal-300 text-[0.65rem] uppercase tracking-[0.2em] font-black">System Administration & Architecture</p>
              </div>
            </div>
            
            <p className="text-white/60 leading-relaxed font-medium mb-10 max-w-2xl text-sm">
              ClinicFlow is a proprietary clinic management system engineered to revolutionize the way healthcare professionals operate. Designed with modern web architectures, it focuses on high-performance, real-time synchronization, and premium user experiences.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-colors md:col-span-2">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                  <User className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <p className="text-white/40 text-[0.6rem] uppercase tracking-[0.15em] font-black mb-1">Development Core Team</p>
                  <p className="text-white text-xs font-bold">Gauri Kautkar, Shubham Kumbhar, Mrunmayi Channe, Anjali Vishwakarma</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <Mail className="w-5 h-5 text-blue-300" />
                </div>
                <div>
                  <p className="text-white/40 text-[0.6rem] uppercase tracking-[0.15em] font-black mb-1">Admin Email</p>
                  <p className="text-white text-xs font-bold">gaurikautkar27@gmail.com</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 hover:bg-white/10 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                  <Phone className="w-5 h-5 text-teal-300" />
                </div>
                <div>
                  <p className="text-white/40 text-[0.6rem] uppercase tracking-[0.15em] font-black mb-1">Contact Support</p>
                  <p className="text-white text-xs font-bold">9326373843</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Doctor's Daily Notepad */}
        <div className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden flex flex-col group hover:bg-white/5 transition-all duration-500 hover:border-amber-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-black tracking-tight text-lg">Daily Memo</h3>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)] group-hover:scale-110 transition-transform">
              <Plus className="w-4 h-4 text-amber-300" />
            </div>
          </div>
          <textarea 
            placeholder="Jot down quick reminders or follow-ups for today..."
            className="w-full flex-1 bg-transparent border-none text-white/80 placeholder:text-white/20 resize-none flex-grow focus:outline-none custom-scrollbar text-sm leading-[1.8] font-medium"
            defaultValue="1. Follow up with Ram's test reports at 4:00 PM.&#10;&#10;2. Check pharmacy inventory for Paracetamol & Azithromycin.&#10;&#10;3. Review Dr. Shah's referral notes for the new walk-in patient."
          />
        </div>
      </div>

      {/* Visits Modal */}
      {showVisitsModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 transition-all animate-fade-in">
          <div className="glass-card w-full max-w-4xl rounded-[2.5rem] border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.1)] overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full bg-blue-500 animate-pulse`} />
                <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-sm">
                  Today's Completed Visits
                </h2>
              </div>
              <button 
                onClick={() => setShowVisitsModal(false)}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
              <div className="grid grid-cols-1 gap-4">
                {completedVisits.length === 0 ? (
                  <div className="py-20 text-center opacity-30">
                    <p className="text-white font-bold tracking-widest uppercase text-xs">No records found</p>
                  </div>
                ) : (
                  completedVisits.map((visit) => (
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
                        className="px-6 py-3 bg-white/5 hover:bg-blue-500 text-white rounded-xl border border-white/10 transition-all font-black text-[0.6rem] uppercase tracking-widest"
                      >
                        View Summary
                      </Link>
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

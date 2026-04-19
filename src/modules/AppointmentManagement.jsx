import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, CreditCard as Edit, Trash2, X, Calendar, Clock, User, ChevronRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import bgImage from '../assets/medical_bg.png';

const AppointmentManagement = () => {
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    appointment_date: '',
    appointment_time: '',
    reason: '',
    status: 'scheduled',
  });

  useEffect(() => {
    fetchAppointments();
    fetchPatients();
    fetchDoctors();
  }, []);

  useEffect(() => {
    const filtered = appointments.filter(
      (appointment) =>
        appointment.patients?.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.patients?.last_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        appointment.users?.full_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [searchTerm, appointments]);

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          patients (first_name, last_name),
          users!appointments_doctor_id_fkey (full_name)
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) throw error;
      setAppointments(data || []);
      setFilteredAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    }
  };

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, full_name')
        .eq('role', 'doctor')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAppointment) {
        const { error } = await supabase
          .from('appointments')
          .update(formData)
          .eq('id', editingAppointment.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from('appointments').insert([formData]);

        if (error) throw error;
      }

      fetchAppointments();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving appointment:', error);
      alert('Failed to save appointment');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      patient_id: appointment.patient_id,
      doctor_id: appointment.doctor_id,
      appointment_date: appointment.appointment_date,
      appointment_time: appointment.appointment_time,
      reason: appointment.reason,
      status: appointment.status,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchAppointments();
    } catch (error) {
      console.error('Error deleting appointment:', error);
      alert('Failed to delete appointment');
    }
  };

  const resetForm = () => {
    setFormData({
      patient_id: '',
      doctor_id: '',
      appointment_date: '',
      appointment_time: '',
      reason: '',
      status: 'scheduled',
    });
    setEditingAppointment(null);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'completed':
        return 'bg-teal-500/20 text-teal-300 border-teal-500/30';
      case 'cancelled':
        return 'bg-red-500/20 text-red-300 border-red-500/30';
      default:
        return 'bg-white/10 text-white/40 border-white/10';
    }
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
        <div className="absolute top-[10%] left-[5%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[10%] right-[5%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
            <div>
              <h1 className="text-[2.5rem] font-black text-white tracking-tight drop-shadow-md flex items-center gap-4 italic">
                <Calendar className="w-10 h-10 text-teal-300" />
                Scheduling Registry
              </h1>
              <p className="text-teal-50/40 font-black text-xs uppercase tracking-[0.3em] mt-1 ml-1">
                Clinical appointment sequence management
              </p>
            </div>
            
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-teal-500 text-white rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" strokeWidth={3} />
              Book Encounter
            </button>
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/5 shadow-2xl p-6 relative overflow-hidden">
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-center px-4 pt-4">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 w-6 h-6 transition-colors" />
                <input
                  type="text"
                  placeholder="Filter by member or physician..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold text-lg placeholder:text-white/10"
                />
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar px-2 pb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-40">Member</th>
                    <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-40">Physician</th>
                    <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-40">Timeline</th>
                    <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-40">Status</th>
                    <th className="px-6 py-6 text-right text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-40">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredAppointments.length > 0 ? (
                    filteredAppointments.map((appointment) => (
                      <tr key={appointment.id} className="group hover:bg-white/5 transition-all">
                        <td className="px-6 py-7">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-teal-400/10 flex items-center justify-center font-black text-teal-300 text-sm border border-teal-400/20">
                              {appointment.patients?.first_name?.charAt(0)}
                            </div>
                            <div className="text-lg font-bold text-white tracking-tight">
                              {appointment.patients?.first_name} {appointment.patients?.last_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-7">
                          <div className="flex items-center gap-2">
                             <div className="w-2 h-2 rounded-full bg-blue-500/50" />
                             <span className="text-white/60 font-bold transition-colors group-hover:text-blue-300">Dr. {appointment.users?.full_name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-7">
                          <div className="space-y-1">
                             <div className="text-sm font-black text-white/90 flex items-center gap-2">
                               <Calendar className="w-3.5 h-3.5 text-teal-400" />
                               {new Date(appointment.appointment_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                             </div>
                             <div className="text-[0.65rem] font-black text-white/30 uppercase tracking-widest flex items-center gap-2">
                               <Clock className="w-3.5 h-3.5" />
                               {appointment.appointment_time}
                             </div>
                          </div>
                        </td>
                        <td className="px-6 py-7">
                          <span
                            className={`px-4 py-1.5 text-[0.6rem] font-black uppercase tracking-widest rounded-full border ${getStatusStyle(
                              appointment.status
                            )}`}
                          >
                            {appointment.status}
                          </span>
                        </td>
                        <td className="px-6 py-7 text-right">
                          <div className="flex items-center justify-end gap-3 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                            <button
                              onClick={() => handleEdit(appointment)}
                              className="p-3 bg-white/5 hover:bg-blue-500/20 text-white/40 hover:text-blue-400 rounded-xl transition-all border border-white/10"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDelete(appointment.id)}
                              className="p-3 bg-white/5 hover:bg-red-500/20 text-white/40 hover:text-red-400 rounded-xl transition-all border border-white/10"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-32 text-center">
                        <div className="flex flex-col items-center justify-center opacity-30">
                           <Search className="w-16 h-16 text-white mb-4" />
                           <p className="text-white font-black text-xs uppercase tracking-[0.3em]">No registry matches found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showModal && (
            <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-fade-in">
              <div className="glass-modal rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border-white/10">
                <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between sticky top-0 z-10">
                  <div>
                    <h2 className="text-2xl font-black text-white tracking-tight italic">
                      {editingAppointment ? 'Modify Sequence' : 'New Assignment'}
                    </h2>
                    <p className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest mt-1">Book clinical encounter session</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10"
                  >
                    <X className="w-6 h-6 text-white/30" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Member Selection</label>
                      <select
                        required
                        value={formData.patient_id}
                        onChange={(e) =>
                          setFormData({ ...formData, patient_id: e.target.value })
                        }
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      >
                        <option value="" className="bg-slate-900">Select Member</option>
                        {patients.map((patient) => (
                          <option key={patient.id} value={patient.id} className="bg-slate-900 text-white">
                            {patient.first_name} {patient.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Assigned Physician</label>
                      <select
                        required
                        value={formData.doctor_id}
                        onChange={(e) =>
                          setFormData({ ...formData, doctor_id: e.target.value })
                        }
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      >
                        <option value="" className="bg-slate-900">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.id} value={doctor.id} className="bg-slate-900 text-white">
                            Dr. {doctor.full_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Assignment Date</label>
                      <input
                        type="date"
                        required
                        value={formData.appointment_date}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            appointment_date: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Time Slot</label>
                      <input
                        type="time"
                        required
                        value={formData.appointment_time}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            appointment_time: e.target.value,
                          })
                        }
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Primary Symptom / Reason</label>
                    <textarea
                      required
                      value={formData.reason}
                      onChange={(e) =>
                        setFormData({ ...formData, reason: e.target.value })
                      }
                      rows="3"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium resize-none placeholder:text-white/10"
                      placeholder="Specify session objective..."
                    />
                  </div>

                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Deployment Status</label>
                    <select
                      required
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                    >
                      <option value="scheduled" className="bg-slate-900">Scheduled</option>
                      <option value="completed" className="bg-slate-900">Completed</option>
                      <option value="cancelled" className="bg-slate-900">Cancelled</option>
                    </select>
                  </div>

                  <div className="flex gap-4 pt-8 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-teal-500 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                    >
                      {loading
                        ? 'Executing...'
                        : editingAppointment
                        ? 'Confirm Revision'
                        : 'Secure Booking'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="px-10 py-5 bg-white/5 border border-white/10 text-white/30 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AppointmentManagement;

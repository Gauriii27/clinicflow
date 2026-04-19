import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Plus, CreditCard as Edit, Trash2, X, User, Mail, Phone, MapPin, Calendar, Activity, ChevronRight, Hash, Hospital } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import bgImage from '../assets/medical_bg.png';

const PatientManagement = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    date_of_birth: '',
    gender: 'male',
    phone: '',
    email: '',
    address: '',
    blood_group: '',
    emergency_contact: '',
    symptoms: '',
    diagnosis: '',
    medical_history: '',
    additional_notes: '',
  });

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = patients.filter(
      (patient) =>
        patient.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm) ||
        patient.id?.toString().includes(searchTerm)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      resetForm();
      setShowModal(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, navigate, location.pathname]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingPatient) {
        const { error } = await supabase
          .from('patients')
          .update({
             first_name: formData.first_name,
             last_name: formData.last_name,
             date_of_birth: formData.date_of_birth,
             gender: formData.gender,
             phone: formData.phone,
             email: formData.email,
             address: formData.address,
             blood_group: formData.blood_group,
             emergency_contact: formData.emergency_contact
          })
          .eq('id', editingPatient.id);

        if (error) throw error;
      } else {
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .insert([{
             first_name: formData.first_name,
             last_name: formData.last_name,
             date_of_birth: formData.date_of_birth,
             gender: formData.gender,
             phone: formData.phone,
             email: formData.email,
             address: formData.address,
             blood_group: formData.blood_group,
             emergency_contact: formData.emergency_contact
          }])
          .select()
          .single();

        if (patientError) throw patientError;

        if (formData.symptoms || formData.diagnosis || formData.medical_history || formData.additional_notes) {
           const notes = `Medical History: ${formData.medical_history || 'N/A'}\n\nAdditional Notes: ${formData.additional_notes || 'None'}`;
           const { error: recordError } = await supabase
             .from('medical_records')
             .insert([{
               patient_id: patientData.id,
               visit_date: new Date().toISOString().split('T')[0],
               symptoms: formData.symptoms || 'N/A',
               diagnosis: formData.diagnosis || 'Pending Eval',
               notes: notes,
             }]);
             
           if (recordError) throw recordError;
        }
      }

      fetchPatients();
      resetForm();
      setShowModal(false);
    } catch (error) {
      console.error('Error saving patient:', error);
      alert('Failed to save patient: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setFormData(patient);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this patient?')) return;

    try {
      const { error } = await supabase.from('patients').delete().eq('id', id);

      if (error) throw error;
      fetchPatients();
    } catch (error) {
      console.error('Error deleting patient:', error);
      alert('Failed to delete patient');
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      date_of_birth: '',
      gender: 'male',
      phone: '',
      email: '',
      address: '',
      blood_group: '',
      emergency_contact: '',
      symptoms: '',
      diagnosis: '',
      medical_history: '',
      additional_notes: '',
    });
    setEditingPatient(null);
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900 animate-fade-in font-outfit">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[5%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[10%] left-[10%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-6 space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-4">
            <div>
              <h1 className="text-[2.5rem] font-black text-white tracking-tight drop-shadow-md flex items-center gap-4 italic">
                <User className="w-10 h-10 text-teal-300" />
                Member Registry
              </h1>
              <p className="text-teal-50/40 font-black text-xs uppercase tracking-[0.3em] mt-1 ml-1">
                Centralized patient intelligence & health records
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
              Onboard Patient
            </button>
          </div>

          <div className="glass-card rounded-[2.5rem] border-white/5 p-8 relative overflow-hidden shadow-2xl">
            <div className="relative z-10 space-y-8">
              <div className="relative group max-w-2xl pt-2 px-2">
                <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 w-6 h-6 transition-colors" />
                <input
                  type="text"
                  placeholder="Identify by name, phone sequence, or ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-16 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold text-lg placeholder:text-white/40"
                />
              </div>

              <div className="overflow-x-auto custom-scrollbar px-2">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-80">Ident</th>
                      <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-80">Member Anatomy</th>
                      <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-80">Communication</th>
                      <th className="px-6 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-80">Demographics</th>
                      <th className="px-6 py-6 text-right text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] opacity-80">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((patient) => (
                        <tr key={patient.id} className="group hover:bg-white/5 transition-all">
                          <td className="px-6 py-7">
                            <span className="text-white/20 font-black text-xs tracking-widest flex items-center gap-1 group-hover:text-teal-400 Transition-colors">
                              <Hash className="w-3 h-3" />
                              {patient.id.toString().slice(-6)}
                            </span>
                          </td>
                          <td className="px-6 py-7 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                                <User className="w-6 h-6 text-teal-300" />
                              </div>
                              <div>
                                <div className="text-lg font-black text-white tracking-tight italic">
                                  {patient.first_name} {patient.last_name}
                                </div>
                                <div className="text-[0.65rem] font-black text-white/30 uppercase tracking-widest mt-0.5">
                                  Member since {new Date(patient.created_at).getFullYear()}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-7">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 text-sm font-bold text-white/70">
                                <Phone className="w-3.5 h-3.5 text-blue-400" />
                                {patient.phone}
                              </div>
                              <div className="flex items-center gap-2 text-[0.65rem] font-black text-white/30 truncate max-w-[150px]">
                                <Mail className="w-3.5 h-3.5" />
                                {patient.email || 'NO_ALIAS'}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-7">
                            <div className="flex flex-wrap gap-2">
                               <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[0.65rem] font-black text-white/40 uppercase tracking-widest capitalize">
                                 {patient.gender}
                               </span>
                               <span className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/10 text-[0.65rem] font-black text-red-300 uppercase tracking-widest">
                                 {patient.blood_group || '??'}
                               </span>
                            </div>
                          </td>
                          <td className="px-6 py-7 text-right">
                            <div className="flex items-center justify-end gap-3 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                              <button
                                onClick={() => handleEdit(patient)}
                                title="Modify Profile"
                                className="p-3 bg-white/5 text-white/40 hover:text-blue-400 hover:bg-blue-500/10 rounded-xl transition-all border border-white/5 active:scale-90"
                              >
                                <Edit className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleDelete(patient.id)}
                                title="Remove Subject"
                                className="p-3 bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all border border-white/5 active:scale-90"
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
                            <p className="text-white font-black text-xs uppercase tracking-[0.3em]">Registry empty | Query zero</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center z-[130] p-4 animate-fade-in">
          <div className="glass-modal rounded-[3.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border-white/10 italic-headers">
            <div className="p-10 border-b border-white/10 bg-white/5 flex items-center justify-between sticky top-0 z-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center border border-teal-500/20">
                   <Activity className="w-8 h-8 text-teal-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white tracking-tight italic">
                    {editingPatient ? 'Subject Modification' : 'Member Manifest'}
                  </h2>
                  <p className="text-[0.65rem] font-black text-teal-400 uppercase tracking-[0.2em] mt-1 opacity-70">
                    Clinical demographic onboarding session
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-colors"
              >
                <X className="w-7 h-7 text-white/30" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-10 space-y-12 overflow-y-auto flex-1 custom-scrollbar">
              <div className="space-y-8">
                <div className="flex items-center gap-3 px-2 border-l-4 border-teal-500/40">
                   <span className="text-[0.7rem] font-black text-white/30 uppercase tracking-[0.4em]">Primary Identity</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest ml-2">Given Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      placeholder="First"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest ml-2">Family Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      placeholder="Last"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest ml-2">Genesis Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest ml-2">Genetic Markers *</label>
                    <select
                      required
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold"
                    >
                      <option value="male" className="bg-slate-900">Male</option>
                      <option value="female" className="bg-slate-900">Female</option>
                      <option value="other" className="bg-slate-900">Other / Spectrum</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="flex items-center gap-3 px-2 border-l-4 border-blue-500/40">
                   <span className="text-[0.7rem] font-black text-white/30 uppercase tracking-[0.4em]">Signal Channels</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-blue-400 uppercase tracking-widest ml-2">Phonic Line *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      placeholder="+X XXX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-blue-400 uppercase tracking-widest ml-2">Digital Alias</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white/10 transition-all text-white font-bold"
                      placeholder="alias@domain.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-blue-400 uppercase tracking-widest ml-2">Blood Type Matrix</label>
                    <select
                      value={formData.blood_group}
                      onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none text-white font-bold"
                    >
                      <option value="" className="bg-slate-900">N/A</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(g => (
                        <option key={g} value={g} className="bg-slate-900">{g}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.6rem] font-black text-blue-400 uppercase tracking-widest ml-2">Emergency Relay</label>
                    <input
                      type="tel"
                      value={formData.emergency_contact}
                      onChange={(e) => setFormData({ ...formData, emergency_contact: e.target.value })}
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none text-white font-bold"
                      placeholder="Contact point name/number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[0.6rem] font-black text-blue-400 uppercase tracking-widest ml-2">Geolocation (Address)</label>
                   <textarea
                     value={formData.address}
                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                     rows="2"
                     className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none text-white font-medium resize-none placeholder:text-white/10"
                     placeholder="Physical residency parameters..."
                   />
                </div>
              </div>

              {!editingPatient && (
                <div className="space-y-8 animate-slide-up">
                  <div className="flex items-center gap-3 px-2 border-l-4 border-red-500/40">
                     <span className="text-[0.7rem] font-black text-white/30 uppercase tracking-[0.4em]">Initial Session Data</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-red-400 uppercase tracking-widest ml-2">Subjective Complaints</label>
                        <textarea
                          value={formData.symptoms}
                          onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
                          rows="3"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium resize-none"
                          placeholder="Describe patient status..."
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-red-400 uppercase tracking-widest ml-2">Primary Diagnosis</label>
                        <textarea
                          value={formData.diagnosis}
                          onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
                          rows="3"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium resize-none"
                          placeholder="Preliminary clinical finding..."
                        />
                     </div>
                  </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                     <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-red-400 uppercase tracking-widest ml-2">Prior Medical History</label>
                        <textarea
                          value={formData.medical_history}
                          onChange={(e) => setFormData({ ...formData, medical_history: e.target.value })}
                          rows="2"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium resize-none"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[0.6rem] font-black text-red-400 uppercase tracking-widest ml-2">Audit Notes</label>
                        <textarea
                          value={formData.additional_notes}
                          onChange={(e) => setFormData({ ...formData, additional_notes: e.target.value })}
                          rows="2"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium resize-none"
                        />
                     </div>
                  </div>
                </div>
              )}

              <div className="flex gap-6 pt-10 border-t border-white/10">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-teal-500 text-white py-6 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-teal-400 transition-all shadow-2xl shadow-teal-500/20 active:scale-95 disabled:opacity-50"
                >
                  {loading
                    ? 'Transmitting...'
                    : editingPatient
                    ? 'Authorize Revision'
                    : 'Commit Registry'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="px-12 py-6 bg-white/5 border border-white/10 text-white/20 font-black text-xs uppercase tracking-[0.2em] rounded-[2rem] hover:bg-white/10 transition-all"
                >
                  Abort
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientManagement;

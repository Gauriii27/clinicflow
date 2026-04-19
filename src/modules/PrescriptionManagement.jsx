import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, Trash2, X, Download, MessageCircle, FileText, Activity, Pill } from 'lucide-react';
import Navbar from '../components/Navbar';
import { generatePrescriptionPDF, shareViaWhatsApp } from '../utils/pdfGenerator';
import bgImage from '../assets/medical_bg.png';

const PrescriptionManagement = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('registry'); // 'registry' or 'archives'
  const [showModal, setShowModal] = useState(false);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    patient_id: '',
    diagnosis: '',
    instructions: '',
    medications: [
      {
        medicine_name: '',
        dosage: '',
        frequency: '',
        duration: '',
      },
    ],
  });

  const [searchParams] = useSearchParams();

  async function fetchRecipes() {
    try {
      // Using explicit join names to avoid schema cache ambiguities
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients!patient_id (first_name, last_name),
          users!doctor_id (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Join fetch failed, trying simplified fetch:', error);
        // Fallback to simple fetch if relationship is really broken in cache
        const { data: simpleData, error: simpleError } = await supabase
          .from('prescriptions')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (simpleError) throw simpleError;
        setPrescriptions(simpleData || []);
      } else {
        setPrescriptions(data || []);
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    }
  }

  async function fetchPatientList() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name, date_of_birth, gender, phone')
        .order('first_name', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }

  async function handleSubmit(e, actionType = 'save') {
    if (e) e.preventDefault();
    
    if (!formData.patient_id) { alert('Please select a patient'); return; }
    if (!formData.diagnosis?.trim()) { alert('Please enter a diagnosis'); return; }
    if (formData.medications.length === 0 || !formData.medications[0].medicine_name) {
      alert('Please add at least one medication'); 
      return; 
    }

    setLoading(true);

    try {
      const prescriptionData = {
        patient_id: formData.patient_id,
        doctor_id: user.id,
        diagnosis: formData.diagnosis,
        medications: formData.medications,
        instructions: formData.instructions,
        prescription_date: new Date().toISOString().split('T')[0],
      };

      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescriptionData])
        .select()
        .single();

      if (error) throw error;

      // Automatically mark today's appointment as completed if it exists
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('patient_id', formData.patient_id)
        .eq('doctor_id', user.id)
        .eq('appointment_date', today)
        .eq('status', 'scheduled');

      const fullPatient = patients.find(p => p.id === formData.patient_id);

      if (actionType === 'pdf') {
        const doc = generatePrescriptionPDF(data, fullPatient);
        doc.save(`Prescription_${fullPatient?.first_name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`);
      } else if (actionType === 'whatsapp') {
        shareViaWhatsApp(data, fullPatient);
      }

      fetchRecipes();
      resetForm();
      setShowModal(false);
      alert('Prescription processed successfully!');
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to save prescription: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }

  function handleDownload(prescription) {
    const p = patients.find(p => p.id === prescription.patient_id) || prescription.patients;
    if (!p) { alert('Patient data not found for PDF'); return; }
    const doc = generatePrescriptionPDF(prescription, p);
    doc.save(`Prescription_${p.first_name || 'Patient'}_${new Date().toISOString().split('T')[0]}.pdf`);
  }

  function handleWhatsApp(prescription) {
    const p = patients.find(p => p.id === prescription.patient_id) || prescription.patients;
    if (!p) { alert('Patient data not found for WhatsApp'); return; }
    shareViaWhatsApp(prescription, p);
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this prescription?')) return;
    try {
      const { error } = await supabase.from('prescriptions').delete().eq('id', id);
      if (error) throw error;
      fetchRecipes();
    } catch (error) {
      console.error('Error deleting prescription:', error);
    }
  }

  function updateMedication(index, field, value) {
    const newMeds = formData.medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setFormData({ ...formData, medications: newMeds });
  }

  function resetForm() {
    setFormData({
      patient_id: '',
      diagnosis: '',
      instructions: '',
      medications: [{ medicine_name: '', dosage: '', frequency: '', duration: '' }],
    });
  }

  useEffect(() => {
    fetchRecipes();
    fetchPatientList();
    
    const pId = searchParams.get('patientId');
    const diag = searchParams.get('diagnosis');
    if (pId) {
      setFormData(prev => ({ ...prev, patient_id: pId, diagnosis: diag || '' }));
      setActiveTab('registry'); // Stay on registry to see patient list
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    
    // Filter Prescriptions
    const filteredPx = prescriptions.filter(px =>
      px.patients?.first_name?.toLowerCase()?.includes(term) ||
      px.patients?.last_name?.toLowerCase()?.includes(term) ||
      px.diagnosis?.toLowerCase()?.includes(term)
    );
    setFilteredPrescriptions(filteredPx);

    // Filter Patients
    const filteredPat = patients.filter(p =>
      p.first_name?.toLowerCase()?.includes(term) ||
      p.last_name?.toLowerCase()?.includes(term) ||
      p.phone?.includes(term)
    );
    setFilteredPatients(filteredPat);
  }, [searchTerm, prescriptions, patients]);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-['Outfit']">
      <div className="fixed inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${bgImage})` }} />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute bottom-[10%] left-[5%] w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen backdrop-blur-[1px]">
        <Navbar />
        
        <main className="flex-1 w-full max-w-6xl mx-auto py-10 px-6 space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-[2.6rem] font-bold text-white tracking-tight drop-shadow-md">
                Clinical <span className="text-teal-300">Prescriptions</span>
              </h1>
              <p className="text-teal-50/60 text-[1.1rem] font-medium mt-1">Select a member to issue a new digital script.</p>
            </div>
            <div className="flex bg-white/5 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl">
              <button 
                onClick={() => setActiveTab('registry')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'registry' ? 'bg-teal-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Member Registry
              </button>
              <button 
                onClick={() => setActiveTab('archives')}
                className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'archives' ? 'bg-teal-500 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
              >
                Script Archives
              </button>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl">
            <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative group max-w-md w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'registry' ? "LOCATE MEMBER..." : "SEARCH ARCHIVES..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 text-white font-black text-xs uppercase tracking-widest placeholder:text-white/20"
                />
              </div>
              {activeTab === 'archives' && (
                <button
                  onClick={() => { resetForm(); setActiveTab('registry'); }}
                  className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-teal-500 text-white rounded-xl transition-all border border-white/10 text-[0.6rem] font-black uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4" /> Issue New Script
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              {activeTab === 'registry' ? (
                <table className="w-full">
                  <thead>
                    <tr className="bg-white/5">
                      <th className="px-8 py-5 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Full Name</th>
                      <th className="px-8 py-5 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Vitals Summary</th>
                      <th className="px-8 py-5 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Identifier</th>
                      <th className="px-8 py-5 text-right text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Quick Start</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredPatients.length > 0 ? (
                      filteredPatients.map((p) => (
                        <tr key={p.id} className="group hover:bg-white/5 transition-all">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-1.5xl bg-teal-500/10 text-teal-300 font-black text-lg flex items-center justify-center border border-teal-500/20 group-hover:scale-110 transition-transform">
                                {p.first_name?.[0]}
                              </div>
                              <div>
                                <p className="text-white font-black text-lg tracking-tight group-hover:text-teal-300 transition-colors">{p.first_name} {p.last_name}</p>
                                <p className="text-white/20 text-[0.6rem] font-bold uppercase tracking-widest">{p.phone || 'NO PHONE'}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="flex gap-2">
                              <span className="px-3 py-1 bg-white/5 rounded-lg text-white/40 text-[0.55rem] font-black uppercase tracking-widest border border-white/5">{p.gender}</span>
                              <span className="px-3 py-1 bg-white/5 rounded-lg text-white/40 text-[0.55rem] font-black uppercase tracking-widest border border-white/5">
                                {p.date_of_birth ? `${new Date().getFullYear() - new Date(p.date_of_birth).getFullYear()}YRS` : '--'}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-white/30 font-black text-[0.65rem] uppercase tracking-widest">ID:{String(p.id).padStart(4, '0')}</span>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button
                               onClick={() => { setFormData({...formData, patient_id: p.id}); setShowModal(true); }}
                               className="px-6 py-3 bg-teal-500/10 text-teal-300 hover:bg-teal-500 hover:text-white rounded-xl transition-all border border-teal-500/20 text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2 ml-auto group/btn"
                             >
                               <Pill className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
                               Process Script
                             </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-8 py-20 text-center opacity-30">
                          <Search className="w-16 h-16 mx-auto mb-4" strokeWidth={1} />
                          <p className="font-black text-xs uppercase tracking-widest">No matching members in registry</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              ) : (
                <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-5 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Member</th>
                    <th className="px-8 py-5 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Diagnosis</th>
                    <th className="px-8 py-5 text-left text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Issued</th>
                    <th className="px-8 py-5 text-right text-[0.65rem] font-black text-white/40 uppercase tracking-widest">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPrescriptions.length > 0 ? (
                    filteredPrescriptions.map((px) => (
                      <tr key={px.id} className="group hover:bg-white/5 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
                              <span className="text-teal-300 font-black">{px.patients?.first_name?.[0] || 'P'}</span>
                            </div>
                            <div>
                              <p className="text-white font-black text-lg tracking-tight group-hover:text-teal-300 transition-colors">
                                {px.patients?.first_name} {px.patients?.last_name}
                              </p>
                              <p className="text-white/30 text-[0.6rem] font-bold uppercase tracking-widest">DOC_REF: Dr. {px.users?.full_name?.split(' ').pop() || 'Yewale'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-white/60 font-medium text-sm italic">"{px.diagnosis}"</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-white/5 rounded-full text-teal-300 font-bold text-[0.65rem] uppercase tracking-widest border border-white/5">
                            {new Date(px.prescription_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => setViewingPrescription(px)} className="p-3 bg-white/5 hover:bg-teal-500 text-white rounded-xl transition-all"><Eye className="w-4 h-4"/></button>
                            <button onClick={() => handleDownload(px)} className="p-3 bg-white/5 hover:bg-teal-500 text-white rounded-xl transition-all"><Download className="w-4 h-4"/></button>
                            <button onClick={() => handleWhatsApp(px)} className="p-3 bg-white/5 hover:bg-green-500 text-white rounded-xl transition-all"><MessageCircle className="w-4 h-4"/></button>
                            <button onClick={() => handleDelete(px.id)} className="p-3 bg-white/5 hover:bg-red-500 text-white rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center opacity-30">
                        <FileText className="w-16 h-16 mx-auto mb-4" strokeWidth={1} />
                        <p className="font-black text-xs uppercase tracking-widest">No active scripts found</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              )}
            </div>
          </div>

          {/* New Script Modal */}
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-fade-in">
              <div className="glass-card w-full max-w-4xl rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/5">
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest">New Clinical Script</h2>
                  <button onClick={() => { setShowModal(false); resetForm(); }} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6 text-white/40" /></button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-10 overflow-y-auto space-y-8 flex-1 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-widest px-1">Registered Member</label>
                      <select required value={formData.patient_id} onChange={(e) => setFormData({ ...formData, patient_id: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:ring-2 focus:ring-teal-500/30 transition-all appearance-none">
                        <option value="" className="bg-slate-900">Select Patient...</option>
                        {patients.map((p) => <option key={p.id} value={p.id} className="bg-slate-900">{p.first_name} {p.last_name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-widest px-1">Initial Diagnosis</label>
                      <input required type="text" value={formData.diagnosis} onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:ring-2 focus:ring-teal-500/30" placeholder="Manifested condition..." />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-white uppercase tracking-tighter italic">Drug Inventory</h3>
                      <button type="button" onClick={() => setFormData({...formData, medications: [...formData.medications, {medicine_name: '', dosage: '', frequency: '', duration: ''}]})} className="px-4 py-2 bg-white/5 hover:bg-teal-500 text-white rounded-xl transition-all font-black text-[0.6rem] uppercase tracking-widest border border-white/5">+ Add Capsule</button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.medications.map((med, idx) => (
                        <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 grid grid-cols-1 md:grid-cols-4 gap-4 relative group">
                          <input type="text" placeholder="DRUG NAME" required value={med.medicine_name} onChange={(e) => updateMedication(idx, 'medicine_name', e.target.value)} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-teal-500/50" />
                          <input type="text" placeholder="DOSAGE" required value={med.dosage} onChange={(e) => updateMedication(idx, 'dosage', e.target.value)} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-teal-500/50" />
                          <input type="text" placeholder="FREQ" required value={med.frequency} onChange={(e) => updateMedication(idx, 'frequency', e.target.value)} className="bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-teal-500/50" />
                          <div className="flex gap-2">
                             <input type="text" placeholder="DUR" required value={med.duration} onChange={(e) => updateMedication(idx, 'duration', e.target.value)} className="flex-1 bg-white/5 border border-white/5 rounded-xl px-4 py-3 text-white text-xs font-black uppercase tracking-widest focus:border-teal-500/50" />
                             {formData.medications.length > 1 && <button type="button" onClick={() => setFormData({...formData, medications: formData.medications.filter((_, i) => i !== idx)})} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><X className="w-4 h-4"/></button>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-widest px-1">Physician Advisory</label>
                    <textarea value={formData.instructions} onChange={(e) => setFormData({ ...formData, instructions: e.target.value })} rows="3" className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:ring-2 focus:ring-teal-500/30" placeholder="Special medication instructions..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                    <button type="button" onClick={() => handleSubmit(null, 'pdf')} disabled={loading} className="py-5 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"><Download className="w-5 h-5"/> PDF Export</button>
                    <button type="button" onClick={() => handleSubmit(null, 'whatsapp')} disabled={loading} className="py-5 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"><MessageCircle className="w-5 h-5"/> WhatsApp</button>
                    <button type="button" onClick={() => handleSubmit(null, 'save')} disabled={loading} className="py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 active:scale-95 disabled:opacity-50">Save Only</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Preview Script Modal */}
          {viewingPrescription && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-fade-in shadow-2xl">
              <div className="glass-card w-full max-w-2xl rounded-[3rem] border-white/10 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between">
                  <h2 className="text-2xl font-black text-white uppercase tracking-widest">Case Review</h2>
                  <button onClick={() => setViewingPrescription(null)} className="p-2 hover:bg-white/10 rounded-xl transition-colors"><X className="w-6 h-6 text-white/40" /></button>
                </div>
                
                <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar">
                  <div className="p-6 rounded-3xl bg-teal-500/5 border border-teal-500/10">
                    <p className="text-[0.65rem] font-black text-teal-400 uppercase tracking-widest mb-1">Clinic Identification</p>
                    <p className="text-white font-black text-2xl tracking-tighter">
                      {viewingPrescription.patients?.first_name} {viewingPrescription.patients?.last_name}
                    </p>
                    <p className="text-white/40 text-[0.65rem] font-black uppercase tracking-widest mt-1">Diagnosis: {viewingPrescription.diagnosis}</p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-widest px-1">Prescribed Regimen</p>
                    {viewingPrescription.medications?.map((med, i) => (
                      <div key={i} className="p-5 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between group">
                        <p className="font-black text-white text-lg tracking-tight group-hover:text-teal-300 transition-colors uppercase">{med.medicine_name}</p>
                        <div className="text-[0.6rem] font-black text-white/30 uppercase tracking-widest flex gap-4">
                          <span>{med.dosage}</span>
                          <span>{med.frequency}</span>
                          <span>{med.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button onClick={() => handleDownload(viewingPrescription)} className="flex-1 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-[0.65rem] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"><Download className="w-5 h-5"/> Download PDF</button>
                    <button onClick={() => handleWhatsApp(viewingPrescription)} className="flex-1 py-4 bg-green-500 hover:bg-green-400 text-white rounded-2xl font-black text-[0.65rem] uppercase tracking-widest transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"><MessageCircle className="w-4 h-4"/> Share WhatsApp</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PrescriptionManagement;

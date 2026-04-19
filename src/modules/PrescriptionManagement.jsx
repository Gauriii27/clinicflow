import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, Eye, Trash2, X, Download, MessageCircle, FileText, Activity } from 'lucide-react';
import Navbar from '../components/Navbar';
import { generatePrescriptionPDF, shareViaWhatsApp } from '../utils/pdfGenerator';
import bgImage from '../assets/medical_bg.png';

const PrescriptionManagement = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
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

  useEffect(() => {
    fetchPrescriptions();
    fetchPatients();
    
    // Check for patientId in URL
    const pId = searchParams.get('patientId');
    const diag = searchParams.get('diagnosis');
    if (pId) {
      setFormData(prev => ({
        ...prev,
        patient_id: pId,
        diagnosis: diag || ''
      }));
      setShowModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const filtered = prescriptions.filter(
      (prescription) =>
        prescription.patients?.first_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        prescription.patients?.last_name
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPrescriptions(filtered);
  }, [searchTerm, prescriptions]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select(`
          *,
          patients (first_name, last_name),
          users!prescriptions_doctor_id_fkey (full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
      setFilteredPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
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

  const handleSubmit = async (e, actionType = 'save') => {
    if (e) e.preventDefault();
    
    // Validation
    if (!formData.patient_id) {
      alert('Please select a patient');
      return;
    }
    if (!formData.diagnosis || formData.diagnosis.trim() === '') {
      alert('Please enter a diagnosis');
      return;
    }
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

      // Automatically mark today's appointment as completed
      const today = new Date().toISOString().split('T')[0];
      await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('patient_id', formData.patient_id)
        .eq('doctor_id', user.id)
        .eq('appointment_date', today)
        .eq('status', 'scheduled');

      const patient = patients.find(p => p.id === formData.patient_id);

      // Trigger chosen action
      if (actionType === 'pdf') {
        const doc = generatePrescriptionPDF(data, patient);
        doc.save(`Prescription_${patient.first_name}_${new Date().toISOString().split('T')[0]}.pdf`);
      } else if (actionType === 'whatsapp') {
        shareViaWhatsApp(data, patient);
      }

      fetchPrescriptions();
      resetForm();
      setShowModal(false);
      alert('Prescription saved successfully!');
    } catch (error) {
      console.error('Error creating prescription:', error);
      alert('Failed to save prescription: ' + (error.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (prescription) => {
    const patient = patients.find(p => p.id === prescription.patient_id) || prescription.patients;
    const doc = generatePrescriptionPDF(prescription, patient);
    doc.save(`Prescription_${patient.first_name}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleWhatsAppShare = (prescription) => {
    const patient = patients.find(p => p.id === prescription.patient_id) || prescription.patients;
    shareViaWhatsApp(prescription, patient);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this prescription?')) return;

    try {
      const { error } = await supabase
        .from('prescriptions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchPrescriptions();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      alert('Failed to delete prescription');
    }
  };

  const addMedication = () => {
    setFormData({
      ...formData,
      medications: [
        ...formData.medications,
        { medicine_name: '', dosage: '', frequency: '', duration: '' },
      ],
    });
  };

  const removeMedication = (index) => {
    const newMedications = formData.medications.filter((_, i) => i !== index);
    setFormData({ ...formData, medications: newMedications });
  };

  const updateMedication = (index, field, value) => {
    const newMedications = formData.medications.map((med, i) =>
      i === index ? { ...med, [field]: value } : med
    );
    setFormData({ ...formData, medications: newMedications });
  };

  const resetForm = () => {
    setFormData({
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
        <div className="absolute top-[20%] right-[10%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[10%] left-[5%] w-72 h-72 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 w-full max-w-6xl mx-auto py-10 px-6 space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-[2.5rem] font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
                <FileText className="w-10 h-10 text-teal-300" />
                Prescription Log
              </h1>
              <p className="text-teal-50/60 font-medium text-lg mt-1 ml-1">
                Clinical archives and patient medication history
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 active:scale-95"
            >
              <Plus className="w-5 h-5" />
              New Prescription
            </button>
          </div>

          <div className="glass-card rounded-[2rem] overflow-hidden border-white/10">
            <div className="p-8 border-b border-white/10 bg-white/5">
              <div className="relative group max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 w-5 h-5 transition-colors" />
                <input
                  type="text"
                  placeholder="Search by patient name or diagnosis..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="px-8 py-5 text-left text-xs font-black text-white/40 uppercase tracking-[0.2em]">Patient</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-white/40 uppercase tracking-[0.2em]">Doctor</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-white/40 uppercase tracking-[0.2em]">Diagnosis</th>
                    <th className="px-8 py-5 text-left text-xs font-black text-white/40 uppercase tracking-[0.2em]">Date</th>
                    <th className="px-8 py-5 text-right text-xs font-black text-white/40 uppercase tracking-[0.2em]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredPrescriptions.length > 0 ? (
                    filteredPrescriptions.map((px) => (
                      <tr key={px.id} className="hover:bg-white/5 transition-colors group">
                        <td className="px-8 py-6 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center font-bold text-teal-300 border border-teal-500/20">
                              {px.patients?.first_name?.charAt(0)}
                            </div>
                            <div className="text-sm font-bold text-white tracking-tight">
                              {px.patients?.first_name} {px.patients?.last_name}
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                           <div className="flex items-center gap-2">
                             <Activity className="w-3.5 h-3.5 text-blue-400/50" />
                             <span className="text-sm font-medium text-white/60">Dr. {px.users?.full_name?.split(' ')[px.users?.full_name?.split(' ').length - 1]}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="text-sm text-white/40 font-medium line-clamp-1">{px.diagnosis}</span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap">
                          <span className="text-[0.65rem] font-bold text-teal-300/60 bg-teal-500/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            {new Date(px.prescription_date).toLocaleDateString()}
                          </span>
                        </td>
                        <td className="px-8 py-6 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => setViewingPrescription(px)}
                              className="p-3 bg-white/5 hover:bg-blue-500/20 text-blue-300 rounded-xl transition-all border border-white/5 hover:border-blue-500/30"
                              title="View & Share"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDownload(px)}
                              className="p-3 bg-white/5 hover:bg-teal-500/20 text-teal-300 rounded-xl transition-all border border-white/5 hover:border-teal-500/30"
                              title="Download PDF"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleWhatsAppShare(px)}
                              className="p-3 bg-white/5 hover:bg-green-500/20 text-[#25D366] rounded-xl transition-all border border-white/5 hover:border-green-500/30"
                              title="WhatsApp Share"
                            >
                              <MessageCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(px.id)}
                              className="p-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl transition-all border border-white/5 hover:border-red-500/30"
                              title="Delete"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center">
                        <div className="bg-white/5 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                           <FileText className="w-8 h-8 text-white/10" />
                        </div>
                        <p className="text-white/30 font-bold uppercase tracking-widest text-sm">No prescriptions archived</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-xl">
              <div className="glass-modal rounded-[3rem] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
                <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between sticky top-0 z-10">
                  <div>
                    <h2 className="text-3xl font-black text-white tracking-tight italic">
                      New Script
                    </h2>
                    <p className="text-xs font-black text-teal-400 uppercase tracking-[0.3em] mt-1">Prescription Issuance Form</p>
                  </div>
                  <button
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                  >
                    <X className="w-6 h-6 text-white/50" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">
                        Patient Profile *
                      </label>
                      <select
                        required
                        value={formData.patient_id}
                        onChange={(e) =>
                          setFormData({ ...formData, patient_id: e.target.value })
                        }
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 text-white font-medium appearance-none"
                      >
                        <option value="" className="bg-slate-900">Select Member</option>
                        {patients.map((p) => (
                          <option key={p.id} value={p.id} className="bg-slate-900">
                            {p.first_name} {p.last_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">
                        Primary Diagnosis *
                      </label>
                      <textarea
                        required
                        value={formData.diagnosis}
                        onChange={(e) =>
                          setFormData({ ...formData, diagnosis: e.target.value })
                        }
                        rows="1"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 text-white font-medium placeholder:text-white/20"
                        placeholder="Ex: Viral Fever, Hypertension..."
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                        <Pill className="w-5 h-5 text-blue-400" />
                        Medication Regimen
                      </h3>
                      <button
                        type="button"
                        onClick={addMedication}
                        className="text-[0.65rem] font-black text-teal-400 hover:text-teal-300 bg-teal-500/10 px-4 py-2 rounded-xl transition-all uppercase tracking-widest border border-teal-500/20"
                      >
                        + Add Drug
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {formData.medications.map((med, idx) => (
                        <div key={idx} className="glass-card bg-white/5 p-6 rounded-[2rem] border-white/5 space-y-4 relative group">
                          <div className="flex items-center justify-between">
                            <span className="text-[0.6rem] font-black text-white/30 uppercase tracking-[0.3em]">Module {idx + 1}</span>
                            {formData.medications.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeMedication(idx)}
                                className="w-8 h-8 flex items-center justify-center bg-red-500/10 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-all"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <input
                              type="text"
                              placeholder="Drug Name"
                              required
                              value={med.medicine_name}
                              onChange={(e) => updateMedication(idx, 'medicine_name', e.target.value)}
                              className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Dosage (500mg)"
                              required
                              value={med.dosage}
                              onChange={(e) => updateMedication(idx, 'dosage', e.target.value)}
                              className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Frequency"
                              required
                              value={med.frequency}
                              onChange={(e) => updateMedication(idx, 'frequency', e.target.value)}
                              className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Duration"
                              required
                              value={med.duration}
                              onChange={(e) => updateMedication(idx, 'duration', e.target.value)}
                              className="px-5 py-3.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 text-white text-sm"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">
                      Special Instructions
                    </label>
                    <textarea
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      rows="3"
                      className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-[1.5rem] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 text-white font-medium placeholder:text-white/20"
                      placeholder="Ex: Take after meals, Avoid cold drinks..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-8 border-t border-white/10">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmit(null, 'pdf')}
                      className="bg-teal-500 hover:bg-teal-400 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      {loading ? '...' : 'PDF Export'}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmit(null, 'whatsapp')}
                      className="bg-[#25D366] hover:bg-[#20ba59] text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {loading ? '...' : 'WhatsApp'}
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSubmit(null, 'save')}
                      className="bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all backdrop-blur-md border border-white/10 disabled:opacity-50 active:scale-95"
                    >
                      Save Only
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        resetForm();
                      }}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-red-500/10 active:scale-95"
                    >
                      Discard
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Viewing Transition Modal */}
          {viewingPrescription && (
            <div className="fixed inset-0 bg-slate-950/60 flex items-center justify-center z-[110] p-4 animate-fade-in backdrop-blur-2xl">
              <div className="glass-modal rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
                <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between sticky top-0 z-10">
                  <h2 className="text-2xl font-black text-white tracking-tight italic">
                    Script Details
                  </h2>
                  <button
                    onClick={() => setViewingPrescription(null)}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10"
                  >
                    <X className="w-6 h-6 text-white/50" />
                  </button>
                </div>

                <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="glass-card bg-white/5 p-4 rounded-2xl border-white/5">
                      <p className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest mb-1">Patient</p>
                      <p className="font-bold text-white text-lg">
                        {viewingPrescription.patients?.first_name}{' '}
                        {viewingPrescription.patients?.last_name}
                      </p>
                    </div>
                    <div className="glass-card bg-white/5 p-4 rounded-2xl border-white/5">
                      <p className="text-[0.6rem] font-black text-blue-400 uppercase tracking-widest mb-1">Issuer</p>
                      <p className="font-bold text-white text-lg">
                        Dr. {viewingPrescription.users?.full_name?.split(' ').pop()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.6rem] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-2">Clinical Diagnosis</p>
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                       <p className="text-white font-medium italic">"{viewingPrescription.diagnosis}"</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-[0.6rem] font-black text-white/30 uppercase tracking-[0.2em] mb-2 px-2">Medications</p>
                    <div className="space-y-2">
                      {viewingPrescription.medications?.map((med, index) => (
                        <div
                          key={index}
                          className="p-5 glass-card bg-white/5 rounded-2xl border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:bg-white/10"
                        >
                          <p className="font-black text-teal-300 tracking-tight">
                            {med.medicine_name}
                          </p>
                          <div className="flex gap-4 text-[0.65rem] font-black text-white/40 uppercase tracking-widest">
                            <span className="bg-white/5 px-2 py-1 rounded-md">{med.dosage}</span>
                            <span className="bg-white/5 px-2 py-1 rounded-md">{med.frequency}</span>
                            <span className="bg-white/5 px-2 py-1 rounded-md">{med.duration}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {viewingPrescription.instructions && (
                    <div className="p-5 bg-teal-500/5 rounded-2xl border border-teal-500/10">
                      <p className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest mb-2 font-black">Advisory Notes</p>
                      <p className="text-white/70 text-sm font-medium">
                        {viewingPrescription.instructions}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleDownload(viewingPrescription)}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 active:scale-95"
                    >
                      <Download className="w-5 h-5" />
                      Export
                    </button>
                    <button
                      onClick={() => handleWhatsAppShare(viewingPrescription)}
                      className="flex-1 flex items-center justify-center gap-3 py-4 bg-[#25D366] hover:bg-[#22c15c] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-green-500/20 active:scale-95"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Send
                    </button>
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

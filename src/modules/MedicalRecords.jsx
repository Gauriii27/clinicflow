import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Search, Plus, CreditCard as Edit, Trash2, X, Eye, FileText, Calendar, Activity, ChevronRight, User, Pill } from 'lucide-react';
import Navbar from '../components/Navbar';
import bgImage from '../assets/medical_bg.png';

const MedicalRecords = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [patients, setPatients] = useState([]);
  const [showNewRecordModal, setShowNewRecordModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    patient_id: '',
    visit_date: new Date().toISOString().split('T')[0],
    symptoms: '',
    diagnosis: '',
    blood_pressure: '',
    temperature: '',
    weight: '',
    height: '',
    notes: ''
  });

  useEffect(() => {
    fetchRecords();
    fetchPatients();
  }, []);

  useEffect(() => {
    const filtered = records.filter(record => 
      record.patients?.first_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      record.patients?.last_name?.toLowerCase()?.includes(searchQuery.toLowerCase()) ||
      record.diagnosis?.toLowerCase()?.includes(searchQuery.toLowerCase())
    );
    setFilteredRecords(filtered);
  }, [searchQuery, records]);

  async function fetchRecords() {
    try {
      setLoading(true);
      // Try simple join first. If relationship is ambiguous, supabase might error, 
      // but users/doctor_id is standard.
      const { data, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          patients (first_name, last_name)
        `)
        .order('visit_date', { ascending: false });

      if (error) throw error;
      setRecords(data || []);
    } catch (error) {
      console.error('Error fetching medical records:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPatients() {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, first_name, last_name')
        .order('first_name');
      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  }

  async function handleCreateRecord(e) {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('medical_records')
        .insert([{
          ...newRecord,
          doctor_id: user.id
        }]);

      if (error) throw error;
      setShowNewRecordModal(false);
      setNewRecord({
        patient_id: '',
        visit_date: new Date().toISOString().split('T')[0],
        symptoms: '',
        diagnosis: '',
        blood_pressure: '',
        temperature: '',
        weight: '',
        height: '',
        notes: ''
      });
      fetchRecords();
    } catch (error) {
      console.error('Error creating medical record:', error);
      alert('Error creating medical record');
    }
  }

  async function handleDeleteRecord(id) {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchRecords();
    } catch (error) {
      console.error('Error deleting medical record:', error);
      alert('Error deleting medical record');
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-900 font-['Outfit']">
      {/* Background and Bubbles */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-64 h-64 rounded-full bg-teal-400/10 blur-3xl animate-float" />
        <div className="absolute top-[60%] right-[10%] w-80 h-80 rounded-full bg-blue-400/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen backdrop-blur-[1px]">
        <Navbar />

        <main className="flex-1 w-full max-w-7xl mx-auto py-10 px-6 space-y-8 animate-fade-in">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-[2.6rem] font-bold text-white tracking-tight drop-shadow-md">
                Clinical <span className="text-teal-300">Archives</span>
              </h1>
              <p className="text-teal-50/70 text-[1.1rem] font-medium max-w-2xl mt-1">
                Access and manage comprehensive patient visit logs and diagnostic data.
              </p>
            </div>
            
            <button
              onClick={() => setShowNewRecordModal(true)}
              className="flex items-center justify-center gap-3 px-8 py-4 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              New Diagnostic Entry
            </button>
          </div>

          {/* Search Panel */}
          <div className="glass-card p-3 rounded-[2rem] border-white/10 shadow-2xl flex items-center gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 w-5 h-5" />
              <input
                type="text"
                placeholder="SEARCH ARCHIVES BY PATIENT NAME OR DIAGNOSIS..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-16 pr-6 text-white placeholder:text-white/40 font-black text-xs uppercase tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all"
              />
            </div>
            <div className="hidden md:flex items-center gap-2 px-6 py-4 bg-white/5 rounded-xl border border-white/5">
              <Activity className="w-4 h-4 text-teal-400" />
              <span className="text-white/40 font-black text-[0.6rem] uppercase tracking-widest">
                {filteredRecords.length} Entries Found
              </span>
            </div>
          </div>

          {/* Records Table */}
          <div className="glass-card rounded-[2.5rem] overflow-hidden border-white/10 shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/10">
                    <th className="px-8 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.25em] opacity-80">Date</th>
                    <th className="px-8 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.25em] opacity-80">Patient Identity</th>
                    <th className="px-8 py-6 text-left text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.25em] opacity-80">Clinical Diagnosis</th>
                    <th className="px-8 py-6 text-center text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.25em] opacity-80">Metrics</th>
                    <th className="px-8 py-6 text-right text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.25em] opacity-80">Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-white/30 animate-pulse uppercase tracking-widest font-black text-xs">
                        Synchronizing clinical archives...
                      </td>
                    </tr>
                  ) : filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-8 py-20 text-center text-white/20 uppercase tracking-widest font-black text-xs">
                        No medical archives matched your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record) => (
                      <tr key={record.id} className="group hover:bg-white/5 transition-all">
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="bg-teal-500/10 p-2 rounded-lg">
                              <Calendar className="w-4 h-4 text-teal-300" />
                            </div>
                            <span className="text-white/80 font-mono text-sm tracking-tight">
                              {new Date(record.visit_date).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-teal-500/20 group-hover:border-teal-500/30 transition-all">
                              <User className="w-4 h-4 text-white opacity-30 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                              <p className="text-white font-black text-lg tracking-tight group-hover:text-teal-300 transition-colors">
                                {record.patients?.first_name} {record.patients?.last_name}
                              </p>
                              <p className="text-white/30 text-[0.6rem] font-bold uppercase tracking-widest">PATIENT_REF: {record.patient_id.slice(0,8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-4 py-1.5 bg-white/5 rounded-xl text-teal-300 font-bold text-xs border border-white/5 group-hover:border-teal-500/20 transition-all">
                            {record.diagnosis}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-center gap-4 text-[0.6rem] font-black text-white/40 uppercase tracking-widest">
                            <div className="flex flex-col items-center">
                              <span className="text-white/80 text-[0.8rem]">{record.blood_pressure || '-'}</span>
                              <span>BP</span>
                            </div>
                            <div className="w-px h-6 bg-white/10" />
                            <div className="flex flex-col items-center">
                              <span className="text-white/80 text-[0.8rem]">{record.temperature || '-'}°C</span>
                              <span>TEMP</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/prescriptions?patientId=${record.patient_id}&diagnosis=${encodeURIComponent(record.diagnosis)}`)}
                              title="Generate Prescription"
                              className="p-3 bg-teal-500/10 hover:bg-teal-500 text-teal-300 hover:text-white rounded-xl border border-teal-500/20 transition-all group/px"
                            >
                              <Pill className="w-4 h-4 opacity-50 group-hover/px:opacity-100" />
                            </button>
                            <button
                              onClick={() => { setSelectedRecord(record); setShowModal(true); }}
                              className="p-3 bg-white/5 hover:bg-teal-500 text-white rounded-xl border border-white/5 transition-all group/btn"
                            >
                              <Eye className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" />
                            </button>
                            <button
                              onClick={() => handleDeleteRecord(record.id)}
                              className="p-3 bg-white/5 hover:bg-red-500/20 text-red-400 rounded-xl border border-white/5 transition-all group/btn"
                            >
                              <Trash2 className="w-4 h-4 opacity-50 group-hover/btn:opacity-100" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Record View Modal */}
      {showModal && selectedRecord && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-fade-in font-['Outfit']">
          <div className="glass-card w-full max-w-4xl rounded-[2.5rem] border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.1)] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-teal-500/20 p-3 rounded-2xl">
                  <FileText className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-sm">Diagnostic Case Summary</h2>
                  <p className="text-white/40 text-[0.65rem] font-black uppercase tracking-widest mt-0.5">Encounter ID: {selectedRecord.id}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
              </button>
            </div>
            
            <div className="p-10 overflow-y-auto space-y-8 flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                  <div>
                    <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Patient Identity</p>
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-white font-black text-xl tracking-tight leading-none mb-2">
                        {selectedRecord.patients?.first_name} {selectedRecord.patients?.last_name}
                      </p>
                      <p className="text-teal-300/60 text-xs font-black uppercase tracking-widest">Permanent Registry ID: {selectedRecord.patient_id}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Clinical Manifestations</p>
                    <div className="p-5 bg-white/5 rounded-2xl border border-white/10">
                      <p className="text-white/80 text-sm leading-relaxed font-medium italic">"{selectedRecord.symptoms}"</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Vitals & Metrics</p>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Blood Pressure', value: selectedRecord.blood_pressure },
                        { label: 'Temperature', value: `${selectedRecord.temperature}°C` },
                        { label: 'Weight', value: `${selectedRecord.weight}kg` },
                        { label: 'Height', value: `${selectedRecord.height}cm` }
                      ].map((item, idx) => (
                        <div key={idx} className="bg-white/5 p-4 rounded-xl border border-white/5 flex flex-col items-center">
                          <span className="text-white font-black text-lg tracking-tight">{item.value || 'N/A'}</span>
                          <span className="text-[0.55rem] font-black text-white/30 uppercase tracking-widest mt-1">{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Diagnostic Ledger</p>
                    <div className="p-5 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                      <p className="text-teal-300 font-black text-xl tracking-tighter mb-1 uppercase">{selectedRecord.diagnosis}</p>
                      <p className="text-white/30 text-[0.65rem] font-black uppercase tracking-widest italic font-medium">Verified by attending physician</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedRecord.notes && (
                <div>
                  <p className="text-[0.65rem] font-black text-white/30 uppercase tracking-[0.2em] mb-3 px-1">Clinician Audit Notes</p>
                  <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                    <p className="text-white/70 text-sm leading-relaxed">{selectedRecord.notes}</p>
                  </div>
                </div>
              )}

              <div className="pt-8 border-t border-white/10 flex gap-4">
                <button
                  onClick={() => navigate(`/prescriptions?patientId=${selectedRecord.patient_id}&diagnosis=${encodeURIComponent(selectedRecord.diagnosis)}`)}
                  className="flex-1 py-5 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <Pill className="w-5 h-5" />
                  Proceed to Prescription
                </button>
                <button
                  onClick={() => handleDownloadRecord(selectedRecord)}
                  className="px-10 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black text-xs uppercase tracking-widest border border-white/10 transition-all"
                >
                  Download Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Record Modal */}
      {showNewRecordModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/60 animate-fade-in font-['Outfit']">
          <div className="glass-card w-full max-w-2xl rounded-[2.5rem] border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-4">
                <div className="bg-teal-500/20 p-3 rounded-2xl">
                  <Plus className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white tracking-tight uppercase tracking-widest text-sm">New Diagnostic Session</h2>
                  <p className="text-white/40 text-[0.65rem] font-black uppercase tracking-widest mt-0.5">Initialize clinical visit log</p>
                </div>
              </div>
              <button 
                onClick={() => setShowNewRecordModal(false)}
                className="p-3 hover:bg-white/10 rounded-2xl transition-colors group"
              >
                <X className="w-6 h-6 text-white/40 group-hover:text-white" />
              </button>
            </div>
            
            <form onSubmit={handleCreateRecord} className="p-10 overflow-y-auto space-y-6 flex-1 custom-scrollbar">
              <div className="space-y-4">
                <label className="block text-[0.65rem] font-black text-white/40 uppercase tracking-widest px-1">Patient Identity</label>
                <select
                  required
                  value={newRecord.patient_id}
                  onChange={(e) => setNewRecord({...newRecord, patient_id: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">SELECT REGISTERED PATIENT...</option>
                  {patients.map(patient => (
                    <option key={patient.id} value={patient.id} className="bg-slate-900">
                      {patient.first_name} {patient.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-white/40 uppercase tracking-widest px-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={newRecord.visit_date}
                    onChange={(e) => setNewRecord({...newRecord, visit_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[0.65rem] font-black text-white/40 uppercase tracking-widest px-1">Target Diagnosis</label>
                  <input
                    type="text"
                    required
                    placeholder="E.G., ACUTE RHINITIS"
                    value={newRecord.diagnosis}
                    onChange={(e) => setNewRecord({...newRecord, diagnosis: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-[0.7rem] uppercase font-black hover:bg-white/10 transition-all focus:ring-2 focus:ring-teal-500/30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-white/40 uppercase tracking-widest px-1">Manifested Symptoms</label>
                <textarea
                  required
                  placeholder="DOCUMENT OBSERVED PATIENT SYMPTOMS..."
                  value={newRecord.symptoms}
                  onChange={(e) => setNewRecord({...newRecord, symptoms: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm min-h-[100px] focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { label: 'BP', key: 'blood_pressure', placeholder: '120/80' },
                  { label: 'Temp', key: 'temperature', placeholder: '37.0' },
                  { label: 'Weight', key: 'weight', placeholder: '70' },
                  { label: 'Height', key: 'height', placeholder: '175' }
                ].map((metric) => (
                  <div key={metric.key} className="space-y-2">
                    <label className="text-[0.55rem] font-black text-white/40 uppercase tracking-widest px-1">{metric.label}</label>
                    <input
                      type="text"
                      placeholder={metric.placeholder}
                      value={newRecord[metric.key]}
                      onChange={(e) => setNewRecord({...newRecord, [metric.key]: e.target.value})}
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-xs font-bold text-center focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <label className="text-[0.65rem] font-black text-white/40 uppercase tracking-widest px-1">Additional Clinical Notes</label>
                <textarea
                  placeholder="OPTIONAL OBSERVATIONS OR TREATMENT PLANS..."
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-sm min-h-[80px] focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <button
                type="submit"
                className="w-full py-5 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-teal-500/20 active:scale-95"
              >
                Log Archive Entry
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicalRecords;

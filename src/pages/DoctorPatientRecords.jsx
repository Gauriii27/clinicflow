import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Search, ChevronLeft, ChevronRight, X, Save, User, Activity, Calendar } from 'lucide-react';
import PatientHistoryModal from '../components/PatientHistoryModal';
import bgImage from '../assets/medical_bg.png';

const DoctorPatientRecords = () => {
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  
  // History Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [patientHistory, setPatientHistory] = useState([]);
  const [patientPrescriptions, setPatientPrescriptions] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);

  // Editing State
  const [editingRecord, setEditingRecord] = useState(null);
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    fetchPatientRecords();
  }, []);

  const fetchPatientRecords = async () => {
    try {
      setLoading(true);
      // Fetch patients and their most recent medical record
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select(`
          id,
          first_name,
          last_name,
          date_of_birth,
          medical_records (
            diagnosis,
            visit_date
          )
        `)
        .order('created_at', { ascending: false });

      if (patientsError) throw patientsError;

      // Format data
      const formattedData = patientsData.map(patient => {
        // Calculate age
        let age = 'N/A';
        if (patient.date_of_birth) {
          const birthYear = new Date(patient.date_of_birth).getFullYear();
          const currentYear = new Date().getFullYear();
          age = `${currentYear - birthYear}y`;
        }

        // Get latest record
        let latestRecord = { diagnosis: 'None', visit_date: 'N/A' };
        if (patient.medical_records && patient.medical_records.length > 0) {
          latestRecord = patient.medical_records.sort((a, b) => 
            new Date(b.visit_date) - new Date(a.visit_date)
          )[0];
        }

        return {
          id: patient.id,
          displayId: `REF-${String(patient.id).padStart(4, '0')}`,
          name: `${patient.first_name} ${patient.last_name}`,
          initial: patient.first_name.charAt(0).toUpperCase(),
          age,
          diagnosis: latestRecord.diagnosis || 'None',
          lastVisit: latestRecord.visit_date !== 'N/A' 
            ? new Date(latestRecord.visit_date).toISOString().split('T')[0] 
            : 'No Visits'
        };
      });

      setPatients(formattedData);
      setFilteredPatients(formattedData);

    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePatientClick = async (patient) => {
    try {
      setSelectedPatient(patient);
      setFetchingHistory(true);
      setIsHistoryOpen(true);

      // Fetch all medical records for this patient
      const { data: records, error: recordsError } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', patient.id)
        .order('visit_date', { ascending: false });

      if (recordsError) throw recordsError;
      setPatientHistory(records || []);

      // Fetch all prescriptions for this patient
      const { data: prescriptions, error: prescriptionsError } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patient.id)
        .order('prescription_date', { ascending: false });

      if (prescriptionsError) throw prescriptionsError;
      setPatientPrescriptions(prescriptions || []);

    } catch (error) {
      console.error('Error fetching patient history:', error);
    } finally {
      setFetchingHistory(false);
    }
  };

  const handleUpdateRecord = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('medical_records')
        .update({
          symptoms: editFormData.symptoms,
          diagnosis: editFormData.diagnosis,
          notes: editFormData.notes,
          blood_pressure: editFormData.blood_pressure,
          temperature: editFormData.temperature,
          weight: editFormData.weight,
          height: editFormData.height
        })
        .eq('id', editingRecord.id);

      if (error) throw error;
      
      // Update local history state
      setPatientHistory(prev => prev.map(r => r.id === editingRecord.id ? { ...r, ...editFormData } : r));
      setEditingRecord(null);
      alert('Medical record updated successfully!');
      
      // Refresh the main list to show updated diagnosis
      fetchPatientRecords();
      
    } catch (error) {
      console.error('Error updating record:', error);
      alert('Failed to update record.');
    }
  };

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPatients(patients);
      return;
    }
    const lower = searchTerm.toLowerCase();
    const filtered = patients.filter(p => 
      p.name.toLowerCase().includes(lower) || 
      p.displayId.toLowerCase().includes(lower) ||
      p.diagnosis.toLowerCase().includes(lower)
    );
    setFilteredPatients(filtered);
  }, [searchTerm, patients]);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-slate-900 animate-fade-in">
      {/* Dynamic Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 mix-blend-overlay scale-110"
        style={{ backgroundImage: `url(${bgImage})` }}
      />
      
      {/* Floating Bubbles */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[30%] left-[10%] w-96 h-96 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 w-full max-w-6xl mx-auto py-10 px-6 space-y-10">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <Link to="/dashboard" className="inline-flex items-center text-teal-400 font-black text-xs uppercase tracking-[0.2em] hover:text-teal-300 transition-colors mb-3 group">
                <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" strokeWidth={3} />
                Return to Clinic Hub
              </Link>
              <h1 className="text-[2.5rem] font-black text-white tracking-tight drop-shadow-md flex items-center gap-3">
                <User className="w-10 h-10 text-teal-300" />
                Member Records
              </h1>
              <p className="text-teal-50/60 font-medium text-lg mt-1 ml-1">
                Centralized registry of clinical member history
              </p>
            </div>
            
            <div className="glass-card bg-white/5 border-white/10 px-6 py-4 rounded-2xl flex items-center gap-4">
               <div className="w-3 h-3 rounded-full bg-teal-400 animate-pulse" />
               <span className="text-white font-black text-xs uppercase tracking-widest leading-none">
                 {filteredPatients.length} Active Records
               </span>
            </div>
          </div>

          <div className="glass-card rounded-[2.5rem] p-8 border-white/10 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-400/5 blur-3xl rounded-full" />
            <div className="relative z-10">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-4 opacity-40 italic">Query Registry</h2>
              <div className="relative group max-w-2xl">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-teal-400 w-6 h-6 transition-colors" />
                 <input
                   type="text"
                   className="block w-full pl-14 pr-6 py-5 bg-white/5 border border-white/10 rounded-[1.8rem] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-bold text-lg placeholder:text-white/10"
                   placeholder="Search by name, ID or diagnosis..."
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-20">
                <div className="w-12 h-12 border-4 border-teal-400/20 border-t-teal-400 rounded-full animate-spin mx-auto mb-4" />
                <p className="text-white/40 font-black text-xs uppercase tracking-widest">Accessing records...</p>
              </div>
            ) : filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <div 
                  key={patient.id} 
                  onClick={() => handlePatientClick(patient)}
                  className="glass-card rounded-[2.2rem] p-7 border-white/5 hover:border-teal-500/30 transition-all cursor-pointer group active:scale-[0.98]"
                >
                  <div className="flex justify-between items-start mb-8 relative">
                     <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-[1.4rem] bg-gradient-to-br from-teal-400/20 to-blue-500/20 text-white font-black text-2xl flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform shadow-lg">
                           {patient.initial}
                        </div>
                        <div>
                           <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-teal-300 transition-colors">{patient.name}</h3>
                           <p className="text-xs font-black text-teal-400/60 uppercase tracking-widest mt-1 italic">{patient.displayId}</p>
                        </div>
                     </div>
                     <div className="p-3 bg-white/5 rounded-xl opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0 border border-white/10">
                        <ChevronRight className="w-5 h-5 text-teal-400" />
                     </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[0.6rem] font-black uppercase tracking-widest text-teal-100/30 mb-2">Age</p>
                       <p className="text-sm font-bold text-white/90">{patient.age}</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[0.6rem] font-black uppercase tracking-widest text-teal-100/30 mb-2">Status</p>
                       <p className="text-sm font-bold text-white/90 truncate">{patient.diagnosis}</p>
                     </div>
                     <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[0.6rem] font-black uppercase tracking-widest text-teal-100/30 mb-2">Visit</p>
                       <p className="text-sm font-bold text-white/90">{patient.lastVisit}</p>
                     </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-32 glass-card rounded-[3rem] border-white/5 flex flex-col items-center justify-center opacity-50">
                <Search className="w-16 h-16 text-white/10 mb-6" />
                <p className="text-white/30 font-black text-xs uppercase tracking-[0.3em]">No registry matches found</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {isHistoryOpen && selectedPatient && (
         <PatientHistoryModal 
           patient={selectedPatient}
           history={patientHistory}
           prescriptions={patientPrescriptions}
           loading={fetchingHistory}
           onClose={() => setIsHistoryOpen(false)}
           onEditRecord={(record) => {
              setEditingRecord(record);
              setEditFormData({...record});
           }}
         />
      )}

      {editingRecord && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-2xl flex items-center justify-center z-[100] p-4 animate-fade-in">
          <div className="glass-modal rounded-[3rem] max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
             <div className="p-8 border-b border-white/10 bg-white/5 flex items-center justify-between sticky top-0 z-10">
                <div>
                   <h2 className="text-2xl font-black text-white tracking-tight italic">Update Script</h2>
                   <p className="text-[0.6rem] font-black text-teal-400 uppercase tracking-widest mt-1">Refine visit clinical data</p>
                </div>
                <button onClick={() => setEditingRecord(null)} className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10">
                  <X className="w-6 h-6 text-white/50" />
                </button>
             </div>
             
             <form onSubmit={handleUpdateRecord} className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="space-y-2">
                   <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Symptom Log</label>
                   <textarea
                     required
                     value={editFormData.symptoms || ''}
                     onChange={(e) => setEditFormData({...editFormData, symptoms: e.target.value})}
                     className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     rows="3"
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Diagnosis Fix</label>
                   <textarea
                     required
                     value={editFormData.diagnosis || ''}
                     onChange={(e) => setEditFormData({...editFormData, diagnosis: e.target.value})}
                     className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     rows="2"
                   />
                </div>
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-5 bg-white/5 rounded-[2rem] border border-white/5">
                   <div>
                      <label className="block text-[0.55rem] font-black text-teal-100/30 uppercase mb-2 ml-1 text-center tracking-widest">BP</label>
                      <input type="text" value={editFormData.blood_pressure || ''} onChange={(e) => setEditFormData({...editFormData, blood_pressure: e.target.value})} className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-white text-sm" />
                   </div>
                   <div>
                      <label className="block text-[0.55rem] font-black text-teal-100/30 uppercase mb-2 ml-1 text-center tracking-widest">Temp</label>
                      <input type="text" value={editFormData.temperature || ''} onChange={(e) => setEditFormData({...editFormData, temperature: e.target.value})} className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-white text-sm" />
                   </div>
                   <div>
                      <label className="block text-[0.55rem] font-black text-teal-100/30 uppercase mb-2 ml-1 text-center tracking-widest">Kg</label>
                      <input type="text" value={editFormData.weight || ''} onChange={(e) => setEditFormData({...editFormData, weight: e.target.value})} className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-white text-sm" />
                   </div>
                   <div>
                      <label className="block text-[0.55rem] font-black text-teal-100/30 uppercase mb-2 ml-1 text-center tracking-widest">Cm</label>
                      <input type="text" value={editFormData.height || ''} onChange={(e) => setEditFormData({...editFormData, height: e.target.value})} className="w-full px-3 py-3 bg-white/5 border border-white/10 rounded-xl text-center text-white text-sm" />
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Clinical Commentary</label>
                   <textarea
                     value={editFormData.notes || ''}
                     onChange={(e) => setEditFormData({...editFormData, notes: e.target.value})}
                     className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     rows="3"
                   />
                </div>

                <div className="flex gap-4 pt-6 border-t border-white/10">
                   <button type="submit" className="flex-1 bg-teal-500 hover:bg-teal-400 text-white font-black text-xs uppercase tracking-widest py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 transition-all active:scale-95">
                      <Save className="w-5 h-5" /> Confirm Changes
                   </button>
                   <button type="button" onClick={() => setEditingRecord(null)} className="px-8 py-4 bg-white/5 border border-white/10 text-white/50 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">
                      Cancel
                   </button>
                </div>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorPatientRecords;

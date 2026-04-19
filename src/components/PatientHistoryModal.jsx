import { X, Calendar, Clock, FileText, Pill, Edit2, ChevronDown, ChevronUp, PlusCircle, Activity } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const PatientHistoryModal = ({ patient, history, prescriptions, onClose, onEditRecord }) => {
  const [expandedId, setExpandedId] = useState(null);

  // Combine history and prescriptions into a single timeline sorted by date
  const timeline = [...history.map(h => ({ ...h, type: 'visit' })), 
                    ...prescriptions.map(p => ({ ...p, type: 'prescription', visit_date: p.prescription_date }))]
                    .sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  return (
    <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-2xl flex items-center justify-center z-[110] p-4 animate-fade-in">
      <div className="glass-modal rounded-[3.5rem] max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative border-white/10">
        
        {/* Header */}
        <div className="p-10 border-b border-white/10 bg-white/5 sticky top-0 z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-teal-400/20 to-blue-500/20 text-white flex items-center justify-center font-black text-3xl border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                {patient.initial}
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight italic">{patient.name}</h2>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-[0.6rem] font-black bg-white/10 px-3 py-1 rounded-full text-teal-400 uppercase tracking-widest">{patient.displayId}</span>
                  <span className="text-[0.6rem] font-black text-white/40 uppercase tracking-widest">{patient.age} • Registered</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link 
                to={`/prescriptions?patientId=${patient.id}`}
                className="flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-teal-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 active:scale-95"
              >
                <PlusCircle className="w-5 h-5" />
                Script
              </Link>
              <button onClick={onClose} className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors border border-white/10">
                <X className="w-6 h-6 text-white/30" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-transparent">
          {timeline.length > 0 ? (
            <div className="relative pl-12 space-y-12 border-l-2 border-white/5 ml-6">
              {timeline.map((item, idx) => (
                <div key={item.id} className="relative group">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[61px] top-8 w-6 h-6 rounded-full border-4 border-slate-900 ${item.type === 'visit' ? 'bg-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.5)]' : 'bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.5)]'} z-10 transition-transform group-hover:scale-125`} />
                  
                  <div className="glass-card bg-white/5 rounded-[2.5rem] border-white/5 p-8 shadow-sm group-hover:border-white/10 transition-all hover:bg-white/10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${item.type === 'visit' ? 'bg-teal-500/10 text-teal-400' : 'bg-blue-500/10 text-blue-400'} border border-white/5`}>
                          {item.type === 'visit' ? <Calendar className="w-6 h-6" /> : <Pill className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="text-[0.6rem] font-black text-white/30 uppercase tracking-[0.2em] mb-1">
                            {item.type === 'visit' ? 'Clinical Encounter' : 'Medication Script'}
                          </p>
                          <p className="font-bold text-white text-lg tracking-tight">
                            {new Date(item.visit_date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      
                      {item.type === 'visit' && (
                        <button 
                          onClick={() => onEditRecord(item)}
                          className="flex items-center gap-2 p-3 bg-white/5 text-white/40 hover:text-teal-300 hover:bg-teal-500/10 rounded-xl transition-all border border-white/5 border-transparent hover:border-teal-500/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {item.type === 'visit' ? (
                      <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mt-6">
                        <div className="md:col-span-3 space-y-6">
                           <div>
                              <p className="text-[0.55rem] font-black text-teal-400 uppercase tracking-widest mb-2">Subjective Complaints</p>
                              <p className="text-white/80 font-medium leading-relaxed italic">"{item.symptoms}"</p>
                           </div>
                           <div>
                              <p className="text-[0.55rem] font-black text-blue-400 uppercase tracking-widest mb-2">Assessment / Diagnosis</p>
                              <p className="text-white font-black text-xl tracking-tight leading-tight">{item.diagnosis}</p>
                           </div>
                        </div>
                        <div className="md:col-span-2 bg-white/5 rounded-[2rem] p-6 border border-white/10 relative overflow-hidden">
                           <div className="absolute top-0 right-0 p-2 opacity-5">
                             <Activity className="w-12 h-12 text-white" />
                           </div>
                           <p className="text-[0.55rem] font-black text-white/20 uppercase tracking-[0.3em] mb-4 text-center">Vital Sign Matrix</p>
                           <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                             <div className="text-center">
                                <p className="text-[0.5rem] font-black text-teal-400/40 uppercase tracking-widest mb-1">BP</p>
                                <p className="text-lg font-black text-white">{item.blood_pressure || '--'}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[0.5rem] font-black text-teal-400/40 uppercase tracking-widest mb-1">TEMP</p>
                                <p className="text-lg font-black text-white">{item.temperature || '--'}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[0.5rem] font-black text-teal-400/40 uppercase tracking-widest mb-1">WEIGHT</p>
                                <p className="text-lg font-black text-white">{item.weight || '--'}</p>
                             </div>
                             <div className="text-center">
                                <p className="text-[0.5rem] font-black text-teal-400/40 uppercase tracking-widest mb-1">HEIGHT</p>
                                <p className="text-lg font-black text-white">{item.height || '--'}</p>
                             </div>
                           </div>
                        </div>
                        {item.notes && (
                           <div className="md:col-span-5 pt-6 border-t border-white/5">
                             <p className="text-[0.55rem] font-black text-white/20 uppercase tracking-widest mb-2">Clinical Commentary</p>
                             <p className="text-sm text-white/50 font-medium italic leading-relaxed">"{item.notes}"</p>
                           </div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-4">
                           <p className="text-white/80 font-bold tracking-tight">Regimen for {item.diagnosis}</p>
                           <button 
                             onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                             className="text-blue-400 text-[0.65rem] font-black uppercase tracking-widest flex items-center gap-2 px-4 py-2 bg-blue-400/5 rounded-xl border border-blue-400/10 hover:bg-blue-400/10 transition-all font-black"
                           >
                             {expandedId === item.id ? 'Collapse' : 'Inspect'}
                             {expandedId === item.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                           </button>
                        </div>
                        {expandedId === item.id && (
                          <div className="mt-6 space-y-4 animate-fade-in">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                               {item.medications?.map((med, mIdx) => (
                                 <div key={mIdx} className="flex items-center gap-4 bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-all">
                                    <div className="bg-blue-500/10 p-3 rounded-xl">
                                      <Pill className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div>
                                      <p className="font-black text-white tracking-tight">{med.name} <span className="text-blue-400/40 font-bold text-xs ml-2">{med.dosage}</span></p>
                                      <p className="text-[0.6rem] font-black text-blue-400 mt-1 uppercase tracking-widest opacity-60">{med.frequency} • {med.duration}</p>
                                    </div>
                                 </div>
                               ))}
                             </div>
                             {item.instructions && (
                               <div className="p-5 bg-blue-500/5 rounded-2xl border border-blue-500/10 text-xs text-white/40 italic">
                                 <strong className="text-blue-400 not-italic uppercase tracking-widest mr-2 font-black text-[0.55rem]">Note:</strong> {item.instructions}
                               </div>
                             )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-32 opacity-30">
              <div className="bg-white/5 w-24 h-24 rounded-full flex items-center justify-center mb-6 border border-white/5">
                 <FileText className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No Records Detected</h3>
              <p className="text-sm font-black text-white/30 uppercase tracking-[0.2em] text-center">Patient archive is currently empty</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryModal;

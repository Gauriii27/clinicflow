import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Save, UserPlus, ArrowLeft } from 'lucide-react';
import bgImage from '../assets/medical_bg.png';

const RegisterPatientDoctor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    // Patient Table Fields
    patient_name: '', // Will be split into first and last name
    age: '', // Will be used to calculate a rough date_of_birth
    gender: 'Male',
    phone: '',
    
    // Medical Record Table Fields
    symptoms: '',
    diagnosis: '',
    medical_history: '',
    additional_notes: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Split name and calculate dob
      const nameParts = formData.patient_name.trim().split(' ');
      const firstName = nameParts[0] || 'Unknown';
      const lastName = nameParts.slice(1).join(' ') || 'Unknown';
      
      const birthYear = new Date().getFullYear() - (parseInt(formData.age) || 0);
      const dob = `${birthYear}-01-01`; // Rough estimate based on age

      // 2. Insert into patients table
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert([{
          first_name: firstName,
          last_name: lastName,
          date_of_birth: dob,
          gender: formData.gender.toLowerCase(),
          phone: formData.phone
        }])
        .select()
        .single();

      if (patientError) throw patientError;

      // 3. Insert into medical_records table
      const { error: recordError } = await supabase
        .from('medical_records')
        .insert([{
          patient_id: patientData.id,
          doctor_id: user.id,
          visit_date: new Date().toISOString().split('T')[0],
          symptoms: formData.symptoms,
          diagnosis: formData.diagnosis,
          notes: `Medical History: ${formData.medical_history}\n\nAdditional Notes: ${formData.additional_notes}`
        }]);

      if (recordError) throw recordError;

      // 4. Insert into today's queue (appointments) as 'completed'
      const { error: queueError } = await supabase
        .from('appointments')
        .insert([{
          patient_id: patientData.id,
          doctor_id: user.id,
          appointment_date: new Date().toISOString().split('T')[0],
          appointment_time: new Date().toTimeString().split(' ')[0].slice(0, 5),
          reason: formData.symptoms || 'Walk-in Visit',
          status: 'completed'
        }]);

      if (queueError) throw queueError;

      // Success
      alert('Patient registered! Now generating prescription...');
      navigate(`/prescriptions?patientId=${patientData.id}&diagnosis=${encodeURIComponent(formData.diagnosis)}`);

    } catch (error) {
      console.error('Error saving patient data:', error);
      alert('Failed to save patient data. ' + error.message);
    } finally {
      setLoading(false);
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
        <div className="absolute top-[10%] left-[5%] w-80 h-80 rounded-full bg-teal-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-[20%] right-[5%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <main className="flex-1 w-full flex justify-center py-10 px-6">
          <div className="w-full max-w-4xl glass-card rounded-[3rem] overflow-hidden border-white/10 shadow-2xl">
            
            <div className="px-10 pt-12 pb-8 border-b border-white/10 bg-white/5 relative overflow-hidden">
               {/* Header Decoration */}
               <div className="absolute -top-10 -right-10 w-40 h-40 bg-teal-400/10 blur-3xl rounded-full" />
               
               <div className="relative z-10 flex items-center gap-4">
                  <div className="p-4 bg-teal-500/20 rounded-2xl border border-teal-500/30">
                    <UserPlus className="text-teal-300 w-8 h-8" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-black text-white tracking-tight italic">Enroll New Member</h1>
                    <p className="text-teal-100/40 text-xs font-black uppercase tracking-[0.3em] mt-1">Clinical Intake & Medical History</p>
                  </div>
               </div>
            </div>

            <form onSubmit={handleSave} className="p-10 space-y-10 bg-transparent">
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                  {/* Patient Name */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Full Name *</label>
                     <input
                       type="text"
                       name="patient_name"
                       required
                       placeholder="First Middle Last"
                       value={formData.patient_name}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20"
                     />
                  </div>

                  {/* Age */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Age *</label>
                     <input
                       type="number"
                       name="age"
                       required
                       min="0"
                       max="150"
                       placeholder="Years"
                       value={formData.age}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20"
                     />
                  </div>

                  {/* Gender */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Gender Identity *</label>
                     <select
                       name="gender"
                       required
                       value={formData.gender}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium appearance-none"
                     >
                       <option value="Male" className="bg-slate-900">Male</option>
                       <option value="Female" className="bg-slate-900">Female</option>
                       <option value="Other" className="bg-slate-900">Other</option>
                     </select>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Mobile Contact *</label>
                     <input
                       type="tel"
                       name="phone"
                       required
                       placeholder="+91"
                       value={formData.phone}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20"
                     />
                  </div>
               </div>

               {/* Separator */}
               <div className="flex items-center gap-4 py-2">
                  <div className="h-px bg-white/10 flex-1" />
                  <span className="text-[0.6rem] font-black text-white/20 uppercase tracking-[0.4em]">Medical Context</span>
                  <div className="h-px bg-white/10 flex-1" />
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Symptoms */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Current Symptoms *</label>
                     <textarea
                       name="symptoms"
                       required
                       rows="3"
                       placeholder="Primary complaints..."
                       value={formData.symptoms}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     />
                  </div>

                  {/* Diagnosis */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Clinical Diagnosis *</label>
                     <textarea
                       name="diagnosis"
                       required
                       rows="3"
                       placeholder="Provisional find..."
                       value={formData.diagnosis}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     />
                  </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Medical History */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Known History</label>
                     <textarea
                       name="medical_history"
                       rows="2"
                       placeholder="Allergies, Chronic conditions..."
                       value={formData.medical_history}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     />
                  </div>

                  {/* Additional Notes */}
                  <div className="space-y-2">
                     <label className="text-[0.65rem] font-black text-teal-300 uppercase tracking-[0.2em] ml-2">Internal Notes</label>
                     <textarea
                       name="additional_notes"
                       rows="2"
                       placeholder="Vital signs, BP, Weight..."
                       value={formData.additional_notes}
                       onChange={handleChange}
                       className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:bg-white/10 transition-all text-white font-medium placeholder:text-white/20 resize-none"
                     />
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="flex flex-col sm:flex-row items-center gap-6 pt-10 border-t border-white/10">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:flex-1 bg-teal-500 hover:bg-teal-400 text-white font-black text-sm uppercase tracking-widest py-5 rounded-[1.8rem] transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
                  >
                    <Save className="w-5 h-5 transition-transform group-hover:rotate-6" />
                    {loading ? 'Processing...' : 'Confirm & Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard')}
                    className="w-full sm:w-auto px-10 bg-white/5 hover:bg-white/10 text-white font-black text-sm uppercase tracking-widest py-5 rounded-[1.8rem] backdrop-blur-md border border-white/10 transition-all flex items-center justify-center gap-3 active:scale-95"
                  >
                    <ArrowLeft className="w-5 h-5 text-white/30" />
                    Cancel
                  </button>
               </div>
            </form>

          </div>
        </main>
      </div>
    </div>
  );
};

export default RegisterPatientDoctor;

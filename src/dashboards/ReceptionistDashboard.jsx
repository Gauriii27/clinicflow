import { useEffect, useState } from 'react';
import { Calendar, Users, Clock, UserPlus, Plus, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const ReceptionistDashboard = () => {
  const [stats, setStats] = useState({
    todayAppointments: 0,
    totalPatients: 0,
    scheduledAppointments: 0,
  });
  const [todayList, setTodayList] = useState([]);
  const [showVisitsModal, setShowVisitsModal] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: todayData, count: todayCount } = await supabase
        .from('appointments')
        .select(`
          *,
          patients(first_name, last_name)
        `, { count: 'exact' })
        .gte('appointment_date', today)
        .lt('appointment_date', new Date(Date.now() + 86400000).toISOString().split('T')[0])
        .order('appointment_time', { ascending: true });

      const { count: patientCount } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: scheduledCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'scheduled');

      setStats({
        todayAppointments: todayCount || 0,
        totalPatients: patientCount || 0,
        scheduledAppointments: scheduledCount || 0,
      });
      setTodayList(todayData || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="w-full">
      {/* Greetings Header */}
      <div className="mb-10 mt-4">
        <h1 className="text-[2.2rem] font-bold text-[#1f2937]">Front Desk Overview</h1>
        <p className="text-[#6b7280] text-[1.1rem]">Manage appointments, patient registrations, and daily schedules</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Today's Appointments */}
        <div 
          onClick={() => setShowVisitsModal(true)}
          className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-transform transform hover:-translate-y-1 cursor-pointer hover:shadow-md"
        >
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-3">Today's Visits</p>
            <p className="text-[2.5rem] font-bold text-[#16a34a] leading-none">{stats.todayAppointments}</p>
          </div>
          <div className="w-14 h-14 rounded-full border-[3px] border-[#dcfce7] flex items-center justify-center">
            <Calendar className="text-[#86efac] w-7 h-7" />
          </div>
        </div>

        {/* Total Patients */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-transform transform hover:-translate-y-1">
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-3">Registered Patients</p>
            <p className="text-[2.5rem] font-bold text-[#3b82f6] leading-none">{stats.totalPatients}</p>
          </div>
          <div className="flex items-center justify-center">
            <Users className="text-[#bfdbfe] w-[3rem] h-[3rem]" strokeWidth={1.5} />
          </div>
        </div>

        {/* Scheduled Appointments */}
        <div className="bg-white rounded-[20px] shadow-sm p-6 border border-gray-100 flex items-center justify-between transition-transform transform hover:-translate-y-1">
          <div>
            <p className="text-[#6b7280] text-sm font-medium mb-3">Upcoming Schedules</p>
            <p className="text-[2.5rem] font-bold text-[#8b5cf6] leading-none">{stats.scheduledAppointments}</p>
          </div>
          <div className="flex items-center justify-center">
            <Clock className="text-[#ddd6fe] w-[3rem] h-[3rem]" strokeWidth={1.5} />
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link to="/patients" state={{ openAddModal: true }} className="bg-white rounded-[24px] shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden block text-left">
          <div className="absolute top-6 right-8">
            <span className="text-[#3b82f6] font-semibold text-sm">Register</span>
          </div>
          <div className="bg-[#eff6ff] w-14 h-14 rounded-xl flex items-center justify-center mb-10">
            <UserPlus className="text-[#3b82f6] w-8 h-8" />
          </div>
          <h2 className="text-[#1f2937] text-2xl font-bold">Register New Patient</h2>
        </Link>

        <Link to="/appointments" className="bg-white rounded-[24px] shadow-sm p-8 border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden block text-left">
          <div className="absolute top-6 right-8">
            <span className="text-[#16a34a] font-semibold text-sm">Schedule</span>
          </div>
          <div className="bg-[#f0fdf4] w-14 h-14 rounded-xl flex items-center justify-center mb-10">
            <Plus className="text-[#16a34a] w-8 h-8" />
          </div>
          <h2 className="text-[#1f2937] text-2xl font-bold">Book Appointment</h2>
        </Link>
      </div>

      {/* Today's Visits Modal */}
      {showVisitsModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-xl">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white">
              <div>
                <h2 className="text-xl font-bold text-gray-800">Today's Visits</h2>
                <p className="text-sm font-medium text-gray-500 mt-1">{new Date().toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => setShowVisitsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              {todayList.length > 0 ? (
                <div className="space-y-3">
                  {todayList.map((visit) => (
                    <div key={visit.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                      <div>
                        <p className="font-bold text-gray-800">{visit.patients?.first_name} {visit.patients?.last_name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          <span className="text-sm font-semibold text-gray-500">{visit.appointment_time}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${
                        visit.status === 'completed' ? 'bg-green-100 text-green-700' :
                        visit.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {visit.status.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="bg-green-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                     <Calendar className="w-8 h-8 text-green-500" />
                  </div>
                  <p className="text-gray-500 font-semibold text-lg">No visits scheduled for today.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;

import { motion } from 'framer-motion'
import { CalendarCheck, Users, FileText, Clock } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'

const todayAppointments = [
  { id: 'A-001', patient: 'Rohan Sharma', time: '10:30 AM', reason: 'Chest pain', status: 'Confirmed' },
  { id: 'A-002', patient: 'Priya Verma', time: '11:15 AM', reason: 'Follow-up', status: 'Pending' },
  { id: 'A-003', patient: 'Amit Patel', time: '12:00 PM', reason: 'Knee pain', status: 'Confirmed' },
  { id: 'A-004', patient: 'Sara Khan', time: '02:30 PM', reason: 'Skin rash', status: 'Pending' },
]

const STATUS_COLORS = {
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-orange-50 text-orange-600 border-orange-100',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
}

function DoctorDashboard() {
  const { user } = useAuth()

  const stats = [
    { label: "Today's Appointments", value: '8', icon: CalendarCheck, color: 'blue' },
    { label: 'Total Patients', value: '124', icon: Users, color: 'emerald' },
    { label: 'Pending Reports', value: '3', icon: FileText, color: 'orange' },
    { label: 'Next Appointment', value: '10:30 AM', icon: Clock, color: 'purple' },
  ]

  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Doctor Dashboard</h1>
        <p className="text-slate-500 font-medium text-sm mt-1">Welcome back, {user?.fullName || 'Doctor'}! Here's your overview.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {stats.map((s, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.08 }}
            className="p-6 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group">
            <div className="p-3 rounded-xl bg-slate-50 text-slate-600 group-hover:bg-blue-500 group-hover:text-white transition-colors w-fit mb-4">
              <s.icon size={20} />
            </div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{s.label}</p>
            <h3 className="text-2xl font-black text-slate-900">{s.value}</h3>
          </motion.div>
        ))}
      </div>

      {/* Today's Appointments */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-900 border-l-4 border-blue-500 pl-3 uppercase tracking-widest">Today's Schedule</h3>
          <p className="text-xs font-bold text-slate-400 pl-4 mt-0.5">{todayAppointments.length} appointments</p>
        </div>
        <div className="divide-y divide-slate-50">
          {todayAppointments.map((a, idx) => (
            <motion.div key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
              className="flex items-center justify-between px-8 py-4 hover:bg-slate-50/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                  {a.patient.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-black text-slate-900">{a.patient}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock size={10} className="text-slate-400" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{a.time} • {a.reason}</span>
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[a.status]}`}>
                {a.status}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DoctorDashboard

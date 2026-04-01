import { motion } from 'framer-motion'
import { Clock } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'

const schedule = [
  { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM'], status: 'available' },
  { day: 'Tuesday', slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'], status: 'available' },
  { day: 'Wednesday', slots: [], status: 'off' },
  { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM'], status: 'available' },
  { day: 'Friday', slots: ['02:00 PM', '03:00 PM', '04:00 PM'], status: 'available' },
  { day: 'Saturday', slots: ['10:00 AM', '11:00 AM'], status: 'available' },
  { day: 'Sunday', slots: [], status: 'off' },
]

function Schedule() {
  const { user } = useAuth()

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-500 pl-4">My Schedule</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Weekly availability — {user?.fullName}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {schedule.map((s, idx) => (
          <motion.div key={s.day} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.06 }}
            className={`p-5 rounded-2xl border shadow-sm transition-all ${s.status === 'off' ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 hover:border-blue-100 hover:shadow-md'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-black text-slate-900">{s.day}</h3>
              <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === 'off' ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>
                {s.status === 'off' ? 'Day Off' : `${s.slots.length} slots`}
              </span>
            </div>
            {s.status === 'off' ? (
              <p className="text-xs font-bold text-slate-300 text-center py-4">No appointments</p>
            ) : (
              <div className="space-y-2">
                {s.slots.map(slot => (
                  <div key={slot} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-blue-50/50 border border-blue-100/50">
                    <Clock size={11} className="text-blue-400 shrink-0" />
                    <span className="text-[10px] font-black text-blue-700">{slot}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default Schedule

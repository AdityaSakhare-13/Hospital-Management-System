import { useState, useMemo } from 'react'
import { Search, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

const initialAppointments = [
  { id: 'A-001', patient: 'Rohan Sharma', date: '2024-06-12', time: '10:30 AM', reason: 'Chest pain', status: 'Confirmed' },
  { id: 'A-002', patient: 'Priya Verma', date: '2024-06-12', time: '11:15 AM', reason: 'Follow-up', status: 'Pending' },
  { id: 'A-003', patient: 'Amit Patel', date: '2024-06-13', time: '12:00 PM', reason: 'Knee pain', status: 'Confirmed' },
  { id: 'A-004', patient: 'Sara Khan', date: '2024-06-14', time: '02:30 PM', reason: 'Skin rash', status: 'Pending' },
  { id: 'A-005', patient: 'Vikram Singh', date: '2024-06-15', time: '09:00 AM', reason: 'Cardiac check', status: 'Cancelled' },
]

const STATUS_COLORS = {
  Confirmed: 'bg-emerald-50 text-emerald-600 border-emerald-100',
  Pending: 'bg-orange-50 text-orange-600 border-orange-100',
  Cancelled: 'bg-rose-50 text-rose-500 border-rose-100',
}

function DoctorAppointments() {
  const [appointments, setAppointments] = useState(initialAppointments)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [message, setMessage] = useState('')

  const filtered = useMemo(() => appointments.filter(a => {
    const bySearch = search ? a.patient.toLowerCase().includes(search.toLowerCase()) : true
    const byStatus = statusFilter ? a.status === statusFilter : true
    return bySearch && byStatus
  }), [appointments, search, statusFilter])

  const updateStatus = (id, status) => {
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, status } : a))
    setMessage(`Appointment marked as ${status}`)
    setTimeout(() => setMessage(''), 3000)
  }

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-500 pl-4">My Appointments</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Manage your scheduled consultations</p>
      </div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="px-5 py-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-black text-emerald-700">
          ✓ {message}
        </motion.div>
      )}

      <div className="flex flex-wrap gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="Search patient..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-blue-400 transition-all appearance-none min-w-[140px]">
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Confirmed">Confirmed</option>
          <option value="Cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Patient', 'Date & Time', 'Reason', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-xs font-bold text-slate-400">No appointments found</td></tr>
              ) : filtered.map((a, idx) => (
                <motion.tr key={a.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">
                        {a.patient.charAt(0)}
                      </div>
                      <p className="text-xs font-black text-slate-900">{a.patient}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs font-bold text-slate-700">{a.date}</p>
                    <p className="text-[9px] font-bold text-slate-400">{a.time}</p>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{a.reason}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {a.status === 'Pending' && (
                        <button onClick={() => updateStatus(a.id, 'Confirmed')} className="p-2 rounded-lg text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 transition-all" title="Confirm">
                          <Check size={14} />
                        </button>
                      )}
                      {a.status !== 'Cancelled' && (
                        <button onClick={() => updateStatus(a.id, 'Cancelled')} className="p-2 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all" title="Cancel">
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default DoctorAppointments
=======
import React from 'react'

const DoctorAppointments = () => {
  return (
    <div>DoctorAppointments</div>
  )
}

export default DoctorAppointments
>>>>>>> 5b5c5409c8c20f28a2e3ac2faba6ab5b2da299a1

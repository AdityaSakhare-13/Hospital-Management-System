import { useState, useMemo } from 'react'
import { Search, Eye, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const patients = [
  { id: 'P-001', name: 'Rohan Sharma', age: 34, gender: 'Male', contact: '9876543210', bloodGroup: 'B+', lastVisit: '2024-06-10', medicalHistory: 'Diabetes Type 2' },
  { id: 'P-002', name: 'Priya Verma', age: 28, gender: 'Female', contact: '8765432109', bloodGroup: 'O+', lastVisit: '2024-06-11', medicalHistory: 'Asthma (mild)' },
  { id: 'P-003', name: 'Amit Patel', age: 45, gender: 'Male', contact: '9123456789', bloodGroup: 'A+', lastVisit: '2024-06-09', medicalHistory: 'Hypertension' },
  { id: 'P-004', name: 'Sara Khan', age: 31, gender: 'Female', contact: '7654321098', bloodGroup: 'AB-', lastVisit: '2024-06-12', medicalHistory: 'No known conditions' },
]

function PatientDetails() {
  const [search, setSearch] = useState('')
  const [viewPatient, setViewPatient] = useState(null)

  const filtered = useMemo(() => patients.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.contact.includes(search)
  ), [search])

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-500 pl-4">My Patients</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Patients under your care</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder="Search by name or contact..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400" />
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                {['Patient', 'Age / Gender', 'Contact', 'Blood Group', 'Last Visit', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-4 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map((p, idx) => (
                <motion.tr key={p.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}
                  className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center text-xs font-black group-hover:bg-blue-500 group-hover:text-white transition-all shrink-0">{p.name.charAt(0)}</div>
                      <div>
                        <p className="text-xs font-black text-slate-900">{p.name}</p>
                        <p className="text-[9px] font-bold text-slate-400">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.age} yrs • {p.gender}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-600">{p.contact}</td>
                  <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 text-[9px] font-black border border-rose-100">{p.bloodGroup}</span></td>
                  <td className="px-6 py-4 text-[10px] font-bold text-slate-400">{p.lastVisit}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => setViewPatient(p)} className="p-2 rounded-lg text-slate-400 hover:bg-blue-50 hover:text-blue-500 transition-all"><Eye size={14} /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {viewPatient && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-2xl p-8">
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-xl font-black">{viewPatient.name.charAt(0)}</div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">{viewPatient.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{viewPatient.id}</p>
                  </div>
                </div>
                <button onClick={() => setViewPatient(null)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"><X size={18} /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Age / Gender</p><p className="text-sm font-bold text-slate-900">{viewPatient.age} yrs • {viewPatient.gender}</p></div>
                  <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Blood Group</p><p className="text-sm font-bold text-rose-500">{viewPatient.bloodGroup}</p></div>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Contact</p><p className="text-sm font-bold text-slate-900">{viewPatient.contact}</p></div>
                <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100"><p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Medical History</p><p className="text-sm font-bold text-amber-900">{viewPatient.medicalHistory}</p></div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default PatientDetails



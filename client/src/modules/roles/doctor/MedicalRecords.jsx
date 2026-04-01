import { useState } from 'react'
import { FileText, Search } from 'lucide-react'
import { motion } from 'framer-motion'

const records = [
  { id: 'R-001', patient: 'Rohan Sharma', date: '2024-06-10', diagnosis: 'Type 2 Diabetes', prescription: 'Metformin 500mg', notes: 'Monitor blood sugar weekly' },
  { id: 'R-002', patient: 'Priya Verma', date: '2024-06-11', diagnosis: 'Mild Asthma', prescription: 'Salbutamol inhaler', notes: 'Avoid dust and allergens' },
  { id: 'R-003', patient: 'Amit Patel', date: '2024-06-09', diagnosis: 'Hypertension', prescription: 'Amlodipine 5mg', notes: 'Low sodium diet recommended' },
  { id: 'R-004', patient: 'Sara Khan', date: '2024-06-12', diagnosis: 'Allergic Dermatitis', prescription: 'Cetirizine 10mg', notes: 'Avoid known allergens' },
]

function MedicalRecords() {
  const [search, setSearch] = useState('')
  const filtered = records.filter(r => r.patient.toLowerCase().includes(search.toLowerCase()) || r.diagnosis.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="space-y-6 pb-10 animate-in fade-in duration-500">
      <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm">
        <h1 className="text-2xl font-black tracking-tight text-slate-900 border-l-4 border-blue-500 pl-4">Medical Records</h1>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1 pl-5">Patient diagnoses and prescriptions</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input type="text" placeholder="Search by patient or diagnosis..." value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-50 transition-all placeholder:text-slate-400" />
      </div>

      <div className="space-y-4">
        {filtered.map((r, idx) => (
          <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
            className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:border-blue-100 hover:shadow-md transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0"><FileText size={18} /></div>
                <div>
                  <p className="text-sm font-black text-slate-900">{r.patient}</p>
                  <p className="text-[10px] font-bold text-slate-400">{r.id} • {r.date}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest border border-blue-100">{r.diagnosis}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 p-3 rounded-xl">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Prescription</p>
                <p className="text-xs font-bold text-slate-900">{r.prescription}</p>
              </div>
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-100">
                <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest mb-1">Doctor Notes</p>
                <p className="text-xs font-bold text-amber-900">{r.notes}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default MedicalRecords

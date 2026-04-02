import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, CalendarCheck, Users, FileText, Clock, LogOut } from 'lucide-react'
import useAuth from '../../../hooks/useAuth'

const navigation = [
  { to: '/doctor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/doctor/appointments', label: 'My Appointments', icon: <CalendarCheck className="h-4 w-4" /> },
  { to: '/doctor/patients', label: 'My Patients', icon: <Users className="h-4 w-4" /> },
  { to: '/doctor/records', label: 'Medical Records', icon: <FileText className="h-4 w-4" /> },
  { to: '/doctor/schedule', label: 'My Schedule', icon: <Clock className="h-4 w-4" /> },
]

function DoctorSidebar({ collapsed }) {
  const { logout, user } = useAuth()

  if (collapsed) {
    return (
      <div className="flex h-full flex-col items-center py-6 gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-200 mb-6">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        {navigation.map((item) => (
          <div key={item.to} className="relative group">
            <NavLink to={item.to} className={({ isActive }) => `flex h-10 w-10 items-center justify-center rounded-xl transition-all ${isActive ? 'bg-blue-50 text-blue-500 border border-blue-100' : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'}`}>
              {item.icon}
            </NavLink>
            <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">{item.label}</div>
            </div>
          </div>
        ))}
        <div className="mt-auto relative group">
          <button onClick={logout} className="h-10 w-10 rounded-lg bg-rose-50 hover:bg-rose-500 flex items-center justify-center text-rose-500 hover:text-white transition-all">
            <LogOut size={18} />
          </button>
          <div className="absolute left-14 top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl">Logout</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col p-6">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500 text-white shadow-lg shadow-blue-200 shrink-0">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </div>
        <div>
          <span className="text-xl font-black uppercase tracking-widest text-[#0F172A]">HMS</span>
          <p className="text-[9px] font-black uppercase tracking-widest text-blue-500 leading-none mt-0.5">Doctor Portal</p>
        </div>
      </div>

      <div className="mb-6 px-3 py-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Doctor')}&background=3b82f6&color=fff&bold=true`} alt="doctor" className="h-9 w-9 rounded-xl object-cover shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-black text-slate-900 truncate">{user?.fullName || 'Doctor'}</p>
          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest truncate">{user?.email || ''}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
        {navigation.map((item) => (
          <NavLink key={item.to} to={item.to}
            className={({ isActive }) => `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-600 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto border-t border-slate-100 pt-6 px-2">
        <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest border border-rose-100/50">
          <LogOut size={16} /><span>Logout</span>
        </button>
      </div>
    </div>
  )
}

export default DoctorSidebar

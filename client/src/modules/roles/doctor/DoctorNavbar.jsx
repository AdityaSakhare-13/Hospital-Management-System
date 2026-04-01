import useAuth from '../../../hooks/useAuth'

function DoctorNavbar({ title, onToggle }) {
  const { user } = useAuth()
  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <header className="flex h-16 w-full items-center justify-between px-8 bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="flex items-center gap-4">
        <button onClick={onToggle} className="flex flex-col justify-center gap-1.5 w-8 h-8 shrink-0 group">
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-blue-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-blue-500 transition-colors rounded-full" />
          <span className="block h-0.5 w-5 bg-slate-400 group-hover:bg-blue-500 transition-colors rounded-full" />
        </button>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">{title}</h1>
      </div>
      <div className="flex items-center gap-6">
        <div className="hidden lg:block">
          <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">{today}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-black text-slate-900 leading-none">{user?.fullName || 'Doctor'}</p>
            <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">Physician</p>
          </div>
          <div className="h-10 w-10 rounded-xl border border-slate-200 hover:border-blue-500 hover:scale-105 transition-all cursor-pointer overflow-hidden group shadow-sm">
            <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Doctor')}&background=3b82f6&color=fff&bold=true`} alt="Profile" className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all" />
          </div>
        </div>
      </div>
    </header>
  )
}

export default DoctorNavbar

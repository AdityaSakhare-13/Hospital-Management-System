import { useState, useEffect, useCallback } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp, Users, Stethoscope, Package, IndianRupee,
  Download, RefreshCw, Calendar, AlertTriangle, CheckCircle,
  Activity, ChevronDown,
} from 'lucide-react'
import {
  fetchReportOverview,
  fetchFinancialReport,
  fetchPatientReport,
  fetchInventoryReport,
  fetchDoctorReport,
} from './reportApi'

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const fmt = (n) => new Intl.NumberFormat('en-IN').format(n ?? 0)
const fmtRupee = (n) => `₹${fmt(n)}`
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#ec4899', '#84cc16']

/** Convert array of objects → CSV download */
const downloadCSV = (rows, filename) => {
  if (!rows?.length) return
  const keys = Object.keys(rows[0])
  const header = keys.join(',')
  const body = rows.map(row =>
    keys.map(k => JSON.stringify(row[k] ?? '')).join(',')
  ).join('\n')
  const blob = new Blob([header + '\n' + body], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const TABS = [
  { key: 'overview',   label: 'Overview',    icon: Activity },
  { key: 'financial',  label: 'Financial',   icon: IndianRupee },
  { key: 'patients',   label: 'Patients',    icon: Users },
  { key: 'inventory',  label: 'Inventory',   icon: Package },
  { key: 'doctors',    label: 'Doctors',     icon: Stethoscope },
]

/* ── Small reusable components ──────────────────────────────────────────────── */
function StatCard({ label, value, sub, color = 'emerald', icon: Icon, warn }) {
  const bg = warn ? 'bg-rose-50 border-rose-100' : 'bg-white border-slate-100'
  const ic = warn ? 'text-rose-500' : `text-${color}-500`
  return (
    <div className={`rounded-2xl border p-5 shadow-sm ${bg}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-xl bg-slate-50 ${ic}`}>
          {Icon && <Icon size={18} />}
        </div>
        {warn && <AlertTriangle size={14} className="text-rose-400" />}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-2xl font-black text-slate-900">{value}</h3>
      {sub && <p className="text-[10px] text-slate-400 font-bold mt-1">{sub}</p>}
    </div>
  )
}

function SectionHeader({ title, sub, onDownload, loading }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-sm font-black text-slate-900 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">{title}</h2>
        {sub && <p className="text-[10px] font-bold text-slate-400 pl-4 mt-0.5">{sub}</p>}
      </div>
      {onDownload && (
        <button
          onClick={onDownload}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl transition-all shadow-sm shadow-emerald-500/30 disabled:opacity-50"
        >
          <Download size={13} />
          Export CSV
        </button>
      )}
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="animate-pulse rounded-2xl bg-slate-100 border border-slate-200 h-28" />
  )
}

function EmptyState({ msg = 'No data available' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-300">
      <CheckCircle size={40} className="mb-3" />
      <p className="text-xs font-black uppercase tracking-widest">{msg}</p>
    </div>
  )
}

/* ── Tab: Overview ─────────────────────────────────────────────────────────── */
function OverviewTab({ data, loading }) {
  if (loading) return <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">{Array(10).fill(0).map((_, i) => <LoadingCard key={i} />)}</div>
  if (!data) return <EmptyState msg="Could not load overview" />

  const cards = [
    { label: 'Total Patients',     value: fmt(data.patients?.total),      sub: `+${data.patients?.newThisMonth} this month`, icon: Users,       color: 'emerald' },
    { label: 'Active Doctors',     value: fmt(data.doctors?.active),       sub: `${data.doctors?.total} registered`,          icon: Stethoscope, color: 'blue' },
    { label: 'Appointments Today', value: fmt(data.appointments?.today),   sub: `${fmt(data.appointments?.total)} total`,     icon: Calendar,    color: 'orange' },
    { label: 'Revenue This Month', value: fmtRupee(data.finance?.revenueThisMonth),  sub: 'Paid bills only', icon: IndianRupee, color: 'purple' },
    { label: 'Net Profit (Month)', value: fmtRupee(data.finance?.netProfitThisMonth), sub: `Expenses: ${fmtRupee(data.finance?.expensesThisMonth)}`, icon: TrendingUp, color: data.finance?.netProfitThisMonth >= 0 ? 'emerald' : 'rose', warn: data.finance?.netProfitThisMonth < 0 },
    { label: 'Total Medicines',    value: fmt(data.inventory?.total),      sub: null, icon: Package, color: 'cyan' },
    { label: 'Low Stock Items',    value: fmt(data.inventory?.lowStock),   sub: 'Needs restocking', icon: AlertTriangle, color: 'rose', warn: data.inventory?.lowStock > 0 },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
        {cards.map((c, i) => <StatCard key={i} {...c} />)}
      </div>
      <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-700">
        ✅ Overview data is always for the current month. Use the Financial tab for custom date ranges.
      </div>
    </div>
  )
}

/* ── Tab: Financial ─────────────────────────────────────────────────────────── */
function FinancialTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (startDate && endDate) { params.startDate = startDate; params.endDate = endDate }
      setData(await fetchFinancialReport(params))
    } catch { setData(null) }
    setLoading(false)
  }, [startDate, endDate])

  useEffect(() => { load() }, [])

  const handleExport = () => {
    if (!data) return
    const rows = [
      { Metric: 'Total Revenue (Paid)', Amount: data.summary?.totalRevenue },
      { Metric: 'Total Billed',         Amount: data.summary?.totalBilled },
      { Metric: 'Total Expenses',       Amount: data.summary?.totalExpenses },
      { Metric: 'Net Profit',           Amount: data.summary?.netProfit },
      { Metric: 'Profit Margin (%)',    Amount: data.summary?.profitMargin },
    ]
    const monthRows = (data.charts?.monthlyRevenue || []).map(m => ({
      Month: `${m.monthName} ${m.year}`, Revenue: m.revenue,
    }))
    downloadCSV([...rows, { Metric: '--- Monthly Revenue ---', Amount: '' }, ...monthRows], 'financial_report.csv')
  }

  return (
    <div className="space-y-8">
      {/* Date filter */}
      <div className="flex flex-wrap items-end gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-100">
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Start Date</label>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400" />
        </div>
        <div>
          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">End Date</label>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 outline-none focus:border-emerald-400" />
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-2 px-5 py-2 bg-slate-900 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all disabled:opacity-50">
          <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Apply
        </button>
        {(startDate || endDate) && (
          <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-xs font-black text-rose-500 hover:underline">Clear</button>
        )}
        <div className="ml-auto">
          <button onClick={handleExport} disabled={!data || loading}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white text-xs font-black rounded-xl hover:bg-emerald-600 transition-all shadow-sm shadow-emerald-500/30 disabled:opacity-50">
            <Download size={13} /> Export CSV
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)}</div>
      ) : !data ? <EmptyState msg="No financial data" /> : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Revenue"   value={fmtRupee(data.summary?.totalRevenue)}   icon={IndianRupee} color="emerald" />
            <StatCard label="Total Billed"    value={fmtRupee(data.summary?.totalBilled)}    icon={TrendingUp}  color="blue" />
            <StatCard label="Total Expenses"  value={fmtRupee(data.summary?.totalExpenses)}  icon={ChevronDown} color="orange" />
            <StatCard label="Net Profit"      value={fmtRupee(data.summary?.netProfit)}      icon={TrendingUp}  color={data.summary?.netProfit >= 0 ? 'emerald' : 'rose'} sub={`${data.summary?.profitMargin}% margin`} warn={data.summary?.netProfit < 0} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Revenue vs Expenses */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">Revenue vs Expenses (Monthly)</h3>
              {data.charts?.monthlyRevenue?.length === 0 ? <EmptyState msg="No monthly data" /> : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.charts?.monthlyRevenue?.map(m => ({ name: m.monthName, Revenue: m.revenue }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={v => fmtRupee(v)} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="Revenue" fill="#10b981" radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Revenue by Type */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">Revenue by Bill Type</h3>
              {!data.charts?.revenueByType?.length ? <EmptyState msg="No type data" /> : (
                <div className="flex gap-6 items-center">
                  <ResponsiveContainer width="55%" height={180}>
                    <PieChart>
                      <Pie data={data.charts.revenueByType.map(d => ({ name: d._id || 'Other', value: d.total }))}
                        cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value">
                        {data.charts.revenueByType.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip formatter={v => fmtRupee(v)} contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {data.charts.revenueByType.map((d, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-black text-slate-500 uppercase">{d._id || 'Other'}</span>
                        <span className="text-[10px] font-bold text-slate-400 ml-1">{fmtRupee(d.total)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Expense breakdown table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Expense Breakdown by Category</h3>
            </div>
            <table className="w-full">
              <thead><tr className="bg-slate-50/60">
                <th className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Count</th>
                <th className="px-6 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</th>
              </tr></thead>
              <tbody className="divide-y divide-slate-50">
                {(data.charts?.expenseByCategory || []).length === 0 ? (
                  <tr><td colSpan={3} className="text-center px-6 py-8 text-xs font-bold text-slate-300">No expense data</td></tr>
                ) : data.charts.expenseByCategory.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50/50">
                    <td className="px-6 py-3 text-xs font-bold text-slate-700 capitalize">{row._id || '—'}</td>
                    <td className="px-6 py-3 text-right text-xs font-bold text-slate-500">{row.count}</td>
                    <td className="px-6 py-3 text-right text-xs font-black text-slate-900">{fmtRupee(row.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Tab: Patients ─────────────────────────────────────────────────────────── */
function PatientsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPatientReport().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const handleExport = () => {
    if (!data) return
    const rows = [
      { Metric: 'Total Patients',     Value: data.summary?.totalPatients },
      { Metric: 'Active',             Value: data.summary?.activePatients },
      { Metric: 'Admitted',           Value: data.summary?.admittedPatients },
      { Metric: 'Discharged',         Value: data.summary?.dischargedPatients },
      ...( data.genderDistribution || []).map(d => ({ Metric: `Gender: ${d._id}`, Value: d.count })),
      ...( data.departmentDistribution || []).map(d => ({ Metric: `Dept: ${d._id}`, Value: d.count })),
    ]
    downloadCSV(rows, 'patient_demographics_report.csv')
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Patient Demographics" sub="Distribution across status, gender, department & age" onDownload={handleExport} loading={loading} />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)}</div>
      ) : !data ? <EmptyState msg="No patient data" /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Patients"  value={fmt(data.summary?.totalPatients)}   icon={Users} color="emerald" />
            <StatCard label="Active"          value={fmt(data.summary?.activePatients)}  icon={CheckCircle} color="blue" />
            <StatCard label="Admitted"        value={fmt(data.summary?.admittedPatients)} icon={Activity} color="orange" />
            <StatCard label="Discharged"      value={fmt(data.summary?.dischargedPatients)} icon={TrendingUp} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gender Pie */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Gender Distribution</h3>
              {!data.genderDistribution?.length ? <EmptyState /> : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={data.genderDistribution.map(d => ({ name: d._id, value: d.count }))}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                        {data.genderDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    {data.genderDistribution.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-[10px] font-black text-slate-500">{d._id} ({d.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Status Pie */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Status Distribution</h3>
              {!data.statusDistribution?.length ? <EmptyState /> : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={data.statusDistribution.map(d => ({ name: d._id, value: d.count }))}
                        cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="value">
                        {data.statusDistribution.map((_, i) => <Cell key={i} fill={['#10b981','#3b82f6','#94a3b8'][i % 3]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-4 mt-2">
                    {data.statusDistribution.map((d, i) => (
                      <div key={i} className="flex items-center gap-1.5">
                        <div className="h-2 w-2 rounded-full" style={{ backgroundColor: ['#10b981','#3b82f6','#94a3b8'][i % 3] }} />
                        <span className="text-[10px] font-black text-slate-500">{d._id} ({d.count})</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Department bar */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">By Department</h3>
              {!data.departmentDistribution?.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.departmentDistribution.map(d => ({ dept: d._id || 'N/A', count: d.count }))} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 9, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="dept" type="category" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={70} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Age groups + New Patient Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">Age Group Distribution</h3>
              {!data.ageGroups?.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={data.ageGroups.map(a => ({ range: a.range, count: a.count }))}>
                    <XAxis dataKey="range" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={30} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">New Patients (6 Months)</h3>
              {!data.newPatientsTrend?.length ? <EmptyState msg="No trend data" /> : (
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={data.newPatientsTrend.map(m => ({ month: m.monthName, count: m.count }))}>
                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Tab: Inventory ─────────────────────────────────────────────────────────── */
function InventoryTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchInventoryReport().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const handleExport = () => {
    if (!data) return
    const rows = (data.lowStockItems || []).map(m => ({
      Name: m.name, Category: m.category, Quantity: m.quantity,
      MinStock: m.minStock, Price: m.price, Status: m.status, Supplier: m.supplier || '—',
    }))
    downloadCSV(rows, 'inventory_low_stock_report.csv')
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Inventory Status" sub="Medicine stock levels, expiry tracking & alerts" onDownload={handleExport} loading={loading} />

      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <LoadingCard key={i} />)}</div>
      ) : !data ? <EmptyState msg="No inventory data" /> : (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Medicines"   value={fmt(data.summary?.totalMedicines)}   icon={Package} color="blue" />
            <StatCard label="Available"         value={fmt(data.summary?.availableCount)}   icon={CheckCircle} color="emerald" />
            <StatCard label="Low Stock"         value={fmt(data.summary?.lowStockCount)}    icon={AlertTriangle} color="rose" warn={data.summary?.lowStockCount > 0} />
            <StatCard label="Out of Stock"      value={fmt(data.summary?.outOfStockCount)}  icon={AlertTriangle} color="rose" warn={data.summary?.outOfStockCount > 0} />
            <StatCard label="Expired"           value={fmt(data.summary?.expiredCount)}     icon={AlertTriangle} color="rose" warn={data.summary?.expiredCount > 0} />
            <StatCard label="Inventory Value"   value={fmtRupee(data.summary?.totalInventoryValue)} icon={IndianRupee} color="purple" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Category distribution */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-4">By Category</h3>
              {!data.categoryDistribution?.length ? <EmptyState /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={data.categoryDistribution.map(d => ({ cat: d._id || 'Other', count: d.count, qty: d.totalQty }))}>
                    <XAxis dataKey="cat" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                    <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                    <Bar dataKey="count" name="Items" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={18} />
                    <Bar dataKey="qty"   name="Total Qty" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>

            {/* Expiring soon */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Expiring Within 90 Days</h3>
                <span className="text-[9px] font-black bg-orange-50 text-orange-600 border border-orange-100 px-2 py-1 rounded-lg">
                  {data.expiringSoon?.length || 0} items
                </span>
              </div>
              <div className="overflow-y-auto max-h-52">
                {!data.expiringSoon?.length ? (
                  <div className="px-6 py-8 text-center text-xs font-bold text-slate-300">No items expiring soon</div>
                ) : data.expiringSoon.map((m, i) => (
                  <div key={i} className="flex items-center justify-between px-6 py-3 hover:bg-slate-50 border-b border-slate-50">
                    <div>
                      <p className="text-xs font-black text-slate-800">{m.name}</p>
                      <p className="text-[10px] font-bold text-slate-400 capitalize">{m.category}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-orange-600">{new Date(m.expiryDate).toLocaleDateString('en-IN')}</p>
                      <p className="text-[10px] font-bold text-slate-400">Qty: {m.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Low stock table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Low Stock Items</h3>
              <span className="text-[9px] font-black bg-rose-50 text-rose-500 border border-rose-100 px-2 py-1 rounded-lg">
                {data.lowStockItems?.length || 0} items
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-slate-50/60">
                  {['Medicine', 'Category', 'Qty', 'Min Stock', 'Price', 'Status'].map(h => (
                    <th key={h} className="px-6 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {!data.lowStockItems?.length ? (
                    <tr><td colSpan={6} className="text-center px-6 py-8 text-xs font-bold text-slate-300">All stock levels OK ✅</td></tr>
                  ) : data.lowStockItems.map((m, i) => (
                    <tr key={i} className="hover:bg-rose-50/30">
                      <td className="px-6 py-3 text-xs font-black text-slate-800">{m.name}</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-500 capitalize">{m.category}</td>
                      <td className="px-6 py-3 text-xs font-black text-rose-600">{m.quantity}</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-500">{m.minStock}</td>
                      <td className="px-6 py-3 text-xs font-bold text-slate-700">{fmtRupee(m.price)}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                          m.status === 'available' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-500 border border-rose-100'
                        }`}>{m.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

/* ── Tab: Doctors ─────────────────────────────────────────────────────────── */
function DoctorsTab() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDoctorReport().then(setData).catch(() => setData(null)).finally(() => setLoading(false))
  }, [])

  const handleExport = () => {
    if (!data) return
    const rows = (data.performance || []).map(d => ({
      Name: d.name, Specialization: d.specialization, Department: d.category,
      RoleLevel: d.roleLevel, Shift: d.shift, Status: d.status,
      Rating: d.rating, TotalAppointments: d.totalAppointments,
      Completed: d.completedAppointments, Cancelled: d.cancelledAppointments,
      CompletionRate: `${d.completionRate}%`,
    }))
    downloadCSV(rows, 'doctor_performance_report.csv')
  }

  return (
    <div className="space-y-8">
      <SectionHeader title="Doctor Performance" sub="Appointment completion rates & workload analysis" onDownload={handleExport} loading={loading} />

      {loading ? (
        <div className="space-y-3">{Array(5).fill(0).map((_, i) => <div key={i} className="animate-pulse h-16 bg-slate-100 rounded-xl" />)}</div>
      ) : !data ? <EmptyState msg="No doctor data" /> : (
        <>
          {/* Monthly Trend */}
          {data.charts?.monthlyTrend?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">Appointment Trend (6 Months)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={data.charts.monthlyTrend.map(m => ({ month: m.monthName, Total: m.count, Completed: m.completed }))}>
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                  <Legend wrapperStyle={{ fontSize: '10px', fontWeight: 700 }} />
                  <Line type="monotone" dataKey="Total"     stroke="#3b82f6" strokeWidth={2.5} dot={{ r: 4, fill: '#3b82f6' }} />
                  <Line type="monotone" dataKey="Completed" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Doctor performance table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-50">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest">Doctor Appointment Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-slate-50/60">
                  {['Doctor', 'Dept / Role', 'Shift', 'Rating', 'Total', 'Completed', 'Completion Rate'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {!data.performance?.length ? (
                    <tr><td colSpan={7} className="text-center px-6 py-8 text-xs font-bold text-slate-300">No appointment records found</td></tr>
                  ) : data.performance.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-black">
                            {d.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-xs font-black text-slate-900">{d.name}</p>
                            <p className="text-[10px] font-bold text-slate-400">{d.specialization}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs font-bold text-slate-500 capitalize">{d.category || '—'}<br/><span className="text-[9px] text-slate-400">{d.roleLevel}</span></td>
                      <td className="px-5 py-3 text-xs font-bold text-slate-500">{d.shift || '—'}</td>
                      <td className="px-5 py-3 text-xs font-black text-amber-500">{'★'.repeat(Math.round(d.rating || 0))} {d.rating ?? 0}/5</td>
                      <td className="px-5 py-3 text-xs font-black text-slate-700">{d.totalAppointments}</td>
                      <td className="px-5 py-3 text-xs font-bold text-emerald-600">{d.completedAppointments}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-100 rounded-full h-1.5 max-w-16">
                            <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${Math.min(d.completionRate, 100)}%` }} />
                          </div>
                          <span className="text-[10px] font-black text-slate-600">{d.completionRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dept appointment breakdown */}
          {data.charts?.departmentAppointments?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest mb-5">Appointments by Department</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={data.charts.departmentAppointments.map(d => ({ dept: d._id || 'N/A', count: d.count }))}>
                  <XAxis dataKey="dept" tick={{ fontSize: 9, fontWeight: 700, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', fontSize: '11px', fontWeight: 700 }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  )
}

/* ── Main ReportsDashboard ──────────────────────────────────────────────────── */
export default function ReportsDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
  const [overview,  setOverview]  = useState(null)
  const [ovLoading, setOvLoading] = useState(true)

  useEffect(() => {
    fetchReportOverview()
      .then(setOverview)
      .catch(() => setOverview(null))
      .finally(() => setOvLoading(false))
  }, [])

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500 font-medium text-sm mt-1">Hospital performance insights — financial, clinical & operational.</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Data</span>
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl w-fit flex-wrap">
        {TABS.map(tab => {
          const Icon = tab.icon
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${
                activeTab === tab.key
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
              <Icon size={13} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.18 }}>
          {activeTab === 'overview'  && <OverviewTab data={overview} loading={ovLoading} />}
          {activeTab === 'financial' && <FinancialTab />}
          {activeTab === 'patients'  && <PatientsTab />}
          {activeTab === 'inventory' && <InventoryTab />}
          {activeTab === 'doctors'   && <DoctorsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

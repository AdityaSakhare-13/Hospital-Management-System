import api from '../../../api/axios'

const extractError = (err) => {
  const d = err.response?.data
  if (d?.message) throw new Error(d.message)
  throw new Error(err.message || 'Something went wrong')
}

// ── Overview (combined KPI summary) ──────────────────────────────────────────
export const fetchReportOverview = async () => {
  try {
    const res = await api.get('/reports/overview')
    return res.data.data
  } catch (e) { extractError(e) }
}

// ── Financial Report ─────────────────────────────────────────────────────────
// params: { startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD' }
export const fetchFinancialReport = async (params = {}) => {
  try {
    const res = await api.get('/reports/financial', { params })
    return res.data.data
  } catch (e) { extractError(e) }
}

// ── Patient Demographics ──────────────────────────────────────────────────────
export const fetchPatientReport = async () => {
  try {
    const res = await api.get('/reports/patients')
    return res.data.data
  } catch (e) { extractError(e) }
}

// ── Inventory Status ──────────────────────────────────────────────────────────
export const fetchInventoryReport = async () => {
  try {
    const res = await api.get('/reports/inventory')
    return res.data.data
  } catch (e) { extractError(e) }
}

// ── Doctor Performance ────────────────────────────────────────────────────────
export const fetchDoctorReport = async () => {
  try {
    const res = await api.get('/reports/doctors')
    return res.data.data
  } catch (e) { extractError(e) }
}

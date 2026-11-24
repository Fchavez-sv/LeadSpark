import { useCallback, useEffect, useMemo, useState } from 'react'
import MetricsCards from '../components/dashboard/MetricsCards'
import LeadsToolbar from '../components/dashboard/LeadsToolbar'
import LeadsList from '../components/dashboard/LeadsList'
import LeadNotesPanel from '../components/dashboard/LeadNotesPanel'
import { useAuth } from '../hooks/useAuth'
import { listLeads, updateLeadStatus } from '../services/leads.service'

function normalize(value) {
  return String(value ?? '').toLowerCase()
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [allLeads, setAllLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [updatingLeadId, setUpdatingLeadId] = useState(null)
  const [selectedLead, setSelectedLead] = useState(null)
  const [statusMessage, setStatusMessage] = useState('')

  const loadLeads = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    }
    setError('')
    try {
      const data = await listLeads()
      setAllLeads(data)
    } catch (err) {
      setError(
        err?.message || 'No se pudieron cargar los leads. Verifica tu sesión y la conexión con Supabase.',
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLeads()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadLeads])

  const metrics = useMemo(() => {
    const total = allLeads.length
    const nuevos = allLeads.filter((lead) => lead.status === 'nuevo').length
    const calificados = allLeads.filter((lead) => lead.status === 'calificado').length
    return { total, nuevos, calificados }
  }, [allLeads])

  const filteredLeads = useMemo(() => {
    const term = search.trim().toLowerCase()
    return allLeads.filter((lead) => {
      if (statusFilter !== 'all' && lead.status !== statusFilter) return false
      if (!term) return true
      const haystack = [lead.full_name, lead.email, lead.phone, lead.company, lead.source]
        .map(normalize)
        .join(' ')
      return haystack.includes(term)
    })
  }, [allLeads, search, statusFilter])

  async function handleStatusChange(leadId, nextStatus) {
    setStatusMessage('')
    setUpdatingLeadId(leadId)
    try {
      const updated = await updateLeadStatus(leadId, nextStatus)
      setAllLeads((prev) => prev.map((lead) => (lead.id === leadId ? { ...lead, ...updated } : lead)))
      setSelectedLead((prev) => (prev?.id === leadId ? { ...prev, ...updated } : prev))
      setStatusMessage('Estado del lead actualizado correctamente.')
    } catch (err) {
      setStatusMessage(err?.message || 'No se pudo actualizar el estado del lead.')
    } finally {
      setUpdatingLeadId(null)
    }
  }

  function handleOpenNotes(lead) {
    setSelectedLead(lead)
  }

  function handleCloseNotes() {
    setSelectedLead(null)
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Dashboard de leads</h1>
          <p className="mt-1 text-sm text-slate-600">
            Gestiona el pipeline: revisa métricas, filtra leads, actualiza estados y registra notas de seguimiento.
          </p>
        </div>
        <p className="text-sm text-slate-500">
          Mostrando <span className="font-medium text-slate-700">{filteredLeads.length}</span> de{' '}
          <span className="font-medium text-slate-700">{allLeads.length}</span> leads
        </p>
      </div>

      <MetricsCards metrics={metrics} loading={loading && !allLeads.length} />

      <LeadsToolbar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onRefresh={() => loadLeads({ silent: true })}
        refreshing={refreshing}
      />

      {statusMessage ? (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm" role="status">
          {statusMessage}
        </div>
      ) : null}

      <LeadsList
        leads={filteredLeads}
        loading={loading}
        error={error}
        updatingLeadId={updatingLeadId}
        onStatusChange={handleStatusChange}
        onOpenNotes={handleOpenNotes}
      />

      {selectedLead ? (
        <LeadNotesPanel lead={selectedLead} authorId={user?.id} onClose={handleCloseNotes} />
      ) : null}
    </section>
  )
}

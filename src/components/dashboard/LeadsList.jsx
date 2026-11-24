import { MessageSquarePlus } from 'lucide-react'
import { LEAD_STATUS_LABELS, LEAD_STATUS_STYLES, LEAD_STATUSES } from '../../utils/constants'

function formatDate(value) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(value))
  } catch {
    return value
  }
}

export default function LeadsList({ leads, loading, error, updatingLeadId, onStatusChange, onOpenNotes }) {
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600 shadow-sm">
        Cargando leads…
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 shadow-sm" role="alert">
        {error}
      </div>
    )
  }

  if (!leads.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        No hay leads que coincidan con los filtros actuales.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => {
        const isUpdating = updatingLeadId === lead.id
        const statusStyle = LEAD_STATUS_STYLES[lead.status] || 'bg-slate-100 text-slate-700'
        return (
          <article
            key={lead.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="truncate text-base font-semibold text-slate-900">{lead.full_name}</h3>
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyle}`}>
                    {LEAD_STATUS_LABELS[lead.status] || lead.status}
                  </span>
                </div>
                <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-slate-600 sm:grid-cols-2">
                  <p><span className="font-medium text-slate-700">Correo:</span> {lead.email}</p>
                  <p><span className="font-medium text-slate-700">Teléfono:</span> {lead.phone || '—'}</p>
                  <p><span className="font-medium text-slate-700">Empresa:</span> {lead.company || '—'}</p>
                  <p><span className="font-medium text-slate-700">Origen:</span> {lead.source || '—'}</p>
                  <p><span className="font-medium text-slate-700">Fecha:</span> {formatDate(lead.created_at)}</p>
                </div>
              </div>

              <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[220px]">
                <label htmlFor={`status-${lead.id}`} className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Estado
                </label>
                <select
                  id={`status-${lead.id}`}
                  value={lead.status}
                  onChange={(e) => onStatusChange(lead.id, e.target.value)}
                  disabled={isUpdating}
                  className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {LEAD_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {LEAD_STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => onOpenNotes(lead)}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                  Notas
                </button>
                {isUpdating ? <p className="text-xs text-slate-500">Actualizando estado…</p> : null}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

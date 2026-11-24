import { useEffect, useState } from 'react'
import { CircleAlert, LoaderCircle, MessageSquarePlus, X } from 'lucide-react'
import { createLeadNote, listLeadNotes } from '../../services/leadNotes.service'

function formatDateTime(value) {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('es', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value))
  } catch {
    return value
  }
}

export default function LeadNotesPanel({ lead, authorId, onClose }) {
  const [notes, setNotes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [noteText, setNoteText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadNotes() {
      if (!lead?.id) return
      setLoading(true)
      setError('')
      try {
        const data = await listLeadNotes(lead.id)
        if (!cancelled) setNotes(data)
      } catch (err) {
        if (!cancelled) setError(err?.message || 'No se pudieron cargar las notas.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadNotes()
    return () => {
      cancelled = true
    }
  }, [lead?.id])

  async function handleAddNote(event) {
    event.preventDefault()
    setSaveError('')
    const trimmed = noteText.trim()
    if (!trimmed) {
      setSaveError('Escribe una nota antes de guardar.')
      return
    }
    if (!authorId) {
      setSaveError('No se pudo identificar al usuario autenticado.')
      return
    }

    setSaving(true)
    try {
      const created = await createLeadNote({ leadId: lead.id, authorId, note: trimmed })
      setNotes((prev) => [created, ...prev])
      setNoteText('')
    } catch (err) {
      setSaveError(err?.message || 'No se pudo guardar la nota.')
    } finally {
      setSaving(false)
    }
  }

  if (!lead) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/40"
        aria-label="Cerrar panel de notas"
        onClick={onClose}
      />
      <aside className="relative flex h-full w-full max-w-lg flex-col bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Notas de seguimiento</p>
            <h2 className="mt-1 truncate text-lg font-semibold text-slate-900">{lead.full_name}</h2>
            <p className="mt-0.5 truncate text-sm text-slate-600">{lead.email}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="ml-3 rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <form onSubmit={handleAddNote} className="space-y-3">
            <label htmlFor="lead-note" className="block text-sm font-medium text-slate-700">
              Agregar nota
            </label>
            <textarea
              id="lead-note"
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Escribe el seguimiento, próximo paso o contexto relevante…"
              className="block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
            {saveError ? (
              <p className="text-sm text-red-600" role="alert">
                {saveError}
              </p>
            ) : null}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {saving ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
                )}
                Guardar nota
              </button>
            </div>
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
              Cargando notas…
            </div>
          ) : error ? (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <CircleAlert className="mt-0.5 h-4 w-4 flex-none" aria-hidden="true" />
              <p>{error}</p>
            </div>
          ) : notes.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
              Aún no hay notas para este lead.
            </div>
          ) : (
            <ul className="space-y-3">
              {notes.map((note) => (
                <li key={note.id} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <p className="whitespace-pre-wrap text-sm text-slate-800">{note.note}</p>
                  <p className="mt-2 text-xs text-slate-500">{formatDateTime(note.created_at)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  )
}

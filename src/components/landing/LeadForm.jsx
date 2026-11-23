import { useState } from 'react'
import { CheckCircle2, CircleAlert, LoaderCircle, Send } from 'lucide-react'
import { validateLeadForm } from '../../schemas/lead.schema'
import { createLead } from '../../services/leads.service'
import { LEAD_SOURCES } from '../../utils/constants'

const initialValues = {
  full_name: '',
  email: '',
  phone: '',
  company: '',
  source: '',
  privacy_consent: false,
}

function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1 text-sm text-red-600">{message}</p>
}

export default function LeadForm() {
  const [values, setValues] = useState(initialValues)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitError, setSubmitError] = useState('')
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(name, value) {
    setValues((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
    setSubmitError('')
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')
    setSubmitSuccess(false)

    const result = validateLeadForm(values)
    if (!result.success) {
      const issues = result.error.issues ?? result.error.errors ?? []
      const nextErrors = {}
      for (const issue of issues) {
        const key = issue.path?.[0]
        if (key && !nextErrors[key]) {
          nextErrors[key] = issue.message
        }
      }
      setFieldErrors(nextErrors)
      return
    }

    setIsSubmitting(true)
    try {
      await createLead(result.data)
      setValues(initialValues)
      setFieldErrors({})
      setSubmitSuccess(true)
    } catch (error) {
      const message =
        error?.message ||
        'No pudimos enviar tu información en este momento. Inténtalo nuevamente.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-slate-900">Solicita más información</h2>
        <p className="mt-1 text-sm text-slate-600">
          Completa el formulario y nuestro equipo se pondrá en contacto contigo.
        </p>
      </div>

      {submitSuccess ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-emerald-800"
          role="status"
        >
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <div>
            <p className="font-medium">¡Gracias! Recibimos tus datos.</p>
            <p className="mt-1 text-sm text-emerald-700">
              Nuestro equipo revisará tu solicitud y te contactará pronto.
            </p>
          </div>
        </div>
      ) : null}

      {submitError ? (
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
          role="alert"
        >
          <CircleAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <div>
            <p className="font-medium">No se pudo enviar el formulario</p>
            <p className="mt-1 text-sm text-red-700">{submitError}</p>
          </div>
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="full_name" className="block text-sm font-medium text-slate-700">
              Nombre completo <span className="text-red-600">*</span>
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              value={values.full_name}
              onChange={(e) => updateField('full_name', e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                fieldErrors.full_name ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="Ej. Ana Martínez"
              aria-invalid={Boolean(fieldErrors.full_name)}
              aria-describedby={fieldErrors.full_name ? 'full_name-error' : undefined}
            />
            <div id="full_name-error">
              <FieldError message={fieldErrors.full_name} />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Correo electrónico <span className="text-red-600">*</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(e) => updateField('email', e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                fieldErrors.email ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="ana@empresa.com"
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            <div id="email-error">
              <FieldError message={fieldErrors.email} />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700">
              Teléfono
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                fieldErrors.phone ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="+503 0000 0000"
              aria-invalid={Boolean(fieldErrors.phone)}
              aria-describedby={fieldErrors.phone ? 'phone-error' : undefined}
            />
            <div id="phone-error">
              <FieldError message={fieldErrors.phone} />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium text-slate-700">
              Empresa
            </label>
            <input
              id="company"
              name="company"
              type="text"
              autoComplete="organization"
              value={values.company}
              onChange={(e) => updateField('company', e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                fieldErrors.company ? 'border-red-400' : 'border-slate-300'
              }`}
              placeholder="Nombre de tu empresa"
              aria-invalid={Boolean(fieldErrors.company)}
              aria-describedby={fieldErrors.company ? 'company-error' : undefined}
            />
            <div id="company-error">
              <FieldError message={fieldErrors.company} />
            </div>
          </div>

          <div>
            <label htmlFor="source" className="block text-sm font-medium text-slate-700">
              Origen / Fuente <span className="text-red-600">*</span>
            </label>
            <select
              id="source"
              name="source"
              value={values.source}
              onChange={(e) => updateField('source', e.target.value)}
              className={`mt-1 block w-full rounded-lg border bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 ${
                fieldErrors.source ? 'border-red-400' : 'border-slate-300'
              }`}
              aria-invalid={Boolean(fieldErrors.source)}
              aria-describedby={fieldErrors.source ? 'source-error' : undefined}
            >
              <option value="">Selecciona una opción</option>
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
            <div id="source-error">
              <FieldError message={fieldErrors.source} />
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              name="privacy_consent"
              checked={values.privacy_consent}
              onChange={(e) => updateField('privacy_consent', e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              aria-invalid={Boolean(fieldErrors.privacy_consent)}
              aria-describedby={
                fieldErrors.privacy_consent ? 'privacy_consent-error' : 'privacy_consent-help'
              }
            />
            <span className="text-sm text-slate-700">
              Acepto la <span className="font-medium">política de privacidad</span> y autorizo el
              tratamiento de mis datos para ser contactado por el equipo.{' '}
              <span className="text-red-600">*</span>
              <span id="privacy_consent-help" className="mt-1 block text-xs text-slate-500">
                Este consentimiento es obligatorio para enviar el formulario.
              </span>
            </span>
          </label>
          <div id="privacy_consent-error">
            <FieldError message={fieldErrors.privacy_consent} />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Enviando…
              </>
            ) : (
              <>
                <Send className="h-4 w-4" aria-hidden="true" />
                Enviar solicitud
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

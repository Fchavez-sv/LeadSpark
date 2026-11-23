import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { CircleAlert, LoaderCircle, LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function getRedirectPath(location) {
  const from = location.state?.from
  if (!from) return '/dashboard'
  const path = `${from.pathname || '/dashboard'}${from.search || ''}${from.hash || ''}`
  return path.startsWith('/') ? path : '/dashboard'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, loading, signInWithPassword } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const redirectTo = getRedirectPath(location)

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true })
    }
  }, [isAuthenticated, navigate, redirectTo])

  if (loading) {
    return (
      <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-4 py-16">
        <div className="flex items-center gap-2 text-slate-600">
          <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Verificando sesión…</span>
        </div>
      </section>
    )
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError('')

    const trimmedEmail = email.trim().toLowerCase()
    if (!trimmedEmail || !password) {
      setFormError('Ingresa tu correo y contraseña.')
      return
    }

    setIsSubmitting(true)
    try {
      const { error } = await signInWithPassword(trimmedEmail, password)
      if (error) {
        const message =
          error.message === 'Invalid login credentials'
            ? 'Correo o contraseña incorrectos.'
            : error.message || 'No fue posible iniciar sesión. Inténtalo nuevamente.'
        setFormError(message)
        return
      }
      navigate(redirectTo, { replace: true })
    } catch {
      setFormError('Ocurrió un error inesperado. Inténtalo nuevamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto flex min-h-[calc(100vh-73px)] max-w-6xl items-center justify-center px-4 py-16">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">LeadSpark</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">Acceso del equipo</h1>
          <p className="mt-2 text-sm text-slate-600">
            Inicia sesión con tu cuenta interna para gestionar los leads.
          </p>
        </div>

        {formError ? (
          <div
            className="mb-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800"
            role="alert"
          >
            <CircleAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
            <p className="text-sm">{formError}</p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                if (formError) setFormError('')
              }}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="equipo@empresa.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                if (formError) setFormError('')
              }}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                Iniciando sesión…
              </>
            ) : (
              <>
                <LogIn className="h-4 w-4" aria-hidden="true" />
                Iniciar sesión
              </>
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Acceso restringido al equipo interno. Si no tienes credenciales, contacta a un administrador.
        </p>
      </div>
    </section>
  )
}

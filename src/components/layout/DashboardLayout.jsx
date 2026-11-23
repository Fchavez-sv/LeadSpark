import { Link, Outlet, useNavigate } from 'react-router-dom'
import { LogOut, LayoutDashboard } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

export default function DashboardLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/dashboard" className="flex items-center gap-2 font-semibold text-slate-900">
            <LayoutDashboard className="h-5 w-5" aria-hidden="true" />
            <span>LeadSpark CRM</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden text-slate-600 sm:inline">{user?.email}</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}

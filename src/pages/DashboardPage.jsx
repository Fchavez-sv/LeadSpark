export default function DashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard de leads</h1>
        <p className="mt-1 text-sm text-slate-600">
          Ruta protegida activa (Paso 3). Aquí implementaremos métricas, filtros, tabla/tarjetas,
          cambio de estado y notas de seguimiento.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {['Total de leads', 'Nuevos', 'Calificados'].map((label) => (
          <div key={label} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">—</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500">
        Tabla de leads, búsqueda/filtros y panel de notas pendientes de implementación.
      </div>
    </section>
  )
}

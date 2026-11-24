const cards = [
  { key: 'total', label: 'Total de leads', tone: 'text-slate-900' },
  { key: 'nuevos', label: 'Nuevos', tone: 'text-blue-700' },
  { key: 'calificados', label: 'Calificados', tone: 'text-emerald-700' },
]

export default function MetricsCards({ metrics, loading }) {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className={`mt-2 text-3xl font-semibold ${card.tone}`}>
            {loading ? '…' : (metrics?.[card.key] ?? 0)}
          </p>
        </div>
      ))}
    </div>
  )
}

import LeadForm from '../components/landing/LeadForm'

export default function LandingPage() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">LeadSpark</p>
          <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Convierte visitantes en oportunidades reales
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            Comparte tus datos y nuestro equipo se pondrá en contacto contigo para entender tus
            necesidades y acompañarte en el siguiente paso.
          </p>
          <ul className="mt-8 space-y-3 text-left text-sm text-slate-700">
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-blue-600" />
              <span>Respuesta rápida por parte del equipo interno.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-blue-600" />
              <span>Seguimiento centralizado y seguro de tu solicitud.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-1 inline-block h-2 w-2 flex-none rounded-full bg-blue-600" />
              <span>Tus datos se usan únicamente para contactarte, con tu consentimiento.</span>
            </li>
          </ul>
        </div>

        <div className="mx-auto w-full max-w-xl">
          <LeadForm />
        </div>
      </div>
    </section>
  )
}


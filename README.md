# LeadSpark — Sistema de Administración y Captación de Leads

MVP de captación y gestión de leads construido con **React + Vite + Tailwind CSS** y **Supabase** (PostgreSQL, Auth y Row Level Security), con flujo de CI/CD para **Vercel** mediante **GitHub Actions**.

## Funcionalidades (MVP)

- **Landing pública (`/`)**: formulario de captación (nombre, correo, teléfono, empresa, origen/fuente y consentimiento de privacidad obligatorio) con validación en cliente usando **Zod** antes de enviar.
- **Autenticación interna (`/login`)**: inicio de sesión del equipo con **Supabase Auth** (email/contraseña).
- **Dashboard CRM protegido (`/dashboard`)**:
  - Métricas rápidas: total de leads, nuevos y calificados.
  - Búsqueda y filtro por estado (`nuevo`, `contactado`, `calificado`, `descartado`).
  - Listado de leads con cambio de estado.
  - Panel lateral para ver y agregar notas de seguimiento por lead.
- **Seguridad (RLS)**:
  - `anon`: solo `INSERT` en `leads` (con consentimiento y estado inicial `nuevo`).
  - `authenticated`: `SELECT`/`UPDATE` en `leads` y `SELECT`/`INSERT` en `lead_notes`.
  - Tabla `profiles` vinculada a `auth.users` con aprovisionamiento por trigger.
- **DevOps**: workflow en [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) para lint, build y despliegue a Vercel.

## Stack tecnológico

- Frontend: React, Vite, Tailwind CSS v4 (`@tailwindcss/vite`), React Router, Lucide React, Zod
- Backend/BaaS: Supabase (PostgreSQL, Auth JWT, RLS)
- Calidad/CI: oxlint, Vite build, GitHub Actions
- Despliegue: Vercel

## Requisitos previos

- **Node.js** 20+ y **npm**
- **Git**
- Una cuenta y proyecto en **[Supabase](https://supabase.com/)** (plan gratuito es suficiente)

## Configuración local (para probar el proyecto)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/Fchavez-sv/LeadSpark.git
cd LeadSpark
npm install
```

> En Windows PowerShell, si `npm` falla por la política de ejecución de scripts (`npm.ps1`), puedes usar `npm.cmd` (por ejemplo, `npm.cmd install`, `npm.cmd run dev`) o ejecutar los comandos desde `cmd`.

### 2. Crear proyecto en Supabase y aplicar el esquema SQL

1. Crea un proyecto en Supabase.
2. Abre **SQL Editor** y ejecuta el contenido de [`supabase/schema.sql`](supabase/schema.sql).
   - Crea tablas `profiles`, `leads`, `lead_notes`, triggers, índices y políticas RLS.
3. (Opcional, recomendado para pruebas) Ejecuta [`supabase/seed.sql`](supabase/seed.sql) para insertar datos de prueba.
   - Las notas de ejemplo se crean con `author_id = NULL`; puedes reemplazarlo por el UUID de un usuario de `auth.users` si deseas asociarlas.

### 3. Configurar variables de entorno

Copia el archivo de ejemplo y completa los valores de tu proyecto Supabase (**Project Settings → API**):

```bash
cp .env.example .env.local
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env.local
```

Edita `.env.local`:

```env
VITE_SUPABASE_URL=https://TU_PROYECTO.supabase.co
VITE_SUPABASE_ANON_KEY=TU_ANON_PUBLIC_KEY
```

> Usa solo la **anon/public key** en el frontend. Nunca expongas la `service_role` key. Después de crear o modificar `.env.local`, reinicia el servidor de desarrollo.

### 4. Crear un usuario interno para el dashboard

1. En Supabase, ve a **Authentication → Users** y crea un usuario (email y contraseña).
2. Con ese usuario podrás iniciar sesión en `/login` y acceder a `/dashboard`.
3. Si creaste usuarios antes de ejecutar el trigger de perfiles definido en `schema.sql`, ejecuta el backfill indicado en las notas del propio script para poblar `public.profiles`.

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Abre la URL mostrada por Vite (por defecto `http://localhost:5173`).

- `/` → formulario público de captación (inserta en `leads`).
- `/login` → acceso del equipo.
- `/dashboard` → CRM protegido (requiere sesión autenticada).

## Scripts disponibles

- `npm run dev`: servidor de desarrollo
- `npm run build`: build de producción
- `npm run preview`: vista previa del build
- `npm run lint`: linting con oxlint

## Estructura del proyecto (resumen)

```text
.
├─ .github/workflows/ci-cd.yml   # CI/CD: lint, build y deploy a Vercel
├─ supabase/
│  ├─ schema.sql                 # Esquema, triggers y RLS
│  └─ seed.sql                   # Datos de prueba
├─ src/
│  ├─ components/
│  │  ├─ dashboard/              # Métricas, filtros, listado y panel de notas
│  │  ├─ landing/                # Formulario de captación
│  │  └─ layout/                 # Layouts público y dashboard
│  ├─ contexts/                  # AuthProvider (sesión Supabase)
│  ├─ hooks/                     # useAuth
│  ├─ lib/                       # Cliente Supabase
│  ├─ pages/                     # Landing, Login, Dashboard
│  ├─ routes/                    # Router y ruta protegida
│  ├─ schemas/                   # Validaciones Zod
│  ├─ services/                  # Acceso a datos (leads, notas)
│  └─ utils/                     # Constantes y utilidades
├─ .env.example
└─ package.json
```

## CI/CD y despliegue (Vercel)

El workflow [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml) ejecuta lint/build en pushes y PRs a `main`, y despliega a producción en Vercel cuando hay push a `main` (si los secrets están configurados).

Secrets de GitHub Actions requeridos para el deploy:
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_SUPABASE_URL` (recomendado para build/deploy)
- `VITE_SUPABASE_ANON_KEY` (recomendado para build/deploy)

También se deben configurar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en las **Environment Variables** del proyecto en Vercel.

> Al hacer un fork para pruebas locales, no es necesario configurar estos secrets: basta con completar `.env.local` y ejecutar la app con `npm run dev` contra tu propio proyecto Supabase.

## Notas de seguridad

- Las políticas RLS limitan al rol `anon` a insertar leads con consentimiento y estado `nuevo`; las operaciones de gestión requieren usuario autenticado.
- La validación del formulario se realiza con Zod en el cliente y se refuerza con constraints/policies en la base de datos.
- No se incluyen credenciales reales en el repositorio (`.env.local` está ignorado).


# Nuvvi Frontend

Frontend for **Nuvvi by Hennesy** — SaaS de facturación electrónica, inventario y ventas.

Built with React 18, Vite 5, TypeScript, TailwindCSS, shadcn/ui, and Three.js.

---

## Tech Stack

- **React 18** with TypeScript
- **Vite 5** (build tool)
- **TailwindCSS 3** + `tailwindcss-animate`
- **shadcn/ui** components (button primitives)
- **Three.js** + `@react-three/fiber` + `@react-three/drei`
- **Framer Motion** animations
- **React Router** v6
- **TanStack Query** v5
- **Axios** HTTP client
- **React Hook Form** + **Zod** validation
- **Sonner** toast notifications
- **Recharts** charts (available, not yet used)

---

## Prerequisites

- Node.js 20+
- pnpm 9+

---

## Quick Start (Windows)

```powershell
cd "C:\Users\Usuario\Documents\Proyectos\Nuvvi\Nuvvi FRONTEND"

pnpm install
pnpm dev -- --host 0.0.0.0 --port 5174
```

The app will be available at [http://localhost:5174](http://localhost:5174).

---

## Build for Production

```bash
pnpm build
```

Output goes to `dist/`.

---

## Docker (Production)

```bash
docker compose up --build
```

Serves on port 5174 (mapped to 80 inside container).

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_APP_NAME` | `Nuvvi` | Application name |
| `VITE_APP_ENV` | `development` | Environment |
| `VITE_API_BASE_URL` | `http://localhost:8000` | Backend API URL |
| `VITE_API_PREFIX` | `/api` | API prefix |
| `VITE_ENABLE_3D` | `true` | Enable 3D visualizations |

Copy `.env.example` to `.env` and customize.

---

## Project Structure

```
Nuvvi FRONTEND/
├── public/
├── src/
│   ├── app/              # App-level config
│   ├── api/              # Axios client with interceptors
│   ├── assets/           # Static assets
│   ├── components/
│   │   ├── ui/           # shadcn/ui primitives
│   │   ├── layout/       # AppLayout, Sidebar, Topbar
│   │   ├── common/       # StatCard, PageHeader
│   │   └── 3d/           # Three.js components
│   ├── config/           # Environment config
│   ├── features/         # Feature modules (by domain)
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities (cn, etc.)
│   ├── pages/            # Route-level pages
│   ├── routes/           # React Router config
│   ├── styles/           # Global CSS (Tailwind)
│   └── types/            # TypeScript interfaces
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── vite.config.ts
└── tailwind.config.ts
```

---

## Design System

- **Background**: `#020f0b` (deep dark green-black)
- **Primary**: `#00ffb3` (neon green)
- **Secondary**: `#00d6a3` (teal)
- **Cards**: Glassmorphism with `rgba(2, 15, 11, 0.8)` + blur
- **Borders**: `rgba(0, 255, 179, 0.12)`
- **Text**: White foreground, `#94a3b8` muted
- **Font**: Inter (sans), JetBrains Mono (mono)

---

## Connection with Backend

The frontend connects to the Django backend at `http://localhost:8000/api`.
Ensure the backend is running before using the login page.

Login credentials (default superuser):
- Email: `admin@nuvvi.local`
- Password: `Admin12345*`

---

## Next Steps

1. Complete shadcn/ui component library integration
2. Implement TanStack Query for all CRUD operations
3. Add real-time features with WebSockets
4. Build data visualization dashboards with Recharts
5. Add comprehensive error boundaries and loading states
6. Implement theme switching
7. Add end-to-end tests with Playwright

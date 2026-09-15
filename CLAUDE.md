# Bodegas Agrovello — web y reservas

Landing de Bodegas Agrovello, bodega de albariño en Rías Baixas, para dar a conocer la marca y captar reservas de visitas guiadas con cata. Está en producción en https://www.bodegasagrovello.com (Vercel).

## Stack
- React 18 + Vite + TypeScript, Tailwind CSS, shadcn/ui y Framer Motion
- React Router 6, TanStack Query, React Hook Form + Zod
- Supabase: Postgres con RLS, Auth para el panel de administración y Edge Functions (Deno); emails con Resend
- Proyecto iniciado con Lovable (el `README.md` es el genérico de Lovable)

## Comandos
- Instalar: `npm ci`
- Desarrollo: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Supabase CLI no está instalada: usar `npx supabase …` (proyecto `sgighupbzsxgbzyurotl`)

## Estructura
- `src/pages/`: `LandingPage` (`/`), `AdminLogin` (`/admin`) y `AdminDashboard` (`/admin/dashboard`)
- `src/components/`: secciones de la landing (Navbar, Hero, About, Wine, Visits, Booking, Location, Footer)
- `src/components/admin/`: `BookingTable`, `OccupancyCalendar` y `ScheduleManager`
- `src/hooks/`: `useAvailability` y `useScheduleConfig`
- `src/lib/scheduleConstants.ts`, `src/types/booking.ts`
- `supabase/migrations/` y `supabase/functions/`

## Datos
- Tablas: `bookings` (reservas), `schedule_config` (horarios y aforo) y `user_roles`
- Edge Functions en `main`: `notify-new-booking` y `send-booking-confirmation`

## Pagos con Stripe (rama `pagos-stripe`)
- El pago de reservas con Stripe Checkout está en la rama `pagos-stripe`, pendiente de aprobar con el cliente
- No debe llegar a `main` hasta que se apruebe: hacer push a `main` publica la web
- Las Edge Functions de Stripe ya están desplegadas y su migración aplicada en Supabase. Configuración y checklist para pasar a modo live en `PAGOS.md` de esa rama

## Variables de entorno
`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`, en `.env`. Está versionado y solo contiene claves públicas.

## Reglas
- No borrar `.env` del repo sin crear antes esas variables en Vercel: `src/integrations/supabase/client.ts` las lee al compilar sin valores por defecto, y la web se quedaría sin Supabase
- `src/integrations/supabase/client.ts` y `types.ts` son generados
- La web está en producción: compilar y probar antes de subir a `main`
- El repositorio está en la cuenta de GitHub del cliente
- Commits en español y descriptivos; si la tarea tiene requerimiento, añadir `[REQ-###]`
- Se trabaja desde Windows: no añadir dependencias ni archivos específicos de macOS

# NecesitoVisa.com

Sitio Next.js (App Router) en TypeScript que responde si necesitas visa para viajar de un país a otro. Se apoya en datos locales en JSON/TS y está listo para deploy en Vercel.

## Requisitos
- Node.js 18+
- npm

## Instalación
```bash
npm install
```

## Desarrollo
```bash
npm run dev
```
Luego abre `http://localhost:3000`.

## Build y producción
```bash
npm run build
npm start
```

## Estructura de datos
- `data/countries.ts`: lista de países de origen y destino (nombre, slug, ISO opcional).
- `data/requirements.ts`: combinaciones origen/destino con los campos:
  - `originSlug`, `destSlug`
  - `visaRequired` (boolean)
  - `maxStayDays` (número o `null`)
  - `altPermit` (ej. ESTA, eTA, ETA o `null`)
  - `passportRule`, `onwardTicket`, `fundsProof`
  - `notes?`: string[]
  - `sources`: `{ label, url }[]`
  - `verificationStatus?`: `"verified" | "pending" | "outdated"` (opcional; si no se define, el semáforo lo calcula)
  - `embassy`: `{ name, url, email?, phone?, address? }`
  - `lastReviewed`: `YYYY-MM-DD`

El semáforo automático usa estas reglas cuando `verificationStatus` no está definido:
- 🔴 `outdated`: `lastReviewed` tiene más de 12 meses (365 días).
- 🟡 `pending`: `sources` está vacío o incompleto.
- ✅ `verified`: hay al menos una fuente completa y `lastReviewed` es menor o igual a 12 meses.

Para marcar manualmente un estado distinto, agrega `verificationStatus` al objeto correspondiente en `requirements.ts`. Puedes
agregar `notes` para aclarar revisiones o excepciones.

Para agregar un nuevo país u origen, añade la entrada en `data/countries.ts` y crea (o deja que el generador cree) el objeto correspondiente en `requirements.ts`. El archivo usa un mapa de overrides por destino para facilitar la edición de todos los pares.

## Rutas principales
- `/` selector de origen y destino + destinos populares.
- `/visa` explicación y enlaces rápidos.
- `/visa/[origen]/[destino]` página SEO con resumen, fuentes, embajada y FAQ.

## Sitemap y robots
- `app/sitemap.ts` genera automáticamente URLs para `/`, `/visa` y cada combinación declarada en `requirements.ts`.
- `app/robots.ts` expone las reglas básicas, excluye `/admin` y referencia el sitemap.

## Panel interno de revisión (/admin)
- Acceso: `https://necesitovisa.com/admin?key=TU_ADMIN_KEY` (`TU_ADMIN_KEY` proviene de la variable de entorno `ADMIN_KEY`).
- Protección: si la key no coincide se responde 404; no hay formularios de login ni mensajes de error.
- Contenido: tabla con todos los pares origen/destino, links a la página pública, fecha de última revisión, cantidad de fuentes
  y estado del semáforo.
- Contadores y filtros: totales globales, filtros por estado o por pares sin fuentes y buscador por texto.
- Indexación: `/admin` no aparece en el sitemap y está bloqueado en `robots.txt`.

## Estilos
- TailwindCSS configurado en `tailwind.config.ts` y `app/globals.css`.

## Despliegue en Vercel
1. Conecta el repositorio en Vercel.
2. Usa el framework **Next.js** con App Router (detectado automáticamente).
3. Variables de entorno no necesarias para el MVP.

## Notas
- El proyecto incluye metadatos por página (title/description/Open Graph), JSON-LD para BreadcrumbList y FAQPage, y la fecha de última revisión visible.
- No se utilizan APIs externas; todo el contenido está en archivos locales para facilitar su mantenimiento.

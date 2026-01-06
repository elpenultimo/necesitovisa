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

## Actualización manual del dataset Henley
El dataset de Henley se mantiene fuera del proceso de build para evitar fallos en despliegue. Si necesitas renovarlo:

```bash
# ISO por defecto: ESP. Puedes sobreescribir con --iso=USA o la variable HENLEY_SOURCE_ISO.
npm run update:henley -- --iso=ESP
```

El comando descarga el PDF oficial desde Henley, lo guarda en `public/data` y genera `public/data/visa-matrix.generated.json` con los metadatos `source_date`, `generated_at` y `source_url`.

## Estructura de datos
- `data/countries.ts`: lista de países de origen y destino (nombre, slug, ISO opcional).
- `data/requirements.ts`: combinaciones origen/destino con los campos:
  - `originSlug`, `destSlug`
  - `visaRequired` (boolean)
  - `maxStayDays` (número o `null`)
  - `altPermit` (ej. ESTA, eTA, ETA o `null`)
  - `passportRule`, `onwardTicket`, `fundsProof`
  - `notes`: string[]
  - `sources`: `{ label, url }[]`
  - `embassy`: `{ name, url, email?, phone?, address? }`
  - `lastReviewed`: `YYYY-MM-DD`

Para agregar un nuevo país u origen, añade la entrada en `data/countries.ts` y crea (o deja que el generador cree) el objeto correspondiente en `requirements.ts`. El archivo usa un mapa de overrides por destino para facilitar la edición de todos los pares.

## Rutas principales
- `/` selector de origen y destino + destinos populares.
- `/visa` explicación y enlaces rápidos.
- `/visa/[origen]/[destino]` página SEO con resumen, fuentes, embajada y FAQ.

## Sitemap y robots
- `app/sitemap.ts` genera automáticamente URLs para `/`, `/visa` y cada combinación declarada en `requirements.ts`.
- `app/robots.ts` expone las reglas básicas y referencia el sitemap.

## Estilos
- TailwindCSS configurado en `tailwind.config.ts` y `app/globals.css`.

## Despliegue en Vercel
1. Conecta el repositorio en Vercel.
2. Usa el framework **Next.js** con App Router (detectado automáticamente).
3. Variables de entorno no necesarias para el MVP.

## Notas
- El proyecto incluye metadatos por página (title/description/Open Graph), JSON-LD para BreadcrumbList y FAQPage, y la fecha de última revisión visible.
- No se utilizan APIs externas; todo el contenido está en archivos locales para facilitar su mantenimiento.

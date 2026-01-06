# NecesitoVisa.com

Sitio Next.js (App Router) en TypeScript que responde si necesitas visa para viajar de un país a otro. Desde el build descarga los PDFs del Henley & Partners Passport Index y genera un JSON consolidado para el sitio.

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
El comando de build ejecuta previamente `scripts/generate-henley-dataset.js`, que intenta descargar los PDFs de Henley para Argentina, Chile, Colombia, España y México. Si falla, conserva el último JSON generado como respaldo.

## Estructura de datos
- `public/data/visa-matrix.generated.json`: dataset generado automáticamente desde los PDFs del Henley Passport Index, con metadatos de fecha y URL de origen.
- `data/countries.ts`: lista de países de origen y destino. Si existe el JSON generado, las listas se derivan de él; de lo contrario se usan valores de respaldo.
- `data/requirements.ts`: construye las combinaciones origen/destino a partir del JSON generado. Si no existe, recurre al dataset de respaldo y a los overrides definidos en el archivo.

Para añadir soporte a otro origen cuando el JSON generado no esté disponible, añade la entrada en `data/countries.ts` y en los overrides del dataset de respaldo.

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

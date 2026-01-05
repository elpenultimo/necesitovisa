import Link from "next/link";

export default function NotFoundPage() {
  return (
    <div className="container-box py-16 space-y-6 text-center">
      <h1 className="text-4xl font-bold text-gray-900">Página no encontrada</h1>
      <p className="text-gray-700">No tenemos datos para esa combinación. Vuelve al inicio y selecciona otra opción.</p>
      <Link
        href="/"
        className="inline-flex items-center rounded-lg bg-brand-primary px-5 py-3 text-white font-semibold hover:bg-brand-dark"
      >
        Volver al inicio
      </Link>
    </div>
  );
}

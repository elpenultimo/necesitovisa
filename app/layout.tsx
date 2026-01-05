import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NecesitoVisa.com",
  description: "Descubre en segundos si necesitas visa para tu próximo viaje.",
  metadataBase: new URL("https://necesitovisa.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <header className="border-b bg-white">
          <div className="container-box flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-2 font-semibold text-lg text-brand-dark">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-brand-primary text-white font-bold">
                NV
              </span>
              <span>NecesitoVisa.com</span>
            </Link>
            <nav className="flex items-center space-x-4 text-sm text-gray-700">
              <Link href="/">Inicio</Link>
              <Link href="/visa">Visas</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-12 border-t bg-white">
          <div className="container-box py-8 text-sm text-gray-700 space-y-2">
            <p className="font-semibold">Descargo de responsabilidad</p>
            <p>
              Esta información es referencial. Verifica siempre con la embajada o fuentes oficiales
              antes de viajar. No nos hacemos responsables por cambios en políticas migratorias.
            </p>
            <p className="text-gray-500">© {new Date().getFullYear()} NecesitoVisa.com</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

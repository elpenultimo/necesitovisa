import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "NecesitoVisa.com",
  description: "Descubre en segundos si necesitas visa para tu próximo viaje.",
  metadataBase: new URL("https://necesitovisa.com"),
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} min-h-screen flex flex-col antialiased`}>
        <header className="sticky top-0 z-20 border-b border-white/10 bg-[#06283d]/95 text-white shadow-lg backdrop-blur">
          <div className="container-box flex items-center justify-between py-3.5">
            <Link href="/" className="flex items-center gap-3 font-semibold text-lg text-white">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-300 to-blue-500 text-[#06283d] font-black shadow-lg">
                NV
              </span>
              <span>NecesitoVisa<span className="text-cyan-300">.com</span></span>
            </Link>
            <nav className="flex items-center gap-5 text-sm font-medium text-sky-100">
              <Link href="/" className="hover:text-white">Inicio</Link>
              <Link href="/visa" className="hover:text-white">Visas</Link>
              <Link href="/faq" className="hover:text-white">FAQ</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16 bg-[#06283d] text-sky-100">
          <div className="container-box space-y-3 py-10 text-sm">
            <p className="font-semibold text-white">Información para viajar mejor informado</p>
            <p className="max-w-3xl text-sky-200">
              Esta información es referencial. Verifica siempre con la embajada o fuentes oficiales antes de viajar.
              No nos hacemos responsables por cambios en políticas migratorias.
            </p>
            <p className="pt-2 text-sky-300">© {new Date().getFullYear()} NecesitoVisa.com</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

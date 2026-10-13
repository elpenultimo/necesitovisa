import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "NecesitoVisa.com",
  description: "Descubre en segundos si necesitas visa para tu próximo viaje.",
  metadataBase: new URL("https://necesitovisa.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48 64x64 96x96", type: "image/x-icon" },
      { url: "/favicon-96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
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
          <div className="container-box flex flex-wrap items-center justify-between gap-3 py-3.5">
            <BrandLogo />
            <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-medium text-sky-100">
              <Link href="/visa" className="hover:text-white">Consultar requisitos</Link>
              <Link href="/destinos" className="hover:text-white">Destinos</Link>
              <Link href="/documentos" className="hover:text-white">Documentos</Link>
              <Link href="/paises-sin-visa" className="hover:text-white">Países sin visa</Link>
              <Link href="/faq" className="hover:text-white">FAQ</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="mt-16 bg-[#06283d] text-sky-100">
          <div className="container-box space-y-3 py-10 text-sm">
            <div className="pb-3"><BrandLogo footer /></div>
            <p className="font-semibold text-white">Información para viajar mejor informado</p>
            <p className="max-w-3xl text-sky-200">
              Esta información es referencial. Verifica siempre con la embajada o fuentes oficiales antes de viajar.
              No nos hacemos responsables por cambios en políticas migratorias.
            </p>
            <p className="text-xs text-sky-300">Fotografías de destinos: <a href="https://unsplash.com" className="underline underline-offset-2">Unsplash</a>.</p>
            <p className="pt-2 text-sky-300">© {new Date().getFullYear()} NecesitoVisa.com</p>
          </div>
        </footer>
      </body>
    </html>
  );
}

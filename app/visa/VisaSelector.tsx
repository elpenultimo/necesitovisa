"use client";

import countries from "i18n-iso-countries";
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CountryIndexEntry } from "@/lib/countryIndex";

countries.registerLocale({ locale: "es" });

type VisaSelectorProps = { countries: CountryIndexEntry[] };

function getFlagEmoji(countryName: string): string | null {
  const alpha2 = countries.getAlpha2Code(countryName, "es") ?? countries.getAlpha2Code(countryName, "en");
  if (!alpha2 || alpha2.length !== 2) return null;
  return alpha2.toUpperCase().split("").map((char: string) => String.fromCodePoint(127397 + char.charCodeAt(0))).join("");
}

function handleKeyboardSelect(event: KeyboardEvent<HTMLButtonElement>, onSelect: () => void) {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    onSelect();
  }
}

export function VisaSelector({ countries }: VisaSelectorProps) {
  const router = useRouter();
  const [selectedOrigin, setSelectedOrigin] = useState<CountryIndexEntry | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<CountryIndexEntry | null>(null);
  const originButtonRef = useRef<HTMLButtonElement | null>(null);

  const handleReset = () => {
    setSelectedOrigin(null);
    setSelectedDestination(null);
    requestAnimationFrame(() => originButtonRef.current?.focus());
  };

  const handleNavigate = () => {
    if (selectedOrigin && selectedDestination) router.push(`/visa/${selectedOrigin.slug_es}/${selectedDestination.slug_es}`);
  };

  const selectedOriginFlag = selectedOrigin ? getFlagEmoji(selectedOrigin.name_es) : null;
  const selectedDestinationFlag = selectedDestination ? getFlagEmoji(selectedDestination.name_es) : null;

  return (
    <section className="space-y-6">
      <div className="hero-shell rounded-2xl bg-white p-5 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="section-label text-cyan-700">Paso 1 y 2</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Define tu ruta</h2>
          </div>
          <button type="button" onClick={handleReset} className="text-sm font-semibold text-slate-500 underline underline-offset-2 hover:text-cyan-700">Limpiar selección</button>
        </div>
        <div className="mt-6 grid gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-xl border border-cyan-100 bg-cyan-50/60 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-cyan-700">Soy ciudadano de</p>
            {selectedOrigin ? <p className="mt-2 flex items-center gap-2 font-bold text-slate-900">{selectedOriginFlag && <span aria-hidden>{selectedOriginFlag}</span>}{selectedOrigin.name_es}</p> : <p className="mt-2 text-slate-500">Selecciona un país abajo</p>}
          </div>
          <div className="rounded-xl border border-orange-100 bg-orange-50/70 px-4 py-4">
            <p className="text-xs font-bold uppercase tracking-wide text-orange-700">Quiero viajar a</p>
            {selectedDestination ? <p className="mt-2 flex items-center gap-2 font-bold text-slate-900">{selectedDestinationFlag && <span aria-hidden>{selectedDestinationFlag}</span>}{selectedDestination.name_es}</p> : <p className="mt-2 text-slate-500">Selecciona un destino abajo</p>}
          </div>
        </div>
        <button type="button" onClick={handleNavigate} disabled={!selectedOrigin || !selectedDestination} className="mt-5 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:bg-none disabled:shadow-none">
          Ver requisitos →
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">🌎 País de ciudadanía</h2>
          <p className="mt-1 text-sm text-slate-500">El país que emitió tu pasaporte.</p>
          <div className="mt-4 grid max-h-[26rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {countries.map((country, index) => {
              const isSelected = selectedOrigin?.slug_es === country.slug_es;
              return <button key={country.slug_es} ref={index === 0 ? originButtonRef : undefined} type="button" aria-pressed={isSelected} aria-label={`Seleccionar ${country.name_es} como país de ciudadanía`} onClick={() => setSelectedOrigin(country)} onKeyDown={(event) => handleKeyboardSelect(event, () => setSelectedOrigin(country))} className={`rounded-lg border px-3 py-2 text-left text-sm transition hover:border-cyan-500 hover:text-cyan-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 ${isSelected ? "border-cyan-500 bg-cyan-50 font-semibold text-cyan-800" : "border-slate-200"}`}>{getFlagEmoji(country.name_es) && <span className="mr-1" aria-hidden>{getFlagEmoji(country.name_es)}</span>}{country.name_es}</button>;
            })}
          </div>
        </div>
        <div className="card p-5 sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">✈️ Destino</h2>
          <p className="mt-1 text-sm text-slate-500">El país que quieres visitar.</p>
          <div className="mt-4 grid max-h-[26rem] grid-cols-2 gap-2 overflow-y-auto pr-1 sm:grid-cols-3">
            {countries.map((country) => {
              const isSelected = selectedDestination?.slug_es === country.slug_es;
              return <button key={country.slug_es} type="button" aria-pressed={isSelected} aria-label={`Seleccionar ${country.name_es} como destino`} onClick={() => setSelectedDestination(country)} onKeyDown={(event) => handleKeyboardSelect(event, () => setSelectedDestination(country))} className={`rounded-lg border px-3 py-2 text-left text-sm transition hover:border-orange-500 hover:text-orange-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${isSelected ? "border-orange-500 bg-orange-50 font-semibold text-orange-800" : "border-slate-200"}`}>{getFlagEmoji(country.name_es) && <span className="mr-1" aria-hidden>{getFlagEmoji(country.name_es)}</span>}{country.name_es}</button>;
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

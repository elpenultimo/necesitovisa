"use client";

import countries from "i18n-iso-countries";
import type { KeyboardEvent } from "react";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { CountryIndexEntry } from "@/lib/countryIndex";

countries.registerLocale({ locale: "es" });

type VisaSelectorProps = {
  countries: CountryIndexEntry[];
};

function getFlagEmoji(countryName: string): string | null {
  const alpha2 = countries.getAlpha2Code(countryName, "es") ?? countries.getAlpha2Code(countryName, "en");
  if (!alpha2 || alpha2.length !== 2) return null;
  return alpha2
    .toUpperCase()
    .split("")
    .map((char: string) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
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
    if (!selectedOrigin || !selectedDestination) return;
    router.push(`/visa/${selectedOrigin.slug_es}/${selectedDestination.slug_es}`);
  };

  const selectedOriginFlag = selectedOrigin ? getFlagEmoji(selectedOrigin.name_es) : null;
  const selectedDestinationFlag = selectedDestination ? getFlagEmoji(selectedDestination.name_es) : null;

  return (
    <section className="space-y-8">
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-slate-900">Selección actual</h2>
          <button
            type="button"
            onClick={handleReset}
            className="text-xs font-semibold text-slate-600 hover:text-brand-primary underline underline-offset-2"
          >
            Limpiar selección
          </button>
        </div>
        <div className="grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">País de ciudadanía</p>
            {selectedOrigin ? (
              <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                {selectedOriginFlag ? <span aria-hidden>{selectedOriginFlag}</span> : null}
                <span>{selectedOrigin.name_es}</span>
              </p>
            ) : (
              <p className="mt-1 text-slate-500">Pendiente</p>
            )}
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-slate-500">Destino</p>
            {selectedDestination ? (
              <p className="mt-1 flex items-center gap-2 font-semibold text-slate-900">
                {selectedDestinationFlag ? <span aria-hidden>{selectedDestinationFlag}</span> : null}
                <span>{selectedDestination.name_es}</span>
              </p>
            ) : (
              <p className="mt-1 text-slate-500">Pendiente</p>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleNavigate}
          disabled={!selectedOrigin || !selectedDestination}
          className="inline-flex items-center justify-center rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          Ver requisitos
        </button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">País de ciudadanía</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {countries.map((country, index) => {
              const isSelected = selectedOrigin?.slug_es === country.slug_es;
              return (
                <button
                  key={country.slug_es}
                  ref={index === 0 ? originButtonRef : undefined}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Seleccionar ${country.name_es} como país de ciudadanía`}
                  onClick={() => setSelectedOrigin(country)}
                  onKeyDown={(event) => handleKeyboardSelect(event, () => setSelectedOrigin(country))}
                  className={`rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 hover:border-brand-primary hover:text-brand-primary ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-slate-200"
                  }`}
                >
                  {country.name_es}
                </button>
              );
            })}
          </div>
        </div>
        <div className="card p-6 space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">Destinos disponibles</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
            {countries.map((country) => {
              const isSelected = selectedDestination?.slug_es === country.slug_es;
              return (
                <button
                  key={country.slug_es}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={`Seleccionar ${country.name_es} como destino`}
                  onClick={() => setSelectedDestination(country)}
                  onKeyDown={(event) => handleKeyboardSelect(event, () => setSelectedDestination(country))}
                  className={`rounded-lg border px-3 py-2 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary focus-visible:ring-offset-2 hover:border-brand-primary hover:text-brand-primary ${
                    isSelected
                      ? "border-brand-primary bg-brand-primary/10 text-brand-primary"
                      : "border-slate-200"
                  }`}
                >
                  {country.name_es}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

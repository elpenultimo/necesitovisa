"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CountrySelect, CountryOption } from "@/components/CountrySelect";

interface HomeFormProps {
  origins: CountryOption[];
  destinations: CountryOption[];
}

export function HomeForm({ origins, destinations }: HomeFormProps) {
  const router = useRouter();
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!origin || !destination) return;
    router.push(`/visa/${origin}/${destination}`);
  };

  return (
    <form onSubmit={handleSubmit} className="hero-shell rounded-2xl bg-white p-5 sm:p-7 space-y-5">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-100 text-lg">✈️</span>
        Consulta tu ruta
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <CountrySelect
          label="Soy ciudadano de"
          value={origin}
          onChange={setOrigin}
          options={origins}
          placeholder="Selecciona tu país"
        />
        <CountrySelect
          label="Quiero viajar a"
          value={destination}
          onChange={setDestination}
          options={destinations}
          placeholder="Selecciona el destino"
        />
      </div>
      <button
        type="submit"
        disabled={!origin || !destination}
        className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-3.5 text-white font-bold shadow-lg shadow-orange-500/20 transition hover:from-orange-600 hover:to-amber-600 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:bg-none disabled:shadow-none md:w-auto"
      >
        Ver requisitos →
      </button>
    </form>
  );
}

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
    <form onSubmit={handleSubmit} className="card p-7 space-y-5">
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
        className="w-full md:w-auto rounded-lg bg-brand-primary px-6 py-3 text-white font-semibold shadow-soft hover:bg-brand-dark disabled:bg-slate-300 disabled:cursor-not-allowed"
      >
        Ver requisitos
      </button>
    </form>
  );
}

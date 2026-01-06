"use client";

import { useMemo } from "react";

export type CountryOption = {
  name: string;
  slug: string;
};

interface CountrySelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CountryOption[];
  placeholder: string;
}

export function CountrySelect({ label, value, onChange, options, placeholder }: CountrySelectProps) {
  const sortedOptions = useMemo(() => options.slice().sort((a, b) => a.name.localeCompare(b.name)), [options]);

  return (
    <label className="block text-sm font-medium text-gray-700 space-y-2">
      <span>{label}</span>
      <select
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm focus:border-brand-primary focus:outline-none focus:ring-2 focus:ring-brand-primary/30"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">{placeholder}</option>
        {sortedOptions.map((option) => (
          <option key={option.slug} value={option.slug}>
            {option.name}
          </option>
        ))}
      </select>
    </label>
  );
}

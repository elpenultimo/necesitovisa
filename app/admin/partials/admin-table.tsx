"use client";

import { VerificationStatus } from "@/data/requirements";
import Link from "next/link";
import { useMemo, useState } from "react";

type RequirementRow = {
  originSlug: string;
  destSlug: string;
  originName: string;
  destName: string;
  visaRequired: boolean;
  lastReviewed: string;
  sources: { label: string; url: string }[];
  sourceCount: number;
  status: VerificationStatus;
  hasCompleteSources: boolean;
};

type Counter = {
  total: number;
  verified: number;
  pending: number;
  outdated: number;
  withoutSources: number;
};

type FilterOption = "all" | "verified" | "pending" | "outdated" | "without-sources";

type Props = {
  rows: RequirementRow[];
  counters: Counter;
};

const statusLabels: Record<VerificationStatus, { emoji: string; label: string; bg: string; text: string }> = {
  verified: { emoji: "✅", label: "Verificada", bg: "bg-green-50", text: "text-green-800" },
  pending: { emoji: "🟡", label: "Pendiente", bg: "bg-yellow-50", text: "text-yellow-800" },
  outdated: { emoji: "🔴", label: "Desactualizada", bg: "bg-red-50", text: "text-red-800" },
};

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const filterOptions: { id: FilterOption; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "verified", label: "Solo verificados" },
  { id: "pending", label: "Solo pendientes" },
  { id: "outdated", label: "Solo desactualizados" },
  { id: "without-sources", label: "Sin fuentes" },
];

export default function AdminTable({ rows, counters }: Props) {
  const [filter, setFilter] = useState<FilterOption>("all");
  const [query, setQuery] = useState("");

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.toLowerCase();

    return rows.filter((row) => {
      const matchesQuery =
        row.originName.toLowerCase().includes(normalizedQuery) ||
        row.destName.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "without-sources" && !row.hasCompleteSources) ||
        row.status === filter;

      return matchesQuery && matchesFilter;
    });
  }, [filter, query, rows]);

  return (
    <div className="space-y-4">
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-600">Total</p>
          <p className="text-2xl font-semibold text-gray-900">{counters.total}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 bg-green-50">
          <p className="text-sm text-gray-700">Verificados</p>
          <p className="text-2xl font-semibold text-green-800">{counters.verified}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 bg-yellow-50">
          <p className="text-sm text-gray-700">Pendientes</p>
          <p className="text-2xl font-semibold text-yellow-800">{counters.pending}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 bg-red-50">
          <p className="text-sm text-gray-700">Desactualizados</p>
          <p className="text-2xl font-semibold text-red-800">{counters.outdated}</p>
        </div>
        <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
          <p className="text-sm text-gray-700">Sin fuentes</p>
          <p className="text-2xl font-semibold text-gray-900">{counters.withoutSources}</p>
        </div>
      </section>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {filterOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setFilter(option.id)}
              className={`px-3 py-1 rounded-full border text-sm transition ${
                filter === option.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="w-full md:w-64">
          <label className="sr-only" htmlFor="search">
            Buscar
          </label>
          <input
            id="search"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar origen o destino"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="overflow-auto rounded-lg border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
            <tr>
              <th className="px-4 py-3">Origen</th>
              <th className="px-4 py-3">Destino</th>
              <th className="px-4 py-3">¿Visa?</th>
              <th className="px-4 py-3">Última revisión</th>
              <th className="px-4 py-3">Fuentes</th>
              <th className="px-4 py-3">Estado</th>
              <th className="px-4 py-3">Link</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const status = statusLabels[row.status];
              return (
                <tr key={`${row.originSlug}-${row.destSlug}`} className="border-t last:border-b">
                  <td className="px-4 py-3 text-gray-900">{row.originName}</td>
                  <td className="px-4 py-3 text-gray-900">{row.destName}</td>
                  <td className="px-4 py-3 text-gray-700">{row.visaRequired ? "Sí" : "No"}</td>
                  <td className="px-4 py-3 text-gray-700">{formatDate(row.lastReviewed)}</td>
                  <td className="px-4 py-3 text-gray-700">{row.sourceCount}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold ${status.bg} ${status.text}`}>
                      <span>{status.emoji}</span>
                      <span>{status.label}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/visa/${row.originSlug}/${row.destSlug}`}
                      className="text-blue-700 hover:underline"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver página
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredRows.length === 0 && (
          <p className="p-4 text-sm text-gray-600">No se encontraron coincidencias.</p>
        )}
      </div>
    </div>
  );
}

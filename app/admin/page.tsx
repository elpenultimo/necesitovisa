import { destinationCountries, originCountries } from "@/data/countries";
import {
  computeVerificationStatus,
  hasCompleteSources,
  requirements,
  VerificationStatus,
} from "@/data/requirements";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import AdminTable from "./partials/admin-table";

type SearchParams = {
  key?: string;
};

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

export const metadata: Metadata = {
  title: "Panel de revisión",
  description: "Panel interno para revisar el estado de las combinaciones de visa.",
  robots: {
    index: false,
    follow: false,
  },
};

const getCountryName = (slug: string) => {
  const country =
    originCountries.find((item) => item.slug === slug) ||
    destinationCountries.find((item) => item.slug === slug);

  return country?.name ?? slug;
};

const buildRows = (): { rows: RequirementRow[]; counters: Counter } => {
  const counters: Counter = {
    total: requirements.length,
    verified: 0,
    pending: 0,
    outdated: 0,
    withoutSources: 0,
  };

  const rows = requirements.map((requirement) => {
    const status = computeVerificationStatus(requirement);
    const hasSources = hasCompleteSources(requirement.sources);

    if (status === "verified") counters.verified += 1;
    if (status === "pending") counters.pending += 1;
    if (status === "outdated") counters.outdated += 1;
    if (!hasSources) counters.withoutSources += 1;

    return {
      originSlug: requirement.originSlug,
      destSlug: requirement.destSlug,
      originName: getCountryName(requirement.originSlug),
      destName: getCountryName(requirement.destSlug),
      visaRequired: requirement.visaRequired,
      lastReviewed: requirement.lastReviewed,
      sources: requirement.sources,
      sourceCount: requirement.sources.length,
      hasCompleteSources: hasSources,
      status,
    };
  });

  return { rows, counters };
};

export default function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  if (!searchParams.key || searchParams.key !== process.env.ADMIN_KEY) {
    return notFound();
  }

  const { rows, counters } = buildRows();

  return (
    <div className="container-box py-10 space-y-6">
      <header className="flex flex-col gap-3">
        <Link href="/" className="text-sm text-blue-700 hover:underline self-start">
          ← Volver al inicio
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Panel interno de revisión</h1>
          <p className="text-gray-700">
            Revisa el estado de cada combinación de origen y destino según las reglas del semáforo.
          </p>
        </div>
      </header>

      <AdminTable rows={rows} counters={counters} />
    </div>
  );
}

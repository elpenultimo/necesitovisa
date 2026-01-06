import fs from "fs";
import path from "path";
import { notFound } from "next/navigation";

// Basic structure for the generated visa data files
interface VisaData {
  origin: string;
  destinations: Record<string, string>;
}

const generatedDir = path.join(process.cwd(), "data", "generated");

function formatOriginSlug(slug: string) {
  const lower = slug.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

function readVisaData(originSlug: string): VisaData | null {
  const fileName = `${formatOriginSlug(originSlug)}.json`;
  const filePath = path.join(generatedDir, fileName);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as VisaData;
}

export function generateStaticParams() {
  if (!fs.existsSync(generatedDir)) {
    return [];
  }

  return fs
    .readdirSync(generatedDir)
    .filter((file) => file.endsWith(".json"))
    .map((file) => ({ origen: file.replace(/\.json$/, "").toLowerCase() }));
}

export default function VisaOriginPage({ params }: { params: { origen: string } }) {
  const visaData = readVisaData(params.origen);

  if (!visaData) {
    return notFound();
  }

  const destinationEntries = Object.entries(visaData.destinations);

  return (
    <div className="container-box py-10 space-y-6">
      <div className="space-y-3">
        <h1 className="text-3xl font-bold text-gray-900">Visa para ciudadanos de {visaData.origin}</h1>
        <p className="text-gray-700 text-sm max-w-2xl">
          Revisa rápidamente si necesitas visa para viajar a otro país. Los datos se generan desde los
          archivos JSON exportados del CSV base.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-800 border-b">Destino</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-800 border-b">Requisito de visa</th>
            </tr>
          </thead>
          <tbody>
            {destinationEntries.map(([destination, requirement]) => (
              <tr key={destination} className="border-b last:border-b-0">
                <td className="px-4 py-2 text-gray-900">{destination}</td>
                <td className="px-4 py-2 text-gray-700">{requirement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

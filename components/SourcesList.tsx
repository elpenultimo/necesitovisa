import { Requirement } from "@/data/requirements";

export function SourcesList({ sources }: { sources: Requirement["sources"] }) {
  return (
    <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
      {sources.map((source) => (
        <li key={source.url}>
          <a href={source.url} target="_blank" rel="noreferrer" className="font-semibold">
            {source.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

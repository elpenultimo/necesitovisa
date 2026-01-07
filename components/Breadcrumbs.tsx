import Link from "next/link";

export type Crumb = {
  label: string;
  href: string;
};

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="text-sm text-slate-600" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {crumbs.map((crumb, index) => (
          <li key={crumb.href} className="flex items-center space-x-2">
            <Link href={crumb.href} className="hover:text-brand-primary">
              {crumb.label}
            </Link>
            {index < crumbs.length - 1 && <span className="text-slate-400">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

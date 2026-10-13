import type { CountryOption } from "@/components/CountrySelect";

export function NationalityForm({ countries, action, selected = "", button = "Ver destinos" }: {
  countries: CountryOption[]; action: string; selected?: string; button?: string;
}) {
  return (
    <form action={action} method="get" className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <label className="flex-1 space-y-2 text-sm font-medium text-slate-700">
        <span>Tu nacionalidad (pasaporte)</span>
        <select name="nacionalidad" defaultValue={selected} required className="block w-full rounded-xl border border-slate-300 bg-white p-3 text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-cyan-500">
          <option value="">Selecciona tu nacionalidad</option>
          {countries.map(country => <option key={country.slug} value={country.slug}>{country.name}</option>)}
        </select>
      </label>
      <button className="rounded-xl bg-cyan-700 px-5 py-3 font-semibold text-white hover:bg-cyan-800">{button}</button>
    </form>
  );
}

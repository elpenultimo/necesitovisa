import Image from "next/image";
import Link from "next/link";
import { destinationPhotos } from "@/lib/destinationPhotos";

export function DestinationCard({ slug, name }: { slug: string; name: string }) {
  const photo = destinationPhotos[slug];
  if (!photo) return null;
  return (
    <Link href={`/visa/destino/${slug}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:border-cyan-300 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-700">
      <div className="relative aspect-[16/11] overflow-hidden bg-slate-200">
        <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 230px" className="object-cover transition duration-500 motion-safe:group-hover:scale-105" />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="font-bold text-slate-900">{name}</h3>
        <p className="text-sm text-slate-600">Elige tu nacionalidad</p>
        <span className="inline-block text-sm font-semibold text-cyan-700">Ver requisitos <span aria-hidden>→</span></span>
      </div>
    </Link>
  );
}

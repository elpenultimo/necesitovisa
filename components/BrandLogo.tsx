import Image from "next/image";
import Link from "next/link";

export function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="NecesitoVisa.com — Inicio"
      className="inline-flex shrink-0 items-center gap-2 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cyan-300"
    >
      <Image
        src="/brand/globe-route.webp"
        alt=""
        aria-hidden="true"
        width={256}
        height={256}
        priority={!footer}
        className={footer ? "h-14 w-14 object-contain sm:h-16 sm:w-16" : "h-11 w-11 object-contain sm:h-12 sm:w-12"}
      />
      <span className={`${footer ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} whitespace-nowrap font-extrabold tracking-tight text-white`}>
        Necesito<span className="text-cyan-300">Visa</span><span className="font-semibold">.com</span>
      </span>
    </Link>
  );
}

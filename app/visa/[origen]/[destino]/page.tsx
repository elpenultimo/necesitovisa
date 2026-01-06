import { Breadcrumbs } from "@/components/Breadcrumbs";
import { EmbassyCard } from "@/components/EmbassyCard";
import { FAQ } from "@/components/FAQ";
import { ResultCard } from "@/components/ResultCard";
import { SourcesList } from "@/components/SourcesList";
import { destinationCountries, originCountries } from "@/data/countries";
import { findRequirement, requirements } from "@/data/requirements";
import { ReviewStatusBadge } from "@/components/ReviewStatusBadge";
import { getReviewMetadata } from "@/lib/reviewStatus";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

const currentYear = new Date().getFullYear();

const getCountryName = (slug: string, type: "origin" | "dest") => {
  const list = type === "origin" ? originCountries : destinationCountries;
  return list.find((country) => country.slug === slug)?.name ?? slug;
};

export function generateStaticParams() {
  return requirements.map((item) => ({
    origen: item.originSlug,
    destino: item.destSlug,
  }));
}

export function generateMetadata({ params }: { params: { origen: string; destino: string } }): Metadata {
  const requirement = findRequirement(params.origen, params.destino);
  if (!requirement) return { title: "Requisito no encontrado" };

  const originName = getCountryName(params.origen, "origin");
  const destName = getCountryName(params.destino, "dest");
  const { lastReviewedText } = getReviewMetadata(requirement);
  const title = `¿Necesito visa para ${destName} si soy de ${originName}? Requisitos ${currentYear}`;
  const description = `Descubre si los ciudadanos de ${originName} necesitan visa para viajar a ${destName}. Requisitos, duración, permisos y contacto de la embajada. Actualizado ${lastReviewedText}.`;

  const url = `https://necesitovisa.com/visa/${params.origen}/${params.destino}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: "article",
    },
  };
}

function buildFaq(requirement: ReturnType<typeof findRequirement>, originName: string, destName: string) {
  if (!requirement) return [];
  const baseAnswer = requirement.visaRequired
    ? "Necesitas tramitar una visa o autorización antes de viajar."
    : "No requieres visa para estadías cortas dentro del plazo permitido.";

  return [
    {
      question: "¿Necesito visa?",
      answer: `${baseAnswer} Revisa las condiciones específicas más abajo y las fuentes oficiales.`,
    },
    {
      question: "¿Cuánto tiempo puedo quedarme?",
      answer: requirement.maxStayDays
        ? `El límite de estadía referencial es de ${requirement.maxStayDays} días, sujeto a aprobación migratoria.`
        : "La duración depende del tipo de visa o permiso aprobado.",
    },
    {
      question: "¿Qué documentos suele pedir migración?",
      answer: "Pasaporte válido, prueba de salida, fondos suficientes y, si aplica, confirmación de alojamiento y seguro médico.",
    },
    {
      question: "¿Dónde confirmo la información?",
      answer: "Consulta siempre a la embajada o consulado correspondiente y verifica las fuentes listadas en esta página.",
    },
    {
      question: "¿Puedo trabajar o estudiar con este permiso?",
      answer: "Para trabajar, estudiar o residir aplica una visa distinta. La información aquí cubre visitas cortas o turismo.",
    },
  ];
}

export default function VisaDetailPage({ params }: { params: { origen: string; destino: string } }) {
  const requirement = findRequirement(params.origen, params.destino);
  if (!requirement) return notFound();

  const originName = getCountryName(params.origen, "origin");
  const destName = getCountryName(params.destino, "dest");
  const reviewMetadata = getReviewMetadata(requirement);
  const faqItems = buildFaq(requirement, originName, destName);

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Inicio",
        item: "https://necesitovisa.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Visas",
        item: "https://necesitovisa.com/visa",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${originName} → ${destName}`,
        item: `https://necesitovisa.com/visa/${params.origen}/${params.destino}`,
      },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <div className="container-box py-10 space-y-8">
      <Breadcrumbs
        crumbs={[
          { label: "Inicio", href: "/" },
          { label: "Visas", href: "/visa" },
          { label: `${originName} → ${destName}`, href: `/visa/${params.origen}/${params.destino}` },
        ]}
      />

      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-gray-900">
          ¿Necesito visa para viajar a {destName} si soy de {originName}?
        </h1>
        <ResultCard requirement={requirement} />
      </div>

      <section className="card p-6 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <p className="text-lg font-semibold text-gray-900">Resumen en 20 segundos</p>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Última revisión: {reviewMetadata.lastReviewedText}</span>
            <ReviewStatusBadge statusKey={reviewMetadata.status.key} withLabel={false} />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-3 text-sm text-gray-800">
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold">¿Visa obligatoria?</p>
            <p>{requirement.visaRequired ? "Sí" : "No"}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold">Permiso alternativo</p>
            <p>{requirement.altPermit ?? "No aplica"}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold">Estadía máxima</p>
            <p>
              {requirement.maxStayDays
                ? `${requirement.maxStayDays} días (referencial)`
                : "Depende del tipo de visa"}
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold">Pasaporte</p>
            <p>{requirement.passportRule}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold">Boleto de salida</p>
            <p>{requirement.onwardTicket}</p>
          </div>
          <div className="rounded-lg border border-gray-200 p-4 bg-gray-50">
            <p className="font-semibold">Fondos</p>
            <p>{requirement.fundsProof}</p>
          </div>
        </div>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">¿Qué significa esto en la práctica?</h2>
        {requirement.visaRequired ? (
          <p className="text-sm text-gray-700">
            Necesitarás tramitar la visa o autorización antes de volar. Verifica los tiempos de procesamiento,
            agenda tu cita y lleva los documentos indicados por el consulado. Sin el visado, la aerolínea puede
            negarte el embarque.
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            Para viajes cortos de turismo o negocios, puedes ingresar sin visa siempre que cumplas con las condiciones
            generales. Migración puede exigir pruebas de solvencia, alojamiento y pasaje de salida.
          </p>
        )}
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Requisitos comunes al llegar</h2>
        <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
          <li>{requirement.passportRule}</li>
          <li>{requirement.onwardTicket}</li>
          <li>{requirement.fundsProof}</li>
          {requirement.altPermit && <li>Permiso alternativo sugerido: {requirement.altPermit}</li>}
          {requirement.notes.map((note) => (
            <li key={note}>{note}</li>
          ))}
        </ul>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Casos que pueden cambiar la respuesta</h2>
        <p className="text-sm text-gray-700">
          Trabajo, estudios, residencia, voluntariado, tránsito de larga duración o tener doble nacionalidad
          pueden modificar los requisitos. Consulta la categoría de visa correspondiente en las fuentes oficiales.
        </p>
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Fuentes oficiales</h2>
        <SourcesList sources={requirement.sources} />
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Contacto de la Embajada o Consulado</h2>
        <EmbassyCard embassy={requirement.embassy} />
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Preguntas frecuentes</h2>
        <FAQ items={faqItems} />
      </section>

      <section className="card p-6 space-y-3">
        <h2 className="text-xl font-semibold text-gray-900">Aviso importante</h2>
        <p className="text-sm text-gray-700">
          La información de esta página es orientativa. Las políticas migratorias cambian con frecuencia y pueden
          variar según tu pasaporte, antecedentes o motivo de viaje. Confirma siempre con la embajada o consulado
          antes de comprar pasajes o iniciar tu viaje.
        </p>
        <p className="text-sm text-gray-700">
          ¿Ves un dato desactualizado? Avísanos para revisar el PDF de Henley en la siguiente generación del dataset.
        </p>
      </section>

      <section className="flex items-center justify-between text-sm text-gray-700">
        <span>¿Quieres revisar otra combinación?</span>
        <Link
          href="/"
          className="rounded-lg bg-brand-primary px-4 py-2 text-white font-semibold hover:bg-brand-dark"
        >
          Volver al inicio
        </Link>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </div>
  );
}

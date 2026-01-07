import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes sobre visas y autorizaciones | NecesitoVisa.com",
  description:
    "Respuestas claras sobre visas, eVisa y autorizaciones electrónicas como ESTA o eTA. Información general y actualizada.",
};

const faqItems = [
  {
    question: "¿Qué es una visa?",
    answer:
      "Una visa es un permiso oficial emitido por un país que autoriza a una persona extranjera a entrar, permanecer o transitar por su territorio durante un tiempo y con un propósito específico (turismo, trabajo, estudio, tránsito, etc.). Los requisitos dependen de la nacionalidad y el destino.",
  },
  {
    question: "¿Qué significa “no necesita visa”?",
    answer:
      "Significa que puedes ingresar al país sin solicitar una visa previa, normalmente por turismo y por un tiempo limitado. Aun así, pueden exigirse otros requisitos como pasaporte vigente, pasaje de salida, seguro o fondos suficientes.",
  },
  {
    question: "¿Qué es una e-Visa?",
    answer:
      "Una e-Visa es una visa que se solicita completamente por internet, sin acudir a una embajada. Una vez aprobada, queda asociada electrónicamente a tu pasaporte y se verifica al momento del ingreso al país.",
  },
  {
    question: "¿Qué es una ESTA, eTA o ETA?",
    answer:
      "Las autorizaciones electrónicas como ESTA, eTA o ETA no son visas tradicionales. Permiten viajar por turismo o tránsito sin visa, pero deben solicitarse online antes del viaje y pueden tener costo y vigencia limitada.",
  },
  {
    question: "¿Quién otorga las visas y autorizaciones de viaje?",
    answer:
      "Las visas y autorizaciones solo son otorgadas por autoridades oficiales del país de destino, como embajadas, consulados o servicios de inmigración. Ninguna aerolínea ni sitio privado emite visas.",
  },
  {
    question: "¿Pueden cambiar los requisitos de visa?",
    answer:
      "Sí. Los requisitos migratorios pueden cambiar en cualquier momento. Por eso siempre se recomienda verificar la información directamente en fuentes oficiales antes de viajar.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function FaqPage() {
  return (
    <div className="container-box py-12 space-y-10">
      <section className="space-y-4">
        <p className="inline-flex rounded-full bg-brand-primary/10 px-3 py-1 text-sm font-medium text-brand-primary">
          Preguntas frecuentes
        </p>
        <h1 className="text-3xl font-bold text-slate-900">Conceptos básicos sobre visas y autorizaciones</h1>
        <p className="text-lg text-slate-600">
          Respuestas claras y neutrales para entender términos comunes antes de planificar tu viaje.
        </p>
      </section>

      <section className="card p-6 space-y-6">
        {faqItems.map((item) => (
          <div key={item.question} className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
            <p className="text-sm text-slate-600">{item.answer}</p>
          </div>
        ))}
      </section>

      <section className="text-sm text-slate-500">
        Esta información es general y no constituye asesoría legal ni migratoria. Verifica siempre con fuentes
        oficiales antes de viajar.
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </div>
  );
}

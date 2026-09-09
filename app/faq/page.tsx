import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Preguntas frecuentes sobre visas | NecesitoVisa.com",
  description: "Respuestas claras sobre visas, eVisa y autorizaciones electrónicas antes de viajar.",
};

const faqItems = [
  { question: "¿Qué es una visa?", answer: "Una visa es un permiso oficial emitido por un país que autoriza a una persona extranjera a entrar, permanecer o transitar por su territorio durante un tiempo y con un propósito específico. Los requisitos dependen de la nacionalidad y el destino." },
  { question: "¿Qué significa “no necesita visa”?", answer: "Significa que puedes ingresar sin solicitar una visa previa, normalmente por turismo y durante un tiempo limitado. Aun así, pueden exigirse pasaporte vigente, pasaje de salida, seguro o fondos suficientes." },
  { question: "¿Qué es una e-Visa?", answer: "Es una visa que se solicita completamente por internet. Una vez aprobada, queda asociada electrónicamente a tu pasaporte y se verifica al momento del ingreso." },
  { question: "¿Qué es una ESTA, eTA o ETA?", answer: "Son autorizaciones electrónicas, no visas tradicionales. Permiten viajar por turismo o tránsito sin visa, pero deben solicitarse online antes del viaje y pueden tener costo y vigencia limitada." },
  { question: "¿Quién otorga las visas y autorizaciones?", answer: "Solo las autoridades oficiales del país de destino: embajadas, consulados o servicios de inmigración. Ninguna aerolínea ni sitio privado emite visas." },
  { question: "¿Pueden cambiar los requisitos?", answer: "Sí. Las políticas migratorias pueden cambiar en cualquier momento. Verifica siempre la información directamente en fuentes oficiales antes de viajar." },
];

const faqSchema = {
  "@context": "https://schema.org", "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
};

export default function FaqPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="travel-hero relative overflow-hidden text-white">
        <div className="container-box relative z-10 py-12 sm:py-16">
          <p className="section-label text-cyan-200">Resuelve tus dudas</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl">Preguntas frecuentes</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-sky-100">Conceptos básicos para entender visas y autorizaciones antes de planificar tu viaje.</p>
        </div>
      </section>
      <div className="container-box relative z-10 -mt-8 space-y-8 pb-14">
        <section className="card divide-y divide-slate-100 overflow-hidden">
          {faqItems.map((item, index) => (
            <details key={item.question} className="group p-5 sm:p-6" open={index === 0}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-slate-900">
                <span>{item.question}</span><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-cyan-700 transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="max-w-4xl pt-4 text-sm leading-relaxed text-slate-600">{item.answer}</p>
            </details>
          ))}
        </section>
        <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-xl sm:p-8">
          <p className="section-label text-cyan-300">Importante</p><h2 className="mt-2 text-xl font-bold">La información puede cambiar</h2>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300">NecesitoVisa.com es una herramienta referencial. Antes de comprar pasajes, confirma los requisitos con la embajada, consulado o autoridad migratoria correspondiente.</p>
        </section>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
    </div>
  );
}

interface FAQItem {
  question: string;
  answer: string;
}

export function FAQ({ items }: { items: FAQItem[] }) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <details key={item.question} className="card p-4 group">
          <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-brand-dark">
            {item.question}
          </summary>
          <p className="mt-2 text-sm text-gray-700">{item.answer}</p>
        </details>
      ))}
    </div>
  );
}

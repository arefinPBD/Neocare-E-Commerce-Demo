import type { Dictionary } from '@/lib/i18n';

const PENDING = '[TODO: client]';

/**
 * S11 — native <details>/<summary>. Chevron rotates 180deg over --dur-base.
 * Summary is the full-width target, min-height 44px (DESIGN.md §6).
 *
 * FAQPage JSON-LD is emitted ONLY for questions whose answer is confirmed.
 * Publishing "[TODO: client]" into structured data would push placeholder text
 * into search results as though it were the real answer. Unconfirmed questions
 * still render on the page, visibly marked.
 */
export function Faq({ t }: { t: Dictionary }) {
  const answered = t.faq.items.filter((item) => !item.a.includes(PENDING));

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: answered.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };

  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="section-rhythm bg-surface-alt"
    >
      {answered.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}

      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <h2 id="faq-heading" className="type-h1 measure text-fg">
          {t.faq.title}
        </h2>

        <ul className="mt-8 border-t border-hairline">
          {t.faq.items.map((item, i) => (
            <li key={i} className="border-b border-hairline">
              <details className="group">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 type-h3 font-semibold text-fg transition-colors duration-[--dur-fast] ease-[--ease-out] [&::-webkit-details-marker]:hidden hover:text-green-800">
                  <span className="measure">{item.q}</span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0 text-green-700 transition-transform duration-[--dur-base] ease-[--ease-out] group-open:rotate-180 group-hover:translate-y-0.5"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </summary>
                <p className="type-body measure pb-5 text-fg-muted">{item.a}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

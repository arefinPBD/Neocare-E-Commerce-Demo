import { Button } from '@/components/ui/Button';
import type { Dictionary } from '@/lib/i18n';

/* S12 — primary CTA. Links to '#' for the demo; commerce is out of scope (§1).
 * The decorative texture carries no product claim, so alt="". */
export function ShopCta({ t }: { t: Dictionary }) {
  return (
    <section
      aria-labelledby="cta-heading"
      className="relative isolate section-rhythm bg-surface-brand"
    >
      <img
        src="/decor/texture.webp"
        alt=""
        aria-hidden="true"
        width={1376}
        height={400}
        loading="lazy"
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-40"
      />

      <div className="mx-auto max-w-(--container-content) px-4 text-center md:px-6">
        <h2 id="cta-heading" className="type-h1 mx-auto measure text-green-900">
          {t.cta.title}
        </h2>
        <p className="type-body-lg mx-auto measure mt-4 text-fg">
          {t.cta.body}
        </p>
        <div className="mt-8">
          <Button href="#">{t.cta.button}</Button>
        </div>
        <p className="type-small mt-4 text-fg-muted">{t.footer.demoNote}</p>
      </div>
    </section>
  );
}

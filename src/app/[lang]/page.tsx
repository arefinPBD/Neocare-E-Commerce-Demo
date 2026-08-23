import { lang } from 'next/root-params';

import { BestSellers } from '@/components/sections/BestSellers';
import { CategoryRows } from '@/components/sections/CategoryRows';
import { Faq } from '@/components/sections/Faq';
import { Hero } from '@/components/sections/Hero';
import { NewbornSection } from '@/components/sections/NewbornSection';
import { ProductSequence } from '@/components/sections/ProductSequence';
import { SizeSelector } from '@/components/sections/SizeSelector';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { getDictionary, isLocale } from '@/lib/i18n';

/* BUILD_SPEC v3.1 §5.4 — section order: Hero, Best Sellers, Category rows,
 * Trust strip, New Born, Size selector, FAQ, Look Closer, Footer. The promo
 * bar, header and footer live in `layout.tsx` so every route has them
 * (§5.1-§5.3 assume chrome sitewide).
 *
 * The shop slot is `BestSellers` + `CategoryRows` as of v3.1, replacing
 * v3.0's `ShopCta`. Same reasoning that produced ShopCta still holds — the
 * full five-product `ProductGrid` cost 135vh desktop / 306vh mobile to render
 * what `/products` already renders (CLAUDE.md Stage 6) — but ShopCta showed
 * three diaper sizes and nothing else, so three of the four product
 * categories were invisible to anyone who never opened the dropdown. §5.2
 * now shows one product per category, and §5.5 adds a compact row per
 * category with the best sellers excluded so nothing repeats. `ProductGrid`
 * is untouched and still renders all five sizes on `/products`, where §6.2
 * wants it. Measured height cost is in CLAUDE.md Stage 7. */
export default async function Page() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);

  return (
    <main id="main">
      <Hero t={t} />
      <BestSellers t={t} locale={current} />
      <CategoryRows t={t} locale={current} />
      <TrustStrip t={t} />
      <NewbornSection t={t} />
      <SizeSelector t={t} locale={current} />
      <Faq t={t} />
      <ProductSequence t={t} />
    </main>
  );
}

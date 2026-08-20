import { lang } from 'next/root-params';

import { Faq } from '@/components/sections/Faq';
import { Hero } from '@/components/sections/Hero';
import { NewbornSection } from '@/components/sections/NewbornSection';
import { ProductSequence } from '@/components/sections/ProductSequence';
import { ShopCta } from '@/components/sections/ShopCta';
import { SizeSelector } from '@/components/sections/SizeSelector';
import { TrustStrip } from '@/components/sections/TrustStrip';
import { getDictionary, isLocale } from '@/lib/i18n';

/* BUILD_SPEC v3.0 §5.4 — section order: Hero, Shop, Trust strip, New Born,
 * Size selector, FAQ, Look Closer, Footer. Order is unchanged from v2.1;
 * the promo bar, header and footer moved to `layout.tsx` so every route has
 * them (§5.1-§5.3 assume chrome sitewide).
 *
 * The Shop slot holds `ShopCta`, not the full `ProductGrid`, as of v3.0. The
 * measured reason is in CLAUDE.md Stage 6: the five-product grid cost 135vh on
 * desktop and 306vh on mobile to render the same five products `/products`
 * already renders, against a 900vh page budget that was originally written for
 * a page whose shop slot was a CTA. The full grid still lives on `/products`,
 * where §6.2 wants it. */
export default async function Page() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);

  return (
    <main id="main">
      <Hero t={t} />
      <ShopCta t={t} locale={current} />
      <TrustStrip t={t} />
      <NewbornSection t={t} />
      <SizeSelector t={t} locale={current} />
      <Faq t={t} />
      <ProductSequence t={t} />
    </main>
  );
}

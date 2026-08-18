import { lang } from 'next/root-params';

import { ProductGrid } from '@/components/sections/ProductGrid';
import { getDictionary, isLocale } from '@/lib/i18n';

/* BUILD_SPEC v2.0 §5.2 — the full Diapers Line catalogue as its own page,
 * linked from the header's "Our Products -> Diapers Line" item. Same
 * ProductGrid section used on the homepage. */
export default async function ProductsPage() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);
  return (
    <main id="main">
      <ProductGrid t={t} locale={current} />
    </main>
  );
}

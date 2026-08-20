import { lang } from 'next/root-params';

import { CheckoutSummary } from '@/components/cart/CheckoutSummary';
import { getDictionary, isLocale } from '@/lib/i18n';

/* BUILD_SPEC v3.0 §7.2 — the cart page. /cart and /checkout are one route by
 * design (§7.2's default, confirmed with the client): a separate /checkout
 * would exist only to say it does not work. Nothing here takes payment or
 * implies an order was placed (§1 non-negotiable 6). */
export default async function CheckoutPage() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);
  return <CheckoutSummary t={t} locale={current} />;
}

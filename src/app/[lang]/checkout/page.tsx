import { lang } from 'next/root-params';

import { CheckoutSummary } from '@/components/cart/CheckoutSummary';
import { getDictionary, isLocale } from '@/lib/i18n';

/* BUILD_SPEC §6.4 — static placeholder, not a payment flow. */
export default async function CheckoutPage() {
  const current = await lang();
  if (!current || !isLocale(current)) return null;

  const t = getDictionary(current);
  return <CheckoutSummary t={t} locale={current} />;
}

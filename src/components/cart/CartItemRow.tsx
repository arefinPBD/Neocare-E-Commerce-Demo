import Image from 'next/image';

import { useCart } from '@/components/cart/CartContext';
import type { Dictionary, Locale } from '@/lib/i18n';
import { lineTotal, type CartItem } from '@/lib/cart';
import { fmtMoney } from '@/lib/numerals';
import { SIZES } from '@/lib/sizes';

export function CartItemRow({
  item,
  t,
  locale,
}: {
  item: CartItem;
  t: Dictionary;
  locale: Locale;
}) {
  const { setQuantity, removeItem } = useCart();
  const size = SIZES.find((row) => row.key === item.sizeKey);
  if (!size) return null;

  const name = t.sizes.names[item.sizeKey];

  return (
    <div className="flex gap-4 py-4">
      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-soft bg-surface-alt">
        <Image
          src={size.image}
          alt=""
          width={size.imageW}
          height={size.imageH}
          sizes="80px"
          className="h-20 w-20 object-contain"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="type-body font-semibold text-fg">{name}</p>
        <p className="type-small text-fg-muted">
          {t.cart.packLabel} {item.pack} {t.sizes.packUnit}
        </p>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-pill border border-hairline">
            <button
              type="button"
              aria-label={t.cart.decreaseQty}
              onClick={() => setQuantity(item.sizeKey, item.pack, item.quantity - 1)}
              className="flex min-h-9 min-w-9 items-center justify-center type-body font-semibold text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
            >
              −
            </button>
            <span className="type-small min-w-4 text-center text-fg" aria-live="polite">
              {item.quantity}
            </span>
            <button
              type="button"
              aria-label={t.cart.increaseQty}
              onClick={() => setQuantity(item.sizeKey, item.pack, item.quantity + 1)}
              className="flex min-h-9 min-w-9 items-center justify-center type-body font-semibold text-fg transition-colors duration-[--dur-fast] hover:bg-surface-brand"
            >
              +
            </button>
          </div>
          <p className="type-body font-semibold text-fg">
            {fmtMoney(lineTotal(item), locale)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => removeItem(item.sizeKey, item.pack)}
          className="mt-2 type-small text-fg-muted underline-offset-2 transition-colors duration-[--dur-fast] hover:text-fg hover:underline"
        >
          {t.cart.remove}
        </button>
      </div>
    </div>
  );
}

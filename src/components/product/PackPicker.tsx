'use client';

import { useId, useState } from 'react';

import { AddToCartButton } from '@/components/product/AddToCartButton';
import type { Locale } from '@/lib/i18n';
import { fmt, fmtMoney } from '@/lib/numerals';
import type { SizeKey } from '@/lib/sizes';

/**
 * BUILD_SPEC v3.0 §6.4 — the pack row, plus the Add to cart button it feeds.
 *
 * The reference kit stacks a colour picker over a size picker. NeoCare has no
 * colour axis and inventing one is forbidden, so this slot carries the
 * product's real pack variants and the size slot above it carries real
 * cross-navigation (see SizeRowChips).
 *
 * §2 — the kit uses Headless UI's RadioGroup. This is a native <fieldset> plus
 * `input[type=radio].peer.sr-only` styled through `peer-checked:` /
 * `peer-focus-visible:`. Arrow-key traversal, roving focus and group semantics
 * come from the platform, at zero bytes and with nothing to get wrong.
 *
 * The picker and the CTA live in one client component because the button needs
 * the selected pack. Everything else on the page stays a Server Component.
 *
 * Chip widths: §6.4 writes `sm:flex-1`, which is inert inside the `grid` the
 * same rule specifies. The grid's equal fractional columns achieve what
 * flex-1 is there to achieve, so it is omitted rather than written as a
 * no-op. The rule behind it still holds and is what matters: no chip width is
 * fixed to English text. "New Born" is three times the width of "XL" before
 * Bangla adds 15-30%.
 *
 * `uppercase` is written verbatim per DESIGN.md §2.3 — the
 * `[lang="bn"] * { text-transform: none !important }` rule in globals.css
 * neutralises it on /bn, so Latin gets the kit's treatment and Bangla stays
 * legible without a second code path.
 */
export function PackPicker({
  sizeKey,
  packs,
  priceByPack,
  locale,
  label,
  packUnit,
  addToCartLabel,
}: {
  sizeKey: SizeKey;
  packs: number[];
  priceByPack: Record<number, number>;
  locale: Locale;
  label: string;
  packUnit: string;
  addToCartLabel: string;
}) {
  const groupId = useId();
  // §6.4: the first pack is selected by default.
  const [selected, setSelected] = useState(packs[0]!);

  return (
    <>
      <fieldset aria-label={label}>
        <legend className="type-small font-semibold text-fg">{label}</legend>

        <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-5">
          {packs.map((pack) => {
            const id = `${groupId}-${pack}`;
            return (
              <div key={pack}>
                <input
                  id={id}
                  type="radio"
                  name={groupId}
                  value={pack}
                  checked={selected === pack}
                  onChange={() => setSelected(pack)}
                  className="peer sr-only"
                />
                <label
                  htmlFor={id}
                  className={
                    'flex cursor-pointer flex-col items-center rounded-pill border border-hairline bg-surface px-3 py-3 ' +
                    'type-small font-semibold uppercase text-fg ' +
                    'transition-colors duration-[--dur-fast] hover:bg-surface-brand ' +
                    'peer-checked:border-transparent peer-checked:bg-brand peer-checked:text-fg-inverse peer-checked:hover:bg-brand-hover ' +
                    'peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2'
                  }
                >
                  <span>
                    {fmt(pack, locale)} {packUnit}
                  </span>
                  <span className="font-normal">
                    {fmtMoney(priceByPack[pack]!, locale)}
                  </span>
                </label>
              </div>
            );
          })}
        </div>
      </fieldset>

      {/* §6.3 item 3 — full width, the §6.1 primary-CTA shape. */}
      <AddToCartButton
        sizeKey={sizeKey}
        pack={selected}
        className="mt-8 w-full !px-8"
      >
        {addToCartLabel}
      </AddToCartButton>
    </>
  );
}

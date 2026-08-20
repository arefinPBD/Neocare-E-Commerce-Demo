# English copy audit — proposal, not applied

**Prepared:** 20 August 2026 · Against `src/content/en.json` at commit `8c5dbe2`
**Status:** Nothing in this document has been applied. `en.json` and `bn.json` are unchanged apart from the new v3.0 keys.

---

## How to read this

The client asked for `design-taste-frontend`'s copy self-audit over the English strings only, delivered as a diff for approval. Bangla is untouched.

**Approving any change here makes `en.json` and `bn.json` diverge in content** until the affected Bangla strings are re-translated. Key parity stays 154/154 either way; it is the wording that would drift. `CLAUDE.md` records that `bn.json` is written Bangla awaiting a native reviewer's sign-off, so the cheapest sequencing is to decide these, then send the changed English and the Bangla for review together.

Findings are in three groups. **Group A is the one that matters** — those are strings that are now wrong or misleading, independent of anyone's taste. Group B is the taste skill's dash rule. Group C is housekeeping.

Each row is `key`, current string, proposed string, and why.

---

## Group A — strings that are now inaccurate or leak internal voice

These six are the real findings. I would recommend all of them regardless of the taste skill.

### A1. `shop.intro`

> **Now:** Real pack sizes, priced and ready to add to your cart.
> **Proposed:** Every size, in the pack counts we ship.

Two problems. "Priced" is not true in the demo: §4.1 makes every price a marked placeholder, so the copy asserts something the page does not deliver. And "Real pack sizes" is defensive in a way that only makes sense to someone who knows some other part of the page is placeholder — a customer reads "real" and wonders what was fake.

### A2. `cart.shippingNote`

> **Now:** Shipping calculated at checkout.
> **Proposed:** [TODO: client] Delivery cost not yet confirmed.

This string is now the **value** of the Shipping row in the order-summary panel (§7.2), sitting directly under copy that says checkout is not live. As written it promises a calculation that cannot happen, on a page that has just said so. It also states a policy — that shipping is calculated at checkout rather than, say, being flat-rate by zone — which §14 item 4 lists as unconfirmed.

The proposal keeps it a note rather than a figure, which is what §7.2 requires, and marks it as pending like every other unconfirmed fact.

### A3. `cart.checkout`

> **Now:** Checkout
> **Proposed:** View cart

This is the drawer's CTA. §7.2 merged `/cart` and `/checkout` into one route that explicitly takes no payment, so a button labelled "Checkout" now leads to a page whose whole message is that checkout does not exist. Non-negotiable 6 says the cart must never imply a real transaction, and a Checkout button is the strongest such implication on the site.

### A4. `category.items.*.intro` (three identical strings)

> **Now:** Coming soon — this category doesn't have real products yet. These cards use NeoCare diaper photography as a placeholder for the finished layout.
> **Proposed:** Coming soon. This category is not stocked yet.

The second sentence is a build note addressed to the development team, not to a customer: it explains the placeholder methodology on a public page. §4.2 asks for "an honest 'Coming soon' label", which the first clause already is. The `// TODO: client — placeholder photography` marker at the data source is where the methodology note belongs, and it is already there.

Three identical strings also means one edit has to be made three times; worth collapsing to a single shared key if you approve the change.

### A5. `category.items.*.items.*` (nine strings)

> **Now:** Adult Diapers — Regular · Baby Wipes — Pack of 80 · Face Wipes — 3 × 80 Pack
> **Proposed:** Regular · Pack of 80 · 3 × 80 Pack

Each card already sits under a heading naming the category, so repeating "Adult Diapers" on every card in the Adult Diapers grid is redundant. It also forces the em dash construction that Group B flags. Dropping the prefix removes both problems at once.

### A6. `newborn.galleryPrint1Alt` through `galleryPrint6Alt`

> **Now:** "NeoCare diaper with colorful print design" · "with character print design" · "with cartoon pattern design" · "with playful print pattern" · "with white base and cute print" · "with white soft top and printed design"
> **Proposed:** describe what is actually printed on each one.

This is an accessibility finding more than a style one. Six near-identical alt strings mean a screen-reader user hears six variations of "diaper with a print" and learns nothing that distinguishes the images — which is the same as having no alt text, at six times the length. The neighbouring alt strings in the same section do this properly: "printed with an orange kitten character" is useful; "with playful print pattern" is not.

I have not proposed replacements because I cannot see the prints well enough to describe them accurately, and inventing a description of a product image is exactly the kind of thing non-negotiable 3 exists to prevent. **This one needs someone to look at the six files in `public/product/prints/` and write what is on them.**

Also: `colorful` is the only US spelling in the file. Everything else is en-GB.

---

## Group B — the em dash and en dash rule

`design-taste-frontend` bans both outright in user-visible text. This is a taste rule, not a correctness one, and the client scoped copy changes to English, so **every one of these renders in Bangla too and would need the same treatment there.**

| Where | Current | Proposed |
|---|---|---|
| `meta.title` | NeoCare — Baby Diapers | NeoCare Baby Diapers |
| `newborn.body` | ...leaves the healing navel untouched — designed for the first weeks... | ...leaves the healing navel untouched. Designed for the first weeks... |
| `checkout.notLive` | Checkout isn't live in this demo yet — this page shows what's in your cart, nothing more. | Checkout isn't live in this demo yet. This page shows what's in your cart, nothing more. |
| `faq[1].a` | Use the size finder above — move the slider... | Use the size finder above. Move the slider... |
| `faq[12].a` | Please do not flush it — a diaper will block a toilet or drain. | Please do not flush it. A diaper will block a toilet or drain. |
| `trust.since` | [TODO: client] Trusted since — | [TODO: client] Trusted since (year) |
| `category.items.*.intro` ×3 | Coming soon — this category... | covered by A4 |
| `category.items.*.items.*` ×9 | Adult Diapers — Regular | covered by A5 |

**Two I would leave alone, and recommend against changing:**

- **`sizes.weightRange`: "For {min}–{max} kg"** and **`newborn.badge`: "New Born · 0–4 kg"**. The en dash here is a numeric range, which is what an en dash is for. Replacing it with a hyphen makes "0-4" read momentarily as a subtraction, and the string appears in the size finder, the PDP facts row and the New Born badge — the three places where a misread number matters most on a baby-care site. The taste rule is worth breaking here.
- **`footer.phone` / `email` / `address` / `dbid`**, which use `[TODO: client — unconfirmed: ...]`. These are internal markers that will be deleted when the client supplies real values. Editing them is churn.

---

## Group C — housekeeping

### C1. Eight keys are dead and can be deleted from both locales

Verified by grep across `src/`; none is referenced statically or through a dynamic lookup.

| Key | Why it is dead |
|---|---|
| `nav.home` | No Home nav item exists; the logo is the home link. |
| `nav.closeMenu` | The mobile disclosure is a native `<details>`; it has no separate close control. |
| `hero.imageAlt` | The hero photo became a decorative background layer in v2.1 and correctly carries `alt=""` `aria-hidden`. |
| `newborn.imagePending` | Superseded when the marquee replaced the single pending image. |
| `newborn.lifestyleAlt` | The lifestyle image is not currently rendered. |
| `newborn.galleryFastenerAlt` | Its gallery entry was removed. |
| `checkout.title` | The cart page `<h1>` is `cart.title` per §7.2. |
| `checkout.backToShopping` | §7.2's footer link uses `cart.continueShopping`; pairing the two produced "Back to shopping Continue shopping". |

Deleting these is safe and keeps parity at 146/146. **But** `newborn.lifestyleAlt` is dead because the lifestyle photograph is not on the page — that may be an oversight in the section rather than a dead string, and is worth a look before deleting.

### C2. Strings that are fine and I checked anyway

No fabricated figures, no invented percentages or durations, no "Jane Doe" placeholder names, no startup-slop brand names, no filler verbs ("elevate", "seamless", "unleash"). FAQ 2, 3, 4, 5, 6 and 11 correctly carry `[TODO: client]` rather than asserting a policy. FAQ 8, the newborn-skin safety answer, states no certification, test result or figure — it stays flagged for compliance sign-off in `CLAUDE.md`, and nothing in this audit changes it.

---

## Recommendation

Approve **Group A** and **Group C1**. Those are correctness and hygiene.

**Group B is genuinely optional.** It is one agency's house style, the strings it targets are grammatical as they stand, and approving it means re-translating five Bangla strings to remove a punctuation mark. If the answer is "not worth it", the only cost is that this document exists.

A6 is blocked on someone describing the six print images.

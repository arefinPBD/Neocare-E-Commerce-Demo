import Image from 'next/image';

import logo from '../../../public/brand/logo.svg';
import type { Dictionary } from '@/lib/i18n';

/* Footer — logo, contact, DBID, social, copyright 2026 (§5 S12).
 *
 * Every contact value is [TODO: client]. The phone, email and address found on
 * the NeoCare Facebook page are carried in the placeholder text so the client
 * can confirm or correct them, but nothing unverified is presented as fact.
 * §5 S12 asks for a "single consistent phone format", which implies the audit
 * found more than one number in circulation. */
export function Footer({ t }: { t: Dictionary }) {
  const socials = [
    t.footer.social.facebook,
    t.footer.social.instagram,
    t.footer.social.youtube,
    t.footer.social.tiktok,
  ];

  return (
    <footer className="border-t border-hairline bg-surface py-12">
      <div className="mx-auto max-w-(--container-content) px-4 md:px-6">
        <Image src={logo} alt={t.nav.logoAlt} className="h-10 w-auto" />
        <p className="type-small mt-3 text-fg-muted">{t.footer.tagline}</p>

        <div className="mt-8 grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="type-h3 font-semibold text-fg">
              {t.footer.contactTitle}
            </h2>
            <ul className="mt-3 space-y-2 type-small text-fg-muted">
              <li>{t.footer.phone}</li>
              <li>{t.footer.email}</li>
              <li>{t.footer.address}</li>
              <li>{t.footer.dbid}</li>
            </ul>
          </div>

          <div>
            <h2 className="type-h3 font-semibold text-fg">
              {t.footer.socialTitle}
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {socials.map((label) => (
                <li key={label}>
                  <span className="inline-flex min-h-11 items-center rounded-pill border border-hairline px-4 py-2 type-small text-fg-muted">
                    {label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p className="type-small mt-10 border-t border-hairline pt-6 text-fg-muted">
          {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}

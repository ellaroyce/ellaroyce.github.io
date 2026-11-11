import { usePrefs } from '../lib/PrefsContext';
import { CONTACT_EMAIL, CONTACT_PHONE, LOCATION } from '../lib/site';
import { LegalLayout } from './LegalLayout';

export function Impressum() {
  const { t } = usePrefs();
  return (
    <LegalLayout>
      <h1>{t('imp.title')}</h1>

      <h2>{t('imp.h1')}</h2>
      <p><strong>{t('imp.provider')}</strong></p>
      <address>
        Ella Türümina<br />
        Pruna Secura<br />
        <span>{t('imp.addr.label')}</span>: {LOCATION}
      </address>

      <h2>{t('imp.contact.label')}</h2>
      <p>
        <span>{t('imp.contact.phone')}</span> {CONTACT_PHONE}<br />
        <span>{t('imp.contact.email')}</span> <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <h2>{t('imp.vat.h')}</h2>
      <p>{t('imp.vat.p')}</p>

      <h2>{t('imp.resp.h')}</h2>
      <address>
        Ella Türümina<br />
        {LOCATION}
      </address>

      <h2>{t('imp.disp.h')}</h2>
      <p>{t('imp.disp.p')}</p>

      <h2>{t('imp.liability.h')}</h2>
      <p>{t('imp.liability.p')}</p>

      <h2>{t('imp.links.h')}</h2>
      <p>{t('imp.links.p')}</p>

      <h2>{t('imp.copy.h')}</h2>
      <p>{t('imp.copy.p')}</p>
    </LegalLayout>
  );
}

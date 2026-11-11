import { Fragment } from 'react';
import type { CopyKey } from '../content/en';
import { usePrefs } from '../lib/PrefsContext';
import { CONTACT_EMAIL, CONTACT_PHONE, LOCATION } from '../lib/site';
import { LegalLayout } from './LegalLayout';

const SECTIONS: Array<{ h: CopyKey; p: CopyKey }> = [
  { h: 'ds.host.h', p: 'ds.host.p' },
  { h: 'ds.contactdata.h', p: 'ds.contactdata.p' },
  { h: 'ds.storage.h', p: 'ds.storage.p' },
  { h: 'ds.rights.h', p: 'ds.rights.p' },
];

export function Datenschutz() {
  const { t } = usePrefs();
  return (
    <LegalLayout>
      <h1>{t('ds.h1')}</h1>

      <h2>{t('ds.intro.h')}</h2>
      <p>{t('ds.intro.p')}</p>

      <h2>{t('ds.ctrl.h')}</h2>
      <p>{t('ds.ctrl.p')}</p>
      <address>
        Ella Türümina · Pruna Secura<br />
        {LOCATION}<br />
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> · {CONTACT_PHONE}
      </address>

      {SECTIONS.map((s) => (
        <Fragment key={s.h}>
          <h2>{t(s.h)}</h2>
          <p>{t(s.p)}</p>
        </Fragment>
      ))}

      <p><em>{t('ds.updated')}</em></p>
    </LegalLayout>
  );
}

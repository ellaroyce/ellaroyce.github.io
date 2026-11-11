import { usePrefs } from '../lib/PrefsContext';
import { BOOKING_URL } from '../lib/site';
import { Footer } from './Footer';
import { Reveal } from './Reveal';

/** Contact finale. The footer sits inside this section so it shares its dark panel. */
export function Contact() {
  const { t } = usePrefs();
  return (
    <section className="contact" id="contact">
      <Reveal className="wrap contact__inner">
        <p className="eyebrow">{t('contact.eyebrow')}</p>
        <h2 className="contact__title">{t('contact.title')}</h2>
        <p className="contact__lede">{t('contact.lede')}</p>
        <div className="contact__cta">
          <a className="btn btn--primary btn--lg" href={BOOKING_URL} target="_blank" rel="noopener noreferrer">
            {t('contact.cta')}
          </a>
          <span className="contact__cta-note">{t('contact.ctanote')}</span>
        </div>
        <ul className="trustbar" role="list">
          <li className="trustbar__item">{t('trust.nda')}</li>
          <li className="trustbar__item">{t('trust.eu')}</li>
        </ul>
      </Reveal>

      <Footer />
    </section>
  );
}

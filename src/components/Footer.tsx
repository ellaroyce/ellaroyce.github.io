import { usePrefs } from '../lib/PrefsContext';

export function Footer() {
  const { t, href } = usePrefs();
  return (
    <footer className="footer">
      <div className="wrap footer__inner">
        <span>{t('footer.copy')}</span>
        <span className="footer__tag">{t('footer.tag')}</span>
        <nav className="footer__links" aria-label={t('footer.legal')}>
          <a href={href('impressum.html')}>{t('footer.imprint')}</a>
          <a href={href('datenschutz.html')}>{t('footer.privacy')}</a>
        </nav>
      </div>
    </footer>
  );
}

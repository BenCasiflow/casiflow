import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const rgResources = {
  'Afghanistan': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Albania': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Algeria': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Australia': { name: 'Gambling Help Online', url: 'https://www.gamblinghelponline.org.au' },
  'Austria': { name: 'Spielsuchthilfe', url: 'https://www.spielsuchthilfe.at' },
  'Belgium': { name: 'EPIS (Gaming Commission)', url: 'https://www.gamingcommission.be/en/protection-of-players/access-ban' },
  'Bulgaria': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Canada': { name: 'Responsible Gambling Council', url: 'https://www.responsiblegambling.org' },
  'Croatia': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Cyprus': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Czech Republic': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Denmark': { name: 'ROFUS', url: 'https://www.rofus.nu' },
  'Estonia': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Finland': { name: 'Veikkaus Self-Exclusion', url: 'https://www.veikkaus.fi' },
  'France': { name: 'ANJ', url: 'https://www.anj.fr' },
  'Germany': { name: 'OASIS', url: 'https://www.oasis-sperrsystem.de' },
  'Greece': { name: 'KETHEA', url: 'https://www.kethea.gr' },
  'Hungary': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Iceland': { name: 'SÁÁ', url: 'https://www.saa.is' },
  'Ireland': { name: 'Gamblers Anonymous Ireland', url: 'https://www.gamblersanonymous.ie' },
  'Italy': { name: 'ADM Self-Exclusion', url: 'https://www.adm.gov.it' },
  'Latvia': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Lithuania': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Luxembourg': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Malta': { name: 'MGA Responsible Gambling', url: 'https://www.mga.org.mt' },
  'Netherlands': { name: 'CRUKS', url: 'https://cruksregister.nl/' },
  'New Zealand': { name: 'Gambling Helpline NZ', url: 'https://www.gamblinghelpline.co.nz' },
  'Norway': { name: 'Hjelpelinjen', url: 'https://www.hjelpelinjen.no' },
  'Poland': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Portugal': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Romania': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Slovakia': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Slovenia': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
  'Spain': { name: 'RGIAJ', url: 'https://www.ordenacionjuego.es' },
  'Sweden': { name: 'Spelpaus', url: 'https://www.spelpaus.se' },
  'Switzerland': { name: 'Swiss Addiction', url: 'https://www.sucht-schweiz.ch' },
  'United Kingdom': { name: 'GamStop', url: 'https://www.gamstop.co.uk' },
  'United States': { name: 'NVSEP', url: 'https://www.nvsep.com' },
  'default': { name: 'GamCare', url: 'https://www.gamcare.org.uk' },
};

function Footer({ jurisdiction }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const country = jurisdiction || sessionStorage.getItem('userCountry') || null;
  const rg = rgResources[country] || rgResources['default'];

  if (isMobile) {
    return (
      <div style={styles.footer}>
        <div style={styles.footerMobileRow}>
          <span style={styles.copyrightMobile}>&#169; Casiflow 2026</span>
          <span style={styles.divider}>&#183;</span>
          <Link to="/privacy-policy" style={styles.footerLinkMobile}>Privacy Policy</Link>
          <span style={styles.divider}>&#183;</span>
          <Link to="/terms-and-conditions" style={styles.footerLinkMobile}>Terms &amp; Conditions</Link>
          <span style={styles.divider}>&#183;</span>
          <Link to="/responsible-gambling" style={styles.footerLinkMobile}>Responsible Gambling</Link>
        </div>
        <div style={styles.footerMobileRow}>
          <a href={rg.url} target="_blank" rel="noopener noreferrer" style={styles.rgLink}>
            Want to self-exclude? &#8594; {rg.name}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerLeft}>
          <span style={styles.copyright}>&#169; Casiflow 2026</span>
          <div style={styles.footerLinks}>
            <Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
            <span style={styles.divider}>&#183;</span>
            <Link to="/terms-and-conditions" style={styles.footerLink}>Terms &amp; Conditions</Link>
            <span style={styles.divider}>&#183;</span>
            <Link to="/responsible-gambling" style={styles.footerLink}>Responsible Gambling</Link>
          </div>
        </div>
        <div style={styles.footerCenter}>
          <a href={rg.url} target="_blank" rel="noopener noreferrer" style={styles.rgLink}>
            Want to self-exclude? &#8594; {rg.name}
          </a>
        </div>
        <div style={styles.footerRight} />
      </div>
    </div>
  );
}

const styles = {
  footer: { background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', padding: '16px 28px', marginTop: 'auto' },
  footerContent: { display: 'flex', alignItems: 'center' },
  footerLeft: { display: 'flex', alignItems: 'center', gap: '20px', flex: 1 },
  copyright: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', whiteSpace: 'nowrap' },
  copyrightMobile: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', whiteSpace: 'nowrap' },
  footerLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
  footerLink: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' },
  footerLinkMobile: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', textDecoration: 'none', whiteSpace: 'nowrap' },
  divider: { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  footerCenter: { display: 'flex', justifyContent: 'center', flex: 1 },
  footerRight: { flex: 1 },
  rgLink: { color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' },
  footerMobileRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '3px 0' },
};

export default Footer;

import React from 'react';
import { Link } from 'react-router-dom';

const rgResources = {
  'Afghanistan': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Albania': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Algeria': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Australia': { name: 'Gambling Help Online', url: 'https://www.gamblinghelponline.org.au' },
  'Austria': { name: 'Spielsuchthilfe', url: 'https://www.spielsuchthilfe.at' },
  'Belgium': { name: 'EPIS', url: 'https://www.epis-info.be' },
  'Bulgaria': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Canada': { name: 'Responsible Gambling Council', url: 'https://www.responsiblegambling.org' },
  'Croatia': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Cyprus': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Czech Republic': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Denmark': { name: 'ROFUS', url: 'https://www.rofus.nu' },
  'Estonia': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Finland': { name: 'Veikkaus Self-Exclusion', url: 'https://www.veikkaus.fi' },
  'France': { name: 'Joueurs Info Service', url: 'https://www.joueurs-info-service.fr' },
  'Germany': { name: 'OASIS', url: 'https://www.oasis-sperrsystem.de' },
  'Greece': { name: 'KETHEA', url: 'https://www.kethea.gr' },
  'Hungary': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Iceland': { name: 'SÁÁ', url: 'https://www.saa.is' },
  'Ireland': { name: 'Gamblers Anonymous Ireland', url: 'https://www.gamblersanonymous.ie' },
  'Italy': { name: 'ADM Self-Exclusion', url: 'https://www.adm.gov.it' },
  'Latvia': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Lithuania': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Luxembourg': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Malta': { name: 'MGA Responsible Gambling', url: 'https://www.mga.org.mt' },
  'Netherlands': { name: 'CRUKS', url: 'https://cruksregister.nl/' },
  'New Zealand': { name: 'Gambling Helpline NZ', url: 'https://www.gamblinghelpline.co.nz' },
  'Norway': { name: 'Hjelpelinjen', url: 'https://www.hjelpelinjen.no' },
  'Poland': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Portugal': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Romania': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Slovakia': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Slovenia': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
  'Spain': { name: 'RGIAJ', url: 'https://www.ordenacionjuego.es' },
  'Sweden': { name: 'Spelpaus', url: 'https://www.spelpaus.se' },
  'Switzerland': { name: 'Swiss Addiction', url: 'https://www.sucht-schweiz.ch' },
  'United Kingdom': { name: 'GAMSTOP', url: 'https://www.gamstop.co.uk' },
  'United States': { name: 'NCPG', url: 'https://www.ncpgambling.org' },
  'default': { name: 'Gamblers Anonymous', url: 'https://www.gamblersanonymous.org' },
};

function Footer({ jurisdiction }) {
  const rg = rgResources[jurisdiction] || rgResources['default'];

  return (
    <div style={styles.footer}>
      <div style={styles.footerContent}>
        <div style={styles.footerLeft}>
          <span style={styles.copyright}>&#169; Casiflow 2026</span>
          <div style={styles.footerLinks}>
            <Link to="/privacy-policy" style={styles.footerLink}>Privacy Policy</Link>
            <span style={styles.divider}>&#183;</span>
            <Link to="/terms-and-conditions" style={styles.footerLink}>Terms &amp; Conditions</Link>
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
  footerLinks: { display: 'flex', alignItems: 'center', gap: '8px' },
  footerLink: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', textDecoration: 'none', whiteSpace: 'nowrap' },
  divider: { color: 'rgba(255,255,255,0.3)', fontSize: '13px' },
  footerCenter: { display: 'flex', justifyContent: 'center', flex: 1 },
  footerRight: { flex: 1 },
  rgLink: { color: '#38bdf8', fontSize: '13px', textDecoration: 'none', fontWeight: '600', whiteSpace: 'nowrap' },
};

export default Footer;
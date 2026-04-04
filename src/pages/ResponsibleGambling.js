import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut, AlertTriangle, Shield, CheckCircle, ExternalLink, Target } from 'lucide-react';
import Footer from '../components/Footer';
import { getCurrencySymbol } from '../utils/currency';

// Same jurisdiction map as Footer.js — kept in sync manually
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

// Countries with a dedicated national register (not the GamCare fallback)
const nationalRegisters = [
  { country: 'Australia', ...rgResources['Australia'] },
  { country: 'Austria', ...rgResources['Austria'] },
  { country: 'Belgium', ...rgResources['Belgium'] },
  { country: 'Canada', ...rgResources['Canada'] },
  { country: 'Denmark', ...rgResources['Denmark'] },
  { country: 'Finland', ...rgResources['Finland'] },
  { country: 'France', ...rgResources['France'] },
  { country: 'Germany', ...rgResources['Germany'] },
  { country: 'Greece', ...rgResources['Greece'] },
  { country: 'Iceland', ...rgResources['Iceland'] },
  { country: 'Ireland', ...rgResources['Ireland'] },
  { country: 'Italy', ...rgResources['Italy'] },
  { country: 'Malta', ...rgResources['Malta'] },
  { country: 'Netherlands', ...rgResources['Netherlands'] },
  { country: 'New Zealand', ...rgResources['New Zealand'] },
  { country: 'Norway', ...rgResources['Norway'] },
  { country: 'Spain', ...rgResources['Spain'] },
  { country: 'Sweden', ...rgResources['Sweden'] },
  { country: 'Switzerland', ...rgResources['Switzerland'] },
  { country: 'United Kingdom', ...rgResources['United Kingdom'] },
  { country: 'United States', ...rgResources['United States'] },
  { country: 'All other countries', ...rgResources['default'] },
];

function ResponsibleGambling({ user, profile, onLogout }) {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
  ];

  const country = profile?.country || sessionStorage.getItem('userCountry') || null;
  const rg = rgResources[country] || rgResources['default'];
  const symbol = getCurrencySymbol(profile);
  const depositLimit = profile?.monthly_deposit_limit || 0;
  const netLossLimit = profile?.monthly_net_loss_limit || 0;
  const hasLimits = depositLimit > 0 || netLossLimit > 0;

  const warningSignItems = [
    'Spending more than you can afford to lose',
    'Chasing losses to try to win back money',
    'Hiding your gambling from family or friends',
    'Gambling interfering with work or relationships',
    'Feeling anxious or irritable when not gambling',
    'Borrowing money to gamble',
  ];

  const selfAssessmentItems = [
    'Do I gamble more than I intend to?',
    'Do I gamble to escape problems or negative feelings?',
    'Have I tried to cut back on gambling but struggled?',
    'Do I hide my gambling from people close to me?',
    'Has gambling caused financial problems for me or my family?',
  ];

  const responsibleTips = [
    'Set a budget before you start and stick to it',
    'Only gamble with money you can afford to lose',
    'Set a time limit for each session',
    'Never gamble when stressed, upset or under the influence',
    'Take regular breaks',
  ];

  return (
    <div style={styles.appContainer}>
      {user && !isMobile && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <Link to="/dashboard" style={styles.logoLink}>
              <h1 style={styles.logoText}>Casiflow</h1>
            </Link>
          </div>
          <nav style={styles.sidebarNav}>
            {navItems.map(item => (
              <Link key={item.id} to={item.path} style={styles.navItem}>
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          {onLogout && (
            <button onClick={onLogout} style={styles.sidebarLogout}>
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          )}
        </div>
      )}

      <div style={user && !isMobile ? styles.mainContent : isMobile ? styles.mainContentMobile : styles.mainContentFull}>
        <div style={isMobile ? styles.topBarMobile : styles.topBar}>
          <div style={styles.topBarLeft}>
            {(isMobile || !user) && (
              <Link to={user ? '/dashboard' : '/'} style={styles.logoLink}>
                <h1 style={styles.logoTextMobile}>Casiflow</h1>
              </Link>
            )}
            <h2 style={isMobile ? styles.pageTitleMobile : styles.pageTitle}>Responsible Gambling</h2>
          </div>
        </div>

        <div style={isMobile ? styles.contentMobile : styles.content}>

          {/* Header */}
          <div style={styles.heroBanner}>
            <div style={styles.heroIconWrap}>
              <Shield size={28} color="#38bdf8" />
            </div>
            <div>
              <h1 style={styles.heroTitle}>Responsible Gambling</h1>
              <p style={styles.heroSubtitle}>Casiflow is committed to promoting safe and responsible gambling. If you feel your gambling is becoming a problem, help is available.</p>
            </div>
          </div>

          {/* The House Rules */}
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>The House Rules (and How the House Wins)</h2>
            <div style={styles.houseRulesBox}>
              <p style={styles.houseRulesText}>
                Let's keep it real for a second: gambling is a form of entertainment, but for the casinos, it's a business. Their main goal is to maximize profits, and those profits come directly from player losses. Even when you see flashy "free" bonuses or "no-deposit" offers landing in your inbox, remember that they aren't acts of charity. They are designed to keep you playing longer because, statistically, the more you play, the more the house wins.
              </p>
            </div>
            <p style={styles.subheadingSmall}>Keep these truths in your back pocket:</p>
            <div style={styles.truthsList}>
              <div style={styles.truthItem}>
                <span style={styles.truthLabel}>Bonuses aren't free money:</span>
                <span style={styles.truthText}> They are invitations to play, designed with the casino's bottom line in mind.</span>
              </div>
              <div style={styles.truthItem}>
                <span style={styles.truthLabel}>The Math Always Wins:</span>
                <span style={styles.truthText}> Every game is built to ensure the casino stays profitable over time.</span>
              </div>
              <div style={styles.truthItem}>
                <span style={styles.truthLabel}>Losses are the Product:</span>
                <span style={styles.truthText}> Your losses are their revenue — never gamble with money you actually need for rent, bills, or groceries.</span>
              </div>
            </div>
            <div style={styles.closingBox}>
              <p style={styles.closingText}>Enjoy the games, snag the bonuses, but always stay in the driver's seat. Set your limits, know when to walk away, and never forget that while you're playing for fun, they're playing for profit.</p>
            </div>
          </div>

          {/* Myths vs Reality */}
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>Gambling Myths vs Reality</h2>
            <div style={styles.mythsList}>
              <div style={styles.mythItem}>
                <div style={styles.mythHeader}>
                  <span style={styles.mythBadge}>Myth</span>
                  <span style={styles.mythStatement}>"I'm due a win"</span>
                </div>
                <p style={styles.mythReality}><strong>Reality:</strong> Each spin/hand is independent. Past results never influence future ones.</p>
              </div>
              <div style={styles.mythItem}>
                <div style={styles.mythHeader}>
                  <span style={styles.mythBadge}>Myth</span>
                  <span style={styles.mythStatement}>"I can win back my losses"</span>
                </div>
                <p style={styles.mythReality}><strong>Reality:</strong> Chasing losses is one of the biggest drivers of problem gambling. Walk away.</p>
              </div>
              <div style={styles.mythItem}>
                <div style={styles.mythHeader}>
                  <span style={styles.mythBadge}>Myth</span>
                  <span style={styles.mythStatement}>"I'm better at this than most people"</span>
                </div>
                <p style={styles.mythReality}><strong>Reality:</strong> The house edge applies to everyone equally, regardless of skill or experience.</p>
              </div>
            </div>
          </div>

          {/* How to Gamble Responsibly */}
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>How to Gamble Responsibly</h2>
            <div style={styles.tipsList}>
              {responsibleTips.map((tip, i) => (
                <div key={i} style={styles.tipItem}>
                  <CheckCircle size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '1px' }} />
                  <span style={styles.tipText}>{tip}</span>
                </div>
              ))}
              <div style={styles.tipItem}>
                <Target size={16} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '1px' }} />
                <span style={styles.tipText}>
                  Use Casiflow's <Link to={user ? '/profile' : '/'} style={styles.inlineLink}>Goals feature</Link> to set goals for each session — write them down, track your progress, and keep yourself accountable
                </span>
              </div>
            </div>
          </div>

          {/* Warning Signs */}
          <div style={{ ...styles.card, borderLeft: '4px solid #f59e0b' }}>
            <div style={styles.warningSectionHeader}>
              <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
              <h2 style={styles.sectionHeading}>Signs Your Gambling May Be a Problem</h2>
            </div>
            <div style={styles.warningList}>
              {warningSignItems.map((item, i) => (
                <div key={i} style={styles.warningItem}>
                  <AlertTriangle size={14} color="#f59e0b" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span style={styles.warningText}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Self-Assessment */}
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>Ask Yourself</h2>
            <div style={styles.assessmentList}>
              {selfAssessmentItems.map((q, i) => (
                <div key={i} style={styles.assessmentItem}>
                  <span style={styles.assessmentBullet}>{i + 1}</span>
                  <span style={styles.assessmentText}>{q}</span>
                </div>
              ))}
            </div>
            <div style={styles.assessmentCallout}>
              <p style={styles.assessmentCalloutText}>If you answered yes to any of these, consider reaching out for support.</p>
            </div>
          </div>

          {/* Your Limits — logged in only */}
          {user && (
            <div style={{ ...styles.card, borderLeft: '4px solid #0ea5e9' }}>
              <h2 style={styles.sectionHeading}>Your Current Limits</h2>
              {!hasLimits ? (
                <p style={styles.noLimitsText}>You have not set any spending limits yet.</p>
              ) : (
                <div style={styles.limitsGrid}>
                  <div style={styles.limitBox}>
                    <p style={styles.limitBoxLabel}>Monthly Deposit Limit</p>
                    <p style={styles.limitBoxValue}>{depositLimit > 0 ? `${symbol}${depositLimit.toLocaleString()}` : 'Not set'}</p>
                  </div>
                  <div style={styles.limitBox}>
                    <p style={styles.limitBoxLabel}>Monthly Net Loss Limit</p>
                    <p style={styles.limitBoxValue}>{netLossLimit > 0 ? `${symbol}${netLossLimit.toLocaleString()}` : 'Not set'}</p>
                  </div>
                </div>
              )}
              <Link to="/profile" style={styles.tealBtn}>Update My Limits</Link>
            </div>
          )}

          {/* Self-Exclusion */}
          <div style={{ ...styles.card, borderLeft: '4px solid #ef4444' }}>
            <h2 style={styles.sectionHeading}>Take a Break</h2>
            <p style={styles.text}>If you feel you need to stop gambling, self-exclusion is a powerful tool. Register with your national self-exclusion service:</p>
            {user && country ? (
              <div style={styles.exclusionBox}>
                <p style={styles.exclusionCountry}>Your jurisdiction: <strong>{country}</strong></p>
                <a href={rg.url} target="_blank" rel="noopener noreferrer" style={styles.exclusionBtn}>
                  <ExternalLink size={14} />
                  <span>Register with {rg.name}</span>
                </a>
              </div>
            ) : (
              <div style={styles.allRegistersBox}>
                <div style={isMobile ? styles.registersListMobile : styles.registersList}>
                  {nationalRegisters.map((r, i) => (
                    <div key={i} style={styles.registerItem}>
                      <span style={styles.registerCountry}>{r.country}</span>
                      <a href={r.url} target="_blank" rel="noopener noreferrer" style={styles.registerLink}>
                        {r.name} <ExternalLink size={11} style={{ display: 'inline', verticalAlign: 'middle' }} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Support */}
          <div style={styles.card}>
            <h2 style={styles.sectionHeading}>Get Support</h2>
            <p style={styles.text}>Talking to someone can help. Reach out to a support organisation in your country.</p>
            {user && country ? (
              <a href={rg.url} target="_blank" rel="noopener noreferrer" style={styles.tealBtnAnchor}>
                <ExternalLink size={14} />
                <span>Contact {rg.name}</span>
              </a>
            ) : (
              <a href={rgResources['default'].url} target="_blank" rel="noopener noreferrer" style={styles.tealBtnAnchor}>
                <ExternalLink size={14} />
                <span>Contact {rgResources['default'].name} (Global)</span>
              </a>
            )}
          </div>

          {/* Casiflow's Commitment */}
          <div style={{ ...styles.card, borderLeft: '4px solid #0ea5e9' }}>
            <div style={styles.commitmentHeader}>
              <Shield size={18} color="#0ea5e9" style={{ flexShrink: 0 }} />
              <h2 style={styles.sectionHeading}>Our Commitment to Responsible Gambling</h2>
            </div>
            <p style={styles.text}>Casiflow was built to put players in control of their gambling. We provide tools to help you stay informed, set limits and make better decisions:</p>
            <div style={styles.commitmentList}>
              <div style={styles.commitmentItem}>
                <CheckCircle size={15} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={styles.commitmentText}><strong>Spending limit tracking</strong> — set monthly deposit and net loss limits</span>
              </div>
              <div style={styles.commitmentItem}>
                <CheckCircle size={15} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={styles.commitmentText}><strong>Full transaction history</strong> across all your casinos</span>
              </div>
              <div style={styles.commitmentItem}>
                <CheckCircle size={15} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={styles.commitmentText}><strong>Goals feature</strong> — set and track personal gambling goals</span>
              </div>
              <div style={styles.commitmentItem}>
                <CheckCircle size={15} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={styles.commitmentText}><strong>Jurisdiction-based self-exclusion links</strong> always visible in the footer</span>
              </div>
              <div style={styles.commitmentItem}>
                <CheckCircle size={15} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={styles.commitmentText}><strong>No promotion of irresponsible gambling behaviour</strong></span>
              </div>
            </div>
            <div style={styles.commitmentClosing}>
              <p style={styles.commitmentClosingText}>We're on your side. The house always knows its numbers — now you can too.</p>
            </div>
          </div>

        </div>

        <Footer jurisdiction={profile?.country} />
      </div>

      {user && isMobile && (
        <div style={styles.bottomNav}>
          {navItems.map(item => (
            <Link key={item.id} to={item.path} style={styles.bottomNavItem}>
              <span style={styles.bottomNavIcon}>{item.icon}</span>
              <span style={styles.bottomNavLabel}>{item.label}</span>
            </Link>
          ))}
          {onLogout && (
            <button style={styles.bottomNavItem} onClick={onLogout}>
              <span style={styles.bottomNavIcon}><LogOut size={18} /></span>
              <span style={styles.bottomNavLabel}>Log Out</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f1f5f9' },
  sidebar: { width: '220px', minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 },
  sidebarLogo: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoLink: { textDecoration: 'none' },
  logoText: { color: '#38bdf8', fontSize: '22px', fontWeight: '800', margin: 0 },
  logoTextMobile: { color: '#0ea5e9', fontSize: '20px', fontWeight: '800', margin: 0 },
  sidebarNav: { flex: 1, padding: '16px 0' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderLeft: '3px solid transparent' },
  navIcon: { display: 'flex', alignItems: 'center' },
  sidebarLogout: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', color: 'rgba(255,255,255,0.5)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' },
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  mainContentMobile: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px', minWidth: 0 },
  mainContentFull: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarMobile: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  pageTitleMobile: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  content: { padding: '24px 28px', flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  contentMobile: { padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '22px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  // Hero banner
  heroBanner: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', borderRadius: '12px', padding: '24px', display: 'flex', alignItems: 'flex-start', gap: '16px', boxShadow: '0 4px 12px rgba(14,165,233,0.2)' },
  heroIconWrap: { backgroundColor: 'rgba(56,189,248,0.15)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid rgba(56,189,248,0.3)' },
  heroTitle: { color: 'white', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-0.5px' },
  heroSubtitle: { color: 'rgba(255,255,255,0.7)', fontSize: '14px', lineHeight: '1.6', margin: 0 },
  // Section headings
  sectionHeading: { color: '#0f172a', fontSize: '16px', fontWeight: '800', margin: '0 0 14px 0' },
  subheadingSmall: { color: '#374151', fontSize: '13px', fontWeight: '700', margin: '16px 0 10px 0' },
  text: { color: '#64748b', fontSize: '14px', lineHeight: '1.7', margin: '0 0 14px 0' },
  inlineLink: { color: '#0369a1', fontWeight: '600', textDecoration: 'underline' },
  // House Rules
  houseRulesBox: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px', border: '1px solid #e2e8f0', marginBottom: '4px' },
  houseRulesText: { color: '#374151', fontSize: '14px', lineHeight: '1.75', margin: 0 },
  truthsList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' },
  truthItem: { backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '10px 14px', border: '1px solid #bae6fd', fontSize: '14px', lineHeight: '1.6', color: '#374151' },
  truthLabel: { color: '#0369a1', fontWeight: '700' },
  truthText: { color: '#374151' },
  closingBox: { backgroundColor: '#0f172a', borderRadius: '10px', padding: '16px', marginTop: '6px' },
  closingText: { color: 'rgba(255,255,255,0.85)', fontSize: '14px', lineHeight: '1.7', margin: 0, fontStyle: 'italic' },
  // Myths
  mythsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  mythItem: { borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', backgroundColor: '#fafafa' },
  mythHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  mythBadge: { backgroundColor: '#fef2f2', color: '#dc2626', fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', flexShrink: 0 },
  mythStatement: { color: '#0f172a', fontSize: '14px', fontWeight: '700' },
  mythReality: { color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  // Tips
  tipsList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  tipItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  tipText: { color: '#374151', fontSize: '14px', lineHeight: '1.6' },
  // Warning signs
  warningSectionHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  warningList: { display: 'flex', flexDirection: 'column', gap: '8px' },
  warningItem: { display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '10px 12px', backgroundColor: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' },
  warningText: { color: '#374151', fontSize: '14px', lineHeight: '1.5' },
  // Self-assessment
  assessmentList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' },
  assessmentItem: { display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '10px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' },
  assessmentBullet: { backgroundColor: '#0ea5e9', color: 'white', fontSize: '11px', fontWeight: '800', width: '20px', height: '20px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  assessmentText: { color: '#374151', fontSize: '14px', lineHeight: '1.5' },
  assessmentCallout: { backgroundColor: '#f0f9ff', borderRadius: '8px', padding: '12px 14px', border: '1px solid #bae6fd' },
  assessmentCalloutText: { color: '#0369a1', fontSize: '13px', fontWeight: '600', margin: 0 },
  // Limits
  noLimitsText: { color: '#94a3b8', fontSize: '14px', margin: '0 0 14px 0' },
  limitsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  limitBox: { backgroundColor: '#f0f9ff', borderRadius: '10px', padding: '14px', border: '1px solid #bae6fd' },
  limitBoxLabel: { color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 6px 0' },
  limitBoxValue: { color: '#0369a1', fontSize: '20px', fontWeight: '800', margin: 0 },
  // Exclusion
  exclusionBox: { marginTop: '4px' },
  exclusionCountry: { color: '#374151', fontSize: '14px', margin: '0 0 12px 0' },
  exclusionBtn: { display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', backgroundColor: '#ef4444', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 2px 8px rgba(239,68,68,0.3)' },
  allRegistersBox: { marginTop: '4px' },
  registersList: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' },
  registersListMobile: { display: 'flex', flexDirection: 'column', gap: '8px' },
  registerItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', gap: '8px' },
  registerCountry: { color: '#374151', fontSize: '12px', fontWeight: '600', flexShrink: 0 },
  registerLink: { color: '#0369a1', fontSize: '12px', textDecoration: 'none', fontWeight: '500' },
  // Support / teal buttons
  tealBtn: { display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 2px 8px rgba(14,165,233,0.3)', marginTop: '4px' },
  tealBtnAnchor: { display: 'inline-flex', alignItems: 'center', gap: '7px', padding: '10px 18px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 2px 8px rgba(14,165,233,0.3)' },
  // Commitment
  commitmentHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' },
  commitmentList: { display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' },
  commitmentItem: { display: 'flex', alignItems: 'flex-start', gap: '10px' },
  commitmentText: { color: '#374151', fontSize: '14px', lineHeight: '1.6' },
  commitmentClosing: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 100%)', borderRadius: '10px', padding: '16px' },
  commitmentClosingText: { color: 'rgba(255,255,255,0.9)', fontSize: '14px', fontWeight: '600', margin: 0, fontStyle: 'italic' },
  // Bottom nav
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
};

export default ResponsibleGambling;

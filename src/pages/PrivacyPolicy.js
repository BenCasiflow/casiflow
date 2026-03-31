import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut } from 'lucide-react';
import Footer from '../components/Footer';

function PrivacyPolicy({ user, onLogout }) {
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
            <h2 style={isMobile ? styles.pageTitleMobile : styles.pageTitle}>Privacy Policy</h2>
          </div>
        </div>

        <div style={isMobile ? styles.contentMobile : styles.content}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Privacy Policy</h2>
            <p style={styles.lastUpdated}>Last updated: March 2026</p>
            <p style={styles.intro}>This Privacy Policy explains how Casiflow collects, uses and protects your personal data. We are committed to protecting your privacy and handling your data responsibly.</p>

            <h3 style={styles.subheading}>1. Data We Collect</h3>
            <p style={styles.text}>We collect the following information when you create an account and use Casiflow: your name and email address, your country and currency preferences, casino transaction data you manually enter or upload, spending limits and budget settings you configure, and feedback you submit through the app.</p>

            <h3 style={styles.subheading}>2. How We Use Your Data</h3>
            <p style={styles.text}>Your data is used solely to provide you with the Casiflow service. This includes displaying your spending dashboard, calculating your net results and limits, and providing personalised alerts. We do not sell your data to third parties, share it with casinos, or use it for advertising purposes.</p>

            <h3 style={styles.subheading}>3. Data Storage and Security</h3>
            <p style={styles.text}>Your data is stored securely. We use industry-standard security measures to protect your information from unauthorised access. All data is stored in encrypted form.</p>

            <h3 style={styles.subheading}>4. Your Rights Under GDPR</h3>
            <p style={styles.text}>If you are based in the European Union or United Kingdom, you have the following rights: the right to access your data, the right to correct inaccurate data, the right to delete your data, the right to export your data in a portable format, and the right to object to how we process your data. You can exercise these rights at any time from your Profile page under My Data.</p>

            <h3 style={styles.subheading}>5. Cookies</h3>
            <p style={styles.text}>Casiflow uses only essential cookies required for the app to function. We do not use tracking or advertising cookies.</p>

            <h3 style={styles.subheading}>6. Third Party Services</h3>
            <p style={styles.text}>Casiflow may contain links to third party websites such as responsible gambling organisations. We are not responsible for the privacy practices of those websites.</p>

            <h3 style={styles.subheading}>7. Changes to This Policy</h3>
            <p style={styles.text}>We may update this Privacy Policy from time to time. We will notify you of any significant changes via email or through the app.</p>

            <h3 style={styles.subheading}>8. Contact</h3>
            <p style={styles.text}>If you have any questions about this Privacy Policy or how we handle your data, please contact us through the feedback button in the app.</p>
          </div>
        </div>
        <Footer jurisdiction={user?.jurisdiction} />
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
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' },
  mainContentMobile: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px' },
  mainContentFull: { flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarMobile: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  pageTitleMobile: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  content: { padding: '24px 28px', flex: 1 },
  contentMobile: { padding: '16px', flex: 1 },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  heading: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0' },
  lastUpdated: { color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' },
  intro: { color: '#374151', fontSize: '14px', lineHeight: '1.7', margin: '0 0 20px 0' },
  subheading: { color: '#1e293b', fontSize: '15px', fontWeight: '700', margin: '20px 0 8px 0' },
  text: { color: '#64748b', fontSize: '14px', lineHeight: '1.7', margin: '0 0 8px 0' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
};

export default PrivacyPolicy;

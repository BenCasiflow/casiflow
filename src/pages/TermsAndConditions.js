import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut } from 'lucide-react';
import Footer from '../components/Footer';

function TermsAndConditions({ user, onLogout }) {
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
            <h2 style={isMobile ? styles.pageTitleMobile : styles.pageTitle}>Terms &amp; Conditions</h2>
          </div>
        </div>

        <div style={isMobile ? styles.contentMobile : styles.content}>
          <div style={styles.card}>
            <h2 style={styles.heading}>Terms &amp; Conditions</h2>
            <p style={styles.lastUpdated}>Last updated: March 2026</p>
            <p style={styles.intro}>Please read these Terms and Conditions carefully before using Casiflow. By creating an account and using our service, you agree to be bound by these terms.</p>

            <h3 style={styles.subheading}>1. About Casiflow</h3>
            <p style={styles.text}>Casiflow is a personal finance tracking tool that allows users to monitor their casino spending across multiple platforms. Casiflow is not a gambling operator, does not facilitate gambling, and is not affiliated with any casino or gambling company.</p>

            <h3 style={styles.subheading}>2. Eligibility</h3>
            <p style={styles.text}>You must be at least 18 years of age to use Casiflow. By creating an account you confirm that you are 18 or older and that using a gambling tracking tool is legal in your jurisdiction.</p>

            <h3 style={styles.subheading}>3. Your Account</h3>
            <p style={styles.text}>You are responsible for maintaining the security of your account credentials. You must not share your account with others or allow unauthorised access. You are responsible for all activity that occurs under your account.</p>

            <h3 style={styles.subheading}>4. Data You Enter</h3>
            <p style={styles.text}>All transaction data entered into Casiflow is provided by you manually or via file upload. Casiflow does not connect to casino accounts directly and does not verify the accuracy of data you enter. You are responsible for the accuracy of the data you input.</p>

            <h3 style={styles.subheading}>5. Not Financial or Legal Advice</h3>
            <p style={styles.text}>Casiflow provides spending tracking and summary information only. Nothing in the Casiflow service constitutes financial advice, legal advice, or gambling advice. Spending alerts and limit notifications are informational tools only and do not replace professional advice.</p>

            <h3 style={styles.subheading}>6. Affiliate Recommendations</h3>
            <p style={styles.text}>Casiflow may display recommended casinos in the app. These recommendations may be affiliate links through which Casiflow earns a commission if you register or deposit at a recommended casino. Recommended casinos are selected based on licensing, reputation and player protection standards. Casiflow only recommends regulated operators.</p>

            <h3 style={styles.subheading}>7. Responsible Gambling</h3>
            <p style={styles.text}>Casiflow is designed to support responsible gambling by helping players track their spending. If you feel your gambling is becoming a problem, we encourage you to use the responsible gambling resources available in the app and to self-exclude via your national self-exclusion register.</p>

            <h3 style={styles.subheading}>8. Limitation of Liability</h3>
            <p style={styles.text}>Casiflow is provided on an as-is basis. We do not guarantee that the service will be error-free or uninterrupted. To the maximum extent permitted by law, Casiflow is not liable for any losses or damages arising from your use of the service.</p>

            <h3 style={styles.subheading}>9. Changes to These Terms</h3>
            <p style={styles.text}>We may update these Terms and Conditions from time to time. Continued use of Casiflow after changes are posted constitutes your acceptance of the updated terms.</p>

            <h3 style={styles.subheading}>10. Governing Law</h3>
            <p style={styles.text}>These Terms and Conditions are governed by the laws of Malta. Any disputes shall be subject to the exclusive jurisdiction of the courts of Malta.</p>

            <h3 style={styles.subheading}>11. Contact</h3>
            <p style={styles.text}>If you have any questions about these Terms and Conditions, please contact us through the feedback button in the app.</p>
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
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  mainContentMobile: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px', minWidth: 0 },
  mainContentFull: { flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
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

export default TermsAndConditions;

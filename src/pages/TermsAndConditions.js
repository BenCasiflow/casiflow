import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut } from 'lucide-react';
import Footer from '../components/Footer';

function TermsAndConditions({ user, profile, onLogout }) {
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

      {/* Sidebar — desktop only, authenticated users */}
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

      {/* Main content */}
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
          <div style={styles.docWrapper}>
            <div style={isMobile ? styles.cardMobile : styles.card}>

              <p style={styles.docSubtitle}>Last updated: April 2026</p>
              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>1. About Casiflow</h2>
                <p style={styles.body}>Casiflow is a personal finance tracking tool that allows users to monitor their casino spending across multiple platforms. Casiflow is not a gambling operator, does not facilitate gambling, and is not affiliated with any casino or gambling company. Casiflow is operated under the trading name Casiflow and can be contacted at support@casiflow.com.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>2. Eligibility</h2>
                <p style={styles.body}>You must be at least 18 years of age to use Casiflow. By creating an account you confirm that:</p>
                <ul style={styles.list}>
                  <li style={styles.listItem}>You are 18 years of age or older</li>
                  <li style={styles.listItem}>Using a gambling tracking tool is legal in your jurisdiction</li>
                  <li style={styles.listItem}>You are not located in a jurisdiction where access to gambling-related services is prohibited</li>
                  <li style={styles.listItem}>All information you provide during registration is accurate and truthful</li>
                </ul>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>3. Your Account</h2>
                <p style={styles.body}>You are responsible for maintaining the security of your account credentials. You must not share your account with others or allow unauthorised access. You are responsible for all activity that occurs under your account. If you suspect unauthorised access to your account, you must notify us immediately at support@casiflow.com. We reserve the right to suspend or terminate your account if we believe these terms have been violated.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>4. Acceptable Use</h2>
                <p style={styles.body}>You agree to use Casiflow only for its intended purpose of tracking your personal gambling activity. You must not:</p>
                <ul style={styles.list}>
                  <li style={styles.listItem}>Use the Service for any unlawful purpose</li>
                  <li style={styles.listItem}>Attempt to gain unauthorised access to any part of the Service</li>
                  <li style={styles.listItem}>Interfere with or disrupt the Service or its infrastructure</li>
                  <li style={styles.listItem}>Upload malicious code or files</li>
                  <li style={styles.listItem}>Impersonate any person or entity</li>
                  <li style={styles.listItem}>Use the Service in any way that could damage, disable or impair it</li>
                </ul>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>5. Data You Enter</h2>
                <p style={styles.body}>All transaction data entered into Casiflow is provided by you manually or via file upload. Casiflow does not connect to casino accounts directly and does not verify the accuracy of data you enter. You are responsible for the accuracy of the data you input. Casiflow accepts no liability for decisions made based on inaccurate data you have entered.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>6. Not Financial or Legal Advice</h2>
                <p style={styles.body}>Casiflow provides spending tracking and summary information only. Nothing in the Casiflow service constitutes financial advice, legal advice, or gambling advice. Spending alerts and limit notifications are informational tools only and do not replace professional advice. You should seek independent professional advice before making any financial decisions.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>7. Affiliate Recommendations</h2>
                <p style={styles.body}>Casiflow may display recommended casinos in the app and on the website. These recommendations may be affiliate links through which Casiflow earns a commission if you register or deposit at a recommended casino. This commission is earned at no additional cost to you. Recommended casinos are selected based on licensing, reputation and player protection standards. Casiflow only recommends regulated operators. However, Casiflow does not accept responsibility for the conduct, practices or policies of any third party casino operator. You use any recommended casino at your own risk and should review their own terms and conditions before registering.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>8. Responsible Gambling</h2>
                <p style={styles.body}>Casiflow is designed to support responsible gambling by helping players track their spending across multiple platforms. We strongly encourage all users to:</p>
                <ul style={styles.list}>
                  <li style={styles.listItem}>Set deposit and loss limits within the Service</li>
                  <li style={styles.listItem}>Take regular breaks from gambling</li>
                  <li style={styles.listItem}>Never gamble with money they cannot afford to lose</li>
                  <li style={styles.listItem}>Use national self-exclusion registers if gambling becomes a problem</li>
                </ul>
                <p style={styles.body}>If you feel your gambling is becoming a problem, we encourage you to use the responsible gambling resources available in the app and to self-exclude via your national self-exclusion register.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>9. Intellectual Property</h2>
                <p style={styles.body}>All content, design, graphics, logos and software within the Service are the intellectual property of Casiflow and are protected by applicable copyright and trademark laws. You may not reproduce, distribute or create derivative works from any part of the Service without our express written permission.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>10. Privacy</h2>
                <p style={styles.body}>Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service you agree to the collection and use of your data as described in our Privacy Policy.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>11. Service Availability</h2>
                <p style={styles.body}>Casiflow is provided on an as-is and as-available basis. We do not guarantee that the Service will be error-free, uninterrupted or available at all times. We reserve the right to modify, suspend or discontinue the Service at any time with or without notice. We will not be liable to you or any third party for any modification, suspension or discontinuation of the Service.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>12. Limitation of Liability</h2>
                <p style={styles.body}>To the maximum extent permitted by applicable law, Casiflow and its operators shall not be liable for any indirect, incidental, special, consequential or punitive damages, including but not limited to loss of data, loss of profits or any other losses arising from your use of or inability to use the Service. Our total liability to you for any claim arising from your use of the Service shall not exceed the amount you have paid us in the twelve months prior to the claim. As Casiflow is a free service, this amount is zero. Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud or any other liability that cannot be excluded by law.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>13. Indemnification</h2>
                <p style={styles.body}>You agree to indemnify and hold harmless Casiflow and its operators from any claims, damages, losses or expenses including legal fees arising from your use of the Service, your violation of these terms or your violation of any rights of a third party.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>14. Changes to These Terms</h2>
                <p style={styles.body}>These Terms and Conditions may be amended, updated, or replaced at any time at the sole discretion of Casiflow. It is your responsibility as a user to review these Terms and Conditions periodically to ensure that you remain informed of the current terms governing your use of the Casiflow platform. Your continued use of the Service following any such amendments shall constitute your acknowledgement of and agreement to the updated Terms and Conditions.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>15. Termination</h2>
                <p style={styles.body}>We reserve the right to terminate or suspend your account at any time without notice if we believe you have violated these terms or for any other reason at our sole discretion. Upon termination your right to use the Service will immediately cease. You may also delete your account at any time from your Profile page.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>16. Governing Law</h2>
                <p style={styles.body}>These Terms and Conditions are governed by the laws of Malta. Any disputes arising from these terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Malta.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>17. Severability</h2>
                <p style={styles.body}>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>18. Entire Agreement</h2>
                <p style={styles.body}>These Terms and Conditions together with our Privacy Policy constitute the entire agreement between you and Casiflow regarding your use of the Service and supersede all prior agreements and understandings.</p>
              </div>

              <div style={styles.divider} />

              <div style={styles.section}>
                <h2 style={styles.sectionHeading}>19. Contact</h2>
                <p style={styles.body}>If you have any questions about these Terms and Conditions please contact us at: <strong>support@casiflow.com</strong></p>
              </div>

            </div>
          </div>
        </div>

        <Footer jurisdiction={profile?.country} />
      </div>

      {/* Mobile bottom nav */}
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
  // Shell — identical to ResponsibleGambling
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
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
  // Document content
  docWrapper: { maxWidth: '760px', margin: '0 auto', width: '100%' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '36px 40px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardMobile: { backgroundColor: 'white', borderRadius: '12px', padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  docSubtitle: { color: '#64748b', fontSize: '13px', margin: '0 0 0 0' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' },
  section: {},
  sectionHeading: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 10px 0' },
  body: { color: '#374151', fontSize: '14px', lineHeight: '1.7', margin: '0 0 10px 0' },
  list: { color: '#374151', fontSize: '14px', lineHeight: '1.7', margin: '8px 0 10px 0', paddingLeft: '22px' },
  listItem: { marginBottom: '8px' },
};

export default TermsAndConditions;

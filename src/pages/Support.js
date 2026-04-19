import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut } from 'lucide-react';
import Footer from '../components/Footer';

function Support({ user, profile, onLogout }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'success' | 'error'
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const name = profile?.full_name || '';
  const email = user?.email || '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject || !message.trim()) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, subject, message: message.trim() }),
      });
      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos',   label: 'Casinos',   icon: <Building2 size={18} />,       path: '/add-casino' },
    { id: 'profile',   label: 'Profile',   icon: <User size={18} />,            path: '/profile' },
  ];

  return (
    <div style={styles.appContainer}>
      {!isMobile && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <Link to="/dashboard" style={styles.logoLink}>
              <h1 style={styles.logoText}>Casiflow</h1>
            </Link>
          </div>
          <nav style={styles.sidebarNav}>
            {navItems.map(item => (
              <Link
                key={item.id}
                to={item.path}
                style={{ ...styles.navItem, ...(item.id === 'profile' ? styles.navItemActive : {}) }}
              >
                <span style={styles.navIcon}>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
          <button onClick={onLogout} style={styles.sidebarLogout}>
            <LogOut size={16} />
            <span>Log Out</span>
          </button>
        </div>
      )}

      <div style={isMobile ? styles.mainContentMobile : styles.mainContent}>
        <div style={isMobile ? styles.topBarMobile : styles.topBar}>
          <div style={styles.topBarLeft}>
            {isMobile && <Link to="/dashboard" style={styles.logoLink}><h1 style={styles.logoTextMobile}>Casiflow</h1></Link>}
            {!isMobile && <h2 style={styles.pageTitle}>Support</h2>}
            {isMobile && <h2 style={styles.pageTitleMobile}>Support</h2>}
          </div>
          <span style={styles.greeting}>Hi, {profile?.full_name || user.email}</span>
        </div>

        <div style={isMobile ? styles.contentMobile : styles.content}>
          {/* Tab bar — Support is the active tab */}
          <div style={isMobile ? styles.tabBarMobile : styles.tabBar}>
            {['profile', 'budget', 'goals', 'history', 'security', 'data'].map(tab => (
              <Link
                key={tab}
                to="/profile"
                style={{ ...(isMobile ? styles.tabMobile : styles.tab), textDecoration: 'none' }}
              >
                {isMobile
                  ? { profile: 'Profile', budget: 'Budget', goals: 'Goals', history: 'History', security: 'Security', data: 'Data' }[tab]
                  : { profile: 'Profile', budget: 'Budget & Limits', goals: 'Goals', history: 'History', security: 'Security', data: 'My Data' }[tab]
                }
              </Link>
            ))}
            <span style={{ ...(isMobile ? styles.tabMobile : styles.tab), ...styles.tabActive }}>
              {isMobile ? 'Support' : 'Support'}
            </span>
          </div>

          <div style={styles.card}>
            <h3 style={styles.cardTitle}>Contact Support</h3>
            <p style={styles.cardSubtitle}>Have a question or issue? Send us a message and we'll get back to you within 48 hours.</p>

            {status === 'success' ? (
              <div style={styles.successBox}>
                Your message has been sent. We'll get back to you within 48 hours.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div style={isMobile ? styles.fieldFull : styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Name</label>
                    <input style={styles.disabledInput} type="text" value={name} disabled />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input style={styles.disabledInput} type="email" value={email} disabled />
                  </div>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Subject</label>
                  <select
                    style={styles.input}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  >
                    <option value="">Select a subject</option>
                    <option value="General Enquiry">General Enquiry</option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Feedback">Feedback</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>Message</label>
                  <textarea
                    style={styles.textarea}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your issue or question..."
                    required
                    rows={6}
                  />
                </div>
                {status === 'error' && (
                  <div style={styles.errorBox}>
                    Something went wrong — please try again or email us at{' '}
                    <a href="mailto:support@casiflow.com" style={{ color: '#0369a1' }}>support@casiflow.com</a>
                  </div>
                )}
                <button
                  type="submit"
                  style={{ ...styles.saveBtn, ...(status === 'sending' ? styles.saveBtnDisabled : {}) }}
                  disabled={status === 'sending'}
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
        <Footer jurisdiction={profile?.country} />
      </div>

      {isMobile && (
        <div style={styles.bottomNav}>
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              style={{ ...styles.bottomNavItem, ...(item.id === 'profile' ? styles.bottomNavItemActive : {}) }}
            >
              <span style={styles.bottomNavIcon}>{item.icon}</span>
              <span style={styles.bottomNavLabel}>{item.label}</span>
            </Link>
          ))}
          <button style={styles.bottomNavItem} onClick={onLogout}>
            <span style={styles.bottomNavIcon}><LogOut size={18} /></span>
            <span style={styles.bottomNavLabel}>Log Out</span>
          </button>
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
  logoTextMobile: { color: '#38bdf8', fontSize: '20px', fontWeight: '800', margin: 0 },
  sidebarNav: { flex: 1, padding: '16px 0' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderLeft: '3px solid transparent' },
  navItemActive: { color: 'white', backgroundColor: 'rgba(56,189,248,0.15)', borderLeft: '3px solid #38bdf8' },
  navIcon: { display: 'flex', alignItems: 'center' },
  sidebarLogout: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', color: 'rgba(255,255,255,0.5)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' },
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  mainContentMobile: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px', minWidth: 0 },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarMobile: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  pageTitleMobile: { margin: 0, fontSize: '16px', fontWeight: '700', color: '#1e293b' },
  greeting: { color: '#64748b', fontSize: '14px' },
  content: { padding: '24px 28px', flex: 1 },
  contentMobile: { padding: '16px', flex: 1 },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' },
  tabBarMobile: { display: 'flex', gap: '2px', marginBottom: '16px', backgroundColor: 'white', padding: '4px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' },
  tab: { padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'inline-block' },
  tabMobile: { flex: 1, padding: '7px 2px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '11px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap', textAlign: 'center', display: 'inline-block' },
  tabActive: { backgroundColor: '#0ea5e9', color: 'white', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' },
  cardSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' },
  row: { display: 'flex', gap: '16px' },
  fieldFull: { display: 'flex', flexDirection: 'column' },
  field: { flex: 1, marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' },
  input: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  disabledInput: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f1f5f9', color: '#94a3b8' },
  textarea: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b', fontFamily: "'Segoe UI', Arial, sans-serif", resize: 'vertical', lineHeight: '1.6' },
  saveBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  saveBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },
  successBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '16px', borderRadius: '10px', fontSize: '14px', lineHeight: '1.6' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavItemActive: { color: '#0ea5e9' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
};

export default Support;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Footer from '../components/Footer';

function Profile({ user, profile, onLogout, onUpdateProfile }) {
  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [monthlyDepositLimit, setMonthlyDepositLimit] = useState('');
  const [monthlyNetLossLimit, setMonthlyNetLossLimit] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [limitsSaved, setLimitsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Load profile data into form fields when profile is available
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || '');
      setCountry(profile.country || '');
      setCurrency(profile.currency || '');
      setMonthlyIncome(profile.monthly_net_income || '');
      setMonthlyDepositLimit(profile.monthly_deposit_limit || '');
      setMonthlyNetLossLimit(profile.monthly_net_loss_limit || '');
    }
  }, [profile]);

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina',
    'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
    'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
    'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
    'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
    'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
    'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
    'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
    'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama',
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
    'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste',
    'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Other'
  ];

  const currencies = ['EUR', 'GBP', 'SEK', 'DKK', 'NOK', 'USD', 'AUD', 'CAD', 'CHF', 'JPY', 'Other'];
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : '€';

  const getSpendingProfile = () => {
    if (!monthlyIncome || !monthlyNetLossLimit) return null;
    const percent = (monthlyNetLossLimit / monthlyIncome) * 100;
    if (percent <= 5) return {
      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
      text: "Your spending level is typical of casual players who enjoy online casinos as a form of entertainment. There is no particular cause for concern at this level."
    };
    if (percent <= 15) return {
      color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd',
      text: "This spending level is common among regular players. It is worth reviewing your spending periodically to make sure it stays within your comfort zone."
    };
    if (percent <= 30) return {
      color: '#d97706', bg: '#fffbeb', border: '#fde68a',
      text: "At this level you are spending a meaningful portion of your income on gambling. Casinos may offer VIP treatment. Be mindful of your spending patterns."
    };
    if (percent <= 50) return {
      color: '#ea580c', bg: '#fff7ed', border: '#fed7aa',
      text: "This spending level places you in a VIP or high-roller category. Consider whether your gambling budget is still comfortable for you financially."
    };
    return {
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
      text: "Your spending level exceeds half of your monthly income. We recommend reviewing your limits and considering whether adjusting your budget would give you a healthier balance."
    };
  };

  const spendingProfile = getSpendingProfile();
  const percent = monthlyIncome && monthlyNetLossLimit ? ((monthlyNetLossLimit / monthlyIncome) * 100).toFixed(1) : null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ full_name: name, country, currency })
      .eq('id', user.id)
      .select()
      .single();
    if (updateError) {
      setError('Could not save changes. Please try again.');
      return;
    }
    onUpdateProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLimitsSave = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({
        monthly_deposit_limit: monthlyDepositLimit ? Number(monthlyDepositLimit) : null,
        monthly_net_loss_limit: monthlyNetLossLimit ? Number(monthlyNetLossLimit) : null,
        monthly_net_income: monthlyIncome ? Number(monthlyIncome) : null,
      })
      .eq('id', user.id)
      .select()
      .single();
    if (updateError) {
      setError('Could not save limits. Please try again.');
      return;
    }
    onUpdateProfile(data);
    setLimitsSaved(true);
    setTimeout(() => setLimitsSaved(false), 2000);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!newPassword) {
      setPasswordError('Please enter a new password.');
      return;
    }
    const { error: passwordUpdateError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordUpdateError) {
      setPasswordError('Could not update password. Please try again.');
      return;
    }
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleExportCSV = () => {
    // Placeholder for CSV export functionality
    alert('CSV export coming soon.');
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('Are you sure you want to delete your account? This cannot be undone.');
    if (!confirmed) return;
    await supabase.auth.signOut();
    onLogout();
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
  ];

  const tabs = ['profile', 'budget', 'security', 'data'];
  const tabLabels = { profile: 'Profile', budget: 'Budget & Limits', security: 'Security', data: 'My Data' };
  // Mobile labels: shortened where needed to fit, but "My Data" must stay in full (not truncated to "My")
  const tabLabelsMobile = { profile: 'Profile', budget: 'Budget', security: 'Security', data: 'My Data' };

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
            {isMobile && (
              <Link to="/dashboard" style={styles.logoLink}>
                <h1 style={styles.logoTextMobile}>Casiflow</h1>
              </Link>
            )}
            {!isMobile && <h2 style={styles.pageTitle}>Profile</h2>}
            {isMobile && <h2 style={styles.pageTitleMobile}>Profile</h2>}
          </div>
          <span style={styles.greeting}>Hi, {profile?.full_name || user.email}</span>
        </div>

        <div style={isMobile ? styles.contentMobile : styles.content}>
          <div style={isMobile ? styles.tabBarMobile : styles.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab}
                style={{ ...(isMobile ? styles.tabMobile : styles.tab), ...(activeTab === tab ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {isMobile ? tabLabelsMobile[tab] : tabLabels[tab]}
              </button>
            ))}
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {activeTab === 'profile' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Personal Information</h3>
              <p style={styles.cardSubtitle}>Update your account details</p>
              <form onSubmit={handleSave}>
                <div style={isMobile ? styles.fieldFull : styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input style={styles.disabledInput} type="email" value={user.email} disabled />
                  </div>
                </div>
                <div style={isMobile ? styles.fieldFull : styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Country</label>
                    <select style={styles.input} value={country} onChange={(e) => setCountry(e.target.value)}>
                      <option value="">Select country</option>
                      {countries.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Currency</label>
                    <select style={styles.input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                      <option value="">Select currency</option>
                      {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button type="submit" style={styles.saveBtn}>{saved ? '✓ Saved!' : 'Save Changes'}</button>
              </form>
            </div>
          )}

          {activeTab === 'budget' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Budget & Spending Limits</h3>
              <p style={styles.cardSubtitle}>Set your personal limits to stay in control. These will reflect on your dashboard.</p>
              <form onSubmit={handleLimitsSave}>
                <div style={isMobile ? styles.fieldFull : styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Monthly Deposit Limit ({symbol})</label>
                    <input style={styles.input} type="number" value={monthlyDepositLimit} onChange={(e) => setMonthlyDepositLimit(e.target.value)} placeholder="e.g. 1000" />
                    <p style={styles.fieldHint}>Maximum you want to deposit across all casinos per month</p>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Monthly Net Loss Limit ({symbol})</label>
                    <input style={styles.input} type="number" value={monthlyNetLossLimit} onChange={(e) => setMonthlyNetLossLimit(e.target.value)} placeholder="e.g. 500" />
                    <p style={styles.fieldHint}>Maximum net loss (deposits minus withdrawals) for the current calendar month</p>
                  </div>
                </div>
                <button type="submit" style={styles.saveBtn}>{limitsSaved ? '✓ Limits Saved!' : 'Save Limits'}</button>
              </form>

              <div style={styles.divider} />

              <h3 style={styles.cardTitle}>Income & Net Loss Limit</h3>
              <p style={styles.cardSubtitle}>Understand your net loss limit as a percentage of your monthly income</p>
              <form onSubmit={handleLimitsSave}>
                <div style={styles.field}>
                  <label style={styles.label}>Monthly Net Income ({symbol})</label>
                  <input style={styles.input} type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g. 3000" />
                </div>
                {spendingProfile && (
                  <div style={{ ...styles.profileBox, backgroundColor: spendingProfile.bg, border: `1px solid ${spendingProfile.border}` }}>
                    <span style={{ ...styles.profilePercent, color: spendingProfile.color }}>{percent}% of monthly income</span>
                    <p style={{ ...styles.profileText, color: spendingProfile.color }}>{spendingProfile.text}</p>
                  </div>
                )}
                <button type="submit" style={styles.saveBtn}>{limitsSaved ? '✓ Saved!' : 'Save Settings'}</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Change Password</h3>
              <p style={styles.cardSubtitle}>Keep your account secure</p>
              {passwordError && <div style={styles.errorBox}>{passwordError}</div>}
              <form onSubmit={handlePasswordSave}>
                <div style={styles.field}>
                  <label style={styles.label}>Current Password</label>
                  <input style={styles.input} type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Your current password" />
                </div>
                <div style={styles.field}>
                  <label style={styles.label}>New Password</label>
                  <input style={styles.input} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Choose a new password" />
                </div>
                <button type="submit" style={styles.saveBtn}>{passwordSaved ? '✓ Password Updated!' : 'Update Password'}</button>
              </form>
            </div>
          )}

          {activeTab === 'data' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>My Data</h3>
              <p style={styles.cardSubtitle}>Export or delete your account data</p>
              <div style={isMobile ? styles.dataRowMobile : styles.dataRow}>
                <div>
                  <p style={styles.dataTitle}>Export My Data</p>
                  <p style={styles.dataDesc}>Download all your transaction data as a CSV file. This is your right under GDPR.</p>
                </div>
                <button style={isMobile ? styles.exportBtnMobile : styles.exportBtn} onClick={handleExportCSV}>📥 Export CSV</button>
              </div>
              <div style={styles.divider} />
              <div style={isMobile ? styles.dataRowMobile : styles.dataRow}>
                <div>
                  <p style={styles.dataTitle}>Delete Account</p>
                  <p style={styles.dataDesc}>Permanently delete your account and all associated data. This cannot be undone.</p>
                </div>
                <button style={isMobile ? styles.deleteBtnMobile : styles.deleteBtn} onClick={handleDeleteAccount}>🗑 Delete Account</button>
              </div>
            </div>
          )}
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
  tabBarMobile: { display: 'flex', gap: '4px', marginBottom: '16px', backgroundColor: 'white', padding: '5px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: '100%' },
  tab: { padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  tabMobile: { flex: 1, padding: '8px 4px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '12px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
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
  fieldHint: { color: '#94a3b8', fontSize: '12px', margin: '6px 0 0 0' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' },
  profileBox: { borderRadius: '10px', padding: '14px', marginBottom: '16px' },
  profilePercent: { fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '6px' },
  profileText: { fontSize: '13px', lineHeight: '1.6', margin: 0 },
  saveBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  dataRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', gap: '16px' },
  dataRowMobile: { display: 'flex', flexDirection: 'column', padding: '12px 0', gap: '10px' },
  dataTitle: { color: '#1e293b', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' },
  dataDesc: { color: '#64748b', fontSize: '13px', margin: 0 },
  exportBtn: { padding: '10px 16px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  exportBtnMobile: { width: '100%', padding: '12px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  deleteBtn: { padding: '10px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  deleteBtnMobile: { width: '100%', padding: '12px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavItemActive: { color: '#0ea5e9' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
};

export default Profile;
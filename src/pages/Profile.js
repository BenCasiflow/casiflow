import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, Scale, LogOut } from 'lucide-react';
import Footer from '../components/Footer';

function Profile({ user, onLogout, userSettings, onUpdateSettings }) {
  const [name, setName] = useState(user.name || '');
  const [jurisdiction, setJurisdiction] = useState(user.jurisdiction || '');
  const [currency, setCurrency] = useState(user.currency || '');
  const [monthlyIncome, setMonthlyIncome] = useState(user.monthlyIncome || '');
  const [monthlyDepositLimit, setMonthlyDepositLimit] = useState(userSettings?.monthlyDepositLimit || 1000);
  const [monthlyNetLossLimit, setMonthlyNetLossLimit] = useState(userSettings?.monthlyNetLossLimit || 500);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [limitsSaved, setLimitsSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  const jurisdictions = [
    'Netherlands', 'United Kingdom', 'Sweden', 'Germany', 'Denmark',
    'Finland', 'Norway', 'Belgium', 'Spain', 'Italy', 'Other'
  ];
  const currencies = ['EUR', 'GBP', 'SEK', 'DKK', 'NOK', 'USD'];
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'SEK' ? 'kr' : currency === 'DKK' ? 'kr' : '€';

  const getSpendingProfile = () => {
    if (!monthlyIncome || !monthlyNetLossLimit) return null;
    const percent = (monthlyNetLossLimit / monthlyIncome) * 100;
    if (percent <= 5) return {
      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
      text: "Your spending level is typical of casual players who enjoy online casinos as a form of entertainment, similar to going to the cinema or a night out. Casinos generally see players at this level as recreational users. There is no particular cause for concern at this level, though it is always good practice to keep track of your spending."
    };
    if (percent <= 15) return {
      color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd',
      text: "This spending level is common among regular players who are actively engaged with online casinos. Casinos typically view players in this range as core users and may start offering loyalty rewards or personalised promotions. It is worth reviewing your spending periodically to make sure it stays within your comfort zone."
    };
    if (percent <= 30) return {
      color: '#d97706', bg: '#fffbeb', border: '#fde68a',
      text: "At this level you are spending a meaningful portion of your income on gambling. Casinos often classify players in this range as high-value players and may offer VIP treatment, exclusive bonuses and personal account managers. While this level of engagement can be enjoyable, it is worth being mindful of your spending patterns and ensuring gambling remains a positive part of your lifestyle."
    };
    if (percent <= 50) return {
      color: '#ea580c', bg: '#fff7ed', border: '#fed7aa',
      text: "This spending level places you in a category that casinos typically classify as VIP or high-roller status. You may receive premium treatment, dedicated support and significant bonus offers. At this level of spend relative to income it is worth taking a moment to consider whether your gambling budget is still comfortable for you financially, and whether setting a stricter monthly limit might give you more peace of mind."
    };
    return {
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
      text: "Your current spending level is in a range that casinos associate with their most valuable players, often referred to as ultra VIPs or whales. While this may come with premium perks and attention from casinos, spending more than half of your monthly income on gambling is something worth reflecting on. We recommend reviewing your limits and considering whether adjusting your budget would give you a healthier balance."
    };
  };

  const profile = getSpendingProfile();
  const percent = monthlyIncome && monthlyNetLossLimit ? ((monthlyNetLossLimit / monthlyIncome) * 100).toFixed(1) : null;

  const handleSave = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLimitsSave = (e) => {
    e.preventDefault();
    onUpdateSettings({ monthlyDepositLimit, monthlyNetLossLimit });
    setLimitsSaved(true);
    setTimeout(() => setLimitsSaved(false), 2000);
  };

  const handlePasswordSave = (e) => {
    e.preventDefault();
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
    { id: 'disputes', label: 'Disputes', icon: <Scale size={18} />, path: '/dashboard' },
  ];

  const tabs = ['profile', 'budget', 'security', 'data'];
  const tabLabels = { profile: 'Profile', budget: 'Budget & Limits', security: 'Security', data: 'My Data' };

  return (
    <div style={styles.appContainer}>
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

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>Profile</h2>
          <span style={styles.greeting}>Hi, {user.name}</span>
        </div>

        <div style={styles.content}>
          <div style={styles.tabBar}>
            {tabs.map(tab => (
              <button
                key={tab}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
                onClick={() => setActiveTab(tab)}
              >
                {tabLabels[tab]}
              </button>
            ))}
          </div>

          {activeTab === 'profile' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Personal Information</h3>
              <p style={styles.cardSubtitle}>Update your account details</p>
              <form onSubmit={handleSave}>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Email</label>
                    <input style={styles.disabledInput} type="email" value={user.email} disabled />
                  </div>
                </div>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Country</label>
                    <select style={styles.input} value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)}>
                      <option value="">Select country</option>
                      {jurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
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
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Monthly Deposit Limit ({symbol})</label>
                    <input style={styles.input} type="number" value={monthlyDepositLimit} onChange={(e) => setMonthlyDepositLimit(Number(e.target.value))} placeholder="e.g. 1000" />
                    <p style={styles.fieldHint}>Maximum you want to deposit across all casinos per month</p>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Monthly Net Loss Limit ({symbol})</label>
                    <input style={styles.input} type="number" value={monthlyNetLossLimit} onChange={(e) => setMonthlyNetLossLimit(Number(e.target.value))} placeholder="e.g. 500" />
                    <p style={styles.fieldHint}>Maximum net loss (deposits - withdrawals - balance) per month</p>
                  </div>
                </div>
                <button type="submit" style={styles.saveBtn}>{limitsSaved ? '✓ Limits Saved!' : 'Save Limits'}</button>
              </form>

              <div style={styles.divider} />

              <h3 style={styles.cardTitle}>Income & Net Loss Limit</h3>
              <p style={styles.cardSubtitle}>Understand your net loss limit as a percentage of your monthly income</p>
              <form onSubmit={handleSave}>
                <div style={styles.field}>
                  <label style={styles.label}>Monthly Net Income ({symbol})</label>
                  <input style={styles.input} type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g. 3000" />
                </div>
                {profile && (
                  <div style={{ ...styles.profileBox, backgroundColor: profile.bg, border: `1px solid ${profile.border}` }}>
                    <span style={{ ...styles.profilePercent, color: profile.color }}>{percent}% of monthly income</span>
                    <p style={{ ...styles.profileText, color: profile.color }}>{profile.text}</p>
                  </div>
                )}
                <button type="submit" style={styles.saveBtn}>{saved ? '✓ Saved!' : 'Save Settings'}</button>
              </form>
            </div>
          )}

          {activeTab === 'security' && (
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Change Password</h3>
              <p style={styles.cardSubtitle}>Keep your account secure</p>
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
              <div style={styles.dataRow}>
                <div>
                  <p style={styles.dataTitle}>Export My Data</p>
                  <p style={styles.dataDesc}>Download all your transaction data as a CSV file. This is your right under GDPR.</p>
                </div>
                <button style={styles.exportBtn}>📥 Export CSV</button>
              </div>
              <div style={styles.divider} />
              <div style={styles.dataRow}>
                <div>
                  <p style={styles.dataTitle}>Delete Account</p>
                  <p style={styles.dataDesc}>Permanently delete your account and all associated data. This cannot be undone.</p>
                </div>
                <button style={styles.deleteBtn}>🗑 Delete Account</button>
              </div>
            </div>
          )}
        </div>
        <Footer jurisdiction={user.jurisdiction} />
      </div>
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f1f5f9' },
  sidebar: { width: '220px', minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 },
  sidebarLogo: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoLink: { textDecoration: 'none' },
  logoText: { color: '#38bdf8', fontSize: '22px', fontWeight: '800', margin: 0 },
  sidebarNav: { flex: 1, padding: '16px 0' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderLeft: '3px solid transparent' },
  navItemActive: { color: 'white', backgroundColor: 'rgba(56,189,248,0.15)', borderLeft: '3px solid #38bdf8' },
  navIcon: { display: 'flex', alignItems: 'center' },
  sidebarLogout: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', color: 'rgba(255,255,255,0.5)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' },
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  pageTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  greeting: { color: '#64748b', fontSize: '14px' },
  content: { padding: '24px 28px', flex: 1 },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '24px', backgroundColor: 'white', padding: '6px', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', width: 'fit-content' },
  tab: { padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  tabActive: { backgroundColor: '#0ea5e9', color: 'white', fontWeight: '600' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', maxWidth: '700px' },
  cardTitle: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' },
  cardSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 24px 0' },
  row: { display: 'flex', gap: '16px' },
  field: { flex: 1, marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  disabledInput: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f1f5f9', color: '#94a3b8' },
  fieldHint: { color: '#94a3b8', fontSize: '12px', margin: '6px 0 0 0' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' },
  profileBox: { borderRadius: '10px', padding: '14px', marginBottom: '16px' },
  profilePercent: { fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '6px' },
  profileText: { fontSize: '13px', lineHeight: '1.6', margin: 0 },
  saveBtn: { padding: '10px 24px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  dataRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' },
  dataTitle: { color: '#1e293b', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' },
  dataDesc: { color: '#64748b', fontSize: '13px', margin: 0, maxWidth: '400px' },
  exportBtn: { padding: '8px 16px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  deleteBtn: { padding: '8px 16px', backgroundColor: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
};

export default Profile;
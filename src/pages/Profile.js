import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut, Target, Plus, Trash2, ChevronUp } from 'lucide-react';
import { supabase } from '../supabaseClient';
import Footer from '../components/Footer';
import { getCurrencySymbol, CURRENCY_CODES } from '../utils/currency';

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

  // Summary history state
  const [summaries, setSummaries] = useState([]);
  const [summariesLoading, setSummariesLoading] = useState(false);

  // Goals state
  const [goals, setGoals] = useState([]);
  const [goalsLoading, setGoalsLoading] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalType, setGoalType] = useState('deposit');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCasino, setGoalCasino] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalSaving, setGoalSaving] = useState(false);
  const [goalError, setGoalError] = useState('');
  const [userCasinos, setUserCasinos] = useState([]);
  const [deletingGoalId, setDeletingGoalId] = useState(null);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const [customAmounts, setCustomAmounts] = useState({});

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

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

  // Fetch goals and casinos when Goals tab is active
  const fetchGoals = useCallback(async () => {
    setGoalsLoading(true);
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) {
      // Auto-update status based on deadline
      const now = new Date();
      const updated = data.map(g => {
        if (g.status === 'active' && g.deadline && new Date(g.deadline) < now && Number(g.current_amount) < Number(g.target_amount)) {
          return { ...g, status: 'failed' };
        }
        return g;
      });
      setGoals(updated);
      const initAmounts = {};
      updated.forEach(g => { initAmounts[g.id] = g.current_amount || 0; });
      setCustomAmounts(initAmounts);
    }
    setGoalsLoading(false);
  }, [user.id]);

  const fetchCasinos = useCallback(async () => {
    const { data } = await supabase
      .from('casinos')
      .select('id, casino_name')
      .eq('user_id', user.id)
      .order('casino_name', { ascending: true });
    if (data) setUserCasinos(data);
  }, [user.id]);

  const fetchSummaries = useCallback(async () => {
    setSummariesLoading(true);
    try {
      const { data } = await supabase
        .from('summaries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setSummaries(data || []);
    } catch (_) {
      setSummaries([]);
    }
    setSummariesLoading(false);
  }, [user.id]);

  useEffect(() => {
    if (activeTab === 'goals') {
      fetchGoals();
      fetchCasinos();
    } else if (activeTab === 'history') {
      fetchSummaries();
    }
  }, [activeTab, fetchGoals, fetchCasinos, fetchSummaries]);

  // Compute auto-calculated current amount for a goal using transactions
  const computeCurrentAmount = useCallback(async (goalTypeVal, casinoId) => {
    let query = supabase.from('transactions').select('type, amount').eq('user_id', user.id);
    if (casinoId) query = query.eq('casino_id', casinoId);

    const { data: txns } = await query;
    if (!txns) return 0;

    if (goalTypeVal === 'deposit') {
      return txns.filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.amount), 0);
    }
    if (goalTypeVal === 'withdrawal') {
      return txns.filter(t => t.type === 'withdrawal').reduce((s, t) => s + Number(t.amount), 0);
    }
    if (goalTypeVal === 'net_position') {
      const deps = txns.filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.amount), 0);
      const withs = txns.filter(t => t.type === 'withdrawal').reduce((s, t) => s + Number(t.amount), 0);
      return withs - deps;
    }
    return 0; // custom
  }, [user.id]);

  const handleAddGoal = async (e) => {
    e.preventDefault();
    setGoalError('');
    if (!goalTitle.trim()) { setGoalError('Please enter a goal title.'); return; }
    if (!goalTarget || Number(goalTarget) <= 0) { setGoalError('Please enter a valid target amount.'); return; }

    setGoalSaving(true);

    let currentAmt = 0;
    if (goalType !== 'custom') {
      currentAmt = await computeCurrentAmount(goalType, goalCasino || null);
    }

    const status = currentAmt >= Number(goalTarget) ? 'completed' : 'active';

    const { error: insertError } = await supabase.from('goals').insert({
      user_id: user.id,
      casino_id: goalCasino || null,
      title: goalTitle.trim(),
      goal_type: goalType,
      target_amount: Number(goalTarget),
      current_amount: currentAmt,
      deadline: goalDeadline || null,
      status,
    });

    if (insertError) {
      setGoalError('Could not save goal. Please try again.');
      setGoalSaving(false);
      return;
    }

    setGoalTitle('');
    setGoalType('deposit');
    setGoalTarget('');
    setGoalCasino('');
    setGoalDeadline('');
    setShowAddGoal(false);
    setGoalSaving(false);
    fetchGoals();
  };

  const handleDeleteGoal = async (id) => {
    setDeletingGoalId(id);
    await supabase.from('goals').delete().eq('id', id);
    setGoals(prev => prev.filter(g => g.id !== id));
    setDeletingGoalId(null);
  };

  const handleUpdateCustomAmount = async (goalId) => {
    const newAmt = Number(customAmounts[goalId] || 0);
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;
    const newStatus = newAmt >= Number(goal.target_amount) ? 'completed' : goal.status === 'failed' ? 'failed' : 'active';
    setUpdatingGoalId(goalId);
    await supabase.from('goals').update({ current_amount: newAmt, status: newStatus }).eq('id', goalId);
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current_amount: newAmt, status: newStatus } : g));
    setUpdatingGoalId(null);
  };

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

  const currencies = CURRENCY_CODES;
  const symbol = getCurrencySymbol(profile);

  const getSpendingProfile = () => {
    if (!monthlyIncome || !monthlyNetLossLimit) return null;
    const percent = (monthlyNetLossLimit / monthlyIncome) * 100;
    if (percent <= 5) return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', text: "Your spending level is typical of casual players who enjoy online casinos as a form of entertainment. There is no particular cause for concern at this level." };
    if (percent <= 15) return { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', text: "This spending level is common among regular players. It is worth reviewing your spending periodically to make sure it stays within your comfort zone." };
    if (percent <= 30) return { color: '#d97706', bg: '#fffbeb', border: '#fde68a', text: "At this level you are spending a meaningful portion of your income on gambling. Casinos may offer VIP treatment. Be mindful of your spending patterns." };
    if (percent <= 50) return { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', text: "This spending level places you in a VIP or high-roller category. Consider whether your gambling budget is still comfortable for you financially." };
    return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', text: "Your spending level exceeds half of your monthly income. We recommend reviewing your limits and considering whether adjusting your budget would give you a healthier balance." };
  };

  const spendingProfile = getSpendingProfile();
  const percent = monthlyIncome && monthlyNetLossLimit ? ((monthlyNetLossLimit / monthlyIncome) * 100).toFixed(1) : null;

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error: updateError } = await supabase.from('profiles').update({ full_name: name, country, currency }).eq('id', user.id).select().single();
    if (updateError) { setError('Could not save changes. Please try again.'); return; }
    onUpdateProfile(data);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLimitsSave = async (e) => {
    e.preventDefault();
    setError('');
    const { data, error: updateError } = await supabase.from('profiles').update({
      monthly_deposit_limit: monthlyDepositLimit ? Number(monthlyDepositLimit) : null,
      monthly_net_loss_limit: monthlyNetLossLimit ? Number(monthlyNetLossLimit) : null,
      monthly_net_income: monthlyIncome ? Number(monthlyIncome) : null,
    }).eq('id', user.id).select().single();
    if (updateError) { setError('Could not save limits. Please try again.'); return; }
    onUpdateProfile(data);
    setLimitsSaved(true);
    setTimeout(() => setLimitsSaved(false), 2000);
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!newPassword) { setPasswordError('Please enter a new password.'); return; }
    const { error: passwordUpdateError } = await supabase.auth.updateUser({ password: newPassword });
    if (passwordUpdateError) { setPasswordError('Could not update password. Please try again.'); return; }
    setPasswordSaved(true);
    setCurrentPassword('');
    setNewPassword('');
    setTimeout(() => setPasswordSaved(false), 2000);
  };

  const handleExportCSV = () => { alert('CSV export coming soon.'); };

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

  const tabs = ['profile', 'budget', 'goals', 'history', 'security', 'data'];
  const tabLabels = { profile: 'Profile', budget: 'Budget & Limits', goals: 'Goals', history: 'History', security: 'Security', data: 'My Data' };
  const tabLabelsMobile = { profile: 'Profile', budget: 'Budget', goals: 'Goals', history: 'History', security: 'Security', data: 'Data' };

  const goalTypeLabels = { deposit: 'Deposit', withdrawal: 'Withdrawal', net_position: 'Net Position', custom: 'Custom' };

  const getStatusStyle = (status) => {
    if (status === 'completed') return { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Completed' };
    if (status === 'failed') return { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Failed' };
    return { color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd', label: 'Active' };
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const failedGoals = goals.filter(g => g.status === 'failed');

  const renderGoalCard = (goal) => {
    const current = Number(goal.current_amount) || 0;
    const target = Number(goal.target_amount) || 1;
    const pct = Math.min((current / target) * 100, 100);
    const statusStyle = getStatusStyle(goal.status);
    const casinoName = userCasinos.find(c => c.id === goal.casino_id)?.casino_name;
    const isCustom = goal.goal_type === 'custom';

    return (
      <div key={goal.id} style={styles.goalCard}>
        <div style={styles.goalCardHeader}>
          <div style={styles.goalCardLeft}>
            <div style={styles.goalIconWrap}>
              <Target size={16} color="#0ea5e9" />
            </div>
            <div>
              <p style={styles.goalTitle}>{goal.title}</p>
              <div style={styles.goalMeta}>
                <span style={styles.goalTypeBadge}>{goalTypeLabels[goal.goal_type]}</span>
                {casinoName && <span style={styles.goalCasinoBadge}>{casinoName}</span>}
                {goal.deadline && (
                  <span style={styles.goalDeadlineBadge}>
                    Due {new Date(goal.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                )}
              </div>
            </div>
          </div>
          <div style={styles.goalCardRight}>
            <span style={{ ...styles.statusBadge, color: statusStyle.color, backgroundColor: statusStyle.bg, border: `1px solid ${statusStyle.border}` }}>
              {statusStyle.label}
            </span>
            <button
              style={styles.goalDeleteBtn}
              onClick={() => handleDeleteGoal(goal.id)}
              disabled={deletingGoalId === goal.id}
              title="Delete goal"
            >
              <Trash2 size={14} color="#ef4444" />
            </button>
          </div>
        </div>

        <div style={styles.goalProgressRow}>
          <div style={styles.goalProgressBar}>
            <div style={{
              ...styles.goalProgressFill,
              width: `${pct}%`,
              backgroundColor: goal.status === 'completed' ? '#16a34a' : goal.status === 'failed' ? '#ef4444' : pct >= 80 ? '#f59e0b' : '#0ea5e9',
            }} />
          </div>
          <span style={styles.goalProgressPct}>{pct.toFixed(0)}%</span>
        </div>
        <p style={styles.goalProgressText}>
          {symbol}{current.toLocaleString()} of {symbol}{target.toLocaleString()}
        </p>

        {isCustom && goal.status === 'active' && (
          <div style={styles.goalCustomUpdate}>
            <input
              type="number"
              value={customAmounts[goal.id] ?? current}
              onChange={(e) => setCustomAmounts(prev => ({ ...prev, [goal.id]: e.target.value }))}
              style={styles.goalCustomInput}
              placeholder="Update progress..."
            />
            <button
              style={styles.goalCustomSaveBtn}
              onClick={() => handleUpdateCustomAmount(goal.id)}
              disabled={updatingGoalId === goal.id}
            >
              {updatingGoalId === goal.id ? 'Saving...' : 'Update'}
            </button>
          </div>
        )}
      </div>
    );
  };

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
              <Link key={item.id} to={item.path} style={{ ...styles.navItem, ...(item.id === 'profile' ? styles.navItemActive : {}) }}>
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
            <Link
              to="/support"
              style={{ ...(isMobile ? styles.tabMobile : styles.tab), textDecoration: 'none', display: 'inline-block' }}
            >
              Support
            </Link>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          {/* ── Profile tab ── */}
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
                    <label style={styles.label}>Date of Birth</label>
                    <input style={styles.disabledInput} type="date" value={profile?.date_of_birth || ''} disabled />
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

          {/* ── Budget tab ── */}
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

          {/* ── Goals tab ── */}
          {activeTab === 'goals' && (
            <div>
              {/* Header row */}
              <div style={styles.goalsHeader}>
                <div>
                  <h3 style={styles.cardTitle}>My Goals</h3>
                  <p style={styles.cardSubtitle}>Track your targets — withdrawals, deposits, net position or custom milestones.</p>
                </div>
                <button style={styles.addGoalBtn} onClick={() => setShowAddGoal(v => !v)}>
                  {showAddGoal ? <ChevronUp size={16} /> : <Plus size={16} />}
                  <span>{showAddGoal ? 'Cancel' : 'Add Goal'}</span>
                </button>
              </div>

              {/* Add goal form */}
              {showAddGoal && (
                <div style={styles.addGoalForm}>
                  <h4 style={styles.addGoalFormTitle}>New Goal</h4>
                  {goalError && <div style={styles.errorBox}>{goalError}</div>}
                  <form onSubmit={handleAddGoal}>
                    <div style={styles.field}>
                      <label style={styles.label}>Goal Title</label>
                      <input
                        style={styles.input}
                        type="text"
                        value={goalTitle}
                        onChange={(e) => setGoalTitle(e.target.value)}
                        placeholder='e.g. "Win €1000 with casino x"'
                      />
                    </div>
                    <div style={isMobile ? styles.fieldFull : styles.row}>
                      <div style={styles.field}>
                        <label style={styles.label}>Goal Type</label>
                        <select style={styles.input} value={goalType} onChange={(e) => setGoalType(e.target.value)}>
                          <option value="deposit">Deposit</option>
                          <option value="withdrawal">Withdrawal</option>
                          <option value="net_position">Net Position</option>
                          <option value="custom">Custom</option>
                        </select>
                        <p style={styles.fieldHint}>
                          {goalType === 'deposit' && 'Progress auto-tracks from your total deposits.'}
                          {goalType === 'withdrawal' && 'Progress auto-tracks from your total withdrawals.'}
                          {goalType === 'net_position' && 'Progress auto-tracks from withdrawals minus deposits.'}
                          {goalType === 'custom' && 'You update the progress manually.'}
                        </p>
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>Target Amount ({symbol})</label>
                        <input
                          style={styles.input}
                          type="number"
                          value={goalTarget}
                          onChange={(e) => setGoalTarget(e.target.value)}
                          placeholder="e.g. 1000"
                          min="1"
                        />
                      </div>
                    </div>
                    <div style={isMobile ? styles.fieldFull : styles.row}>
                      <div style={styles.field}>
                        <label style={styles.label}>Casino (optional)</label>
                        <select style={styles.input} value={goalCasino} onChange={(e) => setGoalCasino(e.target.value)}>
                          <option value="">All Casinos</option>
                          {userCasinos.map(c => <option key={c.id} value={c.id}>{c.casino_name}</option>)}
                        </select>
                      </div>
                      <div style={styles.field}>
                        <label style={styles.label}>Deadline (optional)</label>
                        <input
                          style={styles.input}
                          type="date"
                          value={goalDeadline}
                          onChange={(e) => setGoalDeadline(e.target.value)}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                    </div>
                    <button type="submit" style={styles.saveBtn} disabled={goalSaving}>
                      {goalSaving ? 'Saving...' : 'Save Goal'}
                    </button>
                  </form>
                </div>
              )}

              {goalsLoading ? (
                <p style={styles.goalsEmptyText}>Loading goals...</p>
              ) : goals.length === 0 ? (
                <div style={styles.goalsEmptyState}>
                  <div style={styles.goalsEmptyIcon}><Target size={32} color="#0ea5e9" /></div>
                  <p style={styles.goalsEmptyTitle}>No goals yet</p>
                  <p style={styles.goalsEmptyText}>Set your first goal above to start tracking your progress.</p>
                </div>
              ) : (
                <div>
                  {activeGoals.length > 0 && (
                    <div style={styles.goalGroup}>
                      <p style={styles.goalGroupLabel}>Active ({activeGoals.length})</p>
                      {activeGoals.map(renderGoalCard)}
                    </div>
                  )}
                  {completedGoals.length > 0 && (
                    <div style={styles.goalGroup}>
                      <p style={styles.goalGroupLabel}>Completed ({completedGoals.length})</p>
                      {completedGoals.map(renderGoalCard)}
                    </div>
                  )}
                  {failedGoals.length > 0 && (
                    <div style={styles.goalGroup}>
                      <p style={styles.goalGroupLabel}>Failed ({failedGoals.length})</p>
                      {failedGoals.map(renderGoalCard)}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── History tab ── */}
          {activeTab === 'history' && (
            <div>
              <h3 style={styles.cardTitle}>Summary History</h3>
              <p style={styles.cardSubtitle}>Your last 6 monthly summaries and most recent annual review.</p>
              {summariesLoading ? (
                <p style={styles.goalsEmptyText}>Loading history...</p>
              ) : summaries.length === 0 ? (
                <div style={styles.goalsEmptyState}>
                  <div style={styles.goalsEmptyIcon}>
                    <span style={{ fontSize: '28px' }}>📅</span>
                  </div>
                  <p style={styles.goalsEmptyTitle}>No summaries yet</p>
                  <p style={styles.goalsEmptyText}>Your monthly summaries will appear here after each month-end review.</p>
                </div>
              ) : (
                <div style={styles.summaryList}>
                  {/* Annual summaries — show most recent 1 */}
                  {summaries.filter(s => s.period_type === 'annual').slice(0, 1).map(s => {
                    const isPositive = s.net_result >= 0;
                    return (
                      <div key={s.id} style={{ ...styles.summaryCard, borderLeft: `4px solid #8b5cf6` }}>
                        <div style={styles.summaryCardHeader}>
                          <div>
                            <span style={styles.summaryAnnualBadge}>Annual Review</span>
                            <p style={styles.summaryPeriod}>{s.period_label}</p>
                          </div>
                          <div style={{ ...styles.summaryNet, color: isPositive ? '#16a34a' : '#dc2626' }}>
                            {isPositive ? '+' : '-'}{symbol}{Math.abs(Number(s.net_result)).toLocaleString()}
                          </div>
                        </div>
                        <div style={styles.summaryStats}>
                          <div style={styles.summaryStat}>
                            <span style={styles.summaryStatLabel}>Deposited</span>
                            <span style={styles.summaryStatValue}>{symbol}{Number(s.total_deposited).toLocaleString()}</span>
                          </div>
                          <div style={styles.summaryStat}>
                            <span style={styles.summaryStatLabel}>Withdrawn</span>
                            <span style={styles.summaryStatValue}>{symbol}{Number(s.total_withdrawn).toLocaleString()}</span>
                          </div>
                          {s.best_casino && (
                            <div style={styles.summaryStat}>
                              <span style={styles.summaryStatLabel}>Best Casino</span>
                              <span style={styles.summaryStatValue}>{s.best_casino}</span>
                            </div>
                          )}
                          <div style={styles.summaryStat}>
                            <span style={styles.summaryStatLabel}>Goals</span>
                            <span style={styles.summaryStatValue}>
                              {s.goals_total === 0 ? '—' : `${s.goals_completed}/${s.goals_total}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {/* Monthly summaries — last 6 */}
                  {summaries.filter(s => s.period_type === 'monthly').slice(0, 6).map(s => {
                    const isPositive = s.net_result >= 0;
                    return (
                      <div key={s.id} style={{ ...styles.summaryCard, borderLeft: `4px solid ${isPositive ? '#22c55e' : '#ef4444'}` }}>
                        <div style={styles.summaryCardHeader}>
                          <div>
                            <span style={styles.summaryMonthlyBadge}>Monthly</span>
                            <p style={styles.summaryPeriod}>{s.period_label}</p>
                          </div>
                          <div style={{ ...styles.summaryNet, color: isPositive ? '#16a34a' : '#dc2626' }}>
                            {isPositive ? '+' : '-'}{symbol}{Math.abs(Number(s.net_result)).toLocaleString()}
                          </div>
                        </div>
                        <div style={styles.summaryStats}>
                          <div style={styles.summaryStat}>
                            <span style={styles.summaryStatLabel}>Deposited</span>
                            <span style={styles.summaryStatValue}>{symbol}{Number(s.total_deposited).toLocaleString()}</span>
                          </div>
                          <div style={styles.summaryStat}>
                            <span style={styles.summaryStatLabel}>Withdrawn</span>
                            <span style={styles.summaryStatValue}>{symbol}{Number(s.total_withdrawn).toLocaleString()}</span>
                          </div>
                          {s.best_casino && (
                            <div style={styles.summaryStat}>
                              <span style={styles.summaryStatLabel}>Best Casino</span>
                              <span style={styles.summaryStatValue}>{s.best_casino}</span>
                            </div>
                          )}
                          <div style={styles.summaryStat}>
                            <span style={styles.summaryStatLabel}>Goals</span>
                            <span style={styles.summaryStatValue}>
                              {s.goals_total === 0 ? '—' : `${s.goals_completed}/${s.goals_total}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Security tab ── */}
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

          {/* ── My Data tab ── */}
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
            <Link key={item.id} to={item.path} style={{ ...styles.bottomNavItem, ...(item.id === 'profile' ? styles.bottomNavItemActive : {}) }}>
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
  tab: { padding: '8px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '14px', fontWeight: '500', cursor: 'pointer' },
  tabMobile: { flex: 1, padding: '7px 2px', borderRadius: '8px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '11px', fontWeight: '500', cursor: 'pointer', whiteSpace: 'nowrap' },
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

  // Goals tab styles
  goalsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  addGoalBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', flexShrink: 0 },
  addGoalForm: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '20px', border: '1px solid #e2e8f0' },
  addGoalFormTitle: { color: '#0f172a', fontSize: '15px', fontWeight: '700', margin: '0 0 16px 0' },
  goalsEmptyState: { backgroundColor: 'white', borderRadius: '12px', padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  goalsEmptyIcon: { width: '64px', height: '64px', backgroundColor: '#f0f9ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' },
  goalsEmptyTitle: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 8px 0' },
  goalsEmptyText: { color: '#64748b', fontSize: '14px', margin: 0 },
  goalGroup: { marginBottom: '24px' },
  goalGroupLabel: { color: '#64748b', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px 0' },
  goalCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginBottom: '10px', border: '1px solid #e2e8f0' },
  goalCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  goalCardLeft: { display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1, minWidth: 0 },
  goalIconWrap: { width: '32px', height: '32px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  goalTitle: { color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 6px 0' },
  goalMeta: { display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' },
  goalTypeBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px' },
  goalCasinoBadge: { backgroundColor: '#f8fafc', color: '#64748b', fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  goalDeadlineBadge: { backgroundColor: '#fefce8', color: '#92400e', fontSize: '11px', fontWeight: '500', padding: '2px 8px', borderRadius: '20px' },
  goalCardRight: { display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0, marginLeft: '8px' },
  statusBadge: { fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px' },
  goalDeleteBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', opacity: 0.7 },
  goalProgressRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' },
  goalProgressBar: { flex: 1, height: '8px', backgroundColor: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' },
  goalProgressFill: { height: '100%', borderRadius: '4px', transition: 'width 0.3s ease' },
  goalProgressPct: { color: '#64748b', fontSize: '12px', fontWeight: '700', flexShrink: 0, minWidth: '36px', textAlign: 'right' },
  goalProgressText: { color: '#94a3b8', fontSize: '12px', margin: '0 0 0 0' },
  goalCustomUpdate: { display: 'flex', gap: '8px', marginTop: '12px' },
  goalCustomInput: { flex: 1, padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', backgroundColor: '#f8fafc' },
  goalCustomSaveBtn: { padding: '8px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },

  // Summary History tab
  summaryList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  summaryCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  summaryCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' },
  summaryPeriod: { color: '#0f172a', fontSize: '15px', fontWeight: '700', margin: '4px 0 0 0' },
  summaryNet: { fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' },
  summaryAnnualBadge: { backgroundColor: '#f5f3ff', color: '#7c3aed', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  summaryMonthlyBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  summaryStats: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: '10px' },
  summaryStat: { display: 'flex', flexDirection: 'column', gap: '3px' },
  summaryStatLabel: { color: '#94a3b8', fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' },
  summaryStatValue: { color: '#374151', fontSize: '13px', fontWeight: '600' },
};

export default Profile;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LayoutDashboard, Building2, User, Download, Bell, Search, Star, TrendingUp, TrendingDown, MessageSquare, LogOut } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import Footer from '../components/Footer';

function Dashboard({ user, onLogout, userSettings, onUpdateSettings }) {
  const [casinos, setCasinos] = useState([]);
  const [monthlyDepositLimit, setMonthlyDepositLimit] = useState(userSettings?.monthlyDepositLimit || 1000);
  const [monthlyNetLossLimit, setMonthlyNetLossLimit] = useState(userSettings?.monthlyNetLossLimit || 500);
  const [timeFilter, setTimeFilter] = useState('This Month');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const currency = user.currency || 'EUR';
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'SEK' ? 'kr' : currency === 'DKK' ? 'kr' : '€';

  const totalDeposits = casinos.reduce((sum, c) => sum + c.deposits, 0);
  const totalWithdrawals = casinos.reduce((sum, c) => sum + c.withdrawals, 0);
  const totalBonuses = casinos.reduce((sum, c) => sum + c.bonuses, 0);
  const totalCurrentBalance = casinos.reduce((sum, c) => sum + c.currentBalance, 0);
  const netLoss = totalDeposits - totalWithdrawals - totalCurrentBalance;
  const netResult = totalWithdrawals - totalDeposits;

  const depositLimitPercent = monthlyDepositLimit > 0 ? Math.min((totalDeposits / monthlyDepositLimit) * 100, 100) : 0;
  const netLossLimitPercent = monthlyNetLossLimit > 0 ? Math.min((netLoss / monthlyNetLossLimit) * 100, 100) : 0;

  const mostPlayed = casinos.length > 0 ? [...casinos].sort((a, b) => b.sessions - a.sessions)[0] : null;
  const mostProfitable = casinos.length > 0 ? [...casinos].sort((a, b) => (b.withdrawals - b.deposits) - (a.withdrawals - a.deposits))[0] : null;

  const filteredCasinos = casinos.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const allGameStats = casinos.flatMap(c => c.gameStats || []).reduce((acc, g) => {
    const existing = acc.find(a => a.game === g.game);
    if (existing) existing.amount += g.amount;
    else acc.push({ ...g });
    return acc;
  }, []).sort((a, b) => b.amount - a.amount);

  const chartData = casinos.map(c => ({
    name: c.name,
    Deposits: c.deposits,
    Withdrawals: c.withdrawals,
    Net: c.withdrawals - c.deposits,
  }));

  const trendData = [
    { month: 'Oct', deposits: 0, withdrawals: 0 },
    { month: 'Nov', deposits: 0, withdrawals: 0 },
    { month: 'Dec', deposits: 0, withdrawals: 0 },
    { month: 'Jan', deposits: 0, withdrawals: 0 },
    { month: 'Feb', deposits: 0, withdrawals: 0 },
    { month: 'Mar', deposits: 0, withdrawals: 0 },
  ];

  const getNotificationMessage = (percent, type) => {
    if (percent >= 100) return type === 'deposit'
      ? `You have reached your monthly deposit limit.`
      : `You have reached your monthly net loss limit.`;
    if (percent >= 80) return type === 'deposit'
      ? `Almost at your limit — 80% of your monthly deposit budget used.`
      : `Almost at your limit — 80% of your monthly net loss budget used.`;
    if (percent >= 50) return type === 'deposit'
      ? `50% of your monthly deposit limit used.`
      : `50% of your monthly net loss limit used.`;
    return null;
  };

  const depositNotification = getNotificationMessage(depositLimitPercent, 'deposit');
  const netLossNotification = getNotificationMessage(netLossLimitPercent, 'netloss');
  const activeNotification = netLossNotification || depositNotification;

  const handleExportReport = () => {
    const reportData = [
      ['Casiflow Monthly Report'],
      ['Generated:', new Date().toLocaleDateString()],
      ['Player:', user.name],
      ['Period:', timeFilter],
      [],
      ['Summary'],
      ['Total Deposited:', `${symbol}${totalDeposits}`],
      ['Total Withdrawn:', `${symbol}${totalWithdrawals}`],
      ['Total Bonuses:', `${symbol}${totalBonuses}`],
      ['Net Result:', `${netResult >= 0 ? '+' : '-'}${symbol}${Math.abs(netResult)}`],
      ['Net Loss:', `${symbol}${Math.max(0, netLoss)}`],
      [],
      ['Limits'],
      ['Monthly Deposit Limit:', `${symbol}${monthlyDepositLimit}`],
      ['Monthly Net Loss Limit:', `${symbol}${monthlyNetLossLimit}`],
      [],
      ['Casino Breakdown'],
      ['Casino', 'Deposited', 'Withdrawn', 'Bonus', 'Current Balance', 'Net Result'],
      ...casinos.map(c => [
        c.name,
        `${symbol}${c.deposits}`,
        `${symbol}${c.withdrawals}`,
        `${symbol}${c.bonuses}`,
        `${symbol}${c.currentBalance}`,
        `${c.withdrawals + c.currentBalance - c.deposits >= 0 ? '+' : '-'}${symbol}${Math.abs(c.withdrawals + c.currentBalance - c.deposits)}`
      ])
    ];
    const csvContent = reportData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `casiflow-report-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const deposits = payload.find(p => p.dataKey === 'Deposits')?.value || 0;
      const withdrawals = payload.find(p => p.dataKey === 'Withdrawals')?.value || 0;
      const net = withdrawals - deposits;
      return (
        <div style={styles.tooltip}>
          <p style={styles.tooltipTitle}>{label}</p>
          <p style={styles.tooltipRow}>Deposited: <strong>{symbol}{deposits}</strong></p>
          <p style={styles.tooltipRow}>Withdrawn: <strong>{symbol}{withdrawals}</strong></p>
          <p style={{ ...styles.tooltipRow, color: net >= 0 ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
            Net: {net >= 0 ? '+' : '-'}{symbol}{Math.abs(net)}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleFeedback = () => {
    if (feedback.trim()) {
      setFeedbackSent(true);
      setFeedback('');
      setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); }, 2000);
    }
  };

  const updateNote = (id, note) => setCasinos(casinos.map(c => c.id === id ? { ...c, note } : c));
  const updateRating = (id, rating) => setCasinos(casinos.map(c => c.id === id ? { ...c, rating } : c));
  const updateBalance = (id, balance) => setCasinos(casinos.map(c => c.id === id ? { ...c, currentBalance: Number(balance) } : c));

  const getAvatarColor = (name) => {
    const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const getCasinoNetResult = (casino) => casino.withdrawals + casino.currentBalance - casino.deposits;

  const timeFilters = ['Last 24hrs', 'Last Week', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last Year', 'All Time'];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
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
                style={{ ...styles.navItem, ...(activeNav === item.id ? styles.navItemActive : {}) }}
                onClick={() => setActiveNav(item.id)}
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
            {!isMobile && <h2 style={styles.pageTitle}>Dashboard</h2>}
            {!isMobile && <span style={styles.jurisdiction}>{user.jurisdiction || 'Global'}</span>}
          </div>
          <div style={styles.topBarRight}>
            {!isMobile && (
              <button onClick={handleExportReport} style={styles.exportBtn}>
                <Download size={14} />
                <span>Export Report</span>
              </button>
            )}
            {!isMobile && <span style={styles.greeting}>Hi, {user.name}</span>}
            <button style={styles.bellBtn}><Bell size={18} /></button>
          </div>
        </div>

        {activeNotification && showNotification && (
          <div style={{ ...styles.notificationBanner, backgroundColor: netLossLimitPercent >= 100 || depositLimitPercent >= 100 ? '#fef2f2' : '#fffbeb' }}>
            <span style={{ fontSize: '13px', color: netLossLimitPercent >= 100 || depositLimitPercent >= 100 ? '#dc2626' : '#92400e' }}>
              {netLossLimitPercent >= 100 || depositLimitPercent >= 100 ? '🚨' : '⚠️'} {activeNotification}
            </span>
            <button onClick={() => setShowNotification(false)} style={styles.notificationClose}>✕</button>
          </div>
        )}

        <div style={isMobile ? styles.heroBannerMobile : styles.heroBanner}>
          <div style={styles.heroLeft}>
            <p style={styles.heroLabel}>This month you are</p>
            <h2 style={{ ...styles.heroAmount, color: casinos.length === 0 ? 'rgba(255,255,255,0.4)' : netResult >= 0 ? '#4ade80' : '#f87171' }}>
              {casinos.length === 0 ? 'No data yet' : `${netResult >= 0 ? '+' : '-'}${symbol}${Math.abs(netResult).toLocaleString()}`}
            </h2>
            <p style={styles.heroSub}>
              {casinos.length === 0 ? 'Add your first casino to get started' : `across ${casinos.length} casinos · Net loss: ${symbol}${Math.max(0, netLoss).toLocaleString()}`}
            </p>
          </div>
          {!isMobile && (
            <div style={styles.heroRight}>
              <div style={styles.heroStat}>
                <p style={styles.heroStatLabel}>Deposit Limit</p>
                <p style={styles.heroStatValue}>{symbol}{monthlyDepositLimit.toLocaleString()}</p>
              </div>
              <div style={styles.heroStat}>
                <p style={styles.heroStatLabel}>Net Loss Limit</p>
                <p style={styles.heroStatValue}>{symbol}{monthlyNetLossLimit.toLocaleString()}</p>
              </div>
              <div style={styles.heroStat}>
                <p style={styles.heroStatLabel}>Most Played</p>
                <p style={styles.heroStatValue}>{mostPlayed?.name || '—'}</p>
              </div>
              <div style={styles.heroStat}>
                <p style={styles.heroStatLabel}>Most Profitable</p>
                <p style={styles.heroStatValue}>{mostProfitable?.name || '—'}</p>
              </div>
            </div>
          )}
          {isMobile && (
            <div style={styles.heroStatsMobile}>
              <div style={styles.heroStatMobile}>
                <p style={styles.heroStatLabel}>Deposit Limit</p>
                <p style={styles.heroStatValue}>{symbol}{monthlyDepositLimit.toLocaleString()}</p>
              </div>
              <div style={styles.heroStatMobile}>
                <p style={styles.heroStatLabel}>Net Loss Limit</p>
                <p style={styles.heroStatValue}>{symbol}{monthlyNetLossLimit.toLocaleString()}</p>
              </div>
              <div style={styles.heroStatMobile}>
                <p style={styles.heroStatLabel}>Most Played</p>
                <p style={styles.heroStatValue}>{mostPlayed?.name || '—'}</p>
              </div>
              <div style={styles.heroStatMobile}>
                <p style={styles.heroStatLabel}>Most Profitable</p>
                <p style={styles.heroStatValue}>{mostProfitable?.name || '—'}</p>
              </div>
            </div>
          )}
        </div>

        <div style={styles.timeFilterBar}>
          {timeFilters.map(f => (
            <button key={f} style={{ ...styles.filterBtn, ...(timeFilter === f ? styles.filterBtnActive : {}) }} onClick={() => setTimeFilter(f)}>{f}</button>
          ))}
        </div>

        <div style={isMobile ? styles.statsRowMobile : styles.statsRow}>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Deposited</p>
            <p style={styles.statValue}>{symbol}{totalDeposits.toLocaleString()}</p>
            <p style={styles.statSub}>across {casinos.length} casinos</p>
          </div>
          <div style={styles.statCard}>
            <p style={styles.statLabel}>Total Withdrawn</p>
            <p style={styles.statValue}>{symbol}{totalWithdrawals.toLocaleString()}</p>
            <p style={styles.statSub}>total cashouts</p>
          </div>
          <div style={{ ...styles.statCard, backgroundColor: netResult >= 0 ? '#f0fdf4' : '#fef2f2', borderLeft: `4px solid ${netResult >= 0 ? '#22c55e' : '#ef4444'}` }}>
            <p style={styles.statLabel}>Net Result</p>
            <p style={{ ...styles.statValue, color: netResult >= 0 ? '#16a34a' : '#dc2626' }}>
              {casinos.length === 0 ? `${symbol}0` : `${netResult >= 0 ? '+' : '-'}${symbol}${Math.abs(netResult).toLocaleString()}`}
            </p>
            <p style={styles.statSub}>{netResult >= 0 ? 'you are up' : 'you are down'}</p>
          </div>
          <div style={{ ...styles.statCard, backgroundColor: '#fefce8', borderLeft: '4px solid #eab308' }}>
            <p style={styles.statLabel}>Bonus Balance</p>
            <p style={{ ...styles.statValue, color: '#ca8a04' }}>{symbol}{totalBonuses.toLocaleString()}</p>
            <p style={styles.statSub}>total bonuses received</p>
          </div>
        </div>

        <div style={isMobile ? styles.limitsRowMobile : styles.limitsRow}>
          <div style={styles.limitCard}>
            <div style={styles.limitRow}>
              <p style={styles.limitLabel}>Monthly Deposit Limit</p>
              <div style={styles.limitInputRow}>
                <input type="number" value={monthlyDepositLimit} onChange={(e) => setMonthlyDepositLimit(Number(e.target.value))} style={styles.limitInput} />
                <span style={styles.limitCurrency}>{currency}</span>
              </div>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${depositLimitPercent}%`, backgroundColor: depositLimitPercent >= 100 ? '#ef4444' : depositLimitPercent >= 80 ? '#f59e0b' : depositLimitPercent >= 50 ? '#0ea5e9' : '#10b981' }}>
                {depositLimitPercent > 15 && <span style={styles.progressLabel}>{depositLimitPercent.toFixed(0)}%</span>}
              </div>
            </div>
            <p style={styles.limitText}>{symbol}{totalDeposits} deposited of {symbol}{monthlyDepositLimit} limit</p>
          </div>
          <div style={styles.limitCard}>
            <div style={styles.limitRow}>
              <p style={styles.limitLabel}>Monthly Net Loss Limit</p>
              <div style={styles.limitInputRow}>
                <input type="number" value={monthlyNetLossLimit} onChange={(e) => setMonthlyNetLossLimit(Number(e.target.value))} style={styles.limitInput} />
                <span style={styles.limitCurrency}>{currency}</span>
              </div>
            </div>
            <div style={styles.progressBar}>
              <div style={{ ...styles.progressFill, width: `${netLossLimitPercent}%`, backgroundColor: netLossLimitPercent >= 100 ? '#ef4444' : netLossLimitPercent >= 80 ? '#f59e0b' : netLossLimitPercent >= 50 ? '#0ea5e9' : '#10b981' }}>
                {netLossLimitPercent > 15 && <span style={styles.progressLabel}>{netLossLimitPercent.toFixed(0)}%</span>}
              </div>
            </div>
            <p style={styles.limitText}>{symbol}{Math.max(0, netLoss)} net loss of {symbol}{monthlyNetLossLimit} limit</p>
          </div>
        </div>

        {casinos.length === 0 ? (
          <div style={isMobile ? styles.emptyDashboardMobile : styles.emptyDashboard}>
            <div style={styles.emptyDashboardContent}>
              <div style={styles.emptyIconWrapper}>
                <Building2 size={40} color="#0ea5e9" />
              </div>
              <h3 style={styles.emptyDashboardTitle}>Welcome to Casiflow, {user.name}!</h3>
              <p style={styles.emptyDashboardText}>You have not added any casinos yet. Add your first casino to start tracking your spending.</p>
              <Link to="/add-casino" style={styles.emptyDashboardBtn}>+ Add Your First Casino</Link>
            </div>
          </div>
        ) : (
          <>
            <div style={isMobile ? styles.chartsRowMobile : styles.chartsRow}>
              <div style={styles.chartCard}>
                <h3 style={styles.sectionTitle}>Deposits vs Withdrawals</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barGap={4}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="Deposits" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Withdrawals" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                <div style={styles.chartLegend}>
                  <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: '#0ea5e9' }} />Deposits</span>
                  <span style={styles.legendItem}><span style={{ ...styles.legendDot, backgroundColor: '#10b981' }} />Withdrawals</span>
                </div>
              </div>
              <div style={styles.chartCard}>
                <h3 style={styles.sectionTitle}>Monthly Trend</h3>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(value) => `${symbol}${value}`} />
                    <Legend />
                    <Line type="monotone" dataKey="deposits" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 3 }} name="Deposits" />
                    <Line type="monotone" dataKey="withdrawals" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Withdrawals" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            {allGameStats.length > 0 && (
              <div style={isMobile ? styles.gameStatsCardMobile : styles.gameStatsCard}>
                <h3 style={styles.sectionTitle}>Game Performance</h3>
                <div style={styles.gameStatsRow}>
                  {allGameStats.map((g, i) => (
                    <div key={i} style={styles.gameStatItem}>
                      <p style={styles.gameStatName}>{g.game}</p>
                      <p style={styles.gameStatAmount}>{symbol}{g.amount.toLocaleString()}</p>
                      <div style={styles.gameStatBar}>
                        <div style={{ ...styles.gameStatBarFill, width: `${(g.amount / allGameStats[0].amount) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div style={isMobile ? styles.recommendedCardMobile : styles.recommendedCard}>
          <div style={styles.recommendedHeader}>
            <h3 style={styles.sectionTitle}>Recommended Casinos</h3>
            <span style={styles.comingSoonBadge}>Coming Soon</span>
          </div>
          <p style={styles.recommendedText}>Personalised casino recommendations coming soon — based on your country, favourite games and playing style.</p>
        </div>

        <div style={isMobile ? styles.casinoSectionMobile : styles.casinoSection}>
          <div style={styles.casinoListHeader}>
            <h3 style={styles.sectionTitle}>Your Casinos</h3>
            <Link to="/add-casino" style={styles.addBtn}>+ Add Casino</Link>
          </div>
          <div style={styles.searchRow}>
            <div style={styles.searchWrapper}>
              <Search size={16} color="#94a3b8" style={styles.searchIcon} />
              <input style={styles.searchInput} type="text" placeholder="Search casinos..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
          {casinos.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIconWrapper}>
                <Building2 size={32} color="#94a3b8" />
              </div>
              <p style={styles.emptyTitle}>No casinos added yet</p>
              <p style={styles.emptyText}>Add your first casino to start tracking your spending</p>
              <Link to="/add-casino" style={styles.emptyAddBtn}>+ Add Casino</Link>
            </div>
          ) : filteredCasinos.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIconWrapper}>
                <Search size={32} color="#94a3b8" />
              </div>
              <p style={styles.emptyTitle}>No casinos found</p>
              <p style={styles.emptyText}>Try a different search term</p>
            </div>
          ) : (
            filteredCasinos.map(casino => {
              const casinoNetResult = getCasinoNetResult(casino);
              const isWinning = casinoNetResult >= 0;
              const maxAmount = casino.deposits + casino.withdrawals;
              const depositWidth = maxAmount > 0 ? (casino.deposits / maxAmount) * 100 : 0;
              const withdrawalWidth = maxAmount > 0 ? (casino.withdrawals / maxAmount) * 100 : 0;
              const avatarColor = getAvatarColor(casino.name);
              return (
                <div key={casino.id} style={styles.casinoCard}>
                  <div style={styles.casinoHeader}>
                    <div style={styles.casinoNameRow}>
                      <div style={{ ...styles.casinoAvatar, backgroundColor: avatarColor }}>{casino.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={styles.casinoNameLine}>
                          <h4 style={styles.casinoName}>{casino.name}</h4>
                          <span style={{ ...styles.statusDot, backgroundColor: isWinning ? '#22c55e' : '#ef4444' }} />
                        </div>
                        <span style={styles.lastActivity}>Last activity: {casino.lastActivity}</span>
                      </div>
                    </div>
                    <div style={styles.casinoHeaderRight}>
                      {!isMobile && (
                        <div style={styles.starRating}>
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={16} fill={star <= casino.rating ? '#f59e0b' : 'none'} color={star <= casino.rating ? '#f59e0b' : '#e2e8f0'} style={{ cursor: 'pointer' }} onClick={() => updateRating(casino.id, star)} />
                          ))}
                        </div>
                      )}
                      <span style={{ color: isWinning ? '#16a34a' : '#dc2626', fontWeight: '700', fontSize: '16px' }}>
                        {isWinning ? '+' : '-'}{symbol}{Math.abs(casinoNetResult).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  {isMobile && (
                    <div style={styles.casinoMobileRow}>
                      <div style={styles.starRating}>
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={18} fill={star <= casino.rating ? '#f59e0b' : 'none'} color={star <= casino.rating ? '#f59e0b' : '#e2e8f0'} style={{ cursor: 'pointer' }} onClick={() => updateRating(casino.id, star)} />
                        ))}
                      </div>
                      <span style={styles.streakBadge}>
                        {casino.streak >= 0
                          ? <><TrendingUp size={12} color="#16a34a" /> {casino.streak} win streak</>
                          : <><TrendingDown size={12} color="#dc2626" /> {Math.abs(casino.streak)} loss streak</>
                        }
                      </span>
                    </div>
                  )}
                  {!isMobile && (
                    <div style={styles.streakRowDesktop}>
                      <span style={styles.streakBadge}>
                        {casino.streak >= 0
                          ? <><TrendingUp size={12} color="#16a34a" /> {casino.streak} win streak</>
                          : <><TrendingDown size={12} color="#dc2626" /> {Math.abs(casino.streak)} loss streak</>
                        }
                      </span>
                    </div>
                  )}
                  <div style={styles.casinoBarRow}>
                    <div style={styles.barLabelRow}>
                      <span style={styles.barLabel}>Deposits</span>
                      <span style={styles.barLabel}>Withdrawals</span>
                    </div>
                    <div style={styles.casinoMiniBar}><div style={{ ...styles.casinoBarFill, width: `${depositWidth}%`, backgroundColor: '#0ea5e9' }} /></div>
                    <div style={styles.casinoMiniBar}><div style={{ ...styles.casinoBarFill, width: `${withdrawalWidth}%`, backgroundColor: '#10b981' }} /></div>
                  </div>
                  <div style={isMobile ? styles.casinoStatsMobile : styles.casinoStats}>
                    <span>Dep: {symbol}{casino.deposits}</span>
                    <span>With: {symbol}{casino.withdrawals}</span>
                    <span>Bonus: {symbol}{casino.bonuses}</span>
                    <span style={{ color: isWinning ? '#16a34a' : '#dc2626', fontWeight: '600' }}>Net: {isWinning ? '+' : '-'}{symbol}{Math.abs(casinoNetResult)}</span>
                  </div>
                  <div style={styles.balanceRow}>
                    <label style={styles.balanceLabel}>Current Balance ({symbol})</label>
                    <input style={styles.balanceInput} type="number" value={casino.currentBalance} onChange={(e) => updateBalance(casino.id, e.target.value)} placeholder="0" />
                  </div>
                  <input style={styles.noteInput} placeholder="Add a note..." value={casino.note} onChange={(e) => updateNote(casino.id, e.target.value)} />
                  {casino.gameStats && casino.gameStats.length > 0 && (
                    <div style={styles.casinoGameStats}>
                      {casino.gameStats.map((g, i) => <span key={i} style={styles.gameTag}>{g.game}: {symbol}{g.amount}</span>)}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        <Footer jurisdiction={user.jurisdiction} />
      </div>

      {isMobile && (
        <div style={styles.bottomNav}>
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.path}
              style={{ ...styles.bottomNavItem, ...(activeNav === item.id ? styles.bottomNavItemActive : {}) }}
              onClick={() => setActiveNav(item.id)}
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

      {!isMobile && (
        <>
          <button style={styles.feedbackBtn} onClick={() => setShowFeedback(true)}>
            <MessageSquare size={16} />
            <span>Feedback</span>
          </button>
          {showFeedback && (
            <div style={styles.feedbackModal}>
              <h4 style={{ margin: '0 0 12px 0', color: '#1e293b' }}>Got a suggestion?</h4>
              {feedbackSent ? <p style={{ color: '#16a34a' }}>Thanks for your feedback!</p> : (
                <>
                  <textarea style={styles.feedbackInput} placeholder="Tell us how we can improve..." value={feedback} onChange={(e) => setFeedback(e.target.value)} />
                  <div style={styles.feedbackActions}>
                    <button onClick={() => setShowFeedback(false)} style={styles.cancelBtn}>Cancel</button>
                    <button onClick={handleFeedback} style={styles.submitBtn}>Send</button>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles = {
  appContainer: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif", backgroundColor: '#f1f5f9' },
  sidebar: { width: '220px', minHeight: '100vh', background: 'linear-gradient(180deg, #0f172a 0%, #1e3a5f 100%)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 },
  sidebarLogo: { padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' },
  logoLink: { textDecoration: 'none' },
  logoText: { color: '#38bdf8', fontSize: '22px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  logoTextMobile: { color: '#38bdf8', fontSize: '20px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  sidebarNav: { flex: 1, padding: '16px 0' },
  navItem: { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '14px', fontWeight: '500', borderLeft: '3px solid transparent' },
  navItemActive: { color: 'white', backgroundColor: 'rgba(56,189,248,0.15)', borderLeft: '3px solid #38bdf8' },
  navIcon: { display: 'flex', alignItems: 'center' },
  sidebarLogout: { display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px', color: 'rgba(255,255,255,0.5)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%' },
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' },
  mainContentMobile: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarMobile: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  pageTitle: { margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' },
  jurisdiction: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '12px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500' },
  topBarRight: { display: 'flex', alignItems: 'center', gap: '12px' },
  greeting: { color: '#64748b', fontSize: '14px' },
  bellBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', padding: '4px' },
  exportBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: '#f0f9ff', color: '#0369a1', border: '1px solid #bae6fd', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  notificationBanner: { padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0' },
  notificationClose: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#64748b', flexShrink: 0 },
  heroBanner: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', padding: '32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroBannerMobile: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', padding: '24px 16px' },
  heroLeft: {},
  heroLabel: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' },
  heroAmount: { fontSize: '42px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-2px', lineHeight: 1 },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 },
  heroRight: { display: 'flex', gap: '12px' },
  heroStat: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  heroStatsMobile: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' },
  heroStatMobile: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px', border: '1px solid rgba(255,255,255,0.1)' },
  heroStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' },
  heroStatValue: { color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 },
  timeFilterBar: { display: 'flex', gap: '6px', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' },
  filterBtn: { padding: '5px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 },
  filterBtnActive: { backgroundColor: '#0ea5e9', color: 'white', border: '1px solid #0ea5e9' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px 28px 0 28px' },
  statsRowMobile: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', padding: '14px 16px 0 16px' },
  statCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #e2e8f0' },
  statLabel: { color: '#94a3b8', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' },
  statValue: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  statSub: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  limitsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 28px 0 28px' },
  limitsRowMobile: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px 0 16px' },
  limitCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  limitRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  limitLabel: { color: '#374151', fontWeight: '600', margin: 0, fontSize: '13px' },
  limitInputRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  limitInput: { width: '80px', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '13px' },
  limitCurrency: { color: '#64748b', fontSize: '13px' },
  progressBar: { height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginBottom: '6px' },
  progressFill: { height: '100%', borderRadius: '5px', transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' },
  progressLabel: { color: 'white', fontSize: '9px', fontWeight: '700' },
  limitText: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  emptyDashboard: { margin: '20px 28px 0 28px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  emptyDashboardMobile: { margin: '14px 16px 0 16px', backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  emptyDashboardContent: { padding: '48px 24px', textAlign: 'center' },
  emptyIconWrapper: { width: '72px', height: '72px', backgroundColor: '#f0f9ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' },
  emptyDashboardTitle: { color: '#0f172a', fontSize: '20px', fontWeight: '800', margin: '0 0 10px 0' },
  emptyDashboardText: { color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0', maxWidth: '360px', marginLeft: 'auto', marginRight: 'auto' },
  emptyDashboardBtn: { display: 'inline-block', padding: '12px 24px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  chartsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 28px 0 28px' },
  chartsRowMobile: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px 0 16px' },
  chartCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  sectionTitle: { color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 14px 0' },
  chartLegend: { display: 'flex', gap: '16px', marginTop: '10px', justifyContent: 'center' },
  legendItem: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b' },
  legendDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block' },
  tooltip: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' },
  tooltipTitle: { color: '#1e293b', fontWeight: '700', fontSize: '13px', margin: '0 0 6px 0' },
  tooltipRow: { color: '#64748b', fontSize: '12px', margin: '3px 0' },
  gameStatsCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '16px 28px 0 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  gameStatsCardMobile: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '12px 16px 0 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  gameStatsRow: { display: 'flex', flexDirection: 'column', gap: '10px' },
  gameStatItem: { display: 'flex', alignItems: 'center', gap: '10px' },
  gameStatName: { color: '#374151', fontSize: '13px', fontWeight: '600', margin: 0, width: '110px', flexShrink: 0 },
  gameStatAmount: { color: '#0f172a', fontSize: '13px', fontWeight: '700', margin: 0, width: '70px', flexShrink: 0 },
  gameStatBar: { flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  gameStatBarFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: '3px' },
  recommendedCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '16px 28px 0 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '2px dashed #e2e8f0' },
  recommendedCardMobile: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '12px 16px 0 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', border: '2px dashed #e2e8f0' },
  recommendedHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' },
  comingSoonBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '600' },
  recommendedText: { color: '#94a3b8', fontSize: '13px', margin: 0 },
  casinoSection: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '16px 28px 0 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  casinoSectionMobile: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '12px 16px 0 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  casinoListHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  addBtn: { backgroundColor: '#0ea5e9', color: 'white', padding: '8px 14px', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' },
  searchRow: { marginBottom: '14px' },
  searchWrapper: { position: 'relative', display: 'flex', alignItems: 'center' },
  searchIcon: { position: 'absolute', left: '12px' },
  searchInput: { width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc' },
  emptyState: { textAlign: 'center', padding: '32px 0' },
  emptyTitle: { color: '#1e293b', fontSize: '15px', fontWeight: '600', margin: '12px 0 6px 0' },
  emptyText: { color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0' },
  emptyAddBtn: { display: 'inline-block', padding: '8px 18px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', textDecoration: 'none', fontSize: '13px', fontWeight: '600' },
  casinoCard: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '10px', backgroundColor: '#fafafa' },
  casinoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  casinoNameRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  casinoAvatar: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '17px', fontWeight: '800', flexShrink: 0 },
  casinoNameLine: { display: 'flex', alignItems: 'center', gap: '6px' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block' },
  casinoName: { margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: '700' },
  lastActivity: { color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '2px' },
  casinoHeaderRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  casinoMobileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  streakRowDesktop: { marginBottom: '10px' },
  starRating: { display: 'flex', gap: '2px' },
  streakBadge: { display: 'flex', alignItems: 'center', gap: '4px', backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '4px 8px', borderRadius: '20px', fontWeight: '500' },
  casinoBarRow: { marginBottom: '8px' },
  barLabelRow: { display: 'flex', justifyContent: 'space-between', marginBottom: '3px' },
  barLabel: { color: '#94a3b8', fontSize: '10px' },
  casinoMiniBar: { height: '5px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '3px' },
  casinoBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  casinoStats: { display: 'flex', gap: '14px', color: '#64748b', fontSize: '12px', marginBottom: '10px', flexWrap: 'wrap' },
  casinoStatsMobile: { display: 'flex', gap: '10px', color: '#64748b', fontSize: '12px', marginBottom: '10px', flexWrap: 'wrap' },
  balanceRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  balanceLabel: { color: '#374151', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
  balanceInput: { width: '100px', padding: '6px 8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', backgroundColor: 'white' },
  noteInput: { width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '13px', color: '#64748b', boxSizing: 'border-box', backgroundColor: 'white', marginBottom: '8px' },
  casinoGameStats: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  gameTag: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavItemActive: { color: '#0ea5e9' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
  feedbackBtn: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '24px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 12px rgba(14,165,233,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', gap: '8px' },
  feedbackModal: { position: 'fixed', bottom: '80px', right: '24px', backgroundColor: 'white', borderRadius: '12px', padding: '20px', width: '300px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 200 },
  feedbackInput: { width: '100%', height: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', resize: 'none', boxSizing: 'border-box', marginBottom: '12px' },
  feedbackActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  cancelBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'white', fontSize: '13px' },
  submitBtn: { padding: '6px 14px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
};

export default Dashboard;
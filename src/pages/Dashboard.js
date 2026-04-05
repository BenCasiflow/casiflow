import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, User, Download, Bell, Search, Star, MessageSquare, LogOut, Plus, ChevronDown, ChevronUp, Trash2, Edit2, Check, X, Info, FileText, TrendingUp, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend } from 'recharts';
import { supabase } from '../supabaseClient';
import AddTransactionModal from '../components/AddTransactionModal';
import Footer from '../components/Footer';
import MonthlySummaryModal from '../components/MonthlySummaryModal';
import { getCurrencyCode, getCurrencySymbol } from '../utils/currency';

function getDateRange(filter) {
  const now = new Date();
  let start, end;
  switch (filter) {
    case 'Last 24hrs':
      start = new Date(now);
      start.setHours(now.getHours() - 24, now.getMinutes(), now.getSeconds(), 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'Last Week':
      start = new Date(now);
      start.setDate(now.getDate() - 7);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'This Month':
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'Last Month':
      // First day of last month
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      // Last day of last month = day 0 of current month
      end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
      break;
    case 'Last 3 Months':
      start = new Date(now);
      start.setMonth(now.getMonth() - 3);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'Last 6 Months':
      start = new Date(now);
      start.setMonth(now.getMonth() - 6);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'Last Year':
      start = new Date(now);
      start.setFullYear(now.getFullYear() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(now);
      end.setHours(23, 59, 59, 999);
      break;
    case 'All Time':
    default:
      return null;
  }
  return { start, end };
}

function filterByDateRange(transactions, range) {
  if (!range) return transactions;
  return transactions.filter(t => {
    const d = new Date(t.date);
    return d >= range.start && d <= range.end;
  });
}

function calcTotals(transactions) {
  const deposits = transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + Number(t.amount), 0);
  const withdrawals = transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + Number(t.amount), 0);
  const bonuses = transactions.filter(t => t.type === 'bonus').reduce((sum, t) => sum + Number(t.amount), 0);
  return { deposits, withdrawals, bonuses };
}

// Compute the data needed for a monthly or annual summary modal.
// Runs outside the component so it never triggers hook rules.
function computeSummaryData(allTransactions, goals, casinos, profile) {
  const now = new Date();
  const isJanuary = now.getMonth() === 0;

  let start, end, type, periodLabel;

  if (isJanuary) {
    type = 'annual';
    const year = now.getFullYear() - 1;
    start = new Date(year, 0, 1, 0, 0, 0, 0);
    end = new Date(year, 11, 31, 23, 59, 59, 999);
    periodLabel = String(year);
  } else {
    type = 'monthly';
    start = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
    const monthName = start.toLocaleDateString('en-GB', { month: 'long' });
    periodLabel = `${monthName} ${start.getFullYear()}`;
  }

  const periodTransactions = allTransactions.filter(t => {
    if (t.entry_method === 'lifetime') return false;
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const totalDeposited = periodTransactions
    .filter(t => t.type === 'deposit')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalWithdrawn = periodTransactions
    .filter(t => t.type === 'withdrawal')
    .reduce((s, t) => s + Number(t.amount), 0);
  const netResult = totalWithdrawn - totalDeposited;

  // Best casino — highest net (withdrawals − deposits) across the period
  let bestCasino = null;
  let bestNet = -Infinity;
  for (const casino of casinos) {
    const ct = periodTransactions.filter(t => t.casino_id === casino.id);
    if (ct.length === 0) continue;
    const deps = ct.filter(t => t.type === 'deposit').reduce((s, t) => s + Number(t.amount), 0);
    const withs = ct.filter(t => t.type === 'withdrawal').reduce((s, t) => s + Number(t.amount), 0);
    const net = withs - deps;
    if (net > bestNet) { bestNet = net; bestCasino = casino.name; }
  }

  // Goals created during this period
  const periodGoals = goals.filter(g => {
    const created = new Date(g.created_at);
    return created >= start && created <= end;
  });
  const goalsCompleted = periodGoals.filter(g => g.status === 'completed').length;
  const goalsTotal = periodGoals.length;

  // Limits check (monthly only)
  const depositLimit = type === 'monthly' ? (Number(profile?.monthly_deposit_limit) || 0) : 0;
  const netLossLimit = type === 'monthly' ? (Number(profile?.monthly_net_loss_limit) || 0) : 0;
  const withinDepositLimit = depositLimit > 0 ? totalDeposited <= depositLimit : null;
  const withinNetLossLimit = netLossLimit > 0
    ? Math.max(0, totalDeposited - totalWithdrawn) <= netLossLimit
    : null;

  return {
    type, periodLabel, netResult, totalDeposited, totalWithdrawn,
    bestCasino, goalsCompleted, goalsTotal,
    withinDepositLimit, withinNetLossLimit, depositLimit, netLossLimit,
  };
}

function Dashboard({ user, profile, onLogout, onUpdateProfile }) {
  const [casinos, setCasinos] = useState([]);
  const [allTransactions, setAllTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [monthlyDepositLimit, setMonthlyDepositLimit] = useState(0);
  const [monthlyNetLossLimit, setMonthlyNetLossLimit] = useState(0);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [casinoFilters, setCasinoFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);
  const [expandedCasinos, setExpandedCasinos] = useState({});
  const [addTransactionCasino, setAddTransactionCasino] = useState(null);
  const [editingCasinoId, setEditingCasinoId] = useState(null);
  const [editingCasinoName, setEditingCasinoName] = useState('');
  const [deletingCasinoId, setDeletingCasinoId] = useState(null);
  const [goals, setGoals] = useState([]);
  const [goalsExpanded, setGoalsExpanded] = useState(true);
  const [showLogSessionPicker, setShowLogSessionPicker] = useState(false);
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const summaryCheckedRef = useRef(false);

  const navigate = useNavigate();
  const firstName = sessionStorage.getItem('userFirstName') || profile?.full_name?.split(' ')[0] || '';

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (profile) {
      setMonthlyDepositLimit(profile.monthly_deposit_limit || 0);
      setMonthlyNetLossLimit(profile.monthly_net_loss_limit || 0);
    }
  }, [profile]);

  const fetchCasinos = useCallback(async () => {
    setLoading(true);
    const { data: casinosData, error: casinosError } = await supabase
      .from('casinos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (casinosError || !casinosData || casinosData.length === 0) {
      setCasinos([]);
      setAllTransactions([]);
      setLoading(false);
      return;
    }

    const { data: transactionsData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    const { data: gamesData } = await supabase
      .from('favourite_games')
      .select('*')
      .eq('user_id', user.id);

    const transactions = transactionsData || [];
    setAllTransactions(transactions);

    const enrichedCasinos = casinosData.map(casino => {
      const casinoTransactions = transactions.filter(t => t.casino_id === casino.id);
      const casinoGames = (gamesData || []).filter(g => g.casino_id === casino.id);

      const lastTransaction = [...casinoTransactions].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
      const lastActivity = lastTransaction
        ? new Date(lastTransaction.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'No transactions yet';

      const gameStats = casinoGames.map(g => ({
        game: g.specific_game || g.game_type,
        amount: Number(g.amount_wagered) || 0,
      }));

      const hasOnlyLifetime = casinoTransactions.length > 0 &&
        casinoTransactions.every(t => t.entry_method === 'lifetime');

      return {
        id: casino.id,
        name: casino.casino_name,
        note: casino.note || '',
        currentBalance: Number(casino.current_balance) || 0,
        rating: casino.rating || 0,
        transactions: casinoTransactions,
        lastActivity,
        gameStats,
        hasOnlyLifetime,
      };
    });

    setCasinos(enrichedCasinos);

    const initialFilters = {};
    casinosData.forEach(c => { initialFilters[c.id] = 'All Time'; });
    setCasinoFilters(prev => {
      const merged = { ...initialFilters };
      Object.keys(prev).forEach(k => { if (merged[k] !== undefined) merged[k] = prev[k]; });
      return merged;
    });

    setLoading(false);
  }, [user.id]);

  const fetchGoals = useCallback(async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setGoals(data || []);
  }, [user.id]);

  useEffect(() => {
    fetchCasinos();
    fetchGoals();
  }, [fetchCasinos, fetchGoals]);

  // Check whether to show the monthly/annual summary modal.
  // Runs once after data has loaded. The ?showSummary=true URL param
  // forces the modal open (testing only — remove before final deployment).
  useEffect(() => {
    if (loading) return;
    if (!profile) return;
    if (summaryCheckedRef.current) return;
    summaryCheckedRef.current = true;

    const isTestMode = new URLSearchParams(window.location.search).get('showSummary') === 'true';

    if (!isTestMode) {
      const lastShown = profile.last_summary_shown;
      if (lastShown) {
        const now = new Date();
        const last = new Date(lastShown);
        if (now.getMonth() === last.getMonth() && now.getFullYear() === last.getFullYear()) {
          return; // Already shown this month
        }
      }
    }

    const data = computeSummaryData(allTransactions, goals, casinos, profile);
    setSummaryData(data);
    setShowSummaryModal(true);
  }, [loading, profile, allTransactions, goals, casinos]); // eslint-disable-line

  const handleSummaryClose = async () => {
    setShowSummaryModal(false);
    if (!summaryData) return;

    const isTestMode = new URLSearchParams(window.location.search).get('showSummary') === 'true';

    // Persist the summary record for the History tab
    try {
      await supabase.from('summaries').insert({
        user_id: user.id,
        period_type: summaryData.type,
        period_label: summaryData.periodLabel,
        net_result: summaryData.netResult,
        total_deposited: summaryData.totalDeposited,
        total_withdrawn: summaryData.totalWithdrawn,
        best_casino: summaryData.bestCasino,
        goals_completed: summaryData.goalsCompleted,
        goals_total: summaryData.goalsTotal,
      });
    } catch (_) {
      // Non-blocking — summaries table may not exist yet
    }

    // Update last_summary_shown so we don't re-show this month
    // Skip in test mode so ?showSummary=true keeps working on repeated visits
    if (!isTestMode) {
      try {
        const today = new Date().toISOString().split('T')[0];
        const { data } = await supabase
          .from('profiles')
          .update({ last_summary_shown: today })
          .eq('id', user.id)
          .select()
          .single();
        if (data) onUpdateProfile(data);
      } catch (_) {
        // Non-blocking
      }
    }
  };

  useEffect(() => {
    if (!profile) return;
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('profiles')
        .update({ monthly_deposit_limit: monthlyDepositLimit || null, monthly_net_loss_limit: monthlyNetLossLimit || null })
        .eq('id', user.id)
        .select()
        .single();
      if (!error && data) onUpdateProfile(data);
    }, 1000);
    return () => clearTimeout(timer);
  }, [monthlyDepositLimit, monthlyNetLossLimit]); // eslint-disable-line

  const noteValues = casinos.map(c => c.note).join(',');
  useEffect(() => {
    if (casinos.length === 0) return;
    const timer = setTimeout(async () => {
      for (const casino of casinos) {
        await supabase.from('casinos').update({ note: casino.note }).eq('id', casino.id);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [noteValues]); // eslint-disable-line

  const balanceValues = casinos.map(c => c.currentBalance).join(',');
  useEffect(() => {
    if (casinos.length === 0) return;
    const timer = setTimeout(async () => {
      for (const casino of casinos) {
        await supabase.from('casinos').update({ current_balance: casino.currentBalance }).eq('id', casino.id);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [balanceValues]); // eslint-disable-line

  const updateNote = (id, note) => setCasinos(prev => prev.map(c => c.id === id ? { ...c, note } : c));
  const updateRating = async (id, rating) => {
    setCasinos(prev => prev.map(c => c.id === id ? { ...c, rating } : c));
    await supabase.from('casinos').update({ rating }).eq('id', id);
  };

  const handleDeleteTransaction = async (transactionId, casinoId) => {
    const { error } = await supabase.from('transactions').delete().eq('id', transactionId);
    if (!error) {
      setAllTransactions(prev => prev.filter(t => t.id !== transactionId));
      setCasinos(prev => prev.map(c => c.id === casinoId
        ? { ...c, transactions: c.transactions.filter(t => t.id !== transactionId) }
        : c
      ));
    }
  };

  const handleDeleteCasino = async (casinoId) => {
    const { error } = await supabase.from('casinos').delete().eq('id', casinoId);
    if (!error) {
      setCasinos(prev => prev.filter(c => c.id !== casinoId));
      setAllTransactions(prev => prev.filter(t => t.casino_id !== casinoId));
      setDeletingCasinoId(null);
    }
  };

  const handleSaveCasinoName = async (casinoId) => {
    if (!editingCasinoName.trim()) return;
    const { error } = await supabase.from('casinos').update({ casino_name: editingCasinoName.trim() }).eq('id', casinoId);
    if (!error) {
      setCasinos(prev => prev.map(c => c.id === casinoId ? { ...c, name: editingCasinoName.trim() } : c));
      setEditingCasinoId(null);
      setEditingCasinoName('');
    }
  };

  const toggleExpanded = (casinoId) => {
    setExpandedCasinos(prev => ({ ...prev, [casinoId]: !prev[casinoId] }));
  };

  const currency = getCurrencyCode(profile);
  const symbol = getCurrencySymbol(profile);
  const timeFilters = ['All Time', 'Last 24hrs', 'Last Week', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months', 'Last Year'];

  const globalRange = useMemo(() => getDateRange(timeFilter), [timeFilter]);
  const isAllTime = timeFilter === 'All Time';

  // For All Time: include all transactions (dated + lifetime).
  // For any other filter: include only dated (non-lifetime) transactions within
  // the selected period. Lifetime totals are stored against today's date and have
  // no meaningful period association, so they must be excluded from period views.
  const summaryTransactions = useMemo(() => {
    if (isAllTime) return allTransactions;
    return allTransactions.filter(t => t.entry_method !== 'lifetime' && (() => {
      const d = new Date(t.date);
      return d >= globalRange.start && d <= globalRange.end;
    })());
  }, [allTransactions, isAllTime, globalRange]);

  // currentMonthTransactions: always the current calendar month, always excludes
  // lifetime entries. Used exclusively for the deposit and net loss limit trackers
  // so they remain independent of whichever dashboard time filter is selected.
  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return allTransactions.filter(t => {
      if (t.entry_method === 'lifetime') return false;
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }, [allTransactions]);

  const globalTotals = useMemo(() => calcTotals(summaryTransactions), [summaryTransactions]);
  const currentMonthTotals = useMemo(() => calcTotals(currentMonthTransactions), [currentMonthTransactions]);

  const totalCurrentBalance = casinos.reduce((sum, c) => sum + c.currentBalance, 0);
  // Monthly net loss = deposits this month minus withdrawals this month.
  // Balance is a current snapshot across all time and is not factored in here.
  const monthlyNetLoss = currentMonthTotals.deposits - currentMonthTotals.withdrawals;
  // All Time net: withdrawals + current balance - deposits (balance is meaningful here).
  // Period net: withdrawals - deposits only (balance is a current snapshot, not period performance).
  const netResult = isAllTime
    ? globalTotals.withdrawals + totalCurrentBalance - globalTotals.deposits
    : globalTotals.withdrawals - globalTotals.deposits;

  const depositLimitPercent = monthlyDepositLimit > 0 ? Math.min((currentMonthTotals.deposits / monthlyDepositLimit) * 100, 100) : 0;
  const netLossLimitPercent = monthlyNetLossLimit > 0 ? Math.min((Math.max(0, monthlyNetLoss) / monthlyNetLossLimit) * 100, 100) : 0;

  const hasLifetimeOnlyCasinos = casinos.some(c => c.hasOnlyLifetime);
  const allCasinosAreLifetimeOnly = casinos.length > 0 && casinos.every(c => c.hasOnlyLifetime);

  const casinoSummaries = useMemo(() => {
    return casinos.map(c => {
      // For non-All Time filters, exclude lifetime transactions from the card totals.
      // They have no period date association and would distort the period view.
      const filtered = isAllTime
        ? filterByDateRange(c.transactions, globalRange)
        : filterByDateRange(c.transactions.filter(t => t.entry_method !== 'lifetime'), globalRange);
      const totals = calcTotals(filtered);
      return { ...c, ...totals };
    });
  }, [casinos, globalRange, isAllTime]);

  const mostPlayed = casinoSummaries.length > 0 ? [...casinoSummaries].sort((a, b) => b.deposits - a.deposits)[0] : null;
  const mostProfitable = casinoSummaries.length > 0 ? [...casinoSummaries].sort((a, b) => (b.withdrawals + b.currentBalance - b.deposits) - (a.withdrawals + a.currentBalance - a.deposits))[0] : null;

  const chartData = casinoSummaries.map(c => ({ name: c.name, Deposits: c.deposits, Withdrawals: c.withdrawals }));

  const trendData = useMemo(() => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const label = d.toLocaleDateString('en-GB', { month: 'short' });
      const year = d.getFullYear();
      const month = d.getMonth();
      const monthTransactions = allTransactions.filter(t => {
        const td = new Date(t.date);
        return td.getMonth() === month && td.getFullYear() === year && t.entry_method !== 'lifetime';
      });
      const totals = calcTotals(monthTransactions);
      months.push({ month: label, deposits: totals.deposits, withdrawals: totals.withdrawals });
    }
    return months;
  }, [allTransactions]);

  const filteredCasinos = casinoSummaries.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const getNotificationMessage = (percent, type) => {
    if (percent >= 100) return type === 'deposit' ? 'You have reached your monthly deposit limit.' : 'You have reached your monthly net loss limit.';
    if (percent >= 80) return type === 'deposit' ? 'Almost at your limit — 80% of your monthly deposit budget used.' : 'Almost at your limit — 80% of your monthly net loss budget used.';
    if (percent >= 50) return type === 'deposit' ? '50% of your monthly deposit limit used.' : '50% of your monthly net loss limit used.';
    return null;
  };

  const depositNotification = getNotificationMessage(depositLimitPercent, 'deposit');
  const netLossNotification = getNotificationMessage(netLossLimitPercent, 'netloss');
  const activeNotification = netLossNotification || depositNotification;

  const handleExportReport = () => {
    const reportData = [
      ['Casiflow Report'],
      ['Generated:', new Date().toLocaleDateString()],
      ['Player:', profile?.full_name || user.email],
      ['Period:', timeFilter],
      [],
      ['Summary'],
      ['Total Deposited:', `${symbol}${globalTotals.deposits}`],
      ['Total Withdrawn:', `${symbol}${globalTotals.withdrawals}`],
      ['Net Result:', `${netResult >= 0 ? '+' : '-'}${symbol}${Math.abs(netResult)}`],
      [],
      ['Casino Breakdown'],
      ['Casino', 'Deposited', 'Withdrawn', 'Bonus', 'Current Balance', 'Net Result'],
      ...casinoSummaries.map(c => [c.name, `${symbol}${c.deposits}`, `${symbol}${c.withdrawals}`, `${symbol}${c.bonuses}`, `${symbol}${c.currentBalance}`, `${c.withdrawals + c.currentBalance - c.deposits >= 0 ? '+' : '-'}${symbol}${Math.abs(c.withdrawals + c.currentBalance - c.deposits)}`])
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

  const handleFeedback = () => {
    if (feedback.trim()) {
      setFeedbackSent(true);
      setFeedback('');
      setTimeout(() => { setShowFeedback(false); setFeedbackSent(false); }, 2000);
    }
  };

  const getAvatarColor = (name) => {
    const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
  ];

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

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', fontFamily: 'Segoe UI, Arial, sans-serif', color: '#64748b' }}>
      Loading your dashboard...
    </div>
  );

  return (
    <div style={styles.appContainer}>
      {showSummaryModal && summaryData && (
        <MonthlySummaryModal
          summary={summaryData}
          symbol={symbol}
          onClose={handleSummaryClose}
        />
      )}

      {addTransactionCasino && (
        <AddTransactionModal
          casino={addTransactionCasino}
          userId={user.id}
          currency={currency}
          onClose={() => setAddTransactionCasino(null)}
          onSaved={() => { setAddTransactionCasino(null); fetchCasinos(); }}
        />
      )}

      {showLogSessionPicker && (
        <div style={styles.modalOverlay} onClick={() => setShowLogSessionPicker(false)}>
          <div style={styles.logSessionPicker} onClick={e => e.stopPropagation()}>
            <div style={styles.logSessionPickerHeader}>
              <h3 style={styles.logSessionPickerTitle}>Which casino?</h3>
              <button style={styles.logSessionPickerClose} onClick={() => setShowLogSessionPicker(false)}>
                <X size={18} color="#64748b" />
              </button>
            </div>
            <div style={styles.logSessionPickerList}>
              {casinos.map(c => (
                <button
                  key={c.id}
                  style={styles.logSessionCasinoBtn}
                  onClick={() => { setShowLogSessionPicker(false); setAddTransactionCasino(c); }}
                >
                  <div style={{ ...styles.casinoAvatar, backgroundColor: getAvatarColor(c.name), width: '32px', height: '32px', fontSize: '14px', flexShrink: 0 }}>
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <span style={styles.logSessionCasinoName}>{c.name}</span>
                </button>
              ))}
              <button
                style={styles.logSessionNewCasinoBtn}
                onClick={() => { setShowLogSessionPicker(false); navigate('/add-casino'); }}
              >
                <Plus size={14} color="#0ea5e9" />
                <span>+ New Casino</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {deletingCasinoId && (
        <div style={styles.modalOverlay}>
          <div style={styles.confirmModal}>
            <h3 style={styles.confirmTitle}>Delete Casino</h3>
            <p style={styles.confirmText}>Are you sure you want to delete this casino and all its transactions? This cannot be undone.</p>
            <div style={styles.confirmActions}>
              <button style={styles.confirmCancelBtn} onClick={() => setDeletingCasinoId(null)}>Cancel</button>
              <button style={styles.confirmDeleteBtn} onClick={() => handleDeleteCasino(deletingCasinoId)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {!isMobile && (
        <div style={styles.sidebar}>
          <div style={styles.sidebarLogo}>
            <Link to="/dashboard" style={styles.logoLink}>
              <h1 style={styles.logoText}>Casiflow</h1>
            </Link>
          </div>
          <nav style={styles.sidebarNav}>
            {navItems.map(item => (
              <Link key={item.id} to={item.path} style={{ ...styles.navItem, ...(activeNav === item.id ? styles.navItemActive : {}) }} onClick={() => setActiveNav(item.id)}>
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
            {!isMobile && <h2 style={styles.pageTitle}>Dashboard</h2>}
            {!isMobile && <span style={styles.jurisdiction}>{profile?.country || 'Global'}</span>}
          </div>
          <div style={styles.topBarRight}>
            {!isMobile && (
              <button style={styles.logSessionTopBarBtn} onClick={() => setShowLogSessionPicker(true)}>
                <Plus size={14} />
                <span>Just played? Log the Session</span>
              </button>
            )}
            {!isMobile && (
              <button onClick={handleExportReport} style={styles.exportBtn}>
                <Download size={14} />
                <span>Export Report</span>
              </button>
            )}
            {!isMobile && profile && <span style={styles.greeting}>Hi, {firstName}</span>}
            <button style={styles.bellBtn}><Bell size={18} /></button>
          </div>
        </div>

        {activeNotification && showNotification && (
          <div style={{ ...styles.notificationBanner, backgroundColor: netLossLimitPercent >= 100 || depositLimitPercent >= 100 ? '#fef2f2' : '#fffbeb' }}>
            <span style={{ fontSize: '13px', color: netLossLimitPercent >= 100 || depositLimitPercent >= 100 ? '#dc2626' : '#92400e' }}>
              ⚠️ {activeNotification}
            </span>
            <button onClick={() => setShowNotification(false)} style={styles.notificationClose}>✕</button>
          </div>
        )}


        <div style={isMobile ? styles.heroBannerMobile : styles.heroBanner}>
          <div style={styles.heroLeft}>
            {casinos.length > 0 && <p style={isMobile ? styles.heroLabelMobile : styles.heroLabel}>{timeFilter === 'All Time' ? 'All time you are' : `${timeFilter} you are`}</p>}
            <h2 style={{ ...styles.heroAmount, color: casinos.length === 0 ? 'rgba(255,255,255,0.95)' : netResult >= 0 ? '#4ade80' : '#f87171', ...(casinos.length === 0 && { fontSize: isMobile ? '21px' : '26px', letterSpacing: '-0.5px', lineHeight: '1.3' }), ...(isMobile && casinos.length > 0 && { fontSize: '34px', margin: '0 0 4px 0' }) }}>
              {casinos.length === 0 ? 'Because the house always knows its numbers.' : `${netResult >= 0 ? '+' : '-'}${symbol}${Math.abs(netResult).toLocaleString()}`}
            </h2>
            <p style={{ ...styles.heroSub, ...(casinos.length === 0 && { color: '#0ea5e9', fontWeight: '600', fontSize: '14px' }) }}>
              {casinos.length === 0 ? 'Now you can too.' : `across ${casinos.length} casinos`}
            </p>
            {casinos.length === 0 && <p style={styles.emptyHeroSubtitle}>All your casinos. One dashboard.</p>}
          </div>
          {!isMobile && (
            <div style={styles.heroRight}>
              <div style={styles.heroStat}><p style={styles.heroStatLabel}>Deposit Limit</p><p style={styles.heroStatValue}>{symbol}{monthlyDepositLimit.toLocaleString()}</p></div>
              <div style={styles.heroStat}><p style={styles.heroStatLabel}>Net Loss Limit</p><p style={styles.heroStatValue}>{symbol}{monthlyNetLossLimit.toLocaleString()}</p></div>
              <div style={styles.heroStat}><p style={styles.heroStatLabel}>Most Played</p><p style={styles.heroStatValue}>{mostPlayed?.name || '—'}</p></div>
              <div style={styles.heroStat}><p style={styles.heroStatLabel}>Most Profitable</p><p style={styles.heroStatValue}>{mostProfitable?.name || '—'}</p></div>
            </div>
          )}
          {isMobile && casinos.length > 0 && (
            <div style={styles.heroStatsMobile}>
              <div style={styles.heroStatMobile}><p style={styles.heroStatLabel}>Most Played</p><p style={styles.heroStatValueMobile}>{mostPlayed?.name || '—'}</p></div>
              <div style={styles.heroStatMobile}><p style={styles.heroStatLabel}>Most Profitable</p><p style={styles.heroStatValueMobile}>{mostProfitable?.name || '—'}</p></div>
            </div>
          )}
          {isMobile && casinos.length > 0 && (
            <button style={styles.logSessionHeroBtn} onClick={() => setShowLogSessionPicker(true)}>
              <Plus size={14} />
              <span>Just played? Log the Session</span>
            </button>
          )}
        </div>

        <div style={styles.timeFilterBar}>
          {timeFilters.map(f => (
            <button key={f} style={{ ...styles.filterBtn, ...(timeFilter === f ? styles.filterBtnActive : {}) }} onClick={() => setTimeFilter(f)}>{f}</button>
          ))}
        </div>

        {!(isMobile && casinos.length === 0) && <div style={isMobile ? styles.statsRowMobile : styles.statsRow}>
          <div style={isMobile ? styles.statCardMobile : styles.statCard}>
            <p style={isMobile ? styles.statLabelMobile : styles.statLabel}>Total Deposited</p>
            <p style={isMobile ? styles.statValueMobile : styles.statValue}>{symbol}{globalTotals.deposits.toLocaleString()}</p>
            <p style={isMobile ? styles.statSubMobile : styles.statSub}>across {casinos.length} casinos</p>
          </div>
          <div style={isMobile ? styles.statCardMobile : styles.statCard}>
            <p style={isMobile ? styles.statLabelMobile : styles.statLabel}>Total Withdrawn</p>
            <p style={isMobile ? styles.statValueMobile : styles.statValue}>{symbol}{globalTotals.withdrawals.toLocaleString()}</p>
            <p style={isMobile ? styles.statSubMobile : styles.statSub}>total cashouts</p>
          </div>
          <div style={{ ...(isMobile ? styles.statCardMobile : styles.statCard), backgroundColor: netResult >= 0 ? '#f0fdf4' : '#fef2f2', borderLeft: `4px solid ${netResult >= 0 ? '#22c55e' : '#ef4444'}` }}>
            <p style={isMobile ? styles.statLabelMobile : styles.statLabel}>Net Result</p>
            <p style={{ ...(isMobile ? styles.statValueMobile : styles.statValue), color: netResult >= 0 ? '#16a34a' : '#dc2626' }}>
              {casinos.length === 0 ? `${symbol}0` : `${netResult >= 0 ? '+' : '-'}${symbol}${Math.abs(netResult).toLocaleString()}`}
            </p>
            <p style={isMobile ? styles.statSubMobile : styles.statSub}>{netResult >= 0 ? 'you are up' : 'you are down'}</p>
          </div>
          <div style={{ ...(isMobile ? styles.statCardMobile : styles.statCard), backgroundColor: '#f0f9ff', borderLeft: '4px solid #0ea5e9' }}>
            <p style={isMobile ? styles.statLabelMobile : styles.statLabel}>Total Balance</p>
            <p style={{ ...(isMobile ? styles.statValueMobile : styles.statValue), color: '#0369a1' }}>{symbol}{totalCurrentBalance.toLocaleString()}</p>
            <p style={isMobile ? styles.statSubMobile : styles.statSub}>across all casinos</p>
          </div>
        </div>}

        {!isAllTime && casinos.length > 0 && hasLifetimeOnlyCasinos && (
          <div style={isMobile ? styles.lifetimeFilterBannerMobile : styles.lifetimeFilterBanner}>
            <Info size={16} color="#0369a1" style={{ flexShrink: 0, marginTop: '1px' }} />
            <p style={styles.lifetimeFilterBannerText}>
              {allCasinosAreLifetimeOnly
                ? <>You have no dated transactions for this period. Your lifetime totals are visible under <button style={styles.lifetimeFilterBannerLink} onClick={() => setTimeFilter('All Time')}>All Time</button>.</>
                : <>Some casinos use lifetime totals and are not included in this period filter. <button style={styles.lifetimeFilterBannerLink} onClick={() => setTimeFilter('All Time')}>Switch to All Time</button> to see your complete picture.</>
              }
            </p>
          </div>
        )}

        {!(isMobile && casinos.length === 0) && <div style={isMobile ? styles.limitsRowMobile : styles.limitsRow}>
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
            <p style={styles.limitText}>{symbol}{currentMonthTotals.deposits.toLocaleString()} deposited this month of {symbol}{monthlyDepositLimit.toLocaleString()} limit (current month only)</p>
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
            <p style={styles.limitText}>{symbol}{Math.max(0, monthlyNetLoss).toLocaleString()} net loss this month of {symbol}{monthlyNetLossLimit.toLocaleString()} limit (current month only)</p>
          </div>
        </div>}

        {casinos.length === 0 ? (
          <div style={isMobile ? styles.emptyDashboardMobile : styles.emptyDashboard}>
            <div style={isMobile ? styles.emptyDashboardContentMobile : styles.emptyDashboardContent}>
              <h3 style={isMobile ? styles.emptyDashboardTitleMobile : styles.emptyDashboardTitle}>Welcome to Casiflow, {firstName}!</h3>
              <p style={isMobile ? styles.emptyDashboardTextMobile : styles.emptyDashboardText}>Here's how to get started in three simple steps.</p>
              <div style={isMobile ? styles.emptyStepsColumnMobile : styles.emptyStepsRow}>
                <div style={isMobile ? styles.emptyStepCardMobile : styles.emptyStepCard}>
                  <div style={isMobile ? styles.emptyStepIconMobile : styles.emptyStepIcon}><Building2 size={isMobile ? 18 : 26} color="#0ea5e9" /></div>
                  <div style={isMobile ? styles.emptyStepTextMobile : undefined}>
                    <p style={isMobile ? styles.emptyStepNumberMobile : styles.emptyStepNumber}>Step 1</p>
                    <p style={isMobile ? styles.emptyStepTitleMobile : styles.emptyStepTitle}>Add Your Casinos</p>
                    <p style={isMobile ? styles.emptyStepDescMobile : styles.emptyStepDesc}>Add each casino where you have an account.</p>
                  </div>
                </div>
                <div style={isMobile ? styles.emptyStepCardMobile : styles.emptyStepCard}>
                  <div style={isMobile ? styles.emptyStepIconMobile : styles.emptyStepIcon}><FileText size={isMobile ? 18 : 26} color="#0ea5e9" /></div>
                  <div style={isMobile ? styles.emptyStepTextMobile : undefined}>
                    <p style={isMobile ? styles.emptyStepNumberMobile : styles.emptyStepNumber}>Step 2</p>
                    <p style={isMobile ? styles.emptyStepTitleMobile : styles.emptyStepTitle}>Log Your Activity</p>
                    <p style={isMobile ? styles.emptyStepDescMobile : styles.emptyStepDesc}>Record deposits, withdrawals and your current balance.</p>
                  </div>
                </div>
                <div style={isMobile ? styles.emptyStepCardMobile : styles.emptyStepCard}>
                  <div style={isMobile ? styles.emptyStepIconMobile : styles.emptyStepIcon}><TrendingUp size={isMobile ? 18 : 26} color="#0ea5e9" /></div>
                  <div style={isMobile ? styles.emptyStepTextMobile : undefined}>
                    <p style={isMobile ? styles.emptyStepNumberMobile : styles.emptyStepNumber}>Step 3</p>
                    <p style={isMobile ? styles.emptyStepTitleMobile : styles.emptyStepTitle}>Track Your Position</p>
                    <p style={isMobile ? styles.emptyStepDescMobile : styles.emptyStepDesc}>Track your wins, losses and trends per casino. For the first time, you'll know exactly where you stand.</p>
                  </div>
                </div>
              </div>
              <Link to="/add-casino" style={isMobile ? styles.emptyDashboardBtnMobile : styles.emptyDashboardBtn}>+ Add Your First Casino</Link>
              <div style={isMobile ? styles.emptyStateTipMobile : styles.emptyStateTip}>
                <Target size={13} color="#0ea5e9" style={{ flexShrink: 0, marginTop: '1px' }} />
                <p style={styles.emptyStateTipText}>Pro tip: <Link to="/profile" style={styles.emptyStateTipLink}>Set your first goal in your Profile</Link> to stay on track with your gambling goals.</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={isMobile ? styles.chartsRowMobile : styles.chartsRow}>
              <div style={styles.chartCard}>
                <h3 style={styles.sectionTitle}>Deposits vs Withdrawals — {timeFilter}</h3>
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
                <h3 style={styles.sectionTitle}>Monthly Trend — Last 6 Months</h3>
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
            <p style={styles.emptyCasinosNote}>No casinos added yet</p>
          ) : filteredCasinos.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIconWrapper}><Search size={32} color="#94a3b8" /></div>
              <p style={styles.emptyTitle}>No casinos found</p>
              <p style={styles.emptyText}>Try a different search term</p>
            </div>
          ) : (
            filteredCasinos.map(casino => {
              const casinoFilter = casinoFilters[casino.id] || 'All Time';
              const casinoRange = getDateRange(casinoFilter);
              const casinoFiltered = filterByDateRange(casino.transactions, casinoRange);
              const casinoTotals = calcTotals(casinoFiltered);
              const casinoNetResult = casinoTotals.withdrawals + casino.currentBalance - casinoTotals.deposits;
              const isWinning = casinoNetResult >= 0;
              const maxAmount = casinoTotals.deposits + casinoTotals.withdrawals;
              const depositWidth = maxAmount > 0 ? (casinoTotals.deposits / maxAmount) * 100 : 0;
              const withdrawalWidth = maxAmount > 0 ? (casinoTotals.withdrawals / maxAmount) * 100 : 0;
              const avatarColor = getAvatarColor(casino.name);
              const isExpanded = expandedCasinos[casino.id] || false;
              const isEditingName = editingCasinoId === casino.id;

              return (
                <div key={casino.id} style={styles.casinoCard}>
                  <div style={styles.casinoHeader}>
                    <div style={styles.casinoNameRow}>
                      <div style={{ ...styles.casinoAvatar, backgroundColor: avatarColor }}>{casino.name.charAt(0).toUpperCase()}</div>
                      <div>
                        <div style={styles.casinoNameLine}>
                          {isEditingName ? (
                            <div style={styles.editNameRow}>
                              <input
                                style={styles.editNameInput}
                                value={editingCasinoName}
                                onChange={(e) => setEditingCasinoName(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') handleSaveCasinoName(casino.id); if (e.key === 'Escape') { setEditingCasinoId(null); setEditingCasinoName(''); } }}
                                autoFocus
                              />
                              <button style={styles.editActionBtn} onClick={() => handleSaveCasinoName(casino.id)}><Check size={14} color="#16a34a" /></button>
                              <button style={styles.editActionBtn} onClick={() => { setEditingCasinoId(null); setEditingCasinoName(''); }}><X size={14} color="#ef4444" /></button>
                            </div>
                          ) : (
                            <>
                              <h4 style={styles.casinoName}>{casino.name}</h4>
                              <span style={{ ...styles.statusDot, backgroundColor: isWinning ? '#22c55e' : '#ef4444' }} />
                              <button style={styles.editNameBtn} onClick={() => { setEditingCasinoId(casino.id); setEditingCasinoName(casino.name); }}>
                                <Edit2 size={12} color="#94a3b8" />
                              </button>
                            </>
                          )}
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
                    </div>
                  )}

                  <div style={styles.casinoFilterBar}>
                    {timeFilters.map(f => (
                      <button key={f} style={{ ...styles.casinoFilterBtn, ...(casinoFilter === f ? styles.casinoFilterBtnActive : {}) }} onClick={() => setCasinoFilters(prev => ({ ...prev, [casino.id]: f }))}>
                        {f}
                      </button>
                    ))}
                  </div>

                  {casino.hasOnlyLifetime && casinoFilter !== 'All Time' && (
                    <p style={styles.casinoLifetimeNote}>You have no dated transactions for this period. Your lifetime totals are visible under All Time.</p>
                  )}

                  <div style={styles.casinoBarRow}>
                    <div style={styles.casinoMiniBar}>
                      <div style={{ ...styles.casinoBarFill, width: `${depositWidth}%`, backgroundColor: '#0ea5e9' }} />
                    </div>
                    <div style={styles.casinoMiniBar}>
                      <div style={{ ...styles.casinoBarFill, width: `${withdrawalWidth}%`, backgroundColor: '#10b981' }} />
                    </div>
                    <div style={styles.barStatRow}>
                      <div style={styles.barStat}>
                        <span style={{ ...styles.barStatDot, backgroundColor: '#0ea5e9' }} />
                        <span style={styles.barStatLabel}>Deposits</span>
                        <span style={styles.barStatValue}>{symbol}{casinoTotals.deposits.toLocaleString()}</span>
                      </div>
                      <div style={styles.barStat}>
                        <span style={{ ...styles.barStatDot, backgroundColor: '#10b981' }} />
                        <span style={styles.barStatLabel}>Withdrawals</span>
                        <span style={styles.barStatValue}>{symbol}{casinoTotals.withdrawals.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div style={isMobile ? styles.casinoStatsMobile : styles.casinoStats}>
                    <span>Bonus: {symbol}{casinoTotals.bonuses.toLocaleString()}</span>
                    <span>Balance: {symbol}{casino.currentBalance.toLocaleString()}</span>
                    <span style={{ color: isWinning ? '#16a34a' : '#dc2626', fontWeight: '600' }}>
                      Net: {isWinning ? '+' : '-'}{symbol}{Math.abs(casinoNetResult).toLocaleString()}
                    </span>
                  </div>

                  <input style={styles.noteInput} placeholder="Add a note..." value={casino.note} onChange={(e) => updateNote(casino.id, e.target.value)} />

                  {casino.gameStats && casino.gameStats.length > 0 && (
                    <div style={styles.casinoGameStats}>
                      {casino.gameStats.map((g, i) => <span key={i} style={styles.gameTag}>{g.game}: {symbol}{g.amount}</span>)}
                    </div>
                  )}

                  <div style={styles.casinoActionsRow}>
                    <button style={styles.addTransactionBtn} onClick={() => setAddTransactionCasino(casino)}>
                      <Plus size={14} />
                      <span>Add Transaction</span>
                    </button>
                    <button style={styles.viewTransactionsBtn} onClick={() => toggleExpanded(casino.id)}>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      <span>{isExpanded ? 'Hide' : 'View'} Transactions ({casino.transactions.length})</span>
                    </button>
                    <button style={styles.deleteCasinoBtn} onClick={() => setDeletingCasinoId(casino.id)}>
                      <Trash2 size={14} />
                      {!isMobile && <span>Delete</span>}
                    </button>
                  </div>

                  {isExpanded && (
                    <div style={styles.transactionHistory}>
                      {casino.transactions.length === 0 ? (
                        <p style={styles.noTransactionsText}>No transactions yet.</p>
                      ) : (
                        <table style={styles.transactionTable}>
                          <thead>
                            <tr>
                              <th style={styles.transactionTh}>Date</th>
                              <th style={styles.transactionTh}>Type</th>
                              <th style={styles.transactionTh}>Amount</th>
                              <th style={styles.transactionTh}>Game</th>
                              <th style={styles.transactionTh}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {casino.transactions.map(t => (
                              <tr key={t.id}>
                                <td style={styles.transactionTd}>{new Date(t.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                <td style={styles.transactionTd}>
                                  <span style={{ ...styles.typeBadge, backgroundColor: t.type === 'deposit' ? '#f0f9ff' : t.type === 'withdrawal' ? '#f0fdf4' : '#fefce8', color: t.type === 'deposit' ? '#0369a1' : t.type === 'withdrawal' ? '#15803d' : '#92400e' }}>
                                    {t.type.charAt(0).toUpperCase() + t.type.slice(1)}
                                  </span>
                                </td>
                                <td style={styles.transactionTd}>{symbol}{Number(t.amount).toLocaleString()}</td>
                                <td style={styles.transactionTd}>{t.game_type || '—'}</td>
                                <td style={styles.transactionTd}>
                                  <button style={styles.deleteTransactionBtn} onClick={() => handleDeleteTransaction(t.id, casino.id)}>
                                    <Trash2 size={13} color="#ef4444" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}
                  {(() => {
                    const casinoGoals = goals.filter(g => g.casino_id === casino.id && g.status === 'active');
                    if (casinoGoals.length === 0) return null;
                    return (
                      <div style={styles.casinoGoalIndicator}>
                        <div style={styles.casinoGoalIndicatorHeader}>
                          <Target size={11} color="#0ea5e9" />
                          <span style={styles.casinoGoalIndicatorLabel}>Goals</span>
                        </div>
                        {casinoGoals.map(g => {
                          const pct = g.target_amount > 0 ? Math.min((g.current_amount / g.target_amount) * 100, 100) : 0;
                          return (
                            <div key={g.id} style={styles.casinoGoalRow}>
                              <span style={styles.casinoGoalName}>{g.title}</span>
                              <div style={styles.casinoGoalBarWrap}>
                                <div style={styles.casinoGoalBar}>
                                  <div style={{ ...styles.casinoGoalFill, width: `${pct}%` }} />
                                </div>
                                <span style={styles.casinoGoalPct}>{pct.toFixed(0)}%</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              );
            })
          )}
        </div>

        <div style={isMobile ? styles.goalsSectionMobile : styles.goalsSection}>
          <button style={styles.goalsSectionHeader} onClick={() => setGoalsExpanded(p => !p)}>
            <div style={styles.goalsSectionHeaderLeft}>
              <Target size={16} color="#0ea5e9" />
              <h3 style={{ ...styles.sectionTitle, margin: 0 }}>My Goals</h3>
              {goals.filter(g => g.status === 'active').length > 0 && (
                <span style={styles.goalCountBadge}>{goals.filter(g => g.status === 'active').length} active</span>
              )}
            </div>
            {goalsExpanded ? <ChevronUp size={16} color="#94a3b8" /> : <ChevronDown size={16} color="#94a3b8" />}
          </button>
          {goalsExpanded && (
            goals.length === 0 ? (
              <div style={styles.goalsEmptyCallout}>
                <Target size={20} color="#bae6fd" style={{ marginBottom: '8px' }} />
                <p style={styles.goalsEmptyCalloutTitle}>No goals set yet</p>
                <p style={styles.goalsEmptyCalloutText}><Link to="/profile" style={styles.goalsEmptyLink}>Head to Profile → Goals</Link> to set your first goal and track your progress.</p>
              </div>
            ) : (
              <div style={styles.dashGoalsList}>
                {goals.map(goal => {
                  const pct = goal.target_amount > 0 ? Math.min((goal.current_amount / goal.target_amount) * 100, 100) : 0;
                  const casinoName = casinos.find(c => c.id === goal.casino_id)?.name;
                  const isExpired = goal.deadline && new Date(goal.deadline) < new Date() && goal.status === 'active';
                  const effectiveStatus = isExpired ? 'failed' : goal.status;
                  return (
                    <div key={goal.id} style={{ ...styles.dashGoalCard, ...(effectiveStatus === 'completed' ? { borderLeft: '4px solid #22c55e' } : effectiveStatus === 'failed' ? { borderLeft: '4px solid #ef4444' } : { borderLeft: '4px solid #0ea5e9' }) }}>
                      <div style={styles.dashGoalHeader}>
                        <div style={styles.dashGoalLeft}>
                          <span style={styles.dashGoalTitle}>{goal.title}</span>
                          <div style={styles.dashGoalMeta}>
                            <span style={styles.dashGoalTypeBadge}>{goal.goal_type}</span>
                            {casinoName && <span style={styles.dashGoalCasinoBadge}>{casinoName}</span>}
                            {goal.deadline && <span style={styles.dashGoalDeadlineBadge}>{new Date(goal.deadline).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                          </div>
                        </div>
                        <span style={{ ...styles.dashGoalStatus, backgroundColor: effectiveStatus === 'completed' ? '#f0fdf4' : effectiveStatus === 'failed' ? '#fef2f2' : '#f0f9ff', color: effectiveStatus === 'completed' ? '#16a34a' : effectiveStatus === 'failed' ? '#dc2626' : '#0369a1' }}>
                          {effectiveStatus === 'completed' ? 'Completed' : effectiveStatus === 'failed' ? 'Failed' : 'Active'}
                        </span>
                      </div>
                      <div style={styles.dashGoalProgressRow}>
                        <div style={styles.dashGoalBar}>
                          <div style={{ ...styles.dashGoalFill, width: `${pct}%`, backgroundColor: effectiveStatus === 'completed' ? '#22c55e' : effectiveStatus === 'failed' ? '#ef4444' : '#0ea5e9' }} />
                        </div>
                        <span style={styles.dashGoalPct}>{pct.toFixed(0)}%</span>
                      </div>
                      <p style={styles.dashGoalProgressText}>{symbol}{Number(goal.current_amount || 0).toLocaleString()} of {symbol}{Number(goal.target_amount || 0).toLocaleString()}</p>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>

        <Footer jurisdiction={profile?.country} />
      </div>

      {isMobile && (
        <div style={styles.bottomNav}>
          {navItems.map(item => (
            <Link key={item.id} to={item.path} style={{ ...styles.bottomNavItem, ...(activeNav === item.id ? styles.bottomNavItemActive : {}) }} onClick={() => setActiveNav(item.id)}>
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
  mainContent: { marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 },
  mainContentMobile: { flex: 1, display: 'flex', flexDirection: 'column', paddingBottom: '70px', minWidth: 0 },
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
  lifetimeNoticeBanner: { padding: '10px 16px', backgroundColor: '#f0f9ff', borderBottom: '1px solid #bae6fd', fontSize: '13px', color: '#0369a1' },
  lifetimeFilterBanner: { display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '12px 28px 0 28px', padding: '12px 14px', backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '10px' },
  lifetimeFilterBannerMobile: { display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '10px 16px 0 16px', padding: '10px 12px', backgroundColor: '#e0f2fe', border: '1px solid #0ea5e9', borderRadius: '10px' },
  lifetimeFilterBannerText: { color: '#0369a1', fontSize: '13px', margin: 0, lineHeight: '1.5' },
  lifetimeFilterBannerLink: { background: 'none', border: 'none', color: '#0369a1', fontSize: '13px', cursor: 'pointer', padding: 0, textDecoration: 'underline', fontWeight: '600' },
  heroBanner: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', padding: '32px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  heroBannerMobile: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', padding: '16px 16px' },
  heroLeft: {},
  heroLabel: { color: 'rgba(255,255,255,0.6)', fontSize: '12px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' },
  heroLabelMobile: { color: 'rgba(255,255,255,0.6)', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: '500' },
  heroAmount: { fontSize: '42px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-2px', lineHeight: 1 },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontSize: '13px', margin: 0 },
  heroRight: { display: 'flex', gap: '12px' },
  heroStat: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px 18px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' },
  heroStatsMobile: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '10px' },
  heroStatMobile: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '8px', padding: '7px 10px', border: '1px solid rgba(255,255,255,0.1)' },
  heroStatLabel: { color: 'rgba(255,255,255,0.5)', fontSize: '10px', margin: '0 0 4px 0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' },
  heroStatValue: { color: 'white', fontSize: '14px', fontWeight: '700', margin: 0 },
  heroStatValueMobile: { color: 'white', fontSize: '12px', fontWeight: '700', margin: 0 },
  timeFilterBar: { display: 'flex', gap: '6px', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' },
  filterBtn: { padding: '5px 12px', borderRadius: '20px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#64748b', fontSize: '12px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 },
  filterBtnActive: { backgroundColor: '#0ea5e9', color: 'white', border: '1px solid #0ea5e9' },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', padding: '20px 28px 0 28px' },
  statsRowMobile: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '8px 16px 0 16px' },
  statCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #e2e8f0' },
  statCardMobile: { backgroundColor: 'white', borderRadius: '10px', padding: '9px 10px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)', borderLeft: '4px solid #e2e8f0' },
  statLabel: { color: '#94a3b8', fontSize: '10px', margin: '0 0 8px 0', textTransform: 'uppercase', letterSpacing: '0.8px', fontWeight: '600' },
  statLabelMobile: { color: '#94a3b8', fontSize: '9px', margin: '0 0 3px 0', textTransform: 'uppercase', letterSpacing: '0.6px', fontWeight: '600' },
  statValue: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-0.5px' },
  statValueMobile: { color: '#0f172a', fontSize: '18px', fontWeight: '800', margin: '0 0 2px 0', letterSpacing: '-0.5px' },
  statSub: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  statSubMobile: { color: '#94a3b8', fontSize: '10px', margin: 0 },
  limitsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', padding: '16px 28px 0 28px' },
  limitsRowMobile: { display: 'flex', flexDirection: 'column', gap: '10px', padding: '12px 16px 0 16px' },
  limitCard: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  limitRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  limitLabel: { color: '#374151', fontWeight: '600', margin: 0, fontSize: '13px' },
  limitInputRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  limitInput: { width: '80px', padding: '5px 8px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '16px' },
  limitCurrency: { color: '#64748b', fontSize: '13px' },
  progressBar: { height: '10px', backgroundColor: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginBottom: '6px' },
  progressFill: { height: '100%', borderRadius: '5px', transition: 'width 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: '6px' },
  progressLabel: { color: 'white', fontSize: '9px', fontWeight: '700' },
  limitText: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  emptyDashboard: { margin: '16px 28px 0 28px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  emptyDashboardMobile: { margin: '8px 14px 0 14px', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  emptyDashboardContent: { padding: '28px 20px 28px 20px', textAlign: 'center' },
  emptyDashboardContentMobile: { padding: '14px 12px 16px 12px', textAlign: 'center' },
  emptyIconWrapper: { width: '72px', height: '72px', backgroundColor: '#f0f9ff', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' },
  emptyHeroSubtitle: { color: 'rgba(255,255,255,0.65)', fontSize: '14px', margin: '8px 0 4px 0', fontWeight: '400' },
  emptyDashboardTitle: { color: '#0f172a', fontSize: '20px', fontWeight: '800', margin: '0 0 6px 0' },
  emptyDashboardTitleMobile: { color: '#0f172a', fontSize: '16px', fontWeight: '800', margin: '0 0 3px 0' },
  emptyDashboardText: { color: '#475569', fontSize: '15px', fontWeight: '500', lineHeight: '1.5', margin: '0 0 20px 0' },
  emptyDashboardTextMobile: { color: '#475569', fontSize: '12px', fontWeight: '500', lineHeight: '1.4', margin: '0 0 10px 0' },
  emptyDashboardBtn: { display: 'block', padding: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '15px', fontWeight: '700', boxShadow: '0 4px 12px rgba(14,165,233,0.3)', marginTop: '20px', textAlign: 'center', maxWidth: '350px', marginLeft: 'auto', marginRight: 'auto' },
  emptyDashboardBtnMobile: { display: 'block', padding: '11px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', borderRadius: '10px', textDecoration: 'none', fontSize: '14px', fontWeight: '700', boxShadow: '0 4px 12px rgba(14,165,233,0.3)', marginTop: '10px', textAlign: 'center', maxWidth: '350px', marginLeft: 'auto', marginRight: 'auto' },
  emptyStepsRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' },
  emptyStepsColumnMobile: { display: 'flex', flexDirection: 'column', gap: '6px' },
  emptyStepCard: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderTop: '3px solid #0ea5e9', borderRadius: '12px', padding: '14px 14px 16px 14px', textAlign: 'center' },
  emptyStepCardMobile: { backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderTop: '3px solid #0ea5e9', borderRadius: '10px', padding: '8px 10px 10px 10px', textAlign: 'center', display: 'flex', alignItems: 'center', gap: '10px' },
  emptyStepIcon: { width: '48px', height: '48px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px auto' },
  emptyStepIconMobile: { width: '36px', height: '36px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emptyStepNumber: { color: '#0ea5e9', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px 0' },
  emptyStepNumberMobile: { color: '#0ea5e9', fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 2px 0' },
  emptyStepTitle: { color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: '0 0 6px 0' },
  emptyStepTitleMobile: { color: '#0f172a', fontSize: '13px', fontWeight: '700', margin: '0 0 3px 0' },
  emptyStepDesc: { color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: '0' },
  emptyStepDescMobile: { color: '#64748b', fontSize: '11px', lineHeight: '1.35', margin: '0' },
  emptyStepTextMobile: { flex: 1, textAlign: 'left' },
  emptyCasinosNote: { color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '24px 0', margin: 0 },
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
  searchInput: { width: '100%', padding: '10px 14px 10px 36px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc' },
  emptyState: { textAlign: 'center', padding: '32px 0' },
  emptyTitle: { color: '#1e293b', fontSize: '15px', fontWeight: '600', margin: '12px 0 6px 0' },
  emptyText: { color: '#94a3b8', fontSize: '13px', margin: '0 0 14px 0' },
  casinoCard: { border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '10px', backgroundColor: '#fafafa' },
  casinoHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' },
  casinoNameRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  casinoAvatar: { width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '17px', fontWeight: '800', flexShrink: 0 },
  casinoNameLine: { display: 'flex', alignItems: 'center', gap: '6px' },
  statusDot: { width: '7px', height: '7px', borderRadius: '50%', display: 'inline-block' },
  casinoName: { margin: 0, color: '#0f172a', fontSize: '15px', fontWeight: '700' },
  editNameBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', opacity: 0.5 },
  editNameRow: { display: 'flex', alignItems: 'center', gap: '4px' },
  editNameInput: { padding: '4px 8px', border: '1px solid #0ea5e9', borderRadius: '6px', fontSize: '16px', fontWeight: '700', width: '160px' },
  editActionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' },
  lastActivity: { color: '#94a3b8', fontSize: '11px', display: 'block', marginTop: '2px' },
  casinoHeaderRight: { display: 'flex', alignItems: 'center', gap: '10px' },
  casinoMobileRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' },
  starRating: { display: 'flex', gap: '2px' },
  casinoFilterBar: { display: 'flex', gap: '4px', marginBottom: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' },
  casinoFilterBtn: { padding: '3px 8px', borderRadius: '12px', border: '1px solid #e2e8f0', backgroundColor: 'white', color: '#94a3b8', fontSize: '11px', cursor: 'pointer', fontWeight: '500', whiteSpace: 'nowrap', flexShrink: 0 },
  casinoFilterBtnActive: { backgroundColor: '#0ea5e9', color: 'white', border: '1px solid #0ea5e9' },
  casinoLifetimeNote: { color: '#0369a1', backgroundColor: '#f0f9ff', fontSize: '12px', padding: '6px 10px', borderRadius: '6px', margin: '0 0 10px 0' },
  casinoBarRow: { marginBottom: '8px' },
  casinoMiniBar: { height: '5px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden', marginBottom: '3px' },
  casinoBarFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  barStatRow: { display: 'flex', justifyContent: 'space-between', marginTop: '6px' },
  barStat: { display: 'flex', alignItems: 'center', gap: '5px' },
  barStatDot: { width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', flexShrink: 0 },
  barStatLabel: { color: '#64748b', fontSize: '11px' },
  barStatValue: { color: '#0f172a', fontSize: '12px', fontWeight: '700' },
  casinoStats: { display: 'flex', gap: '14px', color: '#64748b', fontSize: '12px', marginBottom: '10px', flexWrap: 'wrap' },
  casinoStatsMobile: { display: 'flex', gap: '10px', color: '#64748b', fontSize: '12px', marginBottom: '10px', flexWrap: 'wrap' },
  noteInput: { width: '100%', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '16px', color: '#64748b', boxSizing: 'border-box', backgroundColor: 'white', marginBottom: '8px' },
  casinoGameStats: { display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' },
  gameTag: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '11px', padding: '3px 8px', borderRadius: '20px', fontWeight: '500' },
  casinoActionsRow: { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' },
  addTransactionBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  viewTransactionsBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' },
  deleteCasinoBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', marginLeft: 'auto' },
  transactionHistory: { marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '12px', overflowX: 'auto' },
  noTransactionsText: { color: '#94a3b8', fontSize: '13px', textAlign: 'center', padding: '12px 0', margin: 0 },
  transactionTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  transactionTh: { padding: '6px 10px', textAlign: 'left', color: '#64748b', fontWeight: '600', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  transactionTd: { padding: '8px 10px', color: '#374151', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' },
  typeBadge: { padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' },
  deleteTransactionBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' },
  confirmModal: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '400px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  confirmTitle: { color: '#0f172a', fontSize: '18px', fontWeight: '800', margin: '0 0 10px 0' },
  confirmText: { color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' },
  confirmActions: { display: 'flex', gap: '10px' },
  confirmCancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#64748b', cursor: 'pointer' },
  confirmDeleteBtn: { flex: 1, padding: '12px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavItemActive: { color: '#0ea5e9' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
  feedbackBtn: { position: 'fixed', bottom: '24px', right: '24px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '24px', padding: '12px 20px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', boxShadow: '0 4px 12px rgba(14,165,233,0.4)', zIndex: 200, display: 'flex', alignItems: 'center', gap: '8px' },
  feedbackModal: { position: 'fixed', bottom: '80px', right: '24px', backgroundColor: 'white', borderRadius: '12px', padding: '20px', width: '300px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', zIndex: 200 },
  logSessionTopBarBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  logSessionHeroBtn: { marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '7px 16px', backgroundColor: 'rgba(14,165,233,0.2)', border: '1px solid rgba(14,165,233,0.4)', borderRadius: '8px', color: '#7dd3fc', fontSize: '12px', fontWeight: '700', cursor: 'pointer', width: '100%' },
  logSessionPicker: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', width: '100%', maxWidth: '340px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' },
  logSessionPickerHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  logSessionPickerTitle: { color: '#0f172a', fontSize: '16px', fontWeight: '800', margin: 0 },
  logSessionPickerClose: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' },
  logSessionPickerList: { display: 'flex', flexDirection: 'column', gap: '6px' },
  logSessionCasinoBtn: { display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '10px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer', textAlign: 'left' },
  logSessionCasinoName: { color: '#0f172a', fontSize: '14px', fontWeight: '600' },
  logSessionNewCasinoBtn: { display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 12px', backgroundColor: 'white', border: '2px dashed #bae6fd', borderRadius: '10px', cursor: 'pointer', color: '#0ea5e9', fontSize: '14px', fontWeight: '600', marginTop: '4px' },
  feedbackInput: { width: '100%', height: '80px', padding: '8px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '16px', resize: 'none', boxSizing: 'border-box', marginBottom: '12px' },
  feedbackActions: { display: 'flex', justifyContent: 'flex-end', gap: '8px' },
  cancelBtn: { padding: '6px 14px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer', backgroundColor: 'white', fontSize: '13px' },
  submitBtn: { padding: '6px 14px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' },
  emptyStateTip: { display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '14px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '10px 14px', maxWidth: '420px', marginLeft: 'auto', marginRight: 'auto', textAlign: 'left' },
  emptyStateTipMobile: { display: 'flex', alignItems: 'flex-start', gap: '7px', marginTop: '10px', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '8px', padding: '8px 10px', textAlign: 'left' },
  emptyStateTipText: { color: '#0369a1', fontSize: '12px', lineHeight: '1.5', margin: 0 },
  emptyStateTipLink: { color: '#0369a1', fontWeight: '700', textDecoration: 'underline' },
  casinoGoalIndicator: { marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #e2e8f0' },
  casinoGoalIndicatorHeader: { display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' },
  casinoGoalIndicatorLabel: { color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.06em' },
  casinoGoalRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  casinoGoalName: { color: '#374151', fontSize: '11px', fontWeight: '500', flexShrink: 0, maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  casinoGoalBarWrap: { flex: 1, display: 'flex', alignItems: 'center', gap: '6px' },
  casinoGoalBar: { flex: 1, height: '4px', backgroundColor: '#e0f2fe', borderRadius: '2px', overflow: 'hidden' },
  casinoGoalFill: { height: '100%', backgroundColor: '#0ea5e9', borderRadius: '2px', transition: 'width 0.3s ease' },
  casinoGoalPct: { color: '#0369a1', fontSize: '10px', fontWeight: '700', flexShrink: 0, minWidth: '28px', textAlign: 'right' },
  goalsSection: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '16px 28px 0 28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  goalsSectionMobile: { backgroundColor: 'white', borderRadius: '12px', padding: '16px', margin: '12px 16px 0 16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  goalsSectionHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: 0, marginBottom: '0' },
  goalsSectionHeaderLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  goalCountBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600' },
  goalsEmptyCallout: { textAlign: 'center', padding: '20px 0 8px 0' },
  goalsEmptyCalloutTitle: { color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' },
  goalsEmptyCalloutText: { color: '#64748b', fontSize: '13px', margin: 0, lineHeight: '1.5' },
  goalsEmptyLink: { color: '#0369a1', fontWeight: '700', textDecoration: 'underline' },
  dashGoalsList: { display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' },
  dashGoalCard: { backgroundColor: '#fafafa', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '12px 14px' },
  dashGoalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' },
  dashGoalLeft: { flex: 1, minWidth: 0 },
  dashGoalTitle: { color: '#0f172a', fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '4px' },
  dashGoalMeta: { display: 'flex', gap: '5px', flexWrap: 'wrap' },
  dashGoalTypeBadge: { backgroundColor: '#f0f9ff', color: '#0369a1', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: '600' },
  dashGoalCasinoBadge: { backgroundColor: '#f0fdf4', color: '#15803d', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: '600' },
  dashGoalDeadlineBadge: { backgroundColor: '#fefce8', color: '#92400e', fontSize: '10px', padding: '2px 7px', borderRadius: '20px', fontWeight: '600' },
  dashGoalStatus: { fontSize: '11px', padding: '3px 9px', borderRadius: '20px', fontWeight: '600', flexShrink: 0, marginLeft: '8px' },
  dashGoalProgressRow: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  dashGoalBar: { flex: 1, height: '6px', backgroundColor: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' },
  dashGoalFill: { height: '100%', borderRadius: '3px', transition: 'width 0.3s ease' },
  dashGoalPct: { color: '#64748b', fontSize: '11px', fontWeight: '700', flexShrink: 0, minWidth: '32px', textAlign: 'right' },
  dashGoalProgressText: { color: '#94a3b8', fontSize: '11px', margin: 0 },
};

export default Dashboard;

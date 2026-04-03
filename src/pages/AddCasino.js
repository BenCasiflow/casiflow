import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, User, LogOut, Upload, CheckCircle, AlertCircle, TrendingUp, Gift, Wallet, Calendar, Hash, ArrowDownCircle, ArrowUpCircle, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import AddTransactionModal from '../components/AddTransactionModal';
import Footer from '../components/Footer';
import { getCurrencyCode, getCurrencySymbol } from '../utils/currency';

const TYPE_MAPPINGS = {
  deposit: ['deposit', 'deposits', 'dep', 'credit', 'fund', 'funding', 'top up', 'topup', 'top-up', 'payment in', 'money in'],
  withdrawal: ['withdrawal', 'withdrawals', 'withdraw', 'with', 'debit', 'cashout', 'cash out', 'payout', 'pay out', 'payment out', 'money out'],
  bonus: ['bonus', 'bonuses', 'free spin', 'free spins', 'freespin', 'promotion', 'promo', 'reward', 'cashback', 'free bet'],
};

const COMPLETED_STATUSES = ['completed', 'complete', 'success', 'successful', 'approved', 'processed', 'settled', 'confirmed', 'done', 'ok'];

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if ((char === ',' || char === ';') && !inQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function parseCSVText(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  if (lines.length < 2) return { headers: [], rows: [] };
  const headers = parseCSVLine(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.every(v => v === '')) continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] !== undefined ? values[index] : '';
    });
    rows.push(row);
  }
  return { headers, rows };
}

function parseDate(value) {
  if (!value) return null;
  const str = String(value).trim();
  const d = new Date(str);
  if (!isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  const ddmmyyyy = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (ddmmyyyy) {
    const parsed = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
    if (!isNaN(parsed.getTime())) return parsed.toISOString().slice(0, 10);
  }
  return null;
}

function parseAmount(value) {
  if (!value && value !== 0) return null;
  const str = String(value).replace(/[^0-9.,-]/g, '').replace(',', '.');
  const num = parseFloat(str);
  return isNaN(num) ? null : Math.abs(num);
}

function mapTransactionType(value) {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  for (const [type, variations] of Object.entries(TYPE_MAPPINGS)) {
    if (variations.some(v => lower.includes(v))) return type;
  }
  return null;
}

const COLUMN_HINTS = {
  date: ['date', 'timestamp', 'time', 'datetime', 'transaction date', 'trans date', 'created', 'created at', 'created_at', 'transaction_date'],
  type: ['type', 'transaction type', 'trans type', 'kind', 'category', 'transaction_type'],
  amount: ['amount', 'value', 'sum', 'total', 'transaction amount'],
  deposits: ['deposits', 'deposit', 'dep', 'amount in', 'money in', 'credit'],
  withdrawals: ['withdrawals', 'withdrawal', 'withdraw', 'amount out', 'money out', 'debit'],
  bonus: ['bonus', 'bonuses', 'free spin', 'promotion'],
  balance_after: ['balance after', 'balance_after', 'closing balance', 'balance', 'account balance', 'new balance'],
  transaction_id: ['transaction id', 'transaction_id', 'trans id', 'id', 'reference', 'ref'],
  status: ['status', 'state', 'transaction status'],
};

function autoDetectMapping(headers) {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  const mapping = {};
  for (const [field, hints] of Object.entries(COLUMN_HINTS)) {
    const match = lowerHeaders.findIndex(h => hints.includes(h));
    if (match !== -1) mapping[field] = headers[match];
  }
  return mapping;
}

function processRows(rows, mapping) {
  let deposits = 0, depositCount = 0, withdrawals = 0, withdrawalCount = 0, bonuses = 0, bonusCount = 0;
  let latestBalance = null;
  const transactions = [];
  const seenIds = new Set();
  const hasSplitColumns = !mapping.type && (mapping.deposits || mapping.withdrawals);

  for (const row of rows) {
    if (mapping.status) {
      const statusVal = row[mapping.status];
      if (statusVal) {
        const lower = statusVal.toLowerCase().trim();
        if (!COMPLETED_STATUSES.some(s => lower.includes(s))) continue;
      }
    }

    const dateVal = mapping.date ? parseDate(row[mapping.date]) : null;
    if (!dateVal) continue;

    const balanceVal = mapping.balance_after ? parseAmount(row[mapping.balance_after]) : null;
    if (balanceVal !== null) latestBalance = balanceVal;

    const sourceId = mapping.transaction_id ? String(row[mapping.transaction_id] || '').trim() : null;

    if (hasSplitColumns) {
      const depAmount = mapping.deposits ? parseAmount(row[mapping.deposits]) : null;
      const withAmount = mapping.withdrawals ? parseAmount(row[mapping.withdrawals]) : null;

      if (depAmount && depAmount > 0) {
        const id = sourceId ? `${sourceId}_dep` : null;
        if (!id || !seenIds.has(id)) {
          if (id) seenIds.add(id);
          deposits += depAmount; depositCount++;
          transactions.push({ date: dateVal, type: 'deposit', amount: depAmount, balance_after: null, source_transaction_id: id });
        }
      }
      if (withAmount && withAmount > 0) {
        const id = sourceId ? `${sourceId}_with` : null;
        if (!id || !seenIds.has(id)) {
          if (id) seenIds.add(id);
          withdrawals += withAmount; withdrawalCount++;
          transactions.push({ date: dateVal, type: 'withdrawal', amount: withAmount, balance_after: balanceVal, source_transaction_id: id });
        }
      }
    } else {
      const typeRaw = mapping.type ? row[mapping.type] : null;
      let typeVal = mapTransactionType(typeRaw);
      if (!typeVal && mapping.bonus) {
        const bonusAmount = parseAmount(row[mapping.bonus]);
        if (bonusAmount && bonusAmount > 0) typeVal = 'bonus';
      }
      if (!typeVal) continue;
      const amountVal = mapping.amount ? parseAmount(row[mapping.amount]) : null;
      if (!amountVal) continue;
      if (sourceId && seenIds.has(sourceId)) continue;
      if (sourceId) seenIds.add(sourceId);
      if (typeVal === 'deposit') { deposits += amountVal; depositCount++; }
      else if (typeVal === 'withdrawal') { withdrawals += amountVal; withdrawalCount++; }
      else if (typeVal === 'bonus') { bonuses += amountVal; bonusCount++; }
      transactions.push({ date: dateVal, type: typeVal, amount: amountVal, balance_after: balanceVal, source_transaction_id: sourceId || null });
    }
  }

  return { deposits, depositCount, withdrawals, withdrawalCount, bonuses, bonusCount, latestBalance, transactions };
}

function AddCasino({ user, profile, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Existing casinos state
  const [existingCasinos, setExistingCasinos] = useState([]);
  const [loadingCasinos, setLoadingCasinos] = useState(true);
  const [addTransactionCasino, setAddTransactionCasino] = useState(null);

  // New casino state
  const [casinoName, setCasinoName] = useState('');
  const [note, setNote] = useState('');
  const [inputMode, setInputMode] = useState('lifetime');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvAllRows, setCsvAllRows] = useState([]);
  const [csvMapping, setCsvMapping] = useState({});
  const [csvResults, setCsvResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [showManualMapping, setShowManualMapping] = useState(false);

  const [lifetimeData, setLifetimeData] = useState({
    deposits: '', withdrawals: '', bonuses: '', currentBalance: '',
  });

  const [transactions, setTransactions] = useState([
    { id: 1, date: '', type: 'Deposit', amount: '', gameType: '', customGame: '' }
  ]);

  const [favoriteGame, setFavoriteGame] = useState({
    gameType: '', specificGame: '', amountWagered: ''
  });

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const fetchExistingCasinos = useCallback(async () => {
    setLoadingCasinos(true);
    const { data, error } = await supabase
      .from('casinos')
      .select('*')
      .eq('user_id', user.id)
      .order('casino_name', { ascending: true });
    if (!error && data) setExistingCasinos(data.map(c => ({
      id: c.id,
      name: c.casino_name,
      currentBalance: Number(c.current_balance) || 0,
      note: c.note || '',
    })));
    setLoadingCasinos(false);
  }, [user.id]);

  useEffect(() => {
    fetchExistingCasinos();
  }, [fetchExistingCasinos]);

  const currency = getCurrencyCode(profile);
  const symbol = getCurrencySymbol(profile);
  const gameTypes = ['Slots', 'Live Casino', 'Blackjack', 'Roulette', 'Poker', 'Baccarat', 'Sports Betting', 'Other'];

  const getAvatarColor = (name) => {
    const colors = ['#0ea5e9', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#84cc16'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const addTransaction = () => setTransactions([...transactions, { id: transactions.length + 1, date: '', type: 'Deposit', amount: '', gameType: '', customGame: '' }]);
  const removeTransaction = (id) => { if (transactions.length === 1) return; setTransactions(transactions.filter(t => t.id !== id)); };
  const updateTransaction = (id, field, value) => setTransactions(transactions.map(t => t.id === id ? { ...t, [field]: value } : t));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Please upload a CSV file (.csv)'); return; }
    setError('');
    setCsvFile(file);
    setCsvFileName(file.name);
    setShowResultsModal(false);
    setShowManualMapping(false);
    setCsvResults(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target.result;
        const { headers, rows } = parseCSVText(text);
        if (headers.length === 0 || rows.length === 0) { setError('The file appears to be empty or could not be read.'); return; }
        setCsvHeaders(headers);
        setCsvPreviewRows(rows.slice(0, 3));
        setCsvAllRows(rows);
        const mapping = autoDetectMapping(headers);
        setCsvMapping(mapping);
        const results = processRows(rows, mapping);
        setCsvResults(results);
        setShowResultsModal(true);
      } catch { setError('Could not read the file. Please make sure it is a valid CSV file.'); }
    };
    reader.onerror = () => setError('Could not read the file. Please try again.');
    reader.readAsText(file);
  };

  const handleRemapAndRecalculate = () => {
    const results = processRows(csvAllRows, csvMapping);
    setCsvResults(results);
    setShowManualMapping(false);
    setShowResultsModal(true);
  };

  const totalDeposits = inputMode === 'lifetime'
    ? Number(lifetimeData.deposits) || 0
    : transactions.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalWithdrawals = inputMode === 'lifetime'
    ? Number(lifetimeData.withdrawals) || 0
    : transactions.filter(t => t.type === 'Withdrawal').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalBonuses = inputMode === 'lifetime'
    ? Number(lifetimeData.bonuses) || 0
    : transactions.filter(t => t.type === 'Bonus').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const currentBalance = Number(lifetimeData.currentBalance) || 0;
  const netResult = totalWithdrawals + currentBalance - totalDeposits;

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');
    if (!casinoName) { setError('Please enter a casino name'); return; }
    if (inputMode === 'lifetime' && !lifetimeData.deposits) { setError('Please enter at least your total deposits'); return; }
    if (inputMode === 'transactions' && transactions.some(t => !t.date || !t.amount)) { setError('Please fill in a date and amount for each transaction'); return; }
    if (inputMode === 'csv') {
      if (!csvFile) { setError('Please upload a CSV file'); return; }
      if (!csvResults || csvResults.transactions.length === 0) { setError('No valid transactions found in your file.'); return; }
    }

    setLoading(true);

    const { data: casinoData, error: casinoError } = await supabase
      .from('casinos')
      .insert({
        user_id: user.id,
        casino_name: casinoName,
        note: note || null,
        current_balance: inputMode === 'csv' && csvResults?.latestBalance != null ? csvResults.latestBalance : currentBalance || null,
      })
      .select()
      .single();

    if (casinoError) { setError('Could not save casino. Please try again.'); setLoading(false); return; }

    if (inputMode === 'lifetime') {
      const lifetimeTransactions = [];
      const today = new Date().toISOString().slice(0, 10);
      if (lifetimeData.deposits) lifetimeTransactions.push({ casino_id: casinoData.id, user_id: user.id, date: today, type: 'deposit', amount: Number(lifetimeData.deposits), game_type: null, entry_method: 'lifetime' });
      if (lifetimeData.withdrawals) lifetimeTransactions.push({ casino_id: casinoData.id, user_id: user.id, date: today, type: 'withdrawal', amount: Number(lifetimeData.withdrawals), game_type: null, entry_method: 'lifetime' });
      if (lifetimeData.bonuses) lifetimeTransactions.push({ casino_id: casinoData.id, user_id: user.id, date: today, type: 'bonus', amount: Number(lifetimeData.bonuses), game_type: null, entry_method: 'lifetime' });
      if (lifetimeTransactions.length > 0) {
        const { error: transactionError } = await supabase.from('transactions').insert(lifetimeTransactions);
        if (transactionError) { setError('Casino saved but transactions could not be saved.'); setLoading(false); return; }
      }
    }

    if (inputMode === 'transactions') {
      const manualTransactions = transactions.map(t => ({
        casino_id: casinoData.id, user_id: user.id, date: t.date, type: t.type.toLowerCase(),
        amount: Number(t.amount), game_type: t.gameType === 'Other' ? t.customGame || 'Other' : t.gameType || null, entry_method: 'manual',
      }));
      const { error: transactionError } = await supabase.from('transactions').insert(manualTransactions);
      if (transactionError) { setError('Casino saved but transactions could not be saved.'); setLoading(false); return; }
    }

    if (inputMode === 'csv' && csvResults) {
      const dbTransactions = csvResults.transactions.map(t => ({
        casino_id: casinoData.id, user_id: user.id, date: t.date, type: t.type, amount: t.amount,
        game_type: null, entry_method: 'csv', source_transaction_id: t.source_transaction_id || null, balance_after: t.balance_after || null,
      }));
      const { error: transactionError } = await supabase.from('transactions').insert(dbTransactions);
      if (transactionError) { setError('Casino saved but transactions could not be saved.'); setLoading(false); return; }
    }

    if (favoriteGame.gameType) {
      await supabase.from('favourite_games').insert({
        casino_id: casinoData.id, user_id: user.id, game_type: favoriteGame.gameType,
        specific_game: favoriteGame.specificGame || null,
        amount_wagered: favoriteGame.amountWagered ? Number(favoriteGame.amountWagered) : null,
      });
    }

    setLoading(false);
    navigate('/dashboard');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
  ];

  const SummaryCard = () => (
    <div style={styles.summaryCard}>
      <h3 style={styles.cardTitle}>Summary</h3>
      <div style={styles.summaryRow}><span style={styles.summaryLabel}>Casino</span><span style={styles.summaryValue}>{casinoName || '—'}</span></div>
      <div style={styles.summaryRow}>
        <span style={styles.summaryLabel}>Data Type</span>
        <span style={styles.summaryValue}>{inputMode === 'lifetime' ? 'Lifetime Totals' : inputMode === 'transactions' ? `${transactions.length} Transactions` : csvFileName ? `CSV: ${csvFileName}` : 'CSV Upload'}</span>
      </div>
      <div style={styles.divider} />
      {inputMode !== 'csv' && (
        <>
          <div style={styles.summaryRow}><span style={styles.summaryLabel}>Total Deposited</span><span style={styles.summaryValue}>{symbol}{totalDeposits.toLocaleString()}</span></div>
          <div style={styles.summaryRow}><span style={styles.summaryLabel}>Total Withdrawn</span><span style={styles.summaryValue}>{symbol}{totalWithdrawals.toLocaleString()}</span></div>
          <div style={styles.summaryRow}><span style={styles.summaryLabel}>Total Bonuses</span><span style={styles.summaryValue}>{symbol}{totalBonuses.toLocaleString()}</span></div>
          <div style={styles.summaryRow}><span style={styles.summaryLabel}>Current Balance</span><span style={styles.summaryValue}>{symbol}{currentBalance.toLocaleString()}</span></div>
          <div style={styles.divider} />
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Net Result</span>
            <span style={{ ...styles.summaryValue, color: netResult >= 0 ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
              {netResult >= 0 ? '+' : '-'}{symbol}{Math.abs(netResult).toLocaleString()}
            </span>
          </div>
        </>
      )}
      {inputMode === 'csv' && csvResults && (
        <>
          <div style={styles.summaryRow}><span style={styles.summaryLabel}>Deposits</span><span style={styles.summaryValue}>{symbol}{csvResults.deposits.toLocaleString()}</span></div>
          <div style={styles.summaryRow}><span style={styles.summaryLabel}>Withdrawals</span><span style={styles.summaryValue}>{symbol}{csvResults.withdrawals.toLocaleString()}</span></div>
          {csvResults.bonuses > 0 && <div style={styles.summaryRow}><span style={styles.summaryLabel}>Bonuses</span><span style={styles.summaryValue}>{symbol}{csvResults.bonuses.toLocaleString()}</span></div>}
          <div style={styles.divider} />
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Net Result</span>
            <span style={{ ...styles.summaryValue, color: (csvResults.withdrawals - csvResults.deposits) >= 0 ? '#16a34a' : '#dc2626', fontWeight: '700' }}>
              {(csvResults.withdrawals - csvResults.deposits) >= 0 ? '+' : '-'}{symbol}{Math.abs(csvResults.withdrawals - csvResults.deposits).toLocaleString()}
            </span>
          </div>
        </>
      )}
      {favoriteGame.gameType && (
        <>
          <div style={styles.divider} />
          <p style={styles.summaryGamesTitle}>Favourite Game</p>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>{favoriteGame.specificGame || favoriteGame.gameType}</span>
            <span style={styles.summaryValue}>{favoriteGame.amountWagered ? `${symbol}${favoriteGame.amountWagered}` : '—'}</span>
          </div>
        </>
      )}
      <button onClick={handleSubmit} style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }} disabled={loading}>
        {loading ? 'Saving...' : 'Add Casino'}
      </button>
      <Link to="/dashboard" style={styles.cancelBtn}>Cancel</Link>
    </div>
  );

  return (
    <div style={styles.appContainer}>

      {/* Add Transaction Modal */}
      {addTransactionCasino && (
        <AddTransactionModal
          casino={addTransactionCasino}
          userId={user.id}
          currency={currency}
          onClose={() => setAddTransactionCasino(null)}
          onSaved={() => { setAddTransactionCasino(null); fetchExistingCasinos(); }}
        />
      )}

      {/* CSV Results Modal */}
      {showResultsModal && csvResults && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalCard}>
            <div style={styles.modalHeader}>
              <CheckCircle size={24} color="#16a34a" />
              <h3 style={styles.modalTitle}>We found your transactions</h3>
            </div>
            <p style={styles.modalSubtitle}>Here is a summary of what we found in <strong>{csvFileName}</strong>. Please confirm this looks correct.</p>
            <div style={styles.modalStatsGrid}>
              <div style={styles.modalStat}>
                <div style={styles.modalStatIcon}><ArrowDownCircle size={20} color="#0ea5e9" /></div>
                <p style={styles.modalStatLabel}>Total Deposited</p>
                <p style={styles.modalStatValue}>{symbol}{csvResults.deposits.toLocaleString()}</p>
                <p style={styles.modalStatCount}>{csvResults.depositCount} transaction{csvResults.depositCount !== 1 ? 's' : ''}</p>
              </div>
              <div style={styles.modalStat}>
                <div style={styles.modalStatIcon}><ArrowUpCircle size={20} color="#10b981" /></div>
                <p style={styles.modalStatLabel}>Total Withdrawn</p>
                <p style={styles.modalStatValue}>{symbol}{csvResults.withdrawals.toLocaleString()}</p>
                <p style={styles.modalStatCount}>{csvResults.withdrawalCount} transaction{csvResults.withdrawalCount !== 1 ? 's' : ''}</p>
              </div>
              {csvResults.bonuses > 0 && (
                <div style={styles.modalStat}>
                  <div style={styles.modalStatIcon}><Gift size={20} color="#f59e0b" /></div>
                  <p style={styles.modalStatLabel}>Total Bonuses</p>
                  <p style={styles.modalStatValue}>{symbol}{csvResults.bonuses.toLocaleString()}</p>
                  <p style={styles.modalStatCount}>{csvResults.bonusCount} transaction{csvResults.bonusCount !== 1 ? 's' : ''}</p>
                </div>
              )}
              {csvResults.latestBalance != null && (
                <div style={styles.modalStat}>
                  <div style={styles.modalStatIcon}><Wallet size={20} color="#8b5cf6" /></div>
                  <p style={styles.modalStatLabel}>Current Balance</p>
                  <p style={styles.modalStatValue}>{symbol}{csvResults.latestBalance.toLocaleString()}</p>
                  <p style={styles.modalStatCount}>from your file</p>
                </div>
              )}
            </div>
            <div style={{ ...styles.modalNetResult, backgroundColor: (csvResults.withdrawals - csvResults.deposits) >= 0 ? '#f0fdf4' : '#fef2f2' }}>
              <span style={styles.modalNetLabel}>Net Result</span>
              <span style={{ ...styles.modalNetValue, color: (csvResults.withdrawals - csvResults.deposits) >= 0 ? '#16a34a' : '#dc2626' }}>
                {(csvResults.withdrawals - csvResults.deposits) >= 0 ? '+' : '-'}{symbol}{Math.abs(csvResults.withdrawals - csvResults.deposits).toLocaleString()}
              </span>
            </div>
            <div style={styles.modalActions}>
              <button style={styles.modalSecondaryBtn} onClick={() => { setShowResultsModal(false); setShowManualMapping(true); }}>Something looks wrong</button>
              <button style={styles.modalPrimaryBtn} onClick={() => setShowResultsModal(false)}>Looks correct</button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Mapping Modal */}
      {showManualMapping && (
        <div style={styles.modalOverlay}>
          <div style={{ ...styles.modalCard, maxWidth: '600px' }}>
            <div style={styles.modalHeader}>
              <AlertCircle size={24} color="#f59e0b" />
              <h3 style={styles.modalTitle}>Help us read your file</h3>
            </div>
            <p style={styles.modalSubtitle}>Tell us which column in your file contains each piece of information. Here are the first few rows of your file to help you:</p>
            {csvPreviewRows.length > 0 && (
              <div style={styles.previewTableWrapper}>
                <table style={styles.previewTable}>
                  <thead><tr>{csvHeaders.map(h => <th key={h} style={styles.previewTh}>{h}</th>)}</tr></thead>
                  <tbody>{csvPreviewRows.map((row, i) => (<tr key={i}>{csvHeaders.map(h => <td key={h} style={styles.previewTd}>{String(row[h] || '')}</td>)}</tr>))}</tbody>
                </table>
              </div>
            )}
            <div style={styles.mappingGrid}>
              {[
                { field: 'date', label: 'Which column is the date?', icon: <Calendar size={16} color="#0ea5e9" />, required: true },
                { field: 'type', label: 'Which column shows the transaction type (e.g. Deposit / Withdrawal)?', icon: <Hash size={16} color="#0ea5e9" />, required: false },
                { field: 'amount', label: 'Which column is the amount?', icon: <Wallet size={16} color="#0ea5e9" />, required: false },
                { field: 'deposits', label: 'Which column contains deposit amounts?', icon: <ArrowDownCircle size={16} color="#0ea5e9" />, required: false },
                { field: 'withdrawals', label: 'Which column contains withdrawal amounts?', icon: <ArrowUpCircle size={16} color="#10b981" />, required: false },
                { field: 'bonus', label: 'Which column contains bonus amounts? (optional)', icon: <Gift size={16} color="#f59e0b" />, required: false },
                { field: 'balance_after', label: 'Which column shows your account balance? (optional)', icon: <Wallet size={16} color="#8b5cf6" />, required: false },
                { field: 'transaction_id', label: 'Which column is the transaction ID? (optional)', icon: <Hash size={16} color="#64748b" />, required: false },
                { field: 'status', label: 'Which column shows the transaction status? (optional)', icon: <CheckCircle size={16} color="#64748b" />, required: false },
              ].map(({ field, label, icon, required }) => (
                <div key={field} style={styles.mappingRow}>
                  <label style={styles.mappingLabel}>
                    <span style={styles.mappingLabelIcon}>{icon}</span>
                    {label}
                  </label>
                  <select
                    style={{ ...styles.input, borderColor: required && !csvMapping[field] ? '#fca5a5' : '#e2e8f0' }}
                    value={csvMapping[field] || ''}
                    onChange={(e) => setCsvMapping(prev => ({ ...prev, [field]: e.target.value || undefined }))}
                  >
                    <option value="">— Not in my file —</option>
                    {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div style={styles.modalActions}>
              <button style={styles.modalSecondaryBtn} onClick={() => { setShowManualMapping(false); setShowResultsModal(true); }}>Go back</button>
              <button style={styles.modalPrimaryBtn} onClick={handleRemapAndRecalculate}>Recalculate</button>
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
              <Link key={item.id} to={item.path} style={{ ...styles.navItem, ...(item.id === 'casinos' ? styles.navItemActive : {}) }}>
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
            {!isMobile && <h2 style={styles.pageTitle}>Casinos</h2>}
            {isMobile && <h2 style={styles.pageTitleMobile}>Casinos</h2>}
          </div>
          <span style={styles.greeting}>Hi, {profile?.full_name || user.email}</span>
        </div>

        <div style={isMobile ? styles.contentMobile : styles.content}>
          <div style={isMobile ? styles.formSectionMobile : styles.formSection}>

            {/* Existing Casinos Section */}
            {!loadingCasinos && existingCasinos.length > 0 && (
              <div style={styles.card}>
                <h3 style={styles.cardTitle}>Your Casinos</h3>
                <p style={styles.cardSubtitle}>Add transactions to an existing casino</p>
                <div style={styles.existingCasinosList}>
                  {existingCasinos.map(casino => (
                    <div key={casino.id} style={styles.existingCasinoRow}>
                      <div style={styles.existingCasinoLeft}>
                        <div style={{ ...styles.existingCasinoAvatar, backgroundColor: getAvatarColor(casino.name) }}>
                          {casino.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p style={styles.existingCasinoName}>{casino.name}</p>
                          {casino.note && <p style={styles.existingCasinoNote}>{casino.note}</p>}
                        </div>
                      </div>
                      <button
                        style={styles.existingCasinoBtn}
                        onClick={() => setAddTransactionCasino(casino)}
                      >
                        <Plus size={14} />
                        <span>Add Transaction</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Divider between existing and new */}
            {existingCasinos.length > 0 && (
              <div style={styles.sectionDivider}>
                <div style={styles.sectionDividerLine} />
                <span style={styles.sectionDividerText}>Add a new casino</span>
                <div style={styles.sectionDividerLine} />
              </div>
            )}

            {/* New Casino Form */}
            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Casino Details</h3>
              <p style={styles.cardSubtitle}>Which casino would you like to add?</p>
              {error && <div style={styles.errorBox}>{error}</div>}
              <div style={styles.field}>
                <label style={styles.label}>Casino Name *</label>
                <input style={styles.input} type="text" value={casinoName} onChange={(e) => setCasinoName(e.target.value)} placeholder="e.g. LeoVegas, Bet365, 888 Casino" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Note (optional)</label>
                <input style={styles.input} type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. withdrawal pending, bonus expires soon" />
              </div>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Transaction Data</h3>
              <p style={styles.cardSubtitle}>Choose how you want to add your data</p>
              <div style={isMobile ? styles.modeSelectorMobile : styles.modeSelector}>
                <button style={{ ...styles.modeBtn, ...(inputMode === 'lifetime' ? styles.modeBtnActive : {}) }} onClick={() => setInputMode('lifetime')}>
                  <TrendingUp size={20} color={inputMode === 'lifetime' ? '#0ea5e9' : '#94a3b8'} />
                  <span style={styles.modeLabel}>Lifetime Totals</span>
                  {!isMobile && <span style={styles.modeDesc}>Enter your overall totals</span>}
                </button>
                <button style={{ ...styles.modeBtn, ...(inputMode === 'transactions' ? styles.modeBtnActive : {}) }} onClick={() => setInputMode('transactions')}>
                  <Hash size={20} color={inputMode === 'transactions' ? '#0ea5e9' : '#94a3b8'} />
                  <span style={styles.modeLabel}>Transactions</span>
                  {!isMobile && <span style={styles.modeDesc}>Log each transaction with a date</span>}
                </button>
                <button style={{ ...styles.modeBtn, ...(inputMode === 'csv' ? styles.modeBtnActive : {}) }} onClick={() => setInputMode('csv')}>
                  <Upload size={20} color={inputMode === 'csv' ? '#0ea5e9' : '#94a3b8'} />
                  <span style={styles.modeLabel}>CSV Upload</span>
                  {!isMobile && <span style={styles.modeDesc}>Import from casino export</span>}
                </button>
              </div>

              {inputMode === 'lifetime' && (
                <div style={styles.inputSection}>
                  <div style={isMobile ? styles.fieldFull : styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Total Deposits ({symbol}) *</label>
                      <input style={styles.input} type="number" value={lifetimeData.deposits} onChange={(e) => setLifetimeData({ ...lifetimeData, deposits: e.target.value })} placeholder="0" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Total Withdrawals ({symbol})</label>
                      <input style={styles.input} type="number" value={lifetimeData.withdrawals} onChange={(e) => setLifetimeData({ ...lifetimeData, withdrawals: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                  <div style={isMobile ? styles.fieldFull : styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Total Bonuses ({symbol})</label>
                      <input style={styles.input} type="number" value={lifetimeData.bonuses} onChange={(e) => setLifetimeData({ ...lifetimeData, bonuses: e.target.value })} placeholder="0" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Current Balance ({symbol})</label>
                      <input style={styles.input} type="number" value={lifetimeData.currentBalance} onChange={(e) => setLifetimeData({ ...lifetimeData, currentBalance: e.target.value })} placeholder="0" />
                      <p style={styles.fieldHint}>Amount currently in your casino account</p>
                    </div>
                  </div>
                  <p style={styles.inputHint}>You can always add individual transactions later to enable time-based filtering</p>
                </div>
              )}

              {inputMode === 'transactions' && (
                <div style={styles.inputSection}>
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id} style={styles.transactionCard}>
                      <div style={styles.transactionCardHeader}>
                        <div style={styles.transactionBadge}>
                          {transaction.type === 'Deposit' ? <ArrowDownCircle size={14} color="#0ea5e9" /> : transaction.type === 'Withdrawal' ? <ArrowUpCircle size={14} color="#10b981" /> : <Gift size={14} color="#f59e0b" />}
                          <span style={styles.transactionBadgeText}>Transaction {index + 1}</span>
                        </div>
                        {transactions.length > 1 && <button onClick={() => removeTransaction(transaction.id)} style={styles.removeBtn}>Remove</button>}
                      </div>
                      <div style={isMobile ? styles.transactionFieldsMobile : styles.transactionFields}>
                        <div style={styles.transactionField}>
                          <label style={styles.label}>Date *</label>
                          <input style={styles.input} type="date" value={transaction.date} onChange={(e) => updateTransaction(transaction.id, 'date', e.target.value)} />
                        </div>
                        <div style={styles.transactionField}>
                          <label style={styles.label}>Type *</label>
                          <select style={styles.input} value={transaction.type} onChange={(e) => updateTransaction(transaction.id, 'type', e.target.value)}>
                            <option value="Deposit">Deposit</option>
                            <option value="Withdrawal">Withdrawal</option>
                            <option value="Bonus">Bonus</option>
                          </select>
                        </div>
                        <div style={styles.transactionField}>
                          <label style={styles.label}>Amount ({symbol}) *</label>
                          <input style={styles.input} type="number" value={transaction.amount} onChange={(e) => updateTransaction(transaction.id, 'amount', e.target.value)} placeholder="0" />
                        </div>
                        <div style={styles.transactionField}>
                          <label style={styles.label}>Game Type</label>
                          <select style={styles.input} value={transaction.gameType} onChange={(e) => updateTransaction(transaction.id, 'gameType', e.target.value)}>
                            <option value="">Select game</option>
                            {gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
                          </select>
                        </div>
                      </div>
                      {transaction.gameType === 'Other' && (
                        <div style={{ marginTop: '8px' }}>
                          <label style={styles.label}>Specify Game</label>
                          <input style={styles.input} type="text" value={transaction.customGame} onChange={(e) => updateTransaction(transaction.id, 'customGame', e.target.value)} placeholder="e.g. Crazy Time, Lightning Roulette" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div style={styles.field}>
                    <label style={styles.label}>Current Balance ({symbol})</label>
                    <input style={styles.input} type="number" value={lifetimeData.currentBalance} onChange={(e) => setLifetimeData({ ...lifetimeData, currentBalance: e.target.value })} placeholder="Amount currently in your casino account" />
                  </div>
                  <button onClick={addTransaction} style={styles.addRowBtn}>+ Add Another Transaction</button>
                </div>
              )}

              {inputMode === 'csv' && (
                <div style={styles.inputSection}>
                  <div style={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
                    {csvFile ? (
                      <div style={styles.uploadSuccessContent}>
                        <CheckCircle size={32} color="#16a34a" />
                        <p style={styles.uploadSuccessText}>{csvFileName}</p>
                        <p style={styles.uploadSuccessSubtext}>{csvAllRows.length} rows found — click to replace</p>
                        {csvResults && <p style={styles.uploadSuccessSubtext}>{csvResults.depositCount + csvResults.withdrawalCount + csvResults.bonusCount} valid transactions imported</p>}
                      </div>
                    ) : (
                      <div style={styles.uploadDefaultContent}>
                        <Upload size={32} color="#94a3b8" />
                        <p style={styles.uploadText}>Click to upload your casino transaction export</p>
                        <p style={styles.uploadSubtext}>Supports CSV files (.csv)</p>
                        <div style={styles.uploadBtn}>Choose File</div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />
                  {csvFile && csvResults && (
                    <button style={styles.remapBtn} onClick={() => setShowManualMapping(true)}>
                      Something looks wrong? Adjust the mapping
                    </button>
                  )}
                  <div style={styles.uploadHintBox}>
                    <p style={styles.uploadHintTitle}>How to get your transaction export</p>
                    <p style={styles.uploadHintText}>Most licensed casinos allow you to download your transaction history from your account settings. Look for "Transaction History" or "Payment History" in your casino account.</p>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitle}>Favourite Game</h3>
              <p style={styles.cardSubtitle}>Which game do you play most at this casino?</p>
              <div style={isMobile ? styles.gameFieldsMobile : styles.gameFields}>
                <div style={styles.gameField}>
                  <label style={styles.label}>Game Type</label>
                  <select style={styles.input} value={favoriteGame.gameType} onChange={(e) => setFavoriteGame({ ...favoriteGame, gameType: e.target.value })}>
                    <option value="">Select game type</option>
                    {gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div style={styles.gameField}>
                  <label style={styles.label}>Specific Game (optional)</label>
                  <input style={styles.input} type="text" value={favoriteGame.specificGame} onChange={(e) => setFavoriteGame({ ...favoriteGame, specificGame: e.target.value })} placeholder="e.g. Crazy Time" />
                </div>
                <div style={styles.gameField}>
                  <label style={styles.label}>Amount Wagered ({symbol})</label>
                  <input style={styles.input} type="number" value={favoriteGame.amountWagered} onChange={(e) => setFavoriteGame({ ...favoriteGame, amountWagered: e.target.value })} placeholder="0" />
                </div>
              </div>
            </div>

            {isMobile && <SummaryCard />}
          </div>

          {!isMobile && (
            <div style={styles.summarySection}>
              <SummaryCard />
            </div>
          )}
        </div>
        <Footer jurisdiction={profile?.country} />
      </div>

      {isMobile && (
        <div style={styles.bottomNav}>
          {navItems.map(item => (
            <Link key={item.id} to={item.path} style={{ ...styles.bottomNavItem, ...(item.id === 'casinos' ? styles.bottomNavItemActive : {}) }}>
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
  content: { padding: '24px 28px', display: 'flex', gap: '24px', alignItems: 'flex-start', flex: 1 },
  contentMobile: { padding: '16px', flex: 1 },
  formSection: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
  formSectionMobile: { display: 'flex', flexDirection: 'column', gap: '14px' },
  summarySection: { width: '280px', position: 'sticky', top: '80px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' },
  cardSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' },
  existingCasinosList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  existingCasinoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' },
  existingCasinoLeft: { display: 'flex', alignItems: 'center', gap: '10px' },
  existingCasinoAvatar: { width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '15px', fontWeight: '800', flexShrink: 0 },
  existingCasinoName: { color: '#0f172a', fontSize: '14px', fontWeight: '700', margin: 0 },
  existingCasinoNote: { color: '#94a3b8', fontSize: '12px', margin: '2px 0 0 0' },
  existingCasinoBtn: { display: 'flex', alignItems: 'center', gap: '5px', padding: '7px 12px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap', flexShrink: 0 },
  sectionDivider: { display: 'flex', alignItems: 'center', gap: '12px' },
  sectionDividerLine: { flex: 1, height: '1px', backgroundColor: '#e2e8f0' },
  sectionDividerText: { color: '#94a3b8', fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap' },
  field: { flex: 1, marginBottom: '14px' },
  row: { display: 'flex', gap: '16px' },
  fieldFull: { display: 'flex', flexDirection: 'column' },
  label: { display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' },
  input: { width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  fieldHint: { color: '#94a3b8', fontSize: '12px', margin: '6px 0 0 0' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '14px' },
  modeSelector: { display: 'flex', gap: '10px', marginBottom: '20px' },
  modeSelectorMobile: { display: 'flex', gap: '8px', marginBottom: '16px' },
  modeBtn: { flex: 1, padding: '12px 8px', borderRadius: '10px', border: '2px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  modeBtnActive: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  modeLabel: { color: '#1e293b', fontSize: '12px', fontWeight: '700', textAlign: 'center' },
  modeDesc: { color: '#94a3b8', fontSize: '11px', textAlign: 'center' },
  inputSection: { marginTop: '4px' },
  inputHint: { color: '#64748b', fontSize: '12px', backgroundColor: '#f8fafc', padding: '10px 12px', borderRadius: '8px', margin: '8px 0 0 0' },
  transactionCard: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '10px', border: '1px solid #e2e8f0' },
  transactionCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  transactionBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '5px 10px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  transactionBadgeText: { color: '#64748b', fontSize: '12px', fontWeight: '600' },
  removeBtn: { color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  transactionFields: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' },
  transactionFieldsMobile: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  transactionField: { display: 'flex', flexDirection: 'column' },
  addRowBtn: { width: '100%', padding: '12px', backgroundColor: 'white', border: '2px dashed #e2e8f0', borderRadius: '10px', color: '#0ea5e9', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  uploadArea: { border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '32px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', marginBottom: '14px' },
  uploadDefaultContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' },
  uploadSuccessContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  uploadText: { color: '#1e293b', fontSize: '14px', fontWeight: '600', margin: 0 },
  uploadSubtext: { color: '#94a3b8', fontSize: '12px', margin: 0 },
  uploadBtn: { display: 'inline-block', padding: '8px 18px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '600' },
  uploadSuccessText: { color: '#1e293b', fontSize: '14px', fontWeight: '600', margin: 0 },
  uploadSuccessSubtext: { color: '#64748b', fontSize: '12px', margin: 0 },
  remapBtn: { width: '100%', padding: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '13px', cursor: 'pointer', marginBottom: '14px', textAlign: 'center' },
  uploadHintBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '12px 14px' },
  uploadHintTitle: { color: '#0369a1', fontSize: '13px', fontWeight: '600', margin: '0 0 4px 0' },
  uploadHintText: { color: '#0369a1', fontSize: '12px', lineHeight: '1.5', margin: 0 },
  gameFields: { display: 'flex', gap: '10px', alignItems: 'flex-end' },
  gameFieldsMobile: { display: 'flex', flexDirection: 'column', gap: '10px' },
  gameField: { flex: 1 },
  summaryCard: { backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  summaryLabel: { color: '#64748b', fontSize: '13px' },
  summaryValue: { color: '#1e293b', fontSize: '13px', fontWeight: '600' },
  summaryGamesTitle: { color: '#374151', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '10px 0' },
  submitBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '14px', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  cancelBtn: { display: 'block', textAlign: 'center', marginTop: '10px', color: '#64748b', fontSize: '14px', textDecoration: 'none' },
  bottomNav: { position: 'fixed', bottom: 0, left: 0, right: 0, backgroundColor: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '8px 0', zIndex: 100, boxShadow: '0 -2px 10px rgba(0,0,0,0.08)' },
  bottomNavItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', color: '#94a3b8', textDecoration: 'none', fontSize: '10px', fontWeight: '500', padding: '4px 12px', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', minWidth: '60px' },
  bottomNavItemActive: { color: '#0ea5e9' },
  bottomNavIcon: { display: 'flex', alignItems: 'center' },
  bottomNavLabel: { fontSize: '10px', fontWeight: '500' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' },
  modalCard: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  modalTitle: { color: '#0f172a', fontSize: '18px', fontWeight: '800', margin: 0 },
  modalSubtitle: { color: '#64748b', fontSize: '14px', margin: '0 0 24px 0', lineHeight: '1.5' },
  modalStatsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' },
  modalStat: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' },
  modalStatIcon: { marginBottom: '8px' },
  modalStatLabel: { color: '#64748b', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 4px 0' },
  modalStatValue: { color: '#0f172a', fontSize: '20px', fontWeight: '800', margin: '0 0 2px 0' },
  modalStatCount: { color: '#94a3b8', fontSize: '11px', margin: 0 },
  modalNetResult: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderRadius: '10px', marginBottom: '24px' },
  modalNetLabel: { color: '#374151', fontSize: '14px', fontWeight: '600' },
  modalNetValue: { fontSize: '20px', fontWeight: '800' },
  modalActions: { display: 'flex', gap: '12px' },
  modalPrimaryBtn: { flex: 1, padding: '14px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  modalSecondaryBtn: { flex: 1, padding: '14px', backgroundColor: 'white', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', cursor: 'pointer' },
  previewTableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' },
  previewTable: { width: '100%', borderCollapse: 'collapse', fontSize: '12px' },
  previewTh: { backgroundColor: '#f1f5f9', padding: '8px 10px', textAlign: 'left', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  previewTd: { padding: '7px 10px', color: '#64748b', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis' },
  mappingGrid: { display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' },
  mappingRow: { display: 'flex', flexDirection: 'column', gap: '6px' },
  mappingLabel: { display: 'flex', alignItems: 'center', gap: '8px', color: '#374151', fontSize: '13px', fontWeight: '600' },
  mappingLabelIcon: { display: 'flex', alignItems: 'center', flexShrink: 0 },
};

export default AddCasino;
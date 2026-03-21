import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, User, Scale, LogOut } from 'lucide-react';
import Footer from '../components/Footer';

function AddCasino({ user, onLogout }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [casinoName, setCasinoName] = useState('');
  const [note, setNote] = useState('');
  const [inputMode, setInputMode] = useState('lifetime');
  const [error, setError] = useState('');
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');

  const [lifetimeData, setLifetimeData] = useState({
    deposits: '', withdrawals: '', bonuses: '', currentBalance: '',
  });

  const [transactions, setTransactions] = useState([
    { id: 1, date: '', type: 'Deposit', amount: '', gameType: '', customGame: '' }
  ]);

  const [favoriteGames, setFavoriteGames] = useState([
    { id: 1, name: '', customName: '', amountPlayed: '' }
  ]);

  const currency = user.currency || 'EUR';
  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'SEK' ? 'kr' : currency === 'DKK' ? 'kr' : '€';
  const gameTypes = ['Slots', 'Live Casino', 'Blackjack', 'Roulette', 'Poker', 'Baccarat', 'Sports Betting', 'Other'];

  const addTransaction = () => setTransactions([...transactions, { id: transactions.length + 1, date: '', type: 'Deposit', amount: '', gameType: '', customGame: '' }]);
  const removeTransaction = (id) => { if (transactions.length === 1) return; setTransactions(transactions.filter(t => t.id !== id)); };
  const updateTransaction = (id, field, value) => setTransactions(transactions.map(t => t.id === id ? { ...t, [field]: value } : t));
  const addFavoriteGame = () => setFavoriteGames([...favoriteGames, { id: favoriteGames.length + 1, name: '', customName: '', amountPlayed: '' }]);
  const removeFavoriteGame = (id) => { if (favoriteGames.length === 1) return; setFavoriteGames(favoriteGames.filter(g => g.id !== id)); };
  const updateFavoriteGame = (id, field, value) => setFavoriteGames(favoriteGames.map(g => g.id === id ? { ...g, [field]: value } : g));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError('Please upload a CSV or Excel file');
      return;
    }
    setCsvFileName(file.name);
    setCsvUploaded(true);
    setError('');
  };

  const totalDeposits = inputMode === 'lifetime' ? Number(lifetimeData.deposits) || 0 : transactions.filter(t => t.type === 'Deposit').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalWithdrawals = inputMode === 'lifetime' ? Number(lifetimeData.withdrawals) || 0 : transactions.filter(t => t.type === 'Withdrawal').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const totalBonuses = inputMode === 'lifetime' ? Number(lifetimeData.bonuses) || 0 : transactions.filter(t => t.type === 'Bonus').reduce((sum, t) => sum + (Number(t.amount) || 0), 0);
  const currentBalance = inputMode === 'lifetime' ? Number(lifetimeData.currentBalance) || 0 : 0;
  const netResult = totalWithdrawals + currentBalance - totalDeposits;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!casinoName) { setError('Please enter a casino name'); return; }
    if (inputMode === 'transactions' && transactions.some(t => !t.date || !t.amount)) { setError('Please fill in a date and amount for each transaction'); return; }
    if (inputMode === 'lifetime' && !lifetimeData.deposits) { setError('Please enter at least your total deposits'); return; }
    alert(`Casino "${casinoName}" added successfully!`);
    navigate('/dashboard');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, path: '/dashboard' },
    { id: 'casinos', label: 'Casinos', icon: <Building2 size={18} />, path: '/add-casino' },
    { id: 'profile', label: 'Profile', icon: <User size={18} />, path: '/profile' },
    { id: 'disputes', label: 'Disputes', icon: <Scale size={18} />, path: '/dashboard' },
  ];

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

      <div style={styles.mainContent}>
        <div style={styles.topBar}>
          <h2 style={styles.pageTitle}>Add Casino</h2>
          <span style={styles.greeting}>Hi, {user.name}</span>
        </div>

        <div style={styles.content}>
          <div style={styles.formSection}>
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
              <div style={styles.modeSelector}>
                <button style={{ ...styles.modeBtn, ...(inputMode === 'lifetime' ? styles.modeBtnActive : {}) }} onClick={() => setInputMode('lifetime')}>
                  <span style={styles.modeIcon}>📊</span>
                  <span style={styles.modeLabel}>Lifetime Totals</span>
                  <span style={styles.modeDesc}>Enter your overall totals</span>
                </button>
                <button style={{ ...styles.modeBtn, ...(inputMode === 'transactions' ? styles.modeBtnActive : {}) }} onClick={() => setInputMode('transactions')}>
                  <span style={styles.modeIcon}>📋</span>
                  <span style={styles.modeLabel}>Individual Transactions</span>
                  <span style={styles.modeDesc}>Log each transaction with a date</span>
                </button>
                <button style={{ ...styles.modeBtn, ...(inputMode === 'csv' ? styles.modeBtnActive : {}) }} onClick={() => setInputMode('csv')}>
                  <span style={styles.modeIcon}>📁</span>
                  <span style={styles.modeLabel}>Upload CSV / Excel</span>
                  <span style={styles.modeDesc}>Import from casino export</span>
                </button>
              </div>

              {inputMode === 'lifetime' && (
                <div style={styles.inputSection}>
                  <div style={styles.row}>
                    <div style={styles.field}>
                      <label style={styles.label}>Total Deposits ({symbol}) *</label>
                      <input style={styles.input} type="number" value={lifetimeData.deposits} onChange={(e) => setLifetimeData({ ...lifetimeData, deposits: e.target.value })} placeholder="0" />
                    </div>
                    <div style={styles.field}>
                      <label style={styles.label}>Total Withdrawals ({symbol})</label>
                      <input style={styles.input} type="number" value={lifetimeData.withdrawals} onChange={(e) => setLifetimeData({ ...lifetimeData, withdrawals: e.target.value })} placeholder="0" />
                    </div>
                  </div>
                  <div style={styles.row}>
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
                  <p style={styles.inputHint}>💡 You can always add individual transactions later to enable time-based filtering</p>
                </div>
              )}

              {inputMode === 'transactions' && (
                <div style={styles.inputSection}>
                  {transactions.map((transaction, index) => (
                    <div key={transaction.id} style={styles.transactionCard}>
                      <div style={styles.transactionCardHeader}>
                        <div style={styles.transactionBadge}>
                          {transaction.type === 'Deposit' ? '⬇️' : transaction.type === 'Withdrawal' ? '⬆️' : '🎁'}
                          <span style={styles.transactionBadgeText}>Transaction {index + 1}</span>
                        </div>
                        {transactions.length > 1 && <button onClick={() => removeTransaction(transaction.id)} style={styles.removeBtn}>✕ Remove</button>}
                      </div>
                      <div style={styles.transactionFields}>
                        <div style={styles.transactionField}>
                          <label style={styles.label}>Date *</label>
                          <input style={styles.input} type="date" value={transaction.date} onChange={(e) => updateTransaction(transaction.id, 'date', e.target.value)} />
                        </div>
                        <div style={styles.transactionField}>
                          <label style={styles.label}>Type *</label>
                          <select style={styles.input} value={transaction.type} onChange={(e) => updateTransaction(transaction.id, 'type', e.target.value)}>
                            <option value="Deposit">⬇️ Deposit</option>
                            <option value="Withdrawal">⬆️ Withdrawal</option>
                            <option value="Bonus">🎁 Bonus</option>
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
                    {csvUploaded ? (
                      <div style={styles.uploadSuccess}>
                        <span style={styles.uploadIcon}>✅</span>
                        <p style={styles.uploadSuccessText}>{csvFileName}</p>
                        <p style={styles.uploadSuccessSubtext}>File uploaded successfully. We will extract your transaction data automatically.</p>
                      </div>
                    ) : (
                      <div style={styles.uploadPrompt}>
                        <span style={styles.uploadIcon}>📁</span>
                        <p style={styles.uploadText}>Click to upload your casino transaction export</p>
                        <p style={styles.uploadSubtext}>Supports CSV and Excel files (.csv, .xlsx, .xls)</p>
                        <div style={styles.uploadBtn}>Choose File</div>
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} style={{ display: 'none' }} />
                  <div style={styles.field}>
                    <label style={styles.label}>Current Balance ({symbol})</label>
                    <input style={styles.input} type="number" value={lifetimeData.currentBalance} onChange={(e) => setLifetimeData({ ...lifetimeData, currentBalance: e.target.value })} placeholder="Amount currently in your casino account" />
                  </div>
                  <div style={styles.uploadHintBox}>
                    <p style={styles.uploadHintTitle}>💡 How to get your transaction export</p>
                    <p style={styles.uploadHintText}>Most licensed casinos allow you to download your transaction history from your account settings. Look for "Transaction History", "Account Activity" or "Payment History" in your casino account. Download as CSV or Excel and upload it here.</p>
                  </div>
                </div>
              )}
            </div>

            <div style={styles.card}>
              <div style={styles.cardTitleRow}>
                <div>
                  <h3 style={styles.cardTitle}>Favourite Games</h3>
                  <p style={styles.cardSubtitle}>Which games do you play at this casino and how much have you played?</p>
                </div>
                <button onClick={addFavoriteGame} style={styles.addGameBtn}>+ Add Game</button>
              </div>
              {favoriteGames.map((game) => (
                <div key={game.id} style={styles.gameRow}>
                  <div style={styles.gameFields}>
                    <div style={styles.gameField}>
                      <label style={styles.label}>Game Type</label>
                      <select style={styles.input} value={game.name} onChange={(e) => updateFavoriteGame(game.id, 'name', e.target.value)}>
                        <option value="">Select game type</option>
                        {gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div style={styles.gameField}>
                      <label style={styles.label}>Specific Game (optional)</label>
                      <input style={styles.input} type="text" value={game.customName} onChange={(e) => updateFavoriteGame(game.id, 'customName', e.target.value)} placeholder="e.g. Crazy Time, Book of Dead" />
                    </div>
                    <div style={styles.gameField}>
                      <label style={styles.label}>Amount Played ({symbol})</label>
                      <input style={styles.input} type="number" value={game.amountPlayed} onChange={(e) => updateFavoriteGame(game.id, 'amountPlayed', e.target.value)} placeholder="0" />
                    </div>
                    {favoriteGames.length > 1 && <button onClick={() => removeFavoriteGame(game.id)} style={styles.removeGameBtn}>✕</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.summarySection}>
            <div style={styles.summaryCard}>
              <h3 style={styles.cardTitle}>Summary</h3>
              <div style={styles.summaryRow}><span style={styles.summaryLabel}>Casino</span><span style={styles.summaryValue}>{casinoName || '—'}</span></div>
              <div style={styles.summaryRow}><span style={styles.summaryLabel}>Data Type</span><span style={styles.summaryValue}>{inputMode === 'lifetime' ? 'Lifetime Totals' : inputMode === 'transactions' ? `${transactions.length} Transactions` : 'CSV Upload'}</span></div>
              <div style={styles.divider} />
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
              {favoriteGames[0].name && (
                <>
                  <div style={styles.divider} />
                  <p style={styles.summaryGamesTitle}>Favourite Games</p>
                  {favoriteGames.filter(g => g.name).map(g => (
                    <div key={g.id} style={styles.summaryRow}>
                      <span style={styles.summaryLabel}>{g.customName || g.name}</span>
                      <span style={styles.summaryValue}>{g.amountPlayed ? `${symbol}${g.amountPlayed}` : '—'}</span>
                    </div>
                  ))}
                </>
              )}
              <button onClick={handleSubmit} style={styles.submitBtn}>Add Casino</button>
              <Link to="/dashboard" style={styles.cancelBtn}>Cancel</Link>
            </div>
          </div>
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
  content: { padding: '24px 28px', display: 'flex', gap: '24px', alignItems: 'flex-start', flex: 1 },
  formSection: { flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' },
  summarySection: { width: '280px', position: 'sticky', top: '80px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardTitle: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 4px 0' },
  cardTitleRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' },
  cardSubtitle: { color: '#94a3b8', fontSize: '13px', margin: '0 0 20px 0' },
  field: { flex: 1, marginBottom: '16px' },
  row: { display: 'flex', gap: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#374151', fontSize: '13px', fontWeight: '600' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  fieldHint: { color: '#94a3b8', fontSize: '12px', margin: '6px 0 0 0' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  modeSelector: { display: 'flex', gap: '12px', marginBottom: '24px' },
  modeBtn: { flex: 1, padding: '16px 12px', borderRadius: '10px', border: '2px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' },
  modeBtnActive: { borderColor: '#0ea5e9', backgroundColor: '#f0f9ff' },
  modeIcon: { fontSize: '24px' },
  modeLabel: { color: '#1e293b', fontSize: '13px', fontWeight: '700' },
  modeDesc: { color: '#94a3b8', fontSize: '11px' },
  inputSection: { marginTop: '4px' },
  inputHint: { color: '#64748b', fontSize: '13px', backgroundColor: '#f8fafc', padding: '10px 14px', borderRadius: '8px', margin: '8px 0 0 0' },
  transactionCard: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '16px', marginBottom: '12px', border: '1px solid #e2e8f0' },
  transactionCardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' },
  transactionBadge: { display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '6px 12px', borderRadius: '20px', border: '1px solid #e2e8f0' },
  transactionBadgeText: { color: '#64748b', fontSize: '13px', fontWeight: '600' },
  removeBtn: { color: '#ef4444', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '500' },
  transactionFields: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' },
  transactionField: { display: 'flex', flexDirection: 'column' },
  addRowBtn: { width: '100%', padding: '12px', backgroundColor: 'white', border: '2px dashed #e2e8f0', borderRadius: '10px', color: '#0ea5e9', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '4px' },
  uploadArea: { border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '40px 24px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc', marginBottom: '16px' },
  uploadPrompt: {},
  uploadSuccess: {},
  uploadIcon: { fontSize: '40px', display: 'block', marginBottom: '12px' },
  uploadText: { color: '#1e293b', fontSize: '15px', fontWeight: '600', margin: '0 0 8px 0' },
  uploadSubtext: { color: '#94a3b8', fontSize: '13px', margin: '0 0 16px 0' },
  uploadBtn: { display: 'inline-block', padding: '8px 20px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', fontSize: '13px', fontWeight: '600' },
  uploadSuccessText: { color: '#1e293b', fontSize: '15px', fontWeight: '600', margin: '0 0 4px 0' },
  uploadSuccessSubtext: { color: '#64748b', fontSize: '13px', margin: 0 },
  uploadHintBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '10px', padding: '14px 16px' },
  uploadHintTitle: { color: '#0369a1', fontSize: '13px', fontWeight: '600', margin: '0 0 6px 0' },
  uploadHintText: { color: '#0369a1', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  gameRow: { marginBottom: '12px' },
  gameFields: { display: 'flex', gap: '12px', alignItems: 'flex-end' },
  gameField: { flex: 1 },
  addGameBtn: { backgroundColor: '#f0f9ff', color: '#0ea5e9', border: '1px solid #bae6fd', borderRadius: '8px', padding: '8px 16px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  removeGameBtn: { padding: '10px 12px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', marginBottom: '16px' },
  summaryCard: { backgroundColor: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  summaryRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' },
  summaryLabel: { color: '#64748b', fontSize: '13px' },
  summaryValue: { color: '#1e293b', fontSize: '13px', fontWeight: '600' },
  summaryGamesTitle: { color: '#374151', fontSize: '13px', fontWeight: '600', margin: '0 0 8px 0' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' },
  submitBtn: { width: '100%', padding: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', marginTop: '16px', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  cancelBtn: { display: 'block', textAlign: 'center', marginTop: '12px', color: '#64748b', fontSize: '14px', textDecoration: 'none' },
};

export default AddCasino;
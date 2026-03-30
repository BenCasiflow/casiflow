import React, { useState, useRef } from 'react';
import { X, ArrowDownCircle, ArrowUpCircle, Gift, Calendar, DollarSign, Plus, Trash2, Upload, CheckCircle, Wallet } from 'lucide-react';
import { supabase } from '../supabaseClient';

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

const TYPE_MAPPINGS = {
  deposit: ['deposit', 'deposits', 'dep', 'credit', 'fund', 'funding', 'top up', 'topup', 'payment in', 'money in'],
  withdrawal: ['withdrawal', 'withdrawals', 'withdraw', 'debit', 'cashout', 'cash out', 'payout', 'payment out', 'money out'],
  bonus: ['bonus', 'bonuses', 'free spin', 'free spins', 'promotion', 'promo', 'reward', 'cashback'],
};

const COMPLETED_STATUSES = ['completed', 'complete', 'success', 'successful', 'approved', 'processed', 'settled', 'confirmed', 'done', 'ok'];

const COLUMN_HINTS = {
  date: ['date', 'timestamp', 'time', 'datetime', 'transaction date', 'trans date', 'created', 'created at'],
  type: ['type', 'transaction type', 'trans type', 'kind', 'category'],
  amount: ['amount', 'value', 'sum', 'total', 'transaction amount'],
  deposits: ['deposits', 'deposit', 'dep', 'amount in', 'money in', 'credit'],
  withdrawals: ['withdrawals', 'withdrawal', 'withdraw', 'amount out', 'money out', 'debit'],
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

function mapTransactionType(value) {
  if (!value) return null;
  const lower = value.toLowerCase().trim();
  for (const [type, variations] of Object.entries(TYPE_MAPPINGS)) {
    if (variations.some(v => lower.includes(v))) return type;
  }
  return null;
}

function processCSVRows(rows, mapping) {
  let deposits = 0, depositCount = 0, withdrawals = 0, withdrawalCount = 0, bonuses = 0, bonusCount = 0;
  let latestBalance = null;
  const transactions = [];
  const seenIds = new Set();
  const hasSplitColumns = !mapping.type && (mapping.deposits || mapping.withdrawals);

  for (const row of rows) {
    if (mapping.status) {
      const statusVal = row[mapping.status];
      if (statusVal && !COMPLETED_STATUSES.some(s => statusVal.toLowerCase().includes(s))) continue;
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
      const typeVal = mapTransactionType(mapping.type ? row[mapping.type] : null);
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

function AddTransactionModal({ casino, userId, currency, onClose, onSaved }) {
  const [activeTab, setActiveTab] = useState('transactions');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Transactions tab state
  const [rows, setRows] = useState([
    { id: 1, date: new Date().toISOString().slice(0, 10), type: 'deposit', amount: '', gameType: '', customGame: '' }
  ]);

  // Balance tab state
  const [newBalance, setNewBalance] = useState(String(casino.currentBalance || ''));

  // CSV tab state
  const fileInputRef = useRef(null);
  const [csvFile, setCsvFile] = useState(null);
  const [csvFileName, setCsvFileName] = useState('');
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvPreviewRows, setCsvPreviewRows] = useState([]);
  const [csvAllRows, setCsvAllRows] = useState([]);
  const [csvMapping, setCsvMapping] = useState({});
  const [csvResults, setCsvResults] = useState(null);
  const [showManualMapping, setShowManualMapping] = useState(false);

  const symbol = currency === 'GBP' ? '£' : currency === 'USD' ? '$' : currency === 'SEK' ? 'kr' : currency === 'DKK' ? 'kr' : '€';
  const gameTypes = ['Slots', 'Live Casino', 'Blackjack', 'Roulette', 'Poker', 'Baccarat', 'Sports Betting', 'Other'];

  const addRow = () => setRows(prev => [...prev, { id: prev.length + 1, date: new Date().toISOString().slice(0, 10), type: 'deposit', amount: '', gameType: '', customGame: '' }]);
  const removeRow = (id) => { if (rows.length === 1) return; setRows(prev => prev.filter(r => r.id !== id)); };
  const updateRow = (id, field, value) => setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: value } : r));

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setError('Please upload a CSV file (.csv)'); return; }
    setError('');
    setCsvFile(file);
    setCsvFileName(file.name);
    setCsvResults(null);
    setShowManualMapping(false);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const { headers, rows: csvRows } = parseCSVText(event.target.result);
        if (headers.length === 0 || csvRows.length === 0) { setError('The file appears to be empty.'); return; }
        setCsvHeaders(headers);
        setCsvPreviewRows(csvRows.slice(0, 3));
        setCsvAllRows(csvRows);
        const mapping = autoDetectMapping(headers);
        setCsvMapping(mapping);
        const results = processCSVRows(csvRows, mapping);
        setCsvResults(results);
      } catch { setError('Could not read the file. Please make sure it is a valid CSV file.'); }
    };
    reader.onerror = () => setError('Could not read the file. Please try again.');
    reader.readAsText(file);
  };

  const handleRemapAndRecalculate = () => {
    const results = processCSVRows(csvAllRows, csvMapping);
    setCsvResults(results);
    setShowManualMapping(false);
  };

  const handleSaveTransactions = async () => {
    setError('');
    if (rows.some(r => !r.date || !r.amount || Number(r.amount) <= 0)) {
      setError('Please fill in a date and amount for every transaction.');
      return;
    }

    setLoading(true);
    const toInsert = rows.map(r => ({
      casino_id: casino.id,
      user_id: userId,
      date: r.date,
      type: r.type,
      amount: Number(r.amount),
      game_type: r.gameType === 'Other' ? r.customGame || 'Other' : r.gameType || null,
      entry_method: 'manual',
    }));

    const { error: insertError } = await supabase.from('transactions').insert(toInsert);
    if (insertError) { setError('Could not save transactions. Please try again.'); setLoading(false); return; }
    setLoading(false);
    onSaved();
  };

  const handleSaveBalance = async () => {
    setError('');
    if (newBalance === '' || isNaN(Number(newBalance))) { setError('Please enter a valid balance.'); return; }
    setLoading(true);
    const { error: updateError } = await supabase.from('casinos').update({ current_balance: Number(newBalance) }).eq('id', casino.id);
    if (updateError) { setError('Could not update balance. Please try again.'); setLoading(false); return; }
    setLoading(false);
    setSuccessMessage('Balance updated successfully.');
    setTimeout(() => { onSaved(); }, 1000);
  };

  const handleSaveCSV = async () => {
    setError('');
    if (!csvResults || csvResults.transactions.length === 0) {
      setError('No valid transactions found in your file.');
      return;
    }

    setLoading(true);
    const toInsert = csvResults.transactions.map(t => ({
      casino_id: casino.id,
      user_id: userId,
      date: t.date,
      type: t.type,
      amount: t.amount,
      game_type: null,
      entry_method: 'csv',
      source_transaction_id: t.source_transaction_id || null,
      balance_after: t.balance_after || null,
    }));

    const { error: insertError } = await supabase.from('transactions').insert(toInsert);
    if (insertError) { setError('Could not save transactions. Please try again.'); setLoading(false); return; }

    if (csvResults.latestBalance !== null) {
      await supabase.from('casinos').update({ current_balance: csvResults.latestBalance }).eq('id', casino.id);
    }

    setLoading(false);
    onSaved();
  };

  const tabs = [
    { id: 'transactions', label: 'Add Transactions' },
    { id: 'csv', label: 'CSV Upload' },
    { id: 'balance', label: 'Update Balance' },
  ];

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        {/* Header */}
        <div style={styles.modalHeader}>
          <div>
            <h3 style={styles.modalTitle}>Update {casino.name}</h3>
            <p style={styles.modalSubtitle}>Add transactions, upload a CSV, or update your balance</p>
          </div>
          <button style={styles.closeBtn} onClick={onClose}>
            <X size={20} color="#64748b" />
          </button>
        </div>

        {/* Tabs */}
        <div style={styles.tabBar}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              style={{ ...styles.tab, ...(activeTab === tab.id ? styles.tabActive : {}) }}
              onClick={() => { setActiveTab(tab.id); setError(''); setSuccessMessage(''); }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}
        {successMessage && <div style={styles.successBox}>{successMessage}</div>}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div style={styles.tabContent}>
            {rows.map((row, index) => (
              <div key={row.id} style={styles.transactionRow}>
                <div style={styles.transactionRowHeader}>
                  <span style={styles.transactionRowLabel}>Transaction {index + 1}</span>
                  {rows.length > 1 && (
                    <button style={styles.removeRowBtn} onClick={() => removeRow(row.id)}>
                      <Trash2 size={13} color="#ef4444" />
                    </button>
                  )}
                </div>

                {/* Type selector */}
                <div style={styles.typeSelector}>
                  {[
                    { value: 'deposit', label: 'Deposit', icon: <ArrowDownCircle size={14} />, activeStyle: styles.typeBtnDeposit },
                    { value: 'withdrawal', label: 'Withdrawal', icon: <ArrowUpCircle size={14} />, activeStyle: styles.typeBtnWithdrawal },
                    { value: 'bonus', label: 'Bonus', icon: <Gift size={14} />, activeStyle: styles.typeBtnBonus },
                  ].map(t => (
                    <button
                      key={t.value}
                      style={{ ...styles.typeBtn, ...(row.type === t.value ? t.activeStyle : {}) }}
                      onClick={() => updateRow(row.id, 'type', t.value)}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>

                <div style={styles.rowFields}>
                  <div style={styles.rowField}>
                    <label style={styles.label}>
                      <Calendar size={13} color="#64748b" />
                      <span>Date</span>
                    </label>
                    <input style={styles.input} type="date" value={row.date} onChange={(e) => updateRow(row.id, 'date', e.target.value)} />
                  </div>
                  <div style={styles.rowField}>
                    <label style={styles.label}>
                      <DollarSign size={13} color="#64748b" />
                      <span>Amount ({symbol})</span>
                    </label>
                    <input style={styles.input} type="number" value={row.amount} onChange={(e) => updateRow(row.id, 'amount', e.target.value)} placeholder="0" />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}><span>Game Type (optional)</span></label>
                  <select style={styles.input} value={row.gameType} onChange={(e) => updateRow(row.id, 'gameType', e.target.value)}>
                    <option value="">Select game type</option>
                    {gameTypes.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {row.gameType === 'Other' && (
                  <div style={styles.field}>
                    <label style={styles.label}><span>Specify Game</span></label>
                    <input style={styles.input} type="text" value={row.customGame} onChange={(e) => updateRow(row.id, 'customGame', e.target.value)} placeholder="e.g. Crazy Time" />
                  </div>
                )}
              </div>
            ))}

            <button style={styles.addRowBtn} onClick={addRow}>
              <Plus size={14} />
              <span>Add Another Transaction</span>
            </button>

            <div style={styles.actions}>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSaveTransactions} disabled={loading}>
                {loading ? 'Saving...' : `Save ${rows.length} Transaction${rows.length > 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        )}

        {/* CSV Tab */}
        {activeTab === 'csv' && (
          <div style={styles.tabContent}>
            <div style={styles.uploadArea} onClick={() => fileInputRef.current.click()}>
              {csvFile ? (
                <div style={styles.uploadSuccessContent}>
                  <CheckCircle size={28} color="#16a34a" />
                  <p style={styles.uploadSuccessText}>{csvFileName}</p>
                  <p style={styles.uploadSuccessSubtext}>{csvAllRows.length} rows found — click to replace</p>
                </div>
              ) : (
                <div style={styles.uploadDefaultContent}>
                  <Upload size={28} color="#94a3b8" />
                  <p style={styles.uploadText}>Click to upload your casino transaction export</p>
                  <p style={styles.uploadSubtext}>Supports CSV files (.csv)</p>
                  <div style={styles.uploadBtn}>Choose File</div>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept=".csv" onChange={handleFileUpload} style={{ display: 'none' }} />

            {csvResults && !showManualMapping && (
              <div style={styles.csvResultsBox}>
                <p style={styles.csvResultsTitle}>Found in your file:</p>
                <div style={styles.csvResultsGrid}>
                  <div style={styles.csvResultStat}>
                    <ArrowDownCircle size={16} color="#0ea5e9" />
                    <span style={styles.csvResultValue}>{symbol}{csvResults.deposits.toLocaleString()}</span>
                    <span style={styles.csvResultLabel}>{csvResults.depositCount} deposits</span>
                  </div>
                  <div style={styles.csvResultStat}>
                    <ArrowUpCircle size={16} color="#10b981" />
                    <span style={styles.csvResultValue}>{symbol}{csvResults.withdrawals.toLocaleString()}</span>
                    <span style={styles.csvResultLabel}>{csvResults.withdrawalCount} withdrawals</span>
                  </div>
                  {csvResults.bonuses > 0 && (
                    <div style={styles.csvResultStat}>
                      <Gift size={16} color="#f59e0b" />
                      <span style={styles.csvResultValue}>{symbol}{csvResults.bonuses.toLocaleString()}</span>
                      <span style={styles.csvResultLabel}>{csvResults.bonusCount} bonuses</span>
                    </div>
                  )}
                  {csvResults.latestBalance !== null && (
                    <div style={styles.csvResultStat}>
                      <Wallet size={16} color="#8b5cf6" />
                      <span style={styles.csvResultValue}>{symbol}{csvResults.latestBalance.toLocaleString()}</span>
                      <span style={styles.csvResultLabel}>balance</span>
                    </div>
                  )}
                </div>
                <button style={styles.somethingWrongBtn} onClick={() => setShowManualMapping(true)}>
                  Something looks wrong? Adjust mapping
                </button>
              </div>
            )}

            {showManualMapping && csvHeaders.length > 0 && (
              <div style={styles.mappingSection}>
                <p style={styles.mappingTitle}>Which column contains each piece of information?</p>
                {csvPreviewRows.length > 0 && (
                  <div style={styles.previewTableWrapper}>
                    <table style={styles.previewTable}>
                      <thead>
                        <tr>{csvHeaders.map(h => <th key={h} style={styles.previewTh}>{h}</th>)}</tr>
                      </thead>
                      <tbody>
                        {csvPreviewRows.map((row, i) => (
                          <tr key={i}>{csvHeaders.map(h => <td key={h} style={styles.previewTd}>{String(row[h] || '')}</td>)}</tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {[
                  { field: 'date', label: 'Date' },
                  { field: 'type', label: 'Transaction type (Deposit/Withdrawal)' },
                  { field: 'amount', label: 'Amount' },
                  { field: 'deposits', label: 'Deposits column (if separate)' },
                  { field: 'withdrawals', label: 'Withdrawals column (if separate)' },
                  { field: 'balance_after', label: 'Account balance (optional)' },
                  { field: 'transaction_id', label: 'Transaction ID (optional)' },
                  { field: 'status', label: 'Status (optional)' },
                ].map(({ field, label }) => (
                  <div key={field} style={styles.mappingRow}>
                    <label style={styles.mappingLabel}>{label}</label>
                    <select
                      style={styles.input}
                      value={csvMapping[field] || ''}
                      onChange={(e) => setCsvMapping(prev => ({ ...prev, [field]: e.target.value || undefined }))}
                    >
                      <option value="">— Not in my file —</option>
                      {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                ))}
                <button style={styles.recalculateBtn} onClick={handleRemapAndRecalculate}>
                  Recalculate
                </button>
              </div>
            )}

            <div style={styles.actions}>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button
                style={{ ...styles.saveBtn, opacity: (!csvResults || loading) ? 0.5 : 1 }}
                onClick={handleSaveCSV}
                disabled={!csvResults || loading}
              >
                {loading ? 'Importing...' : 'Import Transactions'}
              </button>
            </div>
          </div>
        )}

        {/* Balance Tab */}
        {activeTab === 'balance' && (
          <div style={styles.tabContent}>
            <p style={styles.balanceExplainer}>
              Update the current balance in your casino account. This is the amount currently sitting in your account and is used to calculate your net position.
            </p>
            <div style={styles.balanceCurrentRow}>
              <span style={styles.balanceCurrentLabel}>Current balance on file:</span>
              <span style={styles.balanceCurrentValue}>{symbol}{(casino.currentBalance || 0).toLocaleString()}</span>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>
                <Wallet size={13} color="#64748b" />
                <span>New Balance ({symbol})</span>
              </label>
              <input
                style={styles.input}
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                placeholder="Enter your current account balance"
              />
            </div>
            <div style={styles.actions}>
              <button style={styles.cancelBtn} onClick={onClose}>Cancel</button>
              <button style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }} onClick={handleSaveBalance} disabled={loading}>
                {loading ? 'Saving...' : 'Update Balance'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '20px' },
  modal: { backgroundColor: 'white', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', overflowY: 'auto' },
  modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' },
  modalTitle: { color: '#0f172a', fontSize: '18px', fontWeight: '800', margin: '0 0 4px 0' },
  modalSubtitle: { color: '#64748b', fontSize: '13px', margin: 0 },
  closeBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', flexShrink: 0 },
  tabBar: { display: 'flex', gap: '4px', marginBottom: '20px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '10px' },
  tab: { flex: 1, padding: '8px 6px', borderRadius: '7px', border: 'none', backgroundColor: 'transparent', color: '#64748b', fontSize: '12px', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' },
  tabActive: { backgroundColor: 'white', color: '#0ea5e9', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
  tabContent: { display: 'flex', flexDirection: 'column', gap: '14px' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '4px' },
  successBox: { backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', marginBottom: '4px' },
  transactionRow: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' },
  transactionRowHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
  transactionRowLabel: { color: '#374151', fontSize: '12px', fontWeight: '700' },
  removeRowBtn: { backgroundColor: 'transparent', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' },
  typeSelector: { display: 'flex', gap: '6px', marginBottom: '12px' },
  typeBtn: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px', padding: '8px 4px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'white', cursor: 'pointer', fontSize: '12px', fontWeight: '600', color: '#64748b' },
  typeBtnDeposit: { backgroundColor: '#0ea5e9', color: 'white', border: '1px solid #0ea5e9' },
  typeBtnWithdrawal: { backgroundColor: '#10b981', color: 'white', border: '1px solid #10b981' },
  typeBtnBonus: { backgroundColor: '#f59e0b', color: 'white', border: '1px solid #f59e0b' },
  rowFields: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' },
  rowField: { display: 'flex', flexDirection: 'column', gap: '5px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { display: 'flex', alignItems: 'center', gap: '5px', color: '#374151', fontSize: '12px', fontWeight: '600' },
  input: { width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  addRowBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '10px', backgroundColor: 'white', border: '2px dashed #e2e8f0', borderRadius: '10px', color: '#0ea5e9', fontSize: '13px', fontWeight: '600', cursor: 'pointer' },
  actions: { display: 'flex', gap: '10px', marginTop: '4px' },
  cancelBtn: { flex: 1, padding: '12px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '14px', fontWeight: '600', color: '#64748b', cursor: 'pointer' },
  saveBtn: { flex: 2, padding: '12px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: 'pointer' },
  uploadArea: { border: '2px dashed #e2e8f0', borderRadius: '12px', padding: '24px 20px', textAlign: 'center', cursor: 'pointer', backgroundColor: '#f8fafc' },
  uploadDefaultContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' },
  uploadSuccessContent: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' },
  uploadText: { color: '#1e293b', fontSize: '13px', fontWeight: '600', margin: 0 },
  uploadSubtext: { color: '#94a3b8', fontSize: '12px', margin: 0 },
  uploadBtn: { display: 'inline-block', padding: '7px 16px', backgroundColor: '#0ea5e9', color: 'white', borderRadius: '8px', fontSize: '12px', fontWeight: '600', marginTop: '4px' },
  uploadSuccessText: { color: '#1e293b', fontSize: '13px', fontWeight: '600', margin: 0 },
  uploadSuccessSubtext: { color: '#64748b', fontSize: '12px', margin: 0 },
  csvResultsBox: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0' },
  csvResultsTitle: { color: '#374151', fontSize: '13px', fontWeight: '600', margin: '0 0 10px 0' },
  csvResultsGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px' },
  csvResultStat: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px', backgroundColor: 'white', borderRadius: '8px', padding: '10px', border: '1px solid #e2e8f0' },
  csvResultValue: { color: '#0f172a', fontSize: '16px', fontWeight: '800' },
  csvResultLabel: { color: '#94a3b8', fontSize: '11px' },
  somethingWrongBtn: { width: '100%', padding: '8px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#64748b', fontSize: '12px', cursor: 'pointer', textAlign: 'center' },
  mappingSection: { backgroundColor: '#f8fafc', borderRadius: '10px', padding: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' },
  mappingTitle: { color: '#374151', fontSize: '13px', fontWeight: '600', margin: 0 },
  mappingRow: { display: 'flex', flexDirection: 'column', gap: '4px' },
  mappingLabel: { color: '#374151', fontSize: '12px', fontWeight: '600' },
  previewTableWrapper: { overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0' },
  previewTable: { width: '100%', borderCollapse: 'collapse', fontSize: '11px' },
  previewTh: { backgroundColor: '#f1f5f9', padding: '6px 8px', textAlign: 'left', color: '#374151', fontWeight: '600', borderBottom: '1px solid #e2e8f0', whiteSpace: 'nowrap' },
  previewTd: { padding: '5px 8px', color: '#64748b', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis' },
  recalculateBtn: { padding: '8px 16px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', alignSelf: 'flex-start' },
  balanceExplainer: { color: '#64748b', fontSize: '13px', lineHeight: '1.5', margin: 0, backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' },
  balanceCurrentRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #e2e8f0' },
  balanceCurrentLabel: { color: '#64748b', fontSize: '13px' },
  balanceCurrentValue: { color: '#0f172a', fontSize: '16px', fontWeight: '800' },
};

export default AddTransactionModal;
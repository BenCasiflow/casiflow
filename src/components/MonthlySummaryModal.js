import { X } from 'lucide-react';

function MonthlySummaryModal({ summary, symbol, onClose }) {
  const {
    type,
    periodLabel,
    netResult,
    totalDeposited,
    totalWithdrawn,
    bestCasino,
    goalsCompleted,
    goalsTotal,
    withinDepositLimit,
    withinNetLossLimit,
    depositLimit,
    netLossLimit,
  } = summary;

  const isPositive = netResult >= 0;
  const isAnnual = type === 'annual';

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">
            <X size={18} color="rgba(255,255,255,0.7)" />
          </button>
          <p style={styles.eyebrow}>{isAnnual ? 'Annual Review' : 'Monthly Summary'}</p>
          <h2 style={styles.title}>
            Your {periodLabel}{isAnnual ? ' in Review' : ' Summary'}
          </h2>
        </div>

        {/* Body */}
        <div style={styles.body}>
          {/* Net result hero */}
          <div style={styles.netSection}>
            <p style={styles.netLabel}>you were {isPositive ? 'up' : 'down'}</p>
            <p style={{ ...styles.netAmount, color: isPositive ? '#4ade80' : '#f87171' }}>
              {isPositive ? '+' : '-'}{symbol}{Math.abs(netResult).toLocaleString()}
            </p>
          </div>

          {/* Deposited / Withdrawn */}
          <div style={styles.statsRow}>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Deposited</p>
              <p style={styles.statValue}>{symbol}{totalDeposited.toLocaleString()}</p>
            </div>
            <div style={styles.statCard}>
              <p style={styles.statLabel}>Total Withdrawn</p>
              <p style={styles.statValue}>{symbol}{totalWithdrawn.toLocaleString()}</p>
            </div>
          </div>

          {/* Best casino */}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Best Performing Casino</span>
            <span style={styles.infoValue}>{bestCasino || 'No activity'}</span>
          </div>

          {/* Limits — monthly only, only if at least one limit is set */}
          {!isAnnual && (depositLimit > 0 || netLossLimit > 0) && (
            <div style={styles.limitsBox}>
              <p style={styles.limitsTitle}>Spending Limits</p>
              {depositLimit > 0 && (
                <div style={styles.limitRow}>
                  <span style={styles.limitIcon}>{withinDepositLimit ? '✅' : '❌'}</span>
                  <span style={styles.limitText}>
                    Stayed within deposit limit ({symbol}{Number(depositLimit).toLocaleString()})
                  </span>
                </div>
              )}
              {netLossLimit > 0 && (
                <div style={styles.limitRow}>
                  <span style={styles.limitIcon}>{withinNetLossLimit ? '✅' : '❌'}</span>
                  <span style={styles.limitText}>
                    Stayed within net loss limit ({symbol}{Number(netLossLimit).toLocaleString()})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Goals */}
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Goals</span>
            <span style={styles.infoValue}>
              {goalsTotal === 0
                ? 'No goals tracked'
                : `${goalsCompleted} of ${goalsTotal} goals completed`}
            </span>
          </div>

          {/* Closing line */}
          <div style={styles.closingBox}>
            <p style={styles.closingText}>
              Another {isAnnual ? 'year' : 'month'} tracked. Knowing your numbers is how you stay in control — keep it up.
            </p>
          </div>

          {/* CTA */}
          <button style={styles.ctaBtn} onClick={onClose}>Get Tracking!</button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.65)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 400, padding: '20px',
  },
  modal: {
    backgroundColor: 'white', borderRadius: '20px',
    width: '100%', maxWidth: '480px',
    boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
    maxHeight: '90vh', overflowY: 'auto',
    fontFamily: "'Segoe UI', Arial, sans-serif",
  },
  header: {
    background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 60%, #0369a1 100%)',
    borderRadius: '20px 20px 0 0',
    padding: '28px 24px 24px 24px',
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute', top: '16px', right: '16px',
    backgroundColor: 'rgba(255,255,255,0.1)',
    border: 'none', borderRadius: '8px',
    cursor: 'pointer', padding: '6px',
    display: 'flex', alignItems: 'center',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px', fontWeight: '700',
    textTransform: 'uppercase', letterSpacing: '1.5px',
    margin: '0 0 8px 0',
  },
  title: {
    color: 'white',
    fontSize: '26px', fontWeight: '800',
    margin: 0, letterSpacing: '-0.5px', lineHeight: '1.2',
  },
  body: {
    padding: '24px',
  },
  netSection: {
    textAlign: 'center',
    padding: '20px 0 16px 0',
    borderBottom: '1px solid #f1f5f9',
    marginBottom: '20px',
  },
  netLabel: {
    color: '#64748b', fontSize: '13px',
    textTransform: 'uppercase', letterSpacing: '1px',
    fontWeight: '600', margin: '0 0 6px 0',
  },
  netAmount: {
    fontSize: '48px', fontWeight: '800',
    letterSpacing: '-2px', lineHeight: 1, margin: 0,
  },
  statsRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr',
    gap: '12px', marginBottom: '16px',
  },
  statCard: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '14px 16px',
    textAlign: 'center',
  },
  statLabel: {
    color: '#94a3b8', fontSize: '11px',
    fontWeight: '600', textTransform: 'uppercase',
    letterSpacing: '0.6px', margin: '0 0 6px 0',
  },
  statValue: {
    color: '#0f172a', fontSize: '20px',
    fontWeight: '800', margin: 0, letterSpacing: '-0.5px',
  },
  infoRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #f1f5f9',
  },
  infoLabel: {
    color: '#64748b', fontSize: '13px', fontWeight: '600',
  },
  infoValue: {
    color: '#0f172a', fontSize: '13px', fontWeight: '700',
    textAlign: 'right', maxWidth: '55%',
  },
  limitsBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    borderRadius: '12px', padding: '14px 16px',
    margin: '4px 0',
  },
  limitsTitle: {
    color: '#374151', fontSize: '12px',
    fontWeight: '700', textTransform: 'uppercase',
    letterSpacing: '0.06em', margin: '0 0 10px 0',
  },
  limitRow: {
    display: 'flex', alignItems: 'center',
    gap: '10px', marginBottom: '6px',
  },
  limitIcon: { fontSize: '14px', flexShrink: 0 },
  limitText: { color: '#374151', fontSize: '13px' },
  closingBox: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '12px', padding: '14px 16px',
    margin: '16px 0',
  },
  closingText: {
    color: '#0369a1', fontSize: '13px',
    lineHeight: '1.6', margin: 0, fontWeight: '500',
    fontStyle: 'italic',
  },
  ctaBtn: {
    width: '100%', padding: '16px',
    background: 'linear-gradient(135deg, #0ea5e9, #0369a1)',
    color: 'white', border: 'none',
    borderRadius: '12px', fontSize: '16px',
    fontWeight: '700', cursor: 'pointer',
    boxShadow: '0 4px 14px rgba(14,165,233,0.35)',
    letterSpacing: '0.02em',
  },
};

export default MonthlySummaryModal;

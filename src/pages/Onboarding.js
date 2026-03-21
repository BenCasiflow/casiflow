import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Onboarding({ user, onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  const handleComplete = () => {
    onComplete();
    navigate('/dashboard');
  };

  const handleAddCasino = () => {
    onComplete();
    navigate('/add-casino');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: `${(step / 3) * 100}%` }} />
        </div>

        {step === 1 && (
          <div style={styles.step}>
            <div style={styles.iconWrapper}>
              <span style={styles.stepIcon}>🎉</span>
            </div>
            <h2 style={styles.title}>Welcome to Casiflow, {user.name}!</h2>
            <p style={styles.subtitle}>Track smarter, play smarter, keep more. Casiflow gives you a complete overview of your casino spending across all platforms — so you always know exactly where you stand.</p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <div style={styles.featureIconWrapper}>
                  <span style={styles.featureIcon}>📊</span>
                </div>
                <div>
                  <p style={styles.featureTitle}>Unified Dashboard</p>
                  <p style={styles.featureDesc}>See all your casino spending in one place</p>
                </div>
              </div>
              <div style={styles.feature}>
                <div style={styles.featureIconWrapper}>
                  <span style={styles.featureIcon}>🎯</span>
                </div>
                <div>
                  <p style={styles.featureTitle}>Spending Limits</p>
                  <p style={styles.featureDesc}>Set deposit and net loss limits to stay in control</p>
                </div>
              </div>
              <div style={styles.feature}>
                <div style={styles.featureIconWrapper}>
                  <span style={styles.featureIcon}>📈</span>
                </div>
                <div>
                  <p style={styles.featureTitle}>Performance Insights</p>
                  <p style={styles.featureDesc}>Track wins, losses and trends per casino</p>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} style={styles.primaryBtn}>Get Started →</button>
          </div>
        )}

        {step === 2 && (
          <div style={styles.step}>
            <div style={styles.iconWrapper}>
              <span style={styles.stepIcon}>🎰</span>
            </div>
            <h2 style={styles.title}>Add your first casino</h2>
            <p style={styles.subtitle}>To get the most out of Casiflow, add the casinos you play at. You can enter lifetime totals, individual transactions, or upload a CSV export from your casino.</p>
            <div style={styles.optionCards}>
              <div style={styles.optionCard}>
                <span style={styles.optionIcon}>📊</span>
                <p style={styles.optionTitle}>Lifetime Totals</p>
                <p style={styles.optionDesc}>Quick — just enter your overall deposits and withdrawals</p>
              </div>
              <div style={styles.optionCard}>
                <span style={styles.optionIcon}>📋</span>
                <p style={styles.optionTitle}>Individual Transactions</p>
                <p style={styles.optionDesc}>More detailed — log each transaction with a date</p>
              </div>
              <div style={styles.optionCard}>
                <span style={styles.optionIcon}>📁</span>
                <p style={styles.optionTitle}>CSV Upload</p>
                <p style={styles.optionDesc}>Import directly from your casino transaction export</p>
              </div>
            </div>
            <div style={styles.btnRow}>
              <button onClick={() => setStep(1)} style={styles.secondaryBtn}>← Back</button>
              <button onClick={handleAddCasino} style={styles.primaryBtn}>Add My First Casino →</button>
            </div>
            <button onClick={() => setStep(3)} style={styles.skipBtn}>Skip for now</button>
          </div>
        )}

        {step === 3 && (
          <div style={styles.step}>
            <div style={styles.iconWrapper}>
              <span style={styles.stepIcon}>✅</span>
            </div>
            <h2 style={styles.title}>You are ready to go!</h2>
            <p style={styles.subtitle}>Your dashboard is waiting. Track smarter, play smarter, keep more.</p>
            <div style={styles.tipBox}>
              <p style={styles.tipTitle}>💡 Quick tip</p>
              <p style={styles.tipText}>Set your monthly deposit limit and net loss limit in your Profile settings to get the most out of Casiflow's spending alerts.</p>
            </div>
            <div style={styles.btnRow}>
              <button onClick={() => setStep(2)} style={styles.secondaryBtn}>← Back</button>
              <button onClick={handleComplete} style={styles.primaryBtn}>Go to Dashboard →</button>
            </div>
          </div>
        )}

        <div style={styles.stepIndicators}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{ ...styles.stepDot, backgroundColor: s === step ? '#38bdf8' : s < step ? '#10b981' : 'rgba(255,255,255,0.2)' }} />
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Arial, sans-serif", padding: '24px' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px', maxWidth: '620px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' },
  progressBar: { height: '4px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginBottom: '40px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: '2px', transition: 'width 0.4s ease' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  iconWrapper: { width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  stepIcon: { fontSize: '40px' },
  title: { color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.5px' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.7', margin: '0 0 32px 0', maxWidth: '480px' },
  features: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '32px' },
  feature: { display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'left' },
  featureIconWrapper: { width: '44px', height: '44px', backgroundColor: 'rgba(56,189,248,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureIcon: { fontSize: '22px' },
  featureTitle: { color: 'white', fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' },
  featureDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 },
  optionCards: { display: 'flex', gap: '12px', width: '100%', marginBottom: '32px' },
  optionCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '20px 16px', border: '1px solid rgba(255,255,255,0.1)' },
  optionIcon: { fontSize: '28px', display: 'block', marginBottom: '8px' },
  optionTitle: { color: 'white', fontSize: '13px', fontWeight: '700', margin: '0 0 4px 0' },
  optionDesc: { color: 'rgba(255,255,255,0.5)', fontSize: '12px', margin: 0 },
  tipBox: { backgroundColor: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '32px', textAlign: 'left', width: '100%' },
  tipTitle: { color: '#38bdf8', fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' },
  tipText: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  btnRow: { display: 'flex', gap: '12px', width: '100%', marginBottom: '12px' },
  primaryBtn: { flex: 1, padding: '14px', background: 'linear-gradient(135deg, #38bdf8, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56,189,248,0.3)' },
  secondaryBtn: { padding: '14px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  skipBtn: { color: 'rgba(255,255,255,0.4)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '4px' },
  stepIndicators: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' },
  stepDot: { width: '8px', height: '8px', borderRadius: '50%', transition: 'background-color 0.3s ease' },
};

export default Onboarding;
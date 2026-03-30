import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Target, TrendingUp, ArrowDownCircle, ArrowUpCircle, Building2 } from 'lucide-react';

function DashboardMockup() {
  return (
    <div style={mockup.wrapper}>
      <div style={mockup.topBar}>
        <span style={mockup.logoText}>Casiflow</span>
        <span style={mockup.topBarRight}>Your Dashboard</span>
      </div>

      <div style={mockup.hero}>
        <p style={mockup.heroLabel}>This month you are</p>
        <p style={mockup.heroAmount}>+€2,340</p>
        <p style={mockup.heroSub}>across 3 casinos</p>
      </div>

      <div style={mockup.statsRow}>
        <div style={mockup.statTile}>
          <p style={mockup.statLabel}>Deposited</p>
          <p style={mockup.statValue}>€1,800</p>
        </div>
        <div style={mockup.statTile}>
          <p style={mockup.statLabel}>Withdrawn</p>
          <p style={mockup.statValue}>€4,140</p>
        </div>
        <div style={{ ...mockup.statTile, borderLeft: '3px solid #22c55e', backgroundColor: '#f0fdf4' }}>
          <p style={mockup.statLabel}>Net Result</p>
          <p style={{ ...mockup.statValue, color: '#16a34a' }}>+€2,340</p>
        </div>
      </div>

      <div style={mockup.casinoList}>
        {[
          { name: 'LeoVegas', dep: 800, with: 1950, net: 1150, color: '#0ea5e9' },
          { name: 'Bet365', dep: 600, with: 1290, net: 690, color: '#10b981' },
          { name: '888 Casino', dep: 400, with: 900, net: 500, color: '#8b5cf6' },
        ].map(casino => (
          <div key={casino.name} style={mockup.casinoCard}>
            <div style={mockup.casinoLeft}>
              <div style={{ ...mockup.casinoAvatar, backgroundColor: casino.color }}>
                {casino.name.charAt(0)}
              </div>
              <div>
                <p style={mockup.casinoName}>{casino.name}</p>
                <div style={mockup.casinoStats}>
                  <span style={mockup.casinoStat}>
                    <ArrowDownCircle size={10} color="#0ea5e9" /> €{casino.dep}
                  </span>
                  <span style={mockup.casinoStat}>
                    <ArrowUpCircle size={10} color="#10b981" /> €{casino.with}
                  </span>
                </div>
              </div>
            </div>
            <span style={{ ...mockup.casinoNet, color: '#16a34a' }}>+€{casino.net}</span>
          </div>
        ))}
      </div>

      <div style={mockup.watermark}>Your data will appear here</div>
    </div>
  );
}

function Onboarding({ user, profile, onComplete }) {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Read name from sessionStorage first — this is set immediately during signup
  // so it is always available without waiting for Supabase
  const rawName = sessionStorage.getItem('newUserName') || profile?.full_name || '';
  const firstName = rawName.split(' ')[0] || 'there';

  const handleComplete = () => {
    sessionStorage.removeItem('newUserName');
    onComplete();
    navigate('/dashboard');
  };

  const handleAddCasino = () => {
    sessionStorage.removeItem('newUserName');
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
              <LayoutDashboard size={36} color="#38bdf8" />
            </div>
            <h2 style={styles.title}>Welcome to Casiflow, {firstName}!</h2>
            <p style={styles.subtitle}>Track smarter, play smarter, keep more. Casiflow gives you a complete overview of your casino spending across all platforms — so you always know exactly where you stand.</p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <div style={styles.featureIconWrapper}>
                  <Building2 size={20} color="#38bdf8" />
                </div>
                <div>
                  <p style={styles.featureTitle}>Unified Dashboard</p>
                  <p style={styles.featureDesc}>See all your casino spending in one place</p>
                </div>
              </div>
              <div style={styles.feature}>
                <div style={styles.featureIconWrapper}>
                  <Target size={20} color="#38bdf8" />
                </div>
                <div>
                  <p style={styles.featureTitle}>Spending Limits</p>
                  <p style={styles.featureDesc}>Set deposit and net loss limits to stay in control</p>
                </div>
              </div>
              <div style={styles.feature}>
                <div style={styles.featureIconWrapper}>
                  <TrendingUp size={20} color="#38bdf8" />
                </div>
                <div>
                  <p style={styles.featureTitle}>Performance Insights</p>
                  <p style={styles.featureDesc}>Track wins, losses and trends per casino</p>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} style={styles.primaryBtn}>Get Started</button>
            <button onClick={handleComplete} style={styles.skipBtn}>Skip for now</button>
          </div>
        )}

        {step === 2 && (
          <div style={styles.step}>
            <h2 style={styles.title}>Your casinos, all in one place</h2>
            <p style={styles.subtitle}>Here is what your Casiflow dashboard will look like once you add your casinos. Every number updates in real time as you log transactions.</p>
            <DashboardMockup />
            <div style={styles.btnRow}>
              <button onClick={() => setStep(1)} style={styles.secondaryBtn}>Back</button>
              <button onClick={() => setStep(3)} style={styles.primaryBtnFlex}>Next</button>
            </div>
            <button onClick={handleComplete} style={styles.skipBtn}>Skip for now</button>
          </div>
        )}

        {step === 3 && (
          <div style={styles.step}>
            <div style={styles.iconWrapper}>
              <TrendingUp size={36} color="#38bdf8" />
            </div>
            <h2 style={styles.title}>You are ready to go!</h2>
            <p style={styles.subtitle}>Your dashboard is waiting. Start by adding your first casino — it only takes a minute.</p>
            <div style={styles.tipBox}>
              <p style={styles.tipTitle}>Quick tip</p>
              <p style={styles.tipText}>Set your monthly deposit limit and net loss limit in your Profile settings to get the most out of Casiflow's spending alerts.</p>
            </div>
            <button onClick={handleAddCasino} style={styles.primaryBtn}>Add My First Casino</button>
            <div style={styles.btnRow}>
              <button onClick={() => setStep(2)} style={styles.secondaryBtn}>Back</button>
              <button onClick={handleComplete} style={styles.goToDashboardBtn}>Go to Dashboard</button>
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

const mockup = {
  wrapper: { width: '100%', backgroundColor: '#f1f5f9', borderRadius: '12px', overflow: 'hidden', marginBottom: '24px', border: '1px solid #e2e8f0' },
  topBar: { backgroundColor: '#0f172a', padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { color: '#38bdf8', fontSize: '14px', fontWeight: '800' },
  topBarRight: { color: 'rgba(255,255,255,0.5)', fontSize: '11px' },
  hero: { background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', padding: '16px 14px', textAlign: 'center' },
  heroLabel: { color: 'rgba(255,255,255,0.6)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', margin: '0 0 4px 0' },
  heroAmount: { color: '#4ade80', fontSize: '26px', fontWeight: '800', margin: '0 0 4px 0', letterSpacing: '-1px' },
  heroSub: { color: 'rgba(255,255,255,0.5)', fontSize: '11px', margin: 0 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', padding: '10px' },
  statTile: { backgroundColor: 'white', borderRadius: '8px', padding: '10px', borderLeft: '3px solid #e2e8f0' },
  statLabel: { color: '#94a3b8', fontSize: '9px', textTransform: 'uppercase', fontWeight: '600', margin: '0 0 4px 0', letterSpacing: '0.5px' },
  statValue: { color: '#0f172a', fontSize: '13px', fontWeight: '800', margin: 0 },
  casinoList: { padding: '0 10px 10px 10px', display: 'flex', flexDirection: 'column', gap: '6px' },
  casinoCard: { backgroundColor: 'white', borderRadius: '8px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #f1f5f9' },
  casinoLeft: { display: 'flex', alignItems: 'center', gap: '8px' },
  casinoAvatar: { width: '28px', height: '28px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '12px', fontWeight: '800', flexShrink: 0 },
  casinoName: { color: '#0f172a', fontSize: '12px', fontWeight: '700', margin: '0 0 3px 0' },
  casinoStats: { display: 'flex', gap: '8px' },
  casinoStat: { display: 'flex', alignItems: 'center', gap: '3px', color: '#64748b', fontSize: '10px' },
  casinoNet: { fontSize: '12px', fontWeight: '700' },
  watermark: { textAlign: 'center', padding: '8px', color: '#94a3b8', fontSize: '10px', backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' },
};

const styles = {
  container: { minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Segoe UI', Arial, sans-serif", padding: '24px' },
  card: { backgroundColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '48px', maxWidth: '620px', width: '100%', boxShadow: '0 24px 60px rgba(0,0,0,0.3)' },
  progressBar: { height: '4px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '2px', marginBottom: '40px', overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#38bdf8', borderRadius: '2px', transition: 'width 0.4s ease' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
  iconWrapper: { width: '80px', height: '80px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' },
  title: { color: 'white', fontSize: '28px', fontWeight: '800', margin: '0 0 12px 0', letterSpacing: '-0.5px' },
  subtitle: { color: 'rgba(255,255,255,0.7)', fontSize: '15px', lineHeight: '1.7', margin: '0 0 24px 0', maxWidth: '480px' },
  features: { display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', marginBottom: '32px' },
  feature: { display: 'flex', alignItems: 'center', gap: '16px', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', padding: '16px', textAlign: 'left' },
  featureIconWrapper: { width: '44px', height: '44px', backgroundColor: 'rgba(56,189,248,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureTitle: { color: 'white', fontSize: '14px', fontWeight: '700', margin: '0 0 4px 0' },
  featureDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 },
  tipBox: { backgroundColor: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '12px', padding: '20px', marginBottom: '24px', textAlign: 'left', width: '100%' },
  tipTitle: { color: '#38bdf8', fontSize: '14px', fontWeight: '700', margin: '0 0 8px 0' },
  tipText: { color: 'rgba(255,255,255,0.7)', fontSize: '13px', lineHeight: '1.6', margin: 0 },
  btnRow: { display: 'flex', gap: '12px', width: '100%', marginTop: '12px' },
  primaryBtn: { width: '100%', padding: '14px', background: 'linear-gradient(135deg, #38bdf8, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56,189,248,0.3)', marginBottom: '8px' },
  primaryBtnFlex: { flex: 1, padding: '14px', background: 'linear-gradient(135deg, #38bdf8, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(56,189,248,0.3)' },
  secondaryBtn: { flex: 1, padding: '14px 20px', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '10px', fontSize: '15px', fontWeight: '600', cursor: 'pointer' },
  goToDashboardBtn: { flex: 1, padding: '14px', background: 'linear-gradient(135deg, #38bdf8, #0369a1)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' },
  skipBtn: { color: 'rgba(255,255,255,0.4)', backgroundColor: 'transparent', border: 'none', cursor: 'pointer', fontSize: '13px', marginTop: '4px' },
  stepIndicators: { display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' },
  stepDot: { width: '8px', height: '8px', borderRadius: '50%', transition: 'background-color 0.3s ease' },
};

export default Onboarding;
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { BarChart2, Coins, ShieldCheck, TrendingUp } from 'lucide-react';

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setError('Incorrect email or password. Please try again.');
      setLoading(false);
      return;
    }

    if (data?.user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('full_name, currency, country')
        .eq('id', data.user.id)
        .single();
      if (profileData?.full_name) sessionStorage.setItem('userFirstName', profileData.full_name.split(' ')[0]);
      if (profileData?.currency) sessionStorage.setItem('userCurrency', profileData.currency);
      if (profileData?.country) sessionStorage.setItem('userCountry', profileData.country);
    }

    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      {!isMobile && (
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <h1 style={styles.brandName}>Casiflow</h1>
            <p style={styles.brandTagline}>Because the house always knows its numbers. Now you can too.</p>
            <div style={styles.features}>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><BarChart2 size={20} color="rgba(255,255,255,0.85)" /></span>
                <span style={styles.featureText}>Unified dashboard across all casinos</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><Coins size={20} color="rgba(255,255,255,0.85)" /></span>
                <span style={styles.featureText}>Set and track your personal spending limits</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><ShieldCheck size={20} color="rgba(255,255,255,0.85)" /></span>
                <span style={styles.featureText}>Detailed performance insights per casino</span>
              </div>
              <div style={styles.feature}>
                <span style={styles.featureIcon}><TrendingUp size={20} color="rgba(255,255,255,0.85)" /></span>
                <span style={styles.featureText}>Track wins, losses and trends in real time</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div style={isMobile ? styles.rightPanelMobile : styles.rightPanel}>
        <div style={isMobile ? styles.formCardMobile : styles.formCard}>
          {isMobile && (
            <div style={styles.mobileHeader}>
              <h1 style={styles.mobileBrandName}>Casiflow</h1>
              <p style={styles.mobileBrandTagline}>Because the house always knows its numbers. Now you can too.</p>
            </div>
          )}
          <h2 style={styles.formTitle}>Welcome back</h2>
          <p style={styles.formSubtitle}>Log in to your Casiflow account</p>
          {error && <div style={styles.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={styles.field}>
              <label style={styles.label}>Email address</label>
              <input
                style={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
              />
            </div>
            <div style={styles.field}>
              <div style={styles.passwordLabelRow}>
                <label style={styles.label}>Password</label>
                <Link to="/forgot-password" style={styles.forgotLink}>Forgot your password?</Link>
              </div>
              <input
                style={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
              />
            </div>
            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Logging in...' : 'Log In'}
            </button>
          </form>
          <p style={styles.switchText}>
            Don't have an account?{' '}
            <Link to="/signup" style={styles.switchLink}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif" },
  leftPanel: { flex: 1, background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 40px' },
  leftContent: { maxWidth: '420px' },
  brandName: { color: '#38bdf8', fontSize: '42px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-1px' },
  brandTagline: { color: 'rgba(255,255,255,0.8)', fontSize: '18px', lineHeight: '1.6', margin: '0 0 40px 0' },
  features: { display: 'flex', flexDirection: 'column', gap: '20px' },
  feature: { display: 'flex', alignItems: 'center', gap: '14px' },
  featureIcon: { fontSize: '24px', width: '40px', height: '40px', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  featureText: { color: 'rgba(255,255,255,0.85)', fontSize: '15px' },
  rightPanel: { width: '520px', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  rightPanelMobile: { flex: 1, background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', minHeight: '100vh' },
  formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '40px', width: '100%', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  formCardMobile: { backgroundColor: 'white', borderRadius: '20px', padding: '32px 24px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.3)' },
  mobileHeader: { textAlign: 'center', marginBottom: '28px', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9' },
  mobileBrandName: { color: '#0ea5e9', fontSize: '32px', fontWeight: '800', margin: '0 0 8px 0', letterSpacing: '-1px' },
  mobileBrandTagline: { color: '#64748b', fontSize: '14px', lineHeight: '1.5', margin: 0 },
  formTitle: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0' },
  formSubtitle: { color: '#64748b', fontSize: '14px', margin: '0 0 24px 0' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  field: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' },
  passwordLabelRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  forgotLink: { color: '#0ea5e9', fontSize: '13px', fontWeight: '500', textDecoration: 'none' },
  input: { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  button: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', marginTop: '8px', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  switchText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' },
  switchLink: { color: '#0ea5e9', textDecoration: 'none', fontWeight: '600' },
};

export default Login;

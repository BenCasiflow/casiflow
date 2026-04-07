import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address.'); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    setLoading(false);
    if (resetError) { setError('Could not send reset email. Please try again.'); return; }
    setSubmitted(true);
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <Link to="/" style={styles.brandLink}><h1 style={styles.brand}>Casiflow</h1></Link>
        <h2 style={styles.title}>Reset your password</h2>
        <p style={styles.subtitle}>Enter your email address and we'll send you a link to reset your password.</p>

        {submitted ? (
          <div style={styles.successBox}>
            <p style={styles.successText}>Check your email — we've sent you a password reset link.</p>
            <Link to="/" style={styles.backLink}>Back to Login</Link>
          </div>
        ) : (
          <>
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
                  autoFocus
                />
              </div>
              <button type="submit" style={styles.button} disabled={loading}>
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>
            <p style={styles.backRow}>
              <Link to="/" style={styles.backLink}>← Back to Login</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)',
    fontFamily: "'Segoe UI', Arial, sans-serif", padding: '24px',
  },
  card: {
    backgroundColor: 'white', borderRadius: '20px', padding: '40px 36px',
    width: '100%', maxWidth: '440px', boxShadow: '0 8px 40px rgba(0,0,0,0.25)',
  },
  brandLink: { textDecoration: 'none', display: 'block', marginBottom: '28px' },
  brand: { color: '#0ea5e9', fontSize: '26px', fontWeight: '800', margin: 0, letterSpacing: '-0.5px' },
  title: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 8px 0' },
  subtitle: { color: '#64748b', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },
  successBox: { backgroundColor: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: '12px', padding: '20px' },
  successText: { color: '#0369a1', fontSize: '14px', lineHeight: '1.6', margin: '0 0 16px 0', fontWeight: '500' },
  field: { marginBottom: '20px' },
  label: { display: 'block', marginBottom: '8px', color: '#374151', fontSize: '14px', fontWeight: '600' },
  input: { width: '100%', padding: '14px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '16px', boxSizing: 'border-box', backgroundColor: '#f8fafc', color: '#1e293b' },
  button: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  backRow: { textAlign: 'center', marginTop: '20px' },
  backLink: { color: '#0ea5e9', fontSize: '14px', fontWeight: '600', textDecoration: 'none' },
};

export default ForgotPassword;

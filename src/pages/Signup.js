import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Signup({ onSignupComplete }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [currency, setCurrency] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [depositLimit, setDepositLimit] = useState('');
  const [netLossLimit, setNetLossLimit] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const countries = [
    'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina',
    'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados',
    'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina',
    'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon',
    'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia',
    'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
    'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador',
    'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France',
    'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea',
    'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
    'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan',
    'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia',
    'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia',
    'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico',
    'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar',
    'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria',
    'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Panama',
    'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania',
    'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
    'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia',
    'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia',
    'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname',
    'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste',
    'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
    'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe', 'Other'
  ];

  const currencies = ['EUR', 'GBP', 'SEK', 'DKK', 'NOK', 'USD', 'AUD', 'CAD', 'CHF', 'NZD', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'ISK', 'JPY', 'Other'];

  const COUNTRY_CURRENCY = {
    'United Kingdom': 'GBP',
    'Netherlands': 'EUR', 'Germany': 'EUR', 'France': 'EUR', 'Belgium': 'EUR',
    'Spain': 'EUR', 'Italy': 'EUR', 'Portugal': 'EUR', 'Austria': 'EUR',
    'Ireland': 'EUR', 'Finland': 'EUR', 'Luxembourg': 'EUR', 'Greece': 'EUR',
    'Cyprus': 'EUR', 'Malta': 'EUR', 'Slovakia': 'EUR', 'Slovenia': 'EUR',
    'Estonia': 'EUR', 'Latvia': 'EUR', 'Lithuania': 'EUR', 'Croatia': 'EUR',
    'Norway': 'NOK',
    'Denmark': 'DKK',
    'Sweden': 'SEK',
    'Switzerland': 'CHF',
    'Poland': 'PLN',
    'Czech Republic': 'CZK',
    'Hungary': 'HUF',
    'Romania': 'RON',
    'Bulgaria': 'BGN',
    'Iceland': 'ISK',
    'United States': 'USD',
    'Canada': 'CAD',
    'Australia': 'AUD',
    'New Zealand': 'NZD',
  };

  const handleJurisdictionChange = (e) => {
    const selected = e.target.value;
    setJurisdiction(selected);
    setCurrency(COUNTRY_CURRENCY[selected] || 'EUR');
  };

  const getSpendingProfile = () => {
    if (!monthlyIncome || !netLossLimit) return null;
    const percent = (netLossLimit / monthlyIncome) * 100;
    if (percent <= 5) return {
      color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0',
      text: "Your spending level is typical of casual players who enjoy online casinos as a form of entertainment. There is no particular cause for concern at this level."
    };
    if (percent <= 15) return {
      color: '#0369a1', bg: '#f0f9ff', border: '#bae6fd',
      text: "This spending level is common among regular players. It is worth reviewing your spending periodically to make sure it stays within your comfort zone."
    };
    if (percent <= 30) return {
      color: '#d97706', bg: '#fffbeb', border: '#fde68a',
      text: "At this level you are spending a meaningful portion of your income on gambling. Casinos may offer VIP treatment. Be mindful of your spending patterns."
    };
    if (percent <= 50) return {
      color: '#ea580c', bg: '#fff7ed', border: '#fed7aa',
      text: "This spending level places you in a VIP or high-roller category. Consider whether your gambling budget is still comfortable for you financially."
    };
    return {
      color: '#dc2626', bg: '#fef2f2', border: '#fecaca',
      text: "Your spending level exceeds half of your monthly income. We recommend reviewing your limits and considering whether adjusting your budget would give you a healthier balance."
    };
  };

  const spendingProfile = getSpendingProfile();
  const percent = monthlyIncome && netLossLimit ? ((netLossLimit / monthlyIncome) * 100).toFixed(1) : null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !jurisdiction || !currency) {
      setError('Please fill in all required fields');
      return;
    }
    if (!consent) {
      setError('Please agree to the Terms & Conditions and Privacy Policy to continue');
      return;
    }

    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({ email, password });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: data.user.id,
      full_name: name,
      country: jurisdiction,
      currency: currency,
      monthly_net_income: monthlyIncome ? Number(monthlyIncome) : null,
      monthly_deposit_limit: depositLimit ? Number(depositLimit) : null,
      monthly_net_loss_limit: netLossLimit ? Number(netLossLimit) : null,
      terms_accepted: true,
    });

    if (profileError) {
      setError('Account created but profile could not be saved. Please contact support.');
      setLoading(false);
      return;
    }

    sessionStorage.setItem('newUserName', name);
    sessionStorage.setItem('userFirstName', name.split(' ')[0]);
    sessionStorage.setItem('userCountry', jurisdiction);
    sessionStorage.setItem('userCurrency', currency);

    onSignupComplete(name);
    navigate('/onboarding');
  };

  return (
    <div style={styles.container}>
      {/* Focus styles for inputs — inline styles can't target :focus pseudo-class */}
      <style>{`
        .cf-signup-input:focus {
          outline: none;
          border-color: #0ea5e9 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12) !important;
        }
      `}</style>

      {/* ── Desktop left panel ── */}
      {!isMobile && (
        <div style={styles.leftPanel}>
          <div style={styles.leftContent}>
            <h1 style={styles.brandName}>Casiflow</h1>
            <p style={styles.brandTagline}>Because the house always knows its numbers. Now you can too.</p>
            <div style={styles.steps}>
              <div style={styles.step}>
                <div style={styles.stepNumber}>1</div>
                <div>
                  <p style={styles.stepTitle}>Create your account</p>
                  <p style={styles.stepDesc}>Always free to use</p>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>2</div>
                <div>
                  <p style={styles.stepTitle}>Add your casinos</p>
                  <p style={styles.stepDesc}>Connect all your casino accounts in one place</p>
                </div>
              </div>
              <div style={styles.step}>
                <div style={styles.stepNumber}>3</div>
                <div>
                  <p style={styles.stepTitle}>Track and improve</p>
                  <p style={styles.stepDesc}>Get insights and stay in control of your spending</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Right panel ── */}
      <div style={isMobile ? styles.rightPanelMobile : styles.rightPanel}>

        <div style={isMobile ? styles.formCardMobile : styles.formCard}>
          <h2 style={styles.formTitle}>Create your free account</h2>
          <p style={styles.formSubtitle}>Always free to use — takes less than 2 minutes</p>
          {error && <div style={styles.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={isMobile ? styles.fieldFull : styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name *</label>
                <input className="cf-signup-input" style={styles.input} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Email *</label>
                <input className="cf-signup-input" style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Password *</label>
              <input className="cf-signup-input" style={styles.input} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Choose a strong password" />
            </div>
            <div style={isMobile ? styles.fieldFull : styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Country *</label>
                <select className="cf-signup-input" style={styles.input} value={jurisdiction} onChange={handleJurisdictionChange}>
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Currency *</label>
                <select className="cf-signup-input" style={styles.input} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="">Select currency</option>
                  {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div style={styles.divider} />
            <p style={styles.sectionLabel}>
              Budget Settings <span style={styles.optional}>(optional but recommended)</span>
            </p>
            <p style={styles.budgetDesc}>
              Set your monthly budget once. Casiflow tracks it automatically so you always know where you stand.
            </p>

            <div style={styles.field}>
              <label style={styles.label}>Monthly Net Income</label>
              <input className="cf-signup-input" style={styles.input} type="number" value={monthlyIncome} onChange={(e) => setMonthlyIncome(e.target.value)} placeholder="e.g. 3000" />
            </div>
            <div style={isMobile ? styles.fieldFull : styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Monthly Deposit Limit</label>
                <input className="cf-signup-input" style={styles.input} type="number" value={depositLimit} onChange={(e) => setDepositLimit(e.target.value)} placeholder="e.g. 500" />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Monthly Net Loss Limit</label>
                <input className="cf-signup-input" style={styles.input} type="number" value={netLossLimit} onChange={(e) => setNetLossLimit(e.target.value)} placeholder="e.g. 200" />
              </div>
            </div>

            {spendingProfile && (
              <div style={{ ...styles.profileBox, backgroundColor: spendingProfile.bg, border: `1px solid ${spendingProfile.border}` }}>
                <span style={{ ...styles.profilePercent, color: spendingProfile.color }}>{percent}% of income</span>
                <p style={{ ...styles.profileText, color: spendingProfile.color }}>{spendingProfile.text}</p>
              </div>
            )}

            <div style={styles.consentRow}>
              <input type="checkbox" id="consent" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={styles.checkbox} />
              <label htmlFor="consent" style={styles.consentLabel}>
                I agree to the{' '}
                <Link to="/terms-and-conditions" target="_blank" style={styles.consentLink}>Terms &amp; Conditions</Link>
                {' '}and{' '}
                <Link to="/privacy-policy" target="_blank" style={styles.consentLink}>Privacy Policy</Link>
              </label>
            </div>

            <button type="submit" style={styles.button} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Free Account'}
            </button>
          </form>
          <p style={styles.switchText}>
            Already have an account?{' '}
            <Link to="/" style={styles.switchLink}>Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', fontFamily: "'Segoe UI', Arial, sans-serif" },

  // Left panel
  leftPanel: { width: '380px', background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 36px' },
  leftContent: { maxWidth: '320px' },
  brandName: { color: '#38bdf8', fontSize: '36px', fontWeight: '800', margin: '0 0 16px 0', letterSpacing: '-1px' },
  brandTagline: { color: 'rgba(255,255,255,0.8)', fontSize: '16px', lineHeight: '1.6', margin: '0 0 40px 0' },
  steps: { display: 'flex', flexDirection: 'column', gap: '24px' },
  step: { display: 'flex', alignItems: 'flex-start', gap: '14px' },
  stepNumber: { width: '32px', height: '32px', backgroundColor: '#38bdf8', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0f172a', fontWeight: '800', fontSize: '14px', flexShrink: 0 },
  stepTitle: { color: 'white', fontSize: '14px', fontWeight: '600', margin: '0 0 4px 0' },
  stepDesc: { color: 'rgba(255,255,255,0.6)', fontSize: '13px', margin: 0 },

  // Right panel
  rightPanel: { flex: 1, backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  rightPanelMobile: { flex: 1, background: 'linear-gradient(135deg, #0f172a 0%, #1e40af 50%, #0369a1 100%)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '24px', minHeight: '100vh' },

  // Form card
  formCard: { backgroundColor: 'white', borderRadius: '16px', padding: '36px', width: '100%', maxWidth: '560px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' },
  formCardMobile: { backgroundColor: 'white', borderRadius: '20px', padding: '28px 24px', width: '100%', boxShadow: '0 8px 40px rgba(0,0,0,0.3)', marginBottom: '24px' },

  formTitle: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0' },
  formSubtitle: { color: '#64748b', fontSize: '14px', margin: '0 0 20px 0' },
  errorBox: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', padding: '10px 14px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px' },

  row: { display: 'flex', gap: '16px' },
  fieldFull: { display: 'flex', flexDirection: 'column' },
  field: { flex: 1, marginBottom: '16px' },
  label: { display: 'block', marginBottom: '6px', color: '#374151', fontSize: '14px', fontWeight: '600' },
  input: {
    width: '100%', padding: '12px 14px',
    border: '1.5px solid #e2e8f0', borderRadius: '10px',
    fontSize: '16px', boxSizing: 'border-box',
    backgroundColor: '#f8fafc', color: '#1e293b',
    transition: 'border-color 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease',
  },

  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '8px 0 16px 0' },
  sectionLabel: { color: '#374151', fontSize: '14px', fontWeight: '600', margin: '0 0 6px 0' },
  optional: { color: '#94a3b8', fontSize: '12px', fontWeight: '400' },
  budgetDesc: { color: '#94a3b8', fontSize: '12px', lineHeight: '1.5', margin: '0 0 16px 0' },

  profileBox: { borderRadius: '10px', padding: '14px', marginBottom: '16px' },
  profilePercent: { fontSize: '13px', fontWeight: '700', display: 'block', marginBottom: '6px' },
  profileText: { fontSize: '13px', lineHeight: '1.6', margin: 0 },

  consentRow: { display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '16px 0' },
  checkbox: { marginTop: '2px', cursor: 'pointer', width: '18px', height: '18px', flexShrink: 0 },
  consentLabel: { color: '#64748b', fontSize: '13px', lineHeight: '1.5', cursor: 'pointer' },
  consentLink: { color: '#0ea5e9', textDecoration: 'none', fontWeight: '600' },

  button: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #0ea5e9, #0369a1)', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(14,165,233,0.3)' },
  switchText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: '#64748b' },
  switchLink: { color: '#0ea5e9', textDecoration: 'none', fontWeight: '600' },
};

export default Signup;

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

function Signup({ onSignupComplete }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  // Desktop DOB — single date input
  const [dob, setDob] = useState('');
  // Mobile DOB — three separate selects
  const [dobDay, setDobDay] = useState('');
  const [dobMonth, setDobMonth] = useState('');
  const [dobYear, setDobYear] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [currency, setCurrency] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [depositLimit, setDepositLimit] = useState('');
  const [netLossLimit, setNetLossLimit] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState('');
  const [ageError, setAgeError] = useState(false);
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

  // Month names for the mobile DOB select
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Year options descending: current year down to current year - 100
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let y = currentYear; y >= currentYear - 100; y--) {
    yearOptions.push(y);
  }

  // Parse DOB string manually to avoid iOS Safari's UTC-vs-local-time bug.
  // new Date("YYYY-MM-DD") is parsed as UTC midnight on iOS Safari, which means
  // .getDate()/.getMonth() may return yesterday's date in negative-UTC-offset
  // timezones, silently breaking the age comparison.
  const calcAge = (dobString) => {
    if (!dobString) return null;
    const parts = dobString.split('-');
    if (parts.length !== 3) return null;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10); // 1-indexed
    const birthDay = parseInt(parts[2], 10);
    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return null;
    const now = new Date();
    const todayYear = now.getFullYear();
    const todayMonth = now.getMonth() + 1;
    const todayDay = now.getDate();
    let age = todayYear - birthYear;
    if (todayMonth < birthMonth || (todayMonth === birthMonth && todayDay < birthDay)) age--;
    return age;
  };

  // Build YYYY-MM-DD string from the three mobile selects (returns '' if any missing)
  const getMobileDobString = (day, month, year) => {
    if (!day || !month || !year) return '';
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  // Clear the age banner as soon as the mobile DOB combination passes the 18+ check
  const clearAgeErrorIfValid = (day, month, year) => {
    if (!ageError) return;
    const dobStr = getMobileDobString(day, month, year);
    if (dobStr && calcAge(dobStr) >= 18) setAgeError(false);
  };

  const handleDobDayChange = (e) => {
    const val = e.target.value;
    setDobDay(val);
    clearAgeErrorIfValid(val, dobMonth, dobYear);
  };

  const handleDobMonthChange = (e) => {
    const val = e.target.value;
    setDobMonth(val);
    clearAgeErrorIfValid(dobDay, val, dobYear);
  };

  const handleDobYearChange = (e) => {
    const val = e.target.value;
    setDobYear(val);
    clearAgeErrorIfValid(dobDay, dobMonth, val);
  };

  // Desktop DOB change — clear age banner if the new date is 18+
  const handleDobChange = (e) => {
    const val = e.target.value;
    setDob(val);
    if (ageError && calcAge(val) >= 18) setAgeError(false);
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

  // Latest allowable DOB for the desktop date picker hint
  const today = new Date();
  const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  const maxDob = maxDate.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Build the DOB string depending on which input method is active
    const dobString = isMobile
      ? getMobileDobString(dobDay, dobMonth, dobYear)
      : dob;

    // Required fields — use dobString for the DOB check
    const mobileDobMissing = isMobile && (!dobDay || !dobMonth || !dobYear);
    if (!name || mobileDobMissing || (!isMobile && !dob) || !email || !password || !jurisdiction || !currency) {
      setError('Please fill in all required fields');
      return;
    }

    // Age gate — JS validation is the real enforcement on all platforms
    const age = calcAge(dobString);
    if (age === null || age < 18) {
      setAgeError(true);
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
      date_of_birth: dobString,
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

  // Red border style applied to DOB inputs when age gate fires
  const dobInputStyle = ageError
    ? { ...styles.input, borderColor: '#dc2626' }
    : styles.input;

  return (
    <div style={styles.container}>
      <style>{`
        .cf-signup-input:focus {
          outline: none;
          border-color: #0ea5e9 !important;
          background-color: #ffffff !important;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.12) !important;
        }
        /* Normalise date input on iOS Safari so it matches other inputs exactly. */
        .cf-signup-input[type="date"] {
          -webkit-appearance: none;
          appearance: none;
          line-height: normal;
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

          {/* Age gate banner — sits above all fields, persists until DOB is corrected */}
          {ageError && (
            <div style={styles.ageBanner}>
              <span style={styles.ageBannerIcon}>⛔</span>
              <span style={styles.ageBannerText}>You must be 18 or older to use Casiflow.</span>
            </div>
          )}

          {error && <div style={styles.errorBox}>{error}</div>}
          <form onSubmit={handleSubmit}>

            {/* Full Name + Date of Birth row */}
            <div style={isMobile ? styles.fieldFull : styles.row}>
              <div style={styles.field}>
                <label style={styles.label}>Full Name *</label>
                <input
                  className="cf-signup-input"
                  style={styles.input}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                />
              </div>
              <div style={styles.field}>
                <label style={styles.label}>Date of Birth *</label>
                {isMobile ? (
                  /* Three-select DOB picker for mobile */
                  <div style={styles.dobDropdownRow}>
                    <select
                      className="cf-signup-input"
                      style={dobInputStyle}
                      value={dobDay}
                      onChange={handleDobDayChange}
                    >
                      <option value="">Day</option>
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(d => (
                        <option key={d} value={String(d)}>{d}</option>
                      ))}
                    </select>
                    <select
                      className="cf-signup-input"
                      style={dobInputStyle}
                      value={dobMonth}
                      onChange={handleDobMonthChange}
                    >
                      <option value="">Month</option>
                      {monthNames.map((m, i) => (
                        <option key={m} value={String(i + 1)}>{m}</option>
                      ))}
                    </select>
                    <select
                      className="cf-signup-input"
                      style={dobInputStyle}
                      value={dobYear}
                      onChange={handleDobYearChange}
                    >
                      <option value="">Year</option>
                      {yearOptions.map(y => (
                        <option key={y} value={String(y)}>{y}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  /* Single date input for desktop */
                  <input
                    className="cf-signup-input"
                    style={dobInputStyle}
                    type="date"
                    value={dob}
                    onChange={handleDobChange}
                    max={maxDob}
                    min="1900-01-01"
                  />
                )}
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>Email *</label>
              <input className="cf-signup-input" style={styles.input} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
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

  // Age gate banner — large, bold, impossible to miss
  ageBanner: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#dc2626', borderRadius: '10px', padding: '16px 18px', marginBottom: '20px' },
  ageBannerIcon: { fontSize: '20px', flexShrink: 0 },
  ageBannerText: { color: 'white', fontSize: '16px', fontWeight: '700', lineHeight: '1.4' },

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

  // Three-select DOB row for mobile
  dobDropdownRow: { display: 'flex', gap: '8px' },

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

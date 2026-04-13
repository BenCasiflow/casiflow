import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function PrivacyPolicy() {
  const [isMobile, setIsMobile] = useState(() => window.matchMedia('(max-width: 767px)').matches);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div style={styles.page}>
      <div style={isMobile ? styles.topBarMobile : styles.topBar}>
        <Link to="/dashboard" style={styles.logoLink}><span style={styles.brand}>Casiflow</span></Link>
      </div>

      <div style={isMobile ? styles.wrapperMobile : styles.wrapper}>
        <div style={isMobile ? styles.cardMobile : styles.card}>

          <h1 style={styles.pageTitle}>Privacy Policy</h1>
          <p style={styles.pageSubtitle}>Last updated: April 2026</p>
          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>1. Introduction</h2>
            <p style={styles.body}>This Privacy Policy explains how Casiflow ("we", "us", "our") collects, uses, stores and protects your personal data when you use our website at www.casiflow.com and our web application at app.casiflow.com (together, "the Service"). We are committed to protecting your privacy and handling your data responsibly and transparently. Please read this policy carefully before using the Service.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>2. Who We Are</h2>
            <p style={styles.body}>Casiflow is operated under the name Casiflow. For any privacy related enquiries please contact us at support@casiflow.com.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>3. Data We Collect</h2>
            <p style={styles.body}>We collect the following personal data when you register and use Casiflow:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}><strong>Account data:</strong> your name, email address, date of birth, country of residence and currency preference.</li>
              <li style={styles.listItem}><strong>Gambling activity data:</strong> casino transaction data you manually enter or upload, including deposits, withdrawals and account balances across the casinos you add to your account.</li>
              <li style={styles.listItem}><strong>Settings data:</strong> spending limits, net loss limits, budget goals and other preferences you configure within the Service. Your net income is only collected if you voluntarily choose to share it with us. This information is never shared and is used solely to help you see what percentage of your income is spent on gambling.</li>
              <li style={styles.listItem}><strong>Usage data:</strong> information about how you use the Service, including login times, features used and pages visited.</li>
              <li style={styles.listItem}><strong>Communications data:</strong> any messages or feedback you send us via the contact form or by email.</li>
            </ul>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>4. How We Use Your Data</h2>
            <p style={styles.body}>We use your personal data for the following purposes and on the following legal bases:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>To provide and operate the Casiflow Service — <em>Performance of a contract</em></li>
              <li style={styles.listItem}>To display your gambling dashboard and calculate your net results — <em>Performance of a contract</em></li>
              <li style={styles.listItem}>To send you account-related notifications and alerts — <em>Performance of a contract</em></li>
              <li style={styles.listItem}>To respond to your enquiries and support requests — <em>Legitimate interests</em></li>
              <li style={styles.listItem}>To improve and develop the Service — <em>Legitimate interests</em></li>
              <li style={styles.listItem}>To comply with legal obligations — <em>Legal obligation</em></li>
            </ul>
            <p style={styles.body}>We do not sell your personal data to third parties. We do not share your data with casinos. We do not use your data for advertising purposes.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>5. Affiliate Disclosure</h2>
            <p style={styles.body}>Casiflow may earn affiliate commission when users sign up to casino operators through links displayed within the Service. This is disclosed transparently and does not affect the data or insights we show you. We do not share your personal data with affiliate partners.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>6. Third Party Data Processors</h2>
            <p style={styles.body}>We use the following third party services to operate the Service:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}><strong>Supabase</strong> — database and authentication provider. Your account data and gambling activity data is stored on Supabase's infrastructure. Supabase is SOC 2 compliant and stores data in secure, encrypted form.</li>
              <li style={styles.listItem}><strong>Vercel</strong> — website and application hosting provider.</li>
              <li style={styles.listItem}><strong>Resend</strong> — email delivery service used to send account notifications and transactional emails.</li>
            </ul>
            <p style={styles.body}>We will update this section if we add additional third party processors.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>7. International Data Transfers</h2>
            <p style={styles.body}>Some of our third party processors may store or process your data outside the European Economic Area (EEA) or United Kingdom. Where this occurs we ensure appropriate safeguards are in place, including Standard Contractual Clauses approved by the European Commission, to protect your data in accordance with GDPR requirements.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>8. Data Retention</h2>
            <p style={styles.body}>We retain your personal data for as long as your account is active. If you delete your account we will delete your personal data within 30 days, except where we are required to retain it for legal or compliance purposes. Usage and analytics data may be retained in anonymised form for longer periods for the purpose of improving the Service.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>9. Cookies</h2>
            <p style={styles.body}>Casiflow uses only essential cookies that are strictly necessary for the Service to function. These cookies cannot be disabled without affecting the functionality of the Service. We do not use advertising cookies, tracking cookies or any third party analytics cookies.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>10. Your Rights Under GDPR</h2>
            <p style={styles.body}>If you are based in the European Union or United Kingdom you have the following rights regarding your personal data:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}><strong>Right of access</strong> — you have the right to request a copy of the personal data we hold about you</li>
              <li style={styles.listItem}><strong>Right to rectification</strong> — you have the right to request correction of inaccurate or incomplete data</li>
              <li style={styles.listItem}><strong>Right to erasure</strong> — you have the right to request deletion of your personal data</li>
              <li style={styles.listItem}><strong>Right to data portability</strong> — you have the right to receive your data in a structured, machine-readable format</li>
              <li style={styles.listItem}><strong>Right to object</strong> — you have the right to object to certain types of processing of your data</li>
              <li style={styles.listItem}><strong>Right to restrict processing</strong> — you have the right to request that we restrict how we use your data</li>
              <li style={styles.listItem}><strong>Right to withdraw consent</strong> — where processing is based on consent you have the right to withdraw that consent at any time</li>
            </ul>
            <p style={styles.body}>You can exercise your rights at any time by visiting your Profile page under My Data, or by contacting us at support@casiflow.com.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>11. Right to Lodge a Complaint</h2>
            <p style={styles.body}>If you are unhappy with how we handle your personal data you have the right to lodge a complaint with your local data protection supervisory authority. In Malta this is the Information and Data Protection Commissioner (idpc.org.mt). We do, however, recommend that you first contact us so that we can address and/or answer your questions, concerns, or issues before you refer the matter to the supervisory authority.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>12. Data Security</h2>
            <p style={styles.body}>We implement appropriate technical and organisational measures to protect your personal data against unauthorised access, loss, destruction or alteration. All data is stored in encrypted form. Access to personal data is restricted to authorised personnel only. Despite these measures no method of transmission over the internet or electronic storage is completely secure. We cannot guarantee absolute security but we are committed to protecting your data to the highest standard.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>13. Children</h2>
            <p style={styles.body}>Casiflow is not intended for use by anyone under the age of 18. We do not knowingly collect personal data from anyone under 18. If you believe we have inadvertently collected data from a minor please contact us immediately at support@casiflow.com and we will delete it promptly.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>14. Links to Third Party Websites</h2>
            <p style={styles.body}>The Service may contain links to third party websites including responsible gambling organisations and casino operators. We are not responsible for the privacy practices or content of those websites. We encourage you to read their privacy policies before providing any personal data.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>15. Changes to This Policy</h2>
            <p style={styles.body}>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by email or through the Service. Your continued use of the Service after any changes constitutes your acceptance of the updated policy.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>16. Contact</h2>
            <p style={styles.body}>If you have any questions about this Privacy Policy or how we handle your personal data please contact us at: <strong>support@casiflow.com</strong></p>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', backgroundColor: '#f1f5f9', fontFamily: "'Segoe UI', Arial, sans-serif" },
  topBar: { display: 'flex', alignItems: 'center', padding: '16px 28px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  topBarMobile: { display: 'flex', alignItems: 'center', padding: '12px 16px', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 50 },
  logoLink: { textDecoration: 'none' },
  brand: { color: '#0ea5e9', fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' },
  wrapper: { maxWidth: '760px', margin: '0 auto', padding: '32px 24px' },
  wrapperMobile: { padding: '16px' },
  card: { backgroundColor: 'white', borderRadius: '12px', padding: '36px 40px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  cardMobile: { backgroundColor: 'white', borderRadius: '12px', padding: '24px 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' },
  pageTitle: { color: '#0f172a', fontSize: '22px', fontWeight: '800', margin: '0 0 4px 0' },
  pageSubtitle: { color: '#64748b', fontSize: '13px', margin: '0 0 0 0' },
  divider: { height: '1px', backgroundColor: '#e2e8f0', margin: '24px 0' },
  section: {},
  sectionHeading: { color: '#0f172a', fontSize: '16px', fontWeight: '700', margin: '0 0 10px 0' },
  body: { color: '#374151', fontSize: '14px', lineHeight: '1.7', margin: '0 0 10px 0' },
  list: { color: '#374151', fontSize: '14px', lineHeight: '1.7', margin: '8px 0 10px 0', paddingLeft: '22px' },
  listItem: { marginBottom: '8px' },
};

export default PrivacyPolicy;

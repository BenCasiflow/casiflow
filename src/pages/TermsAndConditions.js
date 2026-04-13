import { useState, useEffect } from 'react';

function TermsAndConditions() {
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
        <span style={styles.brand}>Casiflow</span>
      </div>

      <div style={isMobile ? styles.wrapperMobile : styles.wrapper}>
        <div style={isMobile ? styles.cardMobile : styles.card}>

          <h1 style={styles.pageTitle}>Terms &amp; Conditions</h1>
          <p style={styles.pageSubtitle}>Last updated: April 2026</p>
          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>1. About Casiflow</h2>
            <p style={styles.body}>Casiflow is a personal finance tracking tool that allows users to monitor their casino spending across multiple platforms. Casiflow is not a gambling operator, does not facilitate gambling, and is not affiliated with any casino or gambling company. Casiflow is operated under the trading name Casiflow and can be contacted at support@casiflow.com.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>2. Eligibility</h2>
            <p style={styles.body}>You must be at least 18 years of age to use Casiflow. By creating an account you confirm that:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>You are 18 years of age or older</li>
              <li style={styles.listItem}>Using a gambling tracking tool is legal in your jurisdiction</li>
              <li style={styles.listItem}>You are not located in a jurisdiction where access to gambling-related services is prohibited</li>
              <li style={styles.listItem}>All information you provide during registration is accurate and truthful</li>
            </ul>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>3. Your Account</h2>
            <p style={styles.body}>You are responsible for maintaining the security of your account credentials. You must not share your account with others or allow unauthorised access. You are responsible for all activity that occurs under your account. If you suspect unauthorised access to your account, you must notify us immediately at support@casiflow.com. We reserve the right to suspend or terminate your account if we believe these terms have been violated.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>4. Acceptable Use</h2>
            <p style={styles.body}>You agree to use Casiflow only for its intended purpose of tracking your personal gambling activity. You must not:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Use the Service for any unlawful purpose</li>
              <li style={styles.listItem}>Attempt to gain unauthorised access to any part of the Service</li>
              <li style={styles.listItem}>Interfere with or disrupt the Service or its infrastructure</li>
              <li style={styles.listItem}>Upload malicious code or files</li>
              <li style={styles.listItem}>Impersonate any person or entity</li>
              <li style={styles.listItem}>Use the Service in any way that could damage, disable or impair it</li>
            </ul>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>5. Data You Enter</h2>
            <p style={styles.body}>All transaction data entered into Casiflow is provided by you manually or via file upload. Casiflow does not connect to casino accounts directly and does not verify the accuracy of data you enter. You are responsible for the accuracy of the data you input. Casiflow accepts no liability for decisions made based on inaccurate data you have entered.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>6. Not Financial or Legal Advice</h2>
            <p style={styles.body}>Casiflow provides spending tracking and summary information only. Nothing in the Casiflow service constitutes financial advice, legal advice, or gambling advice. Spending alerts and limit notifications are informational tools only and do not replace professional advice. You should seek independent professional advice before making any financial decisions.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>7. Affiliate Recommendations</h2>
            <p style={styles.body}>Casiflow may display recommended casinos in the app and on the website. These recommendations may be affiliate links through which Casiflow earns a commission if you register or deposit at a recommended casino. This commission is earned at no additional cost to you. Recommended casinos are selected based on licensing, reputation and player protection standards. Casiflow only recommends regulated operators. However, Casiflow does not accept responsibility for the conduct, practices or policies of any third party casino operator. You use any recommended casino at your own risk and should review their own terms and conditions before registering.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>8. Responsible Gambling</h2>
            <p style={styles.body}>Casiflow is designed to support responsible gambling by helping players track their spending across multiple platforms. We strongly encourage all users to:</p>
            <ul style={styles.list}>
              <li style={styles.listItem}>Set deposit and loss limits within the Service</li>
              <li style={styles.listItem}>Take regular breaks from gambling</li>
              <li style={styles.listItem}>Never gamble with money they cannot afford to lose</li>
              <li style={styles.listItem}>Use national self-exclusion registers if gambling becomes a problem</li>
            </ul>
            <p style={styles.body}>If you feel your gambling is becoming a problem, we encourage you to use the responsible gambling resources available in the app and to self-exclude via your national self-exclusion register.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>9. Intellectual Property</h2>
            <p style={styles.body}>All content, design, graphics, logos and software within the Service are the intellectual property of Casiflow and are protected by applicable copyright and trademark laws. You may not reproduce, distribute or create derivative works from any part of the Service without our express written permission.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>10. Privacy</h2>
            <p style={styles.body}>Your use of the Service is also governed by our Privacy Policy, which is incorporated into these Terms by reference. By using the Service you agree to the collection and use of your data as described in our Privacy Policy.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>11. Service Availability</h2>
            <p style={styles.body}>Casiflow is provided on an as-is and as-available basis. We do not guarantee that the Service will be error-free, uninterrupted or available at all times. We reserve the right to modify, suspend or discontinue the Service at any time with or without notice. We will not be liable to you or any third party for any modification, suspension or discontinuation of the Service.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>12. Limitation of Liability</h2>
            <p style={styles.body}>To the maximum extent permitted by applicable law, Casiflow and its operators shall not be liable for any indirect, incidental, special, consequential or punitive damages, including but not limited to loss of data, loss of profits or any other losses arising from your use of or inability to use the Service. Our total liability to you for any claim arising from your use of the Service shall not exceed the amount you have paid us in the twelve months prior to the claim. As Casiflow is a free service, this amount is zero. Nothing in these terms limits our liability for death or personal injury caused by our negligence, fraud or any other liability that cannot be excluded by law.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>13. Indemnification</h2>
            <p style={styles.body}>You agree to indemnify and hold harmless Casiflow and its operators from any claims, damages, losses or expenses including legal fees arising from your use of the Service, your violation of these terms or your violation of any rights of a third party.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>14. Changes to These Terms</h2>
            <p style={styles.body}>We may update these Terms and Conditions from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by email or through the Service. Your continued use of Casiflow after changes are posted constitutes your acceptance of the updated terms.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>15. Termination</h2>
            <p style={styles.body}>We reserve the right to terminate or suspend your account at any time without notice if we believe you have violated these terms or for any other reason at our sole discretion. Upon termination your right to use the Service will immediately cease. You may also delete your account at any time from your Profile page.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>16. Governing Law</h2>
            <p style={styles.body}>These Terms and Conditions are governed by the laws of Malta. Any disputes arising from these terms or your use of the Service shall be subject to the exclusive jurisdiction of the courts of Malta.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>17. Severability</h2>
            <p style={styles.body}>If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>18. Entire Agreement</h2>
            <p style={styles.body}>These Terms and Conditions together with our Privacy Policy constitute the entire agreement between you and Casiflow regarding your use of the Service and supersede all prior agreements and understandings.</p>
          </div>

          <div style={styles.divider} />

          <div style={styles.section}>
            <h2 style={styles.sectionHeading}>19. Contact</h2>
            <p style={styles.body}>If you have any questions about these Terms and Conditions please contact us at: <strong>support@casiflow.com</strong></p>
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

export default TermsAndConditions;

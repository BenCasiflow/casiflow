import { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.location.href = 'https://www.casiflow.com/privacy-policy.html';
  }, []);

  return null;
};

export default PrivacyPolicy;

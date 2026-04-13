import { useEffect } from 'react';

const TermsAndConditions = () => {
  useEffect(() => {
    window.location.href = 'https://www.casiflow.com/terms.html';
  }, []);

  return null;
};

export default TermsAndConditions;

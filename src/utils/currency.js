/**
 * Casiflow currency utility
 *
 * Single source of truth for currency codes and their display symbols.
 * Import getCurrencyCode() and getCurrencySymbol() in any component that
 * displays monetary values.
 */

export const CURRENCY_SYMBOLS = {
  EUR: '€',
  GBP: '£',
  USD: '$',
  CAD: '$',
  AUD: '$',
  NZD: '$',
  SEK: 'kr',
  DKK: 'kr',
  NOK: 'kr',
  ISK: 'kr',
  CHF: 'Fr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  BGN: 'лв',
  JPY: '¥',
};

/**
 * All supported currency codes, in display order for dropdowns.
 */
export const CURRENCY_CODES = [
  'EUR', 'GBP', 'SEK', 'DKK', 'NOK', 'USD', 'AUD', 'CAD', 'CHF',
  'NZD', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'ISK', 'JPY', 'Other',
];

/**
 * Returns the currency code for the current user.
 * Priority: profile prop → sessionStorage → 'EUR' default.
 *
 * @param {object|null} profile - the profile object from Supabase (may be null on first render)
 * @returns {string} currency code, e.g. 'GBP'
 */
export function getCurrencyCode(profile) {
  return profile?.currency || sessionStorage.getItem('userCurrency') || 'EUR';
}

/**
 * Returns the display symbol for the current user's currency.
 * Priority: profile prop → sessionStorage → '€' default.
 *
 * @param {object|null} profile - the profile object from Supabase (may be null on first render)
 * @returns {string} symbol, e.g. '£'
 */
export function getCurrencySymbol(profile) {
  const code = getCurrencyCode(profile);
  return CURRENCY_SYMBOLS[code] || '€';
}

// Exchange rates utility with fallback rates
// In production, you should fetch from a real API

// Fallback rates (approximate as of Feb 2026)
const FALLBACK_RATES = {
  INR: 1,
  USD: 0.012,
  EUR: 0.011,
  GBP: 0.0095,
  AED: 0.044,
  AUD: 0.018,
  CAD: 0.016,
  SGD: 0.016,
  JPY: 1.80
};

// Cache for rates
let ratesCache = {
  rates: FALLBACK_RATES,
  timestamp: Date.now(),
  base: 'INR'
};

// Cache expiry (1 hour)
const CACHE_EXPIRY = 60 * 60 * 1000;

/**
 * Fetch exchange rates from API or return cached rates
 * @param {string} base - Base currency (default: INR)
 * @returns {Promise<Object>} Exchange rates
 */
export const getRates = async (base = 'INR') => {
  try {
    // Check if cache is still valid
    if (ratesCache.base === base && 
        Date.now() - ratesCache.timestamp < CACHE_EXPIRY) {
      return ratesCache.rates;
    }

    // Try to fetch from external API (you can replace with your preferred API)
    try {
      // Example using exchangerate-api.com (free tier)
      // const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${base}`);
      // const data = await response.json();
      // ratesCache = {
      //   rates: data.rates,
      //   timestamp: Date.now(),
      //   base
      // };
      // return data.rates;
      
      // For now, return fallback rates
      console.log('Using fallback exchange rates');
      ratesCache = {
        rates: FALLBACK_RATES,
        timestamp: Date.now(),
        base
      };
      return FALLBACK_RATES;
    } catch (apiError) {
      console.warn('Failed to fetch exchange rates, using fallback:', apiError.message);
      return FALLBACK_RATES;
    }
  } catch (error) {
    console.error('Error in getRates:', error);
    return FALLBACK_RATES;
  }
};

/**
 * Convert amount from base currency to target currency
 * @param {number} amount - Amount in base currency
 * @param {Object} rates - Exchange rates object
 * @param {string} toCurrency - Target currency code
 * @returns {number|null} Converted amount or null if conversion fails
 */
export const convertAmount = (amount, rates, toCurrency) => {
  if (!amount || isNaN(amount)) return null;
  if (!rates || !rates[toCurrency]) return null;
  
  const rate = rates[toCurrency];
  return amount * rate;
};

/**
 * Format amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @returns {string} Formatted amount
 */
export const formatCurrency = (amount, currency = 'INR') => {
  if (!amount && amount !== 0) return '';
  
  const symbols = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    AED: 'د.إ',
    AUD: 'A$',
    CAD: 'C$',
    SGD: 'S$',
    JPY: '¥'
  };
  
  const symbol = symbols[currency] || currency;
  const formatted = amount.toLocaleString(undefined, {
    minimumFractionDigits: currency === 'JPY' ? 0 : 2,
    maximumFractionDigits: currency === 'JPY' ? 0 : 2
  });
  
  return `${symbol}${formatted}`;
};
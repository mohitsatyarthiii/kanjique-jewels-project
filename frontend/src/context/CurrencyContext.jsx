import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axiosInstance';

const supported = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'AUD', 'CAD', 'SGD', 'JPY'];

// Currency symbols mapping
const currencySymbols = {
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

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try { 
      const saved = localStorage.getItem('currency');
      return saved && supported.includes(saved) ? saved : 'INR'; 
    } catch(e){ 
      return 'INR'; 
    }
  });
  
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Fetch exchange rates
  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/exchange/rates?base=INR`);
        if (res.data.success) {
          setRates(res.data.rates || {});
          setLastUpdated(new Date().toISOString());
        }
      } catch (err) {
        console.error('Failed to fetch exchange rates', err.message || err);
        // Set fallback rates if API fails
        setRates({
          USD: 0.012,  // 1 INR = 0.012 USD
          EUR: 0.011,
          GBP: 0.0095,
          AED: 0.044,
          AUD: 0.018,
          CAD: 0.016,
          SGD: 0.016,
          JPY: 1.80
        });
      } finally { 
        setLoading(false); 
      }
    };
    fetchRates();
  }, []);

  // Save currency preference
  useEffect(() => {
    try { 
      localStorage.setItem('currency', currency); 
    } catch(e){}
  }, [currency]);

  // Convert amount from INR to selected currency
  const convertAmount = (amountInINR) => {
    if (!amountInINR && amountInINR !== 0) return 0;
    if (currency === 'INR' || !rates || !rates[currency]) return Number(amountInINR);
    
    const rate = rates[currency];
    return Number(amountInINR) * rate;
  };

  // Format price with currency symbol and proper decimals
  const formatPrice = (amountInINR, options = {}) => {
    const { showSymbol = true, decimals = 2 } = options;
    
    if (!amountInINR && amountInINR !== 0) return showSymbol ? `${getSymbol()}0.00` : '0.00';
    
    const converted = convertAmount(amountInINR);
    
    // Handle JPY (no decimals)
    const decimalPlaces = currency === 'JPY' ? 0 : decimals;
    
    const formatted = converted.toLocaleString(undefined, {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
    
    return showSymbol ? `${getSymbol()}${formatted}` : formatted;
  };

  // Get currency symbol
  const getSymbol = () => {
    return currencySymbols[currency] || currency + ' ';
  };

  // Get currency code
  const getCurrencyCode = () => currency;

  // Check if currency conversion is available
  const isConversionAvailable = () => {
    return currency === 'INR' || (rates && rates[currency]);
  };

  // Get exchange rate for selected currency
  const getExchangeRate = () => {
    if (currency === 'INR') return 1;
    return rates[currency] || 1;
  };

  // Format for API/backend (returns just the number)
  const getConvertedValue = (amountInINR) => {
    return convertAmount(amountInINR);
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      supported,
      rates,
      loading,
      lastUpdated,
      format: formatPrice,
      convertValue: getConvertedValue,
      getSymbol,
      getCurrencyCode,
      isConversionAvailable,
      getExchangeRate,
      convertAmount // raw conversion without formatting
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}
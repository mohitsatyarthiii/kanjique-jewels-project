import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../utils/axiosInstance';

const supported = ['INR','USD','EUR','GBP','AED','AUD','CAD','SGD','JPY'];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(() => {
    try { return localStorage.getItem('currency') || 'INR'; } catch(e){ return 'INR'; }
  });
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRates = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/api/exchange/rates?base=INR`);
        if (res.data.success) setRates(res.data.rates || {});
      } catch (err) {
        console.error('Failed to fetch exchange rates', err.message || err);
      } finally { setLoading(false); }
    };
    fetchRates();
  }, []);

  useEffect(() => {
    try { localStorage.setItem('currency', currency); } catch(e){}
  }, [currency]);

  const format = (amountInINR) => {
    if (currency === 'INR' || !rates) return `₹${Number(amountInINR).toLocaleString()}`;
    const rate = rates[currency];
    const converted = rate ? (amountInINR * rate) : amountInINR;
    const symbol = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : currency === 'AED' ? 'د.إ' : currency + ' ';
    return `${symbol}${Number(converted).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`;
  };

  const convertValue = (amountInINR) => {
    if (currency === 'INR' || !rates) return amountInINR;
    const rate = rates[currency];
    return rate ? Math.round((amountInINR * rate) * 100) / 100 : amountInINR;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, supported, rates, loading, format, convertValue }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

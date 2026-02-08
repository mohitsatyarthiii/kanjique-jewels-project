import React from 'react';
import { useCurrency } from '../../context/CurrencyContext';

export default function CurrencySelector() {
  const { currency, setCurrency, supported } = useCurrency() || {};

  if (!supported) return null;

  return (
    <div className="relative">
      <select
        value={currency}
        onChange={(e) => setCurrency(e.target.value)}
        className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm hover:shadow-sm"
      >
        {supported.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>
    </div>
  );
}

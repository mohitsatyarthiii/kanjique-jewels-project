import axios from 'axios';

let cache = {
  timestamp: 0,
  rates: {},
  base: 'INR',
};

const TTL = 1000 * 60 * 10; // 10 minutes

export async function getRates(base = 'INR') {
  const now = Date.now();
  if (cache.base === base && cache.rates && (now - cache.timestamp) < TTL) {
    return cache.rates;
  }

  try {
    const res = await axios.get(`https://api.exchangerate.host/latest?base=${base}`);
    const data = res.data;
    if (data && data.rates) {
      cache = {
        timestamp: now,
        rates: data.rates,
        base,
      };
      return data.rates;
    }
    throw new Error('No rates received');
  } catch (err) {
    if (cache.rates && Object.keys(cache.rates).length) {
      return cache.rates; // fallback to cache
    }
    throw err;
  }
}

export function convertAmount(amount, rates, target) {
  // amount assumed in base currency of rates (e.g., INR)
  if (!rates || !rates[target]) return null;
  return Math.round((amount * rates[target]) * 100) / 100;
}

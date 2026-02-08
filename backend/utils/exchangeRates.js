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

  // Prefer exchangerate.host if API key provided, otherwise fallback to public free provider
  const hostKey = process.env.EXCHANGE_RATE_HOST_KEY || process.env.EXCHANGE_API_KEY;

  try {
    let data;

    if (hostKey) {
      // exchangerate.host now may require an access key; include if available
      const res = await axios.get(`https://api.exchangerate.host/latest?base=${base}&access_key=${hostKey}`);
      data = res.data;
      // exchangerate.host historically returns { rates }
      if (data && data.rates) {
        cache = { timestamp: now, rates: data.rates, base };
        return data.rates;
      }
      // If the provider returns an error object, throw
      throw new Error(data?.error?.info || 'No rates received');
    }

    // Fallback: open.er-api.com (no key required)
    const res2 = await axios.get(`https://open.er-api.com/v6/latest/${base}`);
    data = res2.data;
    // open.er-api returns either .rates or .conversion_rates depending on provider
    const rates = data.rates || data.conversion_rates || data['conversion_rates'];
    if (rates && Object.keys(rates).length) {
      cache = { timestamp: now, rates, base };
      return rates;
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

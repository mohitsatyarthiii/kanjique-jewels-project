import {Product} from "../models/Product.js";
import axios from "axios";

// --------------------------------------------------
// 🌍 COUNTRY → CURRENCY + LANGUAGE MAP (WIDER COVERAGE)
// --------------------------------------------------
const getLocaleByCountry = (country) => {
  const map = {
    // 🇮🇳 India
    IN: { currency: "INR", language: "hi" },

    // 🇺🇸 USA
    US: { currency: "USD", language: "en" },

    // 🇦🇪 UAE / Middle East
    AE: { currency: "AED", language: "ar" },
    SA: { currency: "SAR", language: "ar" },
    QA: { currency: "QAR", language: "ar" },
    KW: { currency: "KWD", language: "ar" },

    // 🇪🇺 Europe
    FR: { currency: "EUR", language: "fr" },
    DE: { currency: "EUR", language: "de" },
    IT: { currency: "EUR", language: "it" },
    ES: { currency: "EUR", language: "es" },
    NL: { currency: "EUR", language: "nl" },

    // 🇬🇧 UK
    GB: { currency: "GBP", language: "en" },

    // 🇨🇦 Canada
    CA: { currency: "CAD", language: "en" },

    // 🇦🇺 Australia
    AU: { currency: "AUD", language: "en" },

    // 🇯🇵 Japan
    JP: { currency: "JPY", language: "ja" },

    // 🇨🇳 China
    CN: { currency: "CNY", language: "zh" },

    // 🇰🇷 South Korea
    KR: { currency: "KRW", language: "ko" },

    // 🇸🇬 Singapore
    SG: { currency: "SGD", language: "en" },

    // 🇭🇰 Hong Kong
    HK: { currency: "HKD", language: "en" },

    // 🇧🇷 Brazil
    BR: { currency: "BRL", language: "pt" },

    // 🇷🇺 Russia
    RU: { currency: "RUB", language: "ru" },

    // 🇿🇦 South Africa
    ZA: { currency: "ZAR", language: "en" }
  };

  // DEFAULT (agar country na mile)
  return map[country] || { currency: "USD", language: "en" };
};

// --------------------------------------------------
// LIVE EXCHANGE RATE FETCH
// --------------------------------------------------
const getExchangeRate = async (from, to) => {
  try {
    const url = `https://api.exchangerate-api.com/v4/latest/${from}`;
    const res = await axios.get(url);
    return res.data.rates[to] || 1;
  } catch (error) {
    console.error("Exchange rate error:", error.message);
    return 1; // fallback
  }
};

// --------------------------------------------------
// MAIN CONTROLLER
// --------------------------------------------------
export const getLocalizedProducts = async (req, res) => {
  try {
    const country = req.query.country || "US";

    const locale = getLocaleByCountry(country);
    const targetCurrency = locale.currency;
    const targetLanguage = locale.language;

    let rate = 1;
    if (targetCurrency !== "INR") {
      rate = await getExchangeRate("INR", targetCurrency);
    }

    const products = await Product.find();

    const localizedProducts = products.map(p => ({
      _id: p._id,
      name: p.name,
      description: p.description,
      price: Number((p.priceINR * rate).toFixed(2)),
      currency: targetCurrency,
      language: targetLanguage
    }));

    res.status(200).json({
      country,
      currency: targetCurrency,
      language: targetLanguage,
      products: localizedProducts
    });

  } catch (err) {
    console.error("Localization error:", err.message);
    res.status(500).json({ error: "Localization failed" });
  }
};

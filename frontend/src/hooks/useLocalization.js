import { useEffect } from "react";

const localeMap = {
  // 🇮🇳 India
  IN: { language: "hi", currency: "INR" },

  // 🇺🇸 USA
  US: { language: "en", currency: "USD" },

  // 🇬🇧 UK
  GB: { language: "en", currency: "GBP" },

  // 🇦🇪 Middle East
  AE: { language: "ar", currency: "AED" },
  SA: { language: "ar", currency: "SAR" },
  QA: { language: "ar", currency: "QAR" },
  KW: { language: "ar", currency: "KWD" },

  // 🇪🇺 Europe
  FR: { language: "fr", currency: "EUR" },
  DE: { language: "de", currency: "EUR" },
  IT: { language: "it", currency: "EUR" },
  ES: { language: "es", currency: "EUR" },
  NL: { language: "nl", currency: "EUR" },

  // 🇨🇦 Canada
  CA: { language: "en", currency: "CAD" },

  // 🇦🇺 Australia
  AU: { language: "en", currency: "AUD" },

  // 🇯🇵 Japan
  JP: { language: "ja", currency: "JPY" },

  // 🇨🇳 China
  CN: { language: "zh", currency: "CNY" },

  // 🇰🇷 South Korea
  KR: { language: "ko", currency: "KRW" },

  // 🇸🇬 Singapore
  SG: { language: "en", currency: "SGD" },

  // 🇭🇰 Hong Kong
  HK: { language: "en", currency: "HKD" },

  // 🇧🇷 Brazil
  BR: { language: "pt", currency: "BRL" },

  // 🇷🇺 Russia
  RU: { language: "ru", currency: "RUB" },

  // 🇿🇦 South Africa
  ZA: { language: "en", currency: "ZAR" }
};

export const useLocalization = () => {
  useEffect(() => {
    const detectLocation = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();

        const country = data.country_code || "US";

        const locale = localeMap[country] || {
          language: "en",
          currency: "USD"
        };

        // Save globally for whole app
        localStorage.setItem("userCountry", country);
        localStorage.setItem("userLanguage", locale.language);
        localStorage.setItem("userCurrency", locale.currency);

      } catch (err) {
        console.error("Location detect failed", err);

        // Fallback defaults
        localStorage.setItem("userCountry", "US");
        localStorage.setItem("userLanguage", "en");
        localStorage.setItem("userCurrency", "USD");
      }
    };

    detectLocation();
  }, []);
};

import { createContext, useState, useEffect } from "react";

export const LocalizationContext = createContext();

export const LocalizationProvider = ({ children }) => {
  const [country, setCountry] = useState("US");
  const [currency, setCurrency] = useState("USD");
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const savedCountry = localStorage.getItem("userCountry") || "US";

    setCountry(savedCountry);

    // Map same as backend
    const map = {
      IN: { currency: "INR", language: "hi" },
      US: { currency: "USD", language: "en" },
      AE: { currency: "AED", language: "ar" },
      FR: { currency: "EUR", language: "fr" }
    };

    const locale = map[savedCountry] || { currency: "USD", language: "en" };

    setCurrency(locale.currency);
    setLanguage(locale.language);

  }, []);

  return (
    <LocalizationContext.Provider
      value={{ country, currency, language }}
    >
      {children}
    </LocalizationContext.Provider>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { useCurrency } from '../../context/CurrencyContext';
import { FiChevronDown, FiDollarSign } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const CurrencySelector = ({ isGlass = false, mobile = false, menu = false }) => {
  const { currency, setCurrency, supported, rates } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Currency symbols for display
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (curr) => {
    setCurrency(curr);
    setIsOpen(false);
  };

  // Mobile version - simplified for small screens
  if (mobile) {
    if (menu) {
      // Inside mobile menu - show as full option
      return (
        <div className="w-full">
          <div className="text-xs font-medium text-gray-500 mb-2 px-2">Select Currency</div>
          <div className="grid grid-cols-3 gap-2">
            {supported.map((curr) => (
              <button
                key={curr}
                onClick={() => handleSelect(curr)}
                className={`
                  py-2 px-1 rounded-lg text-xs font-medium transition-all
                  ${currency === curr 
                    ? 'bg-[#b2965a] text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }
                `}
              >
                <span className="block">{currencySymbols[curr] || curr}</span>
                <span className="block text-[10px] mt-0.5">{curr}</span>
              </button>
            ))}
          </div>
        </div>
      );
    }

    // Compact mobile version (in navbar)
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            flex items-center gap-1 px-2 py-1.5 rounded-lg transition-all
            ${isGlass 
              ? 'bg-white/20 backdrop-blur-sm text-gray-800 hover:bg-white/30' 
              : 'bg-black/20 backdrop-blur-sm text-white hover:bg-black/30'
            }
          `}
        >
          <FiDollarSign className="w-4 h-4" />
          <span className="text-sm font-medium">{currency}</span>
          <FiChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-50"
            >
              <div className="py-1">
                {supported.map((curr) => (
                  <button
                    key={curr}
                    onClick={() => handleSelect(curr)}
                    className={`
                      w-full text-left px-3 py-2 text-sm flex items-center gap-2
                      ${currency === curr 
                        ? 'bg-[#fef8e9] text-[#b2965a] font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="w-6">{currencySymbols[curr] || curr}</span>
                    <span className="flex-1">{curr}</span>
                    {currency === curr && (
                      <span className="text-[#b2965a]">✓</span>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg transition-all
          ${isGlass 
            ? 'bg-gray-100/80 text-gray-800 hover:bg-gray-200/80' 
            : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'
          }
        `}
      >
        <FiDollarSign className="w-4 h-4" />
        <span className="text-sm font-medium">{currency}</span>
        <FiChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden z-50"
          >
            <div className="p-2 border-b border-gray-100 bg-gray-50">
              <p className="text-xs text-gray-500">Select Currency</p>
            </div>
            <div className="max-h-80 overflow-y-auto py-1">
              {supported.map((curr) => (
                <button
                  key={curr}
                  onClick={() => handleSelect(curr)}
                  className={`
                    w-full text-left px-4 py-3 text-sm flex items-center gap-3
                    ${currency === curr 
                      ? 'bg-[#fef8e9] text-[#b2965a] font-medium' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className="w-8 text-base">{currencySymbols[curr] || curr}</span>
                  <span className="flex-1">{curr}</span>
                  {rates[curr] && (
                    <span className="text-xs text-gray-400">
                      1 INR = {rates[curr].toFixed(4)}
                    </span>
                  )}
                  {currency === curr && (
                    <span className="text-[#b2965a]">✓</span>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CurrencySelector;
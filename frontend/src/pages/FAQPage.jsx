import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FiChevronDown, 
  FiChevronUp, 
  FiHelpCircle, 
  FiShoppingBag,
  FiCreditCard,
  FiTruck,
  FiShield,
  FiStar,
  FiGift,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle,
  FiPackage,
  FiLock
} from "react-icons/fi";
import { 
  Sparkles, 
  Crown, 
  Shield, 
  Truck, 
  CreditCard,
  Gift,
  Award,
  Headphones,
  Phone,
  Mail,
  MessageSquare,
  Zap,
  Target,
  CheckCircle
} from "lucide-react";
import { Link } from "react-router-dom";

const FAQPage = () => {
  const [openCategory, setOpenCategory] = useState("orders");
  const [openItems, setOpenItems] = useState([]);

  const toggleItem = (id) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const faqCategories = [
    {
      id: "orders",
      title: "Orders & Shipping",
      icon: <FiShoppingBag className="w-5 h-5" />,
      color: "from-blue-500 to-cyan-500",
      items: [
        {
          id: "order-1",
          q: "How do I track my order?",
          a: "Once your order is shipped, you'll receive a tracking number via email. You can track your order using this number on our website or the courier partner's website."
        },
        {
          id: "order-2",
          q: "What is your shipping policy?",
          a: "We offer standard shipping within 5-7 business days. Express shipping options are available at checkout for faster delivery. All orders are securely packed and shipped with care."
        },
        {
          id: "order-3",
          q: "Do you offer international shipping?",
          a: "Currently, we only ship within India. We're working on expanding our shipping options to international locations soon."
        }
      ]
    },
    {
      id: "products",
      title: "Products",
      icon: <Sparkles className="w-5 h-5" />,
      color: "from-purple-500 to-pink-500",
      items: [
        {
          id: "product-1",
          q: "What materials are used in your jewelry?",
          a: "We use high-quality artificial materials including cubic zirconia, synthetic stones, and plated metals that mimic the look of real jewelry without the high cost."
        },
        {
          id: "product-2",
          q: "Is the jewelry waterproof?",
          a: "Our jewelry is water-resistant for daily wear but we recommend removing it before swimming, showering, or applying lotions to maintain its appearance."
        },
        {
          id: "product-3",
          q: "Do you offer customization?",
          a: "Currently, we don't offer customization or resizing services as all our products are pre-designed and made with artificial materials."
        }
      ]
    },
    {
      id: "payments",
      title: "Payments",
      icon: <FiCreditCard className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      items: [
        {
          id: "payment-1",
          q: "What payment methods do you accept?",
          a: "We accept UPI, credit/debit cards, net banking, and popular digital wallets. All payments are secure and encrypted."
        },
        {
          id: "payment-2",
          q: "Is there any additional cost?",
          a: "The price shown is final with GST included. Shipping charges may apply based on your location and selected shipping method."
        }
      ]
    },
    {
      id: "account",
      title: "Account",
      icon: <FiUser className="w-5 h-5" />,
      color: "from-indigo-500 to-blue-500",
      items: [
        {
          id: "account-1",
          q: "How do I create an account?",
          a: "Click 'Sign Up' on our website and enter your email address. You'll receive a verification email to complete your registration."
        },
        {
          id: "account-2",
          q: "How can I reset my password?",
          a: "Click 'Forgot Password' on the login page and follow the instructions sent to your registered email address."
        }
      ]
    }
  ];

  const popularQuestions = [
    {
      icon: <Truck className="w-5 h-5" />,
      question: "How long does shipping take?",
      answer: "5-7 business days for standard shipping"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      question: "What payment methods?",
      answer: "UPI, cards, net banking, digital wallets"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      question: "Is it waterproof?",
      answer: "Water-resistant for daily wear"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      question: "Gift wrapping available?",
      answer: "Yes, free gift wrapping"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      question: "Real or artificial?",
      answer: "High-quality artificial materials"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      question: "Contact support?",
      answer: "Email, phone, or live chat"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-32 pb-40 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-purple-100/40 to-pink-100/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-blue-100/30 to-cyan-100/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-gradient-to-r from-purple-500 to-pink-500"></span>
            <span className="text-sm font-semibold tracking-widest text-purple-600 uppercase">Help Center</span>
            <span className="w-8 h-px bg-gradient-to-r from-pink-500 to-purple-500"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="block text-purple-600">Questions</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Find quick answers to common questions about our products and services.
            Can't find what you're looking for? Contact our support team.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full h-14 px-6 pr-14 text-lg border-2 border-gray-300 rounded-2xl focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition-all"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2">
                <FiHelpCircle className="w-6 h-6 text-purple-600" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Popular Questions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-20"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Quick Answers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularQuestions.map((item, index) => (
              <div 
                key={index}
                className="p-6 bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                    <div className="text-purple-600">{item.icon}</div>
                  </div>
                  <h3 className="font-bold text-gray-900">{item.question}</h3>
                </div>
                <p className="text-gray-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setOpenCategory(category.id)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  openCategory === category.id
                    ? `bg-gradient-to-r ${category.color} text-white shadow-lg`
                    : 'bg-white text-gray-700 border border-gray-300 hover:border-gray-400'
                }`}
              >
                {category.icon}
                {category.title}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={openCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              {faqCategories
                .find(cat => cat.id === openCategory)
                ?.items.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiHelpCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{item.q}</h3>
                      </div>
                      {openItems.includes(item.id) ? (
                        <FiChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {openItems.includes(item.id) && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="px-8 pb-6 pt-2 border-t border-gray-200">
                            <div className="pl-14">
                              <p className="text-gray-700 leading-relaxed">{item.a}</p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Still Have Questions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 shadow-2xl"
        >
          <div className="text-center">
            <Crown className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-bold text-white mb-4">
              Need More Help?
            </h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Our support team is here to assist you with any questions about our products.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto mb-10">
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Call Us</h3>
                <p className="text-white/90">+91 98765 43210</p>
                <p className="text-white/80 text-sm">Mon-Sat, 10AM-7PM</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Email Us</h3>
                <p className="text-white/90">support@kanjique.com</p>
                <p className="text-white/80 text-sm">Response within 24h</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-white mb-2">Live Chat</h3>
                <p className="text-white/90">Available on website</p>
                <p className="text-white/80 text-sm">Instant responses</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <button className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                  Contact Support
                </button>
              </Link>
              <Link to="/products">
                <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                  Browse Products
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        
      </div>
    </div>
  );
};

export default FAQPage;
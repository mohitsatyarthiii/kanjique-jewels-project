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
  FiPackage,
  FiStar,
  FiGift,
  FiClock,
  FiRefreshCw,
  FiUser,
  FiMail,
  FiPhone,
  FiCheckCircle
} from "react-icons/fi";
import { 
  Sparkles, 
  Gem, 
  Crown, 
  Shield, 
  Truck, 
  CreditCard,
  Gift,
  Award,
  Headphones,
  Phone,
  Mail,
  MessageSquare
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
          a: "Once your order is shipped, you'll receive a tracking number via email and SMS. You can also track your order by logging into your account and visiting 'My Orders' section. We provide real-time updates on your shipment status."
        },
        {
          id: "order-2",
          q: "What is your shipping policy?",
          a: "We offer free express shipping on all orders above ₹10,000. Standard shipping takes 3-5 business days, while express shipping delivers within 1-2 business days. International shipping is available to select countries with delivery times of 7-14 business days."
        },
        {
          id: "order-3",
          q: "Can I modify or cancel my order?",
          a: "You can modify or cancel your order within 1 hour of placing it by contacting our customer support. Once the order is processed for shipping, modifications cannot be made. For cancellations after processing, a restocking fee may apply."
        },
        {
          id: "order-4",
          q: "Do you offer international shipping?",
          a: "Yes, we ship to over 50 countries worldwide. International shipping charges vary based on destination and order value. Customs duties and taxes are the responsibility of the recipient as per local regulations."
        }
      ]
    },
    {
      id: "payments",
      title: "Payments & Pricing",
      icon: <FiCreditCard className="w-5 h-5" />,
      color: "from-green-500 to-emerald-500",
      items: [
        {
          id: "payment-1",
          q: "What payment methods do you accept?",
          a: "We accept all major credit/debit cards (Visa, MasterCard, American Express), UPI, Net Banking, PayPal, and EMI options through partner banks. All transactions are secured with 256-bit SSL encryption."
        },
        {
          id: "payment-2",
          q: "Is there any additional cost or hidden charges?",
          a: "The price displayed includes GST. There are no hidden charges. Shipping is free on orders above ₹10,000. For international orders, additional customs duties may apply based on your country's regulations."
        },
        {
          id: "payment-3",
          q: "Do you offer EMI options?",
          a: "Yes, we offer EMI options through partner banks with tenure ranging from 3 to 24 months. EMI is available on orders above ₹5,000. The exact EMI options will be shown at checkout based on your card."
        },
        {
          id: "payment-4",
          q: "How secure are my payment details?",
          a: "We use industry-standard 256-bit SSL encryption and are PCI-DSS compliant. We do not store your payment information on our servers. All transactions are processed through secure payment gateways."
        }
      ]
    },
    {
      id: "returns",
      title: "Returns & Exchanges",
      icon: <FiRefreshCw className="w-5 h-5" />,
      color: "from-purple-500 to-violet-500",
      items: [
        {
          id: "return-1",
          q: "What is your return policy?",
          a: "We offer a 30-day return policy from the date of delivery. Items must be in original condition with all tags and packaging intact. Custom-made or personalized items cannot be returned. Returns are subject to quality inspection."
        },
        {
          id: "return-2",
          q: "How do I initiate a return?",
          a: "Log into your account, go to 'My Orders', select the item you wish to return, and follow the return process. You can also contact our customer support team for assistance. We provide a prepaid return label for your convenience."
        },
        {
          id: "return-3",
          q: "How long does it take to process a refund?",
          a: "Once we receive the returned item and complete quality inspection, refunds are processed within 5-7 business days. The refund will be credited to your original payment method. You'll receive a confirmation email once processed."
        },
        {
          id: "return-4",
          q: "Can I exchange an item for a different size or style?",
          a: "Yes, we offer free exchanges within 30 days of purchase. If the desired item is available, we'll ship it immediately. If not available, you'll receive store credit or a refund. Exchanges are subject to stock availability."
        }
      ]
    },
    {
      id: "products",
      title: "Products & Quality",
      icon: <Gem className="w-5 h-5" />,
      color: "from-amber-500 to-yellow-500",
      items: [
        {
          id: "product-1",
          q: "Are your diamonds and gems certified?",
          a: "Yes, all our diamonds above 0.30 carats come with IGI or GIA certification. All gemstones are certified for authenticity and quality. Certificates are provided with your purchase and can be verified online."
        },
        {
          id: "product-2",
          q: "What is your jewelry made of?",
          a: "We use 18K and 22K gold, 925 sterling silver, and platinum. All precious metals are hallmarked by BIS (Bureau of Indian Standards). Our diamonds and gemstones are ethically sourced and conflict-free."
        },
        {
          id: "product-3",
          q: "Do you offer customization services?",
          a: "Yes, we specialize in custom jewelry design. You can book a consultation with our design team to create a unique piece. Custom orders take 4-6 weeks for completion and require a 50% deposit."
        },
        {
          id: "product-4",
          q: "How do I care for my jewelry?",
          a: "Store each piece separately in soft pouches provided. Avoid contact with chemicals, perfumes, and water. Clean with a soft cloth regularly. We offer free professional cleaning for the first year of purchase."
        }
      ]
    },
    {
      id: "warranty",
      title: "Warranty & Services",
      icon: <FiShield className="w-5 h-5" />,
      color: "from-red-500 to-pink-500",
      items: [
        {
          id: "warranty-1",
          q: "What does your lifetime warranty cover?",
          a: "Our lifetime warranty covers manufacturing defects, stone settings, and structural integrity. It does not cover normal wear and tear, loss, theft, or damage due to improper care. Warranty requires annual maintenance check."
        },
        {
          id: "warranty-2",
          q: "Do you offer jewelry cleaning and maintenance?",
          a: "Yes, we offer free professional cleaning and inspection for the first year. After that, annual maintenance services are available at minimal cost. You can visit our store or mail your jewelry for servicing."
        },
        {
          id: "warranty-3",
          q: "What if my jewelry needs repair?",
          a: "We provide repair services for all Kanjique jewelry. Repair charges vary based on the work required. Lifetime warranty holders get priority service and discounted repair rates. Contact our service team for assessment."
        },
        {
          id: "warranty-4",
          q: "How do I avail warranty services?",
          a: "Bring your jewelry to any Kanjique store with your purchase receipt and warranty card. For online requests, contact customer support. Annual maintenance is required to keep the warranty valid."
        }
      ]
    },
    {
      id: "account",
      title: "Account & Support",
      icon: <FiUser className="w-5 h-5" />,
      color: "from-indigo-500 to-blue-500",
      items: [
        {
          id: "account-1",
          q: "How do I create an account?",
          a: "Click 'Sign Up' on our website and provide your email and password. You can also create an account during checkout. Account holders get order tracking, wishlist, special offers, and faster checkout."
        },
        {
          id: "account-2",
          q: "How can I reset my password?",
          a: "Click 'Forgot Password' on the login page, enter your registered email, and follow the instructions. Password reset links are valid for 24 hours. Contact support if you don't receive the email."
        },
        {
          id: "account-3",
          q: "How do I update my account information?",
          a: "Log into your account, go to 'My Profile', and edit your details. You can update your address, phone number, and preferences. Changes are saved immediately and reflected in future orders."
        },
        {
          id: "account-4",
          q: "What is your customer support availability?",
          a: "Our customer support team is available Monday to Saturday, 10 AM to 7 PM IST. You can reach us via phone, email, or live chat. Emergency support is available for order-related issues 24/7."
        }
      ]
    }
  ];

  const popularQuestions = [
    {
      icon: <Truck className="w-5 h-5" />,
      question: "How long does shipping take?",
      answer: "Standard: 3-5 days, Express: 1-2 days"
    },
    {
      icon: <CreditCard className="w-5 h-5" />,
      question: "Do you accept EMI?",
      answer: "Yes, EMI available on orders above ₹5,000"
    },
    {
      icon: <Gift className="w-5 h-5" />,
      question: "Can I gift wrap my order?",
      answer: "Free premium gift wrapping on all orders"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      question: "Is there a warranty?",
      answer: "Lifetime warranty on all jewelry pieces"
    },
    {
      icon: <Award className="w-5 h-5" />,
      question: "Are diamonds certified?",
      answer: "Yes, IGI/GIA certified diamonds"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      question: "How to contact support?",
      answer: "Phone, email, or live chat available"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-[#fef8e9]/10 pt-32 pb-40 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/40 to-[#d4b97d]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/30 to-[#b2965a]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Help Center</span>
            <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
            Frequently Asked
            <span className="block text-[#b2965a]">Questions</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
            Find quick answers to common questions about orders, shipping, returns, and more. 
            Can't find what you're looking for? Our support team is here to help.
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search for answers..."
                className="w-full h-14 px-6 pr-14 text-lg border-2 border-gray-300 rounded-2xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none transition-all"
              />
              <button className="absolute right-4 top-1/2 -translate-y-1/2">
                <FiHelpCircle className="w-6 h-6 text-[#b2965a]" />
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
                className="p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-lg flex items-center justify-center">
                    <div className="text-[#b2965a]">{item.icon}</div>
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
                    className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] overflow-hidden"
                  >
                    <button
                      onClick={() => toggleItem(item.id)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-white/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-xl flex items-center justify-center flex-shrink-0">
                          <FiHelpCircle className="w-5 h-5 text-[#b2965a]" />
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
                          <div className="px-8 pb-6 pt-2 border-t border-[#f4e6c3]">
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
          className="bg-gradient-to-r from-[#b2965a] to-[#d4b97d] rounded-3xl p-12 shadow-2xl"
        >
          <div className="text-center">
            <Crown className="w-16 h-16 text-white mx-auto mb-6" />
            <h2 className="text-4xl font-serif font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
              Our dedicated support team is here to help you with any questions or concerns.
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
                <p className="text-white/90">support@kanjiquejewels.com</p>
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
              <button className="px-8 py-4 bg-white text-[#b2965a] font-bold rounded-xl hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              </Link>
              <Link to="/products">
              <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
                Visit Store
              </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Helpful Links */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8 text-center">Helpful Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              {
                title: "Order Tracking Guide",
                desc: "Learn how to track your order status",
                icon: <FiTruck className="w-6 h-6" />
              },
              {
                title: "Size Guide",
                desc: "Find your perfect ring size",
                icon: <FiStar className="w-6 h-6" />
              },
              {
                title: "Care Instructions",
                desc: "How to maintain your jewelry",
                icon: <FiShield className="w-6 h-6" />
              },
              {
                title: "Gift Services",
                desc: "Learn about gifting options",
                icon: <FiGift className="w-6 h-6" />
              }
            ].map((resource, index) => (
              <div 
                key={index}
                className="p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-xl flex items-center justify-center mb-4">
                  <div className="text-[#b2965a]">{resource.icon}</div>
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{resource.title}</h3>
                <p className="text-gray-600 text-sm">{resource.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQPage;
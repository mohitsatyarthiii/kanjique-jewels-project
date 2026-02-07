import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser"; // EmailJS package
import { 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiClock,
  FiMessageSquare,
  FiUser,
  FiSend,
  FiCheckCircle,
  FiAlertCircle
} from "react-icons/fi";
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock,
  MessageSquare,
  User,
  Send,
  Award,
  Shield,
  Headphones
} from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const form = useRef();

  // EmailJS Configuration - Yeh keys tumhe .env file ya config se lena hai
  const EMAILJS_SERVICE_ID =  "YOUR_SERVICE_ID";
  const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError(""); // Clear error when user starts typing
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!formData.email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }
    if (!formData.subject.trim()) {
      setError("Please select a subject");
      return false;
    }
    if (!formData.message.trim()) {
      setError("Message is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // EmailJS integration
      const result = await emailjs.sendForm(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        form.current,
        EMAILJS_PUBLIC_KEY
      );

      console.log("Email sent successfully:", result.text);
      
      // Success handling
      setIsSubmitting(false);
      setIsSubmitted(true);
      
      // Reset form
      setFormData({ 
        name: "", 
        email: "", 
        phone: "", 
        subject: "", 
        message: "" 
      });

      // Reset success message after 5 seconds
      setTimeout(() => setIsSubmitted(false), 5000);

    } catch (error) {
      console.error("Email sending failed:", error);
      setError(
        error.text || 
        "Failed to send message. Please try again later or contact us directly via phone."
      );
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: <FiPhone className="w-6 h-6" />,
      title: "Phone & WhatsApp",
      details: ["+91 98765 43210", "+91 98765 43211"],
      description: "Available 10 AM - 7 PM"
    },
    {
      icon: <FiMail className="w-6 h-6" />,
      title: "Email Address",
      details: ["support@kanjiquejewels.com", "orders@kanjiquejewels.com"],
      description: "Response within 24 hours"
    },
  ];

  const reasons = [
    {
      icon: <Award className="w-5 h-5" />,
      text: "Expert Consultation"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      text: "Lifetime Warranty Support"
    },
    {
      icon: <Headphones className="w-5 h-5" />,
      text: "24/7 Customer Care"
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      text: "Custom Design Inquiries"
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
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Get in Touch</span>
            <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
            Let's Connect
            <span className="block text-[#b2965a]">& Create Magic</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Whether you're looking for a custom piece, need assistance, or just want to say hello, 
            we're here to help. Our team of experts is ready to assist you.
          </p>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info Cards - Left Column */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] p-8 shadow-lg"
            >
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Contact Information</h3>
              
              <div className="space-y-8">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-xl flex items-center justify-center">
                        <div className="text-[#b2965a]">{item.icon}</div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-2">{item.title}</h4>
                      {item.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-700 mb-1">{detail}</p>
                      ))}
                      <p className="text-sm text-gray-500 mt-2">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Why Contact Us */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-[#fef8e9] to-white rounded-2xl border border-[#f4e6c3] p-8 shadow-lg"
            >
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Why Reach Out?</h3>
              <div className="space-y-4">
                {reasons.map((reason, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#b2965a]/10 rounded-full flex items-center justify-center">
                      <div className="text-[#b2965a]">{reason.icon}</div>
                    </div>
                    <span className="text-gray-700">{reason.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Store Image */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative rounded-2xl overflow-hidden shadow-xl"
            >
              <img 
                src="https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800&q=80" 
                alt="Kanjique Store" 
                className="w-full h-64 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6">
                  <h4 className="text-white font-bold text-lg mb-1">Visit Our Flagship Store</h4>
                  <p className="text-white/90 text-sm">Experience luxury in person</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Contact Form - Right Column */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] p-8 md:p-12 shadow-xl">
              <div className="mb-8">
                <h2 className="text-3xl font-serif font-bold text-gray-900 mb-3">Send Us a Message</h2>
                <p className="text-gray-600">
                  Fill out the form below and our team will get back to you within 24 hours.
                </p>
              </div>

              {/* Success Message */}
              {isSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3"
                >
                  <FiCheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">Message sent successfully!</p>
                    <p className="text-sm text-green-600">We'll get back to you within 24 hours.</p>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3"
                >
                  <FiAlertCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">{error}</p>
                  </div>
                </motion.div>
              )}

              <form ref={form} onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Name Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[#b2965a]" />
                        Full Name *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none transition-all"
                        placeholder="Enter your full name"
                      />
                      <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#b2965a]" />
                        Email Address *
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none transition-all"
                        placeholder="your@email.com"
                      />
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-[#b2965a]" />
                        Phone Number
                      </div>
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none transition-all"
                        placeholder="+91 98765 43210"
                      />
                      <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Subject Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#b2965a]" />
                        Subject *
                      </div>
                    </label>
                    <div className="relative">
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 pl-10 bg-white border border-gray-300 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none transition-all appearance-none"
                      >
                        <option value="">Select a subject</option>
                        <option value="custom-design">Custom Design Inquiry</option>
                        <option value="existing-order">Existing Order Query</option>
                        <option value="repair-service">Repair & Maintenance</option>
                        <option value="product-info">Product Information</option>
                        <option value="partnership">Business Partnership</option>
                        <option value="other">Other</option>
                      </select>
                      <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message Field */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#b2965a]" />
                      Your Message *
                    </div>
                  </label>
                  <div className="relative">
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:border-[#b2965a] focus:ring-2 focus:ring-[#f4e6c3] outline-none transition-all resize-none"
                      placeholder="Please share your thoughts, questions, or requirements..."
                    />
                    
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-3 ${
                    isSubmitting 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#b2965a] to-[#d4b97d] hover:from-[#8c703f] hover:to-[#b2965a] hover:shadow-xl'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-white">Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5 text-white" />
                      <span className="text-white">Send Message</span>
                    </>
                  )}
                </button>

                <p className="text-center text-gray-500 text-sm mt-4">
                  By submitting this form, you agree to our Privacy Policy and Terms of Service.
                </p>
              </form>
            </div>

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-12 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] p-8 shadow-lg"
            >
              <h3 className="text-2xl font-serif font-bold text-gray-900 mb-6">Frequently Asked Questions</h3>
              <div className="space-y-4">
                {[
                  {
                    q: "How long does it take to get a response?",
                    a: "We respond to all inquiries within 24 hours. For urgent matters, please call our helpline."
                  },
                  {
                    q: "Do you offer virtual consultations?",
                    a: "Yes! We provide virtual consultations via Zoom or Google Meet for your convenience."
                  },
                  {
                    q: "Can I customize an existing design?",
                    a: "Absolutely! We specialize in custom modifications to make each piece uniquely yours."
                  }
                ].map((faq, index) => (
                  <div key={index} className="border-b border-[#f4e6c3] pb-4 last:border-b-0 last:pb-0">
                    <h4 className="font-semibold text-gray-900 mb-2">{faq.q}</h4>
                    <p className="text-gray-600">{faq.a}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Map Section */}
       
      </div>
    </div>
  );
};

export default ContactUs;
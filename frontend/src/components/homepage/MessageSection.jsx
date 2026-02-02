import React from "react";
import { motion } from "framer-motion";
import { 
  
  FiHeart,
  FiAward,
  FiStar
} from "react-icons/fi";
import { 
  Sparkles,
  Gem,
  Crown,
  Quote
} from "lucide-react";

const MessageSection = () => {
  return (
    <div className="py-24 bg-gradient-to-b from-white to-[#fef8e9]/10 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-[#f4e6c3]/40 to-[#d4b97d]/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-40 right-10 w-96 h-96 bg-gradient-to-tr from-[#f4e6c3]/30 to-[#b2965a]/10 rounded-full blur-3xl"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        {/* Centered Description */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Our Philosophy</span>
            <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6">
            Where Tradition Meets <span className="text-[#b2965a]">Contemporary Elegance</span>
          </h2>
          
          <p className="text-xl text-gray-600 leading-relaxed">
            At Kanjique Jewels, we believe jewelry is more than just adornment—it's a storyteller, 
            a memory keeper, and an expression of individuality. Each piece is crafted to become 
            a cherished part of your journey.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" 
                alt="Kanjique Jewelry Craftsmanship" 
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              
              {/* Floating Badges */}
              <div className="absolute top-6 left-6">
                <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-2 shadow-lg">
                  <FiAward className="w-4 h-4 text-[#b2965a]" />
                  <span className="text-sm font-semibold text-gray-900">Since 2008</span>
                </div>
              </div>
              
              <div className="absolute bottom-6 right-6">
                <div className="px-4 py-2 bg-gradient-to-r from-[#b2965a] to-[#d4b97d] rounded-full flex items-center gap-2 shadow-lg">
                  <FiStar className="w-4 h-4 text-white" />
                  <span className="text-sm font-semibold text-white">Handcrafted</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg flex items-center justify-center">
              <Gem className="w-10 h-10 text-[#b2965a]" />
            </div>
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-[#b2965a]" />
            </div>
          </motion.div>

          {/* Right Side - Message */}
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-white to-[#fef8e9] rounded-3xl border border-[#f4e6c3] p-8 md:p-12 shadow-xl">
              {/* Quote Icon */}
              <div className="absolute -top-6 right-12 w-16 h-16 bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-2xl flex items-center justify-center shadow-lg">
                <Quote className="w-8 h-8 text-white" />
              </div>

              {/* Header */}
              <div className="mb-8">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Crown className="w-6 h-6 text-[#b2965a]" />
                  <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Message From</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-gray-900">
                  Kanjique Jewels
                </h3>
                <p className="text-gray-500 mt-2">Founder's Vision & Promise</p>
              </div>

              {/* Message Content */}
              <div className="space-y-6">
                <div className="relative pl-8 border-l-4 border-[#f4e6c3]">
                  <p className="text-lg text-gray-700 leading-relaxed italic">
                    "In every piece of jewelry we create, we embed not just precious metals and stones, 
                    but emotions, stories, and timeless elegance. Our craft is our language of love."
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed">
                  For over a decade, Kanjique Jewels has been synonymous with exquisite craftsmanship 
                  and unparalleled quality. Our journey began with a simple vision: to create jewelry 
                  that speaks to the soul while adorning the body.
                </p>

                <p className="text-gray-600 leading-relaxed">
                  Every design is born from a careful balance of traditional techniques and contemporary 
                  aesthetics. We work closely with master artisans who bring decades of expertise to 
                  each creation, ensuring that every piece is not just beautiful, but meaningful.
                </p>

                {/* Values */}
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {[
                    { icon: <Sparkles />, text: "Innovative Designs" },
                    { icon: <FiHeart />, text: "Ethical Crafting" },
                    { icon: <FiAward />, text: "Superior Quality" },
                    { icon: <FiStar />, text: "Personal Touch" },
                  ].map((value, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#fef8e9] to-white rounded-xl border border-[#f4e6c3]">
                      <div className="w-8 h-8 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-lg flex items-center justify-center">
                        <div className="text-[#b2965a]">{value.icon}</div>
                      </div>
                      <span className="font-medium text-gray-900">{value.text}</span>
                    </div>
                  ))}
                </div>

                {/* Signature */}
                <div className="pt-6 border-t border-[#f4e6c3] mt-8">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#b2965a] to-[#d4b97d] rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">K</span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Rohan Sharma</p>
                      <p className="text-sm text-gray-600">Founder & Creative Director</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#b2965a]" />
            </div>
          </motion.div>
        </div>

        
      </div>
    </div>
  );
};

export default MessageSection;
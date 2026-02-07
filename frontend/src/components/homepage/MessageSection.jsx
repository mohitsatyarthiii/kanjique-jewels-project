import React from "react";
import { motion } from "framer-motion";
import { 
  Sparkles,
  Gem,
  Crown,
  Quote,
  Heart,
  Award,
  Star,
  CheckCircle,
  Target,
  Zap
} from "lucide-react";

const MessageSection = () => {
  return (
    <div className="py-16 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background Elements - Subtle */}
      <div className="absolute top-40 left-5 w-64 h-64 bg-gradient-to-br from-purple-100/20 to-pink-100/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-60 right-5 w-80 h-80 bg-gradient-to-tr from-blue-100/10 to-cyan-100/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-100/10 to-pink-100/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Centered Description - Compact */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12 max-w-2xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 mb-3">
            <span className="w-6 h-px bg-gradient-to-r from-purple-600 to-pink-500"></span>
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">Our Philosophy</span>
            <span className="w-6 h-px bg-gradient-to-r from-pink-500 to-purple-600"></span>
          </div>
          
          <h2 className="text-2xl font-medium text-gray-900 mb-4 tracking-tight">
            Where Tradition Meets <span className="text-purple-600 font-normal">Contemporary Elegance</span>
          </h2>
          
          <p className="text-gray-600 text-sm leading-relaxed">
            At Kanjique Jewels, we believe jewelry is more than just adornment—it's a storyteller, 
            a memory keeper, and an expression of individuality. Each piece is crafted to become 
            a cherished part of your journey.
          </p>
        </motion.div>

        {/* Main Content - Tighter Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Side - Image */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="relative"
          >
            <div className="relative rounded-xl overflow-hidden shadow-lg">
              <img 
                src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" 
                alt="Kanjique Jewelry Craftsmanship" 
                className="w-full h-[380px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              {/* Floating Badges - Smaller */}
              <div className="absolute top-4 left-4">
                <div className="px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-2 shadow-md">
                  <Award className="w-3 h-3 text-purple-600" />
                  <span className="text-xs font-medium text-gray-900">Since 2024</span>
                </div>
              </div>
              
              <div className="absolute bottom-4 right-4">
                <div className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center gap-2 shadow-md">
                  <Star className="w-3 h-3 text-white fill-current" />
                  <span className="text-xs font-medium text-white">Handcrafted</span>
                </div>
              </div>
            </div>

            {/* Decorative Elements - Smaller */}
            <div className="absolute -bottom-3 -left-3 w-16 h-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-gray-100 shadow-md flex items-center justify-center">
              <Gem className="w-7 h-7 text-purple-600" />
            </div>
            <div className="absolute -top-3 -right-3 w-14 h-14 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-gray-100 shadow-md flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-purple-600" />
            </div>
          </motion.div>

          {/* Right Side - Message */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-6 md:p-8 shadow-lg">
              {/* Quote Icon */}
              <div className="absolute -top-4 right-8 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center shadow-md">
                <Quote className="w-5 h-5 text-white" />
              </div>

              {/* Header - Compact */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="w-4 h-4 text-purple-600" />
                  <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">Message From</span>
                </div>
                <h3 className="text-xl font-normal text-gray-900">
                  Kanjique Jewels
                </h3>
                <p className="text-gray-400 text-xs mt-1">Founder's Vision & Promise</p>
              </div>

              {/* Message Content - Smaller Text */}
              <div className="space-y-4">
                <div className="relative pl-5 border-l-3 border-purple-200">
                  <p className="text-gray-700 text-sm leading-relaxed italic">
                    "In every piece of jewelry we create, we embed not just precious metals and stones, 
                    but emotions, stories, and timeless elegance. Our craft is our language of love."
                  </p>
                </div>

                <p className="text-gray-600 text-xs leading-relaxed">
                  Kanjique Jewels is synonymous with exquisite craftsmanship and unparalleled quality. 
                  Our journey began with a simple vision: to create jewelry that speaks to the soul 
                  while adorning the body.
                </p>

                <p className="text-gray-600 text-xs leading-relaxed">
                  Every design balances traditional techniques with contemporary aesthetics. We work 
                  with master artisans who bring expertise to each creation, ensuring that every piece 
                  is not just beautiful, but meaningful.
                </p>

                {/* Values - Compact Grid */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  {[
                    { icon: <Zap className="w-3 h-3" />, text: "Innovative Designs" },
                    { icon: <Heart className="w-3 h-3" />, text: "Ethical Crafting" },
                    { icon: <Award className="w-3 h-3" />, text: "Superior Quality" },
                    { icon: <Target className="w-3 h-3" />, text: "Precision Work" },
                  ].map((value, index) => (
                    <div key={index} className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-gray-100 shadow-sm">
                      <div className="w-7 h-7 bg-gradient-to-br from-purple-50 to-pink-50 rounded-md flex items-center justify-center">
                        <div className="text-purple-600">{value.icon}</div>
                      </div>
                      <span className="text-xs font-medium text-gray-900">{value.text}</span>
                    </div>
                  ))}
                </div>

                {/* Signature - Compact */}
                <div className="pt-5 border-t border-gray-100 mt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center shadow-sm">
                      <span className="text-white font-medium text-sm">K</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">Kashish Anand</p>
                      <p className="text-gray-500 text-xs">Founder</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative Element - Smaller */}
            <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-gray-100 shadow-sm flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-purple-600" />
            </div>
          </motion.div>
        </div>

        {/* Core Values Section - New Addition */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-4 h-px bg-gray-300"></span>
              <h3 className="text-sm font-medium text-gray-700">Our Commitment</h3>
              <span className="w-4 h-px bg-gray-300"></span>
            </div>
            <p className="text-gray-500 text-xs max-w-md mx-auto">
              What sets us apart in every creation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: "Authentic Craftsmanship",
                description: "Every piece handcrafted with attention to detail",
                icon: <Sparkles className="w-4 h-4" />
              },
              {
                title: "Personal Connection",
                description: "Jewelry that tells your unique story",
                icon: <Heart className="w-4 h-4" />
              },
              {
                title: "Timeless Design",
                description: "Classic elegance meets modern aesthetics",
                icon: <CheckCircle className="w-4 h-4" />
              },
            ].map((item, index) => (
              <div key={index} className="text-center p-5 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-3 mx-auto">
                  <div className="text-purple-600">{item.icon}</div>
                </div>
                <h4 className="text-sm font-medium text-gray-900 mb-1">{item.title}</h4>
                <p className="text-gray-500 text-xs">{item.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default MessageSection;
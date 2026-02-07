import React from "react";
import { motion } from "framer-motion";
import { 
  Heart, 
  Sparkles, 
  Diamond, 
  Gem, 
  Crown,
  Star,
  Award,
  Palette,
  Zap,
  Eye,
  CheckCircle,
  Users,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const stats = [
    { icon: <Heart className="w-6 h-6" />, value: "50K+", label: "Happy Customers" },
    { icon: <Sparkles className="w-6 h-6" />, value: "10K+", label: "Unique Designs" },
    { icon: <Award className="w-6 h-6" />, value: "15+", label: "Style Collections" },
    { icon: <TrendingUp className="w-6 h-6" />, value: "98%", label: "Satisfaction" },
  ];

  const values = [
    {
      icon: <Palette className="w-7 h-7" />,
      title: "Creative Expression",
      description: "Jewelry as a form of personal art"
    },
    {
      icon: <Eye className="w-7 h-7" />,
      title: "Precision Craft",
      description: "Meticulous attention to detail"
    },
    {
      icon: <Heart className="w-7 h-7" />,
      title: "Customer First",
      description: "Your vision guides our process"
    },
    {
      icon: <Sparkles className="w-7 h-7" />,
      title: "Innovative Design",
      description: "Pushing creative boundaries"
    },
    {
      icon: <Diamond className="w-7 h-7" />,
      title: "Quality Materials",
      description: "Premium materials, lasting beauty"
    },
    {
      icon: <Zap className="w-7 h-7" />,
      title: "Modern Aesthetics",
      description: "Contemporary elegance"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 pt-24 pb-32 relative overflow-hidden">
      {/* Background Elements - Subtle */}
      <div className="absolute top-40 left-5 w-64 h-64 bg-gradient-to-br from-purple-100/20 to-pink-100/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-60 right-5 w-80 h-80 bg-gradient-to-tr from-blue-100/10 to-cyan-100/5 rounded-full blur-3xl"></div>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 bg-gradient-to-r from-purple-100/10 to-pink-100/5 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-5 sm:px-6 relative z-10">
        {/* Hero Section - Sleek & Modern */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="w-6 h-px bg-gradient-to-r from-purple-600 to-pink-500"></span>
            <span className="text-xs font-medium tracking-wider text-gray-500 uppercase">Our Story</span>
            <span className="w-6 h-px bg-gradient-to-r from-pink-500 to-purple-600"></span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-medium text-gray-900 mb-4 tracking-tight">
            Celebrating
            <span className="block text-purple-600 font-normal mt-1">Individuality</span>
          </h1>
          
          <p className="text-gray-600 max-w-2xl mx-auto text-base leading-relaxed">
            Kanjique Jewels was born out of a passion for crafting exquisite jewelry that celebrates 
            individuality and self-expression.
          </p>
        </motion.div>

        {/* Founder Story - Clean Layout */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-20"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="order-2 lg:order-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-px bg-purple-600"></div>
                <h2 className="text-lg font-medium text-gray-700">Our Vision</h2>
              </div>
              <h3 className="text-2xl font-normal text-gray-900 mb-6 leading-tight">
                Established by
                <span className="block text-purple-600">Kashish Anand</span>
              </h3>
              
              <div className="space-y-4 text-gray-600 text-sm leading-relaxed">
                <p>
                  Our brand journey began with a simple yet profound vision - to empower individuals 
                  to embrace their uniqueness and radiate their inner beauty through stunning, 
                  custom-made jewelry pieces.
                </p>
                <p>
                  Founded by visionary Kashish Anand, Kanjique represents more than just accessories. 
                  Each piece is a statement of personal style, a celebration of individuality, and 
                  an expression of one's authentic self.
                </p>
                <p>
                  We believe that jewelry should tell your story, reflect your personality, and 
                  enhance your confidence. Every design is created with the intention of making 
                  you feel special, empowered, and truly yourself.
                </p>
              </div>
            </div>
            
            <div className="order-1 lg:order-2 relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <img 
                  src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&q=80" 
                  alt="Jewelry Design" 
                  className="w-full h-[380px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
              <div className="absolute -bottom-3 -right-3 w-24 h-24 bg-white rounded-xl shadow-lg flex items-center justify-center border border-gray-100">
                <Crown className="w-10 h-10 text-purple-600" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats - Minimal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-20">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="text-center p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-3">
                <div className="text-purple-600">{stat.icon}</div>
              </div>
              <div className="text-2xl font-light text-gray-900 mb-1">{stat.value}</div>
              <div className="text-xs text-gray-500 font-medium tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Values - Grid Layout */}
        <div className="mb-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <span className="w-4 h-px bg-gray-300"></span>
              <h2 className="text-base font-medium text-gray-700">Our Values</h2>
              <span className="w-4 h-px bg-gray-300"></span>
            </div>
            <p className="text-gray-500 text-sm max-w-xl mx-auto">
              Principles that define every creation
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 group"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg mb-4 group-hover:scale-105 transition-transform duration-300">
                  <div className="text-purple-600">{value.icon}</div>
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-500 text-xs leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Design Philosophy - Elegant */}
        <div className="mb-20">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-100 p-8 md:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <div className="flex items-center gap-3 mb-5">
                  <Gem className="w-5 h-5 text-purple-600" />
                  <h2 className="text-lg font-medium text-gray-900">Design Philosophy</h2>
                </div>
                
                <div className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    At Kanjique, we believe that jewelry should be as unique as the person wearing it. 
                    Our designs are personal statements that reflect individuality and celebrate 
                    self-expression.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    We combine contemporary aesthetics with timeless elegance, creating pieces that 
                    are both modern and enduring. Each collection is thoughtfully curated to offer 
                    versatility, quality, and style.
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our commitment is to provide jewelry that makes you feel confident, beautiful, 
                    and authentically you. Every Kanjique piece is designed to enhance your 
                    personal style.
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">Premium Quality</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">Modern Designs</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                      <span className="text-xs text-gray-600">Personal Touch</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img 
                    src="https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=800&q=80" 
                    alt="Jewelry Design Process" 
                    className="w-full h-[300px] object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white px-4 py-2 rounded-lg shadow-md border border-gray-100">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-purple-600 fill-current" />
                    <span className="text-xs font-medium text-gray-700">Handcrafted Excellence</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA - Sophisticated */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-2xl p-8 md:p-10 shadow-xl"
        >
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full mb-5">
              <Diamond className="w-6 h-6 text-white" />
            </div>
            
            <h2 className="text-2xl font-light text-white mb-3">
              Express Your Unique Style
            </h2>
            
            <p className="text-gray-300 text-sm mb-8 max-w-lg mx-auto leading-relaxed">
              Discover jewelry that celebrates your individuality and tells your unique story.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/products">
                <button className="px-6 py-3 bg-white text-gray-900 font-medium text-sm rounded-lg hover:bg-gray-100 transition-colors duration-300 shadow-sm">
                  Explore Collection
                </button>
              </Link>
              <Link to="/contact">
                <button className="px-6 py-3 border border-white/30 text-white font-medium text-sm rounded-lg hover:bg-white/10 transition-colors duration-300">
                  Get In Touch
                </button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
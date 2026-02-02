import React from "react";
import { motion } from "framer-motion";
import { 
  FiStar, 
  FiAward, 
  FiUsers, 
  FiPackage, 
  FiShield, 
} from "react-icons/fi";
import { 
  Sparkles, 
  Crown, 
  Gem, 
  Diamond, 
  Leaf, 
  Target,
  
  Heart,
  Shield
} from "lucide-react";
import { Link } from "react-router-dom";

const AboutUs = () => {
  const stats = [
    { icon: <FiStar />, value: "15+", label: "Years Experience" },
    { icon: <FiUsers />, value: "50,000+", label: "Happy Customers" },
    { icon: <FiPackage />, value: "10,000+", label: "Pieces Crafted" },
    { icon: <FiAward />, value: "25+", label: "Industry Awards" },
  ];

  const values = [
    {
      icon: <Gem className="w-8 h-8" />,
      title: "Exquisite Craftsmanship",
      description: "Each piece is handcrafted by master artisans with decades of experience."
    },
    {
      icon: <Diamond className="w-8 h-8" />,
      title: "Ethically Sourced",
      description: "We use only conflict-free diamonds and responsibly sourced materials."
    },
    {
      icon: <Leaf className="w-8 h-8" />,
      title: "Sustainable Luxury",
      description: "Committed to eco-friendly practices and sustainable production."
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Customer First",
      description: "Your satisfaction and trust are our highest priorities."
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Lifetime Warranty",
      description: "All our jewelry comes with lifetime warranty and maintenance."
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Precision & Detail",
      description: "Uncompromising attention to detail in every design."
    },
  ];

  const team = [
    {
      name: "Rohan Sharma",
      role: "Master Goldsmith",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80",
      experience: "25+ years"
    },
    {
      name: "Priya Kapoor",
      role: "Design Director",
      image: "https://images.unsplash.com/photo-1494790108755-2616b786d4d9?w-400&q=80",
      experience: "18+ years"
    },
    {
      name: "Vikram Mehta",
      role: "Diamond Expert",
      image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w-400&q=80",
      experience: "22+ years"
    },
    {
      name: "Ananya Reddy",
      role: "Quality Control Head",
      image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w-400&q=80",
      experience: "15+ years"
    },
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
          className="text-center mb-20"
        >
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="w-8 h-px bg-gradient-to-r from-[#b2965a] to-[#d4b97d]"></span>
            <span className="text-sm font-semibold tracking-widest text-[#b2965a] uppercase">Our Story</span>
            <span className="w-8 h-px bg-gradient-to-r from-[#d4b97d] to-[#b2965a]"></span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-6">
            Crafting Timeless
            <span className="block text-[#b2965a]">Elegance Since 2008</span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            At Kanjique Jewels, we don't just create jewelry—we craft heirlooms that tell your story. 
            Each piece is a testament to our passion for perfection and commitment to excellence.
          </p>
        </motion.div>

        {/* Hero Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative mb-24"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1200&q=80" 
              alt="Jewelry Workshop" 
              className="w-full h-[500px] object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8">
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 max-w-md">
                <h3 className="text-2xl font-serif font-bold text-gray-900 mb-2">Where Art Meets Precision</h3>
                <p className="text-gray-700">Our artisans combine traditional techniques with modern innovation</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-24">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-center p-6 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg"
            >
              <div className="text-3xl text-[#b2965a] mb-2">{stat.icon}</div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{stat.value}</div>
              <div className="text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Our Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Our Core Values</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The principles that guide every piece we create</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-gradient-to-br from-white to-[#fef8e9] rounded-2xl border border-[#f4e6c3] shadow-lg hover:shadow-xl transition-shadow duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-[#b2965a]">{value.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Our Process */}
        <div className="mb-24 bg-gradient-to-r from-[#fef8e9] to-[#f4e6c3] rounded-3xl p-8 md:p-12">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">The Kanjique Process</h2>
            <p className="text-gray-700">From concept to completion, here's how we create magic</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Design & Sketch", desc: "Initial concepts and detailed sketches", icon: <Sparkles /> },
              { step: "2", title: "Material Selection", desc: "Handpicking the finest metals and gems", icon: <Gem /> },
              { step: "3", title: "Artisan Crafting", desc: "Precision work by master craftsmen", icon: <FiStar /> },
              { step: "4", title: "Quality Assurance", desc: "Rigorous 7-step quality check", icon: <FiShield /> },
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <span className="text-2xl font-bold text-[#b2965a]">{process.step}</span>
                </div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">{process.title}</h4>
                <p className="text-gray-600 text-sm">{process.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Master Artisans */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-serif font-bold text-gray-900 mb-4">Meet Our Master Artisans</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">The talented hands behind every masterpiece</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="relative overflow-hidden rounded-2xl mb-4">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-4 left-4">
                    <div className="px-3 py-1 bg-[#b2965a] text-white rounded-full text-sm">
                      {member.experience}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-[#b2965a] font-medium">{member.role}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sustainability */}
        <div className="mb-24 bg-gradient-to-br from-white to-[#fef8e9] rounded-3xl p-8 md:p-12 border border-[#f4e6c3] shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-serif font-bold text-gray-900 mb-6">Our Commitment to Sustainability</h2>
              <p className="text-gray-600 mb-6 leading-relaxed">
                We believe luxury should not come at the expense of our planet. That's why we've implemented 
                eco-friendly practices throughout our production process and use only ethically sourced materials.
              </p>
              <ul className="space-y-3">
                {[
                  "100% recycled precious metals",
                  "Conflict-free diamonds certification",
                  "Solar-powered workshops",
                  "Zero waste packaging",
                  "Carbon offset programs"
                ].map((item, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-[#b2965a] rounded-full flex items-center justify-center">
                      <FiStar className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1600267165477-6d4cc741b379?w=800&q=80" 
                alt="Sustainable Jewelry" 
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gradient-to-br from-[#f4e6c3] to-[#fef8e9] rounded-2xl border border-[#f4e6c3] flex items-center justify-center shadow-lg">
                <Leaf className="w-12 h-12 text-[#b2965a]" />
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-gradient-to-r from-[#b2965a] to-[#d4b97d] rounded-3xl p-12 shadow-2xl"
        >
          <Crown className="w-16 h-16 text-white mx-auto mb-6" />
          <h2 className="text-4xl font-serif font-bold text-white mb-4">
            Experience the Kanjique Difference
          </h2>
          <p className="text-white/90 text-xl mb-8 max-w-2xl mx-auto">
            Visit our flagship store or explore our online collection to discover jewelry that tells your story.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products">
            <button className="px-8 py-4 bg-white text-[#b2965a] font-bold rounded-xl hover:bg-gray-100 transition-colors">
              Explore Collection
            </button>
            </Link>
            <Link to="/contact">
            <button className="px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-colors">
              Book Consultation
            </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs;
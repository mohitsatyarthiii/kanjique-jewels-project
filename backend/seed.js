import mongoose from 'mongoose';
import { Product } from './models/Product.js'; // Adjust path as needed
import dotenv from 'dotenv';

dotenv.config();

// Jewellery specific categories based on your navbar
const categories = [
  {
    title: "Necklaces",
    category: "Necklaces",
    icon: "📿",
    sub: [
      { title: "Gold Necklaces", subcategory: "Gold Necklaces" },
      { title: "Diamond Necklaces", subcategory: "Diamond Necklaces" },
      { title: "Chokers", subcategory: "Chokers" },
      { title: "Bridal Necklaces", subcategory: "Bridal Necklaces" },
      { title: "Daily Wear Necklaces", subcategory: "Daily Wear Necklaces" },
    ],
  },
  {
    title: "Earrings",
    category: "Earrings",
    icon: "💎",
    sub: [
      { title: "Stud Earrings", subcategory: "Stud Earrings" },
      { title: "Hoop Earrings", subcategory: "Hoop Earrings" },
      { title: "Drop Earrings", subcategory: "Drop Earrings" },
      { title: "Jhumkas", subcategory: "Jhumkas" },
      { title: "Diamond Earrings", subcategory: "Diamond Earrings" },
      { title: "Gold Earrings", subcategory: "Gold Earrings" },
    ],
  },
  {
    title: "Rings",
    category: "Rings",
    icon: "💍",
    sub: [
      { title: "Engagement Rings", subcategory: "Engagement Rings" },
      { title: "Wedding Rings", subcategory: "Wedding Rings" },
      { title: "Casual Rings", subcategory: "Casual Rings" },
      { title: "Cocktail Rings", subcategory: "Cocktail Rings" },
      { title: "Diamond Rings", subcategory: "Diamond Rings" },
      { title: "Gold Rings", subcategory: "Gold Rings" },
    ],
  },
  {
    title: "Bracelets",
    category: "Bracelets & Bangles",
    icon: "✨",
    sub: [
      { title: "Gold Bangles", subcategory: "Gold Bangles" },
      { title: "Diamond Bangles", subcategory: "Diamond Bangles" },
      { title: "Bracelets", subcategory: "Bracelets" },
      { title: "Cuffs", subcategory: "Cuffs" },
      { title: "Kids Bangles", subcategory: "Kids Bangles" },
    ],
  },
  {
    title: "Collections",
    category: "Collections",
    icon: "👑",
    sub: [
      { title: "Bridal Collection", subcategory: "Bridal Collection" },
      { title: "Festive Collection", subcategory: "Festive Collection" },
      { title: "Daily Wear Collection", subcategory: "Daily Wear Collection" },
      { title: "Kids Collection", subcategory: "Kids Collection" },
      { title: "Men's Collection", subcategory: "Men's Collection" },
    ],
  },
];

const productsData = [
  // ==================== NECKLACES CATEGORY ====================
  {
    // Gold Necklaces (6 products)
    category: "Necklaces", subCategory: "Gold Necklaces",
    products: [
      { title: "Mangalsutra Gold Necklace", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "22K Traditional Necklace", price: 149999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Gold Chain with Pendant", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Antique Gold Necklace Set", price: 229999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Minimal Gold Choker", price: 49999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Gold Rope Chain", price: 55999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" }
    ]
  },
  {
    // Diamond Necklaces (6 products)
    category: "Necklaces", subCategory: "Diamond Necklaces",
    products: [
      { title: "Princess Cut Diamond Necklace", price: 549999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Solitaire Diamond Pendant", price: 289999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Diamond Choker Set", price: 389999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Eternity Diamond Necklace", price: 459999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Rose Cut Diamond Necklace", price: 329999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Diamond Tennis Necklace", price: 699999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" }
    ]
  },
  {
    // Chokers (6 products)
    category: "Necklaces", subCategory: "Chokers",
    products: [
      { title: "Pearl & Diamond Choker", price: 149999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Gold Velvet Choker", price: 39999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Ruby Studded Choker", price: 189999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Minimal Gold Choker", price: 27999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Adjustable Silk Choker", price: 32999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Statement Crystal Choker", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" }
    ]
  },
  {
    // Bridal Necklaces (6 products)
    category: "Necklaces", subCategory: "Bridal Necklaces",
    products: [
      { title: "Bridal Temple Necklace", price: 799999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Polki Diamond Bridal Set", price: 1299999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Traditional Kundan Necklace", price: 699999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Bridal Choker Set", price: 899999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Gold Bridal Haar", price: 1099999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Meenakari Bridal Necklace", price: 599999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" }
    ]
  },
  {
    // Daily Wear Necklaces (6 products)
    category: "Necklaces", subCategory: "Daily Wear Necklaces",
    products: [
      { title: "Everyday Gold Chain", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Minimal Pendant Necklace", price: 24999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Layered Necklace Set", price: 39999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Name Plate Necklace", price: 19999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Initial Pendant Necklace", price: 17999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" },
      { title: "Adjustable Cable Chain", price: 15999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=500&q=80" }
    ]
  },

  // ==================== EARRINGS CATEGORY ====================
  {
    // Stud Earrings (6 products)
    category: "Earrings", subCategory: "Stud Earrings",
    products: [
      { title: "Diamond Stud Earrings", price: 199999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Pearl Stud Earrings", price: 49999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Gold Ball Studs", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Sapphire Stud Earrings", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Heart Shaped Studs", price: 24999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Emerald Stud Earrings", price: 109999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" }
    ]
  },
  {
    // Hoop Earrings (6 products)
    category: "Earrings", subCategory: "Hoop Earrings",
    products: [
      { title: "Huggie Hoop Earrings", price: 44999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Diamond Hoop Earrings", price: 159999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Gold Statement Hoops", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Small Gold Hoops", price: 24999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Hinged Hoop Earrings", price: 38999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Textured Hoop Set", price: 54999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" }
    ]
  },
  {
    // Drop Earrings (6 products)
    category: "Earrings", subCategory: "Drop Earrings",
    products: [
      { title: "Pearl Drop Earrings", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Diamond Dangle Earrings", price: 189999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Gold Tassel Earrings", price: 42999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Crystal Drop Earrings", price: 34999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Geometric Drop Earrings", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Chain Drop Earrings", price: 37999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" }
    ]
  },
  {
    // Jhumkas (6 products)
    category: "Earrings", subCategory: "Jhumkas",
    products: [
      { title: "Traditional Jhumka Set", price: 129999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Antique Finish Jhumkas", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Polki Diamond Jhumkas", price: 229999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Gold Jhumka Earrings", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Meenakari Jhumkas", price: 79999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Kundan Jhumka Set", price: 159999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" }
    ]
  },
  {
    // Diamond Earrings (6 products)
    category: "Earrings", subCategory: "Diamond Earrings",
    products: [
      { title: "Solitaire Diamond Earrings", price: 299999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Diamond Cluster Earrings", price: 179999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Eternity Diamond Earrings", price: 249999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Princess Cut Diamond Earrings", price: 319999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Diamond Huggie Earrings", price: 139999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Rose Cut Diamond Earrings", price: 199999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" }
    ]
  },
  {
    // Gold Earrings (6 products)
    category: "Earrings", subCategory: "Gold Earrings",
    products: [
      { title: "22K Gold Earrings", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Traditional Gold Earrings", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Gold Chandelier Earrings", price: 109999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Minimal Gold Earrings", price: 34999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Gold Ear Cuff Set", price: 42999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" },
      { title: "Antique Gold Earrings", price: 79999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1588514912908-8f5891714f8d?w=500&q=80" }
    ]
  },

  // ==================== RINGS CATEGORY ====================
  {
    // Engagement Rings (6 products)
    category: "Rings", subCategory: "Engagement Rings",
    products: [
      { title: "Solitaire Diamond Engagement Ring", price: 249999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Princess Cut Engagement Ring", price: 329999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Halo Diamond Engagement Ring", price: 289999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Three Stone Engagement Ring", price: 399999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Emerald Cut Engagement Ring", price: 459999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Rose Gold Engagement Ring", price: 219999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" }
    ]
  },
  {
    // Wedding Rings (6 products)
    category: "Rings", subCategory: "Wedding Rings",
    products: [
      { title: "Eternity Wedding Band", price: 129999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Plain Gold Wedding Band", price: 49999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Diamond Wedding Band", price: 179999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "His & Hers Wedding Set", price: 299999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Channel Set Wedding Ring", price: 149999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Milgrain Wedding Band", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" }
    ]
  },
  {
    // Casual Rings (6 products)
    category: "Rings", subCategory: "Casual Rings",
    products: [
      { title: "Stackable Minimal Ring Set", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Adjustable Statement Ring", price: 18999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Geometric Gold Ring", price: 14999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Mid-Finger Ring Set", price: 24999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Gold Knuckle Ring", price: 12999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Minimal Band Ring", price: 9999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" }
    ]
  },
  {
    // Cocktail Rings (6 products)
    category: "Rings", subCategory: "Cocktail Rings",
    products: [
      { title: "Statement Cocktail Ring", price: 189999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Oval Emerald Cocktail Ring", price: 159999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Ruby & Diamond Cocktail Ring", price: 229999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Art Deco Cocktail Ring", price: 179999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Pear Shaped Cocktail Ring", price: 199999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Vintage Style Cocktail Ring", price: 139999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" }
    ]
  },
  {
    // Diamond Rings (6 products)
    category: "Rings", subCategory: "Diamond Rings",
    products: [
      { title: "Round Brilliant Diamond Ring", price: 279999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Cluster Diamond Ring", price: 149999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Pave Diamond Band", price: 119999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Vintage Diamond Ring", price: 189999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Three Row Diamond Ring", price: 159999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Solitaire Diamond Band", price: 99999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" }
    ]
  },
  {
    // Gold Rings (6 products)
    category: "Rings", subCategory: "Gold Rings",
    products: [
      { title: "22K Gold Ring", price: 44999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Signet Gold Ring", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Gold Statement Ring", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Traditional Gold Ring", price: 54999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Gold Band Ring", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" },
      { title: "Antique Gold Ring", price: 79999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1603561596112-0a132b757442?w=500&q=80" }
    ]
  },

  // ==================== BRACELETS & BANGLES CATEGORY ====================
  {
    // Gold Bangles (6 products)
    category: "Bracelets & Bangles", subCategory: "Gold Bangles",
    products: [
      { title: "Gold Kada for Women", price: 129999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Traditional Gold Bangle Set", price: 199999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "22K Gold Bangles", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Antique Gold Bangles", price: 149999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Designer Gold Bangle", price: 109999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Adjustable Gold Bangles", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" }
    ]
  },
  {
    // Diamond Bangles (6 products)
    category: "Bracelets & Bangles", subCategory: "Diamond Bangles",
    products: [
      { title: "Diamond Tennis Bracelet", price: 299999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Diamond Bangle Bracelet", price: 189999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Eternity Diamond Bangle", price: 229999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Diamond Line Bracelet", price: 159999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Pave Diamond Bangle", price: 269999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Diamond Cuff Bracelet", price: 199999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" }
    ]
  },
  {
    // Bracelets (6 products)
    category: "Bracelets & Bangles", subCategory: "Bracelets",
    products: [
      { title: "Adjustable Chain Bracelet", price: 24999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Gold Link Bracelet", price: 39999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Charm Bracelet", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Beaded Bracelet Set", price: 19999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Minimal Gold Bracelet", price: 17999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Layered Bracelet Set", price: 34999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" }
    ]
  },
  {
    // Cuffs (6 products)
    category: "Bracelets & Bangles", subCategory: "Cuffs",
    products: [
      { title: "Gold Cuff Bracelet", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Statement Gold Cuff", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Diamond Cuff Bracelet", price: 159999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Adjustable Cuff Bracelet", price: 34999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Open Cuff Bracelet", price: 49999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Bangle Cuff Set", price: 79999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" }
    ]
  },
  {
    // Kids Bangles (6 products)
    category: "Bracelets & Bangles", subCategory: "Kids Bangles",
    products: [
      { title: "Kids Gold Bangles Set", price: 79999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Adjustable Kids Bangle", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Kids Charm Bangle", price: 24999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Lightweight Kids Bangles", price: 34999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Kids Safety Bangle", price: 19999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" },
      { title: "Traditional Kids Bangle", price: 44999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1611672585731-fa10603fb9e0?w=500&q=80" }
    ]
  },

  // ==================== COLLECTIONS CATEGORY ====================
  {
    // Bridal Collection (6 products)
    category: "Collections", subCategory: "Bridal Collection",
    products: [
      { title: "Bridal Necklace Set", price: 899999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Complete Bridal Jewelry Set", price: 1299999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Bridal Polki Set", price: 1599999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Royal Bridal Collection", price: 2299999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Bridal Kundan Set", price: 1099999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Contemporary Bridal Set", price: 799999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" }
    ]
  },
  {
    // Festive Collection (6 products)
    category: "Collections", subCategory: "Festive Collection",
    products: [
      { title: "Festive Gold Set", price: 459999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Diwali Special Jewelry Set", price: 599999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Festive Temple Jewelry", price: 389999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Traditional Festival Set", price: 519999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Festive Earrings & Necklace", price: 329999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Luxury Festive Collection", price: 899999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" }
    ]
  },
  {
    // Daily Wear Collection (6 products)
    category: "Collections", subCategory: "Daily Wear Collection",
    products: [
      { title: "Everyday Jewelry Set", price: 99999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Minimal Daily Wear Collection", price: 79999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Office Wear Jewelry Set", price: 129999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Casual Daily Collection", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Stackable Daily Set", price: 89999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Lightweight Daily Jewelry", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" }
    ]
  },
  {
    // Kids Collection (6 products)
    category: "Collections", subCategory: "Kids Collection",
    products: [
      { title: "Kids Jewelry Gift Set", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Baby's First Jewelry Set", price: 44999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Kids Birthday Jewelry", price: 39999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Children's Traditional Set", price: 69999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Kids Safety Jewelry", price: 29999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Kids Party Jewelry Set", price: 34999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" }
    ]
  },
  {
    // Men's Collection (6 products)
    category: "Collections", subCategory: "Men's Collection",
    products: [
      { title: "Men's Gold Chain", price: 349999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Men's Diamond Ring", price: 189999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Men's Bracelet Set", price: 149999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Men's Cufflinks Set", price: 59999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Men's Signet Ring", price: 99999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" },
      { title: "Men's Luxury Watch", price: 499999, brand: "Kanjique", image: "https://images.unsplash.com/photo-1581235720706-9856d6d1c6a9?w=500&q=80" }
    ]
  }
];

const seedProducts = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Prepare products
    const productsToInsert = [];

    for (const categoryData of productsData) {
      for (const productData of categoryData.products) {

        // Generate unique slug
        const slugBase = productData.title.toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        let slug = slugBase;
        let counter = 1;

        // Ensure slug uniqueness in this batch
        while (productsToInsert.some(p => p.slug === slug)) {
          slug = `${slugBase}-${counter}`;
          counter++;
        }

        productsToInsert.push({
          title: productData.title,
          slug: slug,
          description: `${productData.title} - Premium quality ${categoryData.subCategory.toLowerCase()} from ${productData.brand}. Exquisite craftsmanship with attention to detail. Perfect for special occasions, weddings, festivals, or daily wear.`,
          price: productData.price,
          category: categoryData.category,
          subCategory: categoryData.subCategory,
          brand: productData.brand,
          images: [{ url: productData.image, public_id: `kanjique_${slug}` }],
          inStock: true,
          createdBy: new mongoose.Types.ObjectId() // Dummy user ID
        });
      }
    }

    // Insert products
    await Product.insertMany(productsToInsert);
    console.log(`✅ Successfully seeded ${productsToInsert.length} jewelry products`);

    // Log category-wise counts
    const categoryCounts = await Product.aggregate([
      { $group: { _id: { category: "$category", subCategory: "$subCategory" }, count: { $sum: 1 } } }
    ]);

    console.log('\n📊 Category-wise product counts:');
    console.log('='.repeat(50));
    let totalProducts = 0;
    
    // Group by main category
    const grouped = {};
    categoryCounts.forEach(item => {
      totalProducts += item.count;
      if (!grouped[item._id.category]) {
        grouped[item._id.category] = [];
      }
      grouped[item._id.category].push({ subCategory: item._id.subCategory, count: item.count });
    });

    // Display organized counts
    Object.keys(grouped).forEach(category => {
      console.log(`\n${category}:`);
      grouped[category].forEach(sub => {
        console.log(`  └─ ${sub.subCategory}: ${sub.count} products`);
      });
    });

    console.log('\n' + '='.repeat(50));
    console.log(`📈 Total Products: ${totalProducts}`);
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Error seeding products:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
};

// Run seeder
seedProducts();
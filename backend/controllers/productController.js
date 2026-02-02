// backend/controllers/productController.js
import { Product } from "../models/Product.js";

export const getProducts = async (req, res) => {
  try {
    const { category, subcategory } = req.query;

    let filter = {};

    // Build filter based on provided query parameters
    if (category && subcategory) {
      // Both category and subcategory provided
      filter.category = { $regex: `^${category}$`, $options: "i" };
      filter.subCategory = { $regex: `^${subcategory}$`, $options: "i" };
    } else if (category) {
      // Only main category provided
      filter.category = { $regex: `^${category}$`, $options: "i" };
    } else if (subcategory) {
      // Only subcategory provided
      filter.subCategory = { $regex: `^${subcategory}$`, $options: "i" };
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });
    
    res.json({ 
      ok: true, 
      products,
      count: products.length,
      filters: { category, subcategory }
    });

  } catch (err) {
    console.error("Fetch products error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// backend/controllers/productController.js
// backend/controllers/productController.js


export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};


// Get similar products for product page
export const getSimilarProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 8 } = req.query;

    // First, get the current product to extract category info
    const currentProduct = await Product.findById(productId);
    
    if (!currentProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Find products from the same category and subcategory, excluding the current product
    const similarProducts = await Product.find({
      category: currentProduct.category,
      subCategory: currentProduct.subCategory,
      _id: { $ne: productId } // Exclude current product
    })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    // If not enough products from same subcategory, include same category products
    let finalProducts = similarProducts;
    if (similarProducts.length < limit) {
      const additionalProducts = await Product.find({
        category: currentProduct.category,
        _id: { $nin: [...similarProducts.map(p => p._id), productId] }
      })
      .limit(limit - similarProducts.length)
      .sort({ createdAt: -1 });

      finalProducts = [...similarProducts, ...additionalProducts];
    }

    res.json({ 
      ok: true, 
      similarProducts: finalProducts,
      currentCategory: currentProduct.category,
      currentSubCategory: currentProduct.subCategory,
      count: finalProducts.length
    });

  } catch (err) {
    console.error("Fetch similar products error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Get suggested products for category pages
export const getSuggestedProducts = async (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 8, exclude } = req.query;

    let filter = {
      category: { $regex: `^${category}$`, $options: "i" }
    };

    // Exclude specific product if provided (for product pages in category context)
    if (exclude) {
      filter._id = { $ne: exclude };
    }

    // Get popular products from the same category (you can modify the sort logic)
    const suggestedProducts = await Product.find(filter)
      .limit(parseInt(limit))
      .sort({ 
        createdAt: -1,
        // You can add more sorting criteria like rating, popularity, etc.
        // price: 1 // Sort by price ascending
      });

    res.json({ 
      ok: true, 
      suggestedProducts,
      category,
      count: suggestedProducts.length
    });

  } catch (err) {
    console.error("Fetch suggested products error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};

// Enhanced version that combines both with better recommendations
export const getRecommendedProducts = async (req, res) => {
  try {
    const { category, productId } = req.query;
    const { limit = 8 } = req.query;

    let recommendedProducts = [];

    if (productId) {
      // If productId provided, get similar products to this specific product
      const currentProduct = await Product.findById(productId);
      
      if (currentProduct) {
        // Priority 1: Same category + same subcategory + same brand
        recommendedProducts = await Product.find({
          category: currentProduct.category,
          subCategory: currentProduct.subCategory,
          brand: currentProduct.brand,
          _id: { $ne: productId }
        })
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });

        // Priority 2: Same category + same subcategory
        if (recommendedProducts.length < limit) {
          const additionalProducts = await Product.find({
            category: currentProduct.category,
            subCategory: currentProduct.subCategory,
            _id: { $nin: [...recommendedProducts.map(p => p._id), productId] }
          })
          .limit(limit - recommendedProducts.length)
          .sort({ createdAt: -1 });

          recommendedProducts = [...recommendedProducts, ...additionalProducts];
        }

        // Priority 3: Same category only
        if (recommendedProducts.length < limit) {
          const moreProducts = await Product.find({
            category: currentProduct.category,
            _id: { $nin: [...recommendedProducts.map(p => p._id), productId] }
          })
          .limit(limit - recommendedProducts.length)
          .sort({ createdAt: -1 });

          recommendedProducts = [...recommendedProducts, ...moreProducts];
        }
      }
    } else if (category) {
      // If only category provided, get popular products from that category
      recommendedProducts = await Product.find({
        category: { $regex: `^${category}$`, $options: "i" }
      })
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });
    }

    res.json({ 
      ok: true, 
      recommendedProducts,
      count: recommendedProducts.length,
      type: productId ? 'similar' : 'category_suggestions'
    });

  } catch (err) {
    console.error("Fetch recommended products error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
};


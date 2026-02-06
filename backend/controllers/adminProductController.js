import { Product } from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";

// Create new product with variants
export const createProduct = async (req, res) => {
  try {
    const { 
      title, 
      description, 
      shortDescription,
      basePrice, 
      baseSalePrice, 
      overallDiscountPercentage,
      category, 
      subCategory, 
      gender,
      brand, 
      inStock,
      tags,
      metaTitle,
      metaDescription,
      variants,
      isFeatured
    } = req.body;

    if (!title || !basePrice || !category || !subCategory)
      return res.status(400).json({ 
        error: "Title, base price, category and subcategory are required" 
      });

    // Parse variants if provided as string
    let parsedVariants = [];
    if (variants) {
      try {
        parsedVariants = typeof variants === 'string' ? JSON.parse(variants) : variants;
        
        // Validate variants structure
        for (const variant of parsedVariants) {
          if (!variant.color || !variant.color.name || !variant.color.hexCode) {
            return res.status(400).json({ 
              error: "Each variant must have color name and hex code" 
            });
          }
          if (!variant.size) {
            return res.status(400).json({ 
              error: "Each variant must have a size" 
            });
          }
          if (!variant.price && !basePrice) {
            return res.status(400).json({ 
              error: "Variant price or base price is required" 
            });
          }
          if (variant.stockQuantity === undefined) {
            return res.status(400).json({ 
              error: "Variant stock quantity is required" 
            });
          }
        }
      } catch (err) {
        return res.status(400).json({ 
          error: "Invalid variants format" 
        });
      }
    }

    // Handle main images
    let mainImages = [];
    if (req.files && req.files.mainImages) {
      mainImages = req.files.mainImages.map(file => ({
        url: file.path,
        public_id: file.filename,
      }));
    }

    // Handle variant images
    if (parsedVariants.length > 0 && req.files) {
      // Assuming variant images are uploaded with field names like "variantImages[0]"
      for (let i = 0; i < parsedVariants.length; i++) {
        const variantImageFiles = req.files[`variantImages[${i}]`];
        if (variantImageFiles && variantImageFiles.length > 0) {
          parsedVariants[i].images = variantImageFiles.map(file => ({
            url: file.path,
            public_id: file.filename,
          }));
        }
      }
    }

    // Generate slug
    const baseSlug = title.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    
    // Check for duplicate slug
    let slug = baseSlug;
    let counter = 1;
    while (await Product.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const product = await Product.create({
      title,
      slug,
      description,
      shortDescription,
      basePrice: parseFloat(basePrice),
      baseSalePrice: baseSalePrice ? parseFloat(baseSalePrice) : undefined,
      overallDiscountPercentage: overallDiscountPercentage ? parseFloat(overallDiscountPercentage) : 0,
      category,
      subCategory,
      gender: gender || 'unisex',
      brand,
      mainImages,
      variants: parsedVariants.map(variant => ({
        ...variant,
        price: variant.price ? parseFloat(variant.price) : parseFloat(basePrice),
        salePrice: variant.salePrice ? parseFloat(variant.salePrice) : undefined,
        discountPercentage: variant.discountPercentage ? parseFloat(variant.discountPercentage) : 0,
        stockQuantity: parseInt(variant.stockQuantity),
      })),
      tags: tags ? (typeof tags === 'string' ? tags.split(',').map(tag => tag.trim()) : tags) : [],
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription || description?.substring(0, 160),
      isFeatured: isFeatured === 'true' || isFeatured === true,
      inStock: inStock !== undefined ? inStock : true,
      createdBy: req.user._id,
    });

    res.status(201).json({ 
      success: true, 
      message: "Product created successfully",
      product 
    });
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error creating product",
      details: err.message 
    });
  }
};

// Get all products with filtering and pagination
export const getProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      subCategory, 
      gender,
      brand,
      minPrice, 
      maxPrice, 
      color,
      size,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock,
      isFeatured,
      tags
    } = req.query;

    // Build filter query
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (gender) filter.gender = gender;
    if (brand) filter.brand = brand;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.minPrice = {};
      if (minPrice) filter.minPrice.$gte = parseFloat(minPrice);
      if (maxPrice) filter.maxPrice.$lte = parseFloat(maxPrice);
    }
    
    // Color filter
    if (color) {
      filter['availableColors.name'] = { $regex: color, $options: 'i' };
    }
    
    // Size filter
    if (size) {
      filter.availableSizes = size;
    }
    
    // Tags filter
    if (tags) {
      const tagsArray = tags.split(',').map(tag => tag.trim());
      filter.tags = { $in: tagsArray };
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'name email')
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    // Calculate total pages
    const totalPages = Math.ceil(total / parseInt(limit));
    
    res.json({
      success: true,
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("Get products error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching products" 
    });
  }
};

// Get single product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ slug, isActive: true })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching product" 
    });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching product" 
    });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Get existing product
    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    // Handle slug update
    if (updates.title && updates.title !== existingProduct.title) {
      const baseSlug = updates.title.toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      let slug = baseSlug;
      let counter = 1;
      while (await Product.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updates.slug = slug;
    }
    
    // Parse variants if provided
    if (updates.variants) {
      try {
        updates.variants = typeof updates.variants === 'string' 
          ? JSON.parse(updates.variants) 
          : updates.variants;
        
        // Validate variants
        for (const variant of updates.variants) {
          if (!variant.color || !variant.color.name || !variant.color.hexCode) {
            return res.status(400).json({ 
              success: false,
              error: "Each variant must have color name and hex code" 
            });
          }
          if (!variant.size) {
            return res.status(400).json({ 
              success: false,
              error: "Each variant must have a size" 
            });
          }
          if (!variant.price && !updates.basePrice) {
            return res.status(400).json({ 
              success: false,
              error: "Variant price or base price is required" 
            });
          }
        }
        
        // Convert numeric fields
        updates.variants = updates.variants.map(variant => ({
          ...variant,
          price: variant.price ? parseFloat(variant.price) : parseFloat(updates.basePrice || existingProduct.basePrice),
          salePrice: variant.salePrice ? parseFloat(variant.salePrice) : undefined,
          discountPercentage: variant.discountPercentage ? parseFloat(variant.discountPercentage) : 0,
          stockQuantity: parseInt(variant.stockQuantity) || 0,
        }));
      } catch (err) {
        return res.status(400).json({ 
          success: false,
          error: "Invalid variants format" 
        });
      }
    }
    
    // Handle new main images
    if (req.files && req.files.mainImages) {
      const newImages = req.files.mainImages.map(file => ({ 
        url: file.path, 
        public_id: file.filename 
      }));
      
      // Delete old images if needed
      if (updates.replaceImages === 'true' && existingProduct.mainImages.length > 0) {
        for (let img of existingProduct.mainImages) {
          await cloudinary.uploader.destroy(img.public_id);
        }
        updates.mainImages = newImages;
      } else {
        updates.mainImages = [...existingProduct.mainImages, ...newImages];
      }
    }
    
    // Handle variant images
    if (updates.variants && req.files) {
      for (let i = 0; i < updates.variants.length; i++) {
        const variantImageFiles = req.files[`variantImages[${i}]`];
        if (variantImageFiles && variantImageFiles.length > 0) {
          // Delete old variant images if they exist
          if (existingProduct.variants[i] && existingProduct.variants[i].images) {
            for (let img of existingProduct.variants[i].images) {
              await cloudinary.uploader.destroy(img.public_id);
            }
          }
          
          updates.variants[i].images = variantImageFiles.map(file => ({
            url: file.path,
            public_id: file.filename,
          }));
        }
      }
    }
    
    // Handle tags
    if (updates.tags) {
      updates.tags = typeof updates.tags === 'string' 
        ? updates.tags.split(',').map(tag => tag.trim()) 
        : updates.tags;
    }
    
    // Add updatedBy field
    updates.updatedBy = req.user._id;
    
    const product = await Product.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email')
     .populate('updatedBy', 'name email');
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product
    });
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error updating product" 
    });
  }
};

// Delete product (soft delete)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    // Soft delete by setting isActive to false
    product.isActive = false;
    product.updatedBy = req.user._id;
    await product.save();
    
    res.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error deleting product" 
    });
  }
};

// Hard delete product (with image cleanup)
export const hardDeleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    // Delete all images from cloudinary
    if (product.mainImages && product.mainImages.length > 0) {
      for (let img of product.mainImages) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }
    
    // Delete variant images
    if (product.variants && product.variants.length > 0) {
      for (let variant of product.variants) {
        if (variant.images && variant.images.length > 0) {
          for (let img of variant.images) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
      }
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: "Product permanently deleted"
    });
  } catch (err) {
    console.error("Hard delete product error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error deleting product" 
    });
  }
};

// Update variant stock
export const updateVariantStock = async (req, res) => {
  try {
    const { productId, variantId } = req.params;
    const { stockQuantity, operation } = req.body; // operation: 'set', 'increment', 'decrement'
    
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    const variantIndex = product.variants.findIndex(v => v._id.toString() === variantId);
    if (variantIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        error: "Variant not found" 
      });
    }
    
    let newStock;
    switch (operation) {
      case 'increment':
        newStock = product.variants[variantIndex].stockQuantity + parseInt(stockQuantity);
        break;
      case 'decrement':
        newStock = Math.max(0, product.variants[variantIndex].stockQuantity - parseInt(stockQuantity));
        break;
      case 'set':
      default:
        newStock = parseInt(stockQuantity);
    }
    
    product.variants[variantIndex].stockQuantity = newStock;
    product.updatedBy = req.user._id;
    
    await product.save();
    
    res.json({
      success: true,
      message: "Variant stock updated",
      variant: product.variants[variantIndex],
      totalStock: product.totalStock
    });
  } catch (err) {
    console.error("Update variant stock error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error updating stock" 
    });
  }
};

// Search products
export const searchProducts = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim().length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: "Search query must be at least 2 characters" 
      });
    }
    
    const products = await Product.find({
      isActive: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { tags: { $regex: query, $options: 'i' } }
      ]
    })
    .select('title slug basePrice baseSalePrice mainImages brand category')
    .limit(10);
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Search products error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error searching products" 
    });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { subCategory, limit = 20 } = req.query;
    
    const filter = { 
      isActive: true,
      category 
    };
    
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    
    const products = await Product.find(filter)
      .select('title slug basePrice baseSalePrice mainImages brand category subCategory isFeatured')
      .limit(parseInt(limit))
      .sort({ isFeatured: -1, createdAt: -1 });
    
    res.json({
      success: true,
      products
    });
  } catch (err) {
    console.error("Get products by category error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching products" 
    });
  }
};
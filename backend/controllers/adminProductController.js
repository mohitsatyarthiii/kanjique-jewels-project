import { Product } from "../models/Product.js";
import cloudinary from "../config/cloudinaryConfig.js";
import mongoose from "mongoose";

// ======================== ADMIN ONLY FUNCTIONS ========================

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
      variants,
      availableColors,
      isFeatured,
      metaTitle,
      metaDescription,
      totalStock
    } = req.body;

    if (!title || !basePrice)
      return res.status(400).json({ 
        error: "Title and base price are required" 
      });

    // Parse variants if provided
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
          // Require size only for Rings or Bangles
          if ((category === 'Rings' || category === 'Bangles') && !variant.size) {
            return res.status(400).json({ 
              error: "Each variant must have a size for Rings/Bangles" 
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

    // Parse availableColors if provided
    let parsedColors = [];
    if (availableColors) {
      try {
        parsedColors = typeof availableColors === 'string' ? JSON.parse(availableColors) : availableColors;
      } catch (err) {
        parsedColors = [];
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
        stockQuantity: parseInt(variant.stockQuantity) || 0,
      })),
      totalStock: totalStock ? parseInt(totalStock) : undefined,
      availableColors: parsedColors.length > 0 ? parsedColors : undefined,
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || shortDescription || description?.substring(0, 160),
      isFeatured: isFeatured === 'true' || isFeatured === true,
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

// Get all products for admin dashboard with filtering
export const getAdminProducts = async (req, res) => {
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
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      inStock,
      isFeatured,
      isActive
    } = req.query;

    // Build filter query
    const filter = {};
    
    // Filter by active status
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (gender) filter.gender = gender;
    if (brand) filter.brand = brand;
    if (inStock !== undefined) filter.inStock = inStock === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.$or = [
        { minPrice: { $gte: parseFloat(minPrice || 0) } },
        { maxPrice: { $lte: parseFloat(maxPrice || 999999) } }
      ];
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
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
        .populate('updatedBy', 'name email')
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
    console.error("Get admin products error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching products" 
    });
  }
};

// Get single product by ID for admin
export const getAdminProductById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: "Invalid product ID"
      });
    }

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
    console.error("Get admin product error:", err);
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
    
    // Parse numeric fields
    if (updates.basePrice) updates.basePrice = parseFloat(updates.basePrice);
    if (updates.baseSalePrice) updates.baseSalePrice = parseFloat(updates.baseSalePrice);
    if (updates.overallDiscountPercentage) updates.overallDiscountPercentage = parseFloat(updates.overallDiscountPercentage);
    if (updates.totalStock !== undefined) updates.totalStock = parseInt(updates.totalStock);
    
    // Parse availableColors if provided as string
    if (updates.availableColors) {
      try {
        updates.availableColors = typeof updates.availableColors === 'string' 
          ? JSON.parse(updates.availableColors) 
          : updates.availableColors;
      } catch (err) {
        updates.availableColors = [];
      }
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
          // Require size only for Rings or Bangles
          if ((updates.category === 'Rings' || updates.category === 'Bangles' || existingProduct.category === 'Rings' || existingProduct.category === 'Bangles') && !variant.size) {
            return res.status(400).json({ 
              success: false,
              error: "Each variant must have a size for Rings/Bangles" 
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
    const { stockQuantity, operation } = req.body;
    
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

// Toggle product active status
export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    product.isActive = !product.isActive;
    product.updatedBy = req.user._id;
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      product
    });
  } catch (err) {
    console.error("Toggle product status error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error toggling product status" 
    });
  }
};

// Toggle featured status
export const toggleFeaturedStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    product.isFeatured = !product.isFeatured;
    product.updatedBy = req.user._id;
    await product.save();
    
    res.json({
      success: true,
      message: `Product ${product.isFeatured ? 'added to' : 'removed from'} featured list`,
      product
    });
  } catch (err) {
    console.error("Toggle featured status error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error toggling featured status" 
    });
  }
};

// Bulk update products
export const bulkUpdateProducts = async (req, res) => {
  try {
    const { ids, updates } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs are required"
      });
    }
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { 
        ...updates,
        updatedBy: req.user._id 
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Bulk update error:", err);
    res.status(500).json({
      success: false,
      error: "Server error in bulk update"
    });
  }
};

// Bulk delete products (soft delete)
export const bulkDeleteProducts = async (req, res) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs are required"
      });
    }
    
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { 
        isActive: false,
        updatedBy: req.user._id 
      }
    );
    
    res.json({
      success: true,
      message: `${result.modifiedCount} products deleted`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    console.error("Bulk delete error:", err);
    res.status(500).json({
      success: false,
      error: "Server error in bulk delete"
    });
  }
};

// Export products to CSV
export const exportProductsCSV = async (req, res) => {
  try {
    const products = await Product.find()
      .select('title slug basePrice baseSalePrice category subCategory gender brand totalStock inStock isFeatured isActive createdAt')
      .populate('createdBy', 'name email')
      .lean();
    
    // Convert to CSV format
    const csvData = products.map(product => ({
      ID: product._id,
      Title: product.title,
      Slug: product.slug,
      Base_Price: product.basePrice,
      Sale_Price: product.baseSalePrice || '',
      Category: product.category,
      Subcategory: product.subCategory,
      Gender: product.gender || '',
      Brand: product.brand || '',
      Stock: product.totalStock,
      In_Stock: product.inStock ? 'Yes' : 'No',
      Featured: product.isFeatured ? 'Yes' : 'No',
      Active: product.isActive ? 'Yes' : 'No',
      Created_At: new Date(product.createdAt).toLocaleDateString(),
      Created_By: product.createdBy?.name || product.createdBy?.email || 'N/A'
    }));
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
    
    // Simple CSV conversion
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => 
        typeof val === 'string' && val.includes(',') ? `"${val}"` : val
      ).join(','))
    ].join('\n');
    
    res.send(csv);
  } catch (err) {
    console.error("Export error:", err);
    res.status(500).json({
      success: false,
      error: "Server error exporting products"
    });
  }
};

// ======================== FRONTEND FUNCTIONS ========================

// Get product details for frontend (by slug)
export const getProductDetails = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const product = await Product.findOne({ 
      slug, 
      isActive: true 
    })
    .select('-__v -createdBy -updatedBy -updatedAt')
    .lean();
    
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    // Filter only active variants
    product.variants = product.variants.filter(variant => variant.isActive);
    
    // Calculate best price for display
    const activePrices = product.variants.map(v => v.salePrice || v.price);
    product.bestPrice = activePrices.length > 0 ? Math.min(...activePrices) : product.baseSalePrice || product.basePrice;
    
    res.json({
      success: true,
      product
    });
  } catch (err) {
    console.error("Get product details error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching product details" 
    });
  }
};

// Get featured products for frontend
export const getFeaturedProducts = async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const products = await Product.find({ 
      isActive: true, 
      isFeatured: true,
      inStock: true 
    })
    .select('title slug basePrice baseSalePrice mainImages brand category overallDiscountPercentage minPrice maxPrice')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();
    
    // Add best price for each product
    const productsWithBestPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithBestPrice
    });
  } catch (err) {
    console.error("Get featured products error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching featured products" 
    });
  }
};

// Get products for frontend with filtering
export const getFrontendProducts = async (req, res) => {
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
      isFeatured
    } = req.query;

    // Build filter query - only active and in stock products
    const filter = { 
      isActive: true,
      inStock: true 
    };
    
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    if (gender) filter.gender = gender;
    if (brand) filter.brand = brand;
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';
    
    // Price filter
    if (minPrice || maxPrice) {
      filter.$or = [
        { minPrice: { $gte: parseFloat(minPrice || 0) } },
        { maxPrice: { $lte: parseFloat(maxPrice || 999999) } }
      ];
    }
    
    // Color filter
    if (color) {
      filter['availableColors.name'] = { $regex: color, $options: 'i' };
    }
    
    // Size filter
    if (size) {
      filter.availableSizes = size;
    }
    
    // Search filter
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } },
        { subCategory: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    const sort = {};
    const sortOptions = {
      'price-asc': { minPrice: 1 },
      'price-desc': { minPrice: -1 },
      'newest': { createdAt: -1 },
      'popular': { isFeatured: -1, createdAt: -1 },
      'name-asc': { title: 1 },
      'name-desc': { title: -1 }
    };
    
    const sortKey = sortBy && sortOrder ? `${sortBy}-${sortOrder}` : 'newest';
    Object.assign(sort, sortOptions[sortKey] || sortOptions['newest']);
    
    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('title slug basePrice baseSalePrice mainImages brand category subCategory overallDiscountPercentage minPrice maxPrice availableColors availableSizes totalStock')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    // Calculate total pages and add display prices
    const totalPages = Math.ceil(total / parseInt(limit));
    const productsWithDisplayPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts: total,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("Get frontend products error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching products" 
    });
  }
};

// Search products for frontend
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
      inStock: true,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { category: { $regex: query, $options: 'i' } },
        { subCategory: { $regex: query, $options: 'i' } }
      ]
    })
    .select('title slug basePrice baseSalePrice mainImages brand category')
    .limit(10)
    .lean();
    
    const productsWithDisplayPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice
    });
  } catch (err) {
    console.error("Search products error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error searching products" 
    });
  }
};

// Get products by category for frontend
export const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { subCategory, limit = 20 } = req.query;
    
    const filter = { 
      isActive: true,
      inStock: true,
      category 
    };
    
    if (subCategory) {
      filter.subCategory = subCategory;
    }
    
    const products = await Product.find(filter)
      .select('title slug basePrice baseSalePrice mainImages brand category subCategory isFeatured minPrice maxPrice availableColors availableSizes')
      .limit(parseInt(limit))
      .sort({ isFeatured: -1, createdAt: -1 })
      .lean();
    
    const productsWithDisplayPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice
    });
  } catch (err) {
    console.error("Get products by category error:", err);
    res.status(500).json({ 
      success: false, 
      error: "Server error fetching products" 
    });
  }
};

// Get new arrivals for frontend
export const getNewArrivals = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const products = await Product.find({ 
      isActive: true,
      inStock: true 
    })
    .select('title slug basePrice baseSalePrice mainImages brand category overallDiscountPercentage minPrice maxPrice availableColors')
    .limit(parseInt(limit))
    .sort({ createdAt: -1 })
    .lean();
    
    const productsWithDisplayPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice
    });
  } catch (err) {
    console.error("New arrivals error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching new arrivals"
    });
  }
};

// Get related products (by category)
export const getRelatedProducts = async (req, res) => {
  try {
    const { productId } = req.params;
    const { limit = 4 } = req.query;
    
    // Get the current product to find its category
    const currentProduct = await Product.findById(productId)
      .select('category subCategory')
      .lean();
    
    if (!currentProduct) {
      return res.status(404).json({
        success: false,
        error: "Product not found"
      });
    }
    
    const relatedProducts = await Product.find({
      _id: { $ne: productId },
      isActive: true,
      inStock: true,
      category: currentProduct.category,
      subCategory: currentProduct.subCategory
    })
    .select('title slug basePrice baseSalePrice mainImages brand category overallDiscountPercentage')
    .limit(parseInt(limit))
    .sort({ isFeatured: -1, createdAt: -1 })
    .lean();
    
    const productsWithDisplayPrice = relatedProducts.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice
    });
  } catch (err) {
    console.error("Related products error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching related products"
    });
  }
};

// Get available filters for frontend
export const getAvailableFilters = async (req, res) => {
  try {
    const { category, subCategory } = req.query;
    
    const filter = { isActive: true, inStock: true };
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
    
    // Get unique categories, subcategories, brands, colors, sizes
    const [
      categories,
      subCategories,
      brands,
      colorsResult,
      sizesResult,
      priceRange
    ] = await Promise.all([
      Product.distinct('category', filter),
      Product.distinct('subCategory', filter),
      Product.distinct('brand', filter).where('brand').ne(null).ne(''),
      Product.aggregate([
        { $match: filter },
        { $unwind: "$availableColors" },
        { $group: {
          _id: "$availableColors.name",
          hexCode: { $first: "$availableColors.hexCode" },
          count: { $sum: 1 }
        }},
        { $project: {
          name: "$_id",
          hexCode: 1,
          count: 1,
          _id: 0
        }}
      ]),
      Product.aggregate([
        { $match: filter },
        { $unwind: "$availableSizes" },
        { $group: {
          _id: "$availableSizes",
          count: { $sum: 1 }
        }},
        { $project: {
          size: "$_id",
          count: 1,
          _id: 0
        }}
      ]),
      Product.aggregate([
        { $match: filter },
        { $group: {
          _id: null,
          minPrice: { $min: "$minPrice" },
          maxPrice: { $max: "$maxPrice" }
        }}
      ])
    ]);
    
    res.json({
      success: true,
      filters: {
        categories,
        subCategories: subCategories.filter(Boolean),
        brands: brands.filter(Boolean),
        colors: colorsResult,
        sizes: sizesResult,
        priceRange: priceRange[0] || { minPrice: 0, maxPrice: 0 }
      }
    });
  } catch (err) {
    console.error("Available filters error:", err);
    res.status(500).json({
      success: false,
      error: "Server error fetching filters"
    });
  }
};
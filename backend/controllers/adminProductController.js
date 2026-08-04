import { Product } from "../models/Product.js";
import mongoose from "mongoose";
import {
  allProductImages,
  cleanupFiles,
  imageFileName,
  promoteStagedFile,
  purgeQuarantined,
  quarantineImages,
  restoreQuarantined,
} from "../services/imageStorage.js";

const storedImage = promoted => ({ url: promoted.url, fileName: promoted.fileName });
const parseJsonField = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") return fallback;
  return typeof value === "string" ? JSON.parse(value) : value;
};
const escapeRegExp = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const boundedInteger = (value, fallback, max) => Math.min(max, Math.max(1, Number.parseInt(value, 10) || fallback));
const storageError = error => error?.code === "ENOSPC"
  ? { status: 507, message: "Image storage is full" }
  : error?.code === "EACCES" || error?.code === "EPERM"
    ? { status: 500, message: "Image storage is not writable" }
    : null;

const promoteProductUploads = async req => {
  const promoted = [];
  const mainImages = [];
  const variantImages = new Map();
  try {
    for (const file of req.files?.mainImages || []) {
      const result = await promoteStagedFile(file);
      promoted.push(result);
      mainImages.push(storedImage(result));
    }
    for (const [field, files] of Object.entries(req.files || {})) {
      const match = /^variantImages\[(\d+)\]$/.exec(field);
      if (!match) continue;
      const images = [];
      for (const file of files) {
        const result = await promoteStagedFile(file);
        promoted.push(result);
        images.push(storedImage(result));
      }
      variantImages.set(Number(match[1]), images);
    }
    return { promoted, mainImages, variantImages };
  } catch (error) {
    await cleanupFiles(promoted);
    throw error;
  }
};

const imageKey = image => image?._id?.toString() || imageFileName(image) || image?.url;
const selectExistingImages = (requested, existing) => {
  const byKey = new Map(existing.map(image => [imageKey(image), image]));
  return requested.map(item => byKey.get(typeof item === "string" ? item : imageKey(item))).filter(Boolean);
};

const orderMainImages = (order, existing, added) => {
  if (!Array.isArray(order)) return [...existing, ...added];
  const existingByKey = new Map(existing.map(image => [String(imageKey(image)), image]));
  const selected = [];
  const used = new Set();
  for (const token of order) {
    const value = String(token);
    const image = value.startsWith("new:")
      ? added[Number.parseInt(value.slice(4), 10)]
      : existingByKey.get(value.replace(/^existing:/, ""));
    if (image && !used.has(image)) {
      selected.push(image);
      used.add(image);
    }
  }
  return [...selected, ...[...existing, ...added].filter(image => !used.has(image))];
};

// ======================== ADMIN ONLY FUNCTIONS ========================

// Create new product with variants
export const createProduct = async (req, res) => {
  let promoted = [];
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

    const uploadResult = await promoteProductUploads(req);
    promoted = uploadResult.promoted;
    const mainImages = orderMainImages(parseJsonField(req.body.mainImageOrder, null), [], uploadResult.mainImages);
    uploadResult.variantImages.forEach((images, index) => {
      if (parsedVariants[index]) parsedVariants[index].images = images;
    });

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
    await cleanupFiles(promoted);
    console.error("Create product error:", err);
    const fileError = storageError(err);
    res.status(fileError?.status || err.status || 500).json({
      success: false, 
      error: fileError?.message || "Server error creating product",
      details: err.message 
    });
  }
};

// Get all products for admin dashboard with filtering
export const getAdminProducts = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10000, 
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
    
    const clauses = [];
    // Price range overlap
    if (minPrice || maxPrice) {
      if (maxPrice) clauses.push({ minPrice: { $lte: Number(maxPrice) } });
      if (minPrice) clauses.push({ maxPrice: { $gte: Number(minPrice) } });
    }
    
    // Search filter
    if (search) {
      const pattern = escapeRegExp(search.trim());
      clauses.push({ $or: [
        { title: { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
        { brand: { $regex: pattern, $options: 'i' } },
        { category: { $regex: pattern, $options: 'i' } },
        { subCategory: { $regex: pattern, $options: 'i' } }
      ] });
    }
    if (clauses.length) filter.$and = clauses;
    
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
  let promoted = [];
  let quarantined = [];
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid product ID" });
    }

    const existingProduct = await Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    const body = req.body;
    const nextCategory = body.category || existingProduct.category;
    let variants = body.variants === undefined ? existingProduct.variants.map(v => v.toObject()) : parseJsonField(body.variants);
    if (!Array.isArray(variants)) return res.status(400).json({ success: false, error: "Variants must be an array" });

    for (const variant of variants) {
      if (!variant.color?.name || !variant.color?.hexCode) {
        return res.status(400).json({ success: false, error: "Each variant must have color name and hex code" });
      }
      if ((nextCategory === "Rings" || nextCategory === "Bangles") && !variant.size) {
        return res.status(400).json({ success: false, error: "Each variant must have a size for Rings/Bangles" });
      }
      variant.price = Number(variant.price || body.basePrice || existingProduct.basePrice);
      variant.salePrice = variant.salePrice === "" || variant.salePrice == null ? undefined : Number(variant.salePrice);
      variant.discountPercentage = Number(variant.discountPercentage || 0);
      variant.stockQuantity = Number.parseInt(variant.stockQuantity, 10) || 0;
    }

    let retainedMainImages = existingProduct.mainImages;
    if (body.existingMainImages !== undefined) {
      const requested = parseJsonField(body.existingMainImages);
      if (!Array.isArray(requested)) return res.status(400).json({ success: false, error: "Existing images must be an array" });
      retainedMainImages = selectExistingImages(requested, existingProduct.mainImages);
    } else if (body.replaceImages === "true") {
      retainedMainImages = [];
    }

    const uploadResult = await promoteProductUploads(req);
    promoted = uploadResult.promoted;
    if (retainedMainImages.length + uploadResult.mainImages.length > 5) {
      throw Object.assign(new Error("A product can have at most 5 main images"), { status: 400 });
    }

    variants = variants.map((variant, index) => {
      const previous = variant._id
        ? existingProduct.variants.find(item => item._id.toString() === variant._id.toString())
        : existingProduct.variants[index];
      const retained = previous ? selectExistingImages(variant.images || [], previous.images || []) : [];
      const added = uploadResult.variantImages.get(index) || [];
      if (retained.length + added.length > 3) {
        throw Object.assign(new Error("A variant can have at most 3 images"), { status: 400 });
      }
      return { ...variant, images: [...retained, ...added] };
    });

    const nextMainImages = orderMainImages(
      parseJsonField(body.mainImageOrder, null),
      retainedMainImages,
      uploadResult.mainImages,
    );
    const retainedKeys = new Set([
      ...nextMainImages,
      ...variants.flatMap(variant => variant.images || []),
    ].map(imageKey));
    const removedImages = allProductImages(existingProduct).filter(image => !retainedKeys.has(imageKey(image)));
    quarantined = await quarantineImages(removedImages);

    if (body.title && body.title !== existingProduct.title) {
      const baseSlug = body.title.toLowerCase()
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
      existingProduct.slug = slug;
    }

    const scalarFields = ["title", "description", "shortDescription", "category", "subCategory", "gender", "brand", "metaTitle", "metaDescription"];
    for (const field of scalarFields) if (body[field] !== undefined) existingProduct[field] = body[field];
    if (body.basePrice !== undefined) existingProduct.basePrice = Number(body.basePrice);
    if (body.baseSalePrice !== undefined) existingProduct.baseSalePrice = body.baseSalePrice === "" ? undefined : Number(body.baseSalePrice);
    if (body.overallDiscountPercentage !== undefined) existingProduct.overallDiscountPercentage = Number(body.overallDiscountPercentage || 0);
    if (body.totalStock !== undefined) existingProduct.totalStock = Number.parseInt(body.totalStock, 10) || 0;
    if (body.availableColors !== undefined) existingProduct.availableColors = parseJsonField(body.availableColors);
    if (body.isFeatured !== undefined) existingProduct.isFeatured = body.isFeatured === true || body.isFeatured === "true";
    if (body.isActive !== undefined) existingProduct.isActive = body.isActive === true || body.isActive === "true";
    existingProduct.mainImages = nextMainImages;
    existingProduct.variants = variants;
    existingProduct.updatedBy = req.user._id;

    await existingProduct.save();
    await purgeQuarantined(quarantined).catch(error => console.error("Image trash cleanup error:", error));
    
    res.json({
      success: true,
      message: "Product updated successfully",
      product: existingProduct
    });
  } catch (err) {
    await Promise.all([cleanupFiles(promoted), restoreQuarantined(quarantined)]);
    console.error("Update product error:", err);
    const fileError = storageError(err);
    res.status(fileError?.status || err.status || (err instanceof SyntaxError ? 400 : 500)).json({
      success: false, 
      error: fileError?.message || (err.status || err instanceof SyntaxError ? err.message : "Server error updating product")
    });
  }
};

// Delete product and its stored images.
export const deleteProduct = async (req, res) => {
  let quarantined = [];
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: "Invalid product ID" });
    }
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ 
        success: false, 
        error: "Product not found" 
      });
    }
    
    quarantined = await quarantineImages(allProductImages(product));
    await product.deleteOne();
    await purgeQuarantined(quarantined).catch(error => console.error("Image trash cleanup error:", error));
    
    res.json({
      success: true,
      message: "Product and its images deleted successfully"
    });
  } catch (err) {
    await restoreQuarantined(quarantined);
    console.error("Delete product error:", err);
    const fileError = storageError(err);
    res.status(fileError?.status || 500).json({
      success: false, 
      error: fileError?.message || "Server error deleting product"
    });
  }
};

// Backward-compatible permanent-delete endpoint.
export const hardDeleteProduct = async (req, res) => {
  return deleteProduct(req, res);
};

export const deleteProductImage = async (req, res) => {
  let quarantined = [];
  try {
    const { id, imageId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(imageId)) {
      return res.status(400).json({ success: false, error: "Invalid product or image ID" });
    }
    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ success: false, error: "Product not found" });

    let image = product.mainImages.id(imageId);
    if (image) product.mainImages.pull(imageId);
    if (!image) {
      for (const variant of product.variants) {
        image = variant.images.id(imageId);
        if (image) {
          variant.images.pull(imageId);
          break;
        }
      }
    }
    if (!image) return res.status(404).json({ success: false, error: "Image not found" });

    quarantined = await quarantineImages([image]);
    product.updatedBy = req.user._id;
    await product.save();
    await purgeQuarantined(quarantined).catch(error => console.error("Image trash cleanup error:", error));
    res.json({ success: true, message: "Image deleted successfully", product });
  } catch (err) {
    await restoreQuarantined(quarantined);
    console.error("Delete product image error:", err);
    res.status(500).json({ success: false, error: "Server error deleting image" });
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
    
    const allowedFields = ["isActive", "isFeatured", "category", "subCategory", "brand", "gender"];
    const safeUpdates = Object.fromEntries(Object.entries(updates || {}).filter(([key]) => allowedFields.includes(key)));
    if (!Object.keys(safeUpdates).length) {
      return res.status(400).json({ success: false, error: "No supported update fields were provided" });
    }
    const result = await Product.updateMany(
      { _id: { $in: ids } },
      { 
        ...safeUpdates,
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

// Permanently delete products and all associated files.
export const bulkDeleteProducts = async (req, res) => {
  let quarantined = [];
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Product IDs are required"
      });
    }
    
    if (ids.some(id => !mongoose.Types.ObjectId.isValid(id))) {
      return res.status(400).json({ success: false, error: "One or more product IDs are invalid" });
    }
    const products = await Product.find({ _id: { $in: ids } });
    quarantined = await quarantineImages(products.flatMap(allProductImages));
    const result = await Product.deleteMany({ _id: { $in: ids } });
    await purgeQuarantined(quarantined).catch(error => console.error("Image trash cleanup error:", error));
    
    res.json({
      success: true,
      message: `${result.deletedCount} products deleted`,
      deletedCount: result.deletedCount
    });
  } catch (err) {
    await restoreQuarantined(quarantined);
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
    
    const clauses = [];

    // Include products whose price range overlaps the requested range.
    if (minPrice || maxPrice) {
      if (maxPrice) clauses.push({ minPrice: { $lte: Number(maxPrice) } });
      if (minPrice) clauses.push({ maxPrice: { $gte: Number(minPrice) } });
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
      const pattern = escapeRegExp(search.trim());
      clauses.push({ $or: [
        { title: { $regex: pattern, $options: 'i' } },
        { description: { $regex: pattern, $options: 'i' } },
        { brand: { $regex: pattern, $options: 'i' } },
        { category: { $regex: pattern, $options: 'i' } },
        { subCategory: { $regex: pattern, $options: 'i' } }
      ] });
    }
    if (clauses.length) filter.$and = clauses;
    
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
    const safePage = boundedInteger(page, 1, 1000000);
    const safeLimit = boundedInteger(limit, 20, 100);
    const skip = (safePage - 1) * safeLimit;
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .select('title slug basePrice baseSalePrice mainImages brand category subCategory overallDiscountPercentage minPrice maxPrice availableColors availableSizes totalStock')
        .sort(sort)
        .skip(skip)
        .limit(safeLimit)
        .lean(),
      Product.countDocuments(filter)
    ]);
    
    // Calculate total pages and add display prices
    const totalPages = Math.ceil(total / safeLimit);
    const productsWithDisplayPrice = products.map(product => ({
      ...product,
      displayPrice: product.baseSalePrice || product.basePrice,
      hasDiscount: product.baseSalePrice && product.baseSalePrice < product.basePrice
    }));
    
    res.json({
      success: true,
      products: productsWithDisplayPrice,
      pagination: {
        currentPage: safePage,
        totalPages,
        totalProducts: total,
        hasNextPage: safePage < totalPages,
        hasPrevPage: safePage > 1
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
        { title: { $regex: escapeRegExp(query.trim()), $options: 'i' } },
        { description: { $regex: escapeRegExp(query.trim()), $options: 'i' } },
        { brand: { $regex: escapeRegExp(query.trim()), $options: 'i' } },
        { category: { $regex: escapeRegExp(query.trim()), $options: 'i' } },
        { subCategory: { $regex: escapeRegExp(query.trim()), $options: 'i' } }
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

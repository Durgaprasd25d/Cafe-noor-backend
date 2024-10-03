import Product from "../models/Product.js";
import cloudinary from "../utils/cloudinary.js";

// Create a new product
export const createProduct = async (req, res) => {
  try {
    // Check if a file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: "Image file is required." });
    }

    const result = await cloudinary.v2.uploader.upload(req.file.path);
    const product = new Product({
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      imageUrl: result.secure_url,
      category: req.body.category,
      stock: req.body.stock || 0, // Include stock from request body if available
    });

    await product.save();
    res.status(201).json({ product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get all products with search and filtering
export const getAllProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice } = req.query; // Get query parameters
  const page = Number(req.query.page) || 1;
  const pageSize = 10; // Adjust the number of products per page

  // Create a filter object
  const filter = {};

  // Add search filter
  if (search) {
    filter.name = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  // Add category filter
  if (category) {
    filter.category = category;
  }

  // Add price filters
  if (minPrice) {
    filter.price = { ...filter.price, $gte: Number(minPrice) }; // Minimum price filter
  }

  if (maxPrice) {
    filter.price = { ...filter.price, $lte: Number(maxPrice) }; // Maximum price filter
  }

  try {
    const count = await Product.countDocuments(filter); // Count products based on filters
    const products = await Product.find(filter)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get a product by ID
export const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ error: error.message });
  }
};


export const updateProduct = async (req, res) => {
  const { id } = req.params;
  try {
    // Prepare the update data object
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      stock: req.body.stock, // Include stock in the update if provided
    };

    // Handle image upload if a new file is uploaded
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path);
      updateData.imageUrl = result.secure_url;
    }

    // Find the product first to get the existing data
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update isAvailable based on the new stock value
    updateData.isAvailable = updateData.stock > 0;

    // Update the product with the new data
    const updatedProduct = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true, // Ensures validators are run on update
    });

    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: error.message });
  }
};


// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: error.message });
  }
};
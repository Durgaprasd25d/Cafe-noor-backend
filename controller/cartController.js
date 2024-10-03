import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

// Add item to cart
export const addToCart = async (req, res) => {
  const { productId, quantity } = req.body; // Removed userId from the body
  const userId = req.user.id; // Get userId from the decoded token

  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity; // Update quantity if item already in cart
    } else {
      cart.items.push({ productId, quantity }); // Add new item
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update item quantity in cart
export const updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body; // Removed userId from the body
  const userId = req.user.id; // Get userId from the decoded token

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const item = cart.items.find(
      (item) => item.productId.toString() === productId
    );
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    item.quantity = quantity; // Update quantity
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Remove item from cart
export const removeCartItem = async (req, res) => {
  const { productId } = req.body; // Removed userId from the body
  const userId = req.user.id; // Get userId from the decoded token

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId
    ); // Remove item
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get cart items
export const getCartItems = async (req, res) => {
  const userId = req.user.id; // Get userId from the decoded token

  try {
    const cart = await Cart.findOne({ userId }).populate("items.productId"); // Populate product details
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getAllCartItems = async (req, res) => {
  const userId = req.user.id;

  try {
    // Find the cart by userId and populate product details for each item
    const cart = await Cart.findOne({ userId }).populate({
      path: 'items.productId', // Assuming 'items.productId' is the field where the product ID is stored
      model: 'Product', // Name of the Product model
      select: 'name price description imageUrl' // Fields to return from the Product collection
    });

    if (!cart || cart.items.length === 0) {
      return res.status(404).json({ message: "Cart is empty" });
    }

    res.status(200).json(cart); // Send cart details with populated product info
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};


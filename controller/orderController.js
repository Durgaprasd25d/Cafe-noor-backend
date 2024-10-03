import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { sendEmail } from "../utils/emailService.js";

export const createOrder = async (req, res) => {
  const { cartItems, shippingAddress, paymentMethod } = req.body;
  const userId = req.user.id;

  if (!cartItems || cartItems.length === 0) {
    return res.status(400).json({ message: "Products are required." });
  }

  try {
    let totalAmount = 0;
    const products = [];

    for (const item of cartItems) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res
          .status(404)
          .json({ message: `Product with ID ${item.productId} not found.` });
      }

      // Update condition to allow orders where stock is exactly the same as requested quantity
      if (product.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Not enough stock for product ${product.name}.` });
      }

      totalAmount += product.price * item.quantity;

      products.push({
        productId: product._id,
        quantity: item.quantity,
        price: product.price,
      });
    }

    const order = new Order({
      userId,
      products,
      totalAmount,
      shippingAddress,
      paymentMethod,
    });

    await order.save();

    // Decrease the product stock
    for (const item of cartItems) {
      await Product.findByIdAndUpdate(item.productId, {
        $inc: { stock: -item.quantity },
      });
    }

    // Send confirmation email
    const customerEmail = req.user.email; // Assuming the user's email is stored in the token
    const subject = "Order Confirmation";
    const text = `Thank you for your order! Your order ID is ${order._id}. Total Amount: ${totalAmount}.`;
    await sendEmail(customerEmail, subject, text);

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: error.message });
  }
};


// Update order status
export const updateOrderStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Send shipping update email
    const customerEmail = updatedOrder.userId; // Assuming you have the user's email saved in the order or have a way to fetch it
    const subject = "Shipping Update";
    const text = `Your order with ID ${updatedOrder._id} has been updated to status: ${status}.`;
    await sendEmail(customerEmail, subject, text);

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: error.message });
  }
};

// Get order history for a user
export const getOrderHistory = async (req, res) => {
  const userId = req.user.id;
  try {
    const orders = await Order.find({ userId }).populate("products.productId");

    if (!orders.length) {
      return res.status(404).json({ message: "No orders found." });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching order history:", error);
    res.status(500).json({ error: error.message });
  }
};

export const confirmOrder = async (req, res) => {
  const { orderId } = req.body; // Expecting the order ID to be sent in the request body

  try {
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Logic to confirm the order can go here (if any)

    // Send confirmation email
    const customerEmail = req.user.email; // Assuming req.user contains the logged-in user's information
    console.log(req.user)
    const subject = "Order Confirmation";
    const text = `Your order with ID ${order._id} has been confirmed. Thank you for your purchase!`;
    await sendEmail(customerEmail, subject, text);

    res.status(200).json({ message: "Order confirmed and email sent." });
  } catch (error) {
    console.error("Error confirming order:", error);
    res.status(500).json({ error: error.message });
  }
};

export const updateShipping = async (req, res) => {
  const { orderId, shippingAddress } = req.body; // Expecting order ID and new shipping address

  try {
    // Validate that orderId and shippingAddress are provided
    if (!orderId || !shippingAddress) {
      return res.status(400).json({ message: "Order ID and shipping address are required." });
    }

    // Find and update the order's shipping address
    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      { shippingAddress },
      { new: true }
    );

    // Check if the order exists
    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found." });
    }

    // Send email to notify the customer about the shipping update
    try {
      const customerEmail = req.user.email;
      const subject = "Shipping Update";
      const text = `Your order's shipping address has been updated to: ${shippingAddress}.`;

      // Ensure email sending success or log the failure
      await sendEmail(customerEmail, subject, text);
    } catch (emailError) {
      console.error("Error sending email notification:", emailError);
      // Respond with a warning, but don't fail the entire update
      return res.status(200).json({
        message: "Shipping address updated, but there was an issue sending the email.",
        updatedOrder,
      });
    }

    // Respond with the updated order data
    res.status(200).json({ message: "Shipping address updated successfully.", updatedOrder });
  } catch (error) {
    console.error("Error updating shipping information:", error);
    res.status(500).json({ error: error.message });
  }
};


export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.productId");
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ error: error.message });
  }
};

import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  category: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 }, // Stock level
  isAvailable: { type: Boolean, default: true }, // Availability based on stock
  createdAt: { type: Date, default: Date.now },
});

// Pre-save hook to automatically update availability based on stock level
productSchema.pre("save", function (next) {
  if (this.stock <= 0) {
    this.isAvailable = false;
  } else {
    this.isAvailable = true;
  }
  next();
});

const Product = mongoose.model("Product", productSchema);

export default Product;

import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import cloudinary from "../utils/cloudinary.js"; // Import Cloudinary utility

export const register = async (req, res) => {
  try {
    // Check if all required fields are provided
    const { name, email, password, address, phone, role } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !address || !phone || !role) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists." });
    }

    // Check if a file is uploaded for profile picture
    let profileImage = "";
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path); // Upload to Cloudinary
      profileImage = result.secure_url; // Get the URL for the uploaded image
    } else {
      return res.status(400).json({ message: "Profile image is required." });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      address,
      phone,
      role,
      profileImage,
    });

    await user.save(); // Save user to the database
    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: error.message });
  }
};

// User login
export const login = async (req, res) => {
  const { email, password } = req.body;
  console.log(`Login attempt with email: ${email}`);

  try {
    const user = await User.findOne({ email });
    console.log(`Found user: ${user}`); // Log the user object

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log(`Password Match: ${isMatch}`); // Log whether the password matches

    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h", // Optionally set token expiration
      }
    );

    res.status(200).json({ token,user, message: "Login successful" });
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(400).json({ error: error.message });
  }
};

// Get all users (including admins) except the requesting admin
export const getAllUsers = async (req, res) => {
  try {
    const currentUserId = req.user.id; // Extract the current user's ID from the request

    // Fetch all users excluding the current user
    const users = await User.find({ _id: { $ne: currentUserId } }); // Use $ne operator to exclude the current user
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a user by ID
export const deleteUser = async (req, res) => {
  const { id } = req.params; // Extract user ID from request parameters
  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const updatedData = {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    };

    const user = await User.findByIdAndUpdate(req.user.id, updatedData, {
      new: true,
    });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "Profile updated successfully", user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

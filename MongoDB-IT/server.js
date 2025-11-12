import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import protectedRoutes from "./routes/protected.js";

dotenv.config();
const app = express();
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.log(err));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/protected", protectedRoutes);

// Example route
app.get("/", (req, res) => {
  res.send("Server is running");
});

// 404 handler for API routes - must come after all API route definitions
app.use("/api", (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
    error: "Not Found",
    availableEndpoints: {
      "GET /api/users": "Get all users",
      "GET /api/users/:id": "Get user by ID", 
      "POST /api/users/add": "Create new user",
      "PUT /api/users/:id": "Update user by ID",
      "DELETE /api/users/:id": "Delete user by ID",
      "POST /api/auth/register": "Register new user",
      "POST /api/auth/login": "Login user (sets cookie)",
      "POST /api/auth/logout": "Logout user (clears cookie)",
      "POST /api/auth/refresh": "Refresh JWT token",
      "GET /api/protected/profile": "Get user profile (protected)",
      "PUT /api/protected/profile": "Update user profile (protected)"
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

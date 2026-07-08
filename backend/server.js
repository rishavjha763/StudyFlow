require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const timerRoutes = require("./routes/timerRoutes");
const commitRoutes = require("./routes/commitRoutes");
const topicRoutes = require("./routes/topicRoutes");
const noteRoutes = require("./routes/noteRoutes");
const statsRoutes = require("./routes/statsRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

// Connect to the database
connectDB();

// Security + logging middleware
app.use(helmet());
app.use(morgan("dev"));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());

// Uploaded profile images are served from here, e.g. http://localhost:5000/uploads/profile-images/xyz.jpg
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

// Basic rate limiter so the API can't be hammered with requests
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { message: "Too many requests, please try again later." },
});
app.use("/api", apiLimiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/timer", timerRoutes);
app.use("/api/commits", commitRoutes);
app.use("/api/topics", topicRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/user", userRoutes);

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// Catch-all 404 for unknown API routes
app.use("/api", (req, res) =>
  res.status(404).json({ message: "Route not found" }),
);

// Central error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

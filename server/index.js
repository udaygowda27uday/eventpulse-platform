const dns = require("dns");
dns.setServers(["1.1.1.1", "8.8.8.8"]);

const express = require("express");
const { connectMongoDB } = require("./config/dbconfig");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const path = require("path");
const setupSwagger = require("./config/swagger");

const app = express();
require("dotenv").config();

connectMongoDB();

// CORS configuration to allow credentials
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Serve uploaded media files as static assets
app.use("/assets/media", express.static(path.join(__dirname, "assets/media")));

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Check if the API is running
 *     responses:
 *       200:
 *         description: API is running successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Event Booking System API is running
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get("/", (req, res) => {
  res.json({
    message: "Event Booking System API is running",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    documentation: "/api-docs",
  });
});

// API Routes
app.use("/api/users", require("./routes/userRoute"));
app.use("/api/events", require("./routes/eventRoute"));
app.use("/api/bookings", require("./routes/bookingRoute"));
app.use("/api/reports", require("./routes/reportRoute"));

// Setup Swagger Documentation
setupSwagger(app);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
    availableRoutes: [
      "/api/users",
      "/api/events",
      "/api/bookings",
      "/api/reports",
      "/api-docs",
    ],
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`🚀 EventPulse v2.0 - Server is running on http://localhost:${port}`);
  console.log(`📚 API Documentation: http://localhost:${port}/api-docs`);
});
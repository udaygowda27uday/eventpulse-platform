
const mongoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("[MongoDB] Connection established");
    });

    mongoose.connection.on("disconnected", () => {
      console.error("[MongoDB] Connection lost");
    });

    mongoose.connection.on("error", (error) => {
      console.error("[MongoDB] Connection error:", error);
    });

    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log(
      "[MongoDB] Startup connection successful. Ready state:",
      mongoose.connection.readyState
    );
  } catch (error) {
    console.error("[MongoDB] Initial connection failed:", error.message);
    throw error;
  }
};

module.exports = { connectMongoDB };

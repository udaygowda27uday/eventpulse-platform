
const mongoose = require("mongoose");

const connectMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 15000,
    });

    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error in connecting to MongoDB:", error.message);
    throw error;
  }
};

module.exports = { connectMongoDB };

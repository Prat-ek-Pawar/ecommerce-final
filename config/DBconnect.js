const mongoose = require("mongoose");
const dotenc=require('dotenv').config()
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI; // ✅ Hardcoded URI
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;

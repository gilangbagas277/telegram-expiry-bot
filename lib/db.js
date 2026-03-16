const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Terhubung");
  } catch (error) {
    console.error("Gagal Koneksi DB:", error);
  }
};

module.exports = connectDB;

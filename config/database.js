const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // MongoDB connection string - using mongoURI from .env file
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/myapp';
    
    const conn = await mongoose.connect(mongoURI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    throw error; // Re-throw to handle in the main server file
  }
};

module.exports = connectDB; 
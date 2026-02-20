const mongoose = require('mongoose');

let instance = null;

class Database {
  constructor() {
    if (instance) return instance;
    this.isConnected = false;
    instance = this;
  }

  async connect() {
    if (this.isConnected) {
      console.log('📦 Database already connected');
      return;
    }
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      this.isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  }

  disconnect() {
    mongoose.disconnect();
    this.isConnected = false;
  }
}

// Singleton export
module.exports = new Database();

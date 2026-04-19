import mongoose from 'mongoose';

let instance: Database | null = null;

class Database {
  isConnected: boolean;

  constructor() {
    if (instance) return instance;
    this.isConnected = false;
    instance = this;
  }

  async connect(): Promise<void> {
    if (this.isConnected) {
      console.log('📦 Database already connected');
      return;
    }
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI as string);
      this.isConnected = true;
      console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    } catch (error: any) {
      console.error(`❌ MongoDB connection error: ${error.message}`);
      process.exit(1);
    }
  }

  disconnect(): void {
    mongoose.disconnect();
    this.isConnected = false;
  }
}

export default new Database();

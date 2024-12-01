import { config } from 'dotenv';
import mongoose from 'mongoose';

mongoose.set('strictQuery', false);

export const connectDB = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    config();
    const uri = process.env.MONGO_URI || '';
    if (!uri) {
      reject(new Error('MongoDB URI is not defined'));
    }
    mongoose
      .connect(uri)
      .then(() => {
        console.log('MongoDB connected');
        resolve();
      })
      .catch((error: any) => {
        console.error(error.message);
        reject(error);
      });
  });
};

export const disconnectDB = async (): Promise<void> => {
  mongoose.disconnect().then(() => {
    console.log('MongoDB disconnected');
  });
};
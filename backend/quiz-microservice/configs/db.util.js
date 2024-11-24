import mongoose from 'mongoose';

// Function to connect to MongoDB
export async function connectQuizDB() {
  try {
    const dbUri = process.env.QUIZ_DB_URI;
    if (!dbUri) {
      throw new Error('MongoDB URI is missing.');
    }
    await mongoose.connect(dbUri);
    console.log('Connected to Quiz DB successfully.');
  } catch (error) {
    console.error('Error connecting to Quiz DB:', error.message);
    throw error;
  }
}

// Function to drop the database (for testing or resetting)
export async function dropQuizDatabase() {
  try {
    await new Promise((resolve) => mongoose.connection.once('open', resolve));
    await mongoose.connection.db.dropDatabase();
    console.log('Quiz database dropped successfully.');
  } catch (error) {
    console.error('Error dropping Quiz DB:', error.message);
    throw error;
  }
}

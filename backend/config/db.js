const mongoose = require('mongoose');

const MAX_RETRIES = 3;

const connectDB = async () => {
  let attempt = 0;
  while (attempt < MAX_RETRIES) {
    attempt++;
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000
      });
      console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
      return conn;
    } catch (error) {
      const hint =
        process.env.MONGODB_URI.startsWith('mongodb+srv://')
          ? ' Hint: mongodb+srv:// URIs require DNS SRV lookups. If your network blocks them, ' +
            'convert the URI to a direct seedlist (mongodb://...) in the .env file.' +
            ' Also ensure your Atlas IP allowlist includes your current IP.'
          : '';
      console.error(`MongoDB connection error (attempt ${attempt}/${MAX_RETRIES}): ${error.message}${hint}`);
      if (attempt >= MAX_RETRIES) {
        console.error('Exiting: could not connect to MongoDB.');
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
};

module.exports = connectDB;
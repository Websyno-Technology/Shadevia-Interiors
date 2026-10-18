const mongoose = require('mongoose');

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI is not configured. Add it to server/.env.');
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
};

module.exports = connectDatabase;

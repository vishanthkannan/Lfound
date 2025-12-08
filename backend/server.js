import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import lostRoutes from './routes/lostRoutes.js';
import foundRoutes from './routes/foundRoutes.js';
import matchesRoutes from './routes/matchesRoutes.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

console.log('Routes loaded:', { lostRoutes: !!lostRoutes, foundRoutes: !!foundRoutes, matchesRoutes: !!matchesRoutes, adminRoutes: !!adminRoutes });

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/lost', lostRoutes);
app.use('/api/found', foundRoutes);
app.use('/api/matches', matchesRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Debug: Test if routes are loaded
app.get('/api/test', (req, res) => {
  res.json({ message: 'Server is working', routes: ['lost', 'found', 'matches'] });
});

// Direct test of match endpoint
app.post('/api/match-test', async (req, res) => {
  try {
    res.json({ 
      success: true, 
      message: 'Direct match endpoint working',
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Test endpoints that don't require MongoDB
app.get('/api/lost', (req, res) => {
  res.json([]);
});

app.get('/api/found', (req, res) => {
  res.json([]);
});

app.post('/api/matches/match', (req, res) => {
  res.json({
    success: true,
    totalMatches: 0,
    matches: []
  });
});

const PORT = process.env.PORT || 3001;

// MongoDB connection configuration
// Supports both local MongoDB and MongoDB Atlas (cloud)
// For MongoDB Atlas: Use connection string from Atlas dashboard
// For local MongoDB: mongodb://localhost:27017/lostfound
// For MongoDB Compass: Use the same connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostfound';

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGO_URI.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')); // Hide credentials in logs

// MongoDB connection options (updated for Mongoose 8.x)
const mongooseOptions = {
  // These options are no longer needed in Mongoose 8.x but kept for compatibility
  // The new default behavior handles these automatically
};

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, mongooseOptions);
    console.log('✅ Connected to MongoDB successfully');
    console.log(`📊 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    
    // Start server after successful connection
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 API available at http://localhost:${PORT}/api`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    console.error('Full error:', err);
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure MongoDB is running (if using local MongoDB)');
    console.log('   2. Check your MONGO_URI in .env file');
    console.log('   3. For MongoDB Atlas: Verify your connection string and network access');
    console.log('   4. For MongoDB Compass: Use the same connection string\n');
    
    // Exit process if MongoDB connection fails (optional - remove if you want server to run without DB)
    process.exit(1);
  }
};

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err);
});

// Handle app termination
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('MongoDB connection closed due to app termination');
  process.exit(0);
});

// Connect to database
connectDB();
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

// Use a fallback MongoDB URI if not provided
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostfound';

console.log('Attempting to connect to MongoDB...');
console.log('MongoDB URI:', MONGO_URI);

mongoose
  .connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB successfully');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Starting server without MongoDB for testing...');
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (without MongoDB)`));
  });
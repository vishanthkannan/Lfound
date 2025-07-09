import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/lostfound';

async function createVishanthAdmin() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('Connected to MongoDB successfully');

    // Check if user already exists
    const existingUser = await User.findOne({ email: 'vishanthkannan777@gmail.com' });
    if (existingUser) {
      console.log('User already exists:', existingUser.email);
      console.log('Current role:', existingUser.role);
      
      // Update to admin if not already admin
      if (existingUser.role !== 'admin') {
        existingUser.role = 'admin';
        await existingUser.save();
        console.log('✅ User role updated to admin!');
      } else {
        console.log('✅ User is already an admin!');
      }
      
      console.log('User ID:', existingUser._id);
      process.exit(0);
    }

    // Create new admin user
    const hashedPassword = await bcrypt.hash('vinoo123', 12);
    
    const adminUser = new User({
      name: 'Vishanth Kannan',
      email: 'vishanthkannan777@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });

    await adminUser.save();
    
    console.log('✅ Admin user created successfully!');
    console.log('Email: vishanthkannan777@gmail.com');
    console.log('Password: vinoo123');
    console.log('Role: admin');
    console.log('User ID:', adminUser._id);

  } catch (error) {
    console.error('❌ Error creating admin user:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
}

createVishanthAdmin(); 
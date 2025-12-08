# MongoDB Setup Guide

This backend is configured to work with MongoDB. You can use either:
- **Local MongoDB** (installed on your computer)
- **MongoDB Atlas** (cloud database - recommended)
- **MongoDB Compass** (GUI tool to view and manage your database)

## Option 1: MongoDB Atlas (Cloud - Recommended)

1. **Create a MongoDB Atlas account** (free tier available):
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Sign up for a free account

2. **Create a cluster**:
   - Choose the free tier (M0)
   - Select your preferred cloud provider and region
   - Click "Create Cluster"

3. **Set up database access**:
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Create a username and password (save these!)
   - Set privileges to "Atlas admin" or "Read and write to any database"

4. **Configure network access**:
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your specific IP

5. **Get your connection string**:
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Replace `<database>` with your database name (e.g., `lostfound`)

6. **Set up environment variable**:
   - Create a `.env` file in the `backend` folder (if it doesn't exist)
   - Add your connection string:
     ```
     MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lostfound?retryWrites=true&w=majority
     ```

## Option 2: Local MongoDB

1. **Install MongoDB**:
   - Download from https://www.mongodb.com/try/download/community
   - Follow installation instructions for your OS
   - Start MongoDB service

2. **Connect using default settings**:
   - The backend will automatically use `mongodb://localhost:27017/lostfound`
   - No `.env` file needed for local setup

3. **Or customize in `.env`**:
   ```
   MONGO_URI=mongodb://localhost:27017/lostfound
   ```

## Using MongoDB Compass

MongoDB Compass is a GUI tool to view and manage your MongoDB database.

1. **Download MongoDB Compass**:
   - Go to https://www.mongodb.com/try/download/compass
   - Download and install

2. **Connect to your database**:
   - **For MongoDB Atlas**: Use the same connection string from Atlas dashboard
   - **For Local MongoDB**: Use `mongodb://localhost:27017/lostfound`
   - Paste the connection string in Compass and click "Connect"

3. **View your data**:
   - You'll see your databases and collections
   - Browse, query, and edit data visually

## Environment Variables

Create a `.env` file in the `backend` folder with:

```env
PORT=3001
MONGO_URI=your-mongodb-connection-string-here
JWT_SECRET=your-secret-key-here
```

## Testing the Connection

1. Start your backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. You should see:
   - ✅ Connected to MongoDB successfully
   - 📊 Database: lostfound
   - 🌐 Host: (your MongoDB host)

3. If you see errors, check:
   - MongoDB is running (for local setup)
   - Connection string is correct
   - Network access is configured (for Atlas)
   - Credentials are correct

## Troubleshooting

### Connection Errors

- **"MongoServerError: Authentication failed"**: Check your username and password
- **"MongoNetworkError"**: Check network access settings in Atlas or MongoDB service status
- **"ENOTFOUND"**: Check your connection string is correct

### For MongoDB Atlas

- Make sure your IP address is whitelisted in Network Access
- Verify your database user has the correct permissions
- Check that your cluster is running (not paused)

### For Local MongoDB

- Make sure MongoDB service is running
- Check if MongoDB is listening on port 27017
- Verify MongoDB installation is correct


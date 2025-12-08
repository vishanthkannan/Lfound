# Quick Start Guide - Lost & Found System

## 🚀 Getting Started in 5 Minutes

### Step 1: Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
npm install
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB**
1. Install MongoDB from https://www.mongodb.com/try/download/community
2. Start MongoDB service
3. No .env file needed (uses default: `mongodb://localhost:27017/lostfound`)

**Option B: MongoDB Atlas (Cloud)**
1. Create account at https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get connection string
4. Create `backend/.env` file:
```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lostfound
PORT=3001
JWT_SECRET=your-secret-key-here
```

### Step 3: Start Backend Server

```bash
cd backend
npm run dev
```

Server runs on: `http://localhost:3001`

### Step 4: Start Frontend Server

```bash
cd frontend
npm run dev
```

Frontend runs on: `http://localhost:5173` (or similar Vite port)

### Step 5: Access the Application

1. Open browser: `http://localhost:5173`
2. Click "Get Started" to sign up
3. Create an account
4. Start reporting lost/found items!

---

## 📋 Default Ports

- **Backend API**: `http://localhost:3001`
- **Frontend**: `http://localhost:5173` (Vite default)

---

## 🔑 Creating Admin User

To create an admin user, you can use the provided scripts:

```bash
cd backend
node create-admin.js
# OR
node create-vishanth-admin.js
```

Or manually update a user's role in MongoDB:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## ✅ Verify Installation

1. **Backend**: Check `http://localhost:3001/api/test`
   - Should return: `{ "message": "Server is working", ... }`

2. **Frontend**: Open `http://localhost:5173`
   - Should see homepage

3. **Database**: Check MongoDB connection
   - Backend logs should show: `✅ Connected to MongoDB successfully`

---

## 🐛 Troubleshooting

### Backend won't start
- Check if MongoDB is running (for local setup)
- Verify MONGO_URI in .env file
- Check if port 3001 is available

### Frontend won't start
- Check if port 5173 is available
- Try: `npm run dev -- --port 3000`

### Database connection errors
- Verify MongoDB is running
- Check connection string format
- For Atlas: Check network access settings

### Authentication issues
- Verify JWT_SECRET is set in .env
- Clear browser localStorage
- Try logging out and back in

---

## 📚 Next Steps

1. Read `PROJECT_DETAILS.md` for complete project documentation
2. Read `backend/MONGODB_SETUP.md` for MongoDB setup details
3. Explore the codebase structure
4. Start customizing for your needs!

---

**Happy Coding! 🎉**


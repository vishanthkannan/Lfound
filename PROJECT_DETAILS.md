# Lfound - Lost & Found Management System

## 📋 Project Overview

A full-stack web application for managing lost and found items, designed primarily for students and communities. The system automatically matches lost items with found items using intelligent matching algorithms and provides email notifications when matches are found.

---

##  Project Purpose

This system helps:
- **Students** report lost items (phones, books, ID cards, money, etc.)
- **Finders** report found items
- **Automatically match** lost and found items using smart algorithms
- **Notify users** via email when potential matches are found
- **Admins** manage the entire system through a dashboard

---

## 🏗️ Technology Stack

### Frontend
- **React 19.1.0** - UI library
- **React Router DOM 7.6.3** - Routing
- **Bootstrap 5.3.7** - CSS framework
- **Bootstrap Icons 1.13.1** - Icons
- **Vite 7.0.0** - Build tool
- **JavaScript (ES6+)** - Programming language

### Backend
- **Node.js** - Runtime environment
- **Express.js 5.1.0** - Web framework
- **MongoDB** - Database (via Mongoose 8.16.1)
- **Mongoose 8.16.1** - MongoDB ODM
- **JWT (jsonwebtoken 9.0.2)** - Authentication
- **bcryptjs 3.0.2** - Password hashing
- **Multer 2.0.1** - File upload handling
- **Nodemailer 7.0.4** - Email service
- **dotenv 17.0.1** - Environment variables
- **CORS 2.8.5** - Cross-origin resource sharing

---

## 📁 Project Structure

```
Vish-5/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── api/             # API service functions
│   │   │   └── auth.js     # Authentication API calls
│   │   ├── components/     # React components
│   │   │   ├── FoundForm.jsx      # Form to report found items
│   │   │   ├── LostForm.jsx       # Form to report lost items
│   │   │   ├── Login.jsx          # Login component
│   │   │   ├── Signup.jsx         # Signup component
│   │   │   ├── MatchList.jsx     # Display matched items
│   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   └── UserDropdown.jsx  # User menu dropdown
│   │   ├── pages/          # Page components
│   │   │   ├── HomePage.jsx       # Landing page
│   │   │   ├── LostPage.jsx       # Lost items page
│   │   │   ├── FoundPage.jsx      # Found items page
│   │   │   ├── AdminDashboard.jsx # Admin dashboard
│   │   │   ├── AdminPage.jsx      # Admin management page
│   │   │   ├── LoginPage.jsx      # Login page
│   │   │   └── SignupPage.jsx     # Signup page
│   │   ├── App.jsx         # Main app component with routing
│   │   └── main.jsx        # Entry point
│   ├── package.json
│   └── vite.config.js
│
└── backend/                 # Node.js/Express backend
    ├── models/             # MongoDB schemas
    │   ├── User.js         # User model
    │   ├── LostItem.js     # Lost item model
    │   ├── FoundItem.js    # Found item model
    │   └── Match.js        # Match model
    ├── routes/             # API routes
    │   ├── authRoutes.js   # Authentication routes
    │   ├── lostRoutes.js   # Lost items CRUD
    │   ├── foundRoutes.js  # Found items CRUD
    │   ├── matchesRoutes.js # Matching logic routes
    │   └── adminRoutes.js  # Admin routes
    ├── middleware/         # Express middleware
    │   └── auth.js         # JWT authentication middleware
    ├── services/           # Business logic services
    │   └── emailService.js # Email notification service
    ├── utils/              # Utility functions
    │   └── matchingLogic.js # Smart matching algorithm
    ├── config/             # Configuration files
    │   └── emailConfig.js  # Email configuration
    ├── uploads/            # Uploaded images storage
    ├── server.js           # Main server file
    └── package.json
```

---

## 🗄️ Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique, lowercase),
  password: String (required, min 6 chars, hashed),
  role: String (enum: 'user' | 'admin', default: 'user'),
  timestamps: true (createdAt, updatedAt)
}
```

### LostItem Model
```javascript
{
  customId: String (unique, auto-generated: LOST-0001, LOST-0002...),
  category: String (enum: 'Money', 'Electronics', 'Accessories', 'Books', 'ID Cards', 'Others'),
  itemName: String,
  otherName: String,
  brand: String,
  model: String,
  bookTitle: String,
  author: String,
  rollNumber: String,
  name: String,
  moneyDenominations: [{ denomination: String, count: Number }],
  totalAmount: Number,
  lostPlace: String (required),
  description: String,
  material: String,
  otherDescription: String,
  lostDateTime: Date (default: now),
  image: String (file path),
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### FoundItem Model
```javascript
{
  customId: String (unique, auto-generated: FOUND-0001, FOUND-0002...),
  category: String (enum: same as LostItem),
  itemName: String,
  brand: String,
  model: String,
  bookTitle: String,
  author: String,
  rollNumber: String,
  name: String,
  moneyDenominations: [{ denomination: String, count: Number }],
  totalAmount: Number,
  foundPlace: String (required),
  description: String,
  material: String,
  foundDateTime: Date (default: now),
  image: String (file path),
  createdBy: ObjectId (ref: User),
  timestamps: true
}
```

### Match Model
```javascript
{
  lostItemName: String,
  foundItemName: String,
  status: String
}
```

---

## 🔑 Key Features

### 1. User Authentication
- **Signup/Registration**: Users can create accounts with name, email, and password
- **Login**: JWT-based authentication
- **Password Security**: Passwords are hashed using bcryptjs
- **Role-based Access**: Users can be regular users or admins

### 2. Lost Items Management
- Report lost items with detailed information
- Support for 6 categories:
  - **Money**: Denominations, total amount
  - **Electronics**: Brand, model, item name
  - **Accessories**: Item name, description, material
  - **Books**: Title, author
  - **ID Cards**: Roll number, name
  - **Others**: Custom item name and description
- Upload images of lost items
- Auto-generated custom IDs (LOST-0001, LOST-0002...)
- Track location and date/time when item was lost

### 3. Found Items Management
- Report found items with similar details
- Same 6 categories as lost items
- Upload images of found items
- Auto-generated custom IDs (FOUND-0001, FOUND-0002...)
- Track location and date/time when item was found

### 4. Smart Matching System
The system uses intelligent algorithms to match lost and found items:

#### Matching Criteria by Category:

**Money:**
- Item name (10%)
- Money denominations (20%)
- Total amount (25%)
- Location match (20%)
- Date match (15%)
- Description (10%)

**Electronics:**
- Item name (30%)
- Brand (30%)
- Model (20%)
- Location & Date (20%)

**Accessories:**
- Item name (40%)
- Description (30%)
- Location & Date (30%)

**Books:**
- Book title (40%)
- Author (30%)
- Location & Date (30%)

**ID Cards:**
- Roll number (50%)
- Name (30%)
- Location (20%)

**Others:**
- Item name (40%)
- Description (30%)
- Location & Date (30%)

#### Match Classification:
- **Strong Match**: ≥80% similarity
- **Possible Match**: 60-79% similarity
- **Weak/No Match**: <60% similarity

### 5. Email Notifications
- Automatic email notifications when matches are found
- Notifies users about potential matches
- Configurable email service (Nodemailer)

### 6. Admin Dashboard
- View statistics:
  - Total lost items
  - Total found items
  - Total users
  - Items by category
- Manage users and items
- View recent activity
- Admin-only access control

### 7. Image Upload
- Multer middleware for handling file uploads
- Images stored in `backend/uploads/` directory
- Image validation (only image files allowed)
- Unique filenames to prevent conflicts

---

## 🚀 API Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Lost Items (`/api/lost`)
- `GET /api/lost` - Get all lost items (paginated)
- `POST /api/lost` - Create lost item (protected, requires auth)
- `GET /api/lost/:id` - Get specific lost item
- `PUT /api/lost/:id` - Update lost item (protected)
- `DELETE /api/lost/:id` - Delete lost item (protected)
- `GET /api/lost/user/:userId` - Get user's lost items

### Found Items (`/api/found`)
- `GET /api/found` - Get all found items (paginated)
- `POST /api/found` - Create found item (protected, requires auth)
- `GET /api/found/:id` - Get specific found item
- `PUT /api/found/:id` - Update found item (protected)
- `DELETE /api/found/:id` - Delete found item (protected)
- `GET /api/found/user/:userId` - Get user's found items

### Matching (`/api/matches`)
- `POST /api/matches/match` - Find matches for a lost item
- `GET /api/matches/test` - Test endpoint
- `POST /api/matches/test-matching` - Test matching logic

### Admin (`/api/admin`)
- `GET /api/admin/stats` - Get dashboard statistics (admin only)
- `GET /api/admin/users` - Get all users (admin only)
- `GET /api/admin/items` - Get all items (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `DELETE /api/admin/lost/:id` - Delete lost item (admin only)
- `DELETE /api/admin/found/:id` - Delete found item (admin only)

---

## 🔐 Security Features

1. **Password Hashing**: bcryptjs with salt rounds
2. **JWT Authentication**: Secure token-based authentication
3. **Protected Routes**: Middleware to protect sensitive endpoints
4. **Role-based Access**: Admin-only routes protected
5. **File Upload Validation**: Only image files allowed
6. **CORS**: Configured for cross-origin requests
7. **Environment Variables**: Sensitive data stored in .env

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
# Create .env file with:
# PORT=3001
# MONGO_URI=mongodb://localhost:27017/lostfound
# JWT_SECRET=your-secret-key
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### MongoDB Setup
- **Local**: Install MongoDB and start the service
- **Atlas**: Create account, get connection string, update MONGO_URI in .env
- See `backend/MONGODB_SETUP.md` for detailed instructions

---

## 🎨 Frontend Pages

1. **HomePage**: Landing page with hero section, features, and call-to-action
2. **LoginPage**: User login form
3. **SignupPage**: User registration form
4. **LostPage**: Form to report lost items + list of lost items
5. **FoundPage**: Form to report found items + list of found items
6. **AdminDashboard**: Statistics and management dashboard
7. **AdminPage**: Detailed admin management interface

---

## 🔄 User Flow

1. **New User**:
   - Visits homepage
   - Clicks "Get Started" → Signup
   - Creates account → Redirected to homepage
   - Can now report lost/found items

2. **Reporting Lost Item**:
   - User logs in
   - Navigates to "Lost" page
   - Fills form with item details (category-specific fields)
   - Uploads image (optional)
   - Submits → Item saved with custom ID

3. **Reporting Found Item**:
   - User logs in
   - Navigates to "Found" page
   - Fills form with item details
   - Uploads image (optional)
   - Submits → Item saved with custom ID

4. **Matching Process**:
   - When a found item is reported, system checks against all lost items
   - Matching algorithm calculates similarity percentage
   - If match ≥60%, email notification sent to lost item owner
   - User can view matches in MatchList component

5. **Admin**:
   - Admin logs in
   - Accesses admin dashboard
   - Views statistics and manages system

---

## 📧 Email Service

- Uses Nodemailer for sending emails
- Configured in `backend/config/emailConfig.js`
- Sends notifications when matches are found
- Requires email service credentials in .env

---

## 🛠️ Development Scripts

### Backend
- `npm run dev` - Start development server with nodemon

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

---

## 📝 Environment Variables

### Backend (.env)
```env
PORT=3001
MONGO_URI=mongodb://localhost:27017/lostfound
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/lostfound
JWT_SECRET=your-secret-key-change-this
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

## 🎯 Future Enhancements (Potential)

- Real-time notifications (WebSockets)
- Mobile app version
- Advanced search and filters
- Image recognition for automatic matching
- SMS notifications
- Social media integration
- Item verification system
- Reward system for finders
- Analytics and reporting
- Multi-language support

---

## 📄 License

ISC License

---

## 👥 Team

Built for Semester 5 project - Vish-5

---

## 📞 Support

For issues or questions, refer to:
- MongoDB Setup: `backend/MONGODB_SETUP.md`
- Project Details: `PROJECT_DETAILS.md` (this file)

---

**Last Updated**: December 2025


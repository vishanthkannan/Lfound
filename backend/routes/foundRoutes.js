import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import FoundItem from '../models/FoundItem.js';
import auth from '../middleware/auth.js';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// Get all found items
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const items = await FoundItem.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await FoundItem.countDocuments();

    res.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a new found item
router.post('/', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('Received form data:', req.body);
    console.log('Received file:', req.file);

    // Prepare item data
    const itemData = {
      category: req.body.category,
      itemName: req.body.itemName || '',
      brand: req.body.brand || '',
      bookTitle: req.body.bookTitle || '',
      author: req.body.author || '',
      rollNumber: req.body.rollNumber || '',
      name: req.body.name || '',
      material: req.body.material || '',
      description: req.body.description || '',
      foundPlace: req.body.foundPlace,
      foundDateTime: req.body.foundDateTime ? new Date(req.body.foundDateTime) : new Date(),
      image: req.file ? `/uploads/${req.file.filename}` : null,
      createdBy: req.user._id
    };

    // Handle money denominations if present
    if (req.body.moneyDenominations) {
      try {
        let denominations = JSON.parse(req.body.moneyDenominations);
        const validDenominations = ['₹2000','₹500','₹200','₹100','₹50','₹20','₹10','₹5','₹2','₹1'];
        denominations = denominations.filter(d => validDenominations.includes(d.denomination));
        itemData.moneyDenominations = denominations;
        itemData.totalAmount = req.body.totalAmount ? parseInt(req.body.totalAmount) : 0;
      } catch (err) {
        console.error('Error parsing money denominations:', err);
      }
    }

    console.log('Processed item data:', itemData);

    const item = new FoundItem(itemData);
    
    // Ensure customId is generated if middleware fails
    if (!item.customId) {
      const count = await FoundItem.countDocuments();
      item.customId = `FOUND-${String(count + 1).padStart(4, '0')}`;
    }
    
    await item.save();
    
    res.status(201).json(item);
  } catch (err) {
    console.error('Error saving found item:', err);
    res.status(400).json({ error: err.message });
  }
});

export default router;
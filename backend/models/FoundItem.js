import mongoose from 'mongoose';

const FoundItemSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    enum: ['Money', 'Electronics', 'Accessories', 'Books', 'ID Cards', 'Others'],
    required: true
  },
  itemName: {
    type: String,
    default: ''
  },
  brand: {
    type: String,
    default: ''
  },
  model: {
    type: String,
    default: ''
  },
  bookTitle: {
    type: String,
    default: ''
  },
  author: {
    type: String,
    default: ''
  },
  rollNumber: {
    type: String,
    default: ''
  },
  name: {
    type: String,
    default: ''
  },
  moneyDenominations: [{
    denomination: {
      type: String,
      required: true
    },
    count: {
      type: Number,
      required: true,
      min: 1
    }
  }],
  totalAmount: {
    type: Number,
    default: 0
  },
  foundPlace: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  material: {
    type: String,
    default: ''
  },
  foundDateTime: {
    type: Date,
    default: Date.now
  },
  image: {
    type: String,
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true // Adds createdAt and updatedAt fields
});

// Pre-save middleware to generate custom ID
FoundItemSchema.pre('save', async function(next) {
  try {
    if (!this.customId) {
      const count = await mongoose.model('FoundItem').countDocuments();
      this.customId = `FOUND-${String(count + 1).padStart(4, '0')}`;
    }
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('FoundItem', FoundItemSchema);
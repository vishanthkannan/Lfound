import express from 'express';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import User from '../models/User.js';
import auth from '../middleware/auth.js';
import { sendFoundItemNotification } from '../services/emailService.js';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Admin access required' 
      });
    }
    next();
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Server error' 
    });
  }
};

// Get dashboard statistics
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const [
      totalLostItems,
      totalFoundItems,
      totalUsers,
      lostItemsByCategory,
      foundItemsByCategory
    ] = await Promise.all([
      LostItem.countDocuments(),
      FoundItem.countDocuments(),
      User.countDocuments(),
      LostItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      FoundItem.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ])
    ]);

    // Get recent activity
    const recentLostItems = await LostItem.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    const recentFoundItems = await FoundItem.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('createdBy', 'name email');

    res.json({
      success: true,
      totalLostItems,
      totalFoundItems,
      totalUsers,
      totalMatches: 0, // Will be calculated when running matching algorithm
      lostItemsByCategory,
      foundItemsByCategory,
      recentLostItems,
      recentFoundItems,
      lastMatchingRun: new Date().toISOString(),
      emailNotificationsSent: 0, // This would be tracked in a separate collection
      highConfidenceMatches: 0 // Will be calculated when running matching algorithm
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch statistics' 
    });
  }
});

// Get all users
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch users' 
    });
  }
});

// Get all lost items
router.get('/lost-items', auth, requireAdmin, async (req, res) => {
  try {
    const items = await LostItem.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error fetching lost items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch lost items' 
    });
  }
});

// Get all found items
router.get('/found-items', auth, requireAdmin, async (req, res) => {
  try {
    const items = await FoundItem.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      items
    });
  } catch (error) {
    console.error('Error fetching found items:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch found items' 
    });
  }
});

// Delete a lost item
router.delete('/lost-items/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await LostItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({
      success: true,
      message: 'Lost item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting lost item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete item' 
    });
  }
});

// Delete a found item
router.delete('/found-items/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await FoundItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Item not found' 
      });
    }

    res.json({
      success: true,
      message: 'Found item deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting found item:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to delete item' 
    });
  }
});

// Update user role
router.patch('/users/:id/role', auth, requireAdmin, async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid role' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update user role' 
    });
  }
});

// Get item details by ID
router.get('/lost-items/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await LostItem.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Lost item not found' 
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error fetching lost item details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch item details' 
    });
  }
});

// Get found item details by ID
router.get('/found-items/:id', auth, requireAdmin, async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        message: 'Found item not found' 
      });
    }

    res.json({
      success: true,
      item
    });
  } catch (error) {
    console.error('Error fetching found item details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch item details' 
    });
  }
});

// Send manual email notification for a match
router.post('/send-email-notification', auth, requireAdmin, async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    
    if (!lostItemId || !foundItemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lost item ID and Found item ID are required' 
      });
    }

    const emailSent = await sendFoundItemNotification(lostItemId, foundItemId);
    
    if (emailSent) {
      res.json({
        success: true,
        message: 'Email notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email notification'
      });
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to send email notification' 
    });
  }
});

// Get match details between two items
router.post('/match-details', auth, requireAdmin, async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    
    if (!lostItemId || !foundItemId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Lost item ID and Found item ID are required' 
      });
    }

    const [lostItem, foundItem] = await Promise.all([
      LostItem.findById(lostItemId).populate('createdBy', 'name email'),
      FoundItem.findById(foundItemId).populate('createdBy', 'name email')
    ]);

    if (!lostItem || !foundItem) {
      return res.status(404).json({ 
        success: false, 
        message: 'One or both items not found' 
      });
    }

    // Import matching logic
    const { calculateMatchPercentage } = await import('../utils/matchingLogic.js');
    const matchResult = calculateMatchPercentage(lostItem, foundItem);

    res.json({
      success: true,
      lostItem,
      foundItem,
      matchResult
    });
  } catch (error) {
    console.error('Error getting match details:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to get match details' 
    });
  }
});

export default router; 
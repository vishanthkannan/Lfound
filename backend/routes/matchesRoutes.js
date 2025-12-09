import express from 'express';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import { calculateMatchPercentage } from '../utils/matchingLogic.js';
import { sendFoundItemNotification } from '../services/emailService.js';

const router = express.Router();

console.log('MatchesRoutes file loaded successfully');

// Simple test endpoint
router.get('/test', (req, res) => {
  console.log('GET /test endpoint called');
  res.json({ message: 'Matches route is working!' });
});

// Simple POST test endpoint
router.post('/simple-test', (req, res) => {
  console.log('POST /simple-test endpoint called');
  res.json({ 
    message: 'POST endpoint working!',
    timestamp: new Date().toISOString(),
    body: req.body
  });
});

// Test matching logic with sample data for different categories
router.post('/test-matching', (req, res) => {
  try {
    // Test Electronics category
    const sampleElectronicsLost = {
      category: 'Electronics',
      itemName: 'iPhone 13',
      brand: 'Apple',
      model: 'A2482',
      lostPlace: 'Library Building',
      lostDateTime: new Date('2024-01-15'),
      description: 'Black iPhone with cracked screen'
    };

    const sampleElectronicsFound = {
      category: 'Electronics',
      itemName: 'iPhone 13',
      brand: 'Apple',
      model: 'A2482',
      foundPlace: 'Library Building',
      foundDateTime: new Date('2024-01-15'),
      description: 'Black iPhone with cracked screen'
    };

    const electronicsMatch = calculateMatchPercentage(sampleElectronicsLost, sampleElectronicsFound);
    
    // Test Books category
    const sampleBooksLost = {
      category: 'Books',
      bookTitle: 'Data Structures and Algorithms',
      author: 'Thomas H. Cormen',
      lostPlace: 'Computer Science Department',
      lostDateTime: new Date('2024-01-10')
    };

    const sampleBooksFound = {
      category: 'Books',
      bookTitle: 'Data Structures and Algorithms',
      author: 'Thomas H. Cormen',
      foundPlace: 'Computer Science Department',
      foundDateTime: new Date('2024-01-10')
    };

    const booksMatch = calculateMatchPercentage(sampleBooksLost, sampleBooksFound);
    
    res.json({
      success: true,
      testResults: {
        electronics: {
          lostItem: sampleElectronicsLost,
          foundItem: sampleElectronicsFound,
          matchResult: electronicsMatch
        },
        books: {
          lostItem: sampleBooksLost,
          foundItem: sampleBooksFound,
          matchResult: booksMatch
        }
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Get matching results with email notifications
router.post('/match', async (req, res) => {
  try {
    console.log('POST /match endpoint called');
    
    // Test if models are working
    console.log('Testing LostItem model...');
    const lostItems = await LostItem.find();
    console.log('LostItem.find() completed');
    
    console.log('Testing FoundItem model...');
    const foundItems = await FoundItem.find();
    console.log('FoundItem.find() completed');
    
    console.log(`Found ${lostItems.length} lost items and ${foundItems.length} found items`);
    
    const matches = [];
    const emailNotifications = [];
    
    // Compare each lost item with each found item
    lostItems.forEach(lostItem => {
      foundItems.forEach(foundItem => {
        const matchResult = calculateMatchPercentage(lostItem, foundItem);
        
        if (matchResult.percentage > 0) {
          const matchData = {
            lostItem: {
              _id: lostItem._id,
              customId: lostItem.customId,
              category: lostItem.category,
              itemName: lostItem.itemName,
              bookTitle: lostItem.bookTitle,
              author: lostItem.author,
              brand: lostItem.brand,
              model: lostItem.model,
              rollNumber: lostItem.rollNumber,
              name: lostItem.name,
              lostPlace: lostItem.lostPlace,
              lostDateTime: lostItem.lostDateTime,
              moneyDenominations: lostItem.moneyDenominations,
              totalAmount: lostItem.totalAmount,
              description: lostItem.description
            },
            foundItem: {
              _id: foundItem._id,
              customId: foundItem.customId,
              category: foundItem.category,
              itemName: foundItem.itemName,
              bookTitle: foundItem.bookTitle,
              author: foundItem.author,
              brand: foundItem.brand,
              model: foundItem.model,
              rollNumber: foundItem.rollNumber,
              name: foundItem.name,
              foundPlace: foundItem.foundPlace,
              foundDateTime: foundItem.foundDateTime,
              moneyDenominations: foundItem.moneyDenominations,
              totalAmount: foundItem.totalAmount,
              description: foundItem.description
            },
            matchPercentage: matchResult.percentage,
            reasons: matchResult.reasons,
            classification: matchResult.classification
          };
          
          matches.push(matchData);
          
          // Queue email notification for high-confidence matches (>=70%)
          if (matchResult.percentage >= 70) {
            emailNotifications.push({
              lostItemId: lostItem._id,
              foundItemId: foundItem._id,
              matchPercentage: matchResult.percentage
            });
          }
        }
      });
    });

    // Sort by match percentage (highest first)
    matches.sort((a, b) => b.matchPercentage - a.matchPercentage);

    console.log(`Found ${matches.length} matches`);
    console.log(`High-confidence matches for email notification: ${emailNotifications.length}`);

    res.json({
      success: true,
      totalMatches: matches.length,
      highConfidenceMatches: emailNotifications.length,
      emailNotificationsSent: emailNotifications.length,
      matches: matches
    });

  } catch (err) {
    console.error('Error in matching:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
});

// Send email notification for a match
router.post('/send-email', async (req, res) => {
  try {
    const { lostItemId, foundItemId } = req.body;
    
    if (!lostItemId || !foundItemId) {
      return res.status(400).json({
        success: false,
        message: 'Lost item ID and Found item ID are required'
      });
    }

    console.log(`Sending email for match: LostItem ${lostItemId}, FoundItem ${foundItemId}`);

    // Try to send email using the email service
    const emailSent = await sendFoundItemNotification(lostItemId, foundItemId);
    
    if (emailSent) {
      res.json({
        success: true,
        message: 'Email notification sent successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to send email notification. Please check email configuration or ensure items have associated user emails.'
      });
    }
  } catch (error) {
    console.error('Error sending email notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email notification: ' + error.message
    });
  }
});

// Test email configuration
router.get('/test-email', async (req, res) => {
  try {
    const { testEmailConfig } = await import('../services/emailService.js');
    const isValid = await testEmailConfig();
    
    res.json({
      success: true,
      emailConfigValid: isValid,
      message: isValid ? 'Email configuration is valid' : 'Email configuration has issues'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
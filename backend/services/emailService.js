import nodemailer from 'nodemailer';
import User from '../models/User.js';
import LostItem from '../models/LostItem.js';
import FoundItem from '../models/FoundItem.js';
import emailConfig from '../config/emailConfig.js';

// Create transporter using config
const transporter = nodemailer.createTransport(emailConfig);

// Email template for found item notification
const createFoundItemEmail = (userName, lostItem, foundItem) => {
  const subject = `Lost Item Found: ${lostItem.itemName || lostItem.bookTitle || 'Your Item'}`;
  
  let itemDetails = '';
  let foundDetails = '';
  
  // Build item details based on category
  switch (lostItem.category) {
    case 'Money':
      itemDetails = `
• Category: Money
• Total Amount: ₹${lostItem.totalAmount}
• Denominations: ${lostItem.moneyDenominations?.map(d => `${d.count}×${d.denomination}`).join(', ') || 'Not specified'}
• Description: ${lostItem.description || 'Not provided'}`;
      break;
    case 'Electronics':
      itemDetails = `
• Category: Electronics
• Item Name: ${lostItem.itemName}
• Brand: ${lostItem.brand || 'Not specified'}
• Model: ${lostItem.model || 'Not specified'}
• Description: ${lostItem.description || 'Not provided'}`;
      break;
    case 'Books':
      itemDetails = `
• Category: Books
• Book Title: ${lostItem.bookTitle}
• Author: ${lostItem.author || 'Not specified'}
• Description: ${lostItem.description || 'Not provided'}`;
      break;
    case 'ID Cards':
      itemDetails = `
• Category: ID Card
• Name: ${lostItem.name}
• Roll Number: ${lostItem.rollNumber || 'Not specified'}
• Description: ${lostItem.description || 'Not provided'}`;
      break;
    default:
      itemDetails = `
• Category: ${lostItem.category}
• Item Name: ${lostItem.itemName || 'Not specified'}
• Description: ${lostItem.description || 'Not provided'}`;
  }
  
  // Build found details
  foundDetails = `
• Found at: ${foundItem.foundPlace}
• Date Found: ${new Date(foundItem.foundDateTime).toLocaleDateString()}
• Additional Notes: ${foundItem.description || 'No additional notes provided'}`;

  const body = `
Hi ${userName},

Good news! We have found an item that matches your lost ${lostItem.itemName || lostItem.bookTitle || 'item'}.

Here are the details provided by the finder:
------------------------------------------------
${itemDetails}
${foundDetails}
------------------------------------------------

Please visit the campus Lost & Found office or reply to this email if you'd like to claim your item.

Regards,  
Team Lfound
`;

  return { subject, body };
};

// Send email notification
export const sendFoundItemNotification = async (lostItemId, foundItemId) => {
  try {
    // Get the lost item with user details
    const lostItem = await LostItem.findById(lostItemId).populate('createdBy');
    const foundItem = await FoundItem.findById(foundItemId);
    
    if (!lostItem || !foundItem || !lostItem.createdBy) {
      console.error('Missing data for email notification');
      return false;
    }

    const { subject, body } = createFoundItemEmail(
      lostItem.createdBy.name,
      lostItem,
      foundItem
    );

    // Send email
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: lostItem.createdBy.email,
      subject: subject,
      text: body
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email notification sent successfully:', result.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Test email configuration
export const testEmailConfig = async () => {
  try {
    const testResult = await transporter.verify();
    console.log('Email configuration is valid:', testResult);
    return true;
  } catch (error) {
    console.error('Email configuration error:', error);
    return false;
  }
};

export default transporter; 
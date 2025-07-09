// Email Configuration
// To use email notifications, you need to:
// 1. Set up a Gmail account or other email service
// 2. Enable 2-factor authentication
// 3. Generate an app password
// 4. Update the values below

export default {
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: 'vishlee64@gmail.com',
    pass: 'kqhlyubmcmta hqfs'.replace(/ /g, '')
  }
};

// Instructions for Gmail setup:
// 1. Go to your Google Account settings
// 2. Enable 2-Step Verification
// 3. Go to Security > App passwords
// 4. Generate a new app password for "Mail"
// 5. Use that password in EMAIL_PASS

// For production, set these environment variables:
// EMAIL_USER=your-actual-email@gmail.com
// EMAIL_PASS=your-actual-app-password 
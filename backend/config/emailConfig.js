import dotenv from 'dotenv';

// Load environment variables immediately so email config picks them up
dotenv.config();

// Email Configuration
// To use email notifications, you need to:
// 1. Set up a Gmail account or other email service
// 2. Enable 2-factor authentication
// 3. Generate an app password
// 4. Update the .env values below

const defaultAuth = {
  user: 'vishlee64@gmail.com',
  pass: 'kqhlyubmcmta hqfs'.replace(/ /g, '')
};

// Helper to parse boolean-like env values
const parseBool = (value, fallback) => {
  if (value === undefined) return fallback;
  return ['true', '1', 'yes', 'y'].includes(String(value).toLowerCase());
};

const host = process.env.EMAIL_HOST || 'smtp.gmail.com';
const port = Number(process.env.EMAIL_PORT) || 465;
const secure = parseBool(process.env.EMAIL_SECURE, port === 465);
const user = process.env.EMAIL_USER || defaultAuth.user;
const pass = process.env.EMAIL_PASS || defaultAuth.pass;

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.warn('EMAIL_USER/EMAIL_PASS not set; using fallback credentials from emailConfig.js');
}

const emailConfig = {
  host,
  port,
  secure,
  auth: { user, pass }
};

export default emailConfig;

// Instructions for Gmail setup:
// 1. Go to your Google Account settings
// 2. Enable 2-Step Verification
// 3. Go to Security > App passwords
// 4. Generate a new app password for "Mail"
// 5. Use that password in EMAIL_PASS

// For production, set these environment variables:
// EMAIL_HOST=smtp.gmail.com
// EMAIL_PORT=465
// EMAIL_SECURE=true
// EMAIL_USER=your-actual-email@gmail.com
// EMAIL_PASS=your-actual-app-password
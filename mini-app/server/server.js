const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateLogin } = require('./middleware/validation');
const { authLimiter, apiLimiter } = require('./security/security');
const { errorMiddleware, ApiError } = require('./errorHandler');
const { createBackup } = require('./backup');

const app = express();
const DATA_FILE = path.join(__dirname, 'data.json');

// Initialize data
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [] }));
}

// Helper functions
const readData = () => JSON.parse(fs.readFileSync(DATA_FILE));
const writeData = (data) => fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));

const validateTelegramData = (initData) => {
  const botToken = process.env.BOT_TOKEN;
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  const dataCheckString = Array.from(params.entries())
    .filter(([key]) => key !== 'hash')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return calculatedHash === hash;
};

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
require('./security/security')(app);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self' https://telegram.org;");
  next();
});

// Routes
app.post('/api/login', authLimiter, validateLogin, async (req, res, next) => {
  try {
    if (!validateTelegramData(req.body.initData)) {
      throw new ApiError(401, 'Invalid Telegram data');
    }

    const params = new URLSearchParams(req.body.initData);
    const user = JSON.parse(params.get('user'));
    const data = readData();
    
    let userEntry = data.users.find(u => u.id === user.id);
    const isNewUser = !userEntry;

    // Calculate points based on account age
    const registeredAt = new Date(user.registered_at * 1000);
    const accountAgeDays = Math.floor((Date.now() - registeredAt) / (86400000));
    const initialPoints = Math.min(10000, Math.max(1000, accountAgeDays * 100));

    if (isNewUser) {
      userEntry = {
        ...user,
        points: initialPoints,
        referrals: [],
        lastLogin: new Date().toISOString(),
        loginStreak: 1,
        referralCode: crypto.randomBytes(4).toString('hex').toUpperCase(),
        wallet: null
      };
      data.users.push(userEntry);
    } else {
      // Handle daily login streak
      const lastLogin = new Date(userEntry.lastLogin);
      const today = new Date();
      const timeDiff = today - lastLogin;
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysDiff >= 1) {
        userEntry.loginStreak = daysDiff === 1 ? userEntry.loginStreak + 1 : 1;
        userEntry.points += userEntry.loginStreak <= 7 ? 100 : 50;
        userEntry.lastLogin = today.toISOString();
      }
    }

    writeData(data);

    const token = jwt.sign({
      id: user.id,
      username: user.username
    }, process.env.BOT_TOKEN, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user.id,
        points: userEntry.points,
        referralCode: userEntry.referralCode,
        loginStreak: userEntry.loginStreak
      }
    });

  } catch (err) {
    next(err);
  }
});

// Error handling
app.use(errorMiddleware);

// Server start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createBackup();
});
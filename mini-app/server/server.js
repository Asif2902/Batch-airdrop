const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { validateLogin, sanitizeInput } = require('./middleware/validation');
const { apiLimiter, authLimiter, csrfProtection } = require('./security/security');
const { errorMiddleware } = require('./errorHandler');
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

function validateTelegramData(initData) {
  const botToken = process.env.BOT_TOKEN;
  const dataCheckString = initData.split('&')
    .filter(pair => !pair.startsWith('hash='))
    .sort()
    .join('\n');
  
  const secretKey = crypto.createHash('sha256').update(botToken).digest();
  const hash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  return hash === initData.hash;
}

function calculateInitialPoints(user) {
  const regDate = new Date(user.registered_at * 1000);
  const ageDays = Math.floor((new Date() - regDate) / (86400 * 1000));
  return Math.min(10000, Math.max(1000, ageDays * 100));
}

// Middleware
app.use(bodyParser.json());
app.use(cors({ origin: true, credentials: true }));
require('./security/security')(app);

// Security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});

// Routes
app.post('/api/login', 
  authLimiter,
  validateLogin,
  sanitizeInput(['initData']),
  async (req, res, next) => {
    try {
      if (!validateTelegramData(req.body.initData)) {
        throw new ApiError(401, 'Invalid Telegram data');
      }
      
      const userData = parseInitData(req.body.initData);
      const data = readData();
      
      let user = data.users.find(u => u.id === userData.user.id);
      const isNewUser = !user;
      
      if (isNewUser) {
        user = {
          ...userData.user,
          points: calculateInitialPoints(userData.user),
          referrals: [],
          lastLogin: new Date().toISOString(),
          loginStreak: 1,
          joinedDate: new Date().toISOString(),
          wallet: null
        };
        data.users.push(user);
      } else {
        // Handle returning user login streak
        const lastLogin = new Date(user.lastLogin);
        const today = new Date();
        
        if (lastLogin.toDateString() !== today.toDateString()) {
          const dayDiff = Math.floor((today - lastLogin) / (1000 * 60 * 60 * 24));
          user.loginStreak = dayDiff === 1 ? user.loginStreak + 1 : 1;
          user.points += user.loginStreak <= 7 ? 100 : 50;
          user.lastLogin = today.toISOString();
        }
      }
      
      writeData(data);
      
      const token = jwt.sign({
        id: user.id,
        username: user.username
      }, process.env.BOT_TOKEN, {
        expiresIn: '7d'
      });
      
      res.json({ 
        token,
        user: {
          id: user.id,
          points: user.points,
          referralCode: user.referralCode,
          loginStreak: user.loginStreak
        }
      });
      
    } catch (err) {
      next(err);
    }
});

// Other endpoints...

// Error handling
app.use(errorMiddleware);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  createBackup();
});

// Helper function to parse Telegram initData
function parseInitData(initData) {
  const params = new URLSearchParams(initData);
  return {
    user: {
      id: params.get('user[id]'),
      first_name: params.get('user[first_name]'),
      last_name: params.get('user[last_name]'),
      username: params.get('user[username]'),
      registered_at: Math.floor(Date.now() / 1000)
    }
  };
}

class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}
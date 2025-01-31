const rateLimit = require('express-rate-limit');
const csrf = require('csurf');
const cookieParser = require('cookie-parser');

exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});

exports.authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts'
});

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production'
  }
});

module.exports = function(app) {
  app.use(cookieParser());
  app.use(csrfProtection);
  app.use((req, res, next) => {
    res.cookie('XSRF-TOKEN', req.csrfToken(), {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict'
    });
    next();
  });
};

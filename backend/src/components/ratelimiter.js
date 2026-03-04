const rateLimit = require('express-rate-limit');

const pingLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, 
    max: 5, 
    message: {
        status: 429,
        message: 'Too many requests from this IP, please try again after a minute'
    },
});

module.exports = pingLimiter;
const rateLimit = require('express-rate-limit');

const rateLimiterFunction = () => {
    return rateLimit({
        windowMs: 15 * 60 * 1000, // 15 min 
        max: 5,                   // 5 attempts
        message: {
            field: 'form', 
            message: 'Too many login attempts, try again later!'
        }
    });
};

module.exports = rateLimiterFunction;
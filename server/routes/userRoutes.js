const express = require('express');
const {registerUser, getUsers, loginUser, getMyProfile, verifyToken} = require('../controllers/userController');
// auth middlware import karna padega
const authMiddleware = require('../middleware/authMiddleware');

// data validation ke liye middleware function import karte hai 
const { registerValidation, loginValidation, validateErrors } = require('../middleware/authValidation');

const rateLimiterFunction = require('../middleware/rateLimiter');
const rateLimiter = rateLimiterFunction();

// create a router
const router = express.Router();

router.post('/register', registerValidation, validateErrors, registerUser);
router.post('/login', rateLimiter, loginValidation, validateErrors, loginUser);

router.get('/', getUsers);
router.get('/profile', authMiddleware, getMyProfile);

router.get('/verify', authMiddleware, verifyToken);

module.exports = router;
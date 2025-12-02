const express = require('express');
const {registerUser, getUsers, loginUser, getMyProfile} = require('../controllers/userController');
// auth middlware import karna padega
const authMiddleware = require('../middleware/authMiddleware');

// create a router
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/', getUsers);
router.get('/profile', authMiddleware, getMyProfile);

module.exports = router;
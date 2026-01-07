const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Database connection function import kiya
const connectDB = require("./config/database"); 

// Database connection called
connectDB();

// start the express app
const app = express();

app.set('trust proxy', 1);

// middlewares
app.use(cors());    // frontend-backend communication me frontend ko access dene ke liye
app.use(express.json());    // req.body me kaa JSON data handle karne ke liye

// user Routes ko import karo
const userRoutes = require('./routes/userRoutes');

// interview Routes ko import karo 
const interviewRoutes = require('./routes/interviewRoutes');

// Interview routes setup - all interview routes start with /api/interviews
app.use('/api/interviews', interviewRoutes);

// API Routes setup
app.use('/api/users', userRoutes);  // all user routes starts with /api/users

// Available routes display mein add karo
app.get('/', (req, res) => {
  res.json({ 
    message: 'AI Mock Interview Server',
    available_routes: [
      '/api/users/register',
      '/api/users/login', 
      '/api/interviews/test',
      '/api/interviews/create',
      '/api/interviews/user'
    ]
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

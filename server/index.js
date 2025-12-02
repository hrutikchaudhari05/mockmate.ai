const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require("./config/database"); // Database import kiya

// Database connection called
connectDB();

// start the express app
const app = express();

// middlewares
app.use(cors());    // frontend-backend communication me frontend ko access dene ke liye
app.use(express.json());    // req.body me kaa JSON data handle karne ke liye

// Routes ko import karo
const userRoutes = require('./routes/userRoutes');

// API Routes setup
app.use('/api/users', userRoutes);  // all user routes starts with /api/users



app.listen(process.env.PORT, () => {
    console.log(`Server chalu ho gya http://localhost:${process.env.PORT} par`);
});

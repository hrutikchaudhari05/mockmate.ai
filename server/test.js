// test.js (project root me banao)
require('dotenv').config();
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const timestamp = Math.round(Date.now() / 1000);
const params = { timestamp, folder: 'interview_audio' };

try {
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  console.log("SUCCESS! Signature:", signature.substring(0, 20) + "...");
} catch (error) {
  console.error("ERROR:", error.message);
  console.error("Stack:", error.stack);
}
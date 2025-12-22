const OpenAI = require('openai');

// initializing openai client 
const openai = new OpenAI({
    apiKey: process.env.OPENAI_MODEL_KEY,
});

module.exports = openai;

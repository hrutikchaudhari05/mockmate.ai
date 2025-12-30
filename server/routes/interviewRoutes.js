const express = require('express');
const router = express.Router();

// import middleware for protecting routes
const authMiddleware = require('../middleware/authMiddleware');

// import controller
const { createInterview, getUserInterviews, getInterviewById, beginInterview, getTranscript, submitAnswer, generateQuestionsH, evaluateInterview, getFeedback } = require('../controllers/interviewController');
const { generateAIQuestions } = require('../utils/generateQuestions');

// make all interview routes protected 
router.use(authMiddleware);

// create new interview 
router.post('/create', createInterview);
router.get('/interviews', getUserInterviews);
router.get('/:interviewId', getInterviewById);
router.post('/:interviewId/generate-questions', generateQuestionsH);
router.post('/:interviewId/begin', beginInterview);
router.post('/:interviewId/audio', getTranscript);
router.post('/:interviewId/submit', submitAnswer);
router.post('/:interviewId/evaluate', evaluateInterview);
// router.get('/:interviewId/feedback', getFeedback);

router.post('/test-upload', (req, res) => {
    console.log('Test - File received: ', req.file);
    res.send({ file: req.file ? 'OK' : 'MISSING' });
});

module.exports = router;







// testing route 
router.get('/test', (req, res) => {
    res.json({ 
        message: "Interview routes working!",
        userId: req.user.id 
    });
});

// testing routes ko middleware use ke pehle likha so tha ye muze access naa maage, 
router.post('/test-ai', async (req, res) => {
    try {
        const testData = {
            jobDescription: 'Machine Learning, Deep Learning, NLP, LLM, AI, JD - candidate must create an entire model and will be responsible for deploying it in production as well',
            title: "AI/ML Engineer", 
            type: 'technical',
            duration: 2700,
            experience: 'associate level (2-3 years of experience)',
            interviewContext: 'Focus on core fundamentals and problem solving in AI',
            targetCompanies: "Perplexity, OpenAI, Google"
        }

        const questions = await generateAIQuestions(testData);
        res.send({ questions });

    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


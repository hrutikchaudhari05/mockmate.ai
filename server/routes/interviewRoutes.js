const express = require('express');
const router = express.Router();

// import middleware for protecting routes
const authMiddleware = require('../middleware/authMiddleware');

// import controller
const { createInterview, getUserInterviews, getInterviewById, beginInterview, getTranscript, submitAnswer, generateQuestionsH, evaluateInterview, getFeedback, checkStatus, fixInterviewStatus } = require('../controllers/interviewController');
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
// router.post('/debug-status/:id', checkStatus);
// router.post('/:interviewId/fix-status', fixInterviewStatus);
// router.get('/:interviewId/feedback', getFeedback);

router.post('/test-upload', (req, res) => {
    console.log('Test - File received: ', req.file);
    res.send({ file: req.file ? 'OK' : 'MISSING' });
});

module.exports = router;


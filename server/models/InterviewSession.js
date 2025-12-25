const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    questionObj: {
        qtxt: { type: String, required: true },
        qd: { type: String, enum: ['easy', 'medium', 'hard', 'advanced'], required: true },
        et: { type: Number, required: true },
        wc: { type: Number, required: true },
        qtyp: { type: String, enum: ['conceptual', 'practical', 'scenario', 'real-world', 'deep-dive'], required: true }
    },

    answerText: { type: String },
    audioUrl: { type: String },
    transcript: { type: String },

    feedbackObj: {
        score: { type: Number, min: 0, max: 10 },
        summary: String,
        strengths: [String],
        improvementTips: [String],
        idealAnswer: String
    }
}, { _id: false });


const interviewSessionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,   // current logged-in user ka unique ID store karta
        ref: 'User',    // User model se connect karega 
        required: true  // mandatory because logged-in user kaa hee interview setup ho sakta hai, to user ka unique id to lagega
    }, 

    title: { type: String, required: true, trim: true },

    type: {
        type: String, 
        enum: ['tech', 'hr', 'managerial'],
        required: true
    },

    experience: {
        type: String,
        enum: ['intern', 'fresher', 'associate', 'mid', 'sr'],
        required: true
    },

    duration: { type: Number, required: true }, // seconds me store karenge

    jobDescription: { type: String, trim: true },
    targetCompanies: { type: String, trim: true },
    interviewContext: { type: String, trim: true },
    resumeUrl: { type: String, trim: true },

    status: {
        type: String,
        enum: ['setup', 'ongoing', 'completed', 'evaluated'],
        default: 'setup'
    },

    questions: [questionSchema],

    currentQuestionIndex: {
        type: Number,
        default: 0,
        min: 0
    },

    overallFeedback: {
        score: { type: Number, min: 0, max: 100 }, 
        summary: String,
        strengths: [String],
        improvementTips: [String],
        recommendation: {
            type: String,
            enum: ['strong fit', 'considerable fit', 'needs improvement', 'not recommended']
        }
    },

    feedbackGeneratedAt: { type: Date }
    

}, {timestamps: true});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
module.exports = InterviewSession;
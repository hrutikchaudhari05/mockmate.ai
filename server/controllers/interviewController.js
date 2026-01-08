const InterviewSession = require('../models/InterviewSession');
const { generateAIQuestions } = require('../utils/generateQuestions');
const { AssemblyAI } = require('assemblyai');
const { getOverallFeedback, getQuestionWiseFeedback, evaluateQuestions } = require('../utils/getFeedback');
const { calculateOverallScore, finalOverallScore } = require('../utils/calculateOverallScore');
const calculateAvgScore = require('../utils/calculateAvgScore');
const calculateAvgInterviewDuration = require('../utils/calculateAvgInterviewDuration');
const { getInterviewDates, getUniqueSortedDates } = require('../utils/getInterviewDates');
const calculateDailyStreak = require('../utils/calculateDailyStreak');



// interview se related controller iss file me save karenge 

// 1. Create new interview session controller
const createInterview = async (req, res) => {
    try {
        console.log('Creating new interview session...');

        // 1 - req se data lena padega
        const { title, type, experience, duration, jobDescription, targetCompanies, interviewContext } = req.body;

        // 2 - current logged-in user ki ID leni padegi (wo id middleware se milege because waha jwt authentication ke baad set kee hai - req.user = {id: decoded_id})
        const userId = req.user.id;

        // 3 - create new interiview document using InterviewSession model
        const newInterview = new InterviewSession({
            user: userId,
            title, 
            type, 
            experience,
            duration,
            jobDescription, 
            targetCompanies, 
            interviewContext,
            status: 'setup'
        });

        // 4 - save newInterview document into database
        await newInterview.save();

        res.status(201).send({
            message: "Interview session created successfully!",
            interview: {
                id: newInterview._id,       // NOTE: ye userId nhi hai, actually ye interviewId hai (jb koi interview session db me save hota hai to db ek _id banati hai exactly like it made for user, to wo ye id hai)
                title: newInterview.title,
                status: newInterview.status
            }
        });

    } catch (error) {
        console.error('Interview creation failed: ', error);
        res.status(500).send({ message: "Server error!" });
    }
}

// get all interviews of logged-in user 
const getUserInterviews = async (req, res) => {
    console.log("... get a list of user's interviews...")
    try {
        // first use find method
        const allInterviews = await InterviewSession.find({
            user: req.user.id
        }).sort({ createdAt: -1 }); // latest first

        // calculate average score
        const avgScore = allInterviews.length > 0 
            ? calculateAvgScore(allInterviews)
            : 0;

        // calculate average interview duration 
        const avgDuration = allInterviews.length > 0
            ? calculateAvgInterviewDuration(allInterviews)
            : 0;

        // calculate streak
        const interviewDates = getInterviewDates(allInterviews);
        const uniqueDates = getUniqueSortedDates(interviewDates);
        const streak = calculateDailyStreak(uniqueDates);

        // now send response
        res.status(200).send({
            count: allInterviews.length,
            avgScore: avgScore,
            avgDuration: avgDuration,
            streak: streak,
            allInterviews: allInterviews
        });

        console.log("Successfully got user interview list...")

    } catch (error) {
        res.status(500).send({ message: 'Server Error!' });
        console.log("Error in listing interviews list for a user...");
        console.log("Actual Error: ", error.message)
    }
}

// Get interview by interviewId - get a particular interview with the help of its interviewId and userId
const getInterviewById = async (req, res) => {
    try {

        console.log("Getting particular interview created by the user...")

        // req.params.id se interviewId milega
        const interview = await InterviewSession.findById(req.params.interviewId);
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }
        
        // Check if user owns this interview
        if (interview.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        res.status(200).send(interview);
        
    } catch (error) {
        res.status(500).send({ message: 'Server error' });
    }
};

// Generate AI Questions
// const generateQuestionsH = async (req, res) => {
//     try {

//         console.log("Inside generateQuestions API...");

//         // First check if interview exists and user owns it
//         const interviewCheck = await InterviewSession.findById(req.params.interviewId);
        
//         if (!interviewCheck) {
//             return res.status(404).json({ message: 'Interview not found' });
//         }

//         // Check if user owns this interview
//         if (interviewCheck.user.toString() !== req.user.id) {
//             return res.status(403).json({ message: 'Unauthorized' });
//         }

//         // agar questions already exist karte hai, to return them
//         if (interviewCheck.questions.length > 0) {
//             return res.status(200).send({
//                 message: "Questions already generated!",
//                 questions: interviewCheck.questions
//             });
//         }

//         // ab questions generate karo 
//         const generatedQuestions = await generateAIQuestions({
//             title: interviewCheck.title,
//             jobDescription: interviewCheck.jobDescription,
//             duration: interviewCheck.duration,
//             type: interviewCheck.type,
//             experience: interviewCheck.experience,
//             interviewContext: interviewCheck.interviewContext,
//             targetCompanies: interviewCheck.targetCompanies
//         });

//         // now map each question to our schema
//         interviewCheck.questions = generatedQuestions.map(q => ({
//             questionObj: {
//                 qtxt: q.qtxt,
//                 qd: q.qd,
//                 et: q.et,
//                 wc: q.wc,
//                 qtyp: q.qtyp
//             },
//             answerText: null,
//             audioUrl: null,
//             transcript: null,
//             score: null,
//             feedbackObj: {}
//         }));

        
//         // ab race condition ko prevent karne ke liye atomic update karna padega 
//         const updatedInterview = await InterviewSession.findByIdAndUpdate(
//             req.params.interviewId,
//             {
//                 $set: {
//                     questions: questionsArray,
//                     status: 'questions_generated'
//                 }
//             },
//             {
//                 new: true,
//                 runValidators: true
//             }
//         );

//         // console.log("AI Generated Questions: ", interview.questions.questionObj);
        
//         // // save the interview questions
//         // await interview.save();

//         res.status(200).send({ 
//             message: "Interview Questions generated successfully!",
//             questions: updatedInterview.questions
//         })

//     } catch (error) {
//         console.log("Error Occurred: ", error.message);
//         res.status(500).send({ message: "Server Error!", error: error.message});
//     }
// }

const generateQuestionsH = async (req, res) => {
    try {
        console.log("=== START generateQuestionsH ===");
        console.log("Interview ID:", req.params.interviewId);
        console.log("User ID:", req.user.id);

        // 1. Find interview
        const interview = await InterviewSession.findById(req.params.interviewId);
        
        if (!interview) {
            console.log("❌ Interview not found");
            return res.status(404).json({ 
                success: false,
                message: 'Interview not found' 
            });
        }

        console.log("✅ Interview found:", interview.title);

        // 2. Check authorization
        if (interview.user.toString() !== req.user.id) {
            console.log("❌ Unauthorized access");
            return res.status(403).json({ 
                success: false,
                message: 'Unauthorized' 
            });
        }

        console.log("✅ User authorized");

        // 3. Check if questions already exist
        if (interview.questions && interview.questions.length > 0) {
            console.log("✅ Questions already exist:", interview.questions.length);
            return res.status(200).send({
                success: true,
                message: "Questions already generated!",
                questions: interview.questions,
                status: interview.status
            });
        }

        console.log("📝 No existing questions, generating new ones...");

        // 4. Generate AI questions - FIXED: Pass as object, not individual parameters
        console.log("🤖 Calling generateAIQuestions...");
        const generatedQuestions = await generateAIQuestions({
            title: interview.title,
            jobDescription: interview.jobDescription,
            duration: interview.duration,
            type: interview.type,
            experience: interview.experience,
            interviewContext: interview.interviewContext,
            targetCompanies: interview.targetCompanies
        });

        console.log("✅ Generated", generatedQuestions.length, "questions");

        // 5. Create questions array - CORRECT VARIABLE NAME
        const questionsArray = generatedQuestions.map(q => ({
            questionObj: {
                qtxt: q.qtxt || "Question text",
                qd: q.qd || "medium",
                et: q.et || 120,
                wc: q.wc || 150,
                qtyp: q.qtyp || "behavioral"
            },
            answerText: null,
            audioUrl: null,
            transcript: null,
            score: null,
            feedbackObj: {}
        }));

        console.log("📊 Created questions array with", questionsArray.length, "items");

        // 6. Atomic update - USING CORRECT VARIABLE
        console.log("💾 Saving to database...");
        const updatedInterview = await InterviewSession.findByIdAndUpdate(
            req.params.interviewId,
            {
                $set: {
                    questions: questionsArray,  // ← NOW THIS IS CORRECT!
                    status: 'questions_generated'
                }
            },
            {
                new: true,
                runValidators: true
            }
        );

        console.log("✅ Database save successful");
        console.log("=== END generateQuestionsH ===");

        // 7. Return response
        res.status(200).send({ 
            success: true,
            message: "Interview Questions generated successfully!",
            questions: updatedInterview.questions,
            status: updatedInterview.status,
            count: updatedInterview.questions.length
        });

    } catch (error) {
        console.error("❌ ERROR in generateQuestionsH:");
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Full error:", error);
        
        // Check if it's an OpenAI error
        if (error.message.includes('OpenAI') || error.message.includes('API key')) {
            return res.status(500).send({ 
                success: false,
                message: "AI Service Error. Please check OpenAI API configuration.",
                error: error.message
            });
        }
        
        // Check if it's a JSON parsing error
        if (error.name === 'SyntaxError' && error.message.includes('JSON')) {
            return res.status(500).send({ 
                success: false,
                message: "Failed to parse AI response. Please try again.",
                error: "Invalid JSON from AI service"
            });
        }
        
        res.status(500).send({ 
            success: false,
            message: "Server Error!", 
            error: error.message
        });
    }
}

// Start interview (status change, currQueIndex change)
const beginInterview = async (req, res) => {
    try {
        // take the interview object from database , take intervieId from parameters
        const interview = await InterviewSession.findById(req.params.interviewId);
        console.log("Interview fetched from database: ", interview);

        // agar params se liye gayi interview id se koi interview agar present nhi hai db me to ...
        if (!interview) {
            return res.status(404).send({ message: "Interview not found!" });
        }

        // yaha pohoche means interview present hai, 
        // ab check karo, kya wo interview currently logged in user se belong karta hai, agar nhi to aage mt badho
        if (interview.user.toString() !== req.user.id) {
            return res.status(403).send({ message: "You are unauthorized!" })
        }

        // yaha pohoche matlab interview bhi present hai aur user bhi authorized hai (matlab interview user ne hee schedule kiya hai)
        // ab interview status update karenge
        interview.status = 'ongoing';

        // also currentQuestionIndex ko bhi '0' kr denge
        interview.currentQuestionIndex = 0;

        // ab humne db me se 2 fields change kee hai e.g. status and currentQuestionIndex 
        // to iss change ko db me save nhi to karna padega 
        await interview.save();

        // last me Frontend ko success response bhi bhej denge
        res.send({ 
            message: 'Interview Started!', 
            interview : {
                id: interview._id,
                status: interview.status,
                currentQuestionIndex: interview.currentQuestionIndex,
                totalQuestions: interview.questions.length
            } 
        });

    } catch (error) {
        res.status(500).send({ message: 'Server Error', error: error.message });
        console.log("Error starting interview: ", error.message);
    }
}


// Save audio locally and convert to transcribe 
const client = new AssemblyAI({
    apiKey: process.env.ASSEMBLYAI_API_KEY
});

const getTranscript = async (req, res) => {
    try {

        console.log("1. File received: ", req.file);
        console.log("2. API Key: ", process.env.ASSEMBLYAI_API_KEY);

        // 1 - first get cloudinary url and questionIndex
        const audioUrl = req.body.audioUrl; // Cloudinary URL 
        console.log('3. Audio URL: ', audioUrl);
        const questionIndex = req.body.questionIndex;   // frontend se aa rha hai, thunk bhej rha hai 


        // 2 - Transcribe 
        const transcript = await client.transcripts.transcribe({
            audio: audioUrl,
            speech_models: ['universal']
        });

        console.log("4. Transcript success: ", transcript.text?.slice(0, 20));

        // 3 - Save to database 
        const interview = await InterviewSession.findById(req.params.interviewId);
        
        interview.questions[questionIndex].audioUrl = audioUrl;
        interview.questions[questionIndex].transcript = transcript.text;
        interview.questions[questionIndex].answerText = transcript.text;

        await interview.save();

        // Return result
        res.send({
            success: true,
            transcript: transcript.text
        })
    } catch (error) {
        console.log("FULL ERROR: ", error);
        res.status(500).send({ error: error.message });
    }
};


// API to submit the answer
const submitAnswer = async (req, res) => {
    try {
        // 0 - Data Extraction
        // pehle req body se answerText and audioBlob le lo 
        const { answerText, audioUrl } = req.body;
        // ab params se interviewId lo 
        const interviewId = req.params.interviewId;
        // ab middleware se userId lo
        const userId = req.user.id;

        // 1 - get the interviewObject from backend 
        const interview = await InterviewSession.findOne({
            _id: interviewId,
            user: userId
        });

        if (!interview) {
            return res.status(404).send({ message: "Interview not found!" });
        }

        // Check if interview is ongoing
        if (interview.status !== 'ongoing') {
            return res.status(400).send({ 
                message: "Interview is not active!" 
            });
        }

        // 2 - Add answerText and audioBlob in interviewObject 
        const index = interview.currentQuestionIndex;

        // Validate index 
        if (index >= interview.questions.length) {
            return res.status(400).send({
                message: "All questions already answered!"
            });
        }


        interview.questions[index].answerText = answerText;
        interview.questions[index].audioUrl = audioUrl;   // later ye kaam baaki hai 

        // 3 - update the currenQuestionIndex  
        interview.currentQuestionIndex += 1;

        // 4 - Check karo - if the currentQuestion is the last question of the interview, if yes then make the status as completed and do evaluation work, 
        if (interview.currentQuestionIndex >= interview.questions.length) {
            console.log("Marking interview as completed!");
            interview.status = 'completed';
            interview.completedAt = new Date();
            // Evaluation and calculation work
        }

        // 5 - Save the changes in db
        await interview.save();

        // 6 - Send response to frontend
        res.send({
            message: 'Answer submitted!',
            nextQuestionIndex: interview.currentQuestionIndex,
            status: interview.status,
            isCompleted: interview.status === 'completed'
        });

    } catch (error) {
        console.log("Error in submitting answer: ", error.message);
        res.status(500).send({ message: "Server Error!", "Error: ": error.message });
    }
}

const evaluateInterview = async (req, res) => {
    try {
        const interview = await InterviewSession.findById(req.params.interviewId);

        if (!interview) {
            return res.status(404).json({ error: 'Interview not found' });
        }

        if (interview.user.toString() !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        

        // Check 1 - if interview is completed 
        if (interview.status !== 'completed') {
            return res.status(400).json({ 
                success: false,
                error: 'Interview must be completed first. Current status: ' + interview.status 
            });
        }

        // SECOND CHECK: If already evaluated, just return feedback
        if (interview.feedbackGeneratedAt) {
            return res.status(200).json({ 
                success: true,
                message: 'Feedback already generated',
                feedbackObj: {  // <-- Match frontend expectation
                    overall: interview.overallFeedback,
                    questions: interview.questions.map(q => ({
                        feedbackObj: q.feedbackObj
                    }))
                }
            });
        }

        // ab questionWise feedback generate karte hai, 
        console.log('Generating question wise feedback...');
        const generatedQuestionWiseFeedback = await evaluateQuestions(interview);
        console.log("Generated feedback structure: ", generatedQuestionWiseFeedback);

        // ab question wise feedback ko theek karte hai 
        interview.questions = interview.questions.map((q, i) => {
            const feedbackObj = generatedQuestionWiseFeedback?.questionWiseFeedback[i]?.feedbackObj;
            return {
                ...q._doc,  // other data in schema 
                feedbackObj: {
                    score: (feedbackObj?.score/10).toFixed(1),
                    summary: feedbackObj?.summary,
                    strengths: feedbackObj?.strengths,
                    improvementTips: feedbackObj?.improvementTips,
                    idealAnswer: feedbackObj?.idealAnswer
                } 
            };
        });

        // calculated the avg of all questions and converted it into percentages
        const avgScore = calculateOverallScore(interview);
        console.log("AVG Score: ", avgScore);

        // ab overfeedback generate karne kaa call karte hai 
        console.log("Generating overall feedback...");
        const overallFeedback = await getOverallFeedback(interview);
        console.log("AI Overall Score: ", overallFeedback.score);

        const overallScore = finalOverallScore(avgScore, overallFeedback.score);
        console.log("Final Overall Score: ", finalOverallScore);

        // now update the interview with this overall feedback
        interview.overallFeedback = {
            score: overallScore,
            summary: overallFeedback.summary,
            strengths: overallFeedback.strengths,
            improvementTips: overallFeedback.improvementTips, 
            recommendation: overallFeedback.recommendation.toLowerCase()
        };

        

        interview.feedbackGeneratedAt = new Date();
        interview.status = 'evaluated';


        await interview.save();

        res.json({
            success: true,
            message: "Evaluation completed successfully!",
            feedbackObj: {
                overall: interview.overallFeedback,
                questions: interview.questions.map(q => ({
                    feedbackObj: q.feedbackObj
                }))
            }
        });



    } catch (error) {
        console.error('Evaluation error: ', error);
        res.status(500).json({ error: error.message });
    }
};




module.exports = { createInterview, getUserInterviews, getInterviewById, generateQuestionsH, beginInterview, getTranscript, submitAnswer, evaluateInterview};

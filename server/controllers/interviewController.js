const InterviewSession = require('../models/InterviewSession');
const { generateAIQuestions } = require('../utils/generateQuestions');
const { AssemblyAI } = require('assemblyai');
const { getOverallFeedback, getQuestionWiseFeedback, evaluateQuestions } = require('../utils/getFeedback')



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

        // now send response
        res.status(200).send({
            count: allInterviews.length,
            allInterviews: allInterviews
        });

        console.log("Successfully got user interview list...")

    } catch (error) {
        res.status(500).send({ message: 'Server Error!' });
        console.log("Error in listing interviews list for a user...")
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
const generateQuestionsH = async (req, res) => {
    try {

        console.log("Inside generateQuestions API...");

        const interview = await InterviewSession.findById(req.params.interviewId);
        
        if (!interview) {
            return res.status(404).json({ message: 'Interview not found' });
        }

        // Check if user owns this interview
        if (interview.user.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // ab actually interviewQuestions generate karte hai 
        if (interview.questions.length === 0) {
            const generatedQuestions = await generateAIQuestions({
                title: interview.title,
                jobDescription: interview.jobDescription,
                duration: interview.duration,
                type: interview.type,
                experience: interview.experience,
                interviewContext: interview.interviewContext,
                targetCompanies: interview.targetCompanies
            });

            // now map each question to our schema
            interview.questions = generatedQuestions.map(q => ({
                questionObj: {
                    qtxt: q.qtxt,
                    qd: q.qd,
                    et: q.et,
                    wc: q.wc,
                    qtyp: q.qtyp
                },
                answerText: null,
                audioUrl: null,
                score: null,
                feedbackObj: {}
            }));
        }

        console.log("AI Generated Questions: ", interview.questions.questionObj);
        
        // save the interview questions
        await interview.save();

        res.status(200).send({ 
            message: "Interview Questions generated successfully!",
            questions: interview.questions
        })

    } catch (error) {
        console.log("Error Occurred: ", error.message);
        res.status(500).send({ message: "Server Error!", error: error.message});
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
        res.send({ message: 'Interview Started!', interview });

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

        // 1 - first get cloudinary url
        const audioUrl = req.body.audioUrl; // Cloudinary URL 
        console.log('3. Audio URL: ', audioUrl);

        // 2 - Transcribe 
        const transcript = await client.transcripts.transcribe({
            audio: audioUrl,
            speech_models: ['universal']
        });

        console.log("4. Transcript success: ", transcript.text?.slice(0, 20));

        // 3 - Save to database 
        const interview = await InterviewSession.findById(req.params.interviewId);
        const questionIndex = interview.currentQuestionIndex;

        interview.questions[questionIndex].audioUrl = audioUrl;
        interview.questions[questionIndex].transcript = transcript.text;

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

        // 2 - Add answerText and audioBlob in interviewObject 
        const index = interview.currentQuestionIndex;
        interview.questions[index].answerText = answerText;
        interview.questions[index].audioUrl = audioUrl;   // later ye kaam baaki hai 

        // 3 - update the currenQuestionIndex  
        interview.currentQuestionIndex += 1;

        // 4 - Check karo - if the currentQuestion is the last question of the interview, if yes then make the status as completed and do evaluation work, 
        if (interview.currentQuestionIndex >= interview.questions.length) {
            console.log("Marking interview as completed!");
            interview.status = 'completed';
            // Evaluation and calculation work
        }

        // 5 - Save the changes in db
        await interview.save();

        // 6 - Send response to frontend
        res.send({
            message: 'Answer submitted!',
            nextQuestionIndex: interview.currentQuestionIndex
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

        // Check if this interview is already evaluated
        if (interview.feedbackGeneratedAt) {
            return res.status(400).json({ error: 'Interview already evaluated' });
        }

        // Check if interview is completed 
        // if (interview.status !== 'completed') {
        //     return res.status(400).json({ error: 'Interview must be completed first' });
        // }

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
                    score: feedbackObj?.score,
                    summary: feedbackObj?.summary,
                    strengths: feedbackObj?.strengths,
                    improvementTips: feedbackObj?.improvementTips,
                    idealAnswer: feedbackObj?.idealAnswer
                } 
            };
        });

        // ab overfeedback generate karne kaa call karte hai 
        console.log("Generating overall feedback...");
        const overallFeedback = await getOverallFeedback(interview);

        // now update the interview with this overall feedback
        interview.overallFeedback = {
            score: overallFeedback.score,
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

// get evaluation result
// const getFeedback = async (req, res) => {
//     try {
//         // pehle interview ko le lo backend se 
//         const interview = await InterviewSession.findById(req.params.interviewId);

//         // check if interview is present or not 
//         if (!interview) {
//             return res.status(404).send({ error: 'Interview not found' });
//         }

//         // check if interview belongs to the user 
//         if (interview.user.toString() !== req.user.id) {
//             return res.status(403).send({ error: 'Unauthorized' });
//         }

//         // check if iterview is evaluated first or not 
//         if (!interview.feedbackGeneratedAt) {
//             return res.status(404).send({ error: 'Feedback not generated yet' });
//         }

//         // ab actual kaam chalu karte hai 
//         res.send({
//             success: true,
//             feedback: {
//                 overall: interview.overallFeedback,
//                 questions: interview.questions.map(q => ({
//                     feedback: q.feedbackObj
//                 })) 
//             }
//         });

//     } catch (error) {
//         return res.status(500).send({ error: error.message });
//     }
// }



module.exports = { createInterview, getUserInterviews, getInterviewById, generateQuestionsH, beginInterview, getTranscript, submitAnswer, evaluateInterview};

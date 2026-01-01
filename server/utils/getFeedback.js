const openai = require('../services/openaiService');

const getOverallFeedback = async (currentInterview) => {

    const questions = currentInterview.questions;
        const prompt = `
            You are an expert interviewer evaluating a mock interview for a ${currentInterview.experience} level ${currentInterview.type} role.
            
            JOB CONTEXT:
            - Job Description: ${currentInterview.jobDescription}
            - Target Companies: ${currentInterview.targetCompanies}
            - Additional Context: ${currentInterview.interviewContext}

            INTERVIEW PERFORMANCE SUMMARY:
            ${questions.map((q, i) => `
                Question ${i+1} (${q.questionObj.qd} ${q.questionObj.qtyp}):
                ${q.questionObj.qtxt} 
                Score: ${q.feedbackObj?.score} 
                Feedback: ${q.feedbackObj.summary}
                Answer: ${q.answerText || "No answer provided - score 0"}
            `).join('\n')}


            SCORING METRICS (Calculate 0-100 overall score):
            1. TECHNICAL COMPETENCY (x/40) - Based on individual question scores above
            2. ROLE ALIGNMENT (x/25) - Match with ${currentInterview.experience} level ${currentInterview.type} for ${currentInterview.title} requirements.
            3. COMMUNICATION & CLARITY (x/20) - Based on answer quality and structure
            4. COMPANY FIT (X/15) - Suitability for ${currentInterview.targetCompanies}

            EVALUATION CRITERIA:
            1. Technical accuracy and depth 
            2. Communication clarity
            3. Relevance to job requirements
            4. Problem-solving approach
            5. Areas of improvement

            SCORING RANGES (STRICTLY FOLLOW):
            - 0-40: "not recommended"
            - 41-60: "needs improvement" 
            - 61-80: "considerable fit"
            - 81-100: "strong fit"

            IF score is 0 -> ALWAYS return "not recommended"


            IMPORTANT RULES:
            1. If score > 30 -> MUST provide at least 1 strength
            2. Strength array cannot be empty if answer exists
            3. If no answer -> strength = [] (empty)
            4. If score < 80 -> MUST provide at least 1 improvement tip
            
            OUTPUT FORMAT (JSON only):
            {
                "score": 78,
                "summary": "Overall feedback summary in 5-8 sentences",
                "strengths": ["strength1", "strength2", ...],
                "improvementTips": ["area1", "area2", ...],
                "recommendation": "strong fit | considerable fit | needs improvement | not recommended"
            }

            Return ONLY valid JSON. No explanations.

        `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: prompt }],
            response_format: { type: 'json_object' }, 
            temperature: 0.6,
            max_tokens: 1000
        });

        const content = response.choices[0].message.content;
        const feedback = JSON.parse(content);

        return feedback;


    } catch (error) {
        console.log("Error in getting overall feedback: ", error.message);
        throw new Error("Failed to get the overall feedback");
    }

};


const getQuestionWiseFeedback = async (currentInterview, batchQuestions, startIndex) => {
    const questions = batchQuestions;


    const prompt = `
        You are evaluating individual questions from a ${currentInterview.experience} level ${currentInterview.type} interview.
        Give score to the question based on following factors: (first score each question out of 100 and then divide result by 10)
        1. correctness: x/25 
        2. coverage of imp points: x/15,
        3. reasoning/explanation: x/20,
        4. clarity: x/5,
        5. keywords: x/10,
        6. practicality: x/5,
        7. depth (number of words as compared to wc): x/20
        SCORING: Give score out of 100 (not 10)
        - Calculate based on 7 factors (total 100 points)

        JOB CONTEXT:
        - Role: ${currentInterview.title} ${currentInterview.type} 
        - Experience: ${currentInterview.experience}
        - Job Description: ${currentInterview.jobDescription}
        - Target Companies: ${currentInterview.targetCompanies}
        - Additional Context: ${currentInterview.interviewContext}

        EVALUATE EACH QUESTION:
        ${questions.map((q, i) => `
        QUESTION ${startIndex + i + 1}: (${q.questionObj.qd}, ${q.questionObj.qtyp}):
        ${q.questionObj.qtxt}

        CANDIDATE'S ANSWER:
        ${q.answerText || 'NO ANSWER PROVIDED - Score should be 0'}
        `).join('\n')}

        IMPORTANT: If answer is "NO ANSWER PROVIDED", give score 0.

        For EACH question, provide: NECESSARY if user deserves
        1. specific strengths (what they did well)
        2. improvement tips (what to work on)

        CORRECT EXAMPLE:
        {
            "score": 84,
            "strengths": ["Good coverage of key concepts", "Clear structure"],
            "improvementTips": ["Add more examples"]
        }

        WRONG EXAMPLE:
        {
            "score": 84,
            "strengths": [],  // ← NOT ALLOWED
        }

        STRICT: If score > 50, strengths array CANNOT be empty. Provide at least 1 specific strength.
        Example: score = 70 → strengths = ["Good technical accuracy", "Clear structure"]

        OUTPUT FORMAT STRICTLY (JSON only):
        {
            "questionWiseFeedback": [
                {
                    "feedbackObj": {
                        "score": 84,
                        "summary": "Brief evaluation summary in 3-4 lines",
                        "strength": ["strength1", "strength2"],
                        "improvementTips": ["tip1", "tip2"],
                        "idealAnswer": "What an ideal answer would include"
                    }
                }
            ]
        }

        IMPORTANT: 
        - Return EXACTLY this JSON structure
        - "questionWiseFeedback" array must have ${questions.length} items
        - Each item must contain "feedbackObj" object with all 5 fields 
        - No additional text outside JSON
    `;

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [{ role: "user", content: prompt }],
            response_format: { type: 'json_object' }, 
            temperature: 0.6,
            max_tokens: 3000
        });

        const content = response.choices[0].message.content;
        const feedback = JSON.parse(content);

        console.log('Returning: ', typeof feedback, Array.isArray(feedback), feedback);

        return feedback;

    } catch (error) {
        console.log("Error in getting question wise feedback: ", error.message);
        throw new Error("Failed to get the question wise feedback");
    }
}

// ab questionWise feedback ko batch me karte hai 
const evaluateQuestions = async (currentInterview) => {
    const MAX_PER_BATCH = 6;    // maximum 6 questions for evaluation 

    const questions = currentInterview.questions;

    if (questions.length <= MAX_PER_BATCH) {
        // ab total questions hee 6 yaa usase kam hai to ek baar me hee feedback generate karte hai, 
        return await getQuestionWiseFeedback(currentInterview, questions, 0);
    } else {
        // ab 6 se jyada questions hai to feedback batches me karte hain 
        const batches = [];
        for (let i = 0; i < questions.length; i += MAX_PER_BATCH) {
            const batchQuestions = questions.slice(i, i + MAX_PER_BATCH);
            const batchFeedback = await getQuestionWiseFeedback(currentInterview, batchQuestions, i);
            
            batches.push(batchFeedback.questionWiseFeedback);
        }

        // flatten the batches array 
        const flattened = batches.flat();

        return { questionWiseFeedback: flattened };
    }
};

module.exports = { getOverallFeedback, getQuestionWiseFeedback, evaluateQuestions };
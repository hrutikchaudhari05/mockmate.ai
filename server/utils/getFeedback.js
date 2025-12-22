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
                ${q.questionObj.qtxt} ${q.feedbackObj.score} ${q.feedbackObj.summary}
                Answer: ${q.answerText || "No answer provided - score 0"}
            `).join('\n')}

            - take avg of scores of all questions and add or remove numbers from that based on the interview data, and return final number.

            EVALUATION CRITERIA:
            1. Technical accuracy and depth 
            2. Communication clarity
            3. Relevance to job requirements
            4. Problem-solving approach
            5. Areas of improvement

            OUTPUT FORMAT (JSON only):
            {
                "score": 78,
                "summary": "Overall feedback summary in 4-5 sentences",
                "strengths": ["strength1", "strength2", ....],
                "improvements": ["area1", "area2", ...],
                "recommendation": "strong fit | considerable fit | underperformed | not recommended"
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
        - correctness: x/25 
        - coverage of imp points: x/15,
        - reasoning/explanation: x/20,
        - clarity: x/5,
        - keywords: x/10,
        - practicality: x/5,
        - depth (number of words as compared to wc): x/20
        - then calculate the total sum of marks got out of 10 in these 7 factors, and return the value

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

        OUTPUT FORMAT STRICTLY (JSON only):
        {
            "questionWiseFeedback": [
                {
                    "feedbackObj": {
                        "score": 84,
                        "summary": "Brief evaluation summary",
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
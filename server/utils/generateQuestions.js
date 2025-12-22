const getQuestionCount = require('./getQuestionCount');
const adjustTiming = require('./adjustTiming')
const openai = require('../services/openaiService')

// AI Question Generation
const generateAIQuestions = async (currentInterview) => {
    console.log('🤖 Generating AI questions...');

    const safeContext = currentInterview.interviewContext?.trim() || `Focus on core skills mentioned in the Job Description. Avoid unrelated technologies or fields.`

    const duration = currentInterview.duration;    
    
    // 1. user prompt with all context
    const userPrompt = `
        Generate exactly ${getQuestionCount(duration)} interview questions for a ${currentInterview.experience} candidate (${currentInterview.type} role).

        Target Duration: ${duration} seconds
        Job Description: ${currentInterview.jobDescription}
        Additional Context: ${safeContext}
        Target Companies: ${currentInterview.targetCompanies || "General"}

        TIME RULES:
        - easy:   et between 150 and 180 seconds
        - medium: et between 210 and 270 seconds
        - hard: et between 300 and 360 seconds
        - advanced:   et between 390 and 450 seconds
        - All et values must fall within their ranges
        - Total SUM(et) must satisfy the critical constraint
        - wc must be proportional to et and reasonable for the difficulty (larger et → larger wc)

        Output ONLY JSON array with these keys:
        [
            {
                "qtxt":"", 
                "qd":"easy|medium|hard|advanced", 
                "et":0, 
                "wc":0, 
                "qtyp":"conceptual|practical|scenario|real-world|deep-dive"
            }
        ]
    `;

    const systemPrompt = `
        You are an expert interviewer for the role specified by the user.

        HARD CONSTRAINTS (must always be satisfied):
        1. SUM(et) must be between ${duration - 100} and ${duration} seconds.
            - Undershooting or overshooting this range is strictly NOT allowed.
            - Adjust question difficulties to fit the range if needed.
        2. et values must fall within difficulty ranges:
        - easy: 150–180
        - medium: 210-270
        - hard: 300–360
        - advanced: 390–450
        3. Question count must be exactly ${getQuestionCount(duration)}
        4. Output ONLY a valid JSON array with exact keys.
        
        PRIORITY ORDER (strict):
        1. User's Additional Context (highest priority) and user prompt
        2. Job Description
        3. Candidate experience level
        4. Target companies
        5. Time fitting

        CONTENT RULES:
        - At least 3 questions must reflect Context or JD.
        - Include difficulty variety appropriate to experience.
        - Avoid duplicate themes or similar questions.
        - Include question type variety when possible.
        - Undershooting the minimum total time is NOT allowed.
        - Do not produce totals below the lower bound.
        - Always ask 1 hard/advanced question on data in user's additional context.

    
        If any constraint is violated, FIX it before producing the final output.
        Do not explain. Do not include extra text.
    `;


    // 2. API call logic
    try {
        // OpenAI call 
        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                {
                    role: "system",
                    content: systemPrompt
                },
                {
                    role: 'user',
                    content: userPrompt
                }
            ],
            temperature: 0.7,
            max_tokens: 900

        });

        // 3. Parse generated response 
        const content = response.choices[0].message.content;    // ye structure hota hai response kaa 
        const questions = JSON.parse(content);

        console.log(`Generated ${questions.length} questions.`);

        // now we will adjust the timing of questions
        const adjustedQuestions = adjustTiming(questions, duration);
        console.log(adjustedQuestions)

        return adjustedQuestions;

    } catch (error) {
        console.error('AI Question Generation Failed: ', error.message);
        throw new Error('Failed to generate questions.');
    }

};

module.exports = { generateAIQuestions };
import { uploadAudioToCloudinary } from '@/utils/cloudinaryUpload';
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

import { API } from '@/api/api.';

// imports for thunk and api calls
import axios from 'axios';

// get all interviews 
export const fetchAllInterviews = createAsyncThunk(
    'interview/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API}/api/interviews/interviews`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            return response.data;

        } catch (error) {
            console.log("InterviewSlice -> fetchAllInterview -> ", error.message);
            return rejectWithValue(error.response?.data?.message);
        }
    }
)

// ab thunk banate hai api call and redux + localstorage me data update karne ke liye (abhi tk manual action redux and localStorage me data save kr rhe the)
export const createInterview = createAsyncThunk(
    'interview/create', // Action type name
    async (formData, { rejectWithValue }) => {
        
        try {
            // API Call logic
            const response = await axios.post(
                `${API}/api/interviews/create`,  // ye url hum ne backend me banaya hai jo interview create karta hain and interviewSession model me currentInterview details store karta hai
                formData,   // jo data user ne fill kiya hai setup ke time 
                {
                    headers: {  // req ke headers me hum logged-in user ka token dete hai, actually humne token localStorage me store karke rakha hota hai already in extraReducer actions of auth thunk
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('API Response: ', response.data);
            return response.data;   // backend kaa data jo backend res.send kaa use karke bhejta hai

        } catch (error) {
            console.log('API Error: ', error.response?.data);
            // rejectWithValue automatically createInterview.rejected action trigger karega with error message.
            return rejectWithValue(error.response?.data?.message || "Failed");
        }
    }  
);


// getInterviewById
export const fetchInterviewById = createAsyncThunk(
    'interview/fetchById',
    async (interviewId, { rejectWithValue }) => {
        try {
            const response = await axios.get(
                `${API}/api/interviews/${interviewId}`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch current interview!');
        }
    }
);

// generateInterviewQuestions
export const generateQuestionsT = createAsyncThunk(
    'interview/generate-questions',
    async (interviewId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API}/api/interviews/${interviewId}/generate-questions`, {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            console.log('Token at generation time:', localStorage.getItem('token'));
            console.log('Full headers:', {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            });

            return response.data;

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to generate AI questions...!");
        }
    }
)

// beginInterview and start countdown
export const beginInterview = createAsyncThunk(
    'interview/begin',
    async (interviewId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API}/api/interviews/${interviewId}/begin`, {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            return response.data;

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Failed to Start the interview!");
        }
    }
)


// ye thunk transcript leke aata hai 
export const getTranscriptT = createAsyncThunk(
    'interview/getTranscript',
    async ({ interviewId, audioBlob, currQueIndex }, { rejectWithValue }) => {
        try {
            console.log("1. Audio Blob Received: ", {
                size: audioBlob?.size,
                type: audioBlob?.type,
                exists: !!audioBlob
            });

            // 1. pehle cloudinary pr upload karte hai, cloudinary pr blob upload karke url get karne ka fun maine already likha hai utils/cloudinaryUpload.js 
            const cloudinaryUrl = await uploadAudioToCloudinary(audioBlob);
            console.log("2. Cloudinary URL: ", cloudinaryUrl);

            // 2. Ab backend ko URL bhejte hai 
            console.log("3. Sending to backend: ", interviewId);
            
            // ab actual request karte hai 
            const response = await axios.post(
                `${API}/api/interviews/${interviewId}/audio`,
                {
                    audioUrl: cloudinaryUrl,
                    questionIndex: currQueIndex
                }, 
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    }
                }
            );

            console.log('4. Response received: ', response.status);
            // ab redux store me data store karte hai 
            return response.data;

        } catch (error) {
            console.log("5. Error occurred: ", error.response?.data || error.message);
            return rejectWithValue(error.response?.data?.message || "Failed to upload audio!");
        }
    }
);





// submitAnswer API
export const submitAnswer = createAsyncThunk(
    'interview/submitAnswer',
    async ({ interviewId, answerText, audioUrl }, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API}/api/interviews/${interviewId}/submit`,
                { answerText, audioUrl },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to submit answer');
        }
    }
);

// evaluate interview 
export const evaluateInverview = createAsyncThunk(
    'interview/evaluate',
    async (interviewId, { rejectWithValue }) => {
        try {
            const response = await axios.post(
                `${API}/api/interviews/${interviewId}/evaluate`, 
                {},
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            // Backend 200 return kr sakta hai with alreadyEvaluated flag 
            if (response.data.alreadyEvaluated) {
                console.log("Interview already evaluated");
            }

            return response.data;

        } catch (error) {
            console.error("Evaluate Error: ", error.response?.data);
            const errorMessage = error.response?.data?.error || 
                                error.response?.data?.message || 
                                "Failed to evaluate interview...";
            return rejectWithValue(errorMessage);
        }
    }
);




// initial state - interview ki current status
const initialState = {
    // stream 
    mediaStream: null,

    // single interview states
    interviewLoading: false,
    interviewError: null,
    currentInterview: null,

    // all interviews list 
    allInterviews: [], // getAllInterviews se aayega
    allInterviewsLoading: false,
    allInterviewsError: null,
    
    // Interview operations (create, start, submit)
    operationLoading: false,     // submitAnswer/beginInterview ke liye
    operationError: null,

    // Create Interview specific
    createdInterviewId: null,

    // Question generation states
    questionsLoading: false,
    questionsError: null,
    generatedQuestions: null,

    // Audio upload states
    audioUploading: false,
    audioUploadError: null,
    uploadedTranscript: null,

    // feedback states
    feedbackLoading: false,
    feedbackError: null

}

const interviewSlice = createSlice({
    name: 'interivew', 
    initialState,
    reducers: {

        setMediaStream: (state, action) => {
            state.mediaStream = action.payload;
        },

        clearMediaStream: (state) => {
            if (state.mediaStream) {
                state.mediaStream.getTracks().forEach(track => track.stop());
            }
            state.mediaStream = null;
        },

        clearCurrentInterview: (state) => {
            state.currentInterview = null;
            // Optional: Clear other states too
            state.mediaStream = null;
        },

    },
    extraReducers: (builder) => {
        builder

            // API 1 - fetchAllInterviews
            .addCase(fetchAllInterviews.pending, (state) => {
                state.allInterviewsLoading = true;
                state.allInterviewsError = null;
            })

            .addCase(fetchAllInterviews.fulfilled, (state, action) => {
                state.allInterviewsLoading = false;
                state.allInterviews = action.payload;
            })

            .addCase(fetchAllInterviews.rejected, (state, action) => {
                state.allInterviewsLoading = false;
                state.allInterviewsError = action.payload;
            })

            // API 2 - createInterview 
            .addCase(createInterview.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
                console.log('Interview creation started...');
            })

            .addCase(createInterview.fulfilled, (state, action) => {
                state.operationLoading = false;
                
                console.log('Interview Created: ', action.payload);
            })

            .addCase(createInterview.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
                console.log('Interview creation failed: ', action.payload);
            })

            // API 3 - fetchInterviewById
            .addCase(fetchInterviewById.pending, (state) => {
                state.interviewLoading = true;
                state.interviewError = null;
            }) 

            .addCase(fetchInterviewById.fulfilled, (state, action) => {
                state.interviewLoading = false;
                state.currentInterview = action.payload;
            })

            .addCase(fetchInterviewById.rejected, (state, action) => {
                state.interviewLoading = false;
                state.interviewError = action.payload;
            })

            // API 4 - beginInterview
            .addCase(beginInterview.pending, (state) => {
                state.interviewLoading = true;
                state.interviewError = null;
            })
            .addCase(beginInterview.fulfilled, (state, action) => {
                state.interviewLoading = false;
                state.currentInterview = action.payload.interview;
                state.interviewError = null;
            })
            .addCase(beginInterview.rejected, (state, action) => {
                state.interviewLoading = false;
                state.interviewError = action.payload;
            })

            // API 5 - submitAnswer
            .addCase(submitAnswer.pending, (state) => {
                state.operationLoading = true;
                state.operationError = null;
            })
            .addCase(submitAnswer.fulfilled, (state, action) => {
                state.operationLoading = false;
                state.operationError = null;
                
                // Update current interview with submitted answer
                if (state.currentInterview) {
                    const nextIndex = action.payload.nextQuestionIndex;
                    state.currentInterview.currentQuestionIndex = nextIndex;
                }
            })
            .addCase(submitAnswer.rejected, (state, action) => {
                state.operationLoading = false;
                state.operationError = action.payload;
            })
            
            // API 6 - generateQuestionsT
            .addCase(generateQuestionsT.pending, (state) => {
                state.questionsLoading = true;
                state.questionsError = null;
                state.generatedQuestions = null;
            })
            .addCase(generateQuestionsT.fulfilled, (state, action) => {
                state.questionsLoading = false;
                state.questionsError = null;
                // full questions array 
                state.generatedQuestions = action.payload.questions;
                
                if (state.currentInterview) {
                    state.currentInterview.questions = action.payload.questions;
                }
            })
            .addCase(generateQuestionsT.rejected, (state, action) => {
                state.questionsLoading = false;
                state.questionsError = action.error.message;
                state.generatedQuestions = null;
            })

            // API 7 - uploadConvertAudioT 
            .addCase(getTranscriptT.pending, (state) => {
                state.audioUploading = true;
                state.audioUploadError = null;
            })
            .addCase(getTranscriptT.fulfilled, (state, action) => {
                state.audioUploading = false;
                state.uploadedTranscript = action.payload.transcript;
                // ab currentInterview me bhi transcript add karte hai
                if (state.currentInterview) {
                    const idx = state.currentInterview.currentQuestionIndex;
                    if (state.currentInterview.questions[idx]) {
                        state.currentInterview.questions[idx].transcript = action.payload.transcript;
                    }
                }
            })
            .addCase(getTranscriptT.rejected, (state, action) => {
                state.audioUploading = false;
                state.audioUploadError = action.payload;
            })

            // API 8 - evaluate interview 
            .addCase(evaluateInverview.pending, (state) => {
                state.feedbackLoading = true;
                state.feedbackError = null;
            }) 
            .addCase(evaluateInverview.fulfilled, (state, action) => {
                state.feedbackLoading = false;
                state.feedbackError = null;
                // safe access to payload 
                if (action.payload && action.payload.interview) {
                    state.currentInterview = action.payload.interview;
                } else if (action.payload && action.payload.alreadyEvaluated) {
                    console.log("Interview already evaluated!");
                }
                state.currentInterview = action.payload.interview;
            }) 
            .addCase(evaluateInverview.rejected, (state, action) => {
                state.feedbackLoading = false;
                state.feedbackError = action.payload || 'Evaluation failed!';
                console.error("Evaluation rejected: ", action.payload);
            })

            // API 9 - get evaluation result
            
    }
});

export const { setMediaStream, clearMediaStream, endInterview, clearCurrentInterview } = interviewSlice.actions;
export default interviewSlice.reducer;
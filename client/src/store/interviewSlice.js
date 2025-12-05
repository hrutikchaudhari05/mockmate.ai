import { createSlice } from '@reduxjs/toolkit';

// initial state - interview ki current status
const initialState = {
    // this will store an object which contains everything about an interview, everything like, formData, Que arr, Ans arr, currQueIndex, and status: 
    currentInterview: JSON.parse(localStorage.getItem('mockmate_interview')),
}

const interviewSlice = createSlice({
    name: 'interivew', 
    initialState,
    reducers: {

        // actions
        createInterview: (state, action) => {
            
            state.currentInterview = action.payload;    // interviewSata store karo
            localStorage.setItem('mockmate_interview', JSON.stringify(action.payload)); // ab refresh pr bhi data rahega
            
        },

        endInterview: (state) => {
            console.log('Interview ended');
            state.currentInterview = null;
        },

        nextQuestion: (state) => {
            if (state.currentInterview) {
                state.currentInterview.currentQuestionIndex += 1;
                // localstorage me bhi update karna padega
                localStorage.setItem('mockmate_interview', JSON.stringify(state.currentInterview));
            }
        }

        

    }
});

export const { createInterview, endInterview, nextQuestion } = interviewSlice.actions;
export default interviewSlice.reducer;
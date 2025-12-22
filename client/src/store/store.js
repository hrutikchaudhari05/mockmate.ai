import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import interviewReducer from './interviewSlice';

const store = configureStore({
    reducer: {
        auth: authReducer,
        interview: interviewReducer
    },

    // devTools enable karna padega
    devTools: process.env.NODE_ENV !== 'production',
});

console.log("Store -> redux store created successfully!");
console.log('Store -> Token: ', localStorage.getItem('token'));

export default store;
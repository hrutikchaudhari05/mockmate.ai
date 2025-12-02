import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Login ke liye async thunk 
export const loginUser = createAsyncThunk(
    'auth/login',   // Action type - unique identifier

    async ({email, password}, {rejectWithValue}) => {

        // ye function automatically call hoga jb dispatch karenge

        try {

            // Axios se API call karte hai
            const response = await axios.post(
                'http://localhost:5000/api/users/login',    // API URL
                {email, password}                           // Data - automatically JSON bn jaata hai
            );

            // Axios automatically JSON parse karta hai 
            console.log('API Response:', response.data);
            return response.data;

        } catch (error) {
            console.log('API Error:', error.response?.data);
            return rejectWithValue(error.response?.data?.message || 'Network Error!');
        }
    }
);

// register ke liye asyncThunk
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData , {rejectWithValue}) => {
        try {
            const response = await axios.post('http://localhost:5000/api/users/register', userData);
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Registration Failed!");
        }
    }
) 

// initial state - user ki current status
const initialState = {
    isAuthenticated: true, // Batayega, user logged in hai yaa nhi
    user: null,             // User details (name, email)
    token: null,            // JWT Token
    isLoading: false,       // Loading State
    error: null             // Error message Store karega
}

// creating slice
const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        logout: (state) => {
            // yaha saara user data clean karenge
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = null;
        }
        
    },
    extraReducers: (builder) => {
        builder 
            // case 1 - login api call start hui 
            .addCase(loginUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
                console.log("Login api call started...")
            })
            // case 2 - login successful hua
            .addCase(loginUser.fulfilled, (state, action) => {
                state.isLoading = false;       // Loading band karo
                state.isAuthenticated = true;  // Auth status true karo
                state.user = action.payload.user;    // User data store karo
                state.token = action.payload.token;  // Token store karo
                state.error = null;            // Errors clear karo
                console.log('Login successful!');
            })
            // CASE 3: Login fail hua
            .addCase(loginUser.rejected, (state, action) => {
                state.isLoading = false;       // Loading band karo  
                state.error = action.payload;  // Error message store karo
                state.isAuthenticated = false; // Auth status false rahega
                console.log('Login failed:', action.payload);
            })
            // CASE 4: Register api call hui 
            .addCase(registerUser.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // CASE 5: Register successful hua 
            .addCase(registerUser.fulfilled, (state, action) => {
                state.isLoading = false;
                state.isAuthenticated = true;
                state.user = action.payload.user;
                state.token = action.payload.token;
                state.error = null;
            })
            // CASE 6: Register fail hua 
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
    }
});

// Export actions and reducer
export const { logout } = authSlice.actions;

export default authSlice.reducer;
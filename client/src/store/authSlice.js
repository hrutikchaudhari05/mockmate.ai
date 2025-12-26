import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';


// Login ke liye async thunk 
// Thunks backend calls handle karte hain aur Redux ko data dete hain.
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
            console.log('Thunk -> API Response:', response.data);

            return response.data;   // Frontend ko data mil jaayega, redux me store karenge

        } catch (error) {
            console.log('API Error:', error.response?.data);
            return rejectWithValue(
                error.response?.data || { message: 'Network Error!' }
            );
        }
    }
);

// register ke liye asyncThunk
export const registerUser = createAsyncThunk(
    'auth/register',
    async (userData , {rejectWithValue}) => {
        try {

            const response = await axios.post(
                'http://localhost:5000/api/users/register', 
                userData
            );

            return response.data;   // data redux me store karenge

        } catch (error) {
            return rejectWithValue(error.response?.data?.message || "Registration Failed!");
        }
    }
);

// Refresh pr Redux data clear ho jaata hai to user ko firse login karna padega, to prevent this hame Auto-Login enable karna padega...
/* 
    # Need: 
    1. User refresh kare -> Redux state clear ho jata hai 
    2. localStorage mein token hai but UI ko nhi pata 
    3. User manually firse login karega, but auto-login se better UX milega
    ## iski need simply ye hei ki, jb user login karta hai manually, tb token localStorage me save hota hai and redux me bhi hota hai, also redux me user ke state bhi save hoti hai as we get it from api response, to jb frontend pr refresh karta hai user tb redux se user info and token dono vanish ho jaate hai, to isko prevent karne ke liye, hum and verify user waali api banate hai jo user ko verify karti hai by tkaing the token from localStorage , aur wo api user Data and token bhi restore karti hai redux me
*/
// Token verify karne ka thunk
export const autoLogin = createAsyncThunk(
    'auth/autoLogin',     // Action type for redux
    async (_, { rejectWithValue }) => { // means no parameters are needed
        try {
            // 1 - localStorage me to token persist karta hai to bring it here
            const token = localStorage.getItem('token');

            // 2 - make api call 
            const response = await axios.get(
                'http://localhost:5000/api/users/verify', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            // backend se aaye huye res ko frontend ko de do 
            return response.data;

        } catch (error) {
            console.log("VerifyTokenTHUNK -> Error in verifying token: ", error.message);
            // if token invalid, usko localStorage se remove karo 
            localStorage.removeItem('token');
            // Send error to redux
            return rejectWithValue('Session expired!')
        }
    }
)


// initial state - user ki current status
const initialState = {
    isAuthenticated: false, // Batayega, user logged in hai yaa nhi
    user: null,             // User object (name, email, userId)
    token: null,            // JWT token for API calls
    isLoading: false,       // Loading Spinner ke liye
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
        },

        
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
                localStorage.setItem('token', action.payload.token);
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
                localStorage.setItem('token', action.payload.token);
            })
            // CASE 6: Register fail hua 
            .addCase(registerUser.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
            })
            // CASE 7: Auto-login trying
            .addCase(autoLogin.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            // CASE 8: Auto-login successful
            .addCase(autoLogin.fulfilled, (state, action) => {
                state.isLoading = false;
                state.error = null;
                state.isAuthenticated = true;
                state.token = action.payload.token;
                state.user = action.payload.user;
                console.log("Auto-login successful!");
            })
            // CASE 9: Auto-login fail hua 
            .addCase(autoLogin.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.payload;
                state.isAuthenticated = false;
                state.user = null;
                state.token = null;
                console.log('Auto-login failed!');
            })
            
    }
});

// Export actions and reducer
export const { logout } = authSlice.actions;

export default authSlice.reducer;
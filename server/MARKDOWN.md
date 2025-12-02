# MOCKMATE Project Server Logs

## Step 0 - Initial Backend Setup and installing required packages
- npm init -y --> ye package.json file create karne ke liye
- npm i express mongoose cors dotenv --> ye packages backend ke liye
- npm i bcryptjs jsonwebtoken --> ye packages security ke liye
- npm i -D nodemon --> only for development --> auto restart server
- Package.json me scripts add kiye
    - npm run dev --> Development mode (auto-restart)
    - npm start --> Production mode

## Step 1 - Server Setup
- index.js file banaya
- Express server create kiya
- CORS middleware add kiya (frontend ko permission dene ke liye)
- JSON parser(middleware) add kiya (req.body me jo data hai wo samajhne ke liye)
- .env file me PORT number daala
- Server start kiya defined PORT number pr

## Step 2 - Database Setup
- mongoDB atlas pr ek project banaya, cluster banaya, aur ek connection string banayi, aur wo string .env me paste kr dee
- uss string me connection parameters likhe --> 
    - mockmate --> hamara database name
    - retryWrites=true --> failed operations ko auto-retry karne ke liye
    - w=majority --> data reliability ke liye
- created config/database.js file --> DB connect karne ke liye separate file
- iss file me ek async function likha, usme mongoose use krke database connection logic likha with error handling, aur uss function ko export kiya

### Current Status
1. Backend Server running
2. MongoDB Atlas Connected
3. Environment Variables Setup

## Step 3 - Created User Model 
- created models/User.js file --> User data store karne kaa mongoose model
    - Fields: name, email, password
    - Validations: required fields, trimmed fields, unique email
    - Timestamps: auto-createdAt & updatedAt

## Step 4 - MVC Architecture
- new folder structure
    /models       - Database models (User ban gaya)
    /controllers  - Business logic (coming next)
    /routes       - API endpoints (coming next)  
    /middleware   - Auth & error handling (coming next)
    /config       - Already done (database.js)


## Step 5 - Created User Controller (controllers/userController.js)
1. registerUser() handler --> new user create karne kaa logic
    - email uniqueness checking

    - user ko successfully register karta hai
2. getUsers() handler --> Testing ke liye all users fetch karta hai

## Step 6 - User Routes (routes/userRoutes.js)
- import handlers
- create a router
- create routes
    1. POST /api/users/register - User registration endpoint
    2. GET /api/users - All users get karne ka endpoint
# Used Express Router for clear route management

## Step 7: Server Configuration Updated (index.js)
- Routes import and mount kiya /api/users path pe
- Available routes display kiya root endpoint pe

### Current MVC Flow
Request : Client Request -> Routes -> Controller -> Model -> Database
Response: Database -> Model -> Controller -> Routes -> Client Response

## Step 8: Password Encryption implemented in User.js file itself 
- password encryption works as a middleware before saving the user in the DB
- write it in User.js file itself
- Mongoose Middleware - Database operations se pehle automatically run hota hai
- pre('save') hook - Save operation se pehle encryption trigger karta hai
- bcrypt.genSalt() - Security salt generate karta hai (10 rounds)
- bcrypt.hash() - Password ko encrypted hash mein convert karta hai
- isModified() - Smartly check karta hai kya field actually change hua hai

* Ye middleware likhte time ek error muze baar baar pareshan kr rha thaa 
- Problem Solved:
- Error: next is not a function
- Cause: Latest Mongoose versions mein next parameter automatically handle hota hai
- Fix: next parameter remove kiya, direct return aur throw error use kiya

## Step 9: JWT Token System
- utils/generateToken.js file create ki
- jwt.sign() method se token generation implement kiya
- Token payload mein user ID store kiya
- expiresIn: '30d' set kiya - token 30 days tak valid rahega
- .env file mein JWT_SECRET_KEY add kiya
- User controller mein token generation integrate kiya
- Register API response mein token include kiya

# Current Status
1. Password encryption working automatically
2. JWT token generation successful
3. Secure user registration flow complete
4. Environment variables properly configured

# Current System Flow
User Registration → Password Encryption → Database Save → 
JWT Token Generation → Secure Response to Frontend

## Step 10: Login System Foundation
1. Login controller api banayi
2. Login route (POST /api/users/login) add kiye
3. ExistingUser check implement kiya
4. Simple error handling implement kiya

## Step 11: Password Verification & JWT Integration
1. userSchema.methods.matchPassword method define kiya
2. bcrypt.compare() se encrypted password verify kiya
3. Login successful hone pe JWT token generate kiya
4. Login response mein user details aur token include kiya
5. Method definition error fix kiya (export se pehle methods define karna)

### AUTHENTICATION SYSTEM fully working at this stage

### KEY ERRORS I FACED

1. next is not a function
--> Problem: Mongoose middleware (userSchema.pre()) me next undefined rehta thaa
--> Fix: mongoose ke latest version me 'next' parameter kee zaroorat nhi rehti, to usko remove kiye, ye version direct 'return' use karta hai

2. Password Encryption Trigger nhi ho rha thaa
--> Problem: User.create() se middleware nhi chal rha thaa
--> Fix: pehle newUser banaya, then newUser object pr .save() use kiya

## Now further we will create a middleware for auth just to protect the routes,
# Why do we have to protect the routes? 
1. Security - Sirf logged-in users hee interviews create kr sake
2. Privacy - hrr user apna data hee dekh sake
3. Authorization - Kon kya kr sakta hai

## Step 12: Auth Middleware Implementation (/middleware/authMiddleware.js)
- created middleware/authMiddleware.js file
- created simple middleware structure jo hrr req ko check karega
- created test protected route GET /api/users/profile
- Inside authMiddleware function
- req.header('Authorization') se token extract kiya
- token present hai yaa nhi and token "Bearer " start hota hai ya nhi check kiya
- new token banaya (removed "Bearer " from starting of token string)
- fir token verify kr ke user data to ek variable me save kiye, uske liye jwt.verify(token, secret_key) method use kiya
- verified token se user ID extract kiya
- req.user object mein user ID attach kiya, taki controllers ko pata ho kaun sa user request kr rha hai
- Jaise example: GET /api/users/profile - sirf authenticated users access kr sakte hain

# Middleware flow
client Request -> Auth Middleware -> Token Check -> If Valid -> Attach User to Request -> Controller -> If Invalid -> Return 401 Error


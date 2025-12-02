# MOCKMATE Frontend Setup Logs

## Step 1: React App Creation
1. Used Vite for faster development setup
2. Project initialized in /client folder
3. Basic React structure created

## Step 2: Package Installation
1. @reduxjs/toolkit & react-redux -> state management
2. react-router-dom -> Routing
3. lucide-react -> Icons
4. framer-motion -> Animations

## Step 3: Tailwind CSS v3 Setup
1. Installed Tailwind CSS v3.3.0 with correct PostCSS 8 compatibility
2. Created tailwind.config.js manually
3. Created postcss.config.js with proper export syntax
4. Added Tailwind directives to src/index.css
5. Fixed PostCSS plugin error by installing correct versions

## Step 4: Basic Setup Test
1. Tested Tailwind setup with basic styled component
2. Blue background with white text displayed successfully
3. Build system working properly with Vite

### A compatibily error occurred while setting up tailwindcss
# NOTE: as we are using shadcn/ui we need to use v3 version of tailwindcss as shadcn/ui is build to work with v3 of tailwindcss, ussase related error aaya thaa
1. Tailwind PostCSS Plugin Error
- Error: [postcss] It looks like you're trying to use tailwindcss directly as a PostCSS plugin
- Cause: Vite uses PostCSS 8, but Tailwind v3 needs specific setup
- Fix: 
- # Correct versions install karo
- npm install -D tailwindcss@^3.3.0 postcss@^8.4.0 autoprefixer@^10.4.0
- // postcss.config.js
export default {  // 'module.exports' ki jagah 'export default'
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}


## Step 5: Shadcn/ui Setup

1. Initial Setup Attempt
- Ran npx shacn-ui@latest init command
- Error: Package deprecated - 'shadcn-ui' package is deprecated
- Fix: Used new package name npx shadcn@latest init

2. Import Alias Error 
- Error: "No import alias found in your jsconfig.json file"
- Cause: Vite project needs import alias configuration
- Fix Steps: 
    a. created vite.config.js with path alias configuration
    b. jsconfig.json with path mapping
    c. added "@" alias pointing to ./src directory

3. Successful Shadcn Initialization
- Ran npx shadcn@latest init again
- Selected configuration: JS, Default, Neutral, src/index.css

4. Files Created
- components.json --> Shadcn configuration file
- Updated tailwind.config.js with Shadcn themes
- Updated src/index.css with css variables 

# Current Status
- Shadcn/ui successfully installed and configured
- Import alias setup completed (@ --> ./src)
- Tailwind config updated with Shadcn compatibility


## Step 6: Redux Store Setup
- Created store/store.js with basic configuration
- Added Provider in main.jsx to wrap the entire app
- Store successfully initialized and connected to React app

## Step 7: Auth Slice Implementation
- Created authSlice.js with initial state (user, token, isLoading)
- Added basic reducers (loginStart, loginSuccess, loginFailure)
- Integrated auth slice into main store
- Tested Redux actions with temporary button in App.jsx

## Step 8: Router Setup & Page Components
- Added BrowserRouter in main.jsx to enable routing
- Created Login and Register page components
- Implemented Routes in App.jsx for navigation

# Errors During Router Setup:
- Error: useNavigate() may be used only in the context of a <Router> component
- Cause: useNavigate used in Login component without Router wrapper
- Fix: Wrapped entire app with BrowserRouter in main.jsx instead of App.jsx

## Step 9: Login Page Development
- Built complete login form with email/password fields
- Integrated Shadcn Input and Button components
- Added Lucide React icons (Mail, Lock)
- Implemented form submission logic with API integration
- Added loading states and error handling

# Errors During Login Page Development:

- Error 1: White screen with only input field visible
- Cause: Incomplete form structure and empty elements
- Fix: Added proper form structure with all required elements and content

- Error 2: Icons not aligned properly with input fields
- Cause: Missing relative class on parent div
- Fix: Added className="relative" to icon container divs

- Error 3: Shadcn components import failing
- Cause: Using relative paths instead of alias
- Fix: Changed imports to use @/components/ui/ alias

## Step 10: Register Page Development
- Created registration form with name, email, password fields
- Added User icon from Lucide React
- Implemented form data handling with useState
- Connected to backend register API endpoint

# Errors During Register Page Development:
- Error 1: Input import error
- Cause: import {Input} from '@/components/ui/button' (wrong path)
- Fix: Corrected to import {Input} from '@/components/ui/input'

- Error 2: Form data not updating properly
- Cause: Input fields missing name attributes
- Fix: Added name="fieldname" to all input elements

- Error 3: Wrong link navigation
- Cause: <Link to="/register">Login</Link> (pointing to same page)
- Fix: Changed to <Link to="/login">Login</Link>

- Error 4: Password visible in plain text
- Cause: Using type="text" for password field
- Fix: Changed to type="password" for security

### Current Frontend Status:
- Authentication pages (Login/Register) fully functional
- Redux state management implementation
- Routing system working properly
- Shadcn UI components integrated 
- Backend API connectivity established

## Dashboard page
Header - welcome message
Stats Cards - 4 boxes with numbers 
Action Button - Kuchh text aur Start Interview button
Recent Table - Last 3 interviews

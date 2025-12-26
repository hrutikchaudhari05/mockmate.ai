const bcrypt = require('bcrypt');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');    // token generator function import kiya utils se
const { findOne } = require('../models/InterviewSession');

// register user api logic
const registerUser = async (req, res) => {
    try {
        // take info from req.body
        const {name, email, password} = req.body;
        console.log("Registration ke liye req se user data liya...")

        // check if that user is already present in the database or not (check for email as it is unique)
        const userExists = await User.findOne({email});
        if(userExists) {
            return res.status(400).send({message: 'User already exists with this email...'});
        } 

        // complete following steps as the user does not exist with current email
        // create new user
        const newUser = new User({
            name, email, password
        });
        console.log('New User object banaya...', newUser);

        // SAVE method ko call karo, yeh trigger karega pre('save') middleware
        await newUser.save();
        console.log("new User db me save kiya")

        // JWT token generate karo aur response me bhejo
        const token = generateToken(newUser._id);
        console.log("Token Generate Kiya: ", token);
        // after registeration automatically login hone ke liye yaha token generate ...

        // ab response send karenge frontend ko
        res.status(201).send({
            message: 'User registered successfully!',
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email
            },
            token: token    // Frontend ko token bhej rahe hain
        })

    } catch (error) {
        console.log('Registration error:', error.message);
        res.status(500).send({message: 'Server error'});
    }
};


// API for login
const loginUser = async (req, res) => {
    try {
        console.log("User login started...");

        const {email, password} = req.body;


        // check if user with this email already present or not, if not present tell the user to register first
        const existingUser = await User.findOne({email});

        if(!existingUser) {
            res.status(400).send({
                field: "email",
                message: "Invalid Email! Please Enter registered email!"
            });
        }

        // console.log('Direct password check...');
        // const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        // console.log("Direct check results:", isPasswordMatch);

        // now password verification
        const isPasswordMatch = await existingUser.matchPassword(password);
        // NOTE: this method is defined in the User.js file itself, it takes the password entered by user and compares it with the password in the database
        
        // if password does not match -> then return an error message
        if(!isPasswordMatch) {
            return res.status(400).send({
                field: "password",
                message: "Invalid Password! Please Enter valid password!"
            });
        }

        // JWT token generate karo aur response me bhejo
        const token = generateToken(existingUser._id);

        // send a response
        res.status(200).send({
            message: 'User Login successfully!',
            user: {
                id: existingUser._id,
                name: existingUser.name,
                email: existingUser.email
            },
            token: token    // Frontend ko token bhej rahe hain
        })


    } catch (error) {
        console.log("Login Failed! ", error.message);
        res.status(500).send({message: "Server Error"});
    }
}

// testing ke liye, all users kee list fetch karne ke liye
const getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.send(users);
    } catch (error) {
        res.status(500).send({message: 'Server Error'});
    }
};

// getting only logged-in users info
const getMyProfile = async (req, res) => {
    try {

        // first extract the user which is attached with req (middleware attaches the current logged in user to req)
        console.log("User ID from token: ", req.user.id);   // log the userId first

        const user = await User.findById(req.user.id).select('-password');
        // here I learnt something new
        // select method is used to select particular fields, such as _id, name, email, password
        // but when we use '-', it returns every field excluding which is mentioned in the select method with '-'
        // so this means, user will have a user object with all fields excluding password
        
        // log the current user in console
        console.log(user);

        // send user in response
        res.status(200).send({
            message: "Profile fetched successfully",
            user: user
        });

    } catch (error) {
        console.log("Profile Error: ", error.message);
        res.status(500).send({
            message: "Server Error"
        });
    }
}

// Auto login ke liye API 
const verifyToken = async (req, res) => {
    try {
        // NOTE: ye protected route waali api hai to middleware userId attach kr dega isko
        // 1 - pehle user data fetch karo backend se 
        const user = await User.findById(req.user.id).select('-password');

        // 2 - verify if user exist or not 
        if (!user) {
            return res.status(404).send({ message: 'User not found' });
        }

        // 3 - send response to frontend 
        res.status(200).send({
            message: "Token is valid!",
            user : {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token: req.header('Authorization').replace('Bearer ', '')
        });

    } catch (error) {
        console.log("verifyToken -> Error in verifying token", error.message);
        res.status(500).send({
            message: "Server Error!"
        });
    }
}

module.exports = {registerUser, getUsers, loginUser, getMyProfile, verifyToken};
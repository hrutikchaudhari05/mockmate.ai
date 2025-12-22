const mongoose = require("mongoose");
const bcrypt = require('bcrypt'); // for 

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    }, 
    email: {
        type: String, 
        required: true,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true    // automatically, createdAt & updatedAt fields bn jaayenge
});

// ye function automatically password encrypt karega save karne se pehle
// 1. .pre(event, handler) is a hook, ye db me save karne se pehle automatically run hota hai
// 2. save -> ye ek event hai
// NOTE: Ye ek middleware hai, isiliye ye Save operation se pehle run hota hai
userSchema.pre('save', async function() {
    console.log('Password encrypt ho rha hai...');

    // agar password modify nhi hua to encrypt mt karo
    if(!this.isModified('password')) {  // isModified is an inbuilt mongoose function
        return;
    }

    try {
        // Salt generate kiya (10 rounds - security level)
        const salt = await bcrypt.genSalt(10);
        // ab password hash karo
        this.password = await bcrypt.hash(this.password, salt);
        console.log('Password encrypted successfully');
    } catch (error) {
        console.log('Encryption error:', error);
        throw error;
    }
});

// upar kaa middleware code karne ke baad testing me muze ek error aa rha thaa (next is not a function)
// fir muze pata chala kee, mongoose ke updated version me next() automatically handle kiya jaata hai to...
// maine fir next() function call remove kr diya, and usko parameter se bhi remove kr diya

// NOTE: Mongoose methods export se PEHLE define karne hote hain! 

// these are called Schema Methods, hum ye methods controller me bhi bana sakte lekin firr hame hrr baar function me user object pass karna padega, isiliye hum iss type kee methods ko Model File me hee define karte hai
// Password Compare karne kaa method
// hame isse normal method kee tarah export nhi karna hota, jb hum model export karte hai uske saath ye method bhi bound hota hai
userSchema.methods.matchPassword = async function(enteredPassword) {
    // he method ke zaroorat sirf login api me hai
    // ye method user object ke saath chalega like --> existingUser.matchPassword(password)
    try {
        console.log("Comparing Passwords...");

        // bcrypt ke method se check karo password ko
        const isPassMatch = await bcrypt.compare(enteredPassword, this.password);
        // it will return a boolean value
        console.log("isPassMatch: ", isPassMatch);

        return isPassMatch;
    } catch (error) {
        console.log("password compare error: ", error);
        return false;
    }
}

const User = mongoose.model("User", userSchema);
module.exports = User;
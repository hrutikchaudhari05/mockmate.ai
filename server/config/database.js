const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        // connect atlas db
        const conn = await mongoose.connect(process.env.MONGO_URL);

        // Success message for console
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database Name: ${conn.connection.name}`);

    } catch (error) {
        console.log(`Connection failed... due to... ${error.message}`)
    }
}

module.exports = connectDB;
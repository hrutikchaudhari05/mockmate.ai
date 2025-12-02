const jwt = require('jsonwebtoken');

// Token generate karne waala simple function
const generateToken = (userId) => {

    // payload (data) + secret key + options
    const token = jwt.sign(
        {id : userId},              // payload - user kee identity
        process.env.JWT_SECRET_KEY, // secret key (.env me hai)
        {expiresIn : '30d'}         // token 30 days tk valid rahega
    );

    console.log('JWT token generated for user: ', userId);
    return token;
}

module.exports = generateToken;

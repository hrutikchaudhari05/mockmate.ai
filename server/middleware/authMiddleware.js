// Ye file routes ko protect karegi
const jwt = require('jsonwebtoken');

// ye function, header se token leta hai, 
const authMiddleware = async (req, res, next) => {

    // 1: header se token lena padega
    const token = req.header('Authorization');
    console.log('Token received: ', token ? 'yes' : 'no');

    // 2: check karo token hai yaa nhi
    if (!token || !token.startsWith('Bearer ')) {
        return res.status(401).send({
            message: 'Access denied. Please login again..!'
        });
    }
    
    try {
        // 3: remove "Bearer " from token
        const actualToken = token.replace('Bearer ', '');

        // 4: ab token verify karo, ye method internally sirf signature create karta hai aur usse compare karta hai
        const decoded = jwt.verify(actualToken, process.env.JWT_SECRET_KEY);
        // decoded contains the exact same data that we provided while creating a token in token Generation function
        // matlab hum wo data access kr sakte hai, jaise kee --> decoded.id 
        console.log('Token valid for user: ', decoded.id);

        // 5: IMP - user id ko req me attach karna padega
        // this step is imp because ab tk, controller ko nhi pata konsa user hai, to iss tarike se hum controller ke paas user info share krte hai
        req.user = {id: decoded.id};
        console.log("User attached to request");

        next();

    } catch (error) {
        console.log("Token invalid:", error.message);
        return res.status(401).send({
            message: "Invalid Token"
        });
    }

};

module.exports = authMiddleware;
// auth data validation ke liye hai ye function 



// validator ko import karta hoo
const { body, validationResult } = require('express-validator');

// pehle ek validate middleware banate hai, jo kee errors ko return karega or control next() pr dega 
const validateErrors = (req, res, next) => {
    const errors = validationResult(req);   // collect all errors
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,                 // standard flag
            message: 'Validation failed!',  // form-level msg
            errors: errors.array()          // field-level errors 
        });
    }
    next();
};


// register validation rules 
const registerValidation = [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long!'),
    body('email').trim().isEmail().withMessage('Invalid Email!'),
    body('password').trim().isStrongPassword().withMessage('Weak Password!'),
];


// login ke liye validation rules
const loginValidation = [
    body('email').trim().isEmail().withMessage('Invalid Email!'),
    body('password').trim().notEmpty().withMessage('Password Required!')
]


module.exports = { registerValidation, loginValidation, validateErrors };
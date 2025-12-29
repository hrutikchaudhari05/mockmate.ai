
// register ke liye data validation function 
export const validateRegisterData = ({name, email, password}) => {

    // empty errors object 
    const errors = {};

    if (name && name.trim().length < 2) {
        errors.name = 'Name must be at least of 2 characters'
    } else if (!name) {
        errors.name = "Name is required!"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (email && !emailRegex.test(email.trim())) {
        errors.email = "INVALID EMAIL! Please enter valid email..."
    }

    if (!email) {
        errors.email = "Email is required!"
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;

    if (!password) errors.password = 'Password is required!'

    if (password && !passwordRegex.test(password.trim())) {
        errors.password = "INVALID PASSWORD! Password must include uppercase, lowercase, number, and special character.";
    }
    
    return errors;
} 

// login ke liye data validation function
export const validateLoginData = ({ email, password }) => {
    const errors = {};
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
        errors.email = "Email is required";
    } else if (!emailRegex.test(email.trim())) {
        errors.email = "Please enter a valid email";
    }
    
    if (!password.trim()) {
        errors.password = "Password is required";
    }

    return errors;
};

// setup form ke liye data validation function 
export const validateSetup = (formData) => {

    const requiredFields = [
        'title',
        'type',
        'experience',
        'duration',
        'jobDescription',
        'targetCompanies',
        'interviewContext'
    ];

    const emptyFields = {};

    requiredFields.forEach((field) => {
        if (!formData[field] || !formData[field].toString().trim()) {
            emptyFields[field] = true;
        }
    });

    const firstErrorField = Object.keys(emptyFields)[0] || null;

    return {
        hasError: Object.keys(emptyFields).length > 0,
        emptyFields,
        firstError: firstErrorField
    };
    
};

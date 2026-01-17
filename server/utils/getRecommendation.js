// const getRecommendation = (score) => {
//     let recommendation = 'not recommended';

//     if (score >= 41 && score <= 60) {
//         recommendation = 'needs improvement';
//     } else if (score >= 61 && score <= 80) {
//         recommendation = 'considerable fit';
//     } else {
//         recommendation = 'strong fit';
//     }

//     return recommendation;

// }

const getRecommendation = (score) => {
    
    if (score <= 40) return "not recommended";
    if (score <= 60) return "needs improvement";
    if (score <= 80) return "considerable fit";
    return "strong fit";
};

module.exports = getRecommendation;

/**
    - 0-40: "not recommended"
    - 41-60: "needs improvement" 
    - 61-80: "considerable fit"
    - 81-100: "strong fit"
 */
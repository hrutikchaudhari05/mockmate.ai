const getRecommendation = (score) => {
    let recommendation = 'not recommended';

    if (score >= 41 && score <= 60) {
        recommendation = 'needs improvement';
    } else if (score >= 61 && score <= 80) {
        recommendation = 'considerable fit';
    } else {
        recommendation = 'strong fit';
    }

    return recommendation;

}

module.exports = getRecommendation;

/**
    - 0-40: "not recommended"
    - 41-60: "needs improvement" 
    - 61-80: "considerable fit"
    - 81-100: "strong fit"
 */
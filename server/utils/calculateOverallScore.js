const calculateOverallScore = (interview) => {
    const totalQuestions = interview.questions.length;
    const sumOfScores = interview.questions.reduce((sum, q) => {
        return sum + (q.feedbackObj?.score || 0);
    }, 0);
    const avgOutOf10 = sumOfScores / totalQuestions;
    const avgOutOf100 = avgOutOf10 * 10;

    return avgOutOf100;
}

const finalOverallScore = (avgScore, aiScore) => {
    let score = (avgScore * 0.4) + (aiScore * 0.6);
    return Math.round(score * 10) / 10;
}

module.exports = { calculateOverallScore, finalOverallScore };
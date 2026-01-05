const calculateAvgScore = (interviewList) => {
    if (!interviewList || interviewList.length === 0) return 0;

    const validScores = interviewList
        .map(interview => interview?.overallFeedback?.score)
        .filter(score => typeof score === 'number' && !isNaN(score));

    if (validScores.length === 0) return 0;

    const totalScoreSum = validScores.reduce((sum, score) => {
        return sum + score;
    }, 0);

    const totalAvg = totalScoreSum / validScores.length;

    return Number(totalAvg.toFixed(1));

};

module.exports = calculateAvgScore;
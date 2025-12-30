const calculateAvgScore = (interviewList) => {
    if (!interviewList || interviewList.length === 0) return 0;

    const totalScoreSum = interviewList.reduce((accumulator, interview) => {
        return accumulator + interview?.overallFeedback?.score;
    }, 0);

    const totalAvg = totalScoreSum / interviewList.length;

    return totalAvg.toFixed(1)
}

module.exports = calculateAvgScore;
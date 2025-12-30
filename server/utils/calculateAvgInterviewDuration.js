const calculateAvgInterviewDuration = (interviewList) => {
    if (!interviewList || !interviewList.length === 0) return 0;

    const totalTime = interviewList.reduce((acc, interview) => {
        return acc + interview?.duration/60;
    }, 0);

    return Math.floor( totalTime / interviewList.length );

}

module.exports = calculateAvgInterviewDuration;
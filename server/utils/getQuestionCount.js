const getQuestionCount = (durationSeconds) => {
    const totalMinutes = durationSeconds / 60;
    return Math.floor(totalMinutes/5);
}

module.exports = getQuestionCount;
const calculateDailyStreak = (uniqueDates) => {
    let streak = 0;
    let currentDay = new Date();

    currentDay.setHours(0, 0, 0, 0);

    for (let date of uniqueDates) {
        const interviewDay = new Date(date);
        interviewDay.setHours(0, 0, 0, 0);

        const diffDays = 
            (currentDay - interviewDay) / (1000 * 60 * 60 * 24);
        
        if (diffDays === 0 || diffDays === 1) {
            streak++;
            currentDay = interviewDay;
        } else {
            break;
        }
    }

    return streak;
}

module.exports = calculateDailyStreak;
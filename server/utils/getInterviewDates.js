// this function working and objective 
// 1. objective - takes interviewList and returns the array of dates in structured format
// E.g. Input --> interviewList
// Output --> ["2025-12-29", "2025-12-29", "2025-12-28", "2025-12-27", ]
const getInterviewDates = (interviewList) => {
    return interviewList
        .filter(interview => interview.status === "evaluated")
        .map(interview => {
            const d = new Date(interview.updatedAt);
            return d.toISOString().split('T')[0];   // YYYY-MM-DD
        });
};

// ye function array of dates leta hai and array of dates return karta hai with processing
// Processing done: 
// 1. unique elements only
// 2. sorted in descending order 
const getUniqueSortedDates = (dates) => {
    return [...new Set(dates)]
        .sort((a, b) => new Date(b) - new Date(a));
};


module.exports = {getInterviewDates, getUniqueSortedDates};
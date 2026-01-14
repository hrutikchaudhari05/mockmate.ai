import { submitAnswer } from "@/store/interviewSlice";

export const autoSubmitRemainingQuestions = async ({
    interviewId,
    currentQuestionIndex,
    totalQuestions,
    dispatch
}) => {
    const promises = [];

    for (let i = currentQuestionIndex; i < totalQuestions; i++) {
        promises.push(
            dispatch(submitAnswer({
                interviewId,
                answerText: "",
                audioUrl: ""
            }))
        );
    }

    await Promise.all(promises);
};
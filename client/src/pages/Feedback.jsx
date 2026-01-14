
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, TrendingUp, MessageSquareText, Sparkle, AlertCircle, ChevronRight, Dot, Minus, Disc3, CircleDot} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInterviewById, clearMediaStream } from '@/store/interviewSlice';
import getRecommendationColor from '@/utils/getRecommendationColor';

const Feedback = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    
    const { mediaStream, currentInterview, interviewLoading } = useSelector((state) => state.interview);

    // Debug logs
    useEffect(() => {
        console.log("=== FEEDBACK DEBUG ===");
        console.log("Interview ID:", interviewId);
        console.log("Current Interview:", currentInterview);
        console.log("Has overallFeedback:", !!currentInterview?.overallFeedback);
        
        if (currentInterview?.questions) {
            currentInterview.questions.forEach((q, i) => {
                console.log(`Q${i + 1}:`, {
                    question: q.questionObj?.qtxt,
                    hasFeedbackObj: !!q.feedbackObj,
                    feedbackObj: q.feedbackObj
                });
            });
        }
    }, [currentInterview]);

    useEffect(() => {
        if (interviewId && !currentInterview) {
            dispatch(fetchInterviewById(interviewId));
        } 
    }, [interviewId, currentInterview, dispatch]);

    useEffect(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            dispatch(clearMediaStream());
        }
    }, [mediaStream, dispatch]);

    if (interviewLoading) {
        return (
            <div className='min-h-screen bg-slate-950 text-white'>
                Generating Feedback of your interview...!
            </div>
        );
    }

    if (!currentInterview?.overallFeedback) {
        return (
            <div className='min-h-screen bg-slate-950 text-white'>
                No feedback generated yet...!
            </div>
        );
    }

    // Safe data extraction
    const overallFeedback = currentInterview.overallFeedback || {};
    const score = overallFeedback.score || 0;
    const recommendation = overallFeedback.recommendation || "Needs Improvement";
    const summary = overallFeedback.summary || "No summary available";
    const strengths = Array.isArray(overallFeedback.strengths) ? overallFeedback.strengths : [];
    const improvementTips = Array.isArray(overallFeedback.improvementTips) ? overallFeedback.improvementTips : [];
    
    const questions = Array.isArray(currentInterview.questions) ? currentInterview.questions : [];

    // const recommendation = getRecommendation(score);

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="container mx-auto px-4 md:px-6 lg:px-8 py-10 space-y-10 text-white"
        >
            <div className="text-center space-y-3">
                <div className='mb-6 space-y-2'>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold">
                        Interview Results
                    </h1>
                    <p className="text-slate-400 text-sm md:text-base">
                        Detailed analysis of your performance
                    </p>
                </div>
                
                {/* Overall Score Card */}
                <Card className="bg-slate-950/70 border-slate-800 max-w-3xl mx-auto">
                    <CardHeader className="items-center">
                        <CardTitle className="flex text-lg md:text-xl items-center gap-2 text-slate-300">
                            <TrendingUp size={22} className="text-indigo-600" />
                            Overall Performance
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-3xl font-bold text-slate-300">
                                {score}%
                            </span>
                            <span className={`font-semibold capitalize ${getRecommendationColor(score)}`}>
                                {recommendation}
                            </span>
                        </div>
                        <Progress value={score} className="h-2 [&>div]:bg-indigo-600" />
                    </CardContent>
                </Card>

                {/* Summary */}
                <Card className="bg-slate-950/70 border-slate-800 max-w-3xl mx-auto">
                    <CardHeader className="items-center">
                        <CardTitle className="flex items-center gap-2 text-lg md:text-xl text-slate-300">
                            <MessageSquareText size={22} className="text-indigo-600" />
                            Feedback Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className='text-slate-400 text-sm md:text-base leading-relaxed'>
                            {summary}
                        </p>
                    </CardContent>
                </Card>

                <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/70 max-w-5xl mx-auto mb-8 p-4 rounded-md border border-slate-800'>
                    {/* Areas of Improvement */}
                    <Card className="bg-slate-950/60 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-300 text-xl">
                                <XCircle className="text-red-500/90 mt-[1px]" />
                                Areas for Improvement
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {improvementTips.length === 0 ? (
                                    <li className='text-slate-400 italic'>
                                        No improvement needed
                                    </li>
                                ) : (
                                    improvementTips.map((item, index) => (
                                        <li key={index} className="flex gap-3 pl-4">
                                            <span className="w-2 h-2 mt-2 bg-red-500/70 rounded-full shrink-0 self-start"></span>
                                            <span className="text-slate-300 leading-relaxed">{item}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </CardContent>
                    </Card>

                    {/* Areas of Strengths */}
                    <Card className="bg-slate-950/60 border-slate-800">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-slate-300 text-xl">
                                <CheckCircle2 className="text-emerald-500 mt-[1px]" />
                                Your Strengths
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ul className="space-y-3">
                                {strengths.length === 0 ? (
                                    <li className='text-slate-400 italic'>
                                        No strengths are shown
                                    </li>
                                ) : (
                                    strengths.map((item, index) => (
                                        <li key={index} className="flex gap-3 pl-4">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 shrink-0 self-start"></div>
                                            <span className="text-slate-300 leading-relaxed">{item}</span>
                                        </li>
                                    ))
                                )}
                            </ul>
                        </CardContent>
                    </Card>
                </div>

                {/* Question-wise Analysis */}
                <Card className="bg-slate-950/70 border-slate-800 mb-8 mx-auto max-w-5xl p-4">
                    <CardHeader>
                        <CardTitle className="text-center text-xl md:text-2xl font-medium text-indigo-500 mb-2">
                            Question-wise Analysis
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {questions.length === 0 ? (
                            <p className="text-slate-400 text-center">No questions found</p>
                        ) : (
                            questions.map((q, index) => {
                                // Safely extract feedback data
                                const feedback = q.feedbackObj || {};
                                const qScore = feedback?.score || 0;
                                const qSummary = feedback?.summary || "No summary available";
                                const qIdealAnswer = feedback?.idealAnswer || "Not provided";
                                const qStrengths = Array.isArray(feedback?.strengths) ? feedback.strengths : [];
                                const qImprovementTips = Array.isArray(feedback?.improvementTips) ? feedback.improvementTips : [];

                                return (
                                    <div key={index} className="flex flex-col gap-2 border-b border-slate-800 pb-4 last:border-0">
                                        
                                        {/* Question-Text */}
                                        <div className="flex justify-between mb-2 gap-4">
                                            <h3 className="font-medium text-white text-left text-xl">
                                                Q{index + 1}: {q.questionObj?.qtxt || "Question"}
                                            </h3>
                                            <Badge 
                                                className={`w-8 h-7 mt-0.5 text-sm font-semibold shrink-0 flex items-center justify-center
                                                    ${qScore >= 8 ? 'bg-emerald-500/10 border-emerald-600 text-emerald-500' : 
                                                      qScore >= 6 ? 'bg-amber-500/10 text-amber-400/90 border-amber-500' : 
                                                      'bg-red-500/10 text-red-400 border-red-500/30'}`}
                                            >
                                                {qScore}
                                            </Badge>
                                        </div>

                                        {/* Summary */}
                                        <p className="flex gap-2 text-slate-400 text-left text-sm leading-relaxed ml-1">
                                            <MessageSquareText size={16} className='text-indigo-600 mt-1 shrink-0'/>
                                            <span>
                                                <strong className='text-slate-200 font-medium'>Summary: </strong>{" "}
                                                {qSummary}
                                            </span>
                                        </p>

                                        {/* Ideal Answer */}
                                        <p className="flex items-start gap-2 text-left text-slate-400 text-sm ml-1">
                                            <Sparkle size={16} className='text-fuchsia-400 mt-1 shrink-0' />
                                            <span>
                                                <strong className='text-slate-200 font-medium'>Ideal Answer: </strong>{" "} 
                                                {qIdealAnswer}
                                            </span>
                                        </p>

                                        {/* Strengths */}
                                        <div className='flex items-start gap-2 text-slate-400 text-sm ml-1'>
                                            <CheckCircle2 size={16} className='text-emerald-500 mt-[2px] shrink-0' />
                                            <div>
                                                <span className='text-slate-200 font-medium'>
                                                    Your Strengths: 
                                                </span>
                                                {qStrengths.length === 0 ? (
                                                    <span className='ml-1 italic'>
                                                        None highlighted
                                                    </span>
                                                ) : (
                                                    <ul>
                                                        {qStrengths.map((strength, i) => (
                                                            <li key={i} className='flex items-start gap-1 pl-6'>
                                                                <Dot size={20} className='mt-0.5 text-emerald-400 shrink-0' />
                                                                <span>{strength}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>

                                        {/* Improvement Tips */}
                                        <div className="flex items-start gap-2 text-slate-400 text-sm ml-1">
                                            <AlertCircle size={16} className='text-amber-400 mt-[2px] shrink-0' />
                                            <div>
                                                <span className='text-slate-200 font-medium'>
                                                    Improvement Tips: 
                                                </span>
                                                {qImprovementTips.length === 0 ? (
                                                    <span className='ml-1 italic'>None highlighted</span>
                                                ) : (
                                                    <ul>
                                                        {qImprovementTips.map((tip, i) => (
                                                            <li key={i} className='flex items-start gap-1 pl-6'>
                                                                <Dot size={20} className='mt-0.5 text-amber-400/80 shrink-0' />
                                                                <span>{tip}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row gap-4 justify-center">
                    <Button className="bg-indigo-600 hover:bg-indigo-800 text-slate-200 border-2 border-indigo-950">
                        Download Detailed Report
                    </Button>
                    
                    <Button 
                        className="border-slate-950 border text-indigo-400 bg-slate-950/70 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700"
                        onClick={() => navigate("/dashboard")}
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </motion.div>
    );
};

export default Feedback;
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, TrendingUp, MessageSquareText, Sparkle, AlertCircle, ChevronRight, Dot, Minus} from 'lucide-react';
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
    // const overallScore = 84; // Mock data
    const { mediaStream, currentInterview, interviewLoading } = useSelector((state) => state.interview);

    // // score 
    const score = currentInterview?.overallFeedback?.score;

    console.log("Overall Feedback: ", currentInterview?.overallFeedback);
    console.log('Question wise feedback: ', currentInterview?.questions?.map(q => q.feedbackObj));

    useEffect(() => {
        if (interviewId && !currentInterview) {
            dispatch(fetchInterviewById(interviewId));
        } 
    }, [interviewId]);

    useEffect(() => {
        if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            dispatch(clearMediaStream());
        }
    }, [mediaStream, dispatch]);

    if (interviewLoading) {
        return (
            <div className='min-h-screen bg-slate-950 text-white'>
                Gererating Feedback of your interview...!
            </div>
        )
    }

    if (!currentInterview?.overallFeedback) {
        return (
            <div className='min-h-screen bg-slate-950 text-white'>
                No feedback generated yet...!
            </div>
        )
    };

    

    

    return (
        
            
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="container mx-auto px-4 py-8"
            >
                
                
                <div className="container mx-auto px-4 py-8 text-white">
                    <h1 className="text-4xl font-bold text-center mb-2">
                        Interview Results
                    </h1>
                    <p className="text-slate-400 text-center mb-8">
                        Detailed analysis of your performance
                    </p>
                    
                    {/* Overall Score Card */}
                    <Card className="bg-slate-950/70 border-slate-800 mb-8 mx-72 backdrop-blur-sm shadow-[0_0_20px_rgba(99,10,251,0.28)]">
                        <CardHeader className="items-center">
                            <CardTitle className="flex text-2xl items-center gap-2 text-slate-300">
                                <TrendingUp size={24} className="text-indigo-600 mt-[3px]" />
                                Overall Performance Score
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="text-3xl font-bold text-white">
                                    {score}%
                                </div>
                                <div className={`font-medium text-xl capitalize ${getRecommendationColor(score)}`}>
                                    {/* Recommendation */}
                                    {currentInterview.overallFeedback.recommendation}
                                </div>
                            </div>
                            <Progress value={score} className="h-2 [&>div]:bg-indigo-600" />
                        </CardContent>
                    </Card>

                    {/* Summary */}
                    <Card className="bg-slate-950/70 border-slate-800 mb-8 mx-40 backdrop-blur-sm shadow-[0_0_20px_rgba(99,10,251,0.28)]">
                        <CardHeader className="items-center">
                            <CardTitle className="flex text-2xl items-center gap-2 text-slate-300">
                                <MessageSquareText size={24} className="text-indigo-600 items-center mt-[3px]" />
                                Feedback
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className='text-slate-400'>
                                {currentInterview.overallFeedback.summary}
                            </p>
                        </CardContent>
                    </Card>

                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 bg-slate-950/70 mx-40 mb-8 p-4 rounded-md border border-slate-800 backdrop-blur-sm shadow-[0_0_20px_rgba(99,10,251,0.28)]'>
                        {/* Areas of Improvement */}
                        <Card className=" bg-slate-950/60 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-300 text-xl">
                                    <XCircle className="text-red-500/90 mt-[1px]" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {currentInterview.overallFeedback.improvementTips.length === 0 ? (
                                        <li className='text-slate-400 italic'>
                                            No improvement needed
                                        </li>
                                    ) : (
                                        currentInterview.overallFeedback.improvementTips.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                                <span className="text-slate-300">{item}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Areas of Strengths */}
                        <Card className=" bg-slate-950/60 border-slate-800">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-slate-300 text-xl">
                                    <CheckCircle2 className="text-emerald-500 mt-[1px]" />
                                    Your Strengths
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {currentInterview.overallFeedback.strengths.length === 0 ? (
                                        <li className='text-slate-400 italic'>
                                            No strengths are shown
                                        </li>
                                    ) : (
                                        currentInterview.overallFeedback.strengths.map((item, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
                                                <span className="text-slate-300">{item}</span>
                                            </li>
                                        ))
                                    )}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Question-wise Analysis */}
                    <Card className="bg-slate-950/70 border-slate-800 mb-8 mx-32 backdrop-blur-sm shadow-[0_0_20px_rgba(99,10,251,0.28)] p-4">
                        <CardHeader>
                            <CardTitle className="text-center text-3xl font-medium text-indigo-600 mb-2">Question-wise Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {currentInterview.questions.map((q, index) => (
                                <div key={index} className="flex flex-col gap-2 border-b border-slate-800 pb-4 last:border-0">
                                    
                                    {/* Question-Text */}
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-medium text-white text-xl">
                                            Q{index + 1}: {q.questionObj.qtxt}
                                        </h3>
                                        <Badge 
                                            className={`px-2 text-sm font-semibold text-center text-slate-200
                                                ${q.feedbackObj.score >= 8 ? 'bg-emerald-500' : 
                                                    q.feedbackObj.score >= 6 ? 'bg-amber-500/90' : 'bg-red-500/90'}`}
                                        >
                                            {q.feedbackObj.score}
                                        </Badge>
                                    </div>

                                    {/* Summary */}
                                    <p className="flex items-start gap-2 text-slate-400 text-sm">
                                        <MessageSquareText size={16} className='text-indigo-600 mt-[3px] shrink-0'/>
                                        <span>
                                            <span className='text-slate-200 font-medium'>Summary: </span> 
                                            {q.feedbackObj.summary}
                                        </span>
                                    </p>

                                    {/* Ideal Answer */}
                                    <p className="flex items-start gap-2 text-slate-400 text-sm">
                                        <Sparkle size={16} className='text-fuchsia-400 mt-[3px] shrink-0' />
                                        <span>
                                            <span className='text-slate-200 font-medium'>Ideal Answer: </span> 
                                            {q.feedbackObj.idealAnswer}
                                        </span>
                                    </p>

                                    {/* Strengths */}
                                    <div className='flex items-start gap-2 text-slate-400 text-sm'>
                                        <CheckCircle2 size={16} className='text-emerald-500 mt-[2px] shrink-0' />
                                        <div>
                                            <span className='text-slate-200 font-medium'>
                                                Your Strengths: 
                                            </span>
                                            {q.feedbackObj.strengths.length === 0 ? (
                                                <span className='ml-1 italic'>
                                                    None highlighted
                                                </span>
                                            ) : (
                                                <ul>
                                                    {q.feedbackObj.strengths.map((strength, i) => (
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
                                    <div className="flex items-start gap-2 text-slate-400 text-sm">
                                        <AlertCircle size={16} className='text-amber-400 mt-[2px] shrink-0' />
                                        <div>
                                            <span className='text-slate-200 font-medium'>
                                                Improvement Tips: 
                                            </span>
                                            {q.feedbackObj.improvementTips.length === 0 ? (
                                                <span className='ml-1 italic'>None highlighted</span>
                                            ) : (
                                                <ul>
                                                    {q.feedbackObj.improvementTips.map((tip, i) => (
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
                            ))}
                        </CardContent>
                    </Card>

                    

                    {/* Action Buttons */}
                    <div className="flex gap-4 justify-center">
                        <Button className="bg-indigo-600 hover:bg-indigo-800 text-slate-200">
                            Download Detailed Report
                        </Button>
                        
                        <Button className="border-slate-950 border text-indigo-600 bg-slate-950/70 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700 shadow-[0_0_20px_rgba(99,10,251,0.28)]"
                            onClick={() => navigate("/dashboard")}>
                            Back to Dashboard
                        </Button>
                    </div>
                </div>

            </motion.div>
        
    )
}

export default Feedback;
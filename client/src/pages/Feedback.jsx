import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Star, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchInterviewById } from '@/store/interviewSlice';


// Mock data
const questionFeedback = [
    { question: "What is prop drilling?", score: 90, feedback: "Excellent explanation with examples" },
    { question: "React.memo vs useMemo?", score: 75, feedback: "Good but missed performance implications" },
    { question: "useRef vs useReducer?", score: 65, feedback: "Basic understanding, needs more depth" }
];

const improvements = [
    "Explain concepts with real-world examples",
    "Practice more on React performance optimization", 
    "Work on communication clarity",
    "Improve time management during answers"
];



const Feedback = () => {
    const { interviewId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const overallScore = 84; // Mock data
    const { currentInterview, interviewLoading } = useSelector((state) => state.interview);

    // // score 
    const score = currentInterview?.overallFeedback?.score;

    console.log("Overall Feedback: ", currentInterview?.overallFeedback);
    console.log('Question wise feedback: ', currentInterview?.questions?.map(q => q.feedbackObj));

    useEffect(() => {
        if (interviewId && !currentInterview) {
            dispatch(fetchInterviewById(interviewId));
        } 
    }, [interviewId]);

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
    }

    return (
        
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="min-h-screen bg-slate-950 text-white"
        >
            {/* Container with animation */}
            <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="container mx-auto px-4 py-8"
            >
                {/* Your existing code... */}
                <div className="min-h-screen bg-slate-950 text-white">
                    <div className="container mx-auto px-4 py-8">
                        <h1 className="text-4xl font-bold text-center mb-2">
                            Interview Results
                        </h1>
                        <p className="text-slate-400 text-center mb-8">
                            Detailed analysis of your performance
                        </p>
                        
                        {/* Overall Score Card */}
                        <Card className="bg-slate-900 border-slate-800 mb-8 mx-48">
                            <CardHeader>
                                <CardTitle className="flex text-2xl items-center gap-2 text-slate-300">
                                    <TrendingUp size={24} className="text-indigo-600" />
                                    Overall Performance Score
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <div className="text-3xl font-bold text-white">
                                        {score}%
                                    </div>
                                    <div className="text-slate-400">
                                        {/* Score description */}
                                        {score >= 80 ? 'Excellent!' : 
                                        score >= 60 ? 'Good' : 'Needs Improvement'}
                                    </div>
                                </div>
                                <Progress value={score} className="h-2" />
                            </CardContent>
                        </Card>

                        {/* Question-wise Analysis */}
                        <Card className="bg-slate-900 border-slate-800 mb-8">
                            <CardHeader>
                                <CardTitle>Question-wise Analysis</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                {questionFeedback.map((item, index) => (
                                    <div key={index} className="border-b border-slate-800 pb-4 last:border-0">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-white">
                                                Q{index + 1}: {item.question}
                                            </h3>
                                            <Badge 
                                                className={item.score >= 80 ? 'bg-green-500' : 
                                                        item.score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}
                                            >
                                                {item.score}%
                                            </Badge>
                                        </div>
                                        <p className="text-slate-400 text-sm">{item.feedback}</p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Areas of Improvement */}
                        <Card className="bg-slate-900 border-slate-800 mb-8">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <XCircle className="text-red-500" />
                                    Areas for Improvement
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-3">
                                    {improvements.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                                            <span className="text-slate-300">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* Action Buttons */}
                        <div className="flex gap-4 justify-center">
                            <Button className="bg-indigo-600 hover:bg-indigo-700">
                                Download Detailed Report
                            </Button>
                            
                            <Button variant="outline" className="border-slate-700"
                            onClick={() => navigate("/dashboard")}>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>

                </div>
            </motion.div>
        </motion.div>
    )
}

export default Feedback;
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Mic, Send, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useSelector } from 'react-redux';

const ActualInterviewScreen = () => {
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [answer, setAnswer] = useState('');
    const [isRecording, setIsRecording] = useState(false);

    // Redux data
    const interview = useSelector((state) => state.interview?.currentInterview);

    const questions = [
        "Tell me about your experience with React and state management.",
        "How would you optimize a slow React component?",
        "Explain the Virtual DOM and its benefits.",
        "What are React hooks and when would you use useMemo?",
        "Describe a challenging project you worked on."
    ];

    // Prevent Back Navigation
    useEffect(() => {
        window.history.pushState(null, null, window.location.pathname);
        window.onpopstate = () => {
            window.history.pushState(null, null, window.location.pathname);
        };
        return () => {
            window.onpopstate = null;
        };
    }, []);

    // Timer Logic
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setAnswer('');
        } else {
            // Handle Interview Finish Logic
            console.log("Interview Finished");
        }
    };

    const handleSubmit = () => {
        console.log('Answer submitted:', answer);
        handleNext();
    };

    return (
        <div className="h-screen w-full bg-slate-950 flex flex-col text-slate-100 font-sans selection:bg-indigo-500/30">
            
            {/* Top Progress Bar (Linear) */}
            <div className="w-full h-1 bg-slate-900">
                <div 
                    className="h-full bg-indigo-600 transition-none" // No animation as requested
                    style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                />
            </div>

            {/* Header / Info Bar */}
            <header className="px-8 py-4 flex justify-between items-center border-b border-slate-800 bg-slate-950">
                <div>
                    <h1 className="text-lg font-semibold tracking-tight text-white">
                        {interview?.settings?.title || "Frontend Engineering Interview"}
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                        <span className="bg-slate-900 px-2 py-0.5 rounded text-xs border border-slate-800 uppercase tracking-wider font-medium">
                            Round 1
                        </span>
                        <span>•</span>
                        <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-md border ${timeLeft < 300 ? 'border-red-900 bg-red-950/20 text-red-400' : 'border-slate-800 bg-slate-900 text-slate-300'}`}>
                        <Clock size={16} />
                        <span className="font-mono font-medium text-lg">{formatTime(timeLeft)}</span>
                    </div>
                    <Button variant="destructive" className="bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50">
                        End Interview
                    </Button>
                </div>
            </header>

            {/* Main Split Layout */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-5">
                
                {/* LEFT: Question Area */}
                <div className="p-8 lg:p-12 flex flex-col justify-center border-r border-slate-800 bg-slate-950/50 lg:col-span-2">
                    <div className="max-w-xl">
                        <div className="mb-6">
                            <Badge variant="outline" className="rounded-sm border-indigo-600/30 text-indigo-400 bg-indigo-600/10 px-3 py-1 text-sm font-medium">
                                Technical Question
                            </Badge>
                        </div>
                        
                        <h2 className="text-3xl md:text-4xl font-light leading-tight text-white mb-8">
                            {questions[currentQuestionIndex]}
                        </h2>

                        <div className="p-4 rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 text-sm flex gap-3 items-start">
                            <AlertCircle className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                            <div>
                                <p className="font-medium text-slate-300 mb-1">Note:</p>
                                <p>Please provide a detailed explanation. If code is required, you can write pseudocode or actual implementation in the editor box.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Answer Area */}
                <div className="p-6 lg:p-8 bg-slate-950 flex flex-col lg:col-span-3">
                    <div className="flex-1 flex flex-col rounded-xl border border-slate-800 bg-slate-900 overflow-hidden shadow-sm">
                        
                        {/* Editor Toolbar */}
                        <div className="px-4 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center">
                            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">
                                Answer Editor
                            </span>
                            <div className="flex items-center gap-2">
                                {isRecording && (
                                    <span className="flex items-center gap-2 text-red-400 text-xs px-2 py-1 bg-red-950/30 rounded-full">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        Recording...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Text Area */}
                        <Textarea 
                            className="flex-1 w-full p-6 bg-transparent border-0 focus-visible:ring-0 resize-none text-slate-200 text-lg leading-relaxed font-mono placeholder:text-slate-700"
                            placeholder="// Type your answer here..."
                            spellCheck={false}
                            value={answer}
                            onChange={(e) => setAnswer(e.target.value)}
                        />

                        {/* Bottom Actions */}
                        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center">
                            <Button 
                                onClick={() => setIsRecording(!isRecording)}
                                variant="outline" 
                                className={`border-slate-700 hover:bg-slate-800 hover:text-white ${isRecording ? 'text-red-400 border-red-900/50 bg-red-900/10' : 'text-slate-400'}`}
                            >
                                <Mic size={18} className="mr-2" />
                                {isRecording ? 'Stop Recording' : 'Record Voice'}
                            </Button>

                            <Button 
                                onClick={handleSubmit}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[140px]"
                            >
                                Submit & Next
                                <Send size={16} className="ml-2" />
                            </Button>
                        </div>
                    </div>

                    {/* Hint / Status */}
                    <div className="mt-4 flex justify-between items-center px-2">
                         <div className="flex items-center gap-2 text-slate-500 text-xs">
                             <CheckCircle2 size={14} className="text-emerald-500"/>
                             <span>Auto-saved</span>
                         </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ActualInterviewScreen;
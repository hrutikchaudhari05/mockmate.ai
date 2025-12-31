import React from 'react';
import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic, Brain, Target, Clock } from 'lucide-react';


const Landing = () => {
    const navigate = useNavigate();

    const exploreSectionRef = useRef(null);

    const scrollToExplore = () => {
        exploreSectionRef.current?.scrollIntoView({
            behaviour: 'smooth'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 text-white">
            
            {/* Hero Section */}
            <div className="container mx-auto px-6 py-20 text-center">
                
                {/* Logo/Title */}
                <h1 className="text-5xl font-bold mb-6">
                    Mock<span className="text-indigo-400">Mate</span>
                </h1>
                
                {/* Tagline */}
                <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
                    AI-powered mock interviews to ace your next job interview
                </p>
                
                {/* CTA Buttons */}
                <div className="flex gap-4 justify-center">
                    <Button 
                        size="lg"
                        className="bg-indigo-600 hover:bg-indigo-800 text-slate-200"
                        onClick={() => navigate('/login')}
                    >
                        Get Started
                    </Button>
                    <Button 
                        className="border-slate-800 border text-indigo-600 bg-slate-900 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700"
                        size="lg"
                        onClick={scrollToExplore}
                    >
                            Explore
                    </Button>
                </div>
                
            </div>

            {/* Features Section */}
            <div className="container mx-auto px-6 py-16">
                <h2 className="text-3xl font-bold text-center mb-12">
                    Why Choose MockMate?
                </h2>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="text-center p-6 bg-slate-900/50 rounded-xl">
                        <Mic className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                        <p className="text-slate-400">Real-time feedback from advanced AI</p>
                    </div>
                    
                    <div className="text-center p-6 bg-slate-900/50 rounded-xl">
                        <Target className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Customizable</h3>
                        <p className="text-slate-400">Tailor interviews to your target role</p>
                    </div>

                    <div className="text-center p-6 bg-slate-900/50 rounded-xl">
                        <Mic className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
                        <p className="text-slate-400">Real-time feedback from advanced AI</p>
                    </div>
                    
                    <div className="text-center p-6 bg-slate-900/50 rounded-xl">
                        <Target className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">Customizable</h3>
                        <p className="text-slate-400">Tailor interviews to your target role</p>
                    </div>
                    
                    
                </div>

                {/* Section with ref */}
                <div ref={exploreSectionRef} id="explore-section">
                    {/* Content */}
                    <h2 className="text-3xl font-bold text-center mb-12 text-white">
                        Master Your Interview in 4 Simple Steps
                    </h2>
                    
                    <div className="max-w-4xl mx-auto space-y-8">
                        
                        {/* STEP 1 */}
                        <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">1</div>
                                <h3 className="text-2xl font-bold text-indigo-300">Choose Your Battlefield</h3>
                            </div>
                            <ul className="space-y-3 text-slate-300 ml-14">
                                <li className="flex items-center gap-2"><span className="text-amber-400">→</span> <span className="font-medium">Role:</span> Frontend, Backend, Full-Stack, DevOps</li>
                                <li className="flex items-center gap-2"><span className="text-amber-400">→</span> <span className="font-medium">Tech Stack:</span> React, Node.js, Python, System Design</li>
                                <li className="flex items-center gap-2"><span className="text-amber-400">→</span> <span className="font-medium">Duration:</span> 15 to 45 minutes</li>
                            </ul>
                        </div>

                        {/* STEP 2 */}
                        <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">2</div>
                                <h3 className="text-2xl font-bold text-indigo-300">Showcase Your Skills</h3>
                            </div>
                            <div className="grid md:grid-cols-2 gap-6 ml-14">
                                <div className="space-y-3">
                                    <h4 className="text-amber-400 font-semibold">🎤 Voice Answer</h4>
                                    <p className="text-slate-300">Record your thoughts naturally (3 attempts per question)</p>
                                    <p className="text-xs text-slate-500">Auto-converts to text with AI transcription</p>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-amber-400 font-semibold">⌨️ Type Answer</h4>
                                    <p className="text-slate-300">Use code editor with syntax highlighting</p>
                                    <p className="text-xs text-slate-500">Write pseudocode or detailed explanations</p>
                                </div>
                            </div>
                        </div>

                        {/* STEP 3 */}
                        <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">3</div>
                                <h3 className="text-2xl font-bold text-indigo-300">Real-Time Performance Tracking</h3>
                            </div>
                            <ul className="space-y-3 text-slate-300 ml-14">
                                <li className="flex items-center gap-2"><span className="text-amber-400">●</span> <span className="font-medium">Live Timer:</span> Simulates real interview pressure</li>
                                <li className="flex items-center gap-2"><span className="text-amber-400">●</span> <span className="font-medium">Progress Bar:</span> Track completed questions</li>
                                <li className="flex items-center gap-2"><span className="text-amber-400">●</span> <span className="font-medium">Attempt Counter:</span> Voice recording limits (3/question)</li>
                            </ul>
                        </div>

                        {/* STEP 4 */}
                        <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-xl border border-slate-700">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="bg-indigo-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold">4</div>
                                <h3 className="text-2xl font-bold text-indigo-300">Get AI-Powered Feedback</h3>
                            </div>
                            <div className="grid md:grid-cols-3 gap-6 ml-14">
                                <div className="space-y-2">
                                    <h4 className="text-amber-400 font-semibold">📊 Technical Accuracy</h4>
                                    <p className="text-sm text-slate-300">Code correctness & best practices</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-amber-400 font-semibold">🗣️ Communication Score</h4>
                                    <p className="text-sm text-slate-300">Clarity, structure & explanation quality</p>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-amber-400 font-semibold">📈 Improvement Tips</h4>
                                    <p className="text-sm text-slate-300">Personalized actionable insights</p>
                                </div>
                            </div>
                        </div>

                        
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Landing;
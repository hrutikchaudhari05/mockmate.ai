import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic, Brain, Target, Clock } from 'lucide-react';


const Landing = () => {
    const navigate = useNavigate();

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
                        className="border-slate-700 text-indigo-600 bg-slate-900 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700"
                        size="lg"
                    >
                            Learn More
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
                    
                    {/* Add 2 more features... */}
                </div>
            </div>
        </div>
    );
};

export default Landing;
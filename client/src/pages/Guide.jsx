import React from 'react';

const Guide = () => {

    return (
        <div 
            className="px-28 py-16 space-y-8 text-white"
        >
            <h1 className="text-3xl font-bold mb-6 text-center">How to Use InterviewAI</h1>
      
            <div className="space-y-4 max-w-2xl text-slate-300">
                <div className="bg-slate-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-amber-500">1. Start Interview</h2>
                <p>Choose your role, topic, and duration. Click "Start Interview".</p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-amber-500">2. Answer Questions</h2>
                <p>Record your answer (3 attempts max) or type manually. Submit before timer ends.</p>
                </div>
                
                <div className="bg-slate-800 p-4 rounded-lg">
                <h2 className="text-xl font-semibold text-amber-500">3. Get AI Feedback</h2>
                <p>Receive detailed feedback on your answers after interview ends.</p>
                </div>
            </div>

        </div>
    )
}

export default Guide;
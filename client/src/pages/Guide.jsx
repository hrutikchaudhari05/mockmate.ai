import React from 'react';
import {motion} from 'framer-motion';

const Guide = () => {
  return (
    <motion.div 
        initial={{ y: 18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='py-8 sm:py-12 text-white'
    >

    
    <div className="container mx-auto">
        {/* Page Title */}
        <div className="text-center max-w-3xl mx-auto mb-14">
            <h1 className="text-4xl font-bold mb-4">
            How to Use <span className="text-indigo-400">MockMate</span> Effectively
            </h1>
            <p className="text-slate-400 text-lg">
            This guide helps you get realistic interviews and meaningful feedback.
            Better setup leads to better evaluation.
            </p>
        </div>

        <div className="max-w-5xl mx-auto space-y-10">

            {/* Section 1 */}
            <GuideCard title="Before You Start">
            <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>MockMate works for <b>any field</b> — software, finance, mechanical, medical, and more.</li>
                <li>The AI understands your domain from your <b>role title, JD, skills, and context</b>.</li>
                <li>Clear and specific inputs result in more realistic interview questions.</li>
            </ul>
            </GuideCard>

            {/* Section 2 */}
            <GuideCard title="Step 1: Configure Your Interview">
            <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li><b>Role Title:</b> Enter the exact role you are preparing for.</li>
                <li><b>Interview Type:</b> Choose Technical, HR, or Managerial.</li>
                <li><b>Experience Level & Duration:</b> Match your real interview expectations.</li>
                <li><b>Job Description / Skills:</b> Paste JD or key skills for targeted questions.</li>
                <li><b>Interview Context:</b> Guide the AI (e.g., focus on DSA, system design, behavior).</li>
                <li><b>Target Organizations:</b> Helps align question difficulty and style.</li>
            </ul>
            </GuideCard>

            {/* Section 3 */}
            <GuideCard title="Step 2: Attend the Interview">
            <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>The interview runs in a focused, timed environment.</li>
                <li>You can answer via <b>voice or text</b>.</li>
                <li>Voice responses have <b>limited attempts</b> to simulate real pressure.</li>
                <li>Think before answering — quality matters more than speed.</li>
            </ul>
            </GuideCard>

            {/* Section 4 */}
            <GuideCard title="Step 3: Review Your Evaluation">
            <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>An <b>overall score</b> reflects your interview performance.</li>
                <li>Each question includes <b>strengths, gaps, and improvement suggestions</b>.</li>
                <li>You also receive <b>ideal answers</b> for comparison.</li>
                <li>A final recommendation shows how fit you are for the role.</li>
            </ul>
            </GuideCard>

            {/* Section 5 */}
            <GuideCard title="How to Improve Using Feedback">
            <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>Focus on recurring weaknesses, not just the final score.</li>
                <li>Refine your JD or context and retry the interview.</li>
                <li>Use ideal answers to understand structure, not to memorize.</li>
                <li>Practice again with clearer intent and improved focus.</li>
            </ul>
            </GuideCard>

            {/* Section 6 */}
            <GuideCard title="Common Mistakes to Avoid">
            <ul className="list-disc ml-6 space-y-2 text-slate-300">
                <li>Using vague role titles like “Engineer”.</li>
                <li>Skipping job description or skills.</li>
                <li>Choosing unrealistic experience levels.</li>
                <li>Repeating interviews without improving setup.</li>
            </ul>
            </GuideCard>

      </div>
    </div>
    </motion.div>
  );
};

const GuideCard = ({ title, children }) => (
  <div className="
    bg-slate-950/70
    border border-slate-800
    rounded-xl
    p-6 sm:p-8
    backdrop-blur-sm
    shadow-[0_0_20px_rgba(99,102,241,0.22)]
  ">
    <h2 className="text-2xl font-bold mb-2 text-indigo-300">
      {title}
    </h2>

    {/* amber micro divider */}
    <div className="w-16 h-[2px] bg-amber-400/80 rounded-full mb-4" />

    {children}
  </div>
);

export default Guide;

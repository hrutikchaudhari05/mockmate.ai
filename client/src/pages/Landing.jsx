import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Mic, Brain, Target, Clock, BarChart3, Layers } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const exploreSectionRef = useRef(null);

  const scrollToExplore = () => {
    exploreSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen px-12 sm:px-18 lg:px-28 bg-gradient-to-br from-black via-indigo-950 to-black text-white">

      {/* HERO */}
      <section className="container mx-auto px-6 sm:px-10 lg:px-16 xl:px-24 py-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-6">
          Mock<span className="text-indigo-400">Mate</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
          A realistic AI-powered mock interview platform that simulates real interview pressure,
          evaluates your answers deeply, and tells you exactly where you stand.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-800 border border-slate-800"
            onClick={() => navigate('/login')}
          >
            Start Mock Interview
          </Button>

          <Button
            size="lg"
            // variant="outline"
            className="border-slate-950 border text-indigo-600 bg-slate-900 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700"
            onClick={scrollToExplore}
          >
            Explore How It Works
          </Button>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Why Makes MockMate Different?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Feature icon={Brain} title="Context-Aware AI Interviews"
            desc="Questions are generated using role, experience, job description, interview focus, and target companies."
          />
          <Feature icon={Mic} title="Voice + Text Answering"
            desc="Answer naturally using voice (with transcript) or type structured responses. Voice attempts limited to simulate pressure."
          />
          <Feature icon={Clock} title="Real Interview Pressure"
            desc="Full-screen mode, live timer, limited retries, and auto-end when time runs out."
          />
          <Feature icon={Layers} title="Supports All Interview Types"
            desc="Technical, HR, managerial, finance, product, and more across intern to senior levels."
          />
          <Feature icon={BarChart3} title="Deep AI Evaluation"
            desc="Overall feedback + question-wise analysis including score, strengths, gaps, and ideal answers."
          />
          <Feature icon={Target} title="Fitment & Recommendation"
            desc="AI analyzes how suitable you are for the role and gives hiring-level recommendations."
          />
        </div>
      </section>

      {/* STEPS */}
      <section ref={exploreSectionRef} className="container mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Your Interview Journey
        </h2>

        <div className="max-w-5xl mx-auto space-y-8">
          <Step step="1" title="Configure Your Interview" points={[
            'Any role: Software Engineer, Finance Manager, HR, etc.',
            'Interview type: Tech, HR, Managerial',
            'Experience level & duration',
            'Job description, interview focus & target companies',
          ]} />

          <Step step="2" title="Answer Under Real Conditions" points={[
            'Full-screen interview environment',
            'Type answers or record voice',
            'Maximum 3 voice attempts per question',
          ]} />

          <Step step="3" title="Interview Evaluation" points={[
            'Overall score & hiring recommendation',
            'Strengths & improvement areas',
            'Question-wise scores, feedback & ideal answers',
          ]} />

          <Step step="4" title="Improve with Clarity" points={[
            'Understand exactly where you failed',
            'What to improve for your target companies',
            'Practice again with smarter focus',
          ]} />
        </div>
      </section>
    </div>
  );
};

const Feature = ({ icon: Icon, title, desc }) => (
  <div className="
    p-8 rounded-xl text-center
    bg-slate-900/70
    border border-slate-800
    backdrop-blur-sm
    shadow-[0_0_20px_rgba(99,102,241,0.18)]
  ">
    <div className="flex flex-col items-center mb-3">
      <Icon size={32} className="text-indigo-400/90" />
      {/* amber micro-accent */}
      <div className="w-6 h-[2px] mt-2 bg-amber-500/80 rounded-full" />
    </div>

    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm">{desc}</p>
  </div>
);

const Step = ({ step, title, points }) => (
  <div className="p-6 sm:p-8 bg-slate-900/50 rounded-xl border border-slate-700 backdrop-blur-sm">
    <div className="flex items-center gap-4 mb-4">
      <div className="
        w-10 h-10 rounded-full
        bg-indigo-600/80
        flex items-center justify-center font-bold
        ring-2 ring-amber-400/70
      ">
        {step}
      </div>
      <h3 className="text-2xl font-bold text-indigo-300">{title}</h3>
    </div>

    <ul className="ml-14 space-y-2 text-slate-300 list-disc">
      {points.map((p, i) => (
        <li key={i}>{p}</li>
      ))}
    </ul>
  </div>
);

export default Landing;

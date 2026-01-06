import React, { useState, useEffect } from 'react';
import {motion, useAnimation} from 'framer-motion';

// redux imports 
import { useDispatch } from 'react-redux';
import { createInterview } from '@/store/interviewSlice';   // it is an action in interviewSlice

// shadcn imports 
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { validateSetup } from '@/utils/dataValidation';

// lucide react 
import { AlertCircle } from 'lucide-react';



const Setup = () => {


    // first of all dispatch 
    const dispatch = useDispatch();

    // use navigate as well
    const navigate = useNavigate();

    // state for managing formData 
    const [formData, setFormData] = useState({
        title: "",
        type: "",
        experience: "",
        duration: "", // default 30 mins
        jobDescription: "",
        targetCompanies: "",
        interviewContext: "",
        resume: null
    });

    // adding validation state 
    const [validation, setValidation] = useState({
        hasError: false,
        emptyFields: {}, 
        firstError: null
    });

    // animation ko baar baar chalane ke liye state kee need hai 
    const [shakeTick, setShakeTick] = useState(0);

    const LIMITS = {
        title: 60,
        jobDescription: 1000,
        targetCompanies: 120,
        interviewContext: 300
    }

    const handleCloseSetup = () => {
        setValidation({ hasError: false, emptyFields: {}, firstError: null });
        navigate('/dashboard');
    };

    // handleChange function for taking valus in Input and Textarea 
    const handleChange = (field, value) => {
        if (LIMITS[field] && value.length > LIMITS[field]) return;

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

    };
    
    // handleStartInterview handler after setting up backend 
    const handleStartInterview = async (e) => {
        e.preventDefault();

        // frontend validation 
        const result = validateSetup(formData);
        console.log('Validate Setup: ', result);

        if (result.hasError) {
            setValidation(result);
            setShakeTick(prev => prev + 1);
            return;
        }

        setValidation({ hasError: false, emptyFields: {}, firstError: null });

        // yaha se api call logic will take over
        localStorage.setItem('interview_active', 'false');

        // converting duration to seconds before sending 
        const dataToSend = {
            ...formData,
            duration: Number(formData.duration) * 60
        }

        // Direct dataToSend bheja (nested nhi)
        const res = await dispatch(createInterview(dataToSend));
        console.log('Dispatch Result: ', res);

        if (createInterview.fulfilled.match(res)) {
            const interviewId = res.payload.interview?.id;
            console.log('Interview created, ID:', interviewId);

            if (interviewId) {
                navigate(`/interview-room/${interviewId}`);
            } else {
                console.error('Interview ID missing:', res.payload);
                navigate('/dashboard');
            }
        } 
    }

    

    const shakeSoft = {
        x: [0, -4, 4, -4, 4, 0],
        transition: { duration: 0.3 }
    };

    const shakeHard = {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.45 }
    };

    const animationControls = (field) => {
        if (!validation.hasError) return { x: 0 };

        if (validation.firstError === field) {
            return shakeHard;
        } 

        if (validation.emptyFields[field]) {
            return shakeSoft;
        }

        return { x: 0 };

    };



    return (
        <>
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
            >
                {/* Outer Div - made only for managing the H and W of box */}
                <div className="mx-auto bg-slate-950 border border-slate-800 rounded-xl w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-3xl mt-6 shadow-[0_0_20px_rgba(99,102,251,0.38)]">

                    {/* div inside outer div - responsible for padding */}
                    <div className='px-4 sm:px-6 md:px-8 py-4'>

                        <h2 className="text-2xl md:text-3xl font-bold text-center text-white">Customize Your Interview Options</h2>

                        {validation.hasError ? <p className='text-red-400 text-center text-sm mb-4 mt-2'>Please complete all required fields to continue.</p> : <p className='text-center text-slate-400 text-lg mt-2'>Setup your interview according to your requirements</p>}

                        <div className='h-[1px] bg-amber-500/90 w-full mx-auto mt-2 mb-3 rounded-full' />

                        {/* Yahan tera form aayega */}
                        <form onSubmit={handleStartInterview} className="space-y-3 text-white mb-2">
                            
                            {/* Title Input Area */}
                            <motion.div
                                key={`title-${shakeTick}`}
                                animate={animationControls('title')}
                                className={`border rounded-md border-slate-700 flex md:flex-row items-center cursor-pointer py-1`}
                            >
                                <p className='text-sm md:text-md lg:text-lg flex flex-row items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>
                                    Job Title
                                    {validation?.emptyFields?.title && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                <Input 
                                    className={`bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-md text-center placeholder:text-slate-500 border-slate-500`} 
                                    placeholder="e.g. Software Developer II"
                                    maxLength={60}
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </motion.div>
                            
                            {/* Interview Type Dropdown menu */}
                            <motion.div
                                key={`type-${shakeTick}`}
                                animate={animationControls('type')}
                                className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'
                            >
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>
                                    Interview Type
                                    {validation?.emptyFields?.type && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleChange('type', value)}
                                >
                                    <SelectTrigger className="bg-transparent border-0 border-l rounded-none border-slate-500 text-center justify-center focus:ring-0 focus:ring-offset-0 focus:outline-none ring-0 ring-offset-0 ouline-none w-full data-[placeholder]:text-slate-500">
                                        <SelectValue className='justify-center placeholder:text-slate-500 ' placeholder="Your Interview Type... e.g. Tech" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        className="bg-slate-900 text-white border border-slate-600 "
                                        position="popper"
                                        sideOffset={4}
                                        avoidCollisions={false}
                                    >
                                        <SelectItem
                                            value="tech"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Technical</SelectItem>
                                        <SelectItem
                                            value="hr"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >HR</SelectItem>
                                        <SelectItem
                                            value="managerial"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Managerial</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            {/* Experience Level Dropdown menu */}
                            <motion.div 
                                key={`experience-${shakeTick}`}
                                animate={animationControls('experience')}
                                className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'
                            >
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>
                                    Experience Level
                                    {validation?.emptyFields?.experience && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                
                                <Select
                                    value={formData.experience}
                                    onValueChange={(value) => handleChange('experience', value)}
                                >
                                    <SelectTrigger className="bg-transparent border-0 border-l rounded-none border-slate-500 text-center justify-center focus:ring-0 focus:ring-offset-0 focus:outline-none ring-0 ring-offset-0 ouline-none w-full data-[placeholder]:text-slate-500">
                                        <SelectValue className='justify-center ' placeholder="Experience Level... e.g. 3-5 years (Associate)" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        className="bg-slate-900 text-white border border-slate-600"
                                        position="popper"
                                        sideOffset={4}
                                        avoidCollisions={false}
                                    >
                                        <SelectItem
                                            value="intern"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Intern</SelectItem>
                                        <SelectItem
                                            value="fresher"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Fresher</SelectItem>
                                        <SelectItem
                                            value="associate"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Associate</SelectItem>
                                        <SelectItem
                                            value="mid"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Mid-Level</SelectItem>
                                        <SelectItem
                                            value="sr"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Senior</SelectItem>
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            {/* Duration Dropdown menu */}
                            <motion.div 
                                key={`duration-${shakeTick}`}
                                animate={animationControls('duration')}
                                className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'
                            >
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>
                                    Duration
                                    {validation?.emptyFields?.duration && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                
                                <Select
                                    value={formData.duration ? formData.duration.toString() : ""}
                                    onValueChange={(value) => handleChange('duration', Number(value))}
                                >
                                    <SelectTrigger className="bg-transparent border-0 border-l rounded-none border-slate-500 text-center justify-center focus:ring-0 focus:ring-offset-0 focus:outline-none ring-0 ring-offset-0 ouline-none w-full data-[placeholder]:text-slate-500">
                                        <SelectValue className='justify-center ' placeholder="Interview Duration... e.g. 60 mins (Full Simulation)" />
                                    </SelectTrigger>
                                    <SelectContent 
                                        className="bg-slate-900 text-white border border-slate-600"
                                        position="popper"
                                        sideOffset={4}
                                        avoidCollisions={false}
                                    >
                                        <SelectItem
                                            value="15"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Quick Test - 15 mins</SelectItem>
                                        <SelectItem
                                            value="30"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Standard - 30 mins</SelectItem>
                                        <SelectItem
                                            value="45"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Comprehensive - 45 mins</SelectItem>
                                        <SelectItem
                                            value="60"
                                            className="
                                                text-white 
                                                hover:bg-slate-600 
                                                focus:bg-slate-800
                                                focus:text-white
                                            " 
                                        >Full Simulation - 60 mins</SelectItem>
                                        
                                    </SelectContent>
                                </Select>
                            </motion.div>

                            {/* JD/Skills Textarea */}
                            <motion.div 
                                key={`jobDescription-${shakeTick}`}
                                animate={animationControls('jobDescription')}
                                className='border relative w-full rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'
                            >
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>
                                    Job Description / Skills
                                    {validation?.emptyFields?.jobDescription && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                
                                <Textarea 
                                    placeholder="Paste job description OR key skills (React, Node.js, AWS...) here..."
                                    className="
                                        bg-transparent text-sm md:text-md 
                                        border-0 border-l rounded-none border-slate-500 resize-none text-center overflow-hidden focus:ring-0 focus:ring-offset-0 
                                        placeholder:text-center px-2 w-full text-white placeholder:text-slate-500 py-3 no-scrollbar"
                                    style={{
                                        boxShadow: 'none',
                                        height: '42px',
                                        minHeight: '42px',
                                        maxHeight: '200px',
                                        overflowY: 'hidden', 
                                    }}
                                    maxLength={1000}
                                    value={formData.jobDescription}
                                    onChange={(e) => handleChange('jobDescription', e.target.value)}
                                />
                                {formData.jobDescription.length > 850 && (
                                    <span className="absolute bottom-1 right-2 text-xs text-slate-400">
                                        {formData.jobDescription.length}/1000
                                    </span>
                                )}
                                
                            </motion.div>

                            {/* Targeted Companies Input */}
                            <motion.div 
                                key={`targetCompanies-${shakeTick}`}
                                animate={animationControls('targetCompanies')}
                                className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'
                            >
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2  px-2'>
                                    Targeted Companies
                                    {validation?.emptyFields?.targetCompanies && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                
                                <Input 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-md text-center placeholder:text-slate-500 border-slate-500" 
                                    placeholder="e.g. Google, Microsoft, Perplexity..."
                                    maxLength={120}
                                    value={formData.targetCompanies}
                                    onChange={(e) => handleChange('targetCompanies', e.target.value)}
                                />
                                
                            </motion.div>

                            {/* Interview Context Input */}
                            <motion.div 
                                key={`interviewContext-${shakeTick}`}
                                animate={animationControls('interviewContext')}
                                className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'
                            >
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>
                                    Interview Context
                                    {validation?.emptyFields?.interviewContext && (
                                        <AlertCircle size={16} className='text-red-400 shrink-0' />
                                    )}
                                </p>
                                
                                <Input 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-md text-center placeholder:text-slate-500 border-slate-500" 
                                    placeholder="e.g. ask only DSA questions, give ratings out of 10..."
                                    maxLength={300}
                                    value={formData.interviewContext}
                                    onChange={(e) => handleChange('interviewContext', e.target.value)}
                                />
                                
                            </motion.div>

                            {/* Upload Resume File Section */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-sm md:text-md lg:text-lg flex items-center justify-center text-slate-400 w-1/2 gap-2 px-2'>Upload Resume</p>
                                <Input 
                                    type="file"
                                    accept=".pdf, .doc, .docx" 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-sm md:text-md text-center placeholder:text-slate-500 border-slate-500 file:text-black file:bg-indigo-700 file:rounded" 
                                    onChange={(e) => setFormData({...formData, resume: e.target.files[0]})}
                                />
                            </div>

                        
                            {/* Buttons Setion */}
                            <div className="flex items-center justify-end gap-4 h-12">

                                {/* <Input type="file" className="bg-slate-800 flex items-center justify-center border-0  focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl text-center placeholder:text-slate-500 border-slate-500 file:text-white file:font-light file:bg-indigo-700 file:px-2 file:rounded w-3/5" /> */}

                                <div className='flex flex-row gap-4 items-center justify-end sm:justify-center h-12'>
                                    <Button 
                                        type="button"
                                        onClick={handleCloseSetup}
                                        className="w-full sm:w-auto border-slate-950 border text-indigo-600 bg-slate-900 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-800 border border-slate-800"
                                    >
                                        Start Interview
                                    </Button>
                                </div>
                            </div>

                        </form>

                    </div>

                </div>
            </motion.div>
        </>
    )
}

export default Setup;
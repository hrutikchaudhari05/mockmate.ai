import React, { useState } from 'react';
import {motion} from 'framer-motion';

// redux imports 
import { useDispatch } from 'react-redux';
import { createInterview } from '@/store/interviewSlice';   // it is an action in interviewSlice

// shadcn imports 
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Setup = ({onClose}) => {

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

    // data validation ke liye formValidation check karo 
    const formIsValid = true;

    // Background scroll disable karne ke liye
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    // handleChange function for taking valus in Input and Textarea 
    const handleChange = (field, value) => {

        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };
    
    // handleStartInterview handler after setting up backend 
    const handleStartInterview = async (e) => {
        e.preventDefault();
        localStorage.setItem('interview_active', 'false');

        if (formIsValid) {

            // converting duration to seconds before sending 
            const dataToSend = {
                ...formData,
                duration: Number(formData.duration) * 60
            }

            // Direct dataToSend bheja (nested nhi)
            const result = await dispatch(createInterview(dataToSend));
            console.log('Dispatch Result: ', result);

            if (createInterview.fulfilled.match(result)) {
                const interviewId = result.payload.interview?.id;
                console.log('Interview created, ID:', interviewId);
    
                if (interviewId) {
                    onClose();
                    navigate(`/interview-room/${interviewId}`);
                } else {
                    console.error('Interview ID missing:', result.payload);
                    onClose()
                }
            } else {
                onClose();
            }

            
        }
    }


    
    return (
        <>
            {/* Backdrop/Overlay - Pure screen cover karega, Iss code ka popup ke saath kuchh lena dena nhi hai, ye bss overlay (ek screen lagata hai dashboard aur popup ke bich me) */}
            <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ pointerEvents: 'auto' }} // IMPORTANT: Scroll allow karega
            />
            
            {/* Popup - Center mein fixed */}
            <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center p-4" 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Outer Div - made only for managing the H and W of box */}
                <div className="bg-slate-950 border border-slate-700 rounded-xl w-full max-w-3xl h-full max-h-fit">

                    {/* div inside outer div - responsible for padding */}
                    <div className='px-8 py-4'>

                        <h2 className="text-3xl font-bold text-center text-white">Customize Your Interview Options</h2>

                        <p className='text-center text-slate-500 text-lg mt-2'>Setup your interview according to your requirements</p>

                        <div className='border border-slate-800 rounded-md mt-2 mb-3'></div>

                        {/* Yahan tera form aayega */}
                        <form onSubmit={handleStartInterview} className="space-y-3 text-white mb-2">
                            
                            {/* Title Input Area */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Job Title</p>
                                <Input 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl text-center placeholder:text-slate-500 border-slate-500" 
                                    placeholder="e.g. Software Developer II"
                                    value={formData.title}
                                    onChange={(e) => handleChange('title', e.target.value)}
                                />
                            </div>
                            
                            {/* Interview Type Dropdown menu */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Interview Type</p>
                                
                                <Select
                                    value={formData.type}
                                    onValueChange={(value) => handleChange('type', value)}
                                >
                                    <SelectTrigger className="bg-transparent border-0 border-l rounded-none border-slate-500 text-center justify-center focus:ring-0 focus:ring-offset-0 focus:outline-none ring-0 ring-offset-0 ouline-none w-full data-[placeholder]:text-slate-500">
                                        <SelectValue className='justify-center placeholder:text-slate-500 ' placeholder="Your Interview Type... e.g. Tech" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 text-white border border-slate-600 ">
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
                            </div>

                            {/* Experience Level Dropdown menu */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Difficulty Level</p>
                                
                                <Select
                                    value={formData.experience}
                                    onValueChange={(value) => handleChange('experience', value)}
                                >
                                    <SelectTrigger className="bg-transparent border-0 border-l rounded-none border-slate-500 text-center justify-center focus:ring-0 focus:ring-offset-0 focus:outline-none ring-0 ring-offset-0 ouline-none w-full data-[placeholder]:text-slate-500">
                                        <SelectValue className='justify-center ' placeholder="Experience Level... e.g. 3-5 years (Associate)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 text-white border border-slate-600">
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
                            </div>

                            {/* Duration Dropdown menu */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Duration</p>
                                
                                <Select
                                    value={formData.duration ? formData.duration.toString() : ""}
                                    onValueChange={(value) => handleChange('duration', Number(value))}
                                >
                                    <SelectTrigger className="bg-transparent border-0 border-l rounded-none border-slate-500 text-center justify-center focus:ring-0 focus:ring-offset-0 focus:outline-none ring-0 ring-offset-0 ouline-none w-full data-[placeholder]:text-slate-500">
                                        <SelectValue className='justify-center ' placeholder="Interview Duration... e.g. 60 mins (Full Simulation)" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-slate-900 text-white border border-slate-600">
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
                            </div>

                            {/* JD/Skills Textarea */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Job Description / Skills</p>
                                
                                <Textarea 
                                    placeholder="Paste job description OR key skills (React, Node.js, AWS...) here..."
                                    className="
                                        bg-transparent
                                        border-0 border-l rounded-none border-slate-500 resize-none text-center overflow-hidden focus:ring-0 focus:ring-offset-0 
                                        placeholder:text-center px-2 w-full text-white placeholder:text-slate-500 py-3 no-scrollbar"
                                    style={{
                                        boxShadow: 'none',
                                        height: '42px',
                                        minHeight: '42px',
                                        maxHeight: '200px',
                                        overflowY: 'auto', 
                                    }}
                                    value={formData.jobDescription}
                                    onChange={(e) => handleChange('jobDescription', e.target.value)}
                                />
                                
                            </div>

                            {/* Targeted Companies Input */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Targeted Companies</p>
                                
                                <Input 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl text-center placeholder:text-slate-500 border-slate-500" 
                                    placeholder="e.g. Google, Microsoft, Perplexity..."
                                    value={formData.targetCompanies}
                                    onChange={(e) => handleChange('targetCompanies', e.target.value)}
                                />
                                
                            </div>

                            {/* Interview Context Input */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Interview Context</p>
                                
                                <Input 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl text-center placeholder:text-slate-500 border-slate-500" 
                                    placeholder="e.g. ask only DSA questions, give ratings out of 10..."
                                    value={formData.interviewContext}
                                    onChange={(e) => handleChange('interviewContext', e.target.value)}
                                />
                                
                            </div>

                            {/* Upload Resume File Section */}
                            <div className='border rounded-md border-slate-700 flex flex-row items-center cursor-pointer py-1'>
                                <p className='text-lg flex items-center justify-center text-slate-400 w-1/2'>Upload Resume</p>
                                <Input 
                                    type="file"
                                    accept=".pdf, .doc, .docx" 
                                    className="bg-transparent border-0 border-l rounded-none focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl text-center placeholder:text-slate-500 border-slate-500 file:text-white file:bg-indigo-700 file:rounded" 
                                    onChange={(e) => setFormData({...formData, resume: e.target.files[0]})}
                                />
                            </div>

                        
                            {/* Buttons Setion */}
                            <div className="flex items-center justify-end gap-4 h-12">

                                {/* <Input type="file" className="bg-slate-800 flex items-center justify-center border-0  focus-visible:ring-0 focus-visible:ring-offset-0 text-2xl text-center placeholder:text-slate-500 border-slate-500 file:text-white file:font-light file:bg-indigo-700 file:px-2 file:rounded w-3/5" /> */}

                                <div className='flex gap-4 items-center justify-end'>
                                    <Button 
                                        onClick={onClose}
                                        className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        type="submit"
                                        className="bg-indigo-700 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
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
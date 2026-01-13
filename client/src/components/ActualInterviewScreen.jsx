import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';   
import { Clock, Headphones, Upload } from 'lucide-react';   // for timer
import { Textarea } from './ui/textarea';

// import useSelector for getting data from redux 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchInterviewById, submitAnswer, getTranscriptT, evaluateInverview } from '@/store/interviewSlice';

import { getDynamicNote } from '@/utils/getDynamicNote';

const ActualInterviewScreen = ({ mediaStream }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {interviewId} = useParams();

    // ALL Redux data needed
    const { currentInterview } = useSelector((state) => state.interview);
    const { user } = useSelector(state => state.auth);
    const userId = user?._id;
    const interviewDuration = currentInterview?.duration;
    const currQueIndex = currentInterview?.currentQuestionIndex;
    
    useEffect(() => {
        console.log("Interview Duration: ", interviewDuration);
        console.log("Interview Questions: ", currentInterview?.questions);
        // check kr rha hoo stream mili yaa fir nhi, 
        console.log("Stream received: ", mediaStream);
    }, [mediaStream]);

    // Refs 
    const mediaRecorderRef = useRef(null);  // recorder object re-initialize nhi hona chahiye, aur koi re-renders nhi karna chahiye 
    const chunksRef = useRef([]);   // ye raw audio bytes store karega 
    const recordTimerIdRef = useRef(null);    // timer kaa id store karta hai
    const latestBlobRef = useRef(null);
    const globalTimerRef = useRef(null);
    const prevInterviewIdRef = useRef(interviewId);
    const isEvaluatingRef = useRef(false);

    // all the local states
    const [attempts, setAttempts] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);  // recording started or not
    const [recordSeconds, setRecordSeconds] = useState(0);  // recording ke time count karta hai
    const [isLoading, setIsLoading] = useState(false);  // double clicks prevent karne ke liye
    const [answer, setAnswer] = useState("");           // textarea me likha hua text
    const [timeLeft, setTimeLeft] = useState(interviewDuration);     // global timer
    const [hasAudioBlob, setHasAudioBlob] = useState(false);  // track if audio blob exists
    // const [audioBlob, setAudioBlob] = useState(null);   // audio file save karne ke liye
    const [isEnding, setIsEnding] = useState(false);    // Prevent UI glitch

    // time conversion handler 
    const formatTime = (t) => {
        let hours = Math.floor(t/3600);
        let mins = Math.floor((t % 3600)/60);
        let secs = t % 60;

        if (hours > 0) {
            return `${hours}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
        }
        return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }

    // ALL HANDLERS 
    // 1 - handle start recording 
    const handleStartRecording = async () => {
        // agar stream object nhi hai to record mt karo - permissions nhi hai 
        if (!mediaStream) {
            console.log("Stream is not present");
            return;
        }

        chunksRef.current = [];

        // 1. initialize mediaRecorder
        // naya MediaRecorder banaya
        mediaRecorderRef.current = new MediaRecorder(mediaStream, {
            mimeType: 'audio/webm'
        });     // iske notes niche likhe hai

        // ab audio data collect karna padega 
        mediaRecorderRef.current.ondataavailable = (event) => {
            // its like collecting water in bucket
            if (event.data.size > 0) {
                chunksRef.current.push(event.data);
                // NOTES: humne chunksRef kyon use kiya --> audio data small pieces me aata hai, isliye array mein collect karna padta hai 
            }
        };

        // recording ko rokne kaa logic
        mediaRecorderRef.current.onstop = () => {
            console.log('Recording stopped, chunks: ', chunksRef.current.length);

            const newBlob = new Blob(chunksRef.current, { type: "audio/webm" });
            latestBlobRef.current = newBlob;
            setHasAudioBlob(true);  // Set state for rendering
            console.log('Final Blob: ', newBlob.size);
            setIsConverting(true);

            // ye ek iife hai because .onstop cannot be async
            (async () => {
                const result = await dispatch(getTranscriptT({
                    interviewId,
                    audioBlob: newBlob,
                    userId,
                    currQueIndex
                }));

                if (getTranscriptT.fulfilled.match(result)) {
                    setAnswer(prev => prev + "\n" + result.payload.transcript);
                    setAttempts(prev => prev + 1);
                }

                setIsConverting(false);
            })();
        }
        
        // 2. ab actual recording start karni padegi 
        mediaRecorderRef.current.start();
        setIsRecording(true);

        
        // abhi recording timer shure karte hai 
        recordTimerIdRef.current = setInterval(() => {
            setRecordSeconds(prev => prev + 1);
        }, 1000);
    }

    // combined action for handling audio recording 
    const handleRecordAction = () => {
        if (isRecording) {
            // Stop recording and start conversion
            handleStopRecording();
            
        } else {

            if (attempts >= 3) {
                alert("Reached maximum limit of recording audio! Please type you answer manually!");
                return;
            }

            handleStartRecording();
        }
    }

    // 2 - stop recording 
    const handleStopRecording = useCallback(() => {

        // 1. recording close karna padega 
        if (mediaRecorderRef.current && isRecording) {
            console.log("Recording stopped after interview ended!")
            mediaRecorderRef.current.stop();
        }

        // 2. timer band karna padega 
        if (recordTimerIdRef.current) {
            clearInterval(recordTimerIdRef.current);
        }

        setIsRecording(false);
        // baadme media recorder stop karenge aur blob ko transcript me convert karenge 

        setRecordSeconds(0);

    }, [isRecording]);

    // 3 - when user types something 
    const handleAnswerChange = (e) => {
        setAnswer(e.target.value);
    };

    // 4 - submit and next
    const handleSubmit = async () => {

        if (!answer.trim()) {
            alert("Please provide an answer before submitting!");
            return;
        }

        setIsConverting(false);
        setAttempts(0);
        // pehle loading on
        setIsLoading(true);

        try {
            // 1. submit answer api call - ALWAYS submit the answer first
            const submitResult = await dispatch(submitAnswer({
                interviewId: interviewId,
                answerText: answer,
                audioUrl: latestBlobRef.current ? 'temp_url' : ''
            }))

            // 2. checking success
            if (!submitAnswer.fulfilled.match(submitResult)) {

                console.error("Submit failed: ", submitResult.error);
                alert("Failed to submit answer. Please try again.");
                setIsLoading(false);
                return;
            }

            // 3. local states ko reset karo - upar waale operations hone ke baad firse local states ko reset karna padega
            setAnswer('');
            setRecordSeconds(0);
            chunksRef.current = [];
            latestBlobRef.current = null;
            setHasAudioBlob(false);

            // 4. interviewData ko refresh karo
            const fetchResult = await dispatch(fetchInterviewById(interviewId));
            if (!fetchInterviewById.fulfilled.match(fetchResult)) {
                console.error("Failed to fetch updated interview!");
                setIsLoading(false);
                return;
            }

            // 5. getting fresh data from redux 
            const updatedInterview = fetchResult.payload;
            console.log("Updated Interview: ", updatedInterview);

            // 6. check if this was the last question 
            const isLastQuestion = updatedInterview.currentQuestionIndex >= updatedInterview.questions.length;

            if (isLastQuestion) {
                console.log("Last question submitted, ending interview...");
                setIsEnding(true);

                setTimeout(() => {
                    handleEndInterview();
                }, 300);
                return;
            }

            // 7. for non-last questions, just remove loading
            setIsLoading(false);
        } catch (error) {
            console.error("Submit error: ", error);
            alert("An error occurred. Please try again.");
            setIsLoading(false);
        }

    }

    // 5 - End Interview 
    const handleEndInterview = useCallback(async () => {

        // console.log(sessionStorage.getItem('token'));

        // preventing multiple simultaneous evaluations 
        if (isEvaluatingRef.current) {
            console.log("Evaluation already in progress, skipping...");
            return;
        }

        isEvaluatingRef.current = true;

        // pehle recording band karo 
        if (isRecording) {
            handleStopRecording();
        }

        // stop timer first 
        if (globalTimerRef.current) {
            clearInterval(globalTimerRef.current);
            globalTimerRef.current = null;
        }

        localStorage.removeItem('time_left');
        localStorage.setItem('interview_active', 'false');

        if (currentInterview?.status === 'evaluated') {
            // Already evaluated, just go to feedback
            navigate(`/feedback/${interviewId}`);
            isEvaluatingRef.current = false;
            return;
        }

        // showing loading state 
        setIsLoading(true);

        try {
            console.log("Starting evaluation for interview: ", interviewId);

            const result = await dispatch(evaluateInverview(interviewId));

            if (evaluateInverview.rejected.match(result)) {
                throw new Error(result.payload || "Evaluation failed");
            }

            if (document.fullscreenElement && document.exitFullscreen) {
                await document.exitFullscreen();
            }

            // aur dusre page pr navigate kr do (feedback page)
            // but abhi ke liye, setupInterview page pr navigate karta hoo for rechecking everything 
            navigate(`/feedback/${interviewId}`)

        } catch (error) {
            console.error("Evaluation failed: ", error);

            const errorMessage = error.message || "Feedback generation failed";

            alert(`${errorMessage}. Please try again...!`);
            setIsLoading(false);
            isEvaluatingRef.current = false;
        }
        
        // Back button normal karo
        // window.onpopstate = null;
        
    }, [currentInterview?.status, interviewId, isRecording, navigate, dispatch, handleStopRecording]);

    
    // ActualInterviewScreen.jsx me add:
    useEffect(() => {
        if (!currentInterview && interviewId) {
            console.log("Interview ID being sent: ", interviewId);
            console.log("Interview Duration from Redux:", interviewDuration, "Type:", typeof interviewDuration);
            dispatch(fetchInterviewById(interviewId));
        }
    }, [currentInterview, interviewId, dispatch]);

    
    useEffect(() => {
        if (currentInterview) {
            console.log("InterviewData: ", currentInterview);
            console.log("Interview Duration: ", currentInterview.duration);
            console.log("Interview Question: ", currentInterview?.questions);
            console.log('InterviewId: ', interviewId);
        }
    }, [currentInterview])
    
    useEffect(() => {
        console.log('Stream Prop: ', mediaStream);
    }, [mediaStream])


    // agar user interview chhod kr dusre page pr gaya to bhi mic access active rahega, to uski wajah se following problems occur honge:
    // 1. battery drain karega 
    // 2. privacy issue hai
    // 3. Memory leak create karega
    // iska ek solution hai ke hum ek cleanup function banate hai, so that jb component unmount hoga tb mic access band kr denge 
    useEffect(() => {
        // ye fun tb run hoga jb component UNMOUNT ho 
        return () => {
            console.log("Cleaning up media stream...");

            // check if media stream exist karta hia ya nhi 
            if (mediaStream) {
                // ab media stream ke saare tracks band karne padenge 
                mediaStream.getTracks().forEach(track => {
                    track.stop();   // track ek particular type ka stream hai like audio track video track
                    console.log('Mic track stopped!');
                });
            }

        };
    }, [mediaStream]); // jb bhi mediaStream change hogi tb ye cleanup fun firse banega

    // sideEffect - timer countdown - auto submit interview when timer ends
    useEffect(() => {
        if (!interviewDuration) return;

        if (currentInterview?.status === 'evaluated') {
            navigate(`/feedback/${interviewId}`);
            return;
        }; // wait until duration is available

        // ALWAYS start fresh for new interview
        localStorage.removeItem('time_left');  // <-- ADD THIS

        // timer restore karna padega localStorage se 
        const savedTime = localStorage.getItem('time_left');
        const initialTime = savedTime ? parseInt(savedTime) : interviewDuration;
        console.log('Initial time: ', {savedTime, interviewDuration, initialTime});
        
        // Set initial time
        setTimeLeft(initialTime);

        globalTimerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                // agar time is already 0, ab interval clear karte hai 
                if (prev <= 0) {
                    clearInterval(globalTimerRef.current); 
                    localStorage.removeItem('time_left');
                    // CAUTION: pehle maine handleEndInterview ya pr use kiya thaa, but wo render issues create kr rha thaa so maine uske liye alag useEffect use kiya 
                    return 0;
                }
                // otherwise reduce time every second 
                const newTime = prev - 1;
                // ab newTime ko localStorage me save karenge 
                localStorage.setItem('time_left', newTime);
                return newTime;
            });
        }, 1000);

        // cleanup code - component unmount hone pr timer band kr do
        return () => {
            if (globalTimerRef.current) clearInterval(globalTimerRef.current);
        }
    }, [interviewDuration, currentInterview?.status, interviewId, navigate]);

    // Clear timer when interview ID changes 
    useEffect(() => {
        // Clean old timer when interview ID changes
        if (prevInterviewIdRef.current !== interviewId) {
            localStorage.removeItem('time_left');
            prevInterviewIdRef.current = interviewId;
        }
    }, [interviewId]);


    // Ab handleEndInterview ke liye alag useEffect 
    useEffect(() => {
        if (interviewDuration && timeLeft === 0 && !isEvaluatingRef.current) {
            console.log('Timer expired!');

            // timer khatam hone pr recording band kr do 
            if (isRecording) {
                handleStopRecording();
            }

            handleEndInterview();
        }
    }, [timeLeft, interviewDuration, isRecording, handleStopRecording, handleEndInterview]) 



    // back button disable
    // useEffect(() => {
    //     // Interview start hone ke baad back button block
    //     window.history.pushState(null, '', window.location.href);
        
    //     window.onpopstate = () => {
    //         window.history.pushState(null, '', window.location.href);
    //         alert('Interview complete hone tak back nahi ja sakte!');
    //     };
        
    //     return () => {
    //         window.onpopstate = null; // Cleanup jab interview khatam ho
    //     };
    // }, []);

    // Browser unload warning
    useEffect(() => {
        // Force reload if user goes back
        window.onbeforeunload = () => {
            return "Interview chal raha hai, sure ho exit karna chahte ho?";
        };
        
        return () => {
            window.onbeforeunload = null;
        };
    }, []);

    // audio blob auto cleaner 
    useEffect(() => {
        if (hasAudioBlob && !isRecording) {
            const timer = setTimeout(() => {
                latestBlobRef.current = null;
                setHasAudioBlob(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [hasAudioBlob, isRecording]);


    // Imp Metadata - SAFE ACCESS WITH DEFAULTS
    const questions = currentInterview?.questions || [];
    const currentQuestion = questions[currQueIndex] || {};
    const questionObj = currentQuestion.questionObj || {};

    const questionText = questionObj.qtxt || "Question not available";
    const difficulty = questionObj.qd || "medium";
    const questionType = questionObj.qtyp || "conceptual";
    const estimatedTime = questionObj.et || 120;
    const expectedWordCount = questionObj.wc || 150;

    const displayQuestionNumber = Math.min((currQueIndex || 0) + 1, questions.length);

    if (isEnding) {
        return (
            <div className='h-screen w-full bg-slate-950 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='text-xl text-slate-300 mb-2'>Submitting final answer...</div>
                    <div className='text-md text-slate-500'>Preparing your feedback...</div>
                </div>
            </div>
        );
    }


    return (

        // ye main div hai full screen mode waala
        <div className='h-screen w-full bg-slate-950 flex flex-col font-sans text-slate-100' >
            
            {/* Top Bar */}
            <header className='bg-slate-950 border-b border-slate-800 flex flex-row justify-between items-center px-8 py-4'>

                {/* left me jo interview details aur question index info hai uska div */}
                <div>
                    <h1 className='text-lg font-semibold'>{currentInterview?.title || 'Loading...'}</h1>
                    <div className='text-slate-500 mt-1 text-sm'>
                        Question {displayQuestionNumber} of {questions?.length || 0}
                    </div>
                </div>

                {/* right me jo countdown and end interview button hai uska div */}
                <div className='flex flex-row items-center gap-4'>

                    {/* TIMER */}
                    <div className='flex flex-row justify-center items-center text-slate-300 bg-slate-900 gap-2 px-4 py-1.5 rounded-md border border-slate-800'>
                        <Clock size={16}/>
                        <span className='text-lg font-medium font-mono'>
                            {formatTime(timeLeft)}
                        </span>
                    </div>

                    {/* END INTERVIEW */}
                    <Button 
                        variant="destructive"
                        onClick={handleEndInterview}
                        disabled={isLoading || isConverting || currQueIndex < currentInterview.questions.length - 1}
                        className="bg-red-500/80"
                    >
                        End Interview
                    </Button>
                </div>
            </header>

            {/* ye main container hai -> yaha split screen add karni padegi */}
            <main className='flex-1 grid grid-cols-1 lg:grid-cols-5 lg:gap-1 py-2'>

                {/* LEFT: Question Area */}
                <div className='border-r border-slate-800 flex flex-col justify-start lg:justify-start p-8 lg:p-12 lg:pt-40 bg-slate-950/50 lg:col-span-2'>

                    {/* QUESTION META BAR */}
                    <div
                        className="
                            flex flex-wrap gap-1.5 md:gap-2 mb-4
                        "
                    >
                        <MetaBadge
                            label="Difficulty"
                            value={difficulty}
                            className={DIFFICULTY_STYLES[difficulty]}
                        />

                        <MetaBadge
                            label="Type"
                            value={questionType}
                            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        />

                        <MetaBadge
                            label="Words"
                            value={expectedWordCount}
                            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        />

                        <MetaBadge
                            label="Time"
                            value={`${formatTime(estimatedTime).substring(1)}m`}
                            // className="bg-slate-700/40 text-slate-300 border-slate-600"
                            className="bg-indigo-500/10 text-indigo-400 border-indigo-500/30"
                        />
                    </div>

                    {/* QUESTION */}
                    <h2 className='text-2xl md:text-3xl lg:text-4xl leading-snug text-white mb-3 font-light'>
                        {questionText}
                    </h2>

                    {/* DYNAMIC NOTE */}
                    {getDynamicNote({
                        difficulty,
                        type: questionType,
                        expectedWords: expectedWordCount,
                    }) && (
                        <p className="text-slate-400 text-sm max-w-xl ">
                            <span className="text-indigo-400 font-medium">Note:</span>{" "}
                            {getDynamicNote({
                                difficulty,
                                type: questionType,
                                expectedWords: expectedWordCount,
                            })}
                        </p>
                    )}
                </div>

                {/* RIGHT: Answer Area - partition div */}
                <div className='lg:col-span-3 p-4 lg:p-8 bg-slate-950 flex flex-col'>

                    {/* logic div - ab content ke liye alag div banaya to avoid confusion between partion div and logic div */}
                    <div className='flex-1 flex flex-col rounded-lg border border-slate-800 overflow-hidden'>
                        
                        {/* EDITOR TOOLBAR */}
                        <div className='px-4 py-3 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center'>
                            
                            {/* TEXT EDITOR NAME */}
                            <span className='text-xs font-mono uppercase text-slate-500 tracking-widest'>Answer Editor</span>

                            {/* PULSE INDICATOR FOR RECORDING */}
                            {isRecording && (
                                <span className='text-red-400 text-xs flex items-center'>
                                    ● Recording... {formatTime(recordSeconds)}
                                </span>
                            )}
                        </div>

                        {/* MAIN TEXT EDITOR */}
                        <Textarea 
                            className="bg-slate-900/50 flex-1 w-full p-4 border-0 text-slate-200 text-sm font-mono resize-none focus:outline-none focus:ring-0 leading-relaxed placeholder:text-slate-500"
                            style={{outline: 'none', boxShadow: 'none'}}
                            placeholder="// Type your answer here..."
                            value={answer} 
                            onChange={handleAnswerChange}
                        />

                        {/* BOTTOM ACTIONS - START RECORDING & SUBMIT QUESTIONS */}
                        <div className='px-4 py-3 border-t border-slate-800 bg-slate-900/50 flex justify-between items-center'>
                            
                            <div className='flex items-center gap-3'>
                                {/* START RECORDING */}
                                <Button
                                    className="bg-indigo-600/70 hover:bg-indigo-700/70 border border-indigo-950"
                                    disabled={attempts >= 3 || isConverting || isLoading}
                                    onClick={handleRecordAction}
                                >
                                    {isRecording ? "Stop Recording" : isConverting ? 'Converting to transcript...' : `Record Voice (${attempts}/3)`}
                                </Button>

                                {/* Show Saved Status */}
                                {hasAudioBlob && !isRecording && (
                                    <span className='text-green-400 text-sm'>✓ Audio saved</span>
                                )}

                                {/* <Button 
                                    onClick={playAudio}
                                    disabled={isConverting || isLoading}
                                    className="border-slate-700 border text-slate-400 bg-slate-950/80 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700/80 hover:text-indigo-500"
                                >
                                    <Headphones className='text-indigo-500/80' />
                                    Test Audio
                                </Button> */}
                                
                            </div>

                            {/* NEXT BUTTON */}
                            <Button
                                disabled={isLoading || isConverting}
                                onClick={handleSubmit}
                                className="border-slate-700 border text-slate-400 bg-slate-950/80 font-bold hover:bg-slate-950 hover:border hover:border-indigo-500/80 hover:text-indigo-400"
                                
                            >
                                {currQueIndex >= questions.length - 1 
                                    ? (isLoading ? 'Saving...' : "End Interview") 
                                    : (isLoading ? 'Submitting...' : "Submit & Next")}
                                
                            </Button>
                        </div>
                    </div>

                </div>

            </main>

        </div>
    )
}

// IMP Code for JSX 
const DIFFICULTY_STYLES = {
  easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  medium: "bg-amber-400/10 text-amber-400/90 border-amber-400/30",
  hard: "bg-red-500/10 text-red-400 border-red-500/30",
  advanced: "bg-purple-600/10 text-purple-400 border-purple-600/30",
};

const MetaBadge = ({ label, value, className }) => {
    if (!value) return null;
    return (
        <div
            className={`text-xs px-3 py-1 rounded-full border font-mono tracking-wide ${className}`}
        >
            <span className='opacity-60'>{label}:</span> {value}
        </div>
    );
};




export default ActualInterviewScreen;


/*

    # Memory Leak - bacha hua kaam jo band nhi hua
    - Real World Example:
        TV remote = Battery lagaya, use kiya, band nahi kiya → Battery khatam (memory leak)
        Paani ka tap = Khola, use kiya, band nahi kiya → Paani barbaad (memory leak)

    - Our Case:
        Interview timer = Agar component band hone ke baad bhi chalta rahe → Memory khayega
        Cleanup function = Remote ki battery nikal dena/Tap band kar dena


    # MediaRecorder browser ka built-in class hai audio record karne ke liye.
    - jaise new Date() se date object banate hai, waise hee new MediaRecorder() se recording object banate hain.

    # Blob ek class hai, jo file banane ke liye use kee jaati hai, isme 2 parameters hote hai mainly
    - parameter1 - array of data pieces // [chunk1, chunk2, chunk3]
    - parameter2 - file type (options)  // { type: 'audio/webm }


    


*/
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from './ui/button';   
import { Clock, Upload } from 'lucide-react';   // for timer
import { Textarea } from './ui/textarea';

// import useSelector for getting data from redux 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchInterviewById, submitAnswer, getTranscriptT, evaluateInverview } from '@/store/interviewSlice';

const ActualInterviewScreen = ({ stream }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const {interviewId} = useParams();

    // ALL Redux data needed
    const { currentInterview } = useSelector((state) => state.interview);
    const { user } = useSelector(state => state.auth);
    const userId = user?._id;
    const interviewDuration = currentInterview?.duration;
    const currQueIndex = currentInterview?.currentQuestionIndex;
    

    // Refs 
    const mediaRecorderRef = useRef(null);  // recorder object re-initialize nhi hona chahiye, aur koi re-renders nhi karna chahiye 
    const chunksRef = useRef([]);   // ye raw audio bytes store karega 
    const recordTimerIdRef = useRef(null);    // timer kaa id store karta hai
    const latestBlobRef = useRef(null);
    const globalTimerRef = useRef(null);
    const prevInterviewIdRef = useRef(interviewId);

    // all the local states 
    const [attempts, setAttempts] = useState(0);
    const [isConverting, setIsConverting] = useState(false);
    const [isRecording, setIsRecording] = useState(false);  // recording started or not
    const [recordSeconds, setRecordSeconds] = useState(0);  // recording ke time count karta hai
    const [isLoading, setIsLoading] = useState(false);  // double clicks prevent karne ke liye
    const [answer, setAnswer] = useState("");           // textarea me likha hua text 
    const [timeLeft, setTimeLeft] = useState(interviewDuration);     // global timer 
    // const [audioBlob, setAudioBlob] = useState(null);   // audio file save karne ke liye
     


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
        if (!stream) {
            console.log("Stream is not present");
            return;
        }

        chunksRef.current = [];

        // 1. initialize mediaRecorder
        // naya MediaRecorder banaya
        mediaRecorderRef.current = new MediaRecorder(stream, {
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


    // testing audio playback 
    const playAudio = () => {
        const blob = latestBlobRef.current;
        if (!blob) return;
        const audioUrl = URL.createObjectURL(blob);
        new Audio(audioUrl).play();
    }


    // 3 - when user types something 
    const handleAnswerChange = (e) => {
        setAnswer(e.target.value);
    };

    // 4 - submit and next 
    const handleSubmit = async () => {

        setIsConverting(false);
        setAttempts(0);

        // 0. pehle currQueIndex valid hai yaa nhi wo check karo 
        if (currQueIndex >= currentInterview.questions.length - 1) {
            console.log("Interview Complete!");
            // ab auto submit karo feedback page pr 
            handleEndInterview();
            return;
        }

        // 1. loading status on 
        setIsLoading(true);
        // baadme: transcript + audio + questionId backend ko send karna padega 

        // 2. submit answer api call 
        const result = await dispatch(submitAnswer({
            interviewId: interviewId,
            answerText: answer,
            audioUrl: latestBlobRef.current ? 'temp_url' : ''

        }))
        
        // 3. checking success 
        if (submitAnswer.fulfilled.match(result)) {
            // 4. local states ko reset karo - upar waale operations hone ke baad firse local states ko reset karna padega 
            setAnswer('');
            setRecordSeconds(0);
            chunksRef.current = [];
            latestBlobRef.current = null;

            // 5. interviewData ko refresh karo 
            dispatch(fetchInterviewById(interviewId));
        } else {
            // Error handling 
            console.error("Submit failed: ", result.error);
        }

        // 6. Loading band karo 
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
        
    }

    // 5 - End Interview 
    const handleEndInterview = useCallback(async () => {

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

        if (currentInterview?.status === 'evaluated') {
            // Already evaluated, just go to feedback
            navigate(`/feedback/${interviewId}`);
            return;
        }

        // pehle localStorage me interview_active false karna padega 
        localStorage.setItem('interview_active', 'false');
        // final submission send karo, confirmation modal send karo

        // showing loading state 
        setIsLoading(true);

        try {
            await dispatch(evaluateInverview(interviewId)).unwrap();

            if (document.exitFullscreen) {
                document.exitFullscreen();
            }

            // aur dusre page pr navigate kr do (feedback page)
            // but abhi ke liye, setupInterview page pr navigate karta hoo for rechecking everything 
            navigate(`/feedback/${interviewId}`)

        } catch (error) {
            console.error("Evaluation failed: ", error);
            alert('Feedback generation failed. Please try again.');
            setIsLoading(false);
        }
        
        // Back button normal karo
        // window.onpopstate = null;
        
    }, [currentInterview?.status, interviewId, isRecording, navigate, dispatch]);

    
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
        console.log('Stream Prop: ', stream);
    }, [stream])


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
            if (stream) {
                // ab media stream ke saare tracks band karne padenge 
                stream.getTracks().forEach(track => {
                    track.stop();   // track ek particular type ka stream hai like audio track video track
                    console.log('Mic track stopped!');
                });
            }

        };
    }, [stream]); // jb bhi mediaStream change hogi tb ye cleanup fun firse banega

    // sideEffect - timer countdown - auto submit interview when timer ends
    useEffect(() => {
        if (!interviewDuration || currentInterview?.status === 'evaluated') return; // wait until duration is available

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
    }, [interviewDuration]);

    useEffect(() => {
        // Clean old timer when interview ID changes
        if (prevInterviewIdRef.current !== interviewId) {
            localStorage.removeItem('time_left');
            prevInterviewIdRef.current = interviewId;
        }
    }, [interviewId]);


    // Ab handleEndInterview ke liye alag useEffect 
    useEffect(() => {
        if (interviewDuration && timeLeft === 0) {
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

    useEffect(() => {
        // Force reload if user goes back
        window.onbeforeunload = () => {
            return "Interview chal raha hai, sure ho exit karna chahte ho?";
        };
        
        return () => {
            window.onbeforeunload = null;
        };
    }, []);


    
    return (

        // ye main div hai full screen mode waala
        <div className='h-screen w-full bg-slate-950 flex flex-col font-sans text-slate-100' >
            
            {/* Top Bar */}
            <header className='bg-slate-950 border-b border-slate-800 flex flex-row justify-between items-center px-8 py-4'>

                {/* left me jo interview details aur question index info hai uska div */}
                <div>
                    <h1 className='text-lg font-semibold'>{currentInterview?.title || 'Loading...'}</h1>
                    <div className='text-slate-500 mt-1 text-sm'>
                        Question {currQueIndex + 1} of {currentInterview?.questions?.length}
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
                    >
                        End Interview
                    </Button>
                </div>
            </header>

            {/* ye main container hai -> yaha split screen add karni padegi */}
            <main className='flex-1 grid grid-cols-1 lg:grid-cols-5'>

                {/* LEFT: Question Area */}
                <div className='border-r border-slate-800 flex flex-col justify-center items-left p-8 lg:p-12 bg-slate-950/50 lg:col-span-2'>
                    
                    {/* QUESTION */}
                    <h2 className='text-3xl text-white mb-4 font-light'>
                        {currentInterview?.questions[currQueIndex].questionObj.qtxt}
                    </h2>

                    {/* NOTE */}
                    <p className='text-slate-400 text-sm'>
                        <span className='text-indigo-500 font-semibold'>Note:</span> Provide a detailed explanation. You can write code or pseudocode in the text editor.
                    </p>
                </div>

                {/* RIGHT: Answer Area - partition div */}
                <div className='lg:col-span-3 p-6 lg:p-8 bg-slate-950 flex flex-col'>

                    {/* logic div - ab content ke liye alag div banaya to avoid confusion between partion div and logic div */}
                    <div className='flex-1 flex flex-col rounded-lg border border-slate-800 bg-slate-900 overflow-hidden'>
                        
                        {/* EDITOR TOOLBAR */}
                        <div className='px-4 py-3 border-b border-slate-800 bg-slate-900 flex justify-between items-center'>
                            
                            {/* TEXT EDITOR NAME */}
                            <span className='text-xs font-mono uppercase text-slate-500 tracking-widest'>Answer Editor</span>

                            {/* PULSE INDICATOR FOR RECORDING */}
                            {isRecording && (
                                <span className='text-red-400 text-xs flex items-center'>
                                    ● Recording... {recordSeconds}
                                </span>
                            )}
                        </div>

                        {/* MAIN TEXT EDITOR */}
                        <Textarea 
                            className=" flex-1 w-full p-4 bg-transparent border-0 text-slate-200 text-lg font-mono resize-none focus:outline-none focus:ring-0 leading-relaxed"
                            style={{outline: 'none', boxShadow: 'none'}}
                            placeholder="// Type your answer here..."
                            value={answer}
                            onChange={handleAnswerChange}
                        />

                        {/* BOTTOM ACTIONS - START RECORDING & SUBMIT QUESTIONS */}
                        <div className='px-4 py-3 border-t border-slate-800 bg-slate-900 flex justify-between items-center'>
                            
                            <div className='flex items-center gap-3'>
                                {/* START RECORDING */}
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    disabled={attempts >= 3 || isConverting}
                                    onClick={handleRecordAction}
                                >
                                    {isRecording ? "Stop Recording" : isConverting ? 'Converting to transcript...' : `Record Voice (${attempts}/3)`}
                                </Button>

                                {/* Show Saved Status */}
                                {latestBlobRef.current && !isRecording && (
                                    <span className='text-green-400 text-sm'>✓ Audio saved</span>
                                )}

                                <Button onClick={playAudio}>🔊 Test Play</Button>
                                
                            </div>

                            {/* NEXT BUTTON */}
                            <Button
                                disabled={isLoading}
                                onClick={handleSubmit}
                            >
                                {currQueIndex >= currentInterview?.questions.length - 1 
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
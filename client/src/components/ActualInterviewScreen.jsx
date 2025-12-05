import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';   
import { Clock } from 'lucide-react';   // for timer
import { Textarea } from './ui/textarea';

// import useSelector for getting data from redux 
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// import reducer 
import { nextQuestion } from '@/store/interviewSlice';


const ActualInterviewScreen = ({ stream }) => {

    const navigate = useNavigate();
    const dispatch = useDispatch();

    // ALL Redux data needed
    const interviewData = useSelector((state) => state.interview.currentInterview);
    useEffect(() => {
        console.log("InterviewData: ", interviewData);
    }, [])

    const interviewDuration = interviewData?.setup?.duration;   // default 30 mins
    // console.log(interviewDuration)

    // Refs 
    const mediaRecorderRef = useRef(null);  // recorder object re-initialize nhi hona chahiye, aur koi re-renders nhi karna chahiye 
    const chunksRef = useRef([]);   // ye raw audio bytes store karega 
    const recordTimerIdRef = useRef(null);    // timer kaa id store karta hai

    // all the local states 
    const [isRecording, setIsRecording] = useState(false);  // recording started or not
    const [recordSeconds, setRecordSeconds] = useState(0);  // recording ke time count karta hai
    const [isLoading, setIsLoading] = useState(false);  // double clicks prevent karne ke liye
    const [answer, setAnswer] = useState("");           // textarea me likha hua text 
    const [timeLeft, setTimeLeft] = useState(interviewDuration);     // global timer 
    const [audioBlob, setAudioBlob] = useState(null);   // audio file save karne ke liye
    

    const questions = [
        "What is prop drilling and how to tackle it?",
        "What is the difference between React.memo and useMemo?",
        "Tell me how would you use useRef and useReducer?"
    ];

    
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

    // sideEffect - timer countdown - auto submit interview when timer ends
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    handleEndInterview();   // time over - interview end 
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // cleanup code - component unmount hone pr timer band kr do
        return () => clearInterval(timer);
    }, []);


    // ALL HANDLERS 
    // 1 - start recording 
    const handleStartRecording = () => {

        try {
            // agar stream object nhi hai to record mt karo - permissions nhi hai 
            if (!stream) {
                console.log("Stream is not present");
                return;
            }
            
            // 1. initialize mediaRecorder

            // naya MediaRecorder banaya
            mediaRecorderRef.current = new MediaRecorder(stream);     // iske notes niche likhe hai
            
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
                // saare chunks ko combine karna padega 
                const audioBlob = new Blob(chunksRef.current, {type: 'audio/webm'});    // iske notes niche likhe hai
                setAudioBlob(audioBlob);
                console.log('Audio saved: ', audioBlob.size, 'bytes');
            };
            
            // 2. ab actual recording start karni padegi 
            chunksRef.current = [];
            mediaRecorderRef.current.start();
            setIsRecording(true);

            
            // abhi recording timer shure karte hai 
            recordTimerIdRef.current = setInterval(() => {
                setRecordSeconds(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Recording failed: ', error);
            setIsRecording(false);
            alert('Recording failed! Please try again.');
        }
    }

    // 2 - stop recording 
    const handleStopRecording = () => {

        // 1. recording close karna padega 
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }

        // 2. timer band karna padega 
        if (recordTimerIdRef.current) {
            clearInterval(recordTimerIdRef.current);
        }

        setIsRecording(false);
        // baadme media recorder stop karenge aur blob ko transcript me convert karenge 
    }


    // 3 - when user types something 
    const handleAnswerChange = (e) => {
        setAnswer(e.target.value);
    };

    // 4 - submit and next 
    const handleSubmit = () => {

        // 0. pehle currQueIndex valid hai yaa nhi wo check karo 
        if (currQueIndex >= questions.length - 1) {
            console.log("Interview Complete!");
            // ab auto submit karo feedback page pr 
            handleEndInterview();
            return;
        }

        // 1. loading status on 
        setIsLoading(true);
        // baadme: transcript + audio + questionId backend ko send karna padega 

        // 2. currentAnswer ka object banake save karna padega 
        const currentAnswer = {
            text: answer,
            audio: audioBlob,
            questionIndex: currQueIndex,
            timestamp: new Date().toISOString()
        }
        console.log("Saving Answer: ", currentAnswer);

        // 3. next que pr move kiya - hum currentQuestionIndex redux se le rhe hai to usse update karne ke liye hame ek action bhi dispatch karna padega
        dispatch(nextQuestion());

        // 4. local states ko reset karo - upar waale operations hone ke baad firse local states ko reset karna padega 
        setAnswer('');
        setAudioBlob(null);
        setRecordSeconds(0);
        chunksRef.current = [];

        // 5. Loading band karo 
        setTimeout(() => {
            setIsLoading(false);
        }, 500);
        
    }

    // 5 - End Interview 
    const handleEndInterview = () => {
        // final submission send karo, confirmation modal send karo 
        // aur dusre page pr navigate kr do (feedback page)
        // but abhi ke liye, setupInterview page pr navigate karta hoo for rechecking everything 
        navigate("/dashboard")
    }


    // extract currQueIndex from redux data 
    const currQueIndex = interviewData?.currentQuestionIndex;

    

    return (

        // ye main div hai full screen mode waala
        <div className='h-screen w-full bg-slate-950 flex flex-col font-sans text-slate-100' >
            
            {/* Top Bar */}
            <header className='bg-slate-950 border-b border-slate-800 flex flex-row justify-between items-center px-8 py-4'>

                {/* left me jo interview details aur question index info hai uska div */}
                <div>
                    <h1 className='text-lg font-semibold'>{interviewData?.setup?.title || 'Loading...'}</h1>
                    <div className='text-slate-500 mt-1 text-sm'>
                        Question {currQueIndex + 1} of {questions.length}
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
                        {questions[currQueIndex]}
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
                            
                            {/* START RECORDING */}
                            <Button
                                onClick={isRecording ? handleStopRecording : handleStartRecording}
                            >
                                {isRecording ? "Stop Recording" : "Record Voice"}
                            </Button>

                            {/* NEXT BUTTON */}
                            <Button
                                disabled={isLoading}
                                onClick={handleSubmit}
                            >
                                {currQueIndex >= questions.length - 1 ? (isLoading ? 'Saving...' : "End Interview") : (isLoading ? 'Saving...' : "Submit & Next")}
                                
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
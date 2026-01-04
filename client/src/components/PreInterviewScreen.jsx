import React, { useState, useEffect, useRef } from 'react';
import { Mic, Headphones, AlertTriangle, Clock, Monitor, Layers, Info, BarChart3, Timer, Type } from 'lucide-react';
import { Button } from '@/components/ui/button';

// redux imports 
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

// Add these imports
import { useDispatch } from 'react-redux';
import { beginInterview } from '@/store/interviewSlice';


const PreInterviewScreen = ({onStart}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showFullscreenBtn, setShowFullscreenBtn] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [showCountdown, setShowCountdown] = useState(false);

    // useRef to limit showFullScreenBtn appearance 
    const retryCountRef = useRef(0);
    const MAX_RETRIES = 2;

    const { interviewId } = useParams();

    // redux se interview data lo 
    const { currentInterview, interviewLoading } = useSelector((state) => state.interview)
    console.log("mmm Interview Data: ", currentInterview)
    console.log("Interview Questions: ", currentInterview?.questions?.map(q => q.questionObj));

    

    // validating interviewData is present or not 
    useEffect(() => {
        if (interviewLoading) {
            return;     // Still loading, don't check yet
        }
        if (!currentInterview && !interviewLoading){
            console.warn("No interview data found in Redux!");
            // yaha pr redirect kr sakte hai apan - direct to setup page again
            // navigate('/dashboard');
            const timeout = setTimeout(() => {
                navigate('/dashboard');
            }, 3000);
            return () => clearTimeout(timeout);
        }
    }, [currentInterview, interviewLoading, navigate]);
    

    // isStarting state for knowing the timer that insterview is getting started
    const [isStarting, setIsStarting] = useState(false);    // to disable the button for preventing double clicks
    const [countdown, setCountdown] = useState(5);  // to display on the screen
    // const [mediaStream, setMediaStream] = useState(null);   // sirf cleanup ke liye - jb current component unmount hoga tb mediaStream bhi stop kr do
    // actually mediaStream ek object store karta hai named stream ( jisme user ke media permissions stored hote hai )

    // mic allow permission popup by browser 
    const requestPermissions = async () => {
        try {

            if (interviewId && currentInterview.status === 'evaluated') {
                alert("This interview is already evaluated!");
                navigate(`/feedback/${interviewId}`);
                return;
            }
            
            // audio permission req,
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Stream: ", stream)
            // ab stream ko iss component ke local state me save karna padega 
            setLocalStream(stream);
            
            // ab permission status ko sessionStorage me save karenge 
            sessionStorage.setItem('mic_permission', 'granted');  
            // is info kaa use iska parent (interivewRoom) karega, if in case stream nhi mili ActualInterview page pr to...

            // dispatch the beginInterview thunk
            dispatch(beginInterview(interviewId));

            // ab full-screeh button show karna padega, 
            setShowFullscreenBtn(true);

            setIsStarting(true);

        } catch (error) {
            console.error('Mic access denied: ', error, error.name, error.message);
            // alert('Microphone access required for interview');
        }
    }

    // ye wo 5.4.3.2.1... waala countdown kaa code hai 
    // startCountdown function
    function startCountdown(strm) {
        setShowCountdown(true);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if(prev === 1) {
                    clearInterval(timer);   // 1. timer band ho jb time khatam ho jaaye
                    console.log("InterviewData:", currentInterview);
                    
                    localStorage.setItem('interview_active', 'true');
                    console.log(strm)
                    onStart(strm);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // ye third improvement hai, naya code add kiya 
        // 2. countdown band ho jb user dusre page pr jaaye (component unmount ho)
        return () => {
            clearInterval(timer);
            console.log('Countdown timer cleaned up');
        };
    };


    // Dedicated function for entering in full-screen mode 
    const enterFullScreenAndStart = async () => {
        try {
            // MIMP: full screen mode sirf user-gesture pr hee enter hota hai, to uske liye permission leni zaroori hai, hum countdown pr ye cheeze nhi kr sakte,
            await document.documentElement.requestFullscreen();

            // ab countdown start karna padega 
            startCountdown(localStream);
            
            // ab fullScreenEnter button ko hide karna padega 
            setShowFullscreenBtn(false);

            // ab button ke retry count ko 0 pr reset karte hai 
            retryCountRef.current = 0;

        } catch (error) {
            console.log('Full-screen cancelled, starting normally...', error);

            if (retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current += 1;
                alert(`Full Screen Permission denied! Please allow it to continue... (Attempt ${retryCountRef.current}/${MAX_RETRIES}`);
                setTimeout(() => enterFullScreenAndStart(), 1000);
            } else {
                alert("Cannot start without fullscreen. Starting interview in normal mode...");
                // ab without fullscreen chalu karo 
                startCountdown(localStream);
                setShowFullscreenBtn(false);

                retryCountRef.current = 0;
            }
        }
    }


    // Custom back navigation warning popup
    useEffect(() => {
        const handlePopState = () => {
            // Custom modal show karo
            setShowExitConfirm(true);
            // History restore karo
            window.history.pushState(null, '', window.location.href);
        };

        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);

        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    
    

    return (
        <div className='
            min-h-screen bg-slate-950 text-white
            flex flex-col items-center px-4 border border-indigo-400
            '
        >
            {interviewLoading ? (
                <div className="min-h-screen w-full flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4" />
                    <p className='text-slate-300 text-sm'>
                        Preparing your interview environment...
                    </p>
                </div>
            ) : (
                <div className='w-full max-w-4xl py-12'>

                    {/* Header */}
                    <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Interview Instructions</h1>
        
                    <div className='flex justify-between gap-2'>
                        {/* Metadata */}
                        <section className='space-y-2 w-[50%] bg-slate-900/50 p-6 rounded-md'>
                            <OverviewRow label="Interview Type" value="Technical" />
                            <OverviewRow label="Role" value="Frontend Developer" />
                            <OverviewRow label="Experience Level" value="1–3 Years" />
                            <OverviewRow label="Total Questions" value="12" />
                            <OverviewRow label="Duration" value="45 minutes" />
                            <OverviewRow label="Answer Mode" value="Voice + Text" />
                        </section>

                        {/* Rules */}
                        <section className='flex flex-col justify-around text-sm text-slate-300 bg-slate-900 w-[50%] p-5 rounded-md'>
                            <Rule icon={Mic} text="Microphone permission is required to proceed." />
                            <Rule icon={AlertTriangle} text="Do not refresh or use the back button during the interview." />
                            <Rule icon={Clock} text="The timer cannot be paused once the interview starts." />
                            <Rule icon={Layers} text="Only one question is shown at a time." />
                            <Rule icon={Monitor} text="The interview starts automatically after the countdown." />
                        </section>
                    </div>

                    <Divider />

                    {/* Answer Guidance */}
                    <section className="space-y-1 text-md text-slate-300 mb-6">
                        <p className="font-medium text-white flex items-center gap-2">
                            <Info className="w-4 h-4 text-amber-400/80" />
                            Answering Questions
                        </p>

                        <ul className="space-y-1.5">
                            <li className="flex items-start gap-2">
                            <BarChart3 className="w-4 h-4 mt-0.5 text-indigo-400" />
                            <span>
                                Each question includes metadata like type, difficulty, estimated time,
                                and suggested word count.
                            </span>
                            </li>

                            <li className="flex items-start gap-2">
                            <Timer className="w-4 h-4 mt-0.5 text-indigo-400" />
                            <span>
                                Use this information to structure your answer effectively.
                            </span>
                            </li>

                            <li className="flex items-start gap-2">
                            <Mic className="w-4 h-4 mt-0.5 text-indigo-400" />
                            <span>
                                Audio attempts are limited per question.
                            </span>
                            </li>

                            <li className="flex items-start gap-2">
                            <Type className="w-4 h-4 mt-0.5 text-indigo-400" />
                            <span>
                                Typed answers can be edited freely.
                            </span>
                            </li>
                        </ul>
                    </section>

                    <Divider />

                    

                    {/* IMP section - controls */}
                    <div className='flex flex-col items-center gap-4'>
                        <Button 
                            disabled={isStarting}
                            onClick={requestPermissions}
                            className="px-10 py-6 text-base bg-indigo-600 hover:bg-indigo-700"
                        >
                            Start Interview
                        </Button>

                        {showFullscreenBtn && (
                            <Button 
                                onClick={enterFullScreenAndStart}
                                className="border-slate-700 border text-indigo-500 bg-slate-900 font-bold hover:bg-slate-950 hover:border hover:border-indigo-700"
                                size="lg"
                            >
                                Enter Full Screen & Start
                            </Button>
                        )}

                        {showExitConfirm && (
                            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
                                <div className="bg-slate-800 p-6 rounded-lg">
                                    <h3 className='text-xl font-bold mb-4'>Exit Interview Setup?</h3>
                                    <p className='mb-6'>Your progress will be lost.</p>
                                    <div className='flex gap-4'>
                                        <Button 
                                            onClick={() => navigate('/dashboard')}
                                            variant="destructive"
                                        >
                                            Exit
                                        </Button>
                                        <Button onClick={() => setShowExitConfirm(false)}>Continue Setup</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showCountdown && (
                            <div className="text-indigo-400 text-sm mt-2 font-semibold">
                                Interview begins in {countdown} seconds...
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* helpers */

const OverviewRow = ({ label, value }) => (
  <div className="flex justify-between gap-4 border-b border-slate-800 pb-1">
    <span className="text-slate-400 text-sm">{label}</span>
    <span className="text-sm font-medium">{value}</span>
  </div>
);

const Divider = () => (
  <div className="my-4 h-px bg-slate-800" />
);

const Rule = ({ icon: Icon, text }) => (
  <div className="flex gap-3">
    <Icon size={16} className="text-indigo-400 mt-[2px]" />
    <p>{text}</p>
  </div>
);


export default PreInterviewScreen;


// isme maine baadme 3 improvement kiye
/*
    1. Cleanup function banaya - agar user dusre page pr jaaye to mic access active rehtaa thaa but ab wo band ho jaata hain
    --> 1. wrong thaa mera soch --> actually flow unidirectional hai to stream and mic active status on bhi raha to chalta because actualInterviewPage me to wo must hai
    2. InterviewData kaa validation add kiya - 
        - because agar interviewData present hee nhi hai to 
            - blank screen dikhega, errors aayenge, user confused hoga
        -> so iska solution - simply check karo interviewData present hai yaa nhi
    3. similarly like 1, user durse page pr gaya to timer (setIntervavl) cleanup nhi hoga... matlab wo reset to original time nhi hoga like it used to be before starting inteview (30 mins)
        -> iska solution ye hai ke, startCountDown fun ko proper cleanup dena 

    4. ERROR: isne bohot pareshan kiya, stream aage paas nhi ho rhi thee, because of cleanup function,
    // stream agle page pr jaane se pehle hee cleanup fun run ho rha thaa, isiliye stream me null pass ho rha thaa
    // SOLUTION: Cleanup ko delay karo -> 1-2 seconds ka timeout lagao
    --> final solution: cleanup ko yaha se remove kiye aur actual interview page me daal diya
*/



// // isme maine baadme 3 improvement kiye
// /*
//     1. Cleanup function banaya - agar user dusre page pr jaaye to mic access active rehtaa thaa but ab wo band ho jaata hain
//     --> 1. wrong thaa mera soch --> actually flow unidirectional hai to stream and mic active status on bhi raha to chalta because actualInterviewPage me to wo must hai
//     2. InterviewData kaa validation add kiya - 
//         - because agar interviewData present hee nhi hai to 
//             - blank screen dikhega, errors aayenge, user confused hoga
//         -> so iska solution - simply check karo interviewData present hai yaa nhi
//     3. similarly like 1, user durse page pr gaya to timer (setIntervavl) cleanup nhi hoga... matlab wo reset to original time nhi hoga like it used to be before starting inteview (30 mins)
//         -> iska solution ye hai ke, startCountDown fun ko proper cleanup dena 

//     4. ERROR: isne bohot pareshan kiya, stream aage paas nhi ho rhi thee, because of cleanup function,
//     // stream agle page pr jaane se pehle hee cleanup fun run ho rha thaa, isiliye stream me null pass ho rha thaa
//     // SOLUTION: Cleanup ko delay karo -> 1-2 seconds ka timeout lagao
//     --> final solution: cleanup ko yaha se remove kiye aur actual interview page me daal diya
// */



import React, { useState, useEffect, useRef } from 'react';
import { Mic, Ban, Headphones, AlertTriangle, Clock, Monitor, Layers, Info, BarChart3, Timer, Type, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { beginInterview, fetchInterviewById, clearCurrentInterview, evaluateInverview } from '@/store/interviewSlice';

const PreInterviewScreen = ({onStart}) => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [showFullscreenBtn, setShowFullscreenBtn] = useState(false);
    const [localStream, setLocalStream] = useState(null);
    const [showCountdown, setShowCountdown] = useState(false);
    const [statusMessage, setStatusMessage] = useState('');
    const [canStart, setCanStart] = useState(true);

    const retryCountRef = useRef(0);
    const MAX_RETRIES = 2;
    const prevInterviewIdRef = useRef(null);

    const { interviewId } = useParams();
    const { currentInterview, interviewLoading } = useSelector((state) => state.interview);

    // Fetch interview data
    useEffect(() => {
        if (!interviewId) {
            navigate('/dashboard');
            return;
        }
        
        if (interviewId !== prevInterviewIdRef.current || !currentInterview) {
            prevInterviewIdRef.current = interviewId;
            
            if (currentInterview && currentInterview._id !== interviewId) {
                dispatch(clearCurrentInterview());
            }
            
            dispatch(fetchInterviewById(interviewId));
        }
    }, [interviewId, currentInterview, dispatch, navigate]);

    // STATUS CHECK - MOST IMPORTANT FIX
    useEffect(() => {
        if (interviewLoading || !currentInterview) return;
        
        console.log("🔍 Interview Status Check:", {
            id: currentInterview._id,
            status: currentInterview.status,
            questionsCount: currentInterview.questions?.length || 0
        });
        
        // Reset status
        setCanStart(true);
        setStatusMessage('');
        
        // Handle status
        switch (currentInterview.status) {

            case 'setup' : 
            case 'questions_generated':
                // Ready to start!
                if (currentInterview.questions?.length > 0) {
                    setStatusMessage('Ready to start interview!');
                    setCanStart(true);
                } else {
                    setStatusMessage('No questions found. Please try again.');
                    setCanStart(false);
                }
                break;
                
            case 'ongoing':
                // Already started - redirect to interview room
                setStatusMessage('Interview already in progress. Redirecting...');
                setCanStart(false);
                setTimeout(() => {
                    navigate(`/interview-room/${interviewId}`);
                }, 1500);
                break;
                
            case 'completed':
                // Auto-evaluate then go to feedback
                setStatusMessage('Generating feedback...');
                setCanStart(false);
                
                // dispatch(evaluateInverview(interviewId))
                //     .unwrap()
                //     .then(() => navigate(`/feedback/${interviewId}`))
                //     .catch(() => {
                //         setStatusMessage('Failed to generate feedback. Please try again.');
                //     });
                break;
                
            case 'evaluated':
                // Already evaluated - redirect to feedback
                // ONLY if feedback exists, then redirect
                if (currentInterview.feedbackGeneratedAt) {
                    setStatusMessage('Interview already evaluated. Redirecting...');
                    setCanStart(false);
                    setTimeout(() => {
                        navigate(`/feedback/${interviewId}`);
                    }, 1500);
                } else {
                    setStatusMessage('Interview completed. Evaluation pending...');
                    setCanStart(false);
                }
                break;
                
            default:
                setStatusMessage('Unknown interview status. Please contact support.');
                setCanStart(false);
        }
        
    }, [currentInterview, interviewLoading, navigate, interviewId]);

    // mic allow permission popup by browser 
    const requestPermissions = async () => {
        try {
            // Final status check before starting
            if (currentInterview?.status === 'evaluated') {
                alert("This interview is already evaluated!");
                navigate(`/feedback/${interviewId}`);
                return;
            }
            
            if (currentInterview?.status === 'ongoing' && currentInterview?.feedbackGeneratedAt) {
                alert("Interview already in progress!");
                navigate(`/interview-room/${interviewId}`);
                return;
            }
            
            // Check if questions exist
            if (!currentInterview?.questions || currentInterview.questions.length === 0) {
                alert("Questions not generated yet. Please wait...");
                return;
            }
            
            // Check if user can start based on status
            if (!canStart) {
                alert(statusMessage);
                return;
            }
            
            // audio permission req
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("🎤 Stream obtained: ", stream);
            
            setLocalStream(stream);
            sessionStorage.setItem('mic_permission', 'granted');  
            
            // Dispatch beginInterview
            await dispatch(beginInterview(interviewId)).unwrap();

            // IMP: redux state refresh karna padega 
            await dispatch(fetchInterviewById(interviewId));
            
            // ab parent ko stream bhejo
            // console.log("Calling onStart with stream: ", stream);
            // onStart(stream);
            // console.log("onStart called successfully!");

            // Show fullscreen button
            setShowFullscreenBtn(true);
            setIsStarting(true);

        } catch (error) {
            console.error('Mic access denied: ', error);
            alert('Microphone access is required for the interview. Please allow microphone access.');
        }
    }

    // startCountdown function
    function startCountdown(strm) {
        setShowCountdown(true);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if(prev === 1) {
                    clearInterval(timer);
                    localStorage.setItem('interview_active', 'true');
                    console.log("🚀 Starting interview with stream:", strm);
                    onStart(strm, interviewId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    };

    // Dedicated function for entering in full-screen mode 
    const enterFullScreenAndStart = async () => {
        try {
            await document.documentElement.requestFullscreen();
            startCountdown(localStream);
            setShowFullscreenBtn(false);
            retryCountRef.current = 0;
        } catch (error) {
            console.log('Full-screen cancelled, starting normally...', error);
            if (retryCountRef.current < MAX_RETRIES) {
                retryCountRef.current += 1;
                alert(`Full Screen Permission denied! Please allow it to continue... (Attempt ${retryCountRef.current}/${MAX_RETRIES})`);
                setTimeout(() => enterFullScreenAndStart(), 1000);
            } else {
                alert("Starting interview in normal mode...");
                startCountdown(localStream);
                setShowFullscreenBtn(false);
                retryCountRef.current = 0;
            }
        }
    }

    const [isStarting, setIsStarting] = useState(false);
    const [countdown, setCountdown] = useState(5);

    // Custom back navigation warning popup
    useEffect(() => {
        const handlePopState = () => {
            setShowExitConfirm(true);
            window.history.pushState(null, '', window.location.href);
        };
        window.history.pushState(null, '', window.location.href);
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // Cleanup on unmount
    // useEffect(() => {
    //     return () => {
    //         if (localStream) {
    //             localStream.getTracks().forEach(track => track.stop());
    //             console.log("🎤 Local stream cleaned up");
    //         }
    //     };
    // }, [localStream]);

    // IMP Metadata with safe access
    const type = currentInterview?.type || "Technical";
    const title = currentInterview?.title || "Interview";
    const experience = currentInterview?.experience || "Intermediate";
    const duration = currentInterview?.duration ? currentInterview.duration/60 : 30;
    const totalQuestions = currentInterview?.questions?.length || 0;

    return (
        <div className='min-h-screen bg-slate-950 text-white flex flex-col items-center px-6 border border-indigo-400'>
            {interviewLoading ? (
                <div className="min-h-screen w-full flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500 mb-4" />
                    <p className='text-slate-300 text-sm'>Loading interview...</p>
                </div>
            ) : !currentInterview ? (
                <div className="min-h-screen w-full flex flex-col items-center justify-center">
                    <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
                    <p className='text-slate-300 text-lg mb-4'>Interview not found</p>
                    <Button onClick={() => navigate('/dashboard')} className="bg-indigo-600 hover:bg-indigo-700">
                        Back to Dashboard
                    </Button>
                </div>
            ) : (
                <div className='w-full max-w-4xl py-12'>
                    {/* Status Message Banner */}
                    {statusMessage && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                            currentInterview.status === 'questions_generated' ? 'bg-green-900/30 border border-green-700' :
                            currentInterview.status === 'evaluated' || currentInterview.status === 'completed' ? 'bg-amber-900/30 border border-amber-700' :
                            'bg-blue-900/30 border border-blue-700'
                        }`}>
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm">{statusMessage}</span>
                        </div>
                    )}

                    {/* Header */}
                    <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">Interview Instructions</h1>
        
                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2 place-items-stretch w-full'>
                        {/* Metadata */}
                        <section className='w-full text-sm bg-slate-900/70 p-4 md:p-6 rounded-md h-full flex flex-col gap-1'>
                            <OverviewRow label="Interview Type" value={type} />
                            <OverviewRow label="Role" value={title} />
                            <OverviewRow label="Experience Level" value={experience} />
                            <OverviewRow label="Total Questions" value={totalQuestions} />
                            <OverviewRow label="Duration" value={`${duration} minutes`} />
                            <OverviewRow label="Answer Mode" value="Voice + Text" />
                            <OverviewRow label="Current Status" value={currentInterview.status} />
                        </section>

                        {/* Rules */}
                        <section className='w-full text-sm lg:text-md bg-slate-900/70 p-4 md:p-6 rounded-md h-full flex flex-col gap-3'>
                            <Rule icon={Mic} text="Microphone permission is required to proceed." />
                            <Rule icon={AlertTriangle} text="Do not refresh or use the back button during the interview." />
                            <Rule icon={Clock} text="The timer cannot be paused once the interview starts." />
                            <Rule icon={Layers} text="Only one question is shown at a time." />
                            <Rule icon={Monitor} text="The interview starts automatically after the countdown." />
                            <Rule icon={Ban} text="Once the countdown starts, you cannot go back." />
                        </section>
                    </div>

                    <Divider />

                    {/* Answer Guidance */}
                    <section className="space-y-1 text-md text-slate-300 mb-6 ml-1">
                        <p className="font-medium text-white flex items-center gap-2">
                            <Info className="w-4 h-4  text-amber-400/80" />
                            Answering Questions
                        </p>
                        <ul className="space-y-1.5">
                            <li className="flex items-start gap-2">
                                <BarChart3 className="w-4 h-4 mt-1 text-indigo-400 shrink-0" />
                                <span>Each question includes metadata like type, difficulty, estimated time, and suggested word count.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Timer className="w-4 h-4 mt-1 text-indigo-400 shrink-0" />
                                <span>Use this information to structure your answer effectively.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Mic className="w-4 h-4 mt-1 text-indigo-400 shrink-0" />
                                <span>Audio attempts are limited per question.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <Type className="w-4 h-4 mt-1 text-indigo-400 shrink-0" />
                                <span>Typed answers can be edited freely.</span>
                            </li>
                        </ul>
                    </section>

                    <Divider />

                    {/* IMP section - controls */}
                    <div className='flex flex-col items-center gap-4'>
                        <Button 
                            disabled={isStarting || interviewLoading || !canStart}
                            onClick={requestPermissions}
                            className="px-10 py-6 text-base bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-600 disabled:cursor-not-allowed"
                        >
                            {interviewLoading ? "Loading..." : 
                             !canStart ? "Cannot Start" : 
                             isStarting ? "Starting..." : "Start Interview"}
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
                                        <Button onClick={() => navigate('/dashboard')} variant="destructive">Exit</Button>
                                        <Button onClick={() => setShowExitConfirm(false)}>Continue Setup</Button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showCountdown && (
                            <div className="text-indigo-400 text-xl mt-2 font-semibold">
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
    <span className="text-sm font-medium capitalize">{value}</span>
  </div>
);

const Divider = () => <div className="my-4 h-px bg-slate-800" />;

const Rule = ({ icon: Icon, text }) => (
  <div className="flex gap-3">
    <Icon size={16} className="text-indigo-400 mt-[2px]" />
    <p>{text}</p>
  </div>
);

export default PreInterviewScreen;










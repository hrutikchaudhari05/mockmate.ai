import React, {useState, useEffect, useRef} from 'react';

import PreInterviewScreen from '@/components/PreInterviewScreen'
import ActualInterviewScreen from '@/components/ActualInterviewScreen';

import { setMediaStream, clearMediaStream, fetchInterviewById, generateQuestionsT, clearCurrentInterview } from '@/store/interviewSlice';

import { useDispatch, useSelector } from 'react-redux';

import { useParams } from 'react-router-dom';

const InterviewRoom = () => {
    const dispatch = useDispatch();
    const { interviewId } = useParams();
    console.log('Interview ID: ', interviewId);
    
    const prevInterviewIdRef = useRef(null);

    // fetch currentInterview from redux state 
    const { mediaStream, currentInterview, interviewLoading } = useSelector(state => state.interview);

    // agar directly stage ko 'pre' set kiya to ek imp bug aa rha tha (jb actualInterview Page pr refresh click kiya to state firse 'pre' set ho rha thaa - usse prevent karne ke liye below code)
    const [stage, setStage] = useState(() => {
        // pehle check karna padega interview chal rha hai yaa nhi, wo check karenge -- agar localStorage me 'mockmate_interiview' item hai to state 'interview' rakho otherwise 'pre' rakho 
        const saved = localStorage.getItem('interview_active');
        return saved === 'true' ? 'interview' : 'pre';
    });

    useEffect(() => {
        console.log("🔄 InterviewRoom: Checking interview ID change");
        
        if (interviewId && interviewId !== prevInterviewIdRef.current) {
            console.log("🆕 New interview ID detected:", interviewId);
            console.log("Previous ID was:", prevInterviewIdRef.current);
            
            // Clear old interview data
            dispatch(clearCurrentInterview());
            
            // Update ref
            prevInterviewIdRef.current = interviewId;
            
            // Set stage to 'pre' for new interview
            setStage('pre');
            localStorage.setItem('interview_active', 'false');
            
            // Fetch new interview data
            dispatch(fetchInterviewById(interviewId));
        }
    }, [interviewId, dispatch]);

    // ✅ ye tab hee run hoga jb stage 'interview' hai and 'stream null hai'
    useEffect(() => {
        if (stage === 'interview' && !mediaStream) {
            if (sessionStorage.getItem('mic_permission') === 'granted') {
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(newStream => {
                        dispatch(setMediaStream(newStream));
                        console.log("🎤 New stream obtained after refresh");
                    })
                    .catch(error => {
                        console.error("Failed to get stream:", error);
                        setStage('pre');
                    });
            } else {    
                setStage('pre');
            }
        } 
    }, [mediaStream, stage, dispatch]);

    
    // Store interview data in redux by calling the thunk
    useEffect(() => {
        if (interviewId && !interviewLoading && !currentInterview) {     // only fetch if not already loaded
            console.log('Fetching interviews: ', interviewId);
            dispatch(fetchInterviewById(interviewId));
        }
    }, [interviewId, interviewLoading, currentInterview, dispatch]);

    
    // Here we will generate questions when currentInterview is already fetched
    useEffect(() => {
        // ONLY generate if interview exists AND has no questions
        if (currentInterview?.questions?.length === 0){
            console.log("Generating questions for interview: ", interviewId);
            dispatch(generateQuestionsT(interviewId));
        }
    }, [currentInterview, interviewId, dispatch]);

    // ✅ Check if interview is already evaluated
    useEffect(() => {
        if (currentInterview?.status === 'evaluated' && stage !== 'interview') {
            console.log("✅ Interview already evaluated, redirecting...");
            alert("This interview is already completed!");
            // Redirect to feedback page
            window.location.href = `/feedback/${interviewId}`;
        }
    }, [currentInterview, interviewId, stage]);

    // ✅ Modified onStart handler
    const handleInterviewStart = (audioStream) => {
        console.log("🚀 Starting interview with ID:", interviewId);
        
        // Clear any old timer data
        localStorage.removeItem('time_left');
        
        // Set stream and stage
        dispatch(setMediaStream(audioStream));
        
        // Small delay to ensure state updates
        setTimeout(() => {
            localStorage.setItem('interview_active', 'true');
            setStage('interview');
            console.log("🎬 Interview stage set to 'interview'");
        }, 100);
    };


    console.log('Interview ID from params:', interviewId);
    // InterviewRoom.jsx mein
    console.log('InterviewRoom mounted, ID:', interviewId);
    console.log('Stage:', stage);
    console.log(localStorage.getItem('token'))

    
    // ✅ Cleanup on unmount
    useEffect(() => {
        return () => {
            if (mediaStream) {
                mediaStream.getTracks().forEach(track => track.stop());
                console.log("🎤 Stream cleaned up on unmount");
            }
        };
    }, [mediaStream]);

    return (
        <div className='full-screen'>

            {stage === 'pre' && 
                <PreInterviewScreen 
                    onStart={handleInterviewStart} 
                    isLoading={!currentInterview}
                />
            }

            {stage === 'interview' && 
                <ActualInterviewScreen  
                    interview={currentInterview}
                />
            }

        </div>
    )
}

export default InterviewRoom;


// (audioStream) => {
//     // rendering ke beech me state updates allowed nhi hote usko rokne ke liye below code ko next rendering cycle me schedule karte hai 
//     setTimeout(() => {
//         dispatch(setMediaStream(audioStream));
//         setStage('interview');
//     }, 0);
// }






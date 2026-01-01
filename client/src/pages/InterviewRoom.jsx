import React, {useState, useEffect, useRef} from 'react';

import PreInterviewScreen from '@/components/PreInterviewScreen'
import ActualInterviewScreen from '@/components/ActualInterviewScreen';

import { setMediaStream, clearMediaStream, fetchInterviewById, generateQuestionsT } from '@/store/interviewSlice';

import { useDispatch, useSelector } from 'react-redux';

import { useParams } from 'react-router-dom';

const InterviewRoom = () => {
    const dispatch = useDispatch();
    const { interviewId } = useParams();
    console.log('Interview ID: ', interviewId);
    

    // const [stream, setStream] = useState(null); 
    // preInterviewScreen me user media permissions dega wo store 
    // Stream Notes:
    // user ke diye huye permissions ko store karta hai, aur hum isse as a prop pass karte hai next component me, fir ye next page pr user se firse permissions nhi maagte
    // actuall ye user ko hrr page pr permissions firse naa maage isliye use hota hai 

    // fetch currentInterview from redux state 
    const { mediaStream, currentInterview, interviewLoading } = useSelector(state => state.interview);

    // agar directly stage ko 'pre' set kiya to ek imp bug aa rha tha (jb actualInterview Page pr refresh click kiya to state firse 'pre' set ho rha thaa - usse prevent karne ke liye below code)
    const [stage, setStage] = useState(() => {
        // pehle check karna padega interview chal rha hai yaa nhi, wo check karenge -- agar localStorage me 'mockmate_interiview' item hai to state 'interview' rakho otherwise 'pre' rakho 
        const saved = localStorage.getItem('interview_active');
        return saved === 'true' ? 'interview' : 'pre';
    });

    // ye tab hee run hoga jb stage 'interview' hai and 'stream null hai'
    useEffect(() => {
        if (stage === 'interview' && !mediaStream) {
            // agar sessionStorage me mic_permission ko granted kiya hai to hum firse ActualInterview page pr stream le sakte hai
            if (sessionStorage.getItem('mic_permission') === 'granted') {
                // firse nayi stream lo 
                navigator.mediaDevices.getUserMedia({ audio: true })    // ye ek promise hota hai and wo hame niche consume karna padega 
                    .then(newStream => dispatch(setMediaStream(newStream)));
                    
            } else {    
                // sessionStorage me mic_permission ko 'granted' nhi kiya tb 
                setStage('pre');
            }
        } 
    }, [mediaStream, stage]);

    
    // logging fetched data 
    useEffect(() => {
        if (currentInterview) {
            console.log('Current Interview Loaded: ', currentInterview._id);
            console.log("Questions Count: ", currentInterview.questions?.length || 0);
        }
    }, [currentInterview]); // will log only when interview actually changes

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
                dispatch(generateQuestionsT(interviewId));
        }
    }, [currentInterview, interviewId]);

    useEffect(() => {
        if (currentInterview?.questions) {
            console.log("Interview Questions: ", currentInterview?.questions?.map(q => q.questionObj));
        }
    }, [currentInterview?.questions]);

    


    console.log('Interview ID from params:', interviewId);
    // InterviewRoom.jsx mein
    console.log('InterviewRoom mounted, ID:', interviewId);
    console.log('Stage:', stage);
    console.log(localStorage.getItem('token'))

    /*
     * Candidate must be able to build, test, deploy and maintain AI models, AI agents. Also must be fundamentally strong in AI logics and architectures.
Skills: Data, ML, DL, NLP, LLM, Transformers, Python, SQL, Vector Databases, etc
    */


    return (
        <div className='full-screen'>

            {stage === 'pre' && 
                <PreInterviewScreen 
                    onStart={(audioStream) => {
                        // rendering ke beech me state updates allowed nhi hote usko rokne ke liye below code ko next rendering cycle me schedule karte hai 
                        setTimeout(() => {
                            dispatch(setMediaStream(audioStream));
                            setStage('interview');
                        }, 0);
                    }} 
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







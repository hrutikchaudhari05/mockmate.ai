import React, { useState, useEffect } from 'react';
import { Mic, Headphones } from 'lucide-react';
import { Button } from '@/components/ui/button';

// redux imports 
import { useSelector } from 'react-redux';

const PreInterviewScreen = ({onStart}) => {

    // redux se interview data lo 
    const interviewData = useSelector((state) => state.interview.currentInterview)
    console.log(interviewData?.setup)
    // validating interviewData is present or not 
    useEffect(() => {
        if (!interviewData){
            console.warn("No interview data found in Redux!");
            // yaha pr redirect kr sakte hai apan - direct to setup page again
            // navigate('/dashboard');
        }
    }, [interviewData]);
    

    // isStarting state for knowing the timer that insterview is getting started
    const [isStarting, setIsStarting] = useState(false);    // to disable the button for preventing double clicks
    const [countdown, setCountdown] = useState(5);  // to display on the screen
    // const [mediaStream, setMediaStream] = useState(null);   // sirf cleanup ke liye - jb current component unmount hoga tb mediaStream bhi stop kr do
    // actually mediaStream ek object store karta hai named stream ( jisme user ke media permissions stored hote hai )
    

    // ye wo 5.4.3.2.1... waala countdown kaa code hai 
    // startCountdown function
    function startCountdown(stream) {
        setIsStarting(true);

        const timer = setInterval(() => {
            setCountdown(prev => {
                if(prev === 1) {
                    clearInterval(timer);   // 1. timer band ho jb time khatam ho jaaye
                    console.log("InterviewData:", interviewData);
                    //c onsole.log("Before onStart, mediaStream: ", mediaStream);
                    // localStorage.setItem('mockmate_interview', JSON.stringify(interviewData));
                    localStorage.setItem('interview_active', 'true');
                    console.log(stream)
                    onStart(stream);
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

    // mic allow permission popup by browser 
    const requestPermissions = async () => {
        try {
            // audio permission req,
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            console.log("Stream: ", stream)
            
            // ab permission status ko sessionStorage me save karenge 
            sessionStorage.setItem('mic_permission', 'granted');  
            // is info kaa use iska parent (interivewRoom) karega, if in case stream nhi mili ActualInterview page pr to...

            startCountdown(stream);
        } catch (error) {
            console.error('Mic access denied: ', error);
            alert('Microphone access required for interview');
        }
    }


    // Countdown component mein
    useEffect(() => {
        // Browser back button disable karo jb countdown start ho jaaye 
        if (isStarting) {
            window.history.pushState(null, null, window.location.pathname);
            window.onpopstate = () => {
                window.history.pushState(null, null, window.location.pathname);
            };
        }
        
        return () => {
            // ab back button normal kr do
            window.onpopstate = null; // Cleanup
        };
    }, [isStarting]);

    
    

    return (
        <div className='
            text-white
            border flex flex-col justify-center items-center
            min-h-screen bg-slate-950
            '
        >
            <h1 className="text-4xl font-bold mb-6">Instructions</h1>
      
            <div className="space-y-4 max-w-2xl text-center">
                <div className="flex items-center gap-3">
                    <Mic className="text-indigo-500" />
                    <p>Please allow microphone access when prompted</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <Headphones className="text-indigo-500" />
                    <p>Use headphones for best audio quality</p>
                </div>
            </div>

            <Button 
                disabled={isStarting}
                onClick={requestPermissions}
                className="mt-12 px-8 py-6 text-lg bg-slate-900 hover:bg-indigo-600"
            >
                Begin Interview
            </Button>

            {isStarting && (
                <div className="mt-4 text-indigo-400 text-xl font-bold">
                    Starting in {countdown} seconds...
                </div>
            )}
        </div>
    )
}

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


import React, {useState} from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';

// Shadcn Imports
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// redux imports 
import {useSelector, useDispatch} from 'react-redux';
import { loginUser } from '@/store/authSlice';      // Thunk import kiya
import { validateLoginData } from '@/utils/dataValidation';

const Login = () => {
    // useNavigate is used to navigate to different pages
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [clickedSubmit, setClickedSubmit] = useState(false);
    const [errorsObj, setErrorsObj] = useState(null);

    // using redux hook
    const dispatch = useDispatch();
    const {isLoading, error} = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("Error from backend: ", error);

        // data validation se errors extract kr lo 
        const errors = validateLoginData({email, password});
        setErrorsObj(errors);

        // pehle flag ko true karte hai to show errors 
        setClickedSubmit(true);

        // if errors are there then frontend data ko backend mt bhejo
        if (Object.keys(errors).length > 0) return;


        // Redux Thunk dispatch kiya
        const result = await dispatch(loginUser({email, password}));

        // check karo succeess hua yaa nhi
        if (loginUser.fulfilled.match(result)) {
            // at this stage, redux ne already data store kr liya and token bhi localStorage me save kr liya

            console.log('Login.jsx -> Login successful via Redux');
            setClickedSubmit(false);
            navigate('/dashboard');
        }
        // agar fail hua to error automatically Redux state me store ho gya 
        
    };

    return (
        <div 
            className="min-h-screen flex flex-col gap-8 bg-gradient-to-br from-black via-indigo-950 to-black text-white items-center justify-center w-full"
        >
            <div className='flex justify-center items-center gap-3'>
                <h3 className="text-4xl sm:text-5xl font-bold">
                    Mock<span className="text-indigo-400">Mate</span>
                </h3>
            </div>

            <motion.div
                className="w-full max-w-md sm:max-w-lg p-8 mb-8 md:p-10 bg-slate-900 rounded-3xl border border-slate-800
                    shadow-[0_0_30px_rgba(99,102,241,0.18)]"
            >
                
                {/* Header section  */}
                <header className="text-center mb-6">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-1">AI</div>
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Welcome Back!</h1>
                    <div className='h-[1px] bg-amber-500/90 w-40 mx-auto mt-1 rounded-full' />
                    {/* Subtitle */}
                    <p className="text-slate-400 mt-2">Sign in to continue your interview preparation.</p>
                </header>

                {/* In case any error occurres, it will be displayed above form */}
                {error?.message && <p className="text-red-400 text-center text-sm mb-4">{error?.message}</p>}

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10" />
                        <Input 
                            type="text"
                            placeholder="Enter Email Address..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className={`pl-12 text-white bg-slate-950 
                                ${clickedSubmit && ( errorsObj?.email || error?.field === 'email' ) ? 'border-red-400/80' : 'border-slate-800'}
                                focus:border-slate-800 placeholder:text-slate-500
                                focus-visible:ring-1 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-0
                            `} 
                        />
                    </div>

                    {clickedSubmit && errorsObj.email && <p className='text-red-400 text-sm text-center'>{errorsObj.email}</p>}
                    
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10" />
                        <Input
                            type="password"
                            placeholder="Enter Your Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className={`pl-12 text-white bg-slate-950 
                                ${clickedSubmit && errorsObj?.password ? 'border-red-400/80' : 'border-slate-800'}
                                focus:border-slate-800 placeholder:text-slate-500
                                focus-visible:ring-1 focus-visible:ring-indigo-500/80 focus-visible:ring-offset-0
                            `}
                        />
                    </div>
                    {clickedSubmit && errorsObj.password && <p className='text-red-400 text-center text-sm'>{errorsObj.password}</p>}

                    
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17}}
                    >
                        <Button
                            type="submit"
                            disabled={isLoading}
                            size="lg"
                            className="w-full py-3 font-bold shadow-lg shadow-indigo-700/50 hover:text-indigo-600 bg-slate-950 hover:bg-slate-950 "
                            // onClick={() => navigate('/dashboard')}
                        >
                            {isLoading ? (
                                <motion.div>
                                    Authenticating...
                                </motion.div>
                            ) : (
                                <motion.span>
                                    Log In
                                </motion.span>
                            )}
                        </Button>
                    </motion.div>
                </form>

                <motion.div>
                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-medium text-indigo-400 hover:text-indigo-300 transition"
                        >
                            Register here
                        </Link>
                    </p>
                </motion.div>

            </motion.div>
        </div>
    )

}

export default Login;
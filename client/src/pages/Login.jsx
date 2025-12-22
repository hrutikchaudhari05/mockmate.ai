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

const Login = () => {
    // useNavigate is used to navigate to different pages
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    // using redux hook
    const dispatch = useDispatch();
    const {isLoading, error} = useSelector((state) => state.auth);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Redux Thunk dispatch kiya
        const result = await dispatch(loginUser({email, password}));

        // check karo succeess hua yaa nhi
        if (loginUser.fulfilled.match(result)) {
            // at this stage, redux ne already data store kr liya and token bhi localStorage me save kr liya

            console.log('Login.jsx -> Login successful via Redux');
            navigate('/dashboard');
        }
        // agar fail hua to error automatically Redux state me store ho gya 
        
    };

    return (
        <div 
            className="min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 text-white flex items-center justify-center w-full"
        >
            <motion.div
                className="w-full max-w-md p-8 md:p-10 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-900/20"
            >
                {/* Header section  */}
                <header className="text-center mb-8">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-3">AI</div>
                    {/* Title */}
                    <h1 className="text-3xl font-bold text-slate-100">Welcome Back!</h1>
                    {/* Subtitle */}
                    <p className="text-slate-400 mt-2">Sign in to continue your interview preparation.</p>
                </header>

                {/* In case any error occurres, it will be displayed above form */}
                {error && <p className="text-red-400 text-center mb-4">{error}</p>}

                {/* form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10" />
                        <Input 
                            type="text"
                            placeholder="Enter Email Address..."
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="pl-12 text-black" 
                        />
                    </div>
                    <div className="relative">
                        <Lock size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10" />
                        <Input
                            type="password"
                            placeholder="Enter Your Password..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-12 text-black"
                        />
                    </div>
                    
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17}}
                    >
                        <Button
                            type="submit"
                            disabled={isLoading}
                            size="lg"
                            className="w-full py-3 font-bold shadow-lg shadow-indigo-700/50 hover:text-indigo-500 "
                            onClick={() => navigate('/dashboard')}
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
                            Register Here
                        </Link>
                    </p>
                </motion.div>

            </motion.div>
        </div>
    )

}

export default Login;
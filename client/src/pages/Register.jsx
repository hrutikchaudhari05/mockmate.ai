import React, {useState} from 'react';
import {motion} from 'framer-motion';
import { useNavigate, Link, redirect } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';

// Shadcn imports
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';

// redux methods and thunk import kiya 
import { useSelector, useDispatch } from 'react-redux';
import { registerUser } from '@/store/authSlice';
import { validateRegisterData } from '@/utils/dataValidation';

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [clickedSubmit, setClickedSubmit] = useState(false);
    const [errorsObj, setErrorsObj] = useState(null);

    // Redux state 
    const {isLoading, error} = useSelector(state => state.auth);

    // handleChange to add particular value in form
    const handleChange = (e) => {
        const {name, value} = e.target;
        setFormData(prev => ({...prev, [name]: value}));
    }

    // handleSubmit
    const handleSubmit = async (e) => {
        e.preventDefault();

        // pehle clickedSubmit ko true karte hai,
        setClickedSubmit(true);

        // ab errors ko lena padega validation se 
        const errors = validateRegisterData(formData);
        setErrorsObj(errors);

        // ab check karte hai errors hai yaa nhi,
        if (Object.keys(errors).length > 0) return;

        // Redux thunk dispatch kiya 
        const result = await dispatch(registerUser(formData));

        // success checking 
        if (registerUser.fulfilled.match(result)) {
            console.log('Registration Successful!');
            navigate('/dashboard');
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black text-white flex flex-col items-center justify-center gap-8 w-full'>
            
            <div className='flex justify-center items-center gap-3'>
                <h3 className="text-4xl sm:text-5xl font-bold">
                    Mock<span className="text-indigo-400">Mate</span>
                </h3>
            </div>
            <motion.div className='w-full max-w-md sm:max-w-lg mb-8 px-8 py-6 md:px-10 md:py-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-[0_0_30px_rgba(99,102,241,0.18)]'>
                {/* Header section  */}
                <header className="text-center mb-6">
                    {/* Logo */}
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mx-auto mb-1">AI</div>
                    {/* Title */}
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-100">Create Account</h1>
                    <div className='h-[1px] bg-amber-500/90 w-40 mx-auto mt-1 rounded-full' />
                    {/* Subtitle */}
                    <p className="text-slate-400 mt-2">Join us to start your interview journey!</p>
                </header>

                {/* in case of any error */}
                {error && <p className='text-red-400 text-center mb-2'>{error?.message}</p>}

                <form onSubmit={handleSubmit} className='space-y-4'>
                    <motion.div className='relative'>
                        <User size={18} className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10'/>
                        <Input
                            type="text"
                            placeholder="Enter You Name..."
                            value={formData.name}
                            onChange={handleChange}
                            name="name"
                            className={`pl-12 text-white bg-slate-950 placeholder:text-slate-500
                                ${clickedSubmit && ( errorsObj?.name || error?.field === 'name' ) ? 'border-red-400/80' : 'border-slate-800'}
                                focus:border-slate-800 
                                focus-visible:ring-1 focus-visible:border-indigo-500/80 focus-visible:ring-offset-0
                            `}
                            
                        />
                    </motion.div>

                    {clickedSubmit && errorsObj?.name && <p className='text-red-400 text-sm text-center'>{errorsObj.name}</p>}

                    <motion.div className='relative'>
                        <Mail size={18} className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10'/>
                        <Input 
                            type="text"
                            placeholder="Enter You Email..."
                            value={formData.email}
                            onChange={handleChange}
                            name="email"
                            className={`pl-12 text-white bg-slate-950 placeholder:text-slate-500
                                ${clickedSubmit && ( errorsObj?.email || error?.field === 'email' ) ? 'border-red-400/80' : 'border-slate-800'}
                                focus:border-slate-800 
                                focus-visible:ring-1 focus-visible:border-indigo-500/80 focus-visible:ring-offset-0
                            `}
                        />
                    </motion.div>

                    {clickedSubmit && errorsObj?.email && <p className='text-red-400 text-sm text-center'>{errorsObj.email}</p>}

                    <motion.div className='relative'>
                        <Lock size={18} className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10'/>
                        <Input 
                            type="password"
                            placeholder="Enter You Password..."
                            value={formData.password}
                            onChange={handleChange}
                            name="password"
                            className={`pl-12 text-white bg-slate-950 placeholder:text-slate-500
                                ${clickedSubmit && ( errorsObj?.password || error?.password ) ? 'border-red-400/80' : 'border-slate-800'}
                                focus:border-slate-800 
                                focus-visible:ring-1 focus-visible:border-indigo-500/80 focus-visible:ring-offset-0
                            `}
                        />
                    </motion.div>

                    {clickedSubmit && errorsObj?.password && <p className='text-red-400 text-sm text-center'>{errorsObj.password}</p>}

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
                        >
                            {isLoading ? (
                                <motion.div>
                                    Registering...
                                </motion.div>
                            ) : (
                                <motion.span>
                                    Sign Up
                                </motion.span>
                            )}
                        </Button>
                    </motion.div>
                </form>
                <motion.div>
                    <p className='text-center text-sm mt-6 text-slate-400'>
                        Already Regestered?{' '}
                        <Link 
                            to="/login"
                            className='font-medium text-indigo-400 hover:text-indigo-300 transition'
                        >
                            Login here
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Register;
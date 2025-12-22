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

const Register = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

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

        // Redux thunk dispatch kiya 
        const result = await dispatch(registerUser(formData));

        // success checking 
        if (registerUser.fulfilled.match(result)) {
            console.log('Registration Successful!');
            navigate('/dashboard');
        }
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-slate-950 to-indigo-950 text-white flex items-center justify-center w-full'>
            <motion.div className='w-full max-w-lg p-8 md:p-10 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl shadow-indigo-900/20'>
                <header className='text-center mb-8'>
                    <div className='w-10 h-10 bg-indigo-600 rounded-lg flex items-center text-white justify-center mx-auto mb-3'>AI</div>
                    <h1 className='text-3xl text-slate-100 font-bold'>Create Account</h1>
                    <p className='text-slate-400 mt-2'>Join us to start your interview journey!</p>
                </header>

                {/* in case of any error */}
                {error && <p className='text-red-400 text-center mb-4'>{error}</p>}

                <form onSubmit={handleSubmit} className='space-y-6'>
                    <motion.div className='relative'>
                        <User size={18} className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10'/>
                        <Input
                            type="text"
                            placeholder="Enter You Name..."
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-12 text-black"
                            name="name"
                        />
                    </motion.div>
                    <motion.div className='relative'>
                        <Mail size={18} className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10'/>
                        <Input 
                            type="text"
                            placeholder="Enter You Email..."
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-12 text-black"
                            name="email"
                        />
                    </motion.div>
                    <motion.div className='relative'>
                        <Lock size={18} className='absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500 z-10'/>
                        <Input 
                            type="password"
                            placeholder="Enter You Password..."
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-12 text-black"
                            name="password"
                        />
                    </motion.div>
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 17}}
                    >
                        <Button
                            type="submit"
                            disabled={isLoading}
                            size="lg"
                            className="w-full py-3 font-bold shadow-lg shadow-indigo-700/50"
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
                            Login
                        </Link>
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}

export default Register;
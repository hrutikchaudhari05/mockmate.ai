import React, { useState } from 'react';

import {Link, NavLink, useLocation} from 'react-router-dom';

import { motion, AnimatePresence } from 'framer-motion';

// Redux imports
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '@/store/authSlice';

// shadcn imports 
import {
    DropdownMenu, 
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Lucide-react imports 
import { LogOut, Settings, User } from 'lucide-react';
import { useSelector } from 'react-redux';


// Ye hamara main layout hoga - har page pe same rahega
const Layout = ({children}) => {
    const [loggingOut, setLoggingOut] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleLogout = () => {
        setLoggingOut(true);
        dispatch(logout());
        setTimeout(() => navigate('/login'), 1000);
    }

    const location = useLocation();
    const currentUser = useSelector(state => state.auth);
    const username = currentUser?.user?.name;


    return (
        <div className="min-h-screen bg-slate-950">

            {/* yaha navbar aayega - top fixed*/}

            {loggingOut && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-slate-400">Logging out...</p>
                    </div>
                </div>
            )}



            {/* Overall navbar container */}
            <nav 
                className='fixed top-0 left-0 right-0 
                bg-indigo-950/20 backdrop-blur-md z-50
                border-b border-indigo-900/40
                shadow-[0_1px_12px_rgba(0,0,0,0.4)]'
            >   
                {/* Content width kee limit aur padding  */}
                <div className=' w-full'>
                    {/* Flex Layout */}
                    <div className='flex justify-between items-center h-16 px-28'>

                        {/* Left - Branding logo  */}
                        <div className="flex items-center">
                            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-2"
                            >
                                AI
                            </div>
                            <span className="text-white font-bold text-xl">MockMate</span>
                        </div>

                        {/* Middle - Navigation  */}
                        <div className='flex items-center space-x-6'>

                            {/* Dashboard Link  */}
                            <NavLink 
                                to="/dashboard" 
                                className={({ isActive }) =>
                                    `font-medium transition-colors ${
                                    isActive
                                        ? "text-white border-b-2 border-amber-500 pb-1"
                                        : "text-slate-300 hover:text-white"
                                    }`
                                }
                            >
                                Dashboard
                            </NavLink>

                            {/* Interviews Link */}
                            <NavLink 
                                to="/interviews" 
                                className={({ isActive }) =>
                                    `font-medium transition-colors ${
                                    isActive
                                        ? "text-white border-b-2 border-amber-400 pb-1"
                                        : "text-slate-300 hover:text-white"
                                    }`
                                }
                            >
                                Interviews
                            </NavLink>
                            
                            {/* Guide Link */}
                            <NavLink 
                                to="/guide" 
                                className={({ isActive }) =>
                                    `font-medium transition-colors ${
                                    isActive
                                        ? "text-white border-b-2 border-amber-400 pb-1"
                                        : "text-slate-300 hover:text-white"
                                    }`
                                }
                            >
                                Guide
                            </NavLink>
                        </div>

                        {/* Right -  Profile  */}
                        <div className='flex items-center space-x-4'>

                            {/* User's Name */}
                            <span className='text-slate-300 font-medium hover:text-white transition-colors'>
                                {username}
                            </span>

                            {/* Shadcn Dropdown Integration */}
                            <DropdownMenu modal={false}>

                                {/* Trigger jo user ko dikhega - icon */}
                                <DropdownMenuTrigger asChild>
                                    {/* w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer */}
                                    <button className='w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer'>
                                        <User size={20} />
                                    </button>
                                </DropdownMenuTrigger>

                                <AnimatePresence>
                                    {/* CONTENT - Jo click pe dikhega */}
                                    <DropdownMenuContent
                                        asChild
                                        align="end" 
                                    >
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.95, y: -4 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95, y: -4 }}
                                            transition={{ duration: 0.15, ease: "easeOut" }}
                                            className="w-48 bg-slate-900 border backdrop-blur-sm border-indigo-900 rounded-md"
                                        >
                                            <DropdownMenuItem className="text-slate-300 hover:text-white border-b rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer">
                                                <User size={16} className='mr-2'/>
                                                Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-slate-300 hover:text-white border-b rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer">
                                                <Settings size={16} className='mr-2'/>
                                                Settings
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-slate-300 hover:text-white focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer"
                                                onClick={handleLogout}
                                            >
                                                <LogOut size={16} className='mr-2'/>
                                                LogOut
                                            </DropdownMenuItem>
                                        </motion.div>
                                    </DropdownMenuContent>
                                </AnimatePresence>

                            </DropdownMenu>

                        </div>
                    </div>
                </div>
            </nav>

            <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
            >
                {/* yaha page content aayega (dashboard, interviewSetup, feedback, etc*/}
                <main className='pt-16'>   {/* pt-16 - padding top (space for navbar) */}
                    {children}
                </main>

            </motion.div>

            
        </div>
    );
};

export default Layout;
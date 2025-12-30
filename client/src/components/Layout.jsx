import React from 'react';

import {Link, NavLink, useLocation} from 'react-router-dom';

import { motion } from 'framer-motion';

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

// redux imports 

// Ye hamara main layout hoga - har page pe same rahega
const Layout = ({children}) => {

    const location = useLocation();
    const currentUser = useSelector(state => state.auth);
    const username = currentUser?.user?.name;

    return (
        <div className="min-h-screen bg-slate-950">

            {/* yaha navbar aayega - top fixed*/}

            {/* Overall navbar container */}
            <nav className='fixed top-0 left-0 right-0 bg-slate-900 border-b border-slate-800 z-50'>   
                {/* Content width kee limit aur padding  */}
                <div className='mx-auto px-4 sm:px-6 lg:px-8 w-full '>
                    {/* Flex Layout */}
                    <div className='flex justify-between items-center h-16'>

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
                            <Link 
                                to="/dashboard" 
                                className='text-slate-300 hover:text-white transition-colors font-medium'
                            >
                                Dashboard
                            </Link>

                            {/* Interviews Link */}
                            <Link 
                                to="/interviews" 
                                className="text-slate-300 hover:text-white transition-colors font-medium"
                            >
                                Interviews
                            </Link>
                            
                            {/* Guide Link */}
                            <Link 
                                to="/guide" 
                                className="text-slate-300 hover:text-white transition-colors font-medium"
                            >
                                Guide
                            </Link>
                        </div>

                        {/* Right -  Profile  */}
                        <div className='flex items-center space-x-3'>

                            {/* User's Name */}
                            <span className='text-slate-300 font-medium'>
                                <u>{username}</u>
                            </span>

                            {/* Shadcn Dropdown Integration */}
                            <DropdownMenu>

                                {/* Trigger jo user ko dikhega - icon */}
                                <DropdownMenuTrigger asChild>
                                    {/* w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer */}
                                    <button className='w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer'>
                                        <User size={20} />
                                    </button>
                                </DropdownMenuTrigger>

                                {/* CONTENT - Jo click pe dikhega */}
                                <DropdownMenuContent
                                    align="end" 
                                    className="w-48 bg-slate-800 border border-slate-700"
                                >
                                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                                        <User size={16} className='mr-2'/>
                                        Profile
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                                        <Settings size={16} className='mr-2'/>
                                        Settings
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-slate-300 hover:bg-slate-700 cursor-pointer">
                                        <LogOut size={16} className='mr-2'/>
                                        LogOut
                                    </DropdownMenuItem>
                                </DropdownMenuContent>

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
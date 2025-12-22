import React, { useEffect } from 'react';
import {useState} from 'react'; // Setup popup ko dikhane ke liye

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableRow} from '@/components/ui/table'
import {Award, Target, Clock, Flame, Play} from 'lucide-react';
import {Button} from '@/components/ui/button'

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// import Setup component for setting up interview 
import Setup from './Setup';

// Framer Motion 
import {motion, AnimatePresence} from 'framer-motion';
import { fetchAllInterviews } from '@/store/interviewSlice';

// card forming function 
const StatCard = ({ title, content, icon: Iconn, color}) => {
    return (
        <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-slate-400 text-2xl">{title}</CardTitle>
                <Iconn size={48} className={color} />
            </CardHeader>
            <CardContent>
                <div className='text-3xl font-bold text-white'>{content}</div>
            </CardContent>
        </Card>
    )
}


const Dashboard = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    // Redux se data liya - allInterviews List and other states 
    //const { interviews, interviewsLoading, interviewsError } = useSelector((state) => state.interview);
    const user = useSelector((state) => state.auth.user);

    // state to make Setup visible/invisible
    const [showSetup, setShowSetup] = useState(false);

    // Close function banayi
    const handleCloseSetup = () => {
        setShowSetup(false);
    };
    
    useEffect(() => {
        dispatch(fetchAllInterviews());
    }, [dispatch])

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    

    return (

        
        <div className='px-28 py-16 space-y-8'>

            {/* Ye div responsible hai pure dashboard page ko blur karne ke liye */}
            <motion.div
                animate={{ 
                    filter: showSetup ? 'blur(4px)' : 'blur(0px)',
                    scale: showSetup ? 0.98 : 1 
                }}
                transition={{ duration: 0.3 }}
                className='space-y-8'
            >

                <div>
                    <h1 className='text-4xl font-bold text-white'>
                        {`Welcome back, ${user?.name || 'Name'}!`}
                    </h1>
                    <p className='text-slate-400 mt-2 text-xl'>
                        Ready to crush your next interview?
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>

                    {/* First Card  */}
                    <StatCard title="Interviews Completed" content="24" icon={Award} color="text-indigo-600" />
                    <StatCard title="Average Score" content="84" icon={Target} color="text-indigo-600" />
                    <StatCard title="Average Practice Time" content="36m" icon={Clock} color="text-indigo-600" />
                    <StatCard title="Current Streak" content="11D" icon={Flame} color="text-indigo-600" />
                    
                </div>

                <div className='w-full border border-slate-800 rounded-lg text-center py-6 space-y-8'>
                    <p className='text-slate-300 font-bold text-3xl'>Ready for your next challenge?</p>
                    <Button
                        className="bg-indigo-600 hover:bg-indigo-700 p-6 text-lg"
                        onClick={() => setShowSetup(true)}
                    >
                        <Play size={40} className='mr-3' /> 
                        Start New Interview
                    </Button>
                </div>

                <div>
                    <Card className="bg-slate-900 border-slate-800">
                        <CardHeader>
                            <CardTitle className="text-white text-center">Recent Interwiew Performances</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Table>
                                <TableBody>
                                    <TableRow className="border-b border-slate-700 hover:bg-slate-800">
                                        <TableCell className="font-medium text-white">Frontend Developer</TableCell>
                                        <TableCell className="text-slate-400">Tech Round</TableCell>
                                        <TableCell className="text-slate-400">Google, Microsoft, Adobe, OpenAI</TableCell>
                                        <TableCell className="text-slate-400">Nov 25, 2025</TableCell>
                                        <TableCell className="text-right">
                                            <span className='text-green-400 font-bold'>84%</span>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-slate-700 hover:bg-slate-800">
                                        <TableCell className="font-medium text-white">Frontend Developer</TableCell>
                                        <TableCell className="text-slate-400">Tech Round</TableCell>
                                        <TableCell className="text-slate-400">Google, Microsoft, Adobe, OpenAI</TableCell>
                                        <TableCell className="text-slate-400">Nov 25, 2025</TableCell>
                                        <TableCell className="text-right">
                                            <span className='text-green-400 font-bold'>84%</span>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow className="border-b border-slate-700 hover:bg-slate-800">
                                        <TableCell className="font-medium text-white">Frontend Developer</TableCell>
                                        <TableCell className="text-slate-400">Tech Round</TableCell>
                                        <TableCell className="text-slate-400">Google, Microsoft, Adobe, OpenAI</TableCell>
                                        <TableCell className="text-slate-400">Nov 25, 2025</TableCell>
                                        <TableCell className="text-right">
                                            <span className='text-green-400 font-bold'>84%</span>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

            </motion.div>

            <AnimatePresence>
                {showSetup && (
                    <Setup onClose={handleCloseSetup} />
                )}
            </AnimatePresence>
            
        </div>

        
        
    );
}

export default Dashboard;
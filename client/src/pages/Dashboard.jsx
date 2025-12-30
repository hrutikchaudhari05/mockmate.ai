import React, { useEffect } from 'react';
import {useState} from 'react'; // Setup popup ko dikhane ke liye

import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Table, TableBody, TableCell, TableRow, TableHead, TableHeader} from '@/components/ui/table'
import {Award, Target, Clock, Flame, Play} from 'lucide-react';
import {Button} from '@/components/ui/button'

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// import Setup component for setting up interview 
import Setup from './Setup';

// Framer Motion 
import {motion, AnimatePresence} from 'framer-motion';
import { fetchAllInterviews } from '@/store/interviewSlice';

import { formatDate } from '@/utils/formatDate';

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
        if (user) {
            dispatch(fetchAllInterviews());
        }
    }, [user.id]);

    const allInterviewsList = useSelector(state => state.interview.allInterviews);
    console.log("All Interviews: ", allInterviewsList);

    useEffect(() => {
        if (!user) navigate('/login');
    }, [user]);

    // essential values 
    const totalInterviews = allInterviewsList?.count;
    const averageScore = allInterviewsList?.avgScore === '0.0' ? '0' : allInterviewsList?.avgScore;
    const averageDuration = allInterviewsList?.avgDuration === '0.0' ? '0' : allInterviewsList?.avgDuration;
    const streak = allInterviewsList?.streak;

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
                    <StatCard title="Interviews Completed" content={totalInterviews} icon={Award} color="text-indigo-600" />
                    <StatCard title="Average Score" content={averageScore} icon={Target} color="text-indigo-600" />
                    <StatCard title="Average Interview Duration" content={`${averageDuration} m`} icon={Clock} color="text-indigo-600" />
                    <StatCard title="Current Streak" content={`${streak} D`} icon={Flame} color="text-indigo-600" />
                    
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
                            {allInterviewsList.count <= 0 
                                ? <p className='text-slate-200 font-semibold'>There are no interviews...!</p> 
                                : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-b hover:bg-indigo-600/30">
                                                <TableHead className="text-indigo-500">Sr. No.</TableHead>
                                                <TableHead className="text-indigo-500">Title</TableHead>
                                                <TableHead className="text-indigo-500">Type</TableHead>
                                                <TableHead className="text-indigo-500">Experience</TableHead>
                                                <TableHead className="text-indigo-500">Duration</TableHead>
                                                <TableHead className="text-indigo-500">Date</TableHead>
                                                <TableHead className="text-indigo-500">Score</TableHead>
                                                <TableHead className="text-indigo-500">Feedback</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {allInterviewsList?.allInterviews?.map((item, index) => {
                                                return (
                                                    <TableRow key={index} className="border-b border-slate-700 hover:bg-slate-800">
                                                        <TableCell className="font-medium text-white">{index+1}</TableCell>
                                                        <TableCell className="font-medium text-white">{item.title}</TableCell>
                                                        <TableCell className="text-slate-400 capitalize">{item.type}</TableCell>
                                                        <TableCell className="text-slate-400 capitalize">{item.experience}</TableCell>
                                                        <TableCell className="text-slate-400">{item.duration / 60} mins</TableCell>
                                                        <TableCell className="text-slate-400">{formatDate(item.updatedAt)}</TableCell>
                                                        <TableCell className="text-right">
                                                            <span className={`font-bold
                                                                ${item.overallFeedback.score >= 80 ? 'text-emerald-500' : 
                                                                item.overallFeedback.score >= 60 ? 'text-amber-500/90' : 'text-red-500/90'}`}
                                                            >{item.overallFeedback.score ?? '--'}</span>
                                                        </TableCell>
                                                        <TableCell className="text-slate-400 capitalize">{item.overallFeedback.recommendation}</TableCell>
                                                    </TableRow>
                                                )
                                            })}
                                            
                                        </TableBody>
                                    </Table>
                                )
                            }
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
import React, { useEffect } from 'react';

// shadcn imports 
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableCell, TableHeader, TableHead, TableRow, TableBody } from '@/components/ui/table'

import { motion } from 'framer-motion';

import { useDispatch, useSelector } from 'react-redux';
import { fetchAllInterviews } from '@/store/interviewSlice';
import { formatDate } from '@/utils/formatDate';

const Interviews = () => {
    const dispatch = useDispatch()
    
    const { user } = useSelector(state => state.auth);
    console.log("User: ", user);
    console.log("UserId: ", user?.id);

    useEffect(() => {
        if (user?.id) {
            dispatch(fetchAllInterviews())
        }
    }, [user?.id]);

    const currentInterview = useSelector(state => state.interview)
    const allInterviewsList = currentInterview?.allInterviews;
    console.log("All Interviews List: ", allInterviewsList);

    // this is for interview listing
    

    return (

        <motion.div 
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className='px-8 sm:px-16 lg:px-28 py-8 sm:py-12'
        >
            <Card className="bg-slate-950/70 border-slate-800 shadow-[0_0_30px_rgba(99,102,241,0.18)]">
                <CardHeader>
                    <CardTitle className="text-white text-center mt-2 text-xl sm:text-2xl lg:text-3xl">Recent Interwiew Performances</CardTitle>
                </CardHeader> 
                <CardContent className="space-y-4 overflow-x-auto w-full">
                    {allInterviewsList.count <= 0 
                        ? <p className='text-slate-200 font-semibold'>There are no interviews...!</p> 
                        : (
                            <Table className="min-w-[800px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-slate-800/60">
                                        <TableHead className="text-indigo-500">Sr. No.</TableHead>
                                        <TableHead className="text-indigo-500">Title</TableHead>
                                        <TableHead className="text-indigo-500">Type</TableHead>
                                        <TableHead className="text-indigo-500">Experience</TableHead>
                                        <TableHead className="text-indigo-500">Duration</TableHead>
                                        <TableHead className="text-indigo-500">Date</TableHead>
                                        <TableHead className="text-indigo-500 pr-8 text-right">Score</TableHead>
                                        <TableHead className="text-indigo-500">Feedback</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {allInterviewsList?.allInterviews?.map((item, index) => {
                                        return (
                                            <TableRow key={index} className="border-b border-slate-700 hover:bg-slate-900/80">
                                                <TableCell className="font-medium text-white">{index+1}</TableCell>
                                                <TableCell className="font-medium text-white">{item.title}</TableCell>
                                                <TableCell className="text-slate-400 capitalize">{item.type}</TableCell>
                                                <TableCell className="text-slate-400 capitalize">{item.experience}</TableCell>
                                                <TableCell className="text-slate-400">{item.duration / 60} mins</TableCell>
                                                <TableCell className="text-slate-400">{formatDate(item.updatedAt)}</TableCell>
                                                <TableCell className="text-right pr-8 tabular-nums">
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
        </motion.div>
        
    )
}

export default Interviews;
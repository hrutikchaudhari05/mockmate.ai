// import React, { useState } from 'react';
// import {Link, NavLink, useLocation} from 'react-router-dom';
// import { motion, AnimatePresence } from 'framer-motion';

// // Redux imports
// import { useDispatch, useSelector } from 'react-redux';
// import { useNavigate } from 'react-router-dom';
// import { logout } from '@/store/authSlice';

// // shadcn imports 
// import {
//     DropdownMenu, 
//     DropdownMenuContent,
//     DropdownMenuItem,
//     DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';

// // Lucide-react imports 
// import { LogOut, Settings, User, Menu, LayoutDashboard, Gauge, Activity, BarChart3, ClipboardList, History, FileText, BookOpen, Info, HelpCircle } from 'lucide-react';


// // Ye hamara main layout hoga - har page pe same rahega
// const Layout = ({children}) => {
//     const [loggingOut, setLoggingOut] = useState(false);

//     const dispatch = useDispatch();
//     const navigate = useNavigate();
//     const location = useLocation();

//     const currentUser = useSelector(state => state.auth);
//     const username = currentUser?.user?.name;

//     const handleLogout = () => {
//         setLoggingOut(true);
//         dispatch(logout());
//         setTimeout(() => navigate('/login'), 1000);
//     }

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black">

//             {/* yaha navbar aayega - top fixed*/}

//             {loggingOut && (
//                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
//                     <div className="text-center">
//                         <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//                         <p className="text-slate-400">Logging out...</p>
//                     </div>
//                 </div>
//             )}


//             {/* Overall navbar container */}
//             <nav 
//                 className='fixed top-0 left-0 right-0 
//                 bg-indigo-950/20 backdrop-blur-md z-50
//                 border-b border-indigo-900/40
//                 shadow-[0_1px_12px_rgba(0,0,0,0.6)]'
//             >   
//                 {/* Flex Layout */}
//                 <div className='flex justify-between items-center h-14 px-8 sm:px-16 lg:px-28'>

//                     {/* Left - Branding logo  */}
//                     <div className="flex items-center">

//                         {/* Mobile hamburger */}
//                         <div className="md:hidden">
//                             <DropdownMenu modal={false}>
//                                 <DropdownMenuTrigger asChild>
//                                     <button className="w-8 h-8 flex items-center justify-center text-white">
//                                         <Menu size={26} className='text-indigo-500'/>
//                                     </button> 
//                                 </DropdownMenuTrigger>

//                                 <AnimatePresence>
//                                     <DropdownMenuContent
//                                         asChild
//                                         align="start"
//                                     >
//                                         <motion.div
//                                             initial={{ opacity: 0, scale: 0.95, y: -4 }}
//                                             animate={{ opacity: 1, scale: 1, y: 0 }}
//                                             exit={{ opacity: 0, scale: 0.95, y: -4 }}
//                                             transition={{ duration: 0.15, ease: "easeOut" }}
//                                             className="w-48 bg-slate-950 border backdrop-blur-sm border-indigo-900 rounded-md"
//                                         >
//                                             <DropdownMenuItem 
//                                                 className="flex items-center gap-2 text-slate-300 hover:text-white border-b rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer"
//                                                 onClick={() => navigate('/dashboard')}
//                                             >
//                                                 <Gauge size={16} className='shrink-0 text-indigo-400' />
//                                                 Dashboard
//                                             </DropdownMenuItem>
//                                             <DropdownMenuItem
//                                                 className="flex items-center gap-2 text-slate-300 hover:text-white border-b rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer" 
//                                                 onClick={() => navigate('/interviews')}
//                                             >
//                                                 <ClipboardList size={16} className='shrink-0 text-indigo-400' />
//                                                 Interviews
//                                             </DropdownMenuItem>
//                                             <DropdownMenuItem
//                                                 className="flex items-center gap-2 text-slate-300 hover:text-white rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer" 
//                                                 onClick={() => navigate('/guide')}
//                                             >
//                                                 <BookOpen size={16} className='shrink-0 text-amber-400/80' />
//                                                 Guide
//                                             </DropdownMenuItem>
//                                         </motion.div>
//                                     </DropdownMenuContent>
//                                 </AnimatePresence>
//                             </DropdownMenu>
//                         </div>

//                         <span className="md:hidden text-slate-200 font-bold text-lg">
//                             Mock<span className='text-indigo-400'>Mate</span>
//                         </span>

//                         {/* Brand */}
//                         <div className="hidden md:flex items-center">
//                             <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-2">
//                                 AI
//                             </div>
//                             <span className="hidden sm:block text-slate-200 font-bold text-xl">
//                                 Mock<span className='text-indigo-400'>Mate</span>
//                             </span>
//                         </div>
//                     </div>

//                     {/* Middle - Navigation (md+)  */}
//                     <div className='hidden md:flex items-center space-x-6'>

//                         {[
//                             { to: '/dashboard', label: 'Dashboard' },
//                             { to: '/interviews', label: 'Interviews' },
//                             { to: '/guide', label: 'Guide' },
//                         ].map(link => (
//                             <NavLink
//                                 key={link.to}
//                                 to={link.to}
//                                 className={({ isActive }) => 
//                                     `font-medium transition-colors ${
//                                     isActive
//                                         ? 'text-white border-b-2 border-amber-400 px-1'
//                                         : 'text-slate-300 hover:text-white'
//                                     }`
//                                 }
//                             >
//                                 {link.label}
//                             </NavLink>
//                         ))} 
//                     </div>

//                     {/* Right -  Profile  */}
//                     <div className='flex items-center gap-2'>

//                         {/* User's Name (lg only) */}
//                         <span className=' text-slate-200 font-medium hover:text-white transition-colors'>
//                             {username}
//                         </span>

//                         {/* Profile Dropdown */}
//                         <DropdownMenu modal={false}>

//                             {/* Trigger jo user ko dikhega - icon */}
//                             <DropdownMenuTrigger asChild>
//                                 {/* w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer */}
//                                 <button className='w-7 h-7 bg-indigo-600 rounded-full md:rounded-lg flex items-center justify-center text-white hover:bg-indigo-700 transition-colors cursor-pointer'>
//                                     <User size={16} strokeWidth={2.5} />
//                                 </button>
//                             </DropdownMenuTrigger>

//                             <AnimatePresence>
//                                 {/* CONTENT - Jo click pe dikhega */}
//                                 <DropdownMenuContent
//                                     asChild
//                                     align="end" 
//                                 >
//                                     <motion.div
//                                         initial={{ opacity: 0, scale: 0.95, y: -4 }}
//                                         animate={{ opacity: 1, scale: 1, y: 0 }}
//                                         exit={{ opacity: 0, scale: 0.95, y: -4 }}
//                                         transition={{ duration: 0.15, ease: "easeOut" }}
//                                         className="w-48 bg-slate-950 border backdrop-blur-sm border-indigo-900 rounded-md"
//                                     >
//                                         <DropdownMenuItem className="text-slate-300 hover:text-white border-b rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer">
//                                             <User size={16} className='mr-2 text-indigo-400'/>
//                                             Profile
//                                         </DropdownMenuItem>
//                                         <DropdownMenuItem className="text-slate-300 hover:text-white border-b rounded-none border-slate-700 focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer">
//                                             <Settings size={16} className='mr-2 text-indigo-400'/>
//                                             Settings
//                                         </DropdownMenuItem>
//                                         <DropdownMenuItem
//                                             className="text-slate-300 hover:text-white focus:text-white hover:bg-indigo-950/50 focus:bg-indigo-950 cursor-pointer"
//                                             onClick={handleLogout}
//                                         >
//                                             <LogOut size={16} className='mr-2 text-red-400'/>
//                                             LogOut
//                                         </DropdownMenuItem>
//                                     </motion.div>
//                                 </DropdownMenuContent>
//                             </AnimatePresence>

//                         </DropdownMenu>

//                     </div>
//                 </div>
//             </nav>

//             <motion.div
//                 key={location.pathname}
//                 initial={{ opacity: 0, y: 12 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: 0.4, ease: "easeOut" }}
//             >
//                 {/* yaha page content aayega (dashboard, interviewSetup, feedback, etc*/}
//                 <main className='pt-14 min-h-screen px-12 sm:px-16 lg:px-28 bg-gradient-to-br from-black via-indigo-950 to-black text-white'>   {/* pt-16 - padding top (space for navbar) */}
//                     {children}
//                 </main>

//             </motion.div>

            
//         </div>
//     );
// };

// export default Layout;





















import React, { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/authSlice';

// shadcn imports 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Lucide-react imports 
import {
  LogOut,
  Settings,
  User,
  Menu,
  Gauge,
  ClipboardList,
  BookOpen,
  Plus
} from 'lucide-react';

const Layout = ({ children }) => {
  const [loggingOut, setLoggingOut] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = useSelector(state => state.auth);
  const username = currentUser?.user?.name;

  const handleLogout = () => {
    setLoggingOut(true);
    dispatch(logout());
    setTimeout(() => navigate('/login'), 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-indigo-950 to-black">

      {loggingOut && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-400">Logging out...</p>
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav
        className="fixed top-0 left-0 right-0 z-50
        bg-indigo-950/20 backdrop-blur-md
        border-b border-indigo-900/40
        shadow-[0_1px_12px_rgba(0,0,0,0.6)]"
      >
        <div className="flex justify-between items-center h-14 px-8 sm:px-16 lg:px-28">

          {/* LEFT */}
          <div className="flex items-center gap-2">

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="w-8 h-8 flex items-center justify-center">
                    <Menu size={26} className="text-indigo-500" />
                  </button>
                </DropdownMenuTrigger>

                <AnimatePresence>
                  <DropdownMenuContent asChild align="start">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="w-48 bg-slate-950 border border-indigo-900 rounded-md"
                    >

                      {/* mobile pr interview start button */}
                      <DropdownMenuItem
                        onClick={() => navigate('/setup-interview')}
                        className="flex items-center gap-2 text-white bg-indigo-600 hover:bg-indigo-700 focus:bg-indigo-700 cursor-pointer"
                      >
                        <Plus size={16} />
                        New Interview
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-indigo-900/50
                        focus:bg-indigo-950/60 focus:text-white
                        data-[highlighted]:bg-indigo-950/60
                        data-[highlighted]:text-white
                        cursor-pointer"
                      >
                        <Gauge size={16} className="text-indigo-400" />
                        Dashboard
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate('/interviews')}
                        className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-indigo-900/50
                        focus:bg-indigo-950/60 focus:text-white
                        data-[highlighted]:bg-indigo-950/60
                        data-[highlighted]:text-white
                        cursor-pointer"
                      >
                        <ClipboardList size={16} className="text-indigo-400" />
                        Interviews
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => navigate('/guide')}
                        className="flex items-center gap-2 text-slate-300 hover:text-white hover:bg-indigo-900/50
                        focus:bg-indigo-950/60 focus:text-white
                        data-[highlighted]:bg-indigo-950/60
                        data-[highlighted]:text-white
                        cursor-pointer"
                      >
                        <BookOpen size={16} className="text-amber-400" />
                        Guide
                      </DropdownMenuItem>

                    </motion.div>
                  </DropdownMenuContent>
                </AnimatePresence>
              </DropdownMenu>
            </div>

            <span className="lg:hidden text-slate-200 font-bold text-lg">
              Mock<span className="text-indigo-400">Mate</span>
            </span>

            <div className="hidden lg:flex items-center">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold mr-2">
                AI
              </div>
              <span className="text-slate-200 font-bold text-xl">
                Mock<span className="text-indigo-400">Mate</span>
              </span>
            </div>
          </div>

          {/* MIDDLE */}
          <div className="hidden lg:flex items-center gap-6">
            {[
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/interviews', label: 'Interviews' },
              { to: '/guide', label: 'Guide' },
            ].map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  isActive
                    ? 'text-white border-b-2 border-amber-400 px-1'
                    : 'text-slate-300 hover:text-white'
                }
              >
                {link.label}
              </NavLink>
            ))}

            {/* interview start button */}
            <button
              onClick={() => navigate('/setup-interview')}
              className="ml-4 flex items-center gap-2 px-3 py-1
              bg-indigo-600 hover:bg-indigo-700
              text-white rounded-md font-medium transition-colors text-md"
            >
              <Plus size={16} className='mt-0.5' />
              New Interview
            </button>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            <span className="text-slate-200 font-medium">{username}</span>

            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="w-7 h-7 bg-indigo-600 rounded-full md:rounded-lg flex items-center justify-center text-white hover:bg-indigo-700">
                  <User size={16} />
                </button>
              </DropdownMenuTrigger>

              <AnimatePresence>
                <DropdownMenuContent asChild align="end">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="w-48 bg-slate-950 border border-indigo-900 rounded-md"
                  >
                    <DropdownMenuItem 
                        className="text-slate-300 hover:bg-indigo-900/60 hover:text-white
                        focus:bg-indigo-950/60 focus:text-white
                        data-[highlighted]:bg-indigo-950/60
                        data-[highlighted]:text-white
                        cursor-pointer"
                    >
                        <User size={16} className="mr-2 text-indigo-400" />
                        Profile
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                        className="text-slate-300 hover:text-white hover:bg-indigo-900/50
                        focus:bg-indigo-950/60 focus:text-white
                        data-[highlighted]:bg-indigo-950/60
                        data-[highlighted]:text-white
                        cursor-pointer"
                    >
                        <Settings size={16} className="mr-2 text-indigo-400" />
                        Settings
                    </DropdownMenuItem>

                    <DropdownMenuItem
                        onClick={handleLogout}
                        className="text-slate-300 hover:text-white hover:bg-indigo-900/50
                        focus:bg-indigo-950/60 focus:text-white
                        data-[highlighted]:bg-indigo-950/60
                        data-[highlighted]:text-white
                        cursor-pointer"
                    >
                        <LogOut size={16} className="mr-2 text-red-400" />
                        Logout
                    </DropdownMenuItem>
                  </motion.div>
                </DropdownMenuContent>
              </AnimatePresence>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      {/* PAGE */}
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <main className="pt-14 min-h-screen px-12 sm:px-16 lg:px-28 text-white">
          {children}
        </main>
      </motion.div>
    </div>
  );
};

export default Layout;

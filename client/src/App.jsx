import './App.css'
import Login from './pages/Login';
import Register from './pages/Register';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';
import { useEffect, useState } from 'react';

// import useSelector as we need the state isAuthenticated
import { useDispatch, useSelector } from 'react-redux';

// import components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';
import Feedback from './pages/Feedback';
import Landing from './pages/Landing';
import Interviews from './pages/Interviews';
import { autoLogin } from './store/authSlice';
import LoadingScreen from './components/LoadingScreen';
import Guide from './pages/Guide';


// create AuthenticateRoute 
const AuthenticatedRoute = ({children}) =>  {

  // pehle user authenticated hai yaa nhi iska state le lo redux se 
  const {isAuthenticated} = useSelector(state => state.auth);

  console.log('App.jsx -> User Logged In...', isAuthenticated);

  // if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // sending back to login page 
  } 

  // if authenticated
  return <Layout>{children}</Layout>;
};

// separate auth wrapper for InterviewRoom as there is no need of showing layout 
const InterviewAuthWrapper = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  const token = localStorage.getItem('token');

  // App.jsx - InterviewAuthWrapper mein
  console.log('InterviewAuthWrapper - Auth:', isAuthenticated, 'Token:', !!token);

  if (!isAuthenticated && !token) {
    return <Navigate to="/login"/>;
  }

  return children;
}


function App() {
  const dispatch = useDispatch();
  const [appLoading, setAppLoading] = useState(true);

  // App load pr auto-login 
  useEffect(() => {
    console.log("App Loading... checking auth...");
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        // auto-login attempt 
        await dispatch(autoLogin());
      }
      setAppLoading(false);
    }
    checkAuth();
  }, [dispatch]);


  if (appLoading) {
    return <LoadingScreen />;
  }

    
  return (
    <BrowserRouter> {/* Router add kiya, navigation enable karne ke liye */}
      <Routes>

        {/* Public Routes - Sab access kr sakte hain */}
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        

        {/* Protected Route - Dashboard */}
        <Route path="/dashboard" element={
          <AuthenticatedRoute>
            <Dashboard />
          </AuthenticatedRoute>
        } />

        {/* Protected Route - user's all interview list */}
        <Route path="/interviews" element={
          <AuthenticatedRoute>
            <Interviews />
          </AuthenticatedRoute>
        } />

        {/* Protected Route - guide */}
        <Route path="/guide" element={
          <AuthenticatedRoute>
            <Guide />
          </AuthenticatedRoute>
        } />

        {/* Protected Route - InterviewRoom */}
        <Route path="/interview-room/:interviewId" element={
          <InterviewAuthWrapper>
            <InterviewRoom />
          </InterviewAuthWrapper>
        } />

        {/* Protected Route - Feedback */}
        <Route path="/feedback/:interviewId" element={
          <AuthenticatedRoute>
            <Feedback />
          </AuthenticatedRoute>
        } />

        {/* Root path ko dashboard pe redirect karo */}
        <Route path='/' element={<Landing />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

import './App.css'
import Login from './pages/Login';
import Register from './pages/Register';
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom';

// import useSelector as we need the state isAuthenticated
import { useSelector } from 'react-redux';

// import components
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import InterviewRoom from './pages/InterviewRoom';


// create AuthenticateRoute 
const AuthenticatedRoute = ({children}) =>  {

  // pehle user authenticated hai yaa nhi iska state le lo redux se 
  // const {isAuthenticated} = useSelector(state => state.auth);
  const isAuthenticated = true;

  console.log('App.jsx -> User Logged In...', isAuthenticated);

  // if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />; // sending back to login page 
  } 

  // if authenticated
  return <Layout>{children}</Layout>;
};



function App() {
  const isAuthenticated = true; // Ya Redux se lo
  
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

        {/* Protected Route - InterviewRoom */}
        <Route path="/interview-room" element={
          isAuthenticated ? <InterviewRoom /> : <Navigate to="/login" />
        } />

        {/* Root path ko dashboard pe redirect karo */}
        <Route path='/' element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App

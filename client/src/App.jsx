import './App.css'
import './index.css'

import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'

// redux
import { useDispatch, useSelector } from 'react-redux'
import { autoLogin } from './store/authSlice'

// pages
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Interviews from './pages/Interviews'
import InterviewRoom from './pages/InterviewRoom'
import Feedback from './pages/Feedback'
import Landing from './pages/Landing'
import Guide from './pages/Guide'
import Setup from './pages/Setup'

// components
import Layout from './components/Layout'
import LoadingScreen from './components/LoadingScreen'

/* Auth Wrappers */

const AuthenticatedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <Layout>{children}</Layout>
}

const InterviewAuthWrapper = ({ children }) => {
  const { isAuthenticated } = useSelector(state => state.auth)
  const token = localStorage.getItem('token')

  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />
  }

  return children
}

/* Animated Routes */

const AnimatedRoutes = () => {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>

        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <AuthenticatedRoute>
              <Dashboard />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/interviews"
          element={
            <AuthenticatedRoute>
              <Interviews />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/setup-interview"
          element={
            <AuthenticatedRoute>
              <Setup />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/guide"
          element={
            <AuthenticatedRoute>
              <Guide />
            </AuthenticatedRoute>
          }
        />

        <Route
          path="/interview-room/:interviewId"
          element={
            <InterviewAuthWrapper>
              <InterviewRoom />
            </InterviewAuthWrapper>
          }
        />

        <Route
          path="/feedback/:interviewId"
          element={
            <AuthenticatedRoute>
              <Feedback />
            </AuthenticatedRoute>
          }
        />

        {/* Landing */}
        <Route path="/" element={<Landing />} />

      </Routes>
    </AnimatePresence>
  )
}

/* App */

function App() {
  const dispatch = useDispatch()
  const [appLoading, setAppLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (token) {
        await dispatch(autoLogin())
      }
      setAppLoading(false)
    }
    checkAuth()
  }, [dispatch])

  if (appLoading) {
    return <LoadingScreen />
  }

  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  )
}

export default App

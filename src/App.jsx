import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { persistor } from './store/store'
import './App.css'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Loader from './components/Loader'
import { ThemeProvider } from './contexts/ThemeContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-black">
        <Loader size="large" />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PersistGate loading={<Loader size="large" />} persistor={persistor}>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Router>
        </PersistGate>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

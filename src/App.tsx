import { useState, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import DashboardPage from './pages/dashboard/page'
import LoginPage from './pages/login/index/page'
import ErrorBoundary from './components/ErrorBoundary'
import OfflineModal from './components/UI/Modal/OfflineModal'
import ProtectedRoute from './utils/ProtectedRoute'
import LandingPage from './pages/landing/page'
import TransactionsPage from './pages/transactions/page'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <TransactionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: '*',
    element: <ErrorBoundary errorCode={404} errorMessage="Oops! It looks like this page doesn't exist." />,
  },
])

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [showOfflineModal, setShowOfflineModal] = useState(false)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineModal(true)
    } else {
      setShowOfflineModal(false)
    }
  }, [isOnline])

  const handleCloseModal = () => {
    setShowOfflineModal(false)
  }

  return (
    <>
      {showOfflineModal && <OfflineModal onClose={handleCloseModal} />}
      <AuthProvider>
        <div className="inset-0 bg-gray-100">
          <RouterProvider router={router} />
        </div>
      </AuthProvider>
    </>
  )
}

export default App

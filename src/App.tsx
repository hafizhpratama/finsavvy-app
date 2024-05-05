import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './utils/ProtectedRoute'
import DashboardPage from './pages/dashboard/DashboardPage'
import LoginPage from './pages/login/index/LoginPage'
import ErrorBoundary from './components/ErrorBoundary'
import TransactionsPage from './pages/transactions/index/TransactionsPage'

const router = createBrowserRouter([
  {
    path: '/',
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
  return (
    <AuthProvider>
      <div className="inset-0 bg-gray-100 py-4">
        <RouterProvider router={router} />
      </div>
    </AuthProvider>
  )
}

export default App

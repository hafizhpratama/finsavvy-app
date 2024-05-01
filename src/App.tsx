import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import './App.css'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './utils/ProtectedRoute'
import DashboardPage from './pages/dashboard/DashboardPage'
import LoginPage from './pages/login/index/LoginPage'
import TransactionPage from './pages/transaction/index/TransactionPage'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="inset-0 bg-gray-100 p-4">
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/transaction"
              element={
                <ProtectedRoute>
                  <TransactionPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<ErrorBoundary errorCode={404} errorMessage="Oops! It looks like this page doesn't exist." />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  )
}

export default App

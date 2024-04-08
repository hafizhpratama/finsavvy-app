import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import DashboardPage from './pages/IndexPage'

const App: React.FC = () => {
  return (
    <Router>
      <DashboardPage />
    </Router>
  )
}

export default App

import React, { ReactNode, useState } from 'react'
import { FaHome, FaDollarSign, FaPlus, FaUserCircle } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import AddTransactionModal from '../components/Modal/AddTransactionModal'
import { useAuth } from '../contexts/AuthContext'

interface IndexPageProps {
  children: ReactNode
  refreshData: () => void
  sendAlertMessage: (message: string) => void
}

const IndexPage: React.FC<IndexPageProps> = ({ children, refreshData, sendAlertMessage }) => {
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const { signOut } = useAuth()

  const openModal = () => setShowModal(true)
  const closeModal = () => setShowModal(false)
  const toggleOptions = () => setShowOptions(!showOptions)

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error: any) {
      console.error('Error signing out:', error.message)
    }
  }

  return (
    <div>
      {/* Profile Photo */}
      <div className="mb-2 mr-4 flex justify-end">
        <div className="relative">
          <div onClick={toggleOptions} className="h-10 w-10 cursor-pointer rounded-full bg-blue-gray-500">
            <FaUserCircle size={24} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transform text-white" />
          </div>
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
              <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                <button
                  onClick={handleLogout}
                  className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {children}

      {/* Bottom Bar */}
      <div className="fixed bottom-4 left-1/2 z-50 h-16 w-11/12 max-w-lg -translate-x-1/2 rounded-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
        <div className="mx-auto grid h-full max-w-lg grid-cols-3">
          <Link
            to="/"
            className={`group inline-flex flex-col items-center justify-center rounded-s-full px-5 ${location.pathname === '/' ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
          >
            <FaHome size={24} className="text-gray-400" />
            <span className="sr-only">Home</span>
          </Link>
          <div className="flex items-center justify-center">
            <button
              type="button"
              className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-medium hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              onClick={openModal}
            >
              <FaPlus size={20} color="white" />
            </button>
          </div>
          <Link
            to="/transaction"
            className={`group inline-flex flex-col items-center justify-center rounded-e-full px-5 ${location.pathname === '/transaction' ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
          >
            <FaDollarSign size={24} className="text-gray-400" />
          </Link>
        </div>
      </div>

      {showModal && <AddTransactionModal closeModal={closeModal} refreshData={refreshData} sendAlertMessage={sendAlertMessage} />}
    </div>
  )
}

export default IndexPage

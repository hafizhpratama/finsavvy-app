import React, { ReactNode, useState } from 'react'
import { FaHome, FaDollarSign, FaPlus } from 'react-icons/fa'
import { Link, useLocation } from 'react-router-dom'
import AddTransactionModal from '../components/Modal/AddTransactionModal'

interface IndexPageProps {
  children: ReactNode
}

const IndexPage: React.FC<IndexPageProps> = ({ children }) => {
  const location = useLocation()
  const [showModal, setShowModal] = useState(false)

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  return (
    <div>
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

      {showModal && <AddTransactionModal closeModal={closeModal} />}
    </div>
  )
}

export default IndexPage

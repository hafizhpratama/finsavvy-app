import React, { useState } from 'react'
import { FaHome, FaDollarSign, FaPlus } from 'react-icons/fa'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { Button, Input, Option, Select, Textarea, Typography } from '@material-tailwind/react'
import TransactionPage from './transaction/index/TransactionPage'
import DashboardPage from './index/DashboardPage'

const IndexPage: React.FC = () => {
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
      {/* Main Content */}
      <div className="inset-0 bg-gray-100 p-4">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transaction" element={<TransactionPage />} />
        </Routes>
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-4 left-1/2 z-50 h-16 w-11/12 max-w-lg -translate-x-1/2 rounded-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
        <div className="mx-auto grid h-full max-w-lg grid-cols-3">
          <Link
            to="/"
            className={`group inline-flex flex-col items-center justify-center rounded-s-full px-5 ${location.pathname === '/home' ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
          <div className="relative w-2/3 max-w-lg rounded-2xl bg-white">
            <div className="rounded-t-2xl border-b border-gray-200 px-6 py-4">
              <Typography
                variant="h6"
                color="black"
                className="font-semibold"
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
              >
                Add Transaction
              </Typography>
            </div>
            <div className="px-6">
              <div className="py-6">
                <div className="flex flex-col gap-6">
                  <Input
                    crossOrigin={[]}
                    type="number"
                    variant="outlined"
                    label="Total Transaction"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  />
                  <Select
                    variant="outlined"
                    label="Select Category"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  >
                    <Option>Material Tailwind HTML</Option>
                    <Option>Material Tailwind React</Option>
                    <Option>Material Tailwind Vue</Option>
                    <Option>Material Tailwind Angular</Option>
                    <Option>Material Tailwind Svelte</Option>
                  </Select>
                  <Textarea
                    variant="outlined"
                    label="Note"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  />
                  <Input
                    type="date"
                    variant="outlined"
                    label="Date"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                    crossOrigin={[]}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t py-4">
                <Button
                  variant="outlined"
                  onClick={closeModal}
                  placeholder=""
                  onPointerEnterCapture={() => {}}
                  onPointerLeaveCapture={() => {}}
                >
                  Cancel
                </Button>
                <Button type="button" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default IndexPage

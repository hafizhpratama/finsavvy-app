import React from 'react'
import Typography from '../Typography'

interface OfflineModalProps {
  onClose: () => void
}

const OfflineModal: React.FC<OfflineModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-5/6 rounded-2xl bg-white">
        <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <Typography className="text-sm font-semibold text-black">Message</Typography>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto px-4 py-6">
          <Typography className="text-sm font-normal text-black">You are offline.</Typography>
        </div>
      </div>
    </div>
  )
}

export default OfflineModal

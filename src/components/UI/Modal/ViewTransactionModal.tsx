import React from 'react'
import Typography from '../Typography'

interface ViewTransactionModalProps {
  closeModal: () => void
  transactions?: Transaction[]
}

const ViewTransactionModal: React.FC<ViewTransactionModalProps> = ({ closeModal, transactions }) => {
  const groupedTransactions: { [key: string]: Transaction[] } = {}
  transactions?.forEach((transaction) => {
    const date: string = transaction.date ?? ''
    groupedTransactions[date] = [...(groupedTransactions[date] || []), transaction]
  })

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const totalAllSpending = transactions ? transactions.reduce((total, transaction) => total + (transaction.total || 0), 0) : 0

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="relative w-5/6 rounded-2xl bg-white">
        <div className="flex items-center justify-between rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <Typography className="text-sm font-semibold text-black">Transaction Details</Typography>
          <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="max-h-[calc(100vh-100px)] overflow-y-auto px-4 py-6">
          {Object.entries(groupedTransactions).map(([date, transactions]) => (
            <div key={date} className="mb-8">
              <Typography className="text-sm font-semibold" color="indigo">
                {formatDate(date)}
              </Typography>
              <div>
                {transactions.map((transaction, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Typography className="text-sm font-normal text-black">{transaction.notes}</Typography>
                    </div>
                    <Typography className="text-sm font-normal text-black">{transaction.total?.toLocaleString() ?? '0'}</Typography>
                  </div>
                ))}
              </div>
            </div>
          ))}
          {/* Display total spending */}
          <div className="mt-4 flex items-center justify-between border-t border-gray-200 pt-4">
            <Typography className="text-sm font-semibold text-black">Total Spending</Typography>
            <Typography className="text-sm font-semibold text-black">Rp. {totalAllSpending.toLocaleString()}</Typography>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ViewTransactionModal

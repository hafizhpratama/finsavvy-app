import React, { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { getTransactionsByUserId } from '../../../services/supabaseService'
import Balance from '../../../components/Balance'
import Card from '../../../components/UI/Card'
import IndexPage from '../../IndexPage'
import Typography from '../../../components/UI/Typography'
import ErrorBoundary from '../../../components/ErrorBoundary'
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'

const TransactionPage: React.FC = () => {
  const { user } = useAuth()
  const today = new Date()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [refreshData, setRefreshData] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [filterDate, setFilterDate] = useState<DateValueType>({
    startDate: today.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  })

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const userId = user?.id || ''
        const data = await getTransactionsByUserId(userId, filterDate)
        setTransactions(data ?? [])
      } catch (error: any) {
        setTransactions([])
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [filterDate, refreshData])

  const inflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'income',
  )
  const outflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'outcome',
  )

  const getTotalAmount = (transactionList: Transaction[]) =>
    transactionList.reduce((total, transaction) => total + (transaction.total || 0), 0)

  const groupedTransactions: { [key: string]: Transaction[] } = {}
  transactions.forEach((transaction) => {
    const date: string = transaction.date ?? ''
    groupedTransactions[date] = [...(groupedTransactions[date] || []), transaction]
  })

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  const handleRefreshData = () => setRefreshData((prevState) => !prevState)

  const handleReceiveAlertMessage = (message: string) => {
    setAlertMessage(message)
    setIsVisible(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  const handleValueChange = (value: DateValueType) => {
    setFilterDate(value)
  }

  const handleAlertClose = () => setIsVisible(false)

  if (error) {
    return <ErrorBoundary errorCode={500} errorMessage={error} />
  }

  return (
    <IndexPage refreshData={handleRefreshData} sendAlertMessage={handleReceiveAlertMessage}>
      {isVisible && (
        <div
          id="alert-3"
          className="mx-4 mb-4 flex items-center rounded-lg bg-green-50 p-4 text-green-800 dark:bg-gray-800 dark:text-green-400"
          role="alert"
        >
          <div className="ms-3 text-sm font-medium">{alertMessage}</div>
          <button
            type="button"
            className="-mx-1.5 -my-1.5 ms-auto inline-flex h-8 w-8 items-center justify-center rounded-lg bg-green-50 p-1.5 text-green-500 hover:bg-green-200 focus:ring-2 focus:ring-green-400 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
            aria-label="Close"
            onClick={handleAlertClose}
          >
            <span className="sr-only">Close</span>
            <svg className="h-3 w-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
          </button>
        </div>
      )}
      <div className="mb-16">
        <Balance refreshData={handleRefreshData} />
        <Card title="Filter">
          <div className="mb-4 flex justify-between rounded-lg border-2 border-solid border-gray-300">
            <Datepicker useRange value={filterDate} onChange={handleValueChange} />
          </div>
        </Card>
        <Card title="Flow">
          <div className="grid grid-cols-2 items-center">
            <div>
              <Typography className="text-sm font-semibold text-black">Inflow Total</Typography>
              {isLoading ? (
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
              ) : (
                <Typography style={{ color: '#1B9C85' }} className="text-sm font-semibold">
                  Rp. {getTotalAmount(inflowTransactions).toLocaleString()}
                </Typography>
              )}
            </div>
            <div>
              <Typography className="text-sm font-semibold text-black">Outflow Total</Typography>
              {isLoading ? (
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
              ) : (
                <Typography style={{ color: '#FE0000' }} className="text-sm font-semibold">
                  Rp. {Math.abs(getTotalAmount(outflowTransactions)).toLocaleString()}
                </Typography>
              )}
            </div>
          </div>
        </Card>
        <Card title="Transactions">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((_, index) => (
                <div key={index} className="max-w-full animate-pulse">
                  <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                    &nbsp;
                  </Typography>
                </div>
              ))}
            </>
          ) : (
            <>
              {Object.entries(groupedTransactions).length === 0 ? (
                <div className="text-center">
                  <span className="py-16 text-sm font-normal text-gray-500">No transactions found for this period.</span>
                </div>
              ) : (
                Object.entries(groupedTransactions).map(([date, transactions]) => (
                  <div key={date} className="mb-8 border-b border-gray-200">
                    <Typography className="text-sm font-semibold" color="indigo">
                      {formatDate(date)}
                    </Typography>
                    <div className="divide-y divide-gray-200">
                      {transactions.map((transaction, index) => (
                        <div key={index} className="flex items-center justify-between py-2">
                          <div className="flex-1">
                            <Typography className="text-sm font-normal text-black">{transaction.notes}</Typography>
                          </div>
                          <Typography className="text-sm font-normal text-black">
                            Rp. {transaction.total?.toLocaleString() ?? '0'}
                          </Typography>
                        </div>
                      ))}
                      <div className="flex items-center justify-between py-2">
                        <Typography className="text-sm font-semibold text-black">Total</Typography>
                        <Typography className="text-sm font-semibold text-black">
                          Rp. {getTotalAmount(transactions).toLocaleString()}
                        </Typography>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </Card>
      </div>
    </IndexPage>
  )
}

export default TransactionPage

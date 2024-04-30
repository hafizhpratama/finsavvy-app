import React, { useState, useEffect } from 'react'
import { Option } from '@material-tailwind/react'
import { useAuth } from '../../../contexts/AuthContext'
import { getTransactionsByUserId } from '../../../services/supabaseService'
import Balance from '../../../components/Balance'
import Card from '../../../components/Card'
import IndexPage from '../../IndexPage'
import Typography from '../../../components/Typography'
import Select from '../../../components/Select'
import Error from '../../../components/Error'

const TransactionPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [refreshData, setRefreshData] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const userId = user?.id
        const data = await getTransactionsByUserId(userId, selectedMonth, selectedYear)
        setTransactions(data ?? [])
      } catch (error: any) {
        console.error('Error fetching transactions:', error)
        setTransactions([])
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear, refreshData])

  // Filter transactions
  const inflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'income',
  )
  const outflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'outcome',
  )

  // Calculate total amount
  const getTotalAmount = (transactionList: Transaction[]) =>
    transactionList.reduce((total, transaction) => total + (transaction.total || 0), 0)

  // Group transactions by date
  const groupedTransactions: { [key: string]: Transaction[] } = {}
  transactions.forEach((transaction) => {
    const date: string = transaction.date ?? ''
    groupedTransactions[date] = [...(groupedTransactions[date] || []), transaction]
  })

  // Format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Calculate balance
  const getBalance = (inflow: number, outflow: number) => inflow - outflow

  // Refresh data
  const handleRefreshData = () => setRefreshData((prevState) => !prevState)

  // Display alert message
  const handleReceiveAlertMessage = (message: string) => {
    setAlertMessage(message)
    setIsVisible(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  const handleAlertClose = () => setIsVisible(false)

  if (error) {
    return <Error errorCode={500} errorMessage={error} />
  }

  return (
    <>
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
          <Balance
            balance={getBalance(getTotalAmount(inflowTransactions), Math.abs(getTotalAmount(outflowTransactions)))}
            loading={isLoading}
          />
          <Card title="Filter">
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <Select
                value={String(selectedMonth)}
                id="month"
                label="Month"
                onChange={(e) => setSelectedMonth(parseInt(e || ''))}
                className="w-full"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Option key={month} value={String(month)}>
                    {month}
                  </Option>
                ))}
              </Select>
              <Select
                value={String(selectedYear)}
                id="year"
                label="Year"
                onChange={(e) => setSelectedYear(parseInt(e || ''))}
                className="w-full"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <Option key={year} value={String(year)}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>
          </Card>
          <Card title="Flow">
            <div className="grid grid-cols-2 items-center">
              <div>
                <Typography variant="h6">Inflow Total</Typography>
                {isLoading ? (
                  <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                    &nbsp;
                  </Typography>
                ) : (
                  <Typography variant="paragraph" color="green" className="font-semibold">
                    Rp. {getTotalAmount(inflowTransactions).toLocaleString()}
                  </Typography>
                )}
              </div>
              <div>
                <Typography variant="h6">Outflow Total</Typography>
                {isLoading ? (
                  <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                    &nbsp;
                  </Typography>
                ) : (
                  <Typography variant="paragraph" color="red" className="font-semibold">
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
                    <Typography variant="paragraph">No transactions found for this period.</Typography>
                  </div>
                ) : (
                  Object.entries(groupedTransactions).map(([date, transactions]) => (
                    <div key={date} className="mb-8 border-b border-gray-200">
                      <Typography variant="h6" color="indigo">
                        {formatDate(date)}
                      </Typography>
                      <div className="divide-y divide-gray-200">
                        {transactions.map((transaction, index) => (
                          <div key={index} className="flex items-center justify-between py-2">
                            <div className="flex-1">
                              <Typography variant="paragraph">{transaction.notes}</Typography>
                            </div>
                            <Typography variant="paragraph">Rp. {transaction.total?.toLocaleString() ?? '0'}</Typography>
                          </div>
                        ))}
                        <div className="flex items-center justify-between py-2">
                          <Typography variant="paragraph" className="font-semibold">
                            Total
                          </Typography>
                          <Typography variant="paragraph" className="font-semibold">
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
    </>
  )
}

export default TransactionPage

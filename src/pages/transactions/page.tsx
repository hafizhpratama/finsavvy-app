import React, { useState, useEffect } from 'react'
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import { BiCheckCircle } from 'react-icons/bi'
import { useAuth } from '../../contexts/AuthContext'
import { getTransactionsByUserId } from '../../services/supabaseService'
import ErrorBoundary from '../../components/ErrorBoundary'
import IndexPage from '../page'
import Balance from '../../components/Balance'
import Card from '../../components/UI/Card'
import UpdateTransactionModal from '../../components/UI/Modal/UpdateTransactionModal'
import Typography from '../../components/UI/Typography'
import { Alert } from '@material-tailwind/react'

const TransactionsPage: React.FC = () => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [refreshData, setRefreshData] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth() - 1, 26)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth(), 26)

  const [filterDate, setFilterDate] = useState<DateValueType>({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0],
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

  const inflowTransactions = filterTransactions(transactions, 'income')
  const outflowTransactions = filterTransactions(transactions, 'outcome')

  const handleRefreshData = () => setRefreshData((prev) => !prev)

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

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction)
    setIsModalOpen(true)
  }

  if (error) {
    return <ErrorBoundary errorCode={500} errorMessage={error} />
  }

  return (
    <IndexPage refreshData={handleRefreshData} sendAlertMessage={handleReceiveAlertMessage}>
      {isVisible && (
        <Alert icon={<BiCheckCircle />} className="rounded-none border-l-4 border-[#2ec946] bg-[#2ec946]/10 font-medium text-[#2ec946]">
          {alertMessage}
        </Alert>
      )}
      <div className="mb-16">
        <Balance refreshData={refreshData} />
        <Card title="Filter">
          <div className="mb-4 flex justify-between rounded-lg border-2 border-solid border-gray-300">
            <Datepicker readOnly useRange value={filterDate} onChange={handleValueChange} />
          </div>
        </Card>
        <Card title="Flow">
          <FlowDisplay
            isLoading={isLoading}
            inflowTotal={getTotalAmount(inflowTransactions, 'income')}
            outflowTotal={getTotalAmount(outflowTransactions, 'outcome')}
          />
        </Card>
        <Card title="Transactions">
          <TransactionList isLoading={isLoading} transactions={transactions} onTransactionClick={handleTransactionClick} />
        </Card>
      </div>
      {isModalOpen && selectedTransaction && (
        <UpdateTransactionModal
          sendAlertMessage={handleReceiveAlertMessage}
          transaction={selectedTransaction}
          closeModal={() => setIsModalOpen(false)}
          refreshData={handleRefreshData}
        />
      )}
    </IndexPage>
  )
}

export default TransactionsPage

// Helper function to format date
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.toLocaleString('default', { month: 'long' })
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Helper function to filter transactions by category type
const filterTransactions = (transactions: Transaction[], categoryType: string): Transaction[] => {
  return transactions.filter((transaction) => transaction.total && transaction.total > 0 && transaction.category_type === categoryType)
}

// Helper function to get total amount from a list of transactions
const getTotalAmount = (transactionList: Transaction[], categoryType: string): number => {
  return transactionList
    .filter((transaction) => transaction.category_type === categoryType)
    .reduce((total, transaction) => total + (transaction.total || 0), 0)
}

// Functional component for displaying flow totals
const FlowDisplay: React.FC<{ isLoading: boolean; inflowTotal: number; outflowTotal: number }> = ({
  isLoading,
  inflowTotal,
  outflowTotal,
}) => (
  <div className="grid grid-cols-2 items-center">
    <FlowItem title="Inflow Total" amount={inflowTotal} color="#1B9C85" isLoading={isLoading} />
    <FlowItem title="Outflow Total" amount={Math.abs(outflowTotal)} color="#FE0000" isLoading={isLoading} />
  </div>
)

// Functional component for individual flow item
const FlowItem: React.FC<{ title: string; amount: number; color: string; isLoading: boolean }> = ({ title, amount, color, isLoading }) => (
  <div>
    <Typography className="text-sm font-semibold text-black">{title}</Typography>
    {isLoading ? (
      <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
        &nbsp;
      </Typography>
    ) : (
      <Typography style={{ color }} className="text-sm font-semibold">
        Rp. {amount.toLocaleString()}
      </Typography>
    )}
  </div>
)

// Functional component for displaying list of transactions
const TransactionList: React.FC<{
  isLoading: boolean
  transactions: Transaction[]
  onTransactionClick: (transaction: Transaction) => void
}> = ({ isLoading, transactions, onTransactionClick }) => (
  <>
    {isLoading
      ? [...Array(4)].map((_, index) => (
          <div key={index} className="max-w-full animate-pulse">
            <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
              &nbsp;
            </Typography>
          </div>
        ))
      : Object.entries(groupTransactionsByDate(transactions)).map(([date, groupedTransactions]) => (
          <div key={date} className="mb-8 border-b border-gray-200">
            <Typography className="text-sm font-semibold" color="indigo">
              {formatDate(date)}
            </Typography>
            <TransactionGroup transactions={groupedTransactions} onTransactionClick={onTransactionClick} />
          </div>
        ))}
  </>
)

// Helper function to group transactions by date
const groupTransactionsByDate = (transactions: Transaction[]): { [key: string]: Transaction[] } => {
  const groupedTransactions: { [key: string]: Transaction[] } = {}
  transactions.forEach((transaction) => {
    const date: string = transaction.date ?? ''
    groupedTransactions[date] = [...(groupedTransactions[date] || []), transaction]
  })
  return groupedTransactions
}

// Functional component for displaying a group of transactions for a specific date
const TransactionGroup: React.FC<{ transactions: Transaction[]; onTransactionClick: (transaction: Transaction) => void }> = ({
  transactions,
  onTransactionClick,
}) => (
  <div className="divide-y divide-gray-200">
    {transactions.map((transaction, index) => (
      <div key={index} className="flex cursor-pointer items-center justify-between py-2" onClick={() => onTransactionClick(transaction)}>
        <div className="flex-1">
          <Typography className="text-sm font-normal text-black">{transaction.notes}</Typography>
        </div>
        <Typography className="text-sm font-normal text-black">{transaction.total?.toLocaleString() ?? '0'}</Typography>
      </div>
    ))}
    <div className="flex items-center justify-between py-2">
      <Typography className="text-sm font-semibold text-black">Total</Typography>
      <Typography className="text-sm font-semibold text-black">Rp. {getTotalAmount(transactions, 'outcome').toLocaleString()}</Typography>
    </div>
  </div>
)

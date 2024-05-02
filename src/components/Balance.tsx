import React, { useEffect, useState } from 'react'
import Card from './UI/Card'
import Typography from './UI/Typography'
import { getTransactionsByUserId } from '../services/supabaseService'
import { useAuth } from '../contexts/AuthContext'
import ErrorBoundary from './ErrorBoundary'

interface BalanceProps {
  refreshData?: () => void
}

const Balance: React.FC<BalanceProps> = ({ refreshData }) => {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = user?.id || ''
        const [transactionData] = await Promise.all([getTransactionsByUserId(userId)])
        if (transactionData) setTransactions(transactionData)
      } catch (error: any) {
        setError(error || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [refreshData])

  const inflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'income',
  )
  const outflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'outcome',
  )

  const getTotalAmount = (transactionList: Transaction[]) =>
    transactionList.reduce((total, transaction) => total + (transaction.total || 0), 0)

  const getBalance = (inflow: number, outflow: number) => inflow - outflow

  const balance = getBalance(getTotalAmount(inflowTransactions), Math.abs(getTotalAmount(outflowTransactions)))

  if (error) {
    return <ErrorBoundary errorCode={500} errorMessage={error} />
  }

  return (
    <>
      <Card title="My Balance">
        {isLoading ? (
          <div className="max-w-full animate-pulse">
            <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
              &nbsp;
            </Typography>
          </div>
        ) : (
          <div className="flex items-center">
            <Typography style={{ color: balance >= 0 ? '#1B9C85' : '#FE0000' }} className="text-sm font-semibold">
              Rp. {balance.toLocaleString()}
            </Typography>
          </div>
        )}
      </Card>
    </>
  )
}

export default Balance

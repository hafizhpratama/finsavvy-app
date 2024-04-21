import { Option, Select, Typography } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
import Balance from '../../../components/Balance'
import Card from '../../../components/Card'
import IndexPage from '../../IndexPage'
import { Transaction } from '../../../interfaces/Transaction'
import { getTransactionsByUserId } from '../../../services/supabaseService'
import { useAuth } from '../../../contexts/AuthContext'

const TransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const { user } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      const userId = user?.id
      const data = await getTransactionsByUserId(userId, selectedMonth, selectedYear)

      if (data) {
        setTransactions(data)
      } else {
        setTransactions([])
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear])

  const inflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'income',
  )
  const outflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'outcome',
  )

  const getTotalAmount = (transactionList: Transaction[]) => {
    return transactionList.reduce((total, transaction) => total + (transaction.total || 0), 0)
  }

  const groupedTransactions: { [key: string]: Transaction[] } = {}
  transactions.forEach((transaction) => {
    const date: string = transaction.date ?? ''
    if (!groupedTransactions[date]) {
      groupedTransactions[date] = []
    }
    groupedTransactions[date].push(transaction)
  })

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
    return date.toLocaleDateString('en-US', options)
  }

  const getBalance = (inflow: number, outflow: number) => {
    return inflow - outflow
  }

  return (
    <>
      <IndexPage>
        <div className="mb-16">
          <Balance balance={getBalance(getTotalAmount(inflowTransactions), Math.abs(getTotalAmount(outflowTransactions)))} />

          <Card title="Filter">
            <div className="flex w-full flex-col gap-4 sm:flex-row">
              <Select
                value={String(selectedMonth)}
                id="month"
                label="Month"
                onChange={(e) => {
                  const selectedValue = parseInt(e || '')
                  setSelectedMonth(selectedValue)
                }}
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
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
                onChange={(e) => {
                  const selectedValue = parseInt(e || '')
                  setSelectedYear(selectedValue)
                }}
                placeholder=""
                onPointerEnterCapture={() => {}}
                onPointerLeaveCapture={() => {}}
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
            <div>
              <div className="grid grid-cols-2 items-center">
                <div>
                  <Typography variant="h6" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    Inflow Total
                  </Typography>
                  <Typography
                    variant="paragraph"
                    color="green"
                    className="font-semibold"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  >
                    Rp. {getTotalAmount(inflowTransactions).toLocaleString()}
                  </Typography>
                </div>
                <div>
                  <Typography variant="h6" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    Outflow Total
                  </Typography>
                  <Typography
                    variant="paragraph"
                    color="red"
                    className="font-semibold"
                    placeholder=""
                    onPointerEnterCapture={() => {}}
                    onPointerLeaveCapture={() => {}}
                  >
                    Rp. {Math.abs(getTotalAmount(outflowTransactions)).toLocaleString()}
                  </Typography>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Transaction">
            {Object.entries(groupedTransactions).map(([date, transactions]) => (
              <div key={date} className="mb-8 border-b border-gray-200">
                <Typography variant="h6" color="indigo" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                  {formatDate(date)}
                </Typography>
                <div className="divide-y divide-gray-200">
                  {transactions.map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between py-2">
                      <div className="flex-1">
                        <Typography variant="paragraph" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                          {transaction.notes}
                        </Typography>
                      </div>
                      <Typography variant="paragraph" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        Rp. {transaction.total?.toLocaleString() ?? '0'}
                      </Typography>
                    </div>
                  ))}
                  <div className="flex items-center justify-between py-2">
                    <Typography
                      variant="paragraph"
                      className="font-semibold"
                      placeholder=""
                      onPointerEnterCapture={() => {}}
                      onPointerLeaveCapture={() => {}}
                    >
                      Total
                    </Typography>
                    <Typography
                      variant="paragraph"
                      className="font-semibold"
                      placeholder=""
                      onPointerEnterCapture={() => {}}
                      onPointerLeaveCapture={() => {}}
                    >
                      Rp. {getTotalAmount(transactions).toLocaleString()}
                    </Typography>
                  </div>
                </div>
              </div>
            ))}
          </Card>
        </div>
      </IndexPage>
    </>
  )
}

export default TransactionPage

import { Option, Select, Typography } from '@material-tailwind/react'
import React, { useState, useEffect } from 'react'
import Balance from '../../../components/Balance'
import Card from '../../../components/Card'

interface Transaction {
  id: number
  date: string
  amount: number
  description: string
}

const TransactionPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())

  useEffect(() => {
    const fetchData = async () => {
      const dummyData: { [key: string]: Transaction[] } = {
        '2024-03': [
          { id: 1, date: '2024-03-01', amount: 100, description: 'Groceries' },
          { id: 2, date: '2024-03-05', amount: 50, description: 'Dinner' },
          { id: 3, date: '2024-03-10', amount: 200, description: 'Shopping' },
        ],
        '2024-04': [
          { id: 4, date: '2024-04-01', amount: 80, description: 'Breakfast' },
          { id: 5, date: '2024-04-01', amount: 120, description: 'Lunch' },
          { id: 6, date: '2024-04-05', amount: 500, description: 'Salary' },
        ],
      }

      const selectedMonthKey = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`
      if (dummyData[selectedMonthKey]) {
        setTransactions(dummyData[selectedMonthKey])
      } else {
        setTransactions([])
      }
    }

    fetchData()
  }, [selectedMonth, selectedYear])

  const inflowTransactions = transactions.filter((transaction) => transaction.amount > 0)
  const outflowTransactions = transactions.filter((transaction) => transaction.amount < 0)

  const getTotalAmount = (transactionList: Transaction[]) => {
    return transactionList.reduce((total, transaction) => total + transaction.amount, 0)
  }

  const groupedTransactions: { [key: string]: Transaction[] } = {}
  transactions.forEach((transaction) => {
    const date = transaction.date
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

  return (
    <>
      <div className="mb-16">
        <Balance balance={0} />

        <Card title="Filter">
          <div className="grid grid-cols-2 items-center gap-2">
            <div>
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
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <Option key={month} value={String(month)}>
                    {month}
                  </Option>
                ))}
              </Select>
            </div>
            <div>
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
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <Option key={year} value={String(year)}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>
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
                  ${getTotalAmount(inflowTransactions).toFixed(2)}
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
                  ${Math.abs(getTotalAmount(outflowTransactions)).toFixed(2)}
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
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2">
                    <div className="flex-1">
                      <Typography variant="paragraph" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                        {transaction.description}
                      </Typography>
                    </div>
                    <Typography variant="paragraph" placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                      ${transaction.amount.toFixed(2)}
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
                    ${getTotalAmount(transactions).toFixed(2)}
                  </Typography>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </>
  )
}

export default TransactionPage

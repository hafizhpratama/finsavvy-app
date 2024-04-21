// pages/dashboard/DashboardPage.tsx
import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { Avatar, List, ListItem, ListItemPrefix, ListItemSuffix, Typography } from '@material-tailwind/react'
import Balance from '../../components/Balance'
import Card from '../../components/Card'
import IndexPage from '../IndexPage'
import { getTransactionsByUserId } from '../../services/supabaseService'
import { Transaction } from '../../interfaces/Transaction'
import { useAuth } from '../../contexts/AuthContext'
import { getCategories } from '../../services/supabaseService'
import { Category } from '../../interfaces/Category'

const DashboardPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const { user } = useAuth()

  useEffect(() => {
    async function fetchTransactions() {
      const userId = user?.id
      const data = await getTransactionsByUserId(userId)
      if (data) {
        setTransactions(data)
      }
    }
    async function fetchCategories() {
      const userId = user?.id
      const data = await getCategories(userId)
      if (data) {
        setCategories(data)
      }
    }
    fetchTransactions()
    fetchCategories()
  }, [])

  const calculateTopSpending = (transactions: Transaction[], categories: Category[]): { title: string; amount: number }[] => {
    const categoryMap: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const categoryId = transaction.category_id
      const category = categories.find((cat) => cat.category_id === categoryId)
      const categoryName = category ? category.category_name : 'Other'
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (transaction?.total || 0)
    })

    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])

    return sortedCategories.slice(0, 3).map(([categoryName, total]) => ({ title: categoryName, amount: total }))
  }

  const calculateMonthlySpending = (transactions: Transaction[]): { label: string; amount: number }[] => {
    const today = new Date()
    const thisYear = today.getFullYear()
    const thisMonth = today.getMonth()

    const monthlySpending: { [key: string]: number } = {}

    for (let i = 0; i <= thisMonth; i++) {
      const month = new Date(thisYear, i, 1)
      const nextMonth = new Date(thisYear, i + 1, 1)
      const monthTransactions = transactions.filter(
        (transaction) => new Date(transaction.date || '') >= month && new Date(transaction.date || '') < nextMonth,
      )
      const monthTotal = monthTransactions.reduce((total, transaction) => total + (transaction?.total || 0), 0)

      monthlySpending[month.toLocaleDateString('default', { month: 'long' })] = monthTotal
    }

    return Object.entries(monthlySpending).map(([month, total]) => ({
      label: month,
      amount: total,
    }))
  }

  const monthlySpendingData = calculateMonthlySpending(transactions)
  const topSpendingData = calculateTopSpending(transactions, categories)

  const calculatePieChartData = (transactions: Transaction[]): { label: string; amount: number }[] => {
    const categoryMap: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const categoryId = transaction.category_id
      const category = categories.find((cat) => cat.category_id === categoryId)
      const categoryName = category ? category.category_name : 'Other'
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (transaction?.total || 0)
    })

    return Object.entries(categoryMap).map(([categoryName, total]) => ({ label: categoryName, amount: total }))
  }

  const pieChartData = calculatePieChartData(transactions)

  const options: ApexOptions = {
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
      },
    },
    colors: ['#020617'],
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      axisTicks: {
        show: false,
      },
      axisBorder: {
        show: false,
      },
      labels: {
        style: {
          colors: '#616161',
          fontSize: '12px',
          fontFamily: 'inherit',
          fontWeight: 400,
        },
      },
      categories: monthlySpendingData.map((item) => item.label),
    },
    yaxis: {
      labels: {
        style: {
          colors: '#616161',
          fontSize: '12px',
          fontFamily: 'inherit',
          fontWeight: 400,
        },
        formatter: function (value) {
          return 'Rp. ' + value.toLocaleString()
        },
      },
    },
    grid: {
      show: true,
      borderColor: '#dddddd',
      strokeDashArray: 5,
      xaxis: {
        lines: {
          show: true,
        },
      },
      padding: {
        top: 5,
        right: 20,
      },
    },
    labels: pieChartData.map((item) => item.label),
    legend: {
      position: 'bottom',
    },
  }

  const series = [
    {
      name: 'Spending',
      data: monthlySpendingData.map((item) => item.amount),
    },
  ]

  const pieChartColors = ['#4CAF50', '#FFC107', '#2196F3', '#E91E63', '#9C27B0', '#607D8B', '#795548', '#FF5722', '#009688', '#FF9800']

  const getBalance = (inflow: number, outflow: number) => {
    return inflow - outflow
  }

  const inflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'income',
  )
  const outflowTransactions = transactions.filter(
    (transaction) => transaction.total && transaction.total > 0 && transaction.category_type === 'outcome',
  )

  const getTotalAmount = (transactionList: Transaction[]) => {
    return transactionList.reduce((total, transaction) => total + (transaction.total || 0), 0)
  }

  return (
    <>
      <IndexPage>
        <div className="mb-16">
          <Balance balance={getBalance(getTotalAmount(inflowTransactions), Math.abs(getTotalAmount(outflowTransactions)))} />

          <Card title="Spending Report">
            <div className="w-full">
              {/* Spending Report */}
              <ReactApexChart options={options} series={series} type="bar" width="100%" height={350} />
            </div>
          </Card>

          <Card title="Spending Report Pie Chart">
            <div className="flex flex-col items-center">
              {/* Spending Report */}
              <div className="w-full">
                <ReactApexChart
                  options={{ ...options, colors: pieChartColors, legend: { position: 'bottom' } }}
                  series={pieChartData.map((item) => item.amount)}
                  type="pie"
                  width="100%"
                  height={350}
                />
              </div>
            </div>
          </Card>

          <Card title="Top Spending">
            <div>
              <List placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                {topSpendingData.map((item, index) => (
                  <ListItem key={index} placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                    <ListItemPrefix placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                      <Avatar
                        variant="circular"
                        alt="candice"
                        src="https://docs.material-tailwind.com/img/face-1.jpg"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                      />
                    </ListItemPrefix>
                    <div>
                      <Typography
                        variant="h6"
                        color="blue-gray"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-normal"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                      >
                        Rp. {item.amount.toLocaleString()}
                      </Typography>
                    </div>
                    <ListItemSuffix placeholder="" onPointerEnterCapture={() => {}} onPointerLeaveCapture={() => {}}>
                      <Typography
                        variant="small"
                        color="gray"
                        className="font-normal"
                        placeholder=""
                        onPointerEnterCapture={() => {}}
                        onPointerLeaveCapture={() => {}}
                      >
                        {((item.amount / 500) * 100).toFixed(1)}%
                      </Typography>
                    </ListItemSuffix>
                  </ListItem>
                ))}
              </List>
            </div>
          </Card>
        </div>
      </IndexPage>
    </>
  )
}

export default DashboardPage

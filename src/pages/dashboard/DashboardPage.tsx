import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { Alert, Avatar, List, ListItem, ListItemPrefix, Option } from '@material-tailwind/react'
import Balance from '../../components/Balance'
import Card from '../../components/Card'
import IndexPage from '../IndexPage'
import { getTransactionsByUserId, getCategories } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import Typography from '../../components/Typography'
import Select from '../../components/Select'
import { BiCheckCircle } from 'react-icons/bi'
import Error from '../../components/Error'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const today = new Date()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const [refreshData, setRefreshData] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [monthlySpendingData, setMonthlySpendingData] = useState<{ label: string; amount: number }[]>([])
  const [pieChartData, setPieChartData] = useState<{ label: string; amount: number }[]>([])
  const [filterDate, setFilterDate] = useState<DateValueType>({
    startDate: today.toISOString().split('T')[0],
    endDate: today.toISOString().split('T')[0],
  })

  const handleRefreshData = () => setRefreshData((prevState) => !prevState)

  const handleValueChange = (value: DateValueType) => {
    setIsLoading(true)
    setFilterDate(value)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = user?.id
        const [transactionData, categoryData] = await Promise.all([getTransactionsByUserId(userId), getCategories(userId)])
        if (transactionData) setTransactions(transactionData)
        if (categoryData) setCategories(categoryData)
      } catch (error: any) {
        setError(error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [refreshData, user])

  useEffect(() => {
    const pieChartData = calculatePieChartData(transactions, filterDate)
    setPieChartData(pieChartData)
  }, [transactions, filterDate])

  useEffect(() => {
    const monthlySpendingData = calculateMonthlySpending(transactions, selectedYear)
    setMonthlySpendingData(monthlySpendingData)
  }, [transactions, selectedYear])

  const calculateTopSpending = (transactions: Transaction[], categories: Category[]): { title: string; amount: number }[] => {
    const categoryMap: { [key: string]: number } = {}

    transactions.forEach((transaction) => {
      const categoryId = transaction.category_id
      const category = categories.find((cat) => cat.category_id === categoryId)
      const categoryName = category ? category.category_name : 'Other'
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (transaction?.total || 0)
    })

    const sortedCategories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1])

    return sortedCategories.slice(0, 5).map(([categoryName, total]) => ({ title: categoryName, amount: total }))
  }

  const calculateMonthlySpending = (transactions: Transaction[], selectedYear: number): { label: string; amount: number }[] => {
    const monthsToShow = selectedYear === today.getFullYear() ? today.getMonth() + 1 : 12

    const monthlySpending: { [key: string]: number } = {}

    for (let i = 0; i < monthsToShow; i++) {
      const month = new Date(selectedYear, i, 1)
      const nextMonth = new Date(selectedYear, i + 1, 1)
      const monthTransactions = transactions.filter(
        (transaction) => new Date(transaction.date || '') >= month && new Date(transaction.date || '') < nextMonth,
      )
      const monthTotal = monthTransactions.reduce((total, transaction) => total + (transaction?.total || 0), 0)

      monthlySpending[month.toLocaleDateString('default', { month: 'long' })] = monthTotal
    }

    return Object.entries(monthlySpending).map(([month, total]) => ({ label: month, amount: total }))
  }

  const calculatePieChartData = (transactions: Transaction[], filterDate: DateValueType): { label: string; amount: number }[] => {
    const categoryMap: { [key: string]: number } = {}

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date || '').toISOString().split('T')[0]

      return (
        transactionDate >= (filterDate?.startDate || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]) &&
        transactionDate <= (filterDate?.endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0])
      )
    })

    filteredTransactions.forEach((transaction) => {
      const categoryId = transaction.category_id
      const category = categories.find((cat) => cat.category_id === categoryId)
      const categoryName = category ? category.category_name : 'Other'
      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (transaction?.total || 0)
    })

    return Object.entries(categoryMap).map(([categoryName, total]) => ({ label: categoryName, amount: total }))
  }

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

  const handleReceiveAlertMessage = (message: string) => {
    setAlertMessage(message)
    setIsVisible(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  if (error) {
    return <Error errorCode={500} errorMessage={error} />
  }

  return (
    <>
      <IndexPage refreshData={handleRefreshData} sendAlertMessage={handleReceiveAlertMessage}>
        {isVisible && (
          <>
            <Alert icon={<BiCheckCircle />} className="rounded-none border-l-4 border-[#2ec946] bg-[#2ec946]/10 font-medium text-[#2ec946]">
              {alertMessage}
            </Alert>
          </>
        )}

        <div className="mb-16">
          <Balance
            balance={getBalance(getTotalAmount(inflowTransactions), Math.abs(getTotalAmount(outflowTransactions)))}
            loading={isLoading}
          />

          <Card title="Spending Report">
            <div className="mb-4">
              <Select
                value={String(selectedYear)}
                id="year"
                label="Year"
                onChange={(e) => {
                  const selectedValue = parseInt(e || '')
                  setSelectedYear(selectedValue)
                }}
                className="w-full"
              >
                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <Option key={year} value={String(year)}>
                    {year}
                  </Option>
                ))}
              </Select>
            </div>
            {isLoading ? (
              <div className="max-w-full animate-pulse">
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
              </div>
            ) : (
              <div className="w-full">
                {/* Spending Report */}
                <ReactApexChart options={options} series={series} type="bar" width="100%" height={350} />
              </div>
            )}
          </Card>

          <Card title="Spending Chart">
            <div className="mb-4 flex justify-between rounded-lg border-2 border-solid border-gray-300">
              <Datepicker useRange value={filterDate} onChange={handleValueChange} />
            </div>
            {isLoading ? (
              <div className="max-w-full animate-pulse">
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
                <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                  &nbsp;
                </Typography>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {pieChartData.length > 0 ? (
                  <div className="mb-4 w-full">
                    <ReactApexChart
                      options={{ ...options, colors: pieChartColors, legend: { position: 'bottom' } }}
                      series={pieChartData.map((item) => item.amount)}
                      type="pie"
                      width="100%"
                      height={350}
                    />
                  </div>
                ) : (
                  <p className="py-16">No data available today.</p>
                )}
              </div>
            )}
          </Card>

          <Card title="Top Spending">
            <div>
              {isLoading ? (
                <>
                  <div className="mb-4 flex animate-pulse items-center gap-8">
                    {/* Left container */}
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-300"></div>

                    {/* Right container */}
                    <div className="w-full">
                      <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                        &nbsp;
                      </Typography>
                      <Typography as="div" variant="h1" className="mb-2 h-6 bg-gray-300">
                        &nbsp;
                      </Typography>
                    </div>
                  </div>
                  <div className="mb-4 flex animate-pulse items-center gap-8">
                    {/* Left container */}
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-300"></div>

                    {/* Right container */}
                    <div className="w-full">
                      <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                        &nbsp;
                      </Typography>
                      <Typography as="div" variant="h1" className="mb-2 h-6 bg-gray-300">
                        &nbsp;
                      </Typography>
                    </div>
                  </div>
                  <div className="mb-4 flex animate-pulse items-center gap-8">
                    {/* Left container */}
                    <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-300"></div>

                    {/* Right container */}
                    <div className="w-full">
                      <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                        &nbsp;
                      </Typography>
                      <Typography as="div" variant="h1" className="mb-2 h-6 bg-gray-300">
                        &nbsp;
                      </Typography>
                    </div>
                  </div>
                </>
              ) : (
                // @ts-ignore
                <List>
                  {calculateTopSpending(transactions, categories).map((item, index) => (
                    // @ts-ignore
                    <ListItem key={index}>
                      {/* @ts-ignore */}
                      <ListItemPrefix>
                        {/* @ts-ignore */}
                        <Avatar variant="circular" alt="candice" src="https://docs.material-tailwind.com/img/face-1.jpg" />
                      </ListItemPrefix>
                      <div>
                        <Typography variant="h6" color="blue-gray">
                          {item.title}
                        </Typography>
                        <Typography variant="small" color="gray" className="font-normal">
                          Rp. {item.amount.toLocaleString()}
                        </Typography>
                      </div>
                    </ListItem>
                  ))}
                </List>
              )}
            </div>
          </Card>
        </div>
      </IndexPage>
    </>
  )
}

export default DashboardPage

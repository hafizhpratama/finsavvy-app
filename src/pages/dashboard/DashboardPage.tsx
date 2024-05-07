import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { BiCheckCircle } from 'react-icons/bi'
import {
  MdAttachMoney,
  MdCleaningServices,
  MdDirectionsCar,
  MdHome,
  MdHouse,
  MdLocalHospital,
  MdRestaurant,
  MdSchool,
  MdSecurity,
  MdShoppingCart,
  MdTheaters,
} from 'react-icons/md'
import { Alert, List, ListItem, ListItemPrefix, Option } from '@material-tailwind/react'
import Balance from '../../components/Balance'
import Card from '../../components/UI/Card'
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import Select from '../../components/UI/Select'
import Typography from '../../components/UI/Typography'
import { getTransactionsByUserId, getCategories } from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import IndexPage from '../IndexPage'
import ErrorBoundary from '../../components/ErrorBoundary'
import ViewTransactionModal from '../../components/UI/Modal/ViewTransactionModal'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const [refreshData, setRefreshData] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [monthlySpendingData, setMonthlySpendingData] = useState<{ label: string; amount: number }[]>([])
  const [pieChartData, setPieChartData] = useState<{ label: string; amount: number; color: string; percentage: number }[]>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('outcome')
  const [filterDate, setFilterDate] = useState<DateValueType>({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0],
  })
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Transaction[]>()

  const handleRefreshData = () => setRefreshData((prevState) => !prevState)

  const handleValueChange = (value: DateValueType) => {
    setIsLoading(true)
    setFilterDate(value)
    const filteredPieChartData = calculatePieChartData(transactions, value, selectedFilter)
    setPieChartData(filteredPieChartData)
    setIsLoading(false)
  }

  const handleFilterChange = (value: string) => {
    setIsLoading(true)
    setSelectedFilter(value)
    const filteredPieChartData = calculatePieChartData(transactions, filterDate, value)
    setPieChartData(filteredPieChartData)
    setIsLoading(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = user?.id || ''
        const [transactionData, categoryData] = await Promise.all([getTransactionsByUserId(userId), getCategories(userId)])
        if (transactionData) setTransactions(transactionData)
        if (categoryData) setCategories(categoryData)
      } catch (error: any) {
        setError(error || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [refreshData])

  useEffect(() => {
    const pieChartData = calculatePieChartData(transactions, filterDate, selectedFilter)
    setPieChartData(pieChartData)
  }, [transactions, filterDate, selectedFilter])

  useEffect(() => {
    const monthlySpendingData = calculateMonthlySpending(transactions, selectedYear)
    setMonthlySpendingData(monthlySpendingData)
  }, [transactions, selectedYear])

  const categoryConfig = {
    Salary: { icon: MdAttachMoney, color: '#15F5BA' },
    Interest: { icon: MdAttachMoney, color: '#98A8F8' },
    Investments: { icon: MdAttachMoney, color: '#6F38C5' },
    Gifts: { icon: MdAttachMoney, color: '#068FFF' },
    Other: { icon: MdAttachMoney, color: '#3A98B9' },
    Bills: { icon: MdHome, color: '#CF0A0A' },
    Groceries: { icon: MdShoppingCart, color: '#ADDDD0' },
    Transportation: { icon: MdDirectionsCar, color: '#FFDE00' },
    Dining: { icon: MdRestaurant, color: '#F73D93' },
    Entertainment: { icon: MdTheaters, color: '#EA906C' },
    Healthcare: { icon: MdLocalHospital, color: '#5F264A' },
    Education: { icon: MdSchool, color: '#FF6000' },
    Insurance: { icon: MdSecurity, color: '#FF597B' },
    Rent: { icon: MdHome, color: '#F273E6' },
    'Outcome Other': { icon: MdAttachMoney, color: '#E55604' },
    'Cleaning Household': { icon: MdCleaningServices, color: '#FEFAF6' },
    Houseware: { icon: MdHouse, color: '#124076' },
  }

  const getCategoryIcon = (category: string): React.ComponentType<any> => {
    const iconComponent = categoryConfig[category as keyof typeof categoryConfig]?.icon || MdAttachMoney
    return iconComponent
  }

  const getCategoryColor = (category: string): string => {
    const color = categoryConfig[category as keyof typeof categoryConfig]?.color || '#F0F3FF'
    return color
  }

  const calculateTopSpending = (
    transactions: Transaction[],
    categories: Category[],
    filterDate: DateValueType,
  ): {
    title: string
    transactions: Transaction[]
    amount: number
    percentage: number
  }[] => {
    const categoryMap: { [key: string]: { transactions: Transaction[]; totalSpent: number } } = {}

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date || '').toISOString().split('T')[0]
      const today = new Date()
      return (
        transactionDate >= (filterDate?.startDate || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]) &&
        transactionDate <= (filterDate?.endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0])
      )
    })

    let totalSpending = 0
    filteredTransactions.forEach((transaction) => {
      const category = categories.find((cat) => cat.category_id === transaction.category_id)
      if (category && transaction.category_type === 'outcome') {
        let categoryName = category ? category.category_name : 'Other'
        if (!categoryMap[categoryName]) {
          categoryMap[categoryName] = { transactions: [], totalSpent: 0 }
        }
        categoryMap[categoryName].transactions.push(transaction)
        categoryMap[categoryName].totalSpent += transaction.total || 0
        totalSpending += transaction.total || 0
      }
    })

    const result = Object.entries(categoryMap).map(([categoryName, { transactions, totalSpent }]) => ({
      title: categoryName,
      transactions: transactions,
      amount: totalSpent,
      percentage: (totalSpent / totalSpending) * 100,
    }))

    result.sort((a, b) => b.amount - a.amount)

    return result
  }

  const calculateMonthlySpending = (transactions: Transaction[], selectedYear: number): { label: string; amount: number }[] => {
    const monthsToShow = selectedYear === today.getFullYear() ? today.getMonth() + 1 : 12

    const monthlySpending: { [key: string]: number } = {}

    for (let i = 0; i < monthsToShow; i++) {
      const month = new Date(selectedYear, i, 1)
      const nextMonth = new Date(selectedYear, i + 1, 1)
      const monthTransactions = transactions.filter(
        (transaction) =>
          new Date(transaction.date || '') >= month &&
          new Date(transaction.date || '') < nextMonth &&
          transaction.category_type === 'outcome',
      )
      const monthTotal = monthTransactions.reduce((total, transaction) => total + (transaction?.total || 0), 0)

      monthlySpending[month.toLocaleDateString('default', { month: 'long' })] = monthTotal
    }

    return Object.entries(monthlySpending).map(([month, total]) => ({ label: month, amount: total }))
  }

  const calculatePieChartData = (
    transactions: Transaction[],
    filterDate: DateValueType,
    selectedFilter: string,
  ): { label: string; amount: number; percentage: number; color: string }[] => {
    const categoryMap: { [key: string]: number } = {}
    let totalAllCategories = 0

    const filteredTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date || '').toISOString().split('T')[0]
      return (
        transactionDate >= (filterDate?.startDate || new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]) &&
        transactionDate <= (filterDate?.endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0]) &&
        transaction.category_type === selectedFilter
      )
    })

    filteredTransactions.forEach((transaction) => {
      const categoryId = transaction.category_id
      const category = categories.find((cat) => cat.category_id === categoryId)
      let categoryName = category ? category.category_name : 'Other'

      if (transaction.category_type === 'income' && categoryName === 'Other') {
        categoryName = 'Income Other'
      } else if (transaction.category_type === 'outcome' && categoryName === 'Other') {
        categoryName = 'Outcome Other'
      }

      categoryMap[categoryName] = (categoryMap[categoryName] || 0) + (transaction?.total || 0)
      totalAllCategories += transaction.total || 0
    })

    return Object.entries(categoryMap).map(([categoryName, total]) => ({
      label: categoryName,
      amount: total,
      percentage: (total / totalAllCategories) * 100,
      color: getCategoryColor(categoryName),
    }))
  }

  const barChartOptions: ApexCharts.ApexOptions = {
    dataLabels: {
      formatter: function () {
        return ''
      },
    },
    chart: {
      type: 'bar',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: ['#020617'],
    xaxis: {
      categories: monthlySpendingData.map(({ label }) => label),
    },
    yaxis: {
      labels: {
        show: true,
        formatter: function (val) {
          return formatNumberToK(val)
        },
      },
    },
  }

  const pieChartOptions: ApexCharts.ApexOptions = {
    chart: {
      type: 'pie',
      height: 350,
      toolbar: {
        show: false,
      },
    },
    colors: pieChartData.map(({ color }) => color),
    labels: pieChartData.map(({ label }) => label),
    legend: {
      position: 'bottom',
    },
    yaxis: {
      labels: {
        show: true,
        formatter: function (val) {
          return val.toFixed(1)
        },
      },
    },
  }

  const handleReceiveAlertMessage = (message: string) => {
    setAlertMessage(message)
    setIsVisible(true)
    setTimeout(() => {
      setIsVisible(false)
    }, 5000)
  }

  const handleListItemClick = (item: Transaction[]) => {
    setSelectedItem(item)
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setSelectedItem(undefined)
  }

  if (error) {
    return <ErrorBoundary errorCode={500} errorMessage={error} />
  }

  return (
    <>
      <IndexPage refreshData={handleRefreshData} sendAlertMessage={handleReceiveAlertMessage}>
        {isVisible && (
          <Alert icon={<BiCheckCircle />} className="rounded-none border-l-4 border-[#2ec946] bg-[#2ec946]/10 font-medium text-[#2ec946]">
            {alertMessage}
          </Alert>
        )}

        <div className="mb-16">
          <Balance refreshData={refreshData} />

          <Card title="Spending Report">
            <div className="mb-4">
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
            {isLoading ? (
              <div className="max-w-full animate-pulse">
                {[...Array(5)].map((_, index) => (
                  <Typography key={index} as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                    &nbsp;
                  </Typography>
                ))}
              </div>
            ) : (
              <div className="w-full">
                <ReactApexChart
                  options={barChartOptions}
                  series={[
                    {
                      name: 'Spending',
                      data: monthlySpendingData.map((item) => item.amount),
                    },
                  ]}
                  type="bar"
                  width="100%"
                  height={350}
                />
              </div>
            )}
          </Card>

          <Card title="Spending Chart">
            <div className="mb-4 flex justify-between rounded-lg border-2 border-solid border-gray-300">
              <Datepicker useRange value={filterDate} onChange={handleValueChange} />
            </div>
            <div className="mb-4">
              <Select value={selectedFilter} id="filter" label="Type" onChange={(e) => handleFilterChange(e || '')} className="w-full">
                <Option value="income">Income</Option>
                <Option value="outcome">Outcome</Option>
              </Select>
            </div>
            {isLoading ? (
              <div className="max-w-full animate-pulse">
                {[...Array(5)].map((_, index) => (
                  <Typography key={index} as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                    &nbsp;
                  </Typography>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center">
                {pieChartData.length > 0 ? (
                  <div className="mb-4 w-full">
                    <ReactApexChart
                      options={{ ...pieChartOptions, colors: pieChartData.map((item) => item.color), legend: { position: 'bottom' } }}
                      series={pieChartData.map((item) => item.percentage)}
                      type="pie"
                      width="100%"
                      height={350}
                    />
                  </div>
                ) : (
                  <span className="py-16 text-sm font-normal text-gray-500">No data available today.</span>
                )}
              </div>
            )}
          </Card>

          <Card title="Top Spending">
            <div>
              {isLoading ? (
                <>
                  {[...Array(3)].map((_, index) => (
                    <div key={index} className="mb-4 flex animate-pulse items-center gap-8">
                      <div className="grid h-14 w-14 place-items-center rounded-full bg-gray-300"></div>
                      <div className="w-full">
                        <Typography as="div" variant="h1" className="mb-4 h-6 bg-gray-300">
                          &nbsp;
                        </Typography>
                        <Typography as="div" variant="h1" className="mb-2 h-6 bg-gray-300">
                          &nbsp;
                        </Typography>
                      </div>
                    </div>
                  ))}
                </>
              ) : (
                // @ts-ignore
                <List>
                  {calculateTopSpending(transactions, categories, filterDate).length > 0 ? (
                    calculateTopSpending(transactions, categories, filterDate).map((item, index) => {
                      const IconComponent = getCategoryIcon(item.title)
                      const iconColor = getCategoryColor(item.title)
                      return (
                        // @ts-ignore
                        <ListItem key={index} className="flex items-center" onClick={() => handleListItemClick(item.transactions)}>
                          {/* @ts-ignore */}
                          <ListItemPrefix>
                            <IconComponent className="text-3xl" style={{ color: iconColor }} />
                          </ListItemPrefix>
                          <div className="ml-2 flex flex-col">
                            <Typography className="text-sm font-semibold text-black">
                              {item.title === 'Other' ? 'Outcome Other' : item.title}
                            </Typography>

                            <Typography className="text-xs font-normal text-gray-500">Rp. {item.amount.toLocaleString()}</Typography>
                          </div>
                          <div className="ml-auto">
                            <Typography className="text-xs font-semibold text-black">{item.percentage.toFixed(1)} %</Typography>
                          </div>
                        </ListItem>
                      )
                    })
                  ) : (
                    <span className="py-16 text-center text-sm font-normal text-gray-500">No data available today.</span>
                  )}
                </List>
              )}
            </div>
          </Card>
        </div>
        {showModal && <ViewTransactionModal closeModal={handleCloseModal} transactions={selectedItem} />}
      </IndexPage>
    </>
  )
}

export default DashboardPage

function formatNumberToK(number: number) {
  if (number >= 1000000) {
    return (number / 1000000).toFixed(1) + 'M'
  } else if (number >= 1000) {
    return (number / 1000).toFixed(1) + 'K'
  } else {
    return number.toString()
  }
}

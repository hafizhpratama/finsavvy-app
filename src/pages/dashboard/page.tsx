import React, { useState, useEffect } from 'react'
import ReactApexChart from 'react-apexcharts'
import { BiCheckCircle } from 'react-icons/bi'
import { Alert, List, ListItem, ListItemPrefix, Option } from '@material-tailwind/react'
import Balance from '../../components/Balance'
import Card from '../../components/UI/Card'
import Datepicker, { DateValueType } from 'react-tailwindcss-datepicker'
import Select from '../../components/UI/Select'
import Typography from '../../components/UI/Typography'
import {
  getTopSpendingCategories,
  getTransactionsByCategoryAndDate,
  getPieChartDataByUserId,
  getBarChartDataByUserId,
} from '../../services/supabaseService'
import { useAuth } from '../../contexts/AuthContext'
import IndexPage from '../page'
import ErrorBoundary from '../../components/ErrorBoundary'
import ViewTransactionModal from '../../components/UI/Modal/ViewTransactionModal'
import { getCategoryColor, getCategoryIcon } from '../../utils/categoryUtils'

const DashboardPage: React.FC = () => {
  const { user } = useAuth()
  const today = new Date()
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const [refreshData, setRefreshData] = useState<boolean>(false)
  const [isVisible, setIsVisible] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [monthlySpendingData, setMonthlySpendingData] = useState<{ label: string; total: number }[] | null>([])
  const [pieChartData, setPieChartData] = useState<{ title: string; total: number; percentage: number; color: string }[] | null>([])
  const [selectedFilter, setSelectedFilter] = useState<string>('outcome')
  const [filterDate, setFilterDate] = useState<DateValueType>({
    startDate: startOfMonth.toISOString().split('T')[0],
    endDate: endOfMonth.toISOString().split('T')[0],
  })
  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<Transaction[]>()
  const [topSpendingData, setTopSpendingData] = useState<
    { category_id?: string; title: string; total: number; percentage: number; color: string }[] | null
  >([])

  const handleRefreshData = () => setRefreshData((prevState) => !prevState)

  const handleValueChange = (value: DateValueType) => {
    setFilterDate(value)
  }

  const handleFilterChange = (value: string) => {
    setSelectedFilter(value)
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = user?.id || ''
        const data = await getTopSpendingCategories(userId, filterDate)
        setTopSpendingData(data ?? [])
      } catch (error: any) {
        setError(error?.message || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [refreshData, filterDate, user?.id])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = user?.id || ''
        const data = await getPieChartDataByUserId(userId, filterDate, selectedFilter)
        setPieChartData(data ?? [])
      } catch (error: any) {
        setError(error?.message || 'An error occurred')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [refreshData, filterDate, selectedFilter, user?.id])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const userId = user?.id || ''
        const data = await getBarChartDataByUserId(userId, selectedYear)
        setMonthlySpendingData(data ?? [])
      } catch (error) {
        console.error('Error fetching transaction data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (selectedYear) {
      fetchData()
    }
  }, [selectedYear, user?.id])

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
      categories: monthlySpendingData?.map(({ label }) => label) || [],
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
    colors: pieChartData?.map(({ color }) => color) || [],
    labels: pieChartData?.map(({ title }) => title) || [],
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

  const handleListItemClick = async (category_id?: string, filterDate?: DateValueType) => {
    try {
      setIsLoading(true)
      setShowModal(true)
      const items = await getTransactionsByCategoryAndDate(user?.id, category_id, filterDate)
      setSelectedItem(items || [])
      setIsLoading(false)
    } catch (error) {
      console.error('Error fetching transactions:', error)
      setIsLoading(false)
    }
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
                      data: monthlySpendingData?.map((item) => item.total) || [],
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
              <Datepicker value={filterDate} onChange={handleValueChange} separator={'~'} displayFormat={'DD/MM/YYYY'} />
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
                {pieChartData && pieChartData.length > 0 ? (
                  <div className="mb-4 w-full">
                    <ReactApexChart
                      options={{ ...pieChartOptions, legend: { position: 'bottom' } }}
                      series={pieChartData?.map((item) => item.percentage)}
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
                  {topSpendingData && topSpendingData.length > 0 ? (
                    topSpendingData.map((item, index) => {
                      const IconComponent = getCategoryIcon(item.title)
                      const iconColor = getCategoryColor(item.title)
                      return (
                        // @ts-ignore
                        <ListItem
                          key={index}
                          className="flex items-center"
                          onClick={() => handleListItemClick(item.category_id, filterDate)}
                        >
                          {/* @ts-ignore */}
                          <ListItemPrefix>
                            <IconComponent className="text-3xl" style={{ color: iconColor }} />
                          </ListItemPrefix>
                          <div className="ml-2 flex flex-col">
                            <Typography className="text-sm font-semibold text-black">
                              {item.title === 'Other' ? 'Outcome Other' : item.title}
                            </Typography>
                            <Typography className="text-xs font-normal text-gray-500">Rp. {item.total.toLocaleString()}</Typography>
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
        {showModal && <ViewTransactionModal closeModal={handleCloseModal} transactions={selectedItem} isLoading={isLoading} />}
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

import React, { useState } from 'react'
import ReactApexChart from 'react-apexcharts'
import { ApexOptions } from 'apexcharts'
import { FaDollarSign } from 'react-icons/fa'
import { Avatar, List, ListItem, ListItemPrefix, ListItemSuffix, Typography } from '@material-tailwind/react'
import Balance from '../../components/Balance'
import Card from '../../components/Card'
import IndexPage from '../IndexPage'

const DashboardPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<string>('week')

  const weeklySpendingData = [
    { label: 'Last Week', amount: 200 },
    { label: 'This Week', amount: 100 },
  ]

  const monthlySpendingData = [
    { label: 'Last Month', amount: 400 },
    { label: 'This Month', amount: 300 },
  ]

  const topSpendingData = [
    { icon: <FaDollarSign size={20} className="text-yellow-600" />, title: 'Groceries', amount: 200 },
    { icon: <FaDollarSign size={20} className="text-yellow-600" />, title: 'Entertainment', amount: 150 },
    { icon: <FaDollarSign size={20} className="text-yellow-600" />, title: 'Utilities', amount: 120 },
  ]

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
      categories: (selectedTab === 'week' ? weeklySpendingData : monthlySpendingData).map((item) => item.label),
    },
    yaxis: {
      labels: {
        style: {
          colors: '#616161',
          fontSize: '12px',
          fontFamily: 'inherit',
          fontWeight: 400,
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
  }

  const series = [
    {
      name: 'Spending',
      data: (selectedTab === 'week' ? weeklySpendingData : monthlySpendingData).map((item) => item.amount),
    },
  ]

  return (
    <>
      <IndexPage>
        <div className="mb-16">
          <Balance balance={0} />

          <Card title="Spending Report">
            <div className="flex flex-col items-center">
              {/* Tabs */}
              <div className="mt-6 flex">
                <button
                  className={`rounded-bl-lg rounded-tl-lg px-4 py-2 ${selectedTab === 'week' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setSelectedTab('week')}
                >
                  Week
                </button>
                <button
                  className={`rounded-br-lg rounded-tr-lg px-4 py-2 ${selectedTab === 'month' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}`}
                  onClick={() => setSelectedTab('month')}
                >
                  Month
                </button>
              </div>
              {/* Spending Report */}
              <div>
                <ReactApexChart options={options} series={series} type="bar" height={350} />
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

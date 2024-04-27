import { Typography } from '@material-tailwind/react'
import React from 'react'
import { FaDollarSign } from 'react-icons/fa'
import Card from './Card'

interface BalanceProps {
  balance: number
  loading?: boolean
}

const Balance: React.FC<BalanceProps> = ({ balance, loading }) => {
  return (
    <>
      <Card title="My Balance">
        {loading ? (
          <div className="max-w-full animate-pulse">
            <Typography
              as="div"
              variant="h1"
              className="mb-4 h-6 bg-gray-300"
              placeholder=""
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              &nbsp;
            </Typography>
          </div>
        ) : (
          <div className="flex items-center">
            <FaDollarSign size={20} className="mr-2 text-yellow-600" />
            <Typography
              variant="paragraph"
              color={balance >= 0 ? 'green' : 'red'}
              className="font-semibold"
              placeholder=""
              onPointerEnterCapture={() => {}}
              onPointerLeaveCapture={() => {}}
            >
              Rp. {balance.toLocaleString()}
            </Typography>
          </div>
        )}
      </Card>
    </>
  )
}

export default Balance

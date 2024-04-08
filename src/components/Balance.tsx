import { Typography } from '@material-tailwind/react'
import React from 'react'
import { FaDollarSign } from 'react-icons/fa'
import Card from './Card'

interface BalanceProps {
  balance: number
}

const Balance: React.FC<BalanceProps> = ({ balance }) => {
  return (
    <>
      <Card title="My Balance">
        <div className="flex items-center">
          <FaDollarSign size={20} className="mr-2 text-yellow-600" />
          <Typography
            variant="paragraph"
            color="gray"
            className="font-normal"
            placeholder=""
            onPointerEnterCapture={() => {}}
            onPointerLeaveCapture={() => {}}
          >
            Rp. {balance.toLocaleString()}
          </Typography>
        </div>
      </Card>
    </>
  )
}

export default Balance

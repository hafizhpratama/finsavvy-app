import React from 'react'
import { LuRadioTower } from 'react-icons/lu'
import Typography from './Typography'
import Button from './Button'
import { Link } from 'react-router-dom'

interface ErrorProps {
  errorCode: number
  errorMessage: string
}

const Error: React.FC<ErrorProps> = ({ errorCode, errorMessage }) => {
  return (
    <div className="flex h-screen flex-col items-center justify-center px-8 text-center">
      <LuRadioTower className="mx-auto h-20 w-20" />
      <Typography variant="h1" color="blue-gray" className="mt-10 text-3xl leading-snug md:text-4xl">
        {errorCode} <br /> {errorMessage}
      </Typography>
      <Typography className="mx-auto mb-14 mt-8 text-[18px] text-gray-500 md:max-w-sm">
        Don't worry, our team is already on it. Please try refreshing the page or come back later.
      </Typography>
      <Link to={'/'}>
        <Button color="gray" className="w-full md:w-[8rem]">
          Back Home
        </Button>
      </Link>
    </div>
  )
}

export default Error

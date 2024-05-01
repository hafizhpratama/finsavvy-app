import React from 'react'
import Typography from './Typography'

interface CardProps {
  title: string
  children: React.ReactNode
  style?: React.CSSProperties
}

const Card: React.FC<CardProps> = ({ title, children, style }) => {
  return (
    <div className="p-4" style={style}>
      <div className="rounded-2xl bg-white">
        <div className="rounded-t-2xl border-b border-gray-200 px-6 py-4">
          <Typography style={{ color: '#836FFF' }} variant="h6" color="black" className="font-semibold">
            {title}
          </Typography>
        </div>
        <div className="px-6 py-4">{children}</div>
      </div>
    </div>
  )
}

export default Card

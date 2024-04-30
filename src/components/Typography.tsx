import { Typography as MaterialTypography, TypographyProps } from '@material-tailwind/react'
import React from 'react'

const Typography: React.FC<TypographyProps> = ({ as = 'div', variant = 'h1', color, textGradient, className = '', children }) => {
  return (
    // @ts-ignore
    <MaterialTypography as={as} variant={variant} color={color} textGradient={textGradient} className={className}>
      {children}
    </MaterialTypography>
  )
}

export default Typography

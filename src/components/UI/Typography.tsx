import { Typography as MaterialTypography, TypographyProps } from '@material-tailwind/react'
import React from 'react'

interface CustomTypographyProps extends TypographyProps {
  style?: React.CSSProperties
}

const Typography: React.FC<CustomTypographyProps> = ({
  as = 'div',
  variant = 'h1',
  color,
  textGradient,
  className = '',
  style,
  children,
}) => {
  return (
    // @ts-ignore
    <MaterialTypography as={as} variant={variant} color={color} textGradient={textGradient} className={className} style={style}>
      {children}
    </MaterialTypography>
  )
}

export default Typography

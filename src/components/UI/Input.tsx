import { InputProps, Input as MaterialInput } from '@material-tailwind/react'
import React from 'react'

interface CustomInputProps extends InputProps {
  style?: React.CSSProperties
}

const Input: React.FC<CustomInputProps> = ({ style, className, children, ...rest }) => {
  return (
    // @ts-ignore
    <MaterialInput style={style} {...rest}>
      {children}
    </MaterialInput>
  )
}

export default Input

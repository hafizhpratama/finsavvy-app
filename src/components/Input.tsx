import { InputProps, Input as MaterialInput } from '@material-tailwind/react'
import React from 'react'

const Input: React.FC<InputProps> = ({ variant, color, className, children, ...rest }) => {
  // @ts-ignore
  return <MaterialInput {...rest}>{children}</MaterialInput>
}
export default Input

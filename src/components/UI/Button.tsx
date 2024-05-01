import { ButtonProps, Button as MaterialButton } from '@material-tailwind/react'
import React from 'react'

const Button: React.FC<ButtonProps> = ({ children, ...rest }) => {
  // @ts-ignore
  return <MaterialButton {...rest}>{children}</MaterialButton>
}

export default Button

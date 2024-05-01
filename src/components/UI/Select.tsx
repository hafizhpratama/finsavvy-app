import { Select as MaterialSelect, SelectProps } from '@material-tailwind/react'
import React from 'react'

const Select: React.FC<SelectProps> = (props) => {
  const { children, ...rest } = props

  // @ts-ignore
  return <MaterialSelect {...rest}>{children}</MaterialSelect>
}

export default Select

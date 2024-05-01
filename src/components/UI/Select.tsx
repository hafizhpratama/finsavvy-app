import { Select as MaterialSelect, SelectProps } from '@material-tailwind/react'
import React from 'react'

interface CustomSelectProps extends SelectProps {
  style?: React.CSSProperties
}

const Select: React.FC<CustomSelectProps> = ({ children, style, ...rest }) => {
  return (
    // @ts-ignore
    <MaterialSelect style={style} {...rest}>
      {children}
    </MaterialSelect>
  )
}

export default Select

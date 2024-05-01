import { ButtonProps, Button as MaterialButton } from '@material-tailwind/react'
import React from 'react'

interface CustomButtonProps extends ButtonProps {
  style?: React.CSSProperties
}

const Button: React.FC<CustomButtonProps> = ({ style, children, ...rest }) => {
  return (
    // @ts-ignore
    <MaterialButton style={style} {...rest}>
      {children}
    </MaterialButton>
  )
}

export default Button

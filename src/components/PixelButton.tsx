import './PixelButton.css'

export interface PixelButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

export default function PixelButton({
  variant = 'primary',
  className = '',
  children,
  ...rest
}: PixelButtonProps) {
  const classes = `pixel-button pixel-button--${variant} ${className}`.trim()
  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  )
}

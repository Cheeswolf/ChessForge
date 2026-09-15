import './PixelPanel.css'

export interface PixelPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function PixelPanel({
  children,
  className = '',
  ...rest
}: PixelPanelProps) {
  const classes = `pixel-panel ${className}`.trim()
  return (
    <div className={classes} {...rest}>
      {children}
    </div>
  )
}

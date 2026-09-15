import './PluginSelector.css'

export interface PluginOption {
  id: string
  name: string
}

export interface PluginSelectorProps {
  label: string
  sublabel?: string
  icon: React.ReactNode
  value: string
  options: PluginOption[]
  onChange(id: string): void
}

export default function PluginSelector({
  label,
  sublabel,
  icon,
  value,
  options,
  onChange,
}: PluginSelectorProps) {
  return (
    <div className="plugin-selector">
      <div className="plugin-selector__info">
        <span className="plugin-selector__icon" aria-hidden="true">
          {icon}
        </span>
        <div className="plugin-selector__labels">
          {sublabel && (
            <span className="plugin-selector__sublabel">{sublabel}</span>
          )}
          <span className="plugin-selector__label">{label}</span>
        </div>
      </div>
      <div className="plugin-selector__select-wrap">
        <select
          className="plugin-selector__select"
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}

import React from 'react'
import ClayMascot from './ClayMascot'

export default function BlinkingClayMascot({
  type = 'kivi',
  className = '',
  mascotClassName = '',
  alt = '',
  interactive = false,
  onClick,
  title,
}) {
  return (
    <span
      className={`blinking-clay blinking-clay-${type} ${interactive ? 'blinking-clay-interactive' : ''} ${className}`}
      onClick={onClick}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          onClick(event)
        }
      } : undefined}
    >
      <ClayMascot type={type} className={mascotClassName} alt={alt} />
      <span className="clay-blink-eye clay-blink-eye-left" aria-hidden="true" />
      <span className="clay-blink-eye clay-blink-eye-right" aria-hidden="true" />
    </span>
  )
}

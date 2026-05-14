import React from 'react'
import kiviClay from '../../assets/mascots/kivi-clay.webp'

function sizeStyle(size) {
  if (!size) return undefined
  return { width: typeof size === 'number' ? `${size}px` : size }
}

export default function LayeredCat({
  size,
  className = '',
  alt = 'MiaoTu cat',
}) {
  return (
    <span className={`layered-cat layered-cat--stable ${className}`} style={sizeStyle(size)} role="img" aria-label={alt}>
      <img
        src={kiviClay}
        alt=""
        aria-hidden="true"
        className="layered-cat__stable-image"
        draggable="false"
      />
    </span>
  )
}

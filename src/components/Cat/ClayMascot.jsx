import React from 'react'
import kiviClay from '../../assets/mascots/kivi-clay.webp'
import oldCatClay from '../../assets/mascots/oldcat-clay.webp'
import breakthroughCat from '../../assets/mascots/breakthrough-cat.webp'

export default function ClayMascot({ type = 'kivi', className = '', alt = '' }) {
  const src = type === 'oldcat' ? oldCatClay : type === 'breakthrough' ? breakthroughCat : kiviClay
  const label = type === 'oldcat' ? 'Old mentor cat' : type === 'breakthrough' ? 'Breakthrough cat' : 'Kivi clay cat'
  return (
    <img
      src={src}
      alt={alt || label}
      className={`clay-mascot clay-mascot-${type} ${className}`}
      draggable="false"
    />
  )
}

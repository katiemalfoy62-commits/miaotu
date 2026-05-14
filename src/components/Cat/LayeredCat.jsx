import React from 'react'
import kiviClay from '../../assets/mascots/kivi-clay.webp'

export const CAT_COLORS = ['orange', 'gray', 'brown', 'black', 'white', 'cream']
export const CAT_EYE_COLORS = ['yellow', 'green', 'blue', 'amber']
export const CAT_PATTERNS = ['none', 'tabby', 'spots', 'calico_orange', 'calico_black', 'face_mask', 'socks_white', 'tail_tip']

export function normalizeCatConfig(config = {}) {
  return {
    name: config.name || '',
    focus: config.focus || 'training',
    color: CAT_COLORS.includes(config.color) ? config.color : 'gray',
    eyeColor: CAT_EYE_COLORS.includes(config.eyeColor) ? config.eyeColor : 'yellow',
    pattern: CAT_PATTERNS.includes(config.pattern) ? config.pattern : 'none',
    gender: config.gender === 'male' ? 'male' : 'female',
  }
}

export function getStageIndex(level = 1) {
  if (level <= 10) return 0
  if (level <= 25) return 1
  if (level <= 45) return 2
  if (level <= 70) return 3
  if (level <= 90) return 4
  return 5
}

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

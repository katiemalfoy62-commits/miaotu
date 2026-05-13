import React, { useId } from 'react'

const COLORS = {
  orange: '#E8923A',
  gray: '#A0A0B0',
  brown: '#8B5E3C',
  black: '#2A2A2A',
  white: '#F8F4F0',
  cream: '#F0E0C0',
  calico: '#E8923A',
  blue_gray: '#7A8FA0',
  silver: '#C0C8D0',
  default: '#C8844A',
}

const EYE_COLORS = {
  yellow: '#F5CC3A',
  green: '#5DAF5A',
  blue: '#4A90D9',
  amber: '#E8932A',
  heterochromia: null,
  default: '#5DAF5A',
}

function mixWithWhite(hex, amount = 0.34) {
  const clean = hex.replace('#', '')
  const n = parseInt(clean.length === 3 ? clean.split('').map(c => c + c).join('') : clean, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  const next = [r, g, b].map(v => Math.round(v + (255 - v) * amount))
  return `rgb(${next[0]}, ${next[1]}, ${next[2]})`
}

function PatternMarks({ breed, bodyColor }) {
  if (breed === 'calico') {
    return (
      <g opacity="0.9">
        <path d="M37 50 C43 38 55 39 58 53 C51 56 43 58 37 50Z" fill="#513a2f" opacity="0.72" />
        <path d="M65 38 C75 38 84 48 79 59 C70 57 64 52 65 38Z" fill="#f0a047" opacity="0.92" />
        <path d="M35 94 C44 86 56 89 57 104 C46 108 37 104 35 94Z" fill="#513a2f" opacity="0.28" />
      </g>
    )
  }

  if (breed !== 'orange') return null

  return (
    <g opacity="0.28" stroke="#9a531f" strokeLinecap="round" strokeWidth="3.2">
      <path d="M51 39 C53 45 53 50 50 55" />
      <path d="M60 37 C59 44 59 49 61 55" />
      <path d="M70 41 C67 47 66 51 68 56" />
      <path d="M44 98 C49 102 53 106 55 112" />
      <path d="M75 98 C70 102 67 107 66 113" />
    </g>
  )
}

export default function CatSVG({
  breed = 'default',
  color = 'default',
  eyeColor = 'default',
  gender = 'female',
  equippedItems = [],
  idle = true,
  size = 120,
  className = '',
}) {
  const uid = useId().replace(/:/g, '')
  const bodyColor = COLORS[color] || COLORS.default
  const lightColor = mixWithWhite(bodyColor, color === 'black' ? 0.18 : 0.38)
  const bellyColor = color === 'white' ? '#efe5d6' : '#f2dcc0'
  const eyeFill = EYE_COLORS[eyeColor] || EYE_COLORS.default
  const rightEyeFill = eyeColor === 'heterochromia' ? EYE_COLORS.blue : eyeFill
  const earStretch = breed === 'ragdoll' ? 4 : breed === 'black' ? 2 : 0

  const hasHat = equippedItems.find(i => i.category === 'hat')
  const hasBow = equippedItems.find(i => i.category === 'bow')
  const hasGlasses = equippedItems.find(i => i.category === 'glasses')

  return (
    <svg
      viewBox="0 0 120 150"
      width={size}
      height={size * 1.25}
      className={`${idle ? 'cat-idle' : ''} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MiaoTu cat"
    >
      <defs>
        <radialGradient id={`${uid}-fur`} cx="34%" cy="24%" r="78%">
          <stop offset="0%" stopColor={lightColor} />
          <stop offset="58%" stopColor={bodyColor} />
          <stop offset="100%" stopColor={bodyColor} stopOpacity="0.94" />
        </radialGradient>
        <radialGradient id={`${uid}-belly`} cx="38%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#fff7ec" />
          <stop offset="100%" stopColor={bellyColor} />
        </radialGradient>
        <linearGradient id={`${uid}-eye`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#fff5d6" />
        </linearGradient>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#6b3d1e" floodOpacity="0.16" />
        </filter>
      </defs>

      <ellipse cx="60" cy="143" rx="34" ry="7" fill="rgba(81, 56, 37, 0.16)" />

      <g filter={`url(#${uid}-soft)`}>
        <path
          d="M83 125 C104 125 110 106 101 94 C95 86 87 91 89 101 C91 110 83 114 78 108"
          fill="none"
          stroke={`url(#${uid}-fur)`}
          strokeWidth="10"
          strokeLinecap="round"
          className={idle ? 'animate-tail-wag' : ''}
          style={{ transformOrigin: '80px 119px' }}
        />

        <path
          d="M27 105 C27 80 41 67 60 67 C79 67 93 80 93 105 C93 127 80 140 60 140 C40 140 27 127 27 105Z"
          fill={`url(#${uid}-fur)`}
        />
        <ellipse cx="60" cy="115" rx="22" ry="24" fill={`url(#${uid}-belly)`} opacity="0.9" />
        <PatternMarks breed={breed} bodyColor={bodyColor} />

        <ellipse cx="42" cy="137" rx="11" ry="7" fill={lightColor} opacity="0.78" />
        <ellipse cx="78" cy="137" rx="11" ry="7" fill={lightColor} opacity="0.78" />
        <path d="M38 137 Q42 140 46 137" fill="none" stroke="rgba(93,70,54,0.28)" strokeWidth="1.1" strokeLinecap="round" />
        <path d="M74 137 Q78 140 82 137" fill="none" stroke="rgba(93,70,54,0.28)" strokeWidth="1.1" strokeLinecap="round" />

        <path
          d={`M32 ${44 - earStretch} L22 ${18 - earStretch} C21 ${14 - earStretch} 25 ${13 - earStretch} 28 ${17 - earStretch} L46 37 Z`}
          fill={`url(#${uid}-fur)`}
        />
        <path
          d={`M88 ${44 - earStretch} L98 ${18 - earStretch} C99 ${14 - earStretch} 95 ${13 - earStretch} 92 ${17 - earStretch} L74 37 Z`}
          fill={`url(#${uid}-fur)`}
        />
        <path d={`M33 ${40 - earStretch} L27 ${22 - earStretch} L44 36 Z`} fill="#f3a7a7" opacity="0.72" />
        <path d={`M87 ${40 - earStretch} L93 ${22 - earStretch} L76 36 Z`} fill="#f3a7a7" opacity="0.72" />

        <path
          d="M28 63 C28 42 42 31 60 31 C78 31 92 42 92 63 C92 82 79 95 60 95 C41 95 28 82 28 63Z"
          fill={`url(#${uid}-fur)`}
        />
        <ellipse cx="45" cy="69" rx="12" ry="9" fill="white" opacity="0.18" />
        <ellipse cx="75" cy="69" rx="12" ry="9" fill="white" opacity="0.18" />

        <g className={idle ? 'animate-eye-blink' : ''} style={{ transformOrigin: '60px 64px' }}>
          <ellipse cx="47" cy="63" rx="9" ry="10" fill={`url(#${uid}-eye)`} />
          <ellipse cx="73" cy="63" rx="9" ry="10" fill={`url(#${uid}-eye)`} />
          <circle cx="47" cy="64" r="6.2" fill={eyeFill} />
          <circle cx="73" cy="64" r="6.2" fill={rightEyeFill} />
          <circle cx="47" cy="65" r="3.7" fill="#171717" />
          <circle cx="73" cy="65" r="3.7" fill="#171717" />
          <circle cx="49.5" cy="60.5" r="2" fill="white" opacity="0.95" />
          <circle cx="75.5" cy="60.5" r="2" fill="white" opacity="0.95" />
        </g>

        <ellipse cx="39" cy="74" rx="6" ry="3.2" fill="#ff9cb1" opacity="0.34" />
        <ellipse cx="81" cy="74" rx="6" ry="3.2" fill="#ff9cb1" opacity="0.34" />
        <path d="M56.5 73.5 C58.5 71.5 61.5 71.5 63.5 73.5 C62.5 76.5 57.5 76.5 56.5 73.5Z" fill="#df6f78" />
        <path d="M60 76 C57 79 54 80 52 78" fill="none" stroke="#b85d62" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M60 76 C63 79 66 80 68 78" fill="none" stroke="#b85d62" strokeWidth="1.4" strokeLinecap="round" />

        <g stroke="#725f55" strokeLinecap="round" strokeWidth="1.2" opacity="0.58">
          <path d="M22 68 C32 66 40 67 48 70" />
          <path d="M22 75 C33 74 41 74 49 75" />
          <path d="M98 68 C88 66 80 67 72 70" />
          <path d="M98 75 C87 74 79 74 71 75" />
        </g>

        {gender === 'female' && !hasBow && (
          <g transform="translate(80, 45) rotate(-12)">
            <path d="M-7 0 C-11-7 -2-7 0-2 C2-7 11-7 7 0 C11 7 2 7 0 2 C-2 7-11 7-7 0Z" fill="#ff8fab" />
            <circle cx="0" cy="0" r="2.4" fill="#ff5f9a" />
          </g>
        )}

        {hasGlasses && (
          <g opacity="0.95">
            <circle cx="47" cy="64" r="10" fill="none" stroke="#6f5547" strokeWidth="1.8" />
            <circle cx="73" cy="64" r="10" fill="none" stroke="#6f5547" strokeWidth="1.8" />
            <line x1="57" y1="64" x2="63" y2="64" stroke="#6f5547" strokeWidth="1.8" />
          </g>
        )}
        {hasBow && (
          <g transform="translate(80, 45) rotate(-12)">
            <path d="M-9 0 C-14-8 -3-9 0-2 C3-9 14-8 9 0 C14 8 3 9 0 2 C-3 9-14 8-9 0Z" fill={hasBow.color || '#FF8FAB'} />
            <circle cx="0" cy="0" r="2.8" fill="#FF6B9D" />
          </g>
        )}
        {hasHat && (
          <g transform="translate(60, 35)">
            {hasHat.shape === 'crown' ? (
              <path d="M-16 4 L-11-12 L-5-4 L0-15 L5-4 L11-12 L16 4 Z" fill="#FFD96A" stroke="#D69A20" strokeWidth="1" />
            ) : hasHat.shape === 'beret' ? (
              <ellipse cx="0" cy="-5" rx="18" ry="9" fill={hasHat.color || '#C8622A'} />
            ) : (
              <path d="M-16 4 C-10-15 10-15 16 4 Z" fill={hasHat.color || '#2A4A8A'} />
            )}
          </g>
        )}
      </g>
    </svg>
  )
}

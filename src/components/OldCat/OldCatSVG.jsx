import React, { useId } from 'react'

export default function OldCatSVG({ mode = 'teacher', size = 80, className = '' }) {
  const uid = useId().replace(/:/g, '')
  const isTeacher = mode === 'teacher'
  const fur = isTeacher ? '#7a5c4b' : '#8b6b57'
  const furLight = isTeacher ? '#9b7b67' : '#a98974'
  const jacket = isTeacher ? '#26385d' : '#8f624f'
  const shirt = isTeacher ? '#f6eee2' : '#f1d3bd'

  return (
    <svg
      viewBox="0 0 120 140"
      width={size}
      height={size * 1.16}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MiaoTu mentor cat"
    >
      <defs>
        <radialGradient id={`${uid}-fur`} cx="34%" cy="20%" r="82%">
          <stop offset="0%" stopColor={furLight} />
          <stop offset="62%" stopColor={fur} />
          <stop offset="100%" stopColor="#5f4639" />
        </radialGradient>
        <linearGradient id={`${uid}-jacket`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor={isTeacher ? '#344a78' : '#a97962'} />
          <stop offset="100%" stopColor={jacket} />
        </linearGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#3d2418" floodOpacity="0.2" />
        </filter>
      </defs>

      <ellipse cx="60" cy="132" rx="35" ry="7" fill="rgba(58, 35, 22, 0.18)" />

      <g filter={`url(#${uid}-shadow)`}>
        <path
          d="M86 112 C105 111 112 95 104 84 C98 76 90 81 92 91 C94 100 87 104 80 100"
          fill="none"
          stroke={`url(#${uid}-fur)`}
          strokeWidth="9"
          strokeLinecap="round"
        />

        <path
          d="M29 96 C29 74 43 62 60 62 C77 62 91 74 91 96 C91 119 78 133 60 133 C42 133 29 119 29 96Z"
          fill={`url(#${uid}-fur)`}
        />
        <path
          d="M35 93 C39 79 48 72 60 72 C72 72 81 79 85 93 L83 124 C75 131 46 131 37 124Z"
          fill={`url(#${uid}-jacket)`}
        />
        <path d="M49 76 L60 104 L71 76 C67 74 53 74 49 76Z" fill={shirt} />
        {isTeacher ? (
          <>
            <path d="M55 84 L60 96 L65 84" fill="none" stroke="#d96b35" strokeWidth="2.2" strokeLinecap="round" />
            <path d="M48 76 C51 88 54 98 60 110" fill="none" stroke="#182644" strokeWidth="1.3" opacity="0.55" />
            <path d="M72 76 C69 88 66 98 60 110" fill="none" stroke="#182644" strokeWidth="1.3" opacity="0.55" />
          </>
        ) : (
          <path d="M44 82 C52 89 68 89 76 82" fill="none" stroke="#714936" strokeWidth="2" opacity="0.35" />
        )}

        <ellipse cx="42" cy="128" rx="9" ry="6" fill="#6c5042" />
        <ellipse cx="78" cy="128" rx="9" ry="6" fill="#6c5042" />

        <path d="M34 43 L25 17 C24 13 28 12 31 16 L47 36 Z" fill={`url(#${uid}-fur)`} />
        <path d="M86 43 L95 17 C96 13 92 12 89 16 L73 36 Z" fill={`url(#${uid}-fur)`} />
        <path d="M35 39 L29 21 L45 35 Z" fill="#dda397" opacity="0.7" />
        <path d="M85 39 L91 21 L75 35 Z" fill="#dda397" opacity="0.7" />

        <path
          d="M28 58 C28 36 43 25 60 25 C77 25 92 36 92 58 C92 78 79 91 60 91 C41 91 28 78 28 58Z"
          fill={`url(#${uid}-fur)`}
        />
        <path d="M47 31 C50 26 57 25 60 25 C57 31 53 34 47 31Z" fill="#c8ad98" opacity="0.45" />
        <path d="M60 25 C64 25 70 27 73 31 C67 34 63 31 60 25Z" fill="#c8ad98" opacity="0.35" />

        <g opacity="0.35" stroke="#4f382e" strokeLinecap="round" strokeWidth="2.3">
          <path d="M50 35 C52 41 52 45 49 50" />
          <path d="M60 33 C59 40 59 45 60 50" />
          <path d="M70 35 C68 41 68 46 71 50" />
        </g>

        <g className="animate-eye-blink" style={{ transformOrigin: '60px 56px' }}>
          <ellipse cx="47" cy="56" rx="8" ry="8.8" fill="#fffaf0" />
          <ellipse cx="73" cy="56" rx="8" ry="8.8" fill="#fffaf0" />
          <circle cx="47" cy="57" r="5" fill="#6ca04b" />
          <circle cx="73" cy="57" r="5" fill="#6ca04b" />
          <circle cx="47" cy="58" r="3" fill="#1c1714" />
          <circle cx="73" cy="58" r="3" fill="#1c1714" />
          <circle cx="49" cy="54" r="1.6" fill="#fff" />
          <circle cx="75" cy="54" r="1.6" fill="#fff" />
        </g>

        {isTeacher ? (
          <g opacity="0.96">
            <circle cx="47" cy="57" r="10" fill="none" stroke="#5c351f" strokeWidth="2" />
            <circle cx="73" cy="57" r="10" fill="none" stroke="#5c351f" strokeWidth="2" />
            <path d="M57 57 C59 55 61 55 63 57" fill="none" stroke="#5c351f" strokeWidth="2" strokeLinecap="round" />
            <path d="M27 55 L37 57" stroke="#5c351f" strokeWidth="1.8" strokeLinecap="round" />
            <path d="M93 55 L83 57" stroke="#5c351f" strokeWidth="1.8" strokeLinecap="round" />
          </g>
        ) : (
          <g transform="translate(77,82) rotate(-12)" opacity="0.7">
            <circle cx="-5" cy="0" r="5" fill="none" stroke="#5c351f" strokeWidth="1.5" />
            <circle cx="8" cy="0" r="5" fill="none" stroke="#5c351f" strokeWidth="1.5" />
            <path d="M0 0 L3 0" stroke="#5c351f" strokeWidth="1.5" />
          </g>
        )}

        <ellipse cx="41" cy="68" rx="6" ry="3" fill="#de8d93" opacity="0.26" />
        <ellipse cx="79" cy="68" rx="6" ry="3" fill="#de8d93" opacity="0.26" />
        <path d="M56.5 66 C58.5 64 61.5 64 63.5 66 C62.5 69 57.5 69 56.5 66Z" fill="#d57b79" />
        <path d="M60 68 C57 72 53 73 50 71" fill="none" stroke="#a95756" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M60 68 C63 72 67 73 70 71" fill="none" stroke="#a95756" strokeWidth="1.4" strokeLinecap="round" />

        <g stroke="#d6c5b5" strokeLinecap="round" strokeWidth="1.15" opacity="0.62">
          <path d="M22 63 C32 61 41 62 50 65" />
          <path d="M22 70 C33 69 42 69 51 70" />
          <path d="M98 63 C88 61 79 62 70 65" />
          <path d="M98 70 C87 69 78 69 69 70" />
        </g>

        <path d="M40 32 C37 25 43 22 48 24" fill="none" stroke="#efe0cf" strokeWidth="2.2" strokeLinecap="round" opacity="0.85" />
        <path d="M48 29 C46 23 52 20 57 23" fill="none" stroke="#efe0cf" strokeWidth="2.2" strokeLinecap="round" opacity="0.75" />
      </g>
    </svg>
  )
}

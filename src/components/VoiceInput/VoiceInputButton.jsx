import React, { useEffect, useRef, useState } from 'react'
import { Mic, MicOff } from 'lucide-react'

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognition())
}

export default function VoiceInputButton({
  enabled = true,
  lang = 'zh',
  onText,
  className = '',
  title,
}) {
  const [listening, setListening] = useState(false)
  const [supported, setSupported] = useState(true)
  const recognitionRef = useRef(null)

  useEffect(() => {
    setSupported(isSpeechRecognitionSupported())
    return () => recognitionRef.current?.stop?.()
  }, [])

  function toggleVoice() {
    if (!enabled) return
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setSupported(false)
      return
    }

    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = event => {
      const transcript = event.results?.[0]?.[0]?.transcript || ''
      if (transcript) onText?.(transcript)
    }
    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
  }

  if (!enabled) return null

  return (
    <button
      type="button"
      onClick={toggleVoice}
      className={`voice-input-button ${listening ? 'is-listening' : ''} ${!supported ? 'is-unsupported' : ''} ${className}`}
      title={title || (supported ? '语音转文字' : '当前浏览器不支持语音转文字，建议使用 Chrome')}
      aria-label={title || '语音转文字'}
    >
      {listening ? <MicOff size={16} /> : <Mic size={16} />}
    </button>
  )
}

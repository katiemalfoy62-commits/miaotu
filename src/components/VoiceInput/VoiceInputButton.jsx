import React, { useEffect, useRef, useState } from 'react'
import { Loader2, Mic, MicOff } from 'lucide-react'
import useStore from '../../store/useStore'

function getSpeechRecognition() {
  if (typeof window === 'undefined') return null
  return window.SpeechRecognition || window.webkitSpeechRecognition || null
}

export function isSpeechRecognitionSupported() {
  return Boolean(getSpeechRecognition())
}

function isRecorderSupported() {
  return Boolean(typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia && window.MediaRecorder)
}

function audioBlobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result || '').split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function formatTimer(seconds) {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${String(secs).padStart(2, '0')}`
}

export default function VoiceInputButton({
  enabled = true,
  lang = 'zh',
  onText,
  className = '',
  title,
}) {
  const { user } = useStore()
  const settings = user.settings || {}
  const [state, setState] = useState('idle')
  const [supported, setSupported] = useState(true)
  const [hint, setHint] = useState('')
  const [seconds, setSeconds] = useState(0)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const mediaStreamRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  const isBusy = ['listening', 'recording', 'transcribing'].includes(state)
  const selectedMode = settings.voiceMode || 'auto'
  const canUseBrowser = isSpeechRecognitionSupported()
  const canUseBackend = isRecorderSupported()

  useEffect(() => {
    setSupported(canUseBrowser || canUseBackend)
    return () => stopEverything()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (state !== 'recording') {
      window.clearInterval(timerRef.current)
      timerRef.current = null
      return undefined
    }
    timerRef.current = window.setInterval(() => setSeconds(value => value + 1), 1000)
    return () => window.clearInterval(timerRef.current)
  }, [state])

  function showHint(message) {
    setHint(message)
    window.clearTimeout(showHint.timer)
    showHint.timer = window.setTimeout(() => setHint(''), 3200)
  }

  function stopEverything() {
    try { recognitionRef.current?.stop?.() } catch {}
    try {
      if (mediaRecorderRef.current?.state === 'recording') mediaRecorderRef.current.stop()
    } catch {}
    mediaStreamRef.current?.getTracks?.().forEach(track => track.stop())
    mediaStreamRef.current = null
    window.clearInterval(timerRef.current)
  }

  function appendText(text) {
    const clean = String(text || '').trim()
    if (clean) onText?.(clean)
  }

  function startBrowserSpeech() {
    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setSupported(canUseBackend)
      showHint(lang === 'zh' ? '当前浏览器不支持内置语音识别，可以在设置里选择后端转写。' : 'Browser speech is unavailable. Try backend transcription in settings.')
      return false
    }

    const recognition = new SpeechRecognition()
    recognition.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    recognition.continuous = false
    recognition.interimResults = false
    recognition.onresult = event => appendText(event.results?.[0]?.[0]?.transcript || '')
    recognition.onerror = event => {
      setState('idle')
      const denied = event.error === 'not-allowed' || event.error === 'service-not-allowed'
      showHint(denied
        ? (lang === 'zh' ? '浏览器麦克风权限被拒绝了，请在地址栏权限里打开。' : 'Microphone permission was denied. Enable it from the address bar.')
        : (lang === 'zh' ? '语音识别失败，可以再点一次。' : 'Speech recognition failed. Try again.'))
    }
    recognition.onend = () => setState('idle')
    try {
      recognition.start()
      recognitionRef.current = recognition
      setState('listening')
      return true
    } catch {
      setState('idle')
      showHint(lang === 'zh' ? '语音识别启动失败，可以稍后再试。' : 'Could not start speech recognition.')
      return false
    }
  }

  async function transcribeBackend(blob) {
    const audioBase64 = await audioBlobToBase64(blob)
    const payload = {
      provider: settings.speechProvider || 'custom',
      apiKey: settings.speechApiKey || '',
      endpoint: settings.speechEndpoint || '',
      model: settings.speechModel || '',
      audioBase64,
      mimeType: blob.type || 'audio/webm',
      language: lang === 'zh' ? 'zh' : 'en',
    }
    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'transcribe_failed')
    appendText(data.text)
  }

  async function startBackendSpeech() {
    if (!canUseBackend) {
      setSupported(canUseBrowser)
      showHint(lang === 'zh' ? '这个浏览器不能录音转写。' : 'This browser cannot record audio for transcription.')
      return false
    }
    if (!settings.speechApiKey || (!settings.speechEndpoint && settings.speechProvider !== 'openai')) {
      showHint(lang === 'zh' ? '请先在设置里填写语音转文字 API。' : 'Add your speech transcription API in settings first.')
      return false
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      recorder.ondataavailable = event => {
        if (event.data?.size) chunksRef.current.push(event.data)
      }
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        mediaStreamRef.current?.getTracks?.().forEach(track => track.stop())
        mediaStreamRef.current = null
        setState('transcribing')
        try {
          await transcribeBackend(blob)
          showHint(lang === 'zh' ? '已转成文字' : 'Transcribed')
        } catch (error) {
          showHint(lang === 'zh' ? `转写失败：${error.message}` : `Transcription failed: ${error.message}`)
        } finally {
          setState('idle')
          setSeconds(0)
        }
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      setSeconds(0)
      setState('recording')
      return true
    } catch (error) {
      setState('idle')
      const denied = error?.name === 'NotAllowedError'
      showHint(denied
        ? (lang === 'zh' ? '麦克风权限被拒绝了，请在浏览器权限里打开。' : 'Microphone permission was denied.')
        : (lang === 'zh' ? '无法开始录音，请检查麦克风。' : 'Could not start recording. Check your microphone.'))
      return false
    }
  }

  function stopActiveVoice() {
    if (state === 'listening') {
      recognitionRef.current?.stop?.()
      setState('idle')
      return
    }
    if (state === 'recording') {
      mediaRecorderRef.current?.stop?.()
    }
  }

  async function toggleVoice() {
    if (!enabled || state === 'transcribing') return
    if (isBusy) {
      stopActiveVoice()
      return
    }

    if (selectedMode === 'browser') {
      startBrowserSpeech()
      return
    }
    if (selectedMode === 'backend') {
      await startBackendSpeech()
      return
    }

    const started = canUseBrowser ? startBrowserSpeech() : false
    if (!started && !canUseBrowser) await startBackendSpeech()
  }

  if (!enabled) return null

  const label = state === 'recording'
    ? (seconds > 120 ? `${formatTimer(seconds)}，长录音会更慢` : formatTimer(seconds))
    : hint

  return (
    <span className={`voice-input-wrap ${className}`}>
      <button
        type="button"
        onClick={toggleVoice}
        className={`voice-input-button ${state === 'listening' || state === 'recording' ? 'is-listening' : ''} ${state === 'transcribing' ? 'is-transcribing' : ''} ${!supported ? 'is-unsupported' : ''}`}
        title={title || (supported ? '语音转文字' : '当前浏览器不支持语音转文字')}
        aria-label={title || '语音转文字'}
      >
        {state === 'transcribing' ? <Loader2 size={16} className="animate-spin" /> : (isBusy ? <MicOff size={16} /> : <Mic size={16} />)}
      </button>
      {label && <span className="voice-input-toast">{label}</span>}
    </span>
  )
}

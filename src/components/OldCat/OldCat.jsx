import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, Mic, MicOff, Copy, ExternalLink, Check, Maximize2, Minimize2, Save } from 'lucide-react'
import BlinkingClayMascot from '../Cat/BlinkingClayMascot'
import useStore from '../../store/useStore'
import { callClaude, extractText, getApiErrorMessage, getCatPersonalityPrompt } from '../../utils/claude'
import { t } from '../../utils/i18n'
import { buildOldCatPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'

export default function OldCat({ visible = true, disabledReason = null, hideLauncher = false }) {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState('teacher') // 'teacher' | 'companion'
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [listening, setListening] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [savedChat, setSavedChat] = useState(false)
  const bottomRef = useRef(null)
  const recogRef = useRef(null)
  const panelRef = useRef(null)

  const { user, addExp, addFish, saveOldCatChat } = useStore()
  const lang = user.settings.language
  const personality = user.settings.catPersonality
  const apiKey = user.settings.apiKey
  const modelMode = user.settings.modelMode || 'balanced'

  function closePanel({ notify = true } = {}) {
    setOpen(false)
    setFullscreen(false)
    if (notify) {
      window.dispatchEvent(new CustomEvent('miaotu:oldcat-closed'))
    }
  }

  useEffect(() => {
    const openOldCat = () => {
      if (!disabledReason) setOpen(true)
    }
    const closeOldCat = () => {
      closePanel({ notify: false })
    }
    window.addEventListener('miaotu:open-oldcat', openOldCat)
    window.addEventListener('miaotu:close-oldcat', closeOldCat)
    return () => {
      window.removeEventListener('miaotu:open-oldcat', openOldCat)
      window.removeEventListener('miaotu:close-oldcat', closeOldCat)
    }
  }, [disabledReason])

  useEffect(() => {
    closePanel({ notify: false })
  }, [location.pathname])

  useEffect(() => {
    if (!open) return undefined

    function closeOnOutsidePointer(event) {
      if (panelRef.current?.contains(event.target)) return
      closePanel()
    }

    document.addEventListener('mousedown', closeOnOutsidePointer)
    document.addEventListener('touchstart', closeOnOutsidePointer, { passive: true })
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer)
      document.removeEventListener('touchstart', closeOnOutsidePointer)
    }
  }, [open])

  // Companion-mode keywords
  const companionKeywords = ['迷茫', '不知道', '难过', '累了', '放弃', '崩溃', '失落', '焦虑', 'confused', 'lost', 'tired', 'sad', 'anxious']

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', content: lang === 'zh' ? '喵~ 有什么我可以帮你的吗？' : 'Meow~ How can I help you?' }])
    }
  }, [open])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function detectMode(text) {
    const lower = text.toLowerCase()
    if (companionKeywords.some(k => lower.includes(k))) return 'companion'
    return 'teacher'
  }

  async function send() {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    setError('')

    const newMode = detectMode(userMsg)
    setMode(newMode)

    const newMessages = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setLoading(true)

    try {
      const systemPrompt = `${getCatPersonalityPrompt(personality, lang)}
你是喵途平台的老猫导师，专门帮助想转型AI产品经理的学习者。
当前模式：${newMode === 'companion' ? (lang === 'zh' ? '陪伴模式——先共情，再引导，不急着给建议' : 'Companion mode — empathize first, guide gently') : (lang === 'zh' ? '学习模式——给出清晰有用的专业解答' : 'Learning mode — provide clear, useful professional answers')}
回答用${lang === 'zh' ? '中文' : 'English'}。专业术语（RAG、Agent、PRD、Token等）保留英文原文。
回答要简洁有用，不超过300字。`

      const apiMessages = newMessages.map(m => ({ role: m.role, content: m.content }))
      const res = await callClaude({ messages: apiMessages, system: systemPrompt, maxTokens: 600, apiKey, modelMode })
      const reply = extractText(res)

      setMessages(prev => [...prev, { role: 'assistant', content: reply }])

      // Check for insight; keep rewards light so the shop stays meaningful.
      if (userMsg.length > 50) {
        const insightCheck = await callClaude({
          messages: [{ role: 'user', content: `判断这句话是否有洞见值得奖励小鱼干（1-3条）。如果有洞见回答"奖励X条"，没有洞见回答"无奖励"。用户说：${userMsg}` }],
          system: '你是评判者。只判断用户的话是否体现出了真正的思考洞见。',
          maxTokens: 50,
          apiKey,
          modelMode: 'economy',
        }).catch(() => null)
        if (insightCheck) {
          const insightText = extractText(insightCheck)
          const match = insightText.match(/奖励(\d)条/)
          if (match) {
            const bonus = 1
            addFish(bonus)
            addExp(3)
            setMessages(prev => [...prev, { role: 'system', content: `🐟 老猫觉得你说得很有洞见！奖励 ${bonus} 条小鱼干～` }])
          }
        }
      }
    } catch (e) {
      setError(getApiErrorMessage(e, lang))
    } finally {
      setLoading(false)
    }
  }

  function toggleVoice() {
    if (!user.settings.voiceEnabled) return
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recog = new SpeechRecognition()
    recog.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    recog.continuous = false
    recog.onresult = (e) => setInput(prev => prev + e.results[0][0].transcript)
    recog.onend = () => setListening(false)
    recog.start()
    recogRef.current = recog
    setListening(true)
  }

  async function copyForGPT() {
    await copyText(buildOldCatPrompt(messages))
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 1600)
  }

  function saveConversation() {
    const usefulMessages = messages.filter(m => m.role !== 'system')
    if (usefulMessages.length <= 1) return
    const firstUser = usefulMessages.find(m => m.role === 'user')?.content || ''
    saveOldCatChat({
      title: firstUser ? firstUser.slice(0, 22) : (lang === 'zh' ? '老猫对话' : 'Mentor chat'),
      mode,
      messages: usefulMessages,
    })
    setSavedChat(true)
    setTimeout(() => setSavedChat(false), 1600)
  }

  if (!visible) return null

  return (
    <>
      {/* Peek head on side */}
      <AnimatePresence>
        {!open && !hideLauncher && (
          <motion.div
            initial={{ x: 60 }}
            animate={{ x: 0 }}
            exit={{ x: 80 }}
            className="oldcat-peek fixed right-0 top-1/2 -translate-y-1/2 z-40 cursor-pointer"
            onClick={() => {
              if (disabledReason) return
              setOpen(true)
            }}
            title={disabledReason || t('summonOldCat', lang)}
          >
            <div className="relative">
              <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-l-2xl pl-2 pr-1 py-3 shadow-lg">
                <BlinkingClayMascot type="oldcat" className="oldcat-peek-mascot" />
              </div>
              {disabledReason && (
                <div className="absolute -top-1 -left-1 w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
                  <span className="text-white text-[8px] font-bold">×</span>
                </div>
              )}
              {/* Hover tooltip */}
              <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-xl px-3 py-1.5 text-xs font-semibold text-primary dark:text-primary-dark whitespace-nowrap shadow opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                {disabledReason || t('oldCatHelp', lang)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className={`oldcat-panel fixed right-0 top-0 h-full z-50 flex flex-col bg-card-light dark:bg-card-dark border-l border-border-light dark:border-border-dark shadow-2xl ${fullscreen ? 'oldcat-panel-fullscreen' : 'w-80'}`}
          >
            {/* Header */}
            <div className="flex items-center gap-3 p-4 border-b border-border-light dark:border-border-dark">
              <motion.div
                key={mode}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400 }}
              >
                <BlinkingClayMascot type="oldcat" className="oldcat-header-mascot" />
              </motion.div>
              <div className="flex-1">
                <div className="font-bold text-sm text-primary dark:text-primary-dark">
                  {lang === 'zh' ? '老猫导师' : 'Mentor Cat'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {mode === 'companion'
                    ? (lang === 'zh' ? '陪伴模式' : 'Companion')
                    : (lang === 'zh' ? '学习模式' : 'Learning')}
                </div>
              </div>
              <button onClick={saveConversation} className="p-1.5 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors" title={lang === 'zh' ? '保存对话' : 'Save chat'}>
                {savedChat ? <Check size={16}/> : <Save size={16}/>}
              </button>
              <button onClick={() => setFullscreen(f => !f)} className="p-1.5 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors" title={fullscreen ? '退出全屏' : '一键全屏'}>
                {fullscreen ? <Minimize2 size={16}/> : <Maximize2 size={16}/>}
              </button>
              <button onClick={() => closePanel()} className="p-1.5 rounded-full hover:bg-border-light dark:hover:bg-border-dark transition-colors">
                <X size={16}/>
              </button>
            </div>

            <div className="oldcat-gpt-tools">
              <button type="button" onClick={copyForGPT}>
                {copiedPrompt ? <Check size={14} /> : <Copy size={14} />}
                {copiedPrompt ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '总结给 GPT' : 'Copy for GPT')}
              </button>
              <button type="button" onClick={openChatGPT}>
                <ExternalLink size={14} />
                GPT
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i}>
                  {m.role === 'system' ? (
                    <div className="text-center text-xs text-primary dark:text-primary-dark bg-primary/10 dark:bg-primary-dark/10 rounded-lg px-3 py-1.5 animate-pop-in">
                      {m.content}
                    </div>
                  ) : (
                    <div className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-fade-in-up`}>
                      {m.role === 'assistant' && <BlinkingClayMascot type="oldcat" className="oldcat-message-mascot flex-shrink-0 mt-1" />}
                      <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                        m.role === 'user'
                          ? 'bg-primary text-white rounded-tr-sm'
                          : 'bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-tl-sm'
                      }`}>
                        {m.content}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="flex gap-2 animate-fade-in-up">
                  <BlinkingClayMascot type="oldcat" className="oldcat-message-mascot" />
                  <div className="bg-bg-light dark:bg-bg-dark border border-border-light dark:border-border-dark rounded-2xl rounded-tl-sm px-3 py-2">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <span key={i} className="w-2 h-2 bg-primary dark:bg-primary-dark rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {error && (
                <div className="space-y-2 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-500 dark:bg-red-900/20">
                  <div>{error}</div>
                  <button
                    type="button"
                    onClick={() => { window.location.href = '/settings' }}
                    className="rounded-full border border-red-200 bg-white px-3 py-1 font-bold text-red-500 transition-colors hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30"
                  >
                    {lang === 'zh' ? '去设置 API Key' : 'Open API settings'}
                  </button>
                </div>
              )}
              <div ref={bottomRef}/>
            </div>

            {/* Input */}
            <div className="p-4 border-t border-border-light dark:border-border-dark">
              <div className="flex gap-2">
                <input
                  className="input-base flex-1 text-sm py-2"
                  placeholder={lang === 'zh' ? '问老猫任何问题...' : 'Ask anything...'}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
                />
                {user.settings.voiceEnabled && (
                  <button
                    onClick={toggleVoice}
                    className={`p-2 rounded-xl border transition-colors ${listening ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}
                  >
                    {listening ? <MicOff size={16}/> : <Mic size={16}/>}
                  </button>
                )}
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="p-2 bg-primary text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all"
                >
                  <Send size={16}/>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

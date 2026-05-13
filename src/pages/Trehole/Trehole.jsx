import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Send, Heart } from 'lucide-react'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import useStore from '../../store/useStore'
import { callClaude, extractText } from '../../utils/claude'

const WARM_RESPONSES = [
  '喵~ 我在呢，说吧~',
  '嗯嗯，我听着呢...',
  '抱抱你 🐱',
  '你说的我都听到了',
  '没关系的，慢慢来',
]

export default function Trehole() {
  const { user } = useStore()
  const lang = user.settings.language
  const [messages, setMessages] = useState([
    { role: 'assistant', content: lang === 'zh' ? '喵~ 有什么想和我说的吗？我都在听呢 💕' : 'Meow~ Want to tell me something? I\'m all ears 💕' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    if (!input.trim() || loading) return
    const msg = input.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await callClaude({
        messages: [{ role: 'user', content: msg }],
        system: lang === 'zh'
          ? '你是一只温柔的小猫，是用户的树洞。你的任务是陪伴和聆听，给予简短温暖的情绪回应。不要给方向建议，不要分析问题，只是陪着用户。回答控制在50字以内，温暖简短，偶尔用"喵~"、表情包风格。'
          : 'You are a gentle kitten, the user\'s safe space. Just listen and give warm, brief emotional responses. No advice or analysis. Keep it under 50 words. Warm and brief, occasionally use "meow~".',
        maxTokens: 150,
        apiKey: user.settings.apiKey,
      })
      setMessages(prev => [...prev, { role: 'assistant', content: extractText(res) }])
    } catch {
      const fallback = WARM_RESPONSES[Math.floor(Math.random() * WARM_RESPONSES.length)]
      setMessages(prev => [...prev, { role: 'assistant', content: fallback }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-sm mx-auto flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="text-center py-4 space-y-2">
        <motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="flex justify-center">
          <BlinkingClayMascot type="kivi" className="treehole-kivi-large" />
        </motion.div>
        <div className="font-bold text-primary dark:text-primary-dark flex items-center justify-center gap-1.5">
          <Heart size={14} className="text-pink-400" fill="currentColor"/>
          {lang === 'zh' ? '小猫树洞' : 'Kitten Corner'}
          <Heart size={14} className="text-pink-400" fill="currentColor"/>
        </div>
        <p className="text-xs text-gray-400">{lang === 'zh' ? '说什么都好，我都在呢 🐱' : 'Say whatever you need, I\'m here 🐱'}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 animate-fade-in-up ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {m.role === 'assistant' && (
              <div className="flex-shrink-0">
                <BlinkingClayMascot type="kivi" className="treehole-kivi-small" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-pink-400 text-white rounded-tr-sm' : 'bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-tl-sm'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <BlinkingClayMascot type="kivi" className="treehole-kivi-small" />
            <div className="bg-card-light dark:bg-card-dark border border-border-light dark:border-border-dark rounded-2xl px-3 py-2">
              <div className="flex gap-1">{[0,1,2].map(i => <span key={i} className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}</div>
            </div>
          </div>
        )}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="flex gap-2 border-t border-border-light dark:border-border-dark pt-4">
        <input
          className="input-base flex-1 text-sm"
          placeholder={lang === 'zh' ? '说点什么...' : 'Say something...'}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button onClick={send} disabled={!input.trim() || loading} className="p-2.5 bg-pink-400 text-white rounded-xl hover:opacity-90 disabled:opacity-40 transition-all">
          <Send size={16}/>
        </button>
      </div>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Download, Upload, Trash2, Eye, EyeOff, Mic } from 'lucide-react'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'
import { getModelForMode } from '../../utils/claude'

const PERSONALITIES = ['teacher', 'coach', 'friend', 'senior', 'tsundere']
const MODEL_MODES = [
  { key: 'economy', zh: '省钱模式', en: 'Economy', descZh: '日常聊天优先省钱', descEn: 'Lowest cost for daily chat' },
  { key: 'balanced', zh: '平衡模式', en: 'Balanced', descZh: '推荐，质量和成本平衡', descEn: 'Recommended balance' },
  { key: 'deep', zh: '深度模式', en: 'Deep', descZh: '复杂问题使用 GPT-4o', descEn: 'Uses GPT-4o for harder work' },
]
const VOICE_MODES = [
  { key: 'auto', zh: '自动选择', en: 'Auto', descZh: '优先用浏览器语音；不支持时走后端转写。', descEn: 'Browser speech first; backend if unavailable.' },
  { key: 'browser', zh: '浏览器语音', en: 'Browser', descZh: 'Chrome 支持最好，不消耗语音 API。', descEn: 'Best in Chrome, no speech API cost.' },
  { key: 'backend', zh: '后端转写', en: 'Backend', descZh: '录音发到你配置的转写服务，适合浏览器不支持时。', descEn: 'Sends recordings to your configured transcription service.' },
]
const PERSONALITY_EMOJI = { teacher: '📚', coach: '🎤', friend: '💗', senior: '🧠', tsundere: '🐾' }
const PERSONALITY_DESCRIPTIONS = {
  zh: {
    teacher: '更直接指出问题，适合想快速补短板。',
    coach: '关注表达结构和面试回答。',
    friend: '语气更轻松，会多给鼓励。',
    senior: '像产品前辈一样给你拆思路。',
    tsundere: '嘴上有点毒，但会精准指出关键问题。',
  },
  en: {
    teacher: 'Direct feedback for faster improvement.',
    coach: 'Focuses on interview expression and structure.',
    friend: 'Warmer and more encouraging.',
    senior: 'Thinks with you like a senior PM.',
    tsundere: 'Sharp-tongued, but precise and useful.',
  },
}

export default function Settings() {
  const { user, updateSettings, resetAll, setCatConfig, setHomeTourStep } = useStore()
  const navigate = useNavigate()
  const lang = user.settings.language
  const voiceMode = user.settings.voiceMode || 'auto'
  const speechProvider = user.settings.speechProvider || 'custom'
  const [showKey, setShowKey] = useState(false)
  const [showSpeechKey, setShowSpeechKey] = useState(false)
  const [apiKey, setApiKeyLocal] = useState(user.settings.apiKey || '')
  const [speechDraft, setSpeechDraft] = useState({
    speechApiKey: user.settings.speechApiKey || '',
    speechEndpoint: user.settings.speechEndpoint || '',
    speechModel: user.settings.speechModel || '',
  })
  const [saved, setSaved] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [catDraft, setCatDraft] = useState({ ...user.catConfig })
  const showApiTour = user.homeTourDone !== true && user.homeTourStep === 1

  useEffect(() => {
    document.documentElement.classList.toggle('miaotu-settings-tour-active', showApiTour)
    return () => document.documentElement.classList.remove('miaotu-settings-tour-active')
  }, [showApiTour])

  useEffect(() => {
    if (!showApiTour) return undefined
    const target = document.querySelector('[data-tour-target="api-key"]')
    window.setTimeout(() => target?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 120)
    return undefined
  }, [showApiTour])

  function save(patch) {
    updateSettings(patch)
    setSaved(true)
    setTimeout(() => setSaved(false), 1200)
  }

  function saveApiKey() {
    const cleanKey = apiKey.trim()
    localStorage.setItem('miaotu_openai_apikey', cleanKey)
    save({ apiKey: cleanKey })
    setApiKeyLocal(cleanKey)
  }

  function saveSpeechSettings() {
    save({
      speechApiKey: speechDraft.speechApiKey.trim(),
      speechEndpoint: speechDraft.speechEndpoint.trim(),
      speechModel: speechDraft.speechModel.trim(),
    })
  }

  function continueHomeTour() {
    setHomeTourStep(2)
    navigate('/')
  }

  function exportData() {
    const state = useStore.getState()
    const data = {
      user: state.user,
      stats: state.stats,
      vocab: state.vocab,
      savedQuestions: state.savedQuestions,
      tasks: state.tasks,
      training: state.training,
      interview: state.interview,
      diary: state.diary,
      exportedAt: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `miaotu_backup_${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result)
        const store = useStore.getState()
        if (data.user) store.user = data.user
        // Reload page to apply
        window.location.reload()
      } catch {
        alert(lang === 'zh' ? '文件格式错误' : 'Invalid file format')
      }
    }
    reader.readAsText(file)
  }

  function clearData() {
    if (!window.confirm(lang === 'zh' ? '确定要清除所有数据吗？此操作不可撤销！' : 'Clear all data? This cannot be undone!')) return
    resetAll()
    window.location.reload()
  }

  function applyTheme(theme) {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    save({ theme })
  }

  return (
    <div className="max-w-lg mx-auto space-y-5">
      <h1 className="section-title text-xl">{t('settings', lang)}</h1>

      {saved && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="card p-3 text-center text-sm font-semibold text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20">
          ✅ {lang === 'zh' ? '已保存' : 'Saved'}
        </motion.div>
      )}

      {/* Language */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{t('languageLabel', lang)}</div>
        <div className="flex gap-3">
          {['zh', 'en'].map(l => (
            <button key={l} onClick={() => save({ language: l })} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${user.settings.language === l ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
              {l === 'zh' ? '中文' : 'English'}
            </button>
          ))}
        </div>
      </div>

      {/* Theme */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{t('themeLabel', lang)}</div>
        <div className="flex gap-3">
          {['light', 'dark'].map(th => (
            <button key={th} onClick={() => applyTheme(th)} className={`flex-1 py-2.5 rounded-xl font-bold text-sm border transition-all ${user.settings.theme === th ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
              {th === 'light' ? `☀️ ${t('lightMode', lang)}` : `🌙 ${t('darkMode', lang)}`}
            </button>
          ))}
        </div>
      </div>

      {/* Cat personality */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{t('catPersonalityLabel', lang)}</div>
        <div className="grid grid-cols-1 gap-2">
          {PERSONALITIES.map(p => (
            <button key={p} onClick={() => save({ catPersonality: p })} className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all text-left flex items-start gap-2 ${user.settings.catPersonality === p ? 'bg-primary/10 border-primary text-primary dark:text-primary-dark' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
              <span className="mt-0.5">{PERSONALITY_EMOJI[p]}</span>
              <span className="flex-1">
                <span className="flex items-center gap-2">
                  {t(`personality_${p}`, lang)}
                  {p === 'teacher' && <span className="text-[10px] text-gray-400">{lang === 'zh' ? '默认' : 'Default'}</span>}
                </span>
                <span className="mt-1 block text-[11px] font-normal text-gray-400">{PERSONALITY_DESCRIPTIONS[lang][p]}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div className="card p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-bold text-sm"><Mic size={16} /> {t('voiceLabel', lang)}</div>
            <div className="text-xs text-gray-400 mt-1">
              {lang === 'zh'
                ? '语音输入有两种：浏览器自带识别不花 API；后端转写使用你单独配置的语音 API。'
                : 'Voice input can use browser speech for free, or a separate backend transcription API.'}
            </div>
          </div>
          <button
            onClick={() => save({ voiceEnabled: !user.settings.voiceEnabled })}
            className={`relative w-12 h-6 rounded-full transition-colors ${user.settings.voiceEnabled ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${user.settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}/>
          </button>
        </div>

        <div className="grid grid-cols-1 gap-2">
          {VOICE_MODES.map(mode => (
            <button
              key={mode.key}
              type="button"
              onClick={() => save({ voiceMode: mode.key })}
              className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all text-left ${voiceMode === mode.key ? 'bg-primary/10 border-primary text-primary dark:text-primary-dark' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}
            >
              <span>{lang === 'zh' ? mode.zh : mode.en}</span>
              <span className="mt-1 block text-[11px] font-normal text-gray-400">{lang === 'zh' ? mode.descZh : mode.descEn}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border-light/80 bg-white/45 p-3 dark:border-border-dark dark:bg-black/10">
          <div className="mb-2 text-xs font-bold text-gray-500">{lang === 'zh' ? '后端语音 API（和老猫/出题 API 分开）' : 'Backend speech API, separate from AI chat'}</div>
          <div className="mb-2 grid grid-cols-2 gap-2">
            {[
              { key: 'custom', label: lang === 'zh' ? '自定义服务' : 'Custom' },
              { key: 'openai', label: 'OpenAI' },
            ].map(provider => (
              <button
                key={provider.key}
                type="button"
                onClick={() => save({ speechProvider: provider.key })}
                className={`rounded-xl border py-2 text-xs font-black ${speechProvider === provider.key ? 'border-primary bg-primary/10 text-primary' : 'border-border-light dark:border-border-dark'}`}
              >
                {provider.label}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            <div className="relative">
              <input
                className="input-base pr-10 font-mono text-xs"
                type={showSpeechKey ? 'text' : 'password'}
                placeholder={lang === 'zh' ? '语音转写 API Key...' : 'Speech API key...'}
                value={speechDraft.speechApiKey}
                onChange={e => setSpeechDraft(d => ({ ...d, speechApiKey: e.target.value }))}
              />
              <button onClick={() => setShowSpeechKey(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showSpeechKey ? <EyeOff size={15}/> : <Eye size={15}/>}
              </button>
            </div>
            <input
              className="input-base font-mono text-xs"
              placeholder={speechProvider === 'openai' ? 'OpenAI 可留空；兼容服务可填转写 endpoint' : '你的转写服务 endpoint'}
              value={speechDraft.speechEndpoint}
              onChange={e => setSpeechDraft(d => ({ ...d, speechEndpoint: e.target.value }))}
            />
            <input
              className="input-base font-mono text-xs"
              placeholder={speechProvider === 'openai' ? '模型，可留空默认 whisper-1' : '模型名，可选'}
              value={speechDraft.speechModel}
              onChange={e => setSpeechDraft(d => ({ ...d, speechModel: e.target.value }))}
            />
            <button type="button" onClick={saveSpeechSettings} className="btn-primary w-full">{t('save', lang)}</button>
          </div>
          <p className="mt-2 text-[10px] leading-relaxed text-gray-400">
            {lang === 'zh'
              ? '浏览器语音会在点击麦克风时请求权限；后端转写会把录音发送到你填写的服务。喵途不会硬限制录音时长，但录得越长转写越慢、费用也可能越高。'
              : 'Browser speech asks permission when you tap the mic. Backend mode sends recordings to your configured service. Miaotu does not hard-limit recording length, but longer audio can be slower and cost more.'}
          </p>
        </div>
      </div>

      {/* Model mode */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{lang === 'zh' ? 'OpenAI 模型模式' : 'OpenAI model mode'}</div>
        <div className="grid grid-cols-1 gap-2">
          {MODEL_MODES.map(mode => (
            <button
              key={mode.key}
              onClick={() => save({ modelMode: mode.key })}
              className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all text-left ${user.settings.modelMode === mode.key ? 'bg-primary/10 border-primary text-primary dark:text-primary-dark' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}
            >
              <div className="flex items-center justify-between gap-3">
                <span>{lang === 'zh' ? mode.zh : mode.en}</span>
                <span className="text-[10px] text-gray-400">{getModelForMode(mode.key)}</span>
              </div>
              <div className="mt-1 text-[11px] font-normal text-gray-400">
                {lang === 'zh' ? mode.descZh : mode.descEn}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Cat profile */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{lang === 'zh' ? '小猫资料' : 'Cat profile'}</div>
        {user.catCustomized ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{user.catConfig.name || 'Kivi'}</span>
            <button onClick={() => setCustomizing(true)} className="btn-ghost text-sm">{lang === 'zh' ? '修改名字' : 'Edit name'}</button>
          </div>
        ) : (
          <button onClick={() => setCustomizing(true)} className="btn-primary w-full">{lang === 'zh' ? '设置小猫名字' : 'Set cat name'}</button>
        )}
        {customizing && (
          <div className="space-y-3 pt-2 border-t border-border-light dark:border-border-dark">
            {[
              { key: 'name', label: lang === 'zh' ? '名字' : 'Name', placeholder: lang === 'zh' ? '给小猫取个名字...' : 'Cat name', type: 'text' },
            ].map(f => (
              <div key={f.key}>
                <div className="text-xs font-semibold text-gray-500 mb-1">{f.label}</div>
                <input
                  className="input-base text-sm"
                  type={f.type}
                  placeholder={f.placeholder}
                  value={catDraft[f.key] || ''}
                  onChange={e => setCatDraft(d => ({ ...d, [f.key]: e.target.value }))}
                />
              </div>
            ))}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const nextName = catDraft.name?.trim() || 'Kivi'
                  setCatConfig({ name: nextName, focus: user.catConfig?.focus || 'training' })
                  setCatDraft(d => ({ ...d, name: nextName }))
                  setCustomizing(false)
                }}
                className="btn-primary flex-1"
              >
                {t('save', lang)}
              </button>
              <button onClick={() => setCustomizing(false)} className="btn-ghost px-4">{t('cancel', lang)}</button>
            </div>
          </div>
        )}
      </div>

      {/* API Key */}
      <div className={`card p-5 space-y-3 ${showApiTour ? 'settings-tour-highlight' : ''}`} data-tour-target="api-key">
        <div className="font-bold text-sm">OpenAI API Key</div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              className="input-base pr-10 font-mono text-xs"
              type={showKey ? 'text' : 'password'}
              placeholder={lang === 'zh' ? '粘贴你的 OpenAI API Key...' : 'Paste your OpenAI API Key...'}
              value={apiKey}
              onChange={e => setApiKeyLocal(e.target.value)}
            />
            <button onClick={() => setShowKey(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {showKey ? <EyeOff size={15}/> : <Eye size={15}/>}
            </button>
          </div>
          <button onClick={saveApiKey} className="btn-primary px-4">{t('save', lang)}</button>
        </div>
        <div className="text-[10px] text-gray-400">{lang === 'zh' ? 'Key 存储在浏览器本地。不要把它发给别人；如果怀疑泄露，可以去 OpenAI Platform 删除并重建。' : 'The key is stored locally in your browser. Do not share it; delete and recreate it in OpenAI Platform if it leaks.'}</div>
        {showApiTour && (
          <button type="button" onClick={continueHomeTour} className="btn-primary w-full">
            {lang === 'zh' ? '回到首页继续新手指引' : 'Back home and continue tour'}
          </button>
        )}
      </div>

      {/* Data management */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{t('dataManagement', lang)}</div>
        <div className="flex gap-2">
          <button onClick={exportData} className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm">
            <Download size={16}/> {t('exportData', lang)}
          </button>
          <label className="btn-ghost flex-1 flex items-center justify-center gap-2 text-sm cursor-pointer">
            <Upload size={16}/> {t('importData', lang)}
            <input type="file" accept=".json" onChange={importData} className="hidden"/>
          </label>
        </div>
        <button onClick={clearData} className="w-full py-2.5 rounded-xl text-sm font-semibold border border-red-200 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2">
          <Trash2 size={16}/> {t('clearData', lang)}
        </button>
      </div>

      {showApiTour && (
        <>
          <div className="settings-tour-dim" aria-hidden="true" />
          <motion.div
            className="settings-tour-card"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <div className="home-tour-copy">
              <span>2 / 10</span>
              <h3>{lang === 'zh' ? '把 API Key 放在这里' : 'Paste your API Key here'}</h3>
              <p>
                {lang === 'zh'
                  ? '上面的 OpenAI API Key 用来调用 AI 反馈和导师对话；语音输入可以选择浏览器识别，也可以单独配置语音转写 API。Key 都只保存在你的浏览器本地。'
                  : 'The OpenAI API Key powers AI feedback and Mentor Cat. Voice input can use browser speech or a separate transcription API. Keys stay in this browser.'}
              </p>
              <div className="home-tour-actions">
                <button type="button" onClick={continueHomeTour}>
                  {lang === 'zh' ? '先跳过' : 'Skip for now'}
                </button>
                <button type="button" onClick={continueHomeTour}>
                  {lang === 'zh' ? '回首页继续' : 'Continue'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

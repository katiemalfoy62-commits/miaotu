import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Download, Upload, Trash2, Eye, EyeOff } from 'lucide-react'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'
import { getModelForMode } from '../../utils/claude'

const PERSONALITIES = ['mom', 'teacher', 'friend', 'mentor', 'boss', 'colleague', 'toxic']
const MODEL_MODES = [
  { key: 'economy', zh: '省钱模式', en: 'Economy', descZh: '日常聊天优先省钱', descEn: 'Lowest cost for daily chat' },
  { key: 'balanced', zh: '平衡模式', en: 'Balanced', descZh: '推荐，质量和成本平衡', descEn: 'Recommended balance' },
  { key: 'deep', zh: '深度模式', en: 'Deep', descZh: '复杂问题使用 GPT-4o', descEn: 'Uses GPT-4o for harder work' },
]
const PERSONALITY_EMOJI = { mom: '💗', teacher: '📚', friend: '😄', mentor: '🧠', boss: '💼', colleague: '🤝', toxic: '🐍' }

export default function Settings() {
  const { user, updateSettings, resetAll, setCatConfig } = useStore()
  const lang = user.settings.language
  const [showKey, setShowKey] = useState(false)
  const [apiKey, setApiKeyLocal] = useState(user.settings.apiKey || '')
  const [saved, setSaved] = useState(false)
  const [customizing, setCustomizing] = useState(false)
  const [catDraft, setCatDraft] = useState({ ...user.catConfig })

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
            <button key={p} onClick={() => save({ catPersonality: p })} className={`py-2.5 px-4 rounded-xl text-sm font-semibold border transition-all text-left flex items-center gap-2 ${user.settings.catPersonality === p ? 'bg-primary/10 border-primary text-primary dark:text-primary-dark' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
              <span>{PERSONALITY_EMOJI[p]}</span>
              {t(`personality_${p}`, lang)}
              {p === 'teacher' && <span className="ml-auto text-[10px] text-gray-400">{lang === 'zh' ? '默认' : 'Default'}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* Voice */}
      <div className="card p-5 flex items-center justify-between">
        <div>
          <div className="font-bold text-sm">{t('voiceLabel', lang)}</div>
          <div className="text-xs text-gray-400 mt-0.5">{lang === 'zh' ? '使用浏览器内置语音识别' : 'Uses browser built-in speech recognition'}</div>
        </div>
        <button
          onClick={() => save({ voiceEnabled: !user.settings.voiceEnabled })}
          className={`relative w-12 h-6 rounded-full transition-colors ${user.settings.voiceEnabled ? 'bg-primary' : 'bg-border-light dark:bg-border-dark'}`}
        >
          <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${user.settings.voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}/>
        </button>
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

      {/* Cat appearance */}
      <div className="card p-5 space-y-3">
        <div className="font-bold text-sm">{t('catAppearance', lang)}</div>
        {user.catCustomized ? (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">{user.catConfig.name || (lang === 'zh' ? '已自定义' : 'Customized')}</span>
            <button onClick={() => setCustomizing(true)} className="btn-ghost text-sm">{t('recustomizeCat', lang)}</button>
          </div>
        ) : (
          <button onClick={() => setCustomizing(true)} className="btn-primary w-full">{lang === 'zh' ? '自定义小猫' : 'Customize Cat'}</button>
        )}
        {customizing && (
          <div className="space-y-3 pt-2 border-t border-border-light dark:border-border-dark">
            {[
              { key: 'name', label: lang === 'zh' ? '名字' : 'Name', placeholder: lang === 'zh' ? '给猫咪取个名字' : 'Cat name', type: 'text' },
              { key: 'breed', label: lang === 'zh' ? '品种' : 'Breed', placeholder: 'orange / british / ragdoll / black / calico', type: 'text' },
              { key: 'color', label: lang === 'zh' ? '颜色' : 'Color', placeholder: 'orange / gray / brown / black / white / cream', type: 'text' },
              { key: 'eyeColor', label: lang === 'zh' ? '眼睛颜色' : 'Eye Color', placeholder: 'yellow / green / blue / amber', type: 'text' },
              { key: 'gender', label: lang === 'zh' ? '性别' : 'Gender', placeholder: 'male / female', type: 'text' },
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
              <button onClick={() => { setCatConfig(catDraft); setCustomizing(false) }} className="btn-primary flex-1">{t('save', lang)}</button>
              <button onClick={() => setCustomizing(false)} className="btn-ghost px-4">{t('cancel', lang)}</button>
            </div>
          </div>
        )}
      </div>

      {/* API Key */}
      <div className="card p-5 space-y-3">
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
    </div>
  )
}

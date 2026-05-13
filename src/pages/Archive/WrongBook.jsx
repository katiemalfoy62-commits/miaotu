import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'

function WrongItem({ item, lang, onReAttempt }) {
  const [open, setOpen] = useState(false)
  const source = item.source === 'training' ? t('source_training', lang) : t('source_interview', lang)

  return (
    <div className="card overflow-hidden">
      <button
        className="w-full p-4 text-left flex items-start gap-3 hover:bg-border-light/30 dark:hover:bg-border-dark/30 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`tag text-[10px] ${item.source === 'training' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>{source}</span>
            {item.score1 != null && <span className="text-[10px] text-gray-400">{lang === 'zh' ? `得分：${item.score1}分` : `Score: ${item.score1}`}</span>}
          </div>
          <p className="font-semibold text-sm leading-snug">{item.question || item.text || item.content}</p>
        </div>
        {open ? <ChevronUp size={16} className="flex-shrink-0 mt-1 text-gray-400"/> : <ChevronDown size={16} className="flex-shrink-0 mt-1 text-gray-400"/>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-3 border-t border-border-light dark:border-border-dark pt-3">
              {item.answer && (
                <div className="bg-bg-light dark:bg-bg-dark rounded-xl p-3">
                  <div className="text-xs font-bold text-gray-500 mb-1">{lang === 'zh' ? '我的答案' : 'My Answer'}</div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.answer || (lang === 'zh' ? '无记录' : 'No record')}</p>
                </div>
              )}
              {item.comment && (
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3">
                  <div className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">{lang === 'zh' ? '老猫点评' : "Mentor's Comment"}</div>
                  <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{item.comment}</p>
                </div>
              )}
              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                <div className="text-xs font-bold text-green-700 dark:text-green-400 mb-1">{lang === 'zh' ? '参考答案框架' : 'Reference Framework'}</div>
                <p className="text-xs text-gray-500">{lang === 'zh' ? '在思维训练或面试模拟中正式作答得分≥60分时，自动从错题本移除。' : 'Removed when you score ≥60 on this question in official Training or Interview.'}</p>
              </div>
              <button
                onClick={() => onReAttempt(item)}
                className="btn-ghost text-sm flex items-center gap-2"
              >
                <RotateCcw size={14}/>
                {t('reAttempt', lang)} ({lang === 'zh' ? '练习模式，不影响错题本' : 'Practice mode, does not remove from wrong book'})
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function WrongBook() {
  const { training, interview, user } = useStore()
  const lang = user.settings.language
  const [filter, setFilter] = useState('all') // all | training | interview

  const allWrong = [
    ...(training.wrongBook || []).map(w => ({ ...w, source: 'training' })),
    ...(interview.wrongBook || []).map(w => ({ ...w, source: 'interview' })),
  ]

  const filtered = filter === 'all' ? allWrong : allWrong.filter(w => w.source === filter)

  function handleReAttempt(item) {
    // Opens in practice mode - could navigate to a practice page
    // For now just alert
    alert(lang === 'zh' ? '练习模式提示：本次作答不会影响错题本，只有在正式思维训练或面试模拟中答对才移除。' : 'Practice mode: This attempt won\'t remove it from the wrong book.')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="section-title text-xl">{t('wrongBook', lang)}</h1>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'training', 'interview'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${filter === f ? 'bg-primary text-white' : 'border border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}
          >
            {f === 'all' ? (lang === 'zh' ? '全部' : 'All') : t(`source_${f}`, lang)}
            <span className="ml-1.5 text-xs opacity-70">
              ({f === 'all' ? allWrong.length : allWrong.filter(w => w.source === f).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="text-4xl mb-3">📗</div>
          <div className="font-bold text-gray-500">{t('wrongBookEmpty', lang)}</div>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, i) => (
            <motion.div key={item.questionId || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <WrongItem item={item} lang={lang} onReAttempt={handleReAttempt}/>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

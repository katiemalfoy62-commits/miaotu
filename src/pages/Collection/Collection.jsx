import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bookmark, Trash2, BookOpen } from 'lucide-react'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'

export default function Collection() {
  const { user, vocab, removeVocab, savedQuestions, removeSavedQuestion } = useStore()
  const lang = user.settings.language
  const [tab, setTab] = useState('vocab') // vocab | questions

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <h1 className="section-title text-xl">
        {lang === 'zh' ? '收藏夹' : 'Collections'}
      </h1>

      {/* Tab switcher */}
      <div className="flex gap-2 bg-bg-light dark:bg-bg-dark rounded-2xl p-1">
        <button
          onClick={() => setTab('vocab')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'vocab' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary dark:hover:text-primary-dark'}`}
        >
          <Bookmark size={14} className="inline mr-1.5 -mt-0.5"/>
          {t('vocabCollection', lang)}
          <span className="ml-1.5 text-xs opacity-80">({vocab.length})</span>
        </button>
        <button
          onClick={() => setTab('questions')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'questions' ? 'bg-primary text-white shadow-sm' : 'text-gray-500 hover:text-primary dark:hover:text-primary-dark'}`}
        >
          <BookOpen size={14} className="inline mr-1.5 -mt-0.5"/>
          {t('questionCollection', lang)}
          <span className="ml-1.5 text-xs opacity-80">({savedQuestions.length})</span>
        </button>
      </div>

      {/* Vocab list */}
      {tab === 'vocab' && (
        <div className="space-y-3">
          {vocab.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">📚</div>
              <div className="font-bold text-gray-500">{lang === 'zh' ? '还没有收藏词汇' : 'No vocab saved yet'}</div>
              <div className="text-xs text-gray-400 mt-1">{lang === 'zh' ? '在情报站点击词汇的书签图标收藏' : 'Click the bookmark icon on vocab in the news station'}</div>
            </div>
          ) : vocab.map((v, i) => (
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="font-black text-base text-primary dark:text-primary-dark mb-1">{v.word}</div>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{v.def}</p>
                {v.scene && (
                  <div className="mt-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2.5 py-1.5 text-xs text-amber-700 dark:text-amber-400">
                    💡 {v.scene}
                  </div>
                )}
                <div className="text-[10px] text-gray-400 mt-1.5">{v.savedAt?.slice(0, 10)}</div>
              </div>
              <button
                onClick={() => removeVocab(v.id)}
                className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400 text-gray-400 transition-colors flex-shrink-0"
              >
                <Trash2 size={14}/>
              </button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Questions list */}
      {tab === 'questions' && (
        <div className="space-y-3">
          {savedQuestions.length === 0 ? (
            <div className="card p-10 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-bold text-gray-500">{lang === 'zh' ? '还没有收藏题目' : 'No questions saved yet'}</div>
              <div className="text-xs text-gray-400 mt-1">{lang === 'zh' ? '在思维训练/面试模拟评分页点击收藏按钮' : 'Click the save button on the score pages in Training or Interview'}</div>
            </div>
          ) : savedQuestions.map((q, i) => (
            <motion.div
              key={q.questionId}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="card p-4 flex items-start gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`tag text-[10px] ${q.from === 'training' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'}`}>
                    {q.from === 'training' ? t('source_training', lang) : t('source_interview', lang)}
                  </span>
                  {q.source && <span className="text-[10px] text-gray-400">{q.source}</span>}
                </div>
                <p className="font-semibold text-sm leading-relaxed">{q.question}</p>
                <div className="text-[10px] text-gray-400 mt-1.5">{q.savedAt?.slice(0, 10)}</div>
              </div>
              <button
                onClick={() => removeSavedQuestion(q.questionId)}
                className="p-1.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400 text-gray-400 transition-colors flex-shrink-0"
              >
                <Trash2 size={14}/>
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

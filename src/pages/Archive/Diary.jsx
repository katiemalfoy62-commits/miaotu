import React, { useState } from 'react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { callClaude, extractText, getCatPersonalityPrompt } from '../../utils/claude'
import { t } from '../../utils/i18n'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import ClayIcon from '../../components/UI/ClayIcon'

function CalendarView({ diary, lang }) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const diaryDates = new Set(diary.map(d => d.date))

  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
        {now.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { year: 'numeric', month: 'long' })}
      </div>
      <div className="grid grid-cols-7 gap-1 text-center">
        {['日','一','二','三','四','五','六'].map(d => (
          <div key={d} className="text-[10px] text-gray-400 font-semibold">{d}</div>
        ))}
        {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`}/>)}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
          const hasDiary = diaryDates.has(dateStr)
          const isToday = day === now.getDate()
          return (
            <div
              key={day}
              className={`aspect-square flex items-center justify-center rounded-lg text-[11px] font-semibold transition-all ${hasDiary ? 'bg-primary text-white' : isToday ? 'border-2 border-primary text-primary dark:text-primary-dark' : 'text-gray-500 dark:text-gray-400'}`}
            >
              {day}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Diary() {
  const { user, diary, stats, tasks, training, interview, addDiaryEntry } = useStore()
  const lang = user.settings.language
  const [generating, setGenerating] = useState(false)
  const [selected, setSelected] = useState(null)

  async function generateDiary() {
    if (generating) return
    setGenerating(true)
    try {
      const today = new Date().toISOString().slice(0, 10)
      const todayActivity = {
        newsRead: Object.values(stats.dailyActivity).reduce((a, b) => a + b, 0),
        tasksCompleted: tasks.completed.filter(t => t.completedAt?.startsWith(today)).length,
        avgScore: 75,
        fishEarned: user.fish,
      }

      const res = await callClaude({
        messages: [{ role: 'user', content: `请根据今日学习情况生成一篇学习日记（约200字），包含：今天学了什么、完成了什么、有什么收获。学习数据：${JSON.stringify(todayActivity)}` }],
        system: `${getCatPersonalityPrompt(user.settings.catPersonality, lang)}\n你是老猫，正在帮用户总结今日学习情况，生成温暖有总结性的学习日记。语气活泼，有具体内容，不要泛泛而谈。`,
        maxTokens: 600,
        apiKey: user.settings.apiKey,
      })
      const content = extractText(res)
      const dayCount = diary.length + 1
      addDiaryEntry({
        date: today,
        dayCount,
        content,
        data: todayActivity,
        highlights: [lang === 'zh' ? '今天认真完成了学习任务' : 'Completed learning tasks today'],
        improvements: [lang === 'zh' ? '可以更深入思考问题' : 'Could think more deeply'],
      })
    } catch {}
    finally { setGenerating(false) }
  }

  const selectedEntry = selected !== null ? diary[selected] : null

  return (
    <div className="flex gap-5 max-w-4xl mx-auto">
      {/* Left: diary list */}
      <div className="flex-1 min-w-0 space-y-4">
        <h1 className="section-title text-xl">{t('studyDiary', lang)}</h1>

        {diary.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <ClayIcon name="diary" className="empty-clay-icon mx-auto" alt="" />
            <div className="font-bold text-gray-500">{t('diaryEmpty', lang)}</div>
            <div className="text-xs text-gray-400">{lang === 'zh' ? '告诉老猫"我们来复个盘吧"，它会帮你生成日记～' : 'Tell the mentor "Let\'s review today" to generate a diary entry~'}</div>
          </div>
        ) : (
          <div className="space-y-3">
            {diary.map((entry, i) => (
              <motion.button
                key={entry.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelected(selected === i ? null : i)}
                className={`w-full card p-4 text-left hover:shadow-md transition-all ${selected === i ? 'border-primary dark:border-primary-dark ring-1 ring-primary dark:ring-primary-dark' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs text-gray-400">{entry.date} · {lang === 'zh' ? `第${entry.dayCount}天` : `Day ${entry.dayCount}`}</div>
                  <div className="flex gap-2 text-xs text-gray-400">
                    {entry.data?.tasksCompleted > 0 && <span>✅ {entry.data.tasksCompleted}</span>}
                    {entry.data?.avgScore && <span>📊 {entry.data.avgScore}</span>}
                  </div>
                </div>
                <p className={`text-sm text-gray-700 dark:text-gray-300 leading-relaxed ${selected === i ? '' : 'line-clamp-3'}`}>{entry.content}</p>
                {selected === i && entry.highlights && (
                  <div className="mt-3 space-y-2">
                    <div className="space-y-1">
                      {entry.highlights.map((h, j) => <div key={j} className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400"><span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"/>  {h}</div>)}
                    </div>
                    <div className="space-y-1">
                      {entry.improvements?.map((imp, j) => <div key={j} className="flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"/>  {imp}</div>)}
                    </div>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Right sidebar */}
      <div className="w-52 flex-shrink-0 space-y-4">
        {/* Calendar */}
        <div className="card p-4">
          <CalendarView diary={diary} lang={lang}/>
        </div>

        {/* Review button */}
        <button
          onClick={generateDiary}
          disabled={generating}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          {generating ? (
            <>{[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }}/>)}</>
          ) : (
            <><BlinkingClayMascot type="oldcat" className="inline-oldcat-mascot" /> {t('reviewWithCat', lang)}</>
          )}
        </button>

        {/* Monthly summary */}
        <div className="card p-4 space-y-2">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-wide">{lang === 'zh' ? '本月汇总' : 'This Month'}</div>
          <div className="text-2xl font-black text-primary dark:text-primary-dark">{diary.length}</div>
          <div className="text-xs text-gray-400">{lang === 'zh' ? '篇学习日记' : 'diary entries'}</div>
        </div>
      </div>
    </div>
  )
}

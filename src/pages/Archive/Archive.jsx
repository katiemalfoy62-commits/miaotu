import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, CheckCircle, Copy, ExternalLink, Fish, MessageSquare, Target, Trophy } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'
import { buildInterviewPrompt, buildTaskPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'

const BADGE_LIST = [
  { id: '初出茅庐', emoji: '🌱', desc: '完成第一个任务', condition: (u, s) => s.tasks?.completed?.length >= 1 },
  { id: '七日连续', emoji: '🔥', desc: '连续学习 7 天', condition: (u, s) => Object.keys(s.stats?.dailyActivity || {}).length >= 7 },
  { id: '完美表现', emoji: '⭐', desc: '任意模块满分', condition: (u, s) => (s.tasks?.completed || []).some(item => item.score >= 95) },
  { id: '词汇达人', emoji: '📚', desc: '收藏 20 个词汇', condition: (u, s, store) => store.vocab?.length >= 20 },
  { id: '深度思考者', emoji: '🧠', desc: '完成 10 道思维训练', condition: (u, s) => s.training?.questionHistory?.length >= 10 },
  { id: '面试高手', emoji: '💼', desc: '面试平均分超过 80', condition: (u, s) => {
    const scores = s.interview?.history?.map(h => h.totalScore) || []
    return scores.length > 0 && scores.reduce((a, b) => a + b, 0) / scores.length >= 80
  } },
  { id: '时尚达猫', emoji: '👗', desc: '购买 3 件装扮', condition: (u) => u.unlockedItems?.length >= 3 },
  { id: '猫咪进化I', emoji: '🐾', desc: '升到学生猫', condition: (u) => u.level >= 11 },
  { id: '猫咪进化II', emoji: '🐱', desc: '升到实习猫', condition: (u) => u.level >= 26 },
  { id: '猫咪进化III', emoji: '🏆', desc: '升到首席猫', condition: (u) => u.level >= 46 },
]

function HeatMap({ dailyActivity }) {
  const today = new Date()
  const days = Array.from({ length: 49 }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (48 - i))
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: dailyActivity[key] || 0 }
  })

  return (
    <div>
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">7周活跃热力图</div>
      <div className="grid grid-cols-7 gap-1">
        {days.map((d, i) => (
          <div
            key={i}
            className="aspect-square rounded-sm"
            style={{ backgroundColor: d.count === 0 ? undefined : `rgba(200,98,42,${Math.min(1, d.count * 0.3)})` }}
            title={`${d.date}: ${d.count}`}
          />
        ))}
      </div>
    </div>
  )
}

function formatDate(value) {
  if (!value) return '刚刚'
  return new Date(value).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function recordIcon(type) {
  if (type === 'interview') return <MessageSquare size={18} />
  if (type === 'training') return <Target size={18} />
  if (type === 'news') return <BookOpen size={18} />
  if (type === 'breakthrough') return <Target size={18} />
  return <CheckCircle size={18} />
}

function recordPrompt(record) {
  if (record.type === 'interview') return buildInterviewPrompt(record.feedback || record.raw || record)
  return buildTaskPrompt(record)
}

export default function Archive() {
  const store = useStore()
  const { user, stats, tasks, training, interview, diary } = store
  const lang = user.settings.language
  const [selected, setSelected] = useState(null)
  const learningRecords = store.learningRecords || []

  const radarData = [
    { subject: t('userNeeds', lang), A: stats.abilityScores.userNeeds, fullMark: 100 },
    { subject: t('competitive', lang), A: stats.abilityScores.competitive, fullMark: 100 },
    { subject: t('business', lang), A: stats.abilityScores.business, fullMark: 100 },
    { subject: t('data', lang), A: stats.abilityScores.data, fullMark: 100 },
    { subject: t('expression', lang), A: stats.abilityScores.expression, fullMark: 100 },
    { subject: t('aiTech', lang), A: stats.abilityScores.aiTech, fullMark: 100 },
    { subject: t('productDesign', lang), A: stats.abilityScores.productDesign, fullMark: 100 },
    { subject: t('innovation', lang), A: stats.abilityScores.innovation, fullMark: 100 },
  ]

  const studyDays = Object.keys(stats.dailyActivity).length
  const avgScore = tasks.completed.length > 0
    ? Math.round(tasks.completed.reduce((a, b) => a + (b.score || 0), 0) / tasks.completed.length)
    : 0
  const weeklyScores = stats.weeklyInterviewScores.map(s => ({ name: s.date, score: s.score }))

  BADGE_LIST.forEach(badge => {
    if (!user.badges.includes(badge.id) && badge.condition(user, { stats, tasks, training, interview }, store)) {
      store.unlockBadge(badge.id)
    }
  })

  const grouped = useMemo(() => {
    return learningRecords.reduce((acc, item) => {
      const key = item.type || 'task'
      acc[key] = acc[key] || []
      acc[key].push(item)
      return acc
    }, {})
  }, [learningRecords])

  return (
    <div className="flex gap-5">
      <div className="flex-1 min-w-0 space-y-6">
        <h1 className="section-title text-xl">成长档案</h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5">
          <div className="font-bold text-sm mb-4">能力雷达图</div>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(200,98,42,0.2)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#A09080' }} />
              <Radar name="能力" dataKey="A" stroke="#C8622A" fill="#C8622A" fillOpacity={0.25} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-sm">学习记录库</div>
              <p className="text-xs text-gray-400 mt-1">每一次任务、思维训练和模拟面试都会沉淀在这里，方便你回看题目、答案、评分和老猫建议。</p>
            </div>
            <div className="text-xs text-primary dark:text-primary-dark font-bold">{learningRecords.length} 条记录</div>
          </div>

          {learningRecords.length === 0 ? (
            <div className="text-sm text-gray-400 text-center py-10">还没有学习记录，先完成一次任务或训练吧。</div>
          ) : (
            <div className="archive-record-list">
              {learningRecords.slice(0, 12).map(record => (
                <button key={record.id} className="archive-record-item" onClick={() => setSelected(record)}>
                  <span className={`archive-record-icon type-${record.type}`}>{recordIcon(record.type)}</span>
                  <span className="archive-record-main">
                    <b>{record.title || record.question || '学习记录'}</b>
                    <small>{record.source || '学习'} · {formatDate(record.createdAt)}</small>
                  </span>
                  <span className="archive-record-score">{record.score ?? record.feedback?.totalScore ?? '-'}分</span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }} className="card p-5">
          <div className="font-bold text-sm mb-4">成就徽章墙</div>
          <div className="grid grid-cols-5 gap-3">
            {BADGE_LIST.map(badge => {
              const unlocked = user.badges.includes(badge.id)
              return (
                <div key={badge.id} className={`text-center space-y-1 p-2 rounded-xl transition-all ${unlocked ? 'bg-amber-50 dark:bg-amber-900/20' : 'opacity-35'}`} title={badge.desc}>
                  <div className="text-3xl">{badge.emoji}</div>
                  <div className="text-[10px] font-semibold leading-tight">{badge.id}</div>
                </div>
              )
            })}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }} className="card p-5">
          <div className="font-bold text-sm mb-4">记录分布</div>
          <div className="archive-type-grid">
            {['task', 'training', 'interview', 'breakthrough', 'news'].map(type => (
              <div key={type} className="archive-type-card">
                <span>{recordIcon(type)}</span>
                <b>{type === 'task' ? '委托任务' : type === 'training' ? '思维训练' : type === 'interview' ? '模拟面试' : type === 'breakthrough' ? '专项攻破' : '新闻学习'}</b>
                <strong>{grouped[type]?.length || 0}</strong>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="w-52 flex-shrink-0 space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: '学习天数', value: studyDays, icon: <BookOpen size={18} /> },
            { label: '完成任务', value: tasks.completed.length, icon: <CheckCircle size={18} /> },
            { label: '平均得分', value: avgScore || '-', icon: <Trophy size={18} /> },
            { label: '小鱼干', value: user.fish, icon: <Fish size={18} /> },
          ].map(s => (
            <div key={s.label} className="card p-3 text-center space-y-1">
              <div className="flex justify-center text-primary dark:text-primary-dark">{s.icon}</div>
              <div className="font-black text-xl text-primary dark:text-primary-dark">{s.value}</div>
              <div className="text-[10px] text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="card p-4">
          <HeatMap dailyActivity={stats.dailyActivity} />
        </div>

        {weeklyScores.length > 1 && (
          <div className="card p-4">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">面试分数趋势</div>
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={weeklyScores}>
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, 100]} hide />
                <Tooltip formatter={v => [`${v}分`, '']} />
                <Line type="monotone" dataKey="score" stroke="#C8622A" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="space-y-2">
          <Link to="/archive/wrongbook" className="card p-3 flex items-center gap-2 hover:shadow-md transition-shadow cursor-pointer">
            <BookOpen size={18} className="text-primary dark:text-primary-dark" />
            <div className="flex-1">
              <div className="text-xs font-bold">错题本</div>
              <div className="text-[10px] text-gray-400">{(training.wrongBook?.length || 0) + (interview.wrongBook?.length || 0)} 道待复习</div>
            </div>
          </Link>
          <Link to="/archive/diary" className="card p-3 flex items-center gap-2 hover:shadow-md transition-shadow cursor-pointer">
            <BookOpen size={18} className="text-primary dark:text-primary-dark" />
            <div className="flex-1">
              <div className="text-xs font-bold">学习日记</div>
              <div className="text-[10px] text-gray-400">{diary.length} 篇日记</div>
            </div>
          </Link>
          <Link to="/archive/interviews" className="card p-3 flex items-center gap-2 hover:shadow-md transition-shadow cursor-pointer">
            <MessageSquare size={18} className="text-primary dark:text-primary-dark" />
            <div className="flex-1">
              <div className="text-xs font-bold">面试记录</div>
              <div className="text-[10px] text-gray-400">{(interview.history || []).length} 场面试</div>
            </div>
          </Link>
          <Link to="/breakthrough" className="card p-3 flex items-center gap-2 hover:shadow-md transition-shadow cursor-pointer">
            <Target size={18} className="text-primary dark:text-primary-dark" />
            <div className="flex-1">
              <div className="text-xs font-bold">专项攻破</div>
              <div className="text-[10px] text-gray-400">{grouped.breakthrough?.length || 0} 次训练</div>
            </div>
          </Link>
        </div>
      </div>

      {selected && <RecordDetail record={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function RecordDetail({ record, onClose }) {
  const feedback = record.feedback || {}
  const scoreDetail = feedback.score || feedback.scoreDetail || {}

  return (
    <div className="task-detail-modal" onClick={onClose}>
      <div className="task-detail-card" onClick={(event) => event.stopPropagation()}>
        <div className="task-detail-head">
          <div>
            <span>{record.source || '学习记录'}</span>
            <h2>{record.title || record.question || '学习记录详情'}</h2>
          </div>
          <button onClick={onClose}>关闭</button>
        </div>
        <div className="task-detail-body">
          {record.question && (
            <section>
              <h3>题目 / 问题</h3>
              <p>{record.question}</p>
            </section>
          )}
          {record.answer && (
            <section>
              <h3>我的回答</h3>
              <p>{record.answer}</p>
            </section>
          )}
          <section>
            <h3>评分</h3>
            <div className="task-score-grid">
              <span>总分 <b>{record.score ?? feedback.totalScore ?? '-'}</b></span>
              {Object.entries(scoreDetail).map(([key, value]) => (
                <span key={key}>{key} <b>{value}</b></span>
              ))}
            </div>
          </section>
          {(feedback.summary || feedback.comment || feedback.overall) && (
            <section>
              <h3>老猫评价</h3>
              <p>{feedback.summary || feedback.comment || feedback.overall}</p>
            </section>
          )}
          {(feedback.advice || feedback.rewriteExample || feedback.standardAnswer || feedback.betterAnswer) && (
            <section>
              <h3>怎么改得更好</h3>
              {feedback.advice && <p>{feedback.advice}</p>}
              {feedback.rewriteExample && <p><b>改写示例：</b>{feedback.rewriteExample}</p>}
              {(feedback.standardAnswer || feedback.betterAnswer) && <p><b>参考答案：</b>{feedback.standardAnswer || feedback.betterAnswer}</p>}
            </section>
          )}
        </div>
        <div className="task-detail-actions">
          <button onClick={() => copyText(recordPrompt(record))}><Copy size={16} /> 复制给 GPT</button>
          <button onClick={openChatGPT}><ExternalLink size={16} /> 打开 GPT</button>
        </div>
      </div>
    </div>
  )
}

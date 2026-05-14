import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, BookmarkPlus, Check, Copy, ExternalLink, Lock, Mic, MicOff, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { callClaude, extractText, getCatPersonalityPrompt } from '../../utils/claude'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import ClayIcon from '../../components/UI/ClayIcon'
import { buildTaskPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'

const QUESTION_POOL = [
  { id: 'q1', text: '请说明用户研究中，定性和定量研究各自的适用场景，并各举一个 AI 产品案例。', source: '老猫题库', type: 'user_research' },
  { id: 'q2', text: '如果你是豆包的产品经理，你会如何进行竞品分析？请描述你的分析框架和关键维度。', source: '面经改编', type: 'competitive' },
  { id: 'q3', text: '一个 AI 写作助手 DAU 突然下降 30%，请说明你的排查思路和分析方法。', source: '老猫题库', type: 'data' },
  { id: 'q4', text: '请解释 RAG 和 Fine-tuning 的区别，以及各自适合什么场景。', source: 'AI 技术理解', type: 'ai_tech' },
  { id: 'q5', text: '如何衡量一个 AI Agent 产品的商业成功？请提出核心 KPI 体系。', source: '腾讯面经', type: 'business' },
]

function ScoreCard({ label, score, dimensions, color = 'warm' }) {
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-amber-600' : 'text-red-500'
  return (
    <div className={`card border p-4 space-y-3 ${color === 'purple' ? 'bg-purple-50 border-purple-200' : 'bg-amber-50 border-amber-200'}`}>
      <div className="flex items-center justify-between">
        <span className="font-bold text-sm">{label}</span>
        <span className={`font-black text-3xl ${scoreColor}`}>{score}</span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-gray-600">
        {Object.entries(dimensions).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between">
            <span className="truncate mr-1">{key}</span>
            <span className="font-semibold">{value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function useVoice(setValue, lang) {
  const [listening, setListening] = useState(false)
  const ref = useRef(null)

  function toggle() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    if (listening) {
      ref.current?.stop()
      setListening(false)
      return
    }
    const recog = new SpeechRecognition()
    recog.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    recog.onresult = e => setValue(prev => `${prev}${e.results[0][0].transcript}`)
    recog.onend = () => setListening(false)
    recog.start()
    ref.current = recog
    setListening(true)
  }

  return { listening, toggle }
}

export default function Training() {
  const {
    user,
    training,
    addTrainingResult,
    setTrainingLocked,
    addFish,
    addExp,
    saveQuestion,
    savedQuestions,
    addLearningRecord,
    lockTrainingType,
  } = useStore()
  const lang = user.settings.language
  const apiKey = user.settings.apiKey

  const [phase, setPhase] = useState('idle')
  const [currentQ, setCurrentQ] = useState(null)
  const [firstAnswer, setFirstAnswer] = useState('')
  const [secondAnswer, setSecondAnswer] = useState('')
  const [catMessages, setCatMessages] = useState([])
  const [catInput, setCatInput] = useState('')
  const [catLoading, setCatLoading] = useState(false)
  const [scoring, setScoring] = useState(null)
  const [loadingScore, setLoadingScore] = useState(false)
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const secondVoice = useVoice(setSecondAnswer, lang)

  const isQuestionSaved = currentQ && savedQuestions.some(q => q.questionId === currentQ.id)

  function startNewQuestion() {
    const done = new Set(training.questionHistory.map(h => h.questionId))
    const available = QUESTION_POOL.filter(q => !done.has(q.id))
    const q = available[Math.floor(Math.random() * available.length)] || QUESTION_POOL[Math.floor(Math.random() * QUESTION_POOL.length)]
    setCurrentQ(q)
    setFirstAnswer('')
    setSecondAnswer('')
    setCatMessages([])
    setScoring(null)
    setError('')
    setCopied(false)
    setPhase('first')
  }

  function submitFirst() {
    if (!firstAnswer.trim()) return
    setPhase('second')
  }

  async function sendCatMessage() {
    if (!catInput.trim() || catLoading) return
    const msg = catInput.trim()
    setCatInput('')
    setCatMessages(prev => [...prev, { role: 'user', content: msg }])
    setCatLoading(true)
    try {
      const res = await callClaude({
        messages: [{ role: 'user', content: `题目：${currentQ?.text}\n\n第一次回答：${firstAnswer}\n\n我想问：${msg}` }],
        system: `${getCatPersonalityPrompt(user.settings.catPersonality, lang)}
你正在帮学生讨论思维训练题。不要直接替他写完整答案，先指出思考方向、结构框架和遗漏维度，150字以内。`,
        maxTokens: 450,
        apiKey,
        modelMode: user.settings.modelMode,
      })
      setCatMessages(prev => [...prev, { role: 'assistant', content: extractText(res) }])
    } catch {
      setCatMessages(prev => [...prev, { role: 'assistant', content: '我现在没法联网思考，但你可以先按“观点-理由-例子-总结”的结构重写一遍。' }])
    } finally {
      setCatLoading(false)
    }
  }

  async function submitSecond() {
    if (!secondAnswer.trim()) return
    setLoadingScore(true)
    setPhase('scoring')
    try {
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请对这道思维训练题的两次作答进行综合评分。

题目：${currentQ?.text}

第一次作答：${firstAnswer}

第二次作答：${secondAnswer}

请只返回 JSON：
{
  "first":{"total":0-100,"structure":0-30,"logic":0-30,"accuracy":0-25,"completion":0-15},
  "second":{"total":0-100,"structure":0-30,"logic":0-30,"accuracy":0-25,"completion":0-15},
  "comparison":"两次对比分析，必须具体说明结构和逻辑变化",
  "firstFeedback":"第一次具体问题",
  "secondFeedback":"第二次具体问题",
  "advice":"针对性改进建议",
  "rewriteExample":"把学生回答改写成更好的 PREP 表达",
  "standardAnswer":"这道题的高分参考答案，300-500字"
}`,
        }],
        system: `${getCatPersonalityPrompt(user.settings.catPersonality, lang)}
你是 AI 产品经理思维训练评分专家。评分重点是表达结构和思维逻辑。必须给标准答案和改写示范，不能泛泛点评。`,
        maxTokens: 2200,
        apiKey,
        modelMode: user.settings.modelMode,
      })
      const text = extractText(res)
      const match = text.match(/\{[\s\S]*\}/)
      const result = match ? JSON.parse(match[0]) : fallbackTrainingResult()
      finishScoring(result)
    } catch {
      finishScoring(fallbackTrainingResult())
      setError('API 暂时不可用，已用本地模板保存本次练习。')
    } finally {
      setLoadingScore(false)
    }
  }

  function finishScoring(result) {
    setScoring(result)
    const combinedScore = Math.round((result.first.total + result.second.total) / 2)
    const record = {
      questionId: currentQ.id,
      question: currentQ.text,
      source: currentQ.source,
      type: currentQ.type || 'thinking',
      firstAnswer,
      secondAnswer,
      score1: result.first.total,
      score2: result.second.total,
      score: combinedScore,
      feedback: result,
      date: new Date().toISOString().slice(0, 10),
    }
    addTrainingResult(record)
    addLearningRecord({
      type: 'training',
      title: currentQ.text,
      source: '思维训练',
      question: currentQ.text,
      answer: secondAnswer,
      score: combinedScore,
      feedback: result,
      raw: record,
    })
    if (combinedScore >= 80) addFish(3)
    else if (combinedScore >= 60) addFish(2)
    addExp(8)

    if (combinedScore < 60) {
      const typeKey = currentQ.type || 'thinking'
      const recentSameType = [record, ...training.questionHistory]
        .filter(h => (h.type || 'thinking') === typeKey && Math.round(((h.score1 || 0) + (h.score2 || 0)) / 2) < 60)
        .slice(0, 3)
      if (recentSameType.length >= 3) lockTrainingType(typeKey, recentSameType)
    }
  }

  function handleSaveQuestion() {
    if (!currentQ) return
    saveQuestion({ questionId: currentQ.id, question: currentQ.text, source: currentQ.source, type: currentQ.type, from: 'training' })
  }

  async function copyCurrentToGPT() {
    await copyText(buildTaskPrompt({
      question: currentQ?.text,
      answer: `第一次作答：${firstAnswer}\n\n第二次作答：${secondAnswer}`,
      feedback: scoring,
    }))
    setCopied(true)
    setTimeout(() => setCopied(false), 1400)
  }

  if ((training.locked || (training.lockedTypes || []).length > 0) && phase !== 'scoring') {
    const locked = (training.lockedTypes || [])[0] || { type: 'thinking', questions: training.wrongBook?.slice(0, 3) || [] }
    return (
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="card p-6 text-center space-y-3 border-red-200 bg-red-50">
          <Lock size={40} className="mx-auto text-red-400" />
          <div className="font-bold text-lg">思维训练已锁定</div>
          <div className="text-sm text-gray-600">同类型题目连续低分 3 次，需要先完成「专项攻破」再继续练习。</div>
        </div>
        <div className="card p-5 space-y-3">
          <div className="font-bold text-sm">导致锁定的题目：{locked.type}</div>
          {(locked.questions || []).map((item, i) => (
            <div key={item.questionId || i} className="rounded-xl bg-red-50 p-3 text-xs text-gray-700">
              <b>第 {i + 1} 道：</b>{item.question || item.text || item.title}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Link
            className="btn-primary text-center"
            to="/breakthrough"
            state={{ unlockType: locked.type, wrongQuestions: locked.questions || [] }}
          >
            找爆破猫咪解锁
          </Link>
          <button className="btn-ghost" onClick={() => setTrainingLocked(false)}>我先临时返回</button>
        </div>
      </div>
    )
  }

  return (
      <div className="max-w-xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="section-title text-xl">思维训练</h1>
          {phase === 'idle' && <button onClick={startNewQuestion} className="btn-primary">开始新题</button>}
        </div>

      {phase === 'idle' && (
        <div className="card p-10 text-center space-y-4">
          <ClayIcon name="training" className="empty-clay-icon mx-auto" alt="" />
          <div className="font-bold text-gray-600">准备好了吗？点击开始新一题。</div>
          <div className="text-xs text-gray-400">重点练习先结论、再结构、再论证。</div>
        </div>
      )}

      {phase === 'first' && currentQ && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card p-5 space-y-4">
          <span className="tag bg-blue-100 text-blue-700">{currentQ.source}</span>
          <p className="font-bold text-sm leading-relaxed">{currentQ.text}</p>
          <textarea className="input-base min-h-[130px] resize-none" placeholder="写下你的第一反应，训练快速组织思路..." value={firstAnswer} onChange={e => setFirstAnswer(e.target.value)} />
          <button onClick={submitFirst} className="btn-primary w-full" disabled={!firstAnswer.trim()}>提交第一次作答</button>
        </motion.div>
      )}

      {phase === 'second' && currentQ && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="card p-4 border-blue-200 bg-blue-50/60">
            <div className="text-xs font-bold text-blue-700 mb-2">原题</div>
            <p className="text-sm font-bold leading-relaxed text-gray-700">{currentQ.text}</p>
          </div>

          <div className="card p-4 bg-amber-50 border-amber-200">
            <div className="text-xs font-bold text-amber-700 mb-2">第一次作答</div>
            <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{firstAnswer}</p>
          </div>

          <div className="card p-5 space-y-4 border-purple-200 bg-purple-50/30">
            <div>
              <div className="font-bold text-sm text-purple-700">第二次作答：深度思考</div>
              <div className="text-xs text-gray-500">这次可以用 PREP、时间线或分层框架重写。</div>
            </div>

            {catMessages.length > 0 && (
              <div className="space-y-2 rounded-xl bg-white/70 p-3 max-h-48 overflow-y-auto">
                {catMessages.map((m, i) => (
                  <div key={i} className={`flex gap-2 text-xs ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {m.role === 'assistant' && <BlinkingClayMascot type="oldcat" className="oldcat-message-mascot" />}
                    <div className={`rounded-xl px-2.5 py-1.5 max-w-[80%] ${m.role === 'user' ? 'bg-primary text-white' : 'bg-border-light'}`}>{m.content}</div>
                  </div>
                ))}
                {catLoading && <div className="text-xs text-gray-400">老猫正在想...</div>}
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => {
                if (catMessages.length === 0) setCatMessages([{ role: 'assistant', content: `我们先看题目想考什么：${currentQ.text.slice(0, 34)}... 你可以先说结论，再补理由和例子。` }])
              }} className="btn-ghost flex items-center justify-center gap-2">
                <BlinkingClayMascot type="oldcat" className="inline-oldcat-mascot" /> 召唤老猫
              </button>
              <button onClick={copyCurrentToGPT} className="btn-ghost flex items-center justify-center gap-2">
                {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? '已复制' : '复制给 GPT'}
              </button>
            </div>

            {catMessages.length > 0 && (
              <div className="flex gap-2">
                <input className="input-base flex-1 text-sm py-2" placeholder="问老猫..." value={catInput} onChange={e => setCatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendCatMessage()} />
                <button onClick={sendCatMessage} className="btn-primary px-3"><Send size={15} /></button>
              </div>
            )}

            <div className="relative">
              <textarea className="input-base min-h-[130px] resize-none pr-11" placeholder="写下你的第二次答案，可以更完整..." value={secondAnswer} onChange={e => setSecondAnswer(e.target.value)} />
              {user.settings.voiceEnabled && (
                <button type="button" onClick={secondVoice.toggle} className={`absolute bottom-3 right-3 rounded-full p-1.5 ${secondVoice.listening ? 'bg-primary text-white' : 'text-gray-400 hover:bg-border-light'}`}>
                  {secondVoice.listening ? <MicOff size={15} /> : <Mic size={15} />}
                </button>
              )}
            </div>
            <button onClick={submitSecond} disabled={!secondAnswer.trim()} className="btn-primary w-full">提交第二次作答</button>
          </div>
        </motion.div>
      )}

      {phase === 'scoring' && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="flex items-center gap-3">
            <BlinkingClayMascot type="oldcat" className="report-oldcat-mascot" />
            <h2 className="font-black text-xl text-primary">老猫综合评分来了</h2>
          </div>

          {loadingScore ? (
            <div className="card p-10 text-center">
              <div className="flex gap-2 justify-center mb-3">{[0,1,2].map(i => <span key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
              <div className="text-sm text-gray-400">老猫正在认真阅读你的答案...</div>
            </div>
          ) : error ? (
            <div className="card p-4 text-amber-600 text-sm">{error}</div>
          ) : scoring && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleSaveQuestion} className="btn-ghost flex items-center justify-center gap-2">
                  {isQuestionSaved ? <Bookmark size={16} fill="currentColor" /> : <BookmarkPlus size={16} />} {isQuestionSaved ? '已收藏' : '收藏题目'}
                </button>
                <button onClick={copyCurrentToGPT} className="btn-ghost flex items-center justify-center gap-2">
                  {copied ? <Check size={15} /> : <Copy size={15} />} {copied ? '已复制' : '复制给 GPT'}
                </button>
              </div>

              <ScoreCard label="第一次作答" score={scoring.first.total} dimensions={{ 表达结构: scoring.first.structure, 逻辑深度: scoring.first.logic, 内容准确: scoring.first.accuracy, 完成度: scoring.first.completion }} />
              <ScoreCard label="第二次作答" score={scoring.second.total} dimensions={{ 表达结构: scoring.second.structure, 逻辑深度: scoring.second.logic, 内容准确: scoring.second.accuracy, 完成度: scoring.second.completion }} color="purple" />

              <div className="card p-5 space-y-4">
                <div className="font-bold text-sm text-primary">老猫详细点评</div>
                {scoring.comparison && <FeedbackBlock title="两次对比分析" text={scoring.comparison} />}
                {scoring.firstFeedback && <FeedbackBlock title="第一次具体问题" text={scoring.firstFeedback} tone="amber" />}
                {scoring.secondFeedback && <FeedbackBlock title="第二次具体问题" text={scoring.secondFeedback} tone="purple" />}
                {scoring.advice && <FeedbackBlock title="针对性改进建议" text={scoring.advice} tone="green" />}
                {scoring.rewriteExample && <FeedbackBlock title="改写示范" text={scoring.rewriteExample} tone="blue" />}
                {scoring.standardAnswer && <FeedbackBlock title="参考答案" text={scoring.standardAnswer} tone="blue" />}
              </div>

              <div className="card p-3 flex items-center gap-3 bg-amber-50 border-amber-200">
                <span className="text-2xl">🐟</span>
                <div>
                  <div className="font-bold text-sm text-amber-700">+{Math.round((scoring.first.total + scoring.second.total) / 2) >= 80 ? 3 : 2} 小鱼干</div>
                  <div className="text-xs text-amber-600">答题奖励已发放</div>
                </div>
              </div>

              <button onClick={() => setPhase('idle')} className="btn-primary w-full">下一题</button>
              <button onClick={openChatGPT} className="btn-ghost w-full flex items-center justify-center gap-2"><ExternalLink size={15} /> 去 GPT 深入讨论</button>
            </>
          )}
        </motion.div>
      )}
      </div>
  )
}

function FeedbackBlock({ title, text, tone = 'plain' }) {
  const classes = {
    plain: 'bg-bg-light',
    amber: 'bg-amber-50',
    purple: 'bg-purple-50',
    green: 'bg-green-50',
    blue: 'bg-blue-50',
  }
  return (
    <div className={`${classes[tone]} rounded-xl p-3`}>
      <div className="text-xs font-bold mb-1.5 text-primary">{title}</div>
      <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{text}</p>
    </div>
  )
}

function fallbackTrainingResult() {
  return {
    first: { total: 62, structure: 17, logic: 18, accuracy: 17, completion: 10 },
    second: { total: 70, structure: 21, logic: 20, accuracy: 18, completion: 11 },
    comparison: '第二次比第一次更完整，但仍然需要更清楚地先给结论，并把每个维度之间的关系讲出来。',
    firstFeedback: '第一次回答有观点，但结构偏散，面试官需要自己帮你归纳重点。',
    secondFeedback: '第二次回答更有层次，但论证还不够具体，缺少案例或指标支撑。',
    advice: '下一次先用一句话定主旨，再按 3 个维度展开，每个维度都补一句为什么。',
    rewriteExample: '我认为这个问题可以从用户价值、业务目标和技术可行性三层回答。首先看用户价值，因为 AI 产品必须解决真实任务；其次看业务目标，因为增长或留存决定优先级；最后看技术可行性，因为模型能力和成本会影响落地方案。',
    standardAnswer: '高分答案应先明确结论，再分层展开。以 AI Agent 商业成功为例，我会从用户价值、业务结果和可持续壁垒三个维度衡量。用户价值看任务完成率、复用率和用户节省时间；业务结果看付费转化、留存、ARPU 或企业续费率；可持续壁垒看数据闭环、场景深度和工作流嵌入程度。最后再强调，单纯有技术亮点不等于商业成功，真正成功的 AI 产品必须在高频场景中稳定创造价值，并能用指标持续验证。',
  }
}

import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, BookmarkPlus, Check, Clock, Copy, ExternalLink, Pause, Send } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { callClaude, extractText, getCatPersonalityPrompt } from '../../utils/claude'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import InterviewerClay from '../../components/Interviewers/InterviewerClay'
import VoiceInputButton from '../../components/VoiceInput/VoiceInputButton'
import { buildInterviewPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'
import { XP_REWARDS, FISH_REWARDS } from '../../config/growthRules'

const INTERVIEWERS = [
  { mbti: 'INTJ', name: '司马', nameEn: 'Sima', color: '#2A2A2A', desc: '极度理性，只问关键问题，沉默多', descEn: 'Rational and sharp', stress: 3 },
  { mbti: 'INTP', name: '爱因', nameEn: 'Ein', color: '#7A8FA0', desc: '喜欢追问逻辑，对不严谨的回答穷追不舍', descEn: 'Logic challenger', stress: 2 },
  { mbti: 'ENTJ', name: '凯撒', nameEn: 'Caesar', color: '#C8622A', desc: '强势主导，压力面，质疑每个观点', descEn: 'High pressure', stress: 5 },
  { mbti: 'ENTP', name: '苏格', nameEn: 'Soc', color: '#E8923A', desc: '爱打断，抛出刁钻问题，喜欢辩论', descEn: 'Debater', stress: 4 },
  { mbti: 'INFJ', name: '雅典', nameEn: 'Athena', color: '#9B7FA0', desc: '关注价值观和动机，问题很有深度', descEn: 'Deep values', stress: 2 },
  { mbti: 'INFP', name: '月白', nameEn: 'Blanc', color: '#D4A878', desc: '温柔鼓励型，适合初期练习', descEn: 'Gentle', stress: 1 },
  { mbti: 'ENFJ', name: '小橘', nameEn: 'Citrus', color: '#E8922A', desc: '热情，喜欢引导你说更多', descEn: 'Guiding', stress: 2 },
  { mbti: 'ENFP', name: '卡布', nameEn: 'Kab', color: '#FF8FAB', desc: '话很多，跳跃性强，节奏快', descEn: 'Fast paced', stress: 3 },
  { mbti: 'ISTJ', name: '康德', nameEn: 'Kant', color: '#6A7FA0', desc: '按部就班，非常在意细节和规范', descEn: 'Detail focused', stress: 3 },
  { mbti: 'ISFJ', name: '暖暖', nameEn: 'Nuan', color: '#C8A87A', desc: '和善，但会反复确认答案是否真实', descEn: 'Gentle verifier', stress: 1 },
  { mbti: 'ESTJ', name: '将军', nameEn: 'General', color: '#4A6A8A', desc: '强调结果导向，不喜欢废话', descEn: 'Result oriented', stress: 4 },
  { mbti: 'ESFJ', name: '糖糖', nameEn: 'Sugar', color: '#FF8FAB', desc: '表面和蔼，会突然问到核心痛点', descEn: 'Friendly but sharp', stress: 3 },
  { mbti: 'ISTP', name: '沃兹', nameEn: 'Woz', color: '#C0C8D0', desc: '话很少，只说关键词，需要你自己展开', descEn: 'Minimalist', stress: 3 },
  { mbti: 'ISFP', name: '森森', nameEn: 'Sen', color: '#A0C8A0', desc: '安静观察型，偶尔问一个意外的问题', descEn: 'Observer', stress: 2 },
  { mbti: 'ESTP', name: '闪电', nameEn: 'Flash', color: '#E8923A', desc: '节奏极快，连续追问，不给喘息', descEn: 'Rapid fire', stress: 5 },
  { mbti: 'ESFP', name: '阳阳', nameEn: 'Yang', color: '#FFD700', desc: '轻松愉快，暗藏考点', descEn: 'Light but tricky', stress: 3 },
]

const DURATIONS = [15, 30, 60]
const QUESTION_SECONDS = 180
const MAX_FOLLOW_UPS = 2

function InterviewerCat({ interviewer, size = 60 }) {
  return <InterviewerClay interviewer={interviewer} size={size} />
}

function StressBar({ level }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-gray-400">压力:</span>
      {[1,2,3,4,5].map(i => <div key={i} className={`w-3 h-3 rounded-full ${i <= level ? 'bg-red-400' : 'bg-border-light'}`} />)}
    </div>
  )
}

function formatTime(sec) {
  return `${Math.floor(sec / 60).toString().padStart(2, '0')}:${(sec % 60).toString().padStart(2, '0')}`
}

export default function Interview() {
  const { user, interview, addInterviewResult, addFish, addExp, saveQuestion, savedQuestions = [], addLearningRecord } = useStore()
  const lang = user.settings.language
  const apiKey = user.settings.apiKey
  const [phase, setPhase] = useState('setup')
  const [selectedDuration, setSelectedDuration] = useState(30)
  const [selectedInterviewer, setSelectedInterviewer] = useState(INTERVIEWERS[2])
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [timeLeft, setTimeLeft] = useState(0)
  const [questionTime, setQuestionTime] = useState(QUESTION_SECONDS)
  const [paused, setPaused] = useState(false)
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [generatingReport, setGeneratingReport] = useState(false)
  const [savedQIds, setSavedQIds] = useState(new Set())
  const [copiedId, setCopiedId] = useState('')
  const bottomRef = useRef(null)
  const endingRef = useRef(false)
  const interviewer = selectedInterviewer || INTERVIEWERS[2]
  const interviewHistory = Array.isArray(interview?.history) ? interview.history : []
  const savedQuestionList = Array.isArray(savedQuestions) ? savedQuestions : []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, loading])

  useEffect(() => {
    if (phase !== 'session' || paused) return
    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timer)
          endInterview()
          return 0
        }
        return t - 1
      })
      if (hasOpenQuestion(messages)) {
        setQuestionTime(t => {
          if (t <= 1) {
            submitAnswer(true)
            return QUESTION_SECONDS
          }
          return t - 1
        })
      }
    }, 1000)
    return () => clearInterval(timer)
  }, [phase, paused, messages, input])

  function hasOpenQuestion(msgs) {
    return msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant' && !loading
  }

  function startInterview() {
    setPhase('session')
    setMessages([])
    setReport(null)
    setInput('')
    setTimeLeft(selectedDuration * 60)
    endingRef.current = false
    askNextQuestion([])
  }

  function countFollowUpsAfterLastMain(msgs) {
    let count = 0
    for (let i = msgs.length - 1; i >= 0; i--) {
      const message = msgs[i]
      if (message.role !== 'assistant') continue
      if (message.questionKind === 'followup') count += 1
      else break
    }
    return count
  }

  function getInterviewTranscript(msgs) {
    return msgs.map((m, index) => {
      const speaker = m.role === 'assistant' ? '面试官' : '候选人'
      const tag = m.role === 'assistant' ? `（${m.questionKind === 'followup' ? '追问' : '主问题'}）` : ''
      return `${index + 1}. ${speaker}${tag}：${m.content}`
    }).join('\n')
  }

  async function askNextQuestion(currentMessages) {
    if (endingRef.current) return
    setLoading(true)
    try {
      const hasHistory = currentMessages.length > 0
      const followUps = countFollowUpsAfterLastMain(currentMessages)
      const transcript = getInterviewTranscript(currentMessages)
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: hasHistory
            ? `这是目前的面试记录：\n${transcript}\n\n请基于候选人的最后一个回答，决定下一句话怎么问。`
            : '请提出第一个 AI 产品经理模拟面试问题。',
        }],
        system: `你正在扮演 AI 产品经理面试官「${interviewer.name}」，MBTI ${interviewer.mbti}，风格：${interviewer.desc}。

你的目标是模拟真实面试，不是顺序念题库。

规则：
1. 第一个问题必须是主问题，考察 AI 产品经理能力。
2. 候选人回答后，先判断他的回答是否有效。
3. 如果候选人回答很短、敷衍、跑题、情绪化、调侃、表白、说不知道、没有结构、没有案例或缺少关键判断，必须追问上一题，要求他重答或补充。
4. 如果回答有价值但缺少细节，也优先追问：追数据、用户研究方法、取舍依据、AI 技术理解、风险、指标、落地步骤。
5. 同一个主问题最多追问 ${MAX_FOLLOW_UPS} 次。当前已经连续追问 ${followUps} 次；如果已达到上限并且候选人不是完全无效回答，可以切到新的主问题。
6. 新主问题要覆盖不同能力维度：产品判断、用户研究、数据分析、AI 技术理解、商业逻辑、表达结构。
7. 问题要像真人面试官一样具体，避免泛泛而谈。
8. 只输出 JSON，不要 Markdown，不要解释。

JSON 格式：
{
  "kind": "main" 或 "followup",
  "question": "你要问候选人的一句中文问题",
  "reason": "内部原因，简短说明为什么追问或切题"
}`,
        maxTokens: 420,
        apiKey,
        modelMode: user.settings.modelMode,
      })
      const text = extractText(res)
      const match = text.match(/\{[\s\S]*\}/)
      const parsed = match ? JSON.parse(match[0]) : null
      const kind = parsed?.kind === 'followup' ? 'followup' : 'main'
      const question = parsed?.question || text
      pushQuestion(question, kind, parsed?.reason || '')
    } catch {
      const fallbackKind = currentMessages.length > 0 ? 'followup' : 'main'
      pushQuestion(
        currentMessages.length > 0
          ? '你刚才的回答还不够像面试答案。请重新用「目标-方法-判断标准-风险」四步补充一下。'
          : '请结合一个 AI 产品案例，说明你会如何判断它是否真正解决了用户痛点？',
        fallbackKind
      )
    } finally {
      setLoading(false)
    }
  }

  function pushQuestion(question, questionKind = 'main', followupReason = '') {
    setQuestionTime(QUESTION_SECONDS)
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: question,
      questionId: `iv_${Date.now()}`,
      questionKind,
      followupReason,
    }])
  }

  async function submitAnswer(auto = false) {
    if ((loading || paused) && !auto) return
    if (!hasOpenQuestion(messages)) return
    const answer = input.trim() || (auto ? '（3分钟内未完成作答）' : '')
    if (!answer) return
    const newMessages = [...messages, { role: 'user', content: answer }]
    setInput('')
    setMessages(newMessages)
    if (timeLeft <= 10) {
      endInterview(newMessages)
    } else {
      await askNextQuestion(newMessages)
    }
  }

  async function endInterview(finalMessages = messages) {
    if (endingRef.current) return
    endingRef.current = true
    setPhase('report')
    setGeneratingReport(true)
    const transcript = finalMessages.map(m => `${m.role === 'assistant' ? '面试官' : '我'}：${m.content}`).join('\n\n')
    try {
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请对这场 AI 产品经理模拟面试进行逐题复盘。

面试官：${interviewer.name} (${interviewer.mbti})

面试记录：
${transcript}

请只返回 JSON：
{
  "totalScore":0-100,
  "questions":[
    {
      "question":"",
      "answer":"",
      "intent":"面试官想考察什么方向",
      "score":0-100,
      "scoreDetail":{"structure":0-30,"logic":0-30,"productJudgment":0-25,"communication":0-15},
      "comment":"具体点评",
      "betterAnswer":"更好的面试口语版参考答案"
    }
  ],
  "overall":"整场总结",
  "strengths":["具体优点"],
  "weaknesses":["具体不足"],
  "advice":"下一次面试训练建议"
}`,
        }],
        system: `${getCatPersonalityPrompt(user.settings.catPersonality, lang)}
你是 AI 产品经理面试官和面试教练。必须逐题复盘，每题说明考察点、候选人回答、评分、具体问题和参考答案。评分尤其关注表达结构、思维逻辑、产品判断和沟通感。`,
        maxTokens: 3200,
        apiKey,
        modelMode: user.settings.modelMode,
      })
      const text = extractText(res)
      const match = text.match(/\{[\s\S]*\}/)
      const result = match ? JSON.parse(match[0]) : fallbackReport(finalMessages, interviewer)
      finishReport(result)
    } catch {
      finishReport(fallbackReport(finalMessages, interviewer))
    } finally {
      setGeneratingReport(false)
    }
  }

  function finishReport(result) {
    const normalized = {
      ...result,
      interviewer: `${interviewer.name} (${interviewer.mbti})`,
      date: new Date().toISOString().slice(0, 10),
      questions: normalizeQuestions(result.questions, messages),
    }
    setReport(normalized)
    addInterviewResult(normalized)
    addLearningRecord({
      type: 'interview',
      title: `模拟面试 - ${interviewer.name}`,
      source: '模拟面试',
      score: normalized.totalScore,
      feedback: normalized,
      raw: normalized,
    })
    addFish(FISH_REWARDS.mockInterview)
    addExp(XP_REWARDS.mockInterview)
  }

  function normalizeQuestions(questions = [], sourceMessages = messages) {
    const pairs = []
    sourceMessages.forEach((m, i) => {
      if (m.role === 'assistant') {
        const answer = sourceMessages[i + 1]?.role === 'user' ? sourceMessages[i + 1].content : ''
        const scored = questions[pairs.length] || {}
        pairs.push({
          questionId: m.questionId || `iv_${i}`,
          questionKind: m.questionKind || 'main',
          followupReason: m.followupReason || '',
          question: scored.question || m.content,
          answer: scored.answer || answer,
          ...scored,
        })
      }
    })
    return pairs.length ? pairs : questions
  }

  function handleSaveQuestion(q) {
    saveQuestion({ questionId: q.questionId, question: q.question, source: `模拟面试 · ${interviewer.name}`, type: 'interview', from: 'interview' })
    setSavedQIds(prev => new Set([...prev, q.questionId]))
  }

  async function copyQuestion(q) {
    await copyText(`请帮我复盘这道 AI 产品经理面试题。

【题目】
${q.question}

【我的回答】
${q.answer || '未作答'}

请分析：
1. 面试官想考察什么
2. 我的表达结构和逻辑问题
3. 更好的回答框架
4. 给一版面试口语参考答案`)
    setCopiedId(q.questionId)
    setTimeout(() => setCopiedId(''), 1200)
  }

  async function copyWholeInterview() {
    await copyText(buildInterviewPrompt(report))
    setCopiedId('whole')
    setTimeout(() => setCopiedId(''), 1200)
  }

  if (phase === 'setup') {
    return (
        <div className="interview-setup-shell">
          <aside className="interview-record-side card">
            <div className="interview-record-side-title">面试记录</div>
            {interviewHistory.length === 0 ? (
              <p>完成一次模拟面试后，整场问题、回答和评分会放在这里。</p>
            ) : (
              <div className="interview-record-side-list">
                {interviewHistory.slice(0, 4).map((item, index) => (
                  <Link key={item.id || `${item.date}_${index}`} to="/archive/interviews">
                    <strong>{item.interviewer || `第 ${index + 1} 次面试`}</strong>
                    <span>{item.date || ''} · {item.totalScore ?? '-'}分</span>
                  </Link>
                ))}
              </div>
            )}
            <Link to="/archive/interviews" className="interview-record-side-more">查看全部面试记录</Link>
          </aside>
          <div className="max-w-2xl mx-auto space-y-6 interview-setup-main">
          <h1 className="section-title text-xl">面试模拟</h1>
          <div className="card p-5 space-y-3">
            <div className="font-bold text-sm">选择时长</div>
            <div className="flex gap-3">
              {DURATIONS.map(d => (
                <button key={d} onClick={() => setSelectedDuration(d)} className={`flex-1 py-3 rounded-xl font-bold text-sm border ${selectedDuration === d ? 'bg-primary text-white border-primary' : 'border-border-light hover:bg-border-light'}`}>{d}分钟</button>
              ))}
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-sm">选择面试官</div>
              <button onClick={() => setSelectedInterviewer(INTERVIEWERS[Math.floor(Math.random() * INTERVIEWERS.length)])} className="text-xs text-primary hover:underline">随机分配</button>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-52 overflow-y-auto">
              {INTERVIEWERS.map(iv => (
                <button key={iv.mbti} onClick={() => setSelectedInterviewer(iv)} className={`p-2 rounded-xl border text-center ${selectedInterviewer?.mbti === iv.mbti ? 'border-primary bg-primary/10' : 'border-border-light hover:bg-border-light'}`}>
                  <InterviewerCat interviewer={iv} size={58} />
                  <div className="text-[10px] font-bold mt-1">{iv.name}</div>
                  <div className="text-[9px] text-gray-400">{iv.mbti}</div>
                </button>
              ))}
            </div>
          </div>
          <div className="card p-5 flex gap-4 items-center">
            <InterviewerCat interviewer={interviewer} size={96} />
            <div className="flex-1 space-y-2">
              <div className="font-bold">{interviewer.name} <span className="text-xs text-gray-400 font-normal ml-1">{interviewer.mbti}</span></div>
              <div className="text-xs text-gray-600">{interviewer.desc}</div>
              <StressBar level={interviewer.stress} />
            </div>
          </div>
          <button onClick={startInterview} className="btn-primary w-full py-3 text-base font-bold">开始面试</button>
          </div>
        </div>
    )
  }

  if (phase === 'session') {
    return (
      <div className="interview-session-page max-w-2xl mx-auto flex flex-col h-[calc(100vh-120px)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${paused ? 'bg-yellow-400' : 'bg-green-400 animate-pulse'}`} />
            <span className="text-xs font-semibold text-gray-500">面试进行中</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`font-black ${questionTime < 30 ? 'text-red-500 animate-pulse' : 'text-primary'}`}><Clock size={15} className="inline mr-1" />本题 {formatTime(questionTime)}</span>
            <span className="font-black text-gray-500">总时长 {formatTime(timeLeft)}</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3 pb-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && <InterviewerCat interviewer={interviewer} size={46} />}
              <div className={`interview-message-bubble max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'interview-message-bubble-user bg-primary text-white rounded-tr-sm' : 'interview-message-bubble-assistant bg-card-light border border-border-light rounded-tl-sm'}`}>
                {m.role === 'assistant' && (
                  <div className="mb-0.5 flex items-center gap-2 text-[10px] font-bold text-gray-400">
                    <span>{interviewer.name} 问：</span>
                    {m.questionKind === 'followup' && <span className="interview-followup-pill">追问</span>}
                  </div>
                )}
                {m.content}
              </div>
            </div>
          ))}
          {loading && <div className="text-xs text-gray-400">面试官正在追问...</div>}
          <div ref={bottomRef} />
        </div>
        <div className="space-y-2 border-t border-border-light pt-4">
          <div className="relative">
            <textarea className="input-base min-h-[88px] resize-none pr-12" placeholder="请在 3 分钟内作答，尽量像真实面试一样口述..." value={input} onChange={e => setInput(e.target.value)} disabled={paused || loading} />
            <VoiceInputButton
              enabled={user.settings.voiceEnabled}
              lang={lang}
              onText={text => setInput(prev => `${prev}${prev ? ' ' : ''}${text}`)}
              className="absolute bottom-3 right-3"
            />
          </div>
          <div className="flex gap-2">
            <button onClick={() => setPaused(p => !p)} className="px-4 py-2 rounded-xl text-sm font-semibold border border-border-light hover:bg-border-light"><Pause size={14} className="inline mr-1.5" />{paused ? '继续' : '暂停'}</button>
            <button onClick={() => submitAnswer(false)} disabled={!input.trim() || loading || paused} className="btn-primary flex-1 flex items-center justify-center gap-2"><Send size={15} />提交回答</button>
            <button onClick={() => endInterview()} className="px-4 py-2 rounded-xl text-xs text-gray-400 border border-border-light hover:bg-red-50 hover:text-red-500">结束</button>
          </div>
        </div>
      </div>
    )
  }

  if (phase === 'report') {
    return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <BlinkingClayMascot type="oldcat" className="report-oldcat-mascot" />
          <h2 className="font-black text-xl text-primary">面试总结报告</h2>
        </div>
        {generatingReport ? (
          <div className="card p-10 text-center space-y-3">
            <div className="flex gap-2 justify-center">{[0,1,2].map(i => <span key={i} className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}</div>
            <div className="text-sm text-gray-400">老猫正在生成逐题复盘...</div>
          </div>
        ) : report && (
          <>
            <div className="card p-6 text-center space-y-2">
              <div className="text-xs text-gray-400 uppercase tracking-wide">综合得分</div>
              <div className={`font-black text-6xl ${report.totalScore >= 80 ? 'text-green-500' : report.totalScore >= 60 ? 'text-amber-500' : 'text-red-500'}`}>{report.totalScore}</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={copyWholeInterview} className="btn-ghost flex items-center justify-center gap-2"><Copy size={15} />{copiedId === 'whole' ? '已复制' : '复制整场复盘'}</button>
              <button onClick={openChatGPT} className="btn-ghost flex items-center justify-center gap-2"><ExternalLink size={15} />去 GPT</button>
            </div>
            {report.questions?.map((q, i) => {
              const isSaved = savedQIds.has(q.questionId) || savedQuestionList.some(sq => sq.questionId === q.questionId)
              return (
                <div key={q.questionId || i} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <div className="text-xs text-gray-400 mb-1">第 {i + 1} 题</div>
                      <p className="font-bold text-sm leading-snug">{q.question}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleSaveQuestion(q)} className={`p-1.5 rounded-full ${isSaved ? 'bg-primary/20 text-primary' : 'text-gray-400 hover:bg-border-light'}`}>{isSaved ? <Bookmark size={14} fill="currentColor" /> : <BookmarkPlus size={14} />}</button>
                      <div className={`score-badge text-sm ${q.score >= 80 ? 'bg-green-100 text-green-700' : q.score >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-600'}`}>{q.score}</div>
                    </div>
                  </div>
                  <InfoBlock title="考察方向" text={q.intent || '考察产品判断、表达结构和逻辑拆解能力。'} />
                  <InfoBlock title="我的回答" text={q.answer || '未作答'} />
                  {q.scoreDetail && (
                    <section className="task-score-grid">
                      <div>表达结构 <b>{q.scoreDetail.structure ?? '-'}/30</b></div>
                      <div>逻辑深度 <b>{q.scoreDetail.logic ?? '-'}/30</b></div>
                      <div>产品判断 <b>{q.scoreDetail.productJudgment ?? '-'}/25</b></div>
                      <div>沟通感 <b>{q.scoreDetail.communication ?? '-'}/15</b></div>
                    </section>
                  )}
                  {q.comment && <InfoBlock title="具体点评" text={q.comment} />}
                  {q.betterAnswer && <InfoBlock title="参考答案" text={q.betterAnswer} />}
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => copyQuestion(q)} className="btn-ghost flex items-center justify-center gap-2"><Copy size={14} />{copiedId === q.questionId ? '已复制' : '复制题目和作答'}</button>
                    <button onClick={openChatGPT} className="btn-ghost flex items-center justify-center gap-2"><ExternalLink size={14} />GPT</button>
                  </div>
                </div>
              )
            })}
            <div className="card p-5 space-y-4">
              <div className="font-bold text-sm text-primary">整体表现</div>
              <p className="text-sm leading-relaxed text-gray-700">{report.overall}</p>
              {report.advice && <InfoBlock title="下一次建议" text={report.advice} />}
            </div>
            <div className="card p-3 flex items-center gap-3 bg-amber-50 border-amber-200">
              <span className="text-2xl">🐟</span>
              <div>
                <div className="font-bold text-sm text-amber-700">+{FISH_REWARDS.mockInterview} 小鱼干</div>
                <div className="text-xs text-amber-600">面试完成奖励</div>
              </div>
            </div>
            <button onClick={() => setPhase('setup')} className="btn-primary w-full py-3">再来一场</button>
          </>
        )}
      </div>
    )
  }

  return null
}

function InfoBlock({ title, text }) {
  return (
    <div className="rounded-xl bg-bg-light p-3">
      <div className="text-xs font-bold text-primary mb-1">{title}</div>
      <p className="text-xs leading-relaxed text-gray-700 whitespace-pre-wrap">{text}</p>
    </div>
  )
}

function fallbackReport(messages, interviewer) {
  const questions = []
  messages.forEach((m, i) => {
    if (m.role === 'assistant') {
      questions.push({
        questionId: m.questionId || `iv_${i}`,
        question: m.content,
        answer: messages[i + 1]?.role === 'user' ? messages[i + 1].content : '',
        intent: '考察你能否结构化拆解问题，并把产品判断讲清楚。',
        score: 70,
        scoreDetail: { structure: 20, logic: 20, productJudgment: 18, communication: 12 },
        comment: '回答有基本方向，但需要更明确地先给结论，再分层展开理由，并补充真实案例或指标。',
        betterAnswer: '我会先明确结论，再从用户价值、业务目标和落地约束三层回答。首先说明这个问题影响哪个用户场景，其次说明它如何影响业务指标，最后结合 AI 技术能力和成本判断方案可行性。',
      })
    }
  })
  return {
    totalScore: 70,
    interviewer: `${interviewer.name} (${interviewer.mbti})`,
    questions,
    overall: '整体表达有基础，但结构化程度和产品判断还需要加强。',
    strengths: ['能围绕问题作答'],
    weaknesses: ['缺少案例和指标支撑'],
    advice: '下一次每题先用一句话给结论，再按 2-3 个维度展开，并用一个案例收尾。',
  }
}

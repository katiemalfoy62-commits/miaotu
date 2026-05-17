import React, { useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Check, Copy, ExternalLink, Send, Sparkles, Target } from 'lucide-react'
import ClayMascot from '../../components/Cat/ClayMascot'
import ClayIcon from '../../components/UI/ClayIcon'
import useStore from '../../store/useStore'
import { callClaude, extractText } from '../../utils/claude'
import VoiceInputButton from '../../components/VoiceInput/VoiceInputButton'
import { copyText, openChatGPT } from '../../utils/gptPrompt'
import { XP_REWARDS, FISH_REWARDS } from '../../config/growthRules'

const FALLBACK_TYPES = ['用户洞察', '竞品分析', '商业逻辑', '数据分析', '表达结构', 'AI 技术理解']

function parseJson(text, fallback) {
  try {
    const match = text.match(/\{[\s\S]*\}/)
    return match ? JSON.parse(match[0]) : fallback
  } catch {
    return fallback
  }
}

function fallbackQuestions(seed, type = '专项攻破') {
  const base = seed || '请分析一个 AI 产品的核心价值和市场机会'
  return [
    `${base}。请先用一句话给出结论，再拆解你的判断依据。`,
    `如果把这道题换成面试场景，你会如何用 PREP 结构作答：${base}`,
    `请从用户价值、商业目标、技术可行性三个角度分析：${base}`,
    `请补充一个真实或假设案例，说明你对这类问题的判断：${base}`,
    `请用 2 分钟面试口吻回答，并强调你的表达结构：${base}`,
  ].map((question, index) => ({ id: `fallback_${index}`, question, type }))
}

function fallbackScore(question, answer) {
  const lengthScore = Math.min(25, Math.floor((answer || '').length / 10))
  const structured = /首先|其次|最后|第一|第二|第三|结论|因为|例如|所以|PREP/i.test(answer || '') ? 18 : 10
  const total = Math.min(88, 42 + lengthScore + structured)
  return {
    total,
    scoreDetail: {
      expression: Math.min(30, structured + 6),
      logic: Math.min(30, structured + 5),
      accuracy: Math.min(25, 12 + Math.floor(lengthScore / 2)),
      completion: Math.min(15, 8 + Math.floor(lengthScore / 4)),
    },
    comment: total >= 80 ? '结构已经比较清晰，可以继续补充更具体的案例和指标。' : '回答有方向，但需要更明确地先给结论，再用分层理由支撑观点。',
    advice: '下一次先用一句话定主旨，再按“理由-例子-总结”展开。尤其注意把你的判断依据说清楚，而不是只罗列名词。',
    standardAnswer: `我会先给结论：这类问题的关键不是把概念讲全，而是证明自己能结构化判断。以“${question}”为例，可以先说明核心观点，再从用户价值、业务目标、落地约束三个维度展开。用户价值决定产品是否真实解决问题，业务目标决定优先级和收益，落地约束决定方案是否可执行。最后回扣：好的 AI PM 作答要让面试官看到清晰结论、因果链和可落地判断。`,
  }
}

export default function Breakthrough() {
  const location = useLocation()
  const {
    user,
    addBreakthroughSession,
    addLearningRecord,
    addFish,
    addExp,
    unlockTrainingType,
  } = useStore()
  const lang = user.settings.language

  const unlockPayload = location.state || {}
  const isUnlock = Boolean(unlockPayload.unlockType)
  const [seed, setSeed] = useState(unlockPayload.seed || (unlockPayload.wrongQuestions || []).map(q => q.question || q.text).filter(Boolean).join('\n'))
  const [type, setType] = useState(unlockPayload.unlockType || '专项攻破')
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [answer, setAnswer] = useState('')
  const [results, setResults] = useState([])
  const [phase, setPhase] = useState('setup')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const currentQuestion = questions[index]
  const average = useMemo(() => {
    if (!results.length) return 0
    return Math.round(results.reduce((sum, item) => sum + (item.score?.total || 0), 0) / results.length)
  }, [results])

  async function generateQuestions() {
    if (!seed.trim() || loading) return
    setLoading(true)
    try {
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请根据这个我觉得有挑战的题目，生成 5 道同类型专项训练题。题目要像 AI 产品经理面试/笔试题，难度递进，但都围绕同一种能力。

原题：
${seed}

只返回 JSON：
{"type":"题型名称","questions":[{"question":"题目1"},{"question":"题目2"},{"question":"题目3"},{"question":"题目4"},{"question":"题目5"}]}`,
        }],
        system: '你是 AI 产品经理专项训练出题官。题目要聚焦同一类能力，不要发散。',
        maxTokens: 1200,
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
      })
      const parsed = parseJson(extractText(res), null)
      const nextType = parsed?.type || type || FALLBACK_TYPES[Math.floor(Math.random() * FALLBACK_TYPES.length)]
      const nextQuestions = (parsed?.questions || []).slice(0, 5).map((q, i) => ({
        id: `breakthrough_${Date.now()}_${i}`,
        question: q.question || String(q),
        type: nextType,
      }))
      setType(nextType)
      setQuestions(nextQuestions.length ? nextQuestions : fallbackQuestions(seed, nextType))
    } catch {
      const nextType = type || '专项攻破'
      setQuestions(fallbackQuestions(seed, nextType))
    } finally {
      setResults([])
      setIndex(0)
      setAnswer('')
      setPhase('answer')
      setLoading(false)
    }
  }

  async function submitAnswer() {
    if (!answer.trim() || !currentQuestion || loading) return
    setLoading(true)
    try {
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请给这次专项训练作答评分。
题型：${currentQuestion.type}
题目：${currentQuestion.question}
我的回答：${answer}

只返回 JSON：
{
  "total":0-100,
  "scoreDetail":{"expression":0-30,"logic":0-30,"accuracy":0-25,"completion":0-15},
  "comment":"具体评价，重点看表达能力和思维结构",
  "advice":"下一次怎么改",
  "standardAnswer":"高分参考答案，250-400字"
}`,
        }],
        system: '你是 AI 产品经理训练教练。评分重点必须放在表达结构和思维逻辑，其次才是内容准确性。',
        maxTokens: 1400,
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
      })
      saveResult(parseJson(extractText(res), fallbackScore(currentQuestion.question, answer)))
    } catch {
      saveResult(fallbackScore(currentQuestion.question, answer))
    } finally {
      setLoading(false)
    }
  }

  function saveResult(score) {
    const nextResults = [...results, { question: currentQuestion.question, answer, score }]
    setResults(nextResults)
    setAnswer('')
    if (index >= questions.length - 1) {
      finish(nextResults)
    } else {
      setIndex(index + 1)
    }
  }

  function finish(finalResults) {
    const avg = Math.round(finalResults.reduce((sum, item) => sum + (item.score?.total || 0), 0) / finalResults.length)
    const session = {
      type,
      seed,
      mode: isUnlock ? 'unlock' : 'practice',
      results: finalResults,
      score: avg,
    }
    addBreakthroughSession(session)
    addLearningRecord({
      type: 'breakthrough',
      title: `${isUnlock ? '解锁挑战' : '专项攻破'} - ${type}`,
      source: '专项攻破',
      question: seed,
      answer: finalResults.map((item, i) => `第 ${i + 1} 题：${item.answer}`).join('\n\n'),
      score: avg,
      feedback: session,
    })
    if (isUnlock && finalResults.every(item => (item.score?.total || 0) >= 80)) {
      unlockTrainingType(unlockPayload.unlockType)
    }
    addFish(FISH_REWARDS.breakthrough)
    addExp(XP_REWARDS.breakthrough)
    setPhase('done')
  }

  async function copyAll() {
    const text = `请帮我复盘这次 AI 产品经理专项训练。\n\n原题/难点：${seed}\n题型：${type}\n\n${results.map((item, i) => `第 ${i + 1} 题：${item.question}\n我的回答：${item.answer}\n得分：${item.score.total}\n点评：${item.score.comment}`).join('\n\n')}`
    await copyText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="breakthrough-page">
      <section className="breakthrough-hero card">
        <div>
          <div className="section-kicker"><Sparkles size={16} /> 专项攻破</div>
          <h1>把一个难点炸成五道小题</h1>
          <p>输入一道你觉得卡住的题，爆破猫咪会生成同类型 5 题。目标不是刷题，而是把表达结构和思维链练稳。</p>
        </div>
        <div className="breakthrough-mascot">
          <ClayMascot type="breakthrough" />
          <span>爆破猫咪</span>
        </div>
      </section>

      {phase === 'setup' && (
        <section className="card breakthrough-card">
          <label>输入挑战题目</label>
          <div className="relative">
            <textarea value={seed} onChange={e => setSeed(e.target.value)} placeholder="把你觉得难的题目粘贴到这里..." />
            <VoiceInputButton
              enabled={user.settings.voiceEnabled}
              lang={lang}
              onText={text => setSeed(prev => `${prev}${prev ? ' ' : ''}${text}`)}
              className="absolute bottom-3 right-3"
            />
          </div>
          {isUnlock && (
            <div className="breakthrough-lock-note">
              这是「{unlockPayload.unlockType}」解锁挑战。连续 5 题都达到 80 分以上即可解锁。
            </div>
          )}
          <button className="btn-primary" onClick={generateQuestions} disabled={!seed.trim() || loading}>
            <Target size={16} /> {loading ? '出题中...' : '生成 5 题专项训练'}
          </button>
        </section>
      )}

      {phase === 'answer' && currentQuestion && (
        <section className="card breakthrough-card">
          <div className="breakthrough-progress">
            <span>{type}</span>
            <strong>第 {index + 1} / {questions.length} 题</strong>
          </div>
          <h2>{currentQuestion.question}</h2>
          <div className="relative">
            <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="先给观点，再解释理由，补例子，最后回扣..." />
            <VoiceInputButton
              enabled={user.settings.voiceEnabled}
              lang={lang}
              onText={text => setAnswer(prev => `${prev}${prev ? ' ' : ''}${text}`)}
              className="absolute bottom-3 right-3"
            />
          </div>
          <button className="btn-primary" onClick={submitAnswer} disabled={!answer.trim() || loading}>
            <Send size={16} /> {loading ? '评分中...' : '提交本题'}
          </button>
        </section>
      )}

      {phase === 'done' && (
        <section className="card breakthrough-card">
          <div className="breakthrough-result-head">
            <div>
              <span>本轮平均分</span>
              <strong>{average}</strong>
            </div>
            <ClayIcon name="training" alt="" />
          </div>
          <div className="breakthrough-results">
            {results.map((item, i) => (
              <article key={`${item.question}_${i}`}>
                <div><b>第 {i + 1} 题</b><span>{item.score.total} 分</span></div>
                <p>{item.question}</p>
                <small>{item.score.comment}</small>
                <details>
                  <summary>查看参考答案</summary>
                  <p>{item.score.standardAnswer}</p>
                </details>
              </article>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-ghost" onClick={copyAll}>{copied ? <Check size={15} /> : <Copy size={15} />} {copied ? '已复制' : '复制给 GPT'}</button>
            <button className="btn-ghost" onClick={openChatGPT}><ExternalLink size={15} /> 打开 GPT</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button className="btn-primary" onClick={() => setPhase('setup')}>再攻破一个难点</button>
            <Link className="btn-ghost text-center" to="/archive">去成长档案</Link>
          </div>
        </section>
      )}
    </div>
  )
}

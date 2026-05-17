import React, { useMemo, useState } from 'react'
import { CheckCircle, RefreshCw, Sparkles, Wand2 } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import VoiceInputButton from '../../components/VoiceInput/VoiceInputButton'
import { callClaude, extractText } from '../../utils/claude'
import { WORKSHOP_IDEAS, PRODUCT_FLOW_STEPS, buildReferenceFlow } from '../../data/workshopIdeas'

function parseJson(text, fallback) {
  try {
    const clean = String(text || '').replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
    return fallback
  }
}

function buildLocalFeedback(idea, answers) {
  const filled = PRODUCT_FLOW_STEPS.filter(step => (answers[step.id] || '').trim().length >= 18)
  const score = Math.min(88, 38 + filled.length * 8)
  const missing = PRODUCT_FLOW_STEPS.filter(step => !(answers[step.id] || '').trim()).map(step => step.title)

  return {
    score,
    summary: filled.length >= 5
      ? '你的流程已经比较完整，下一步可以把 MVP 和验证指标再压实。'
      : '现在更像是想法草稿，先把用户、场景、MVP 和验证方式补齐。',
    orderIssues: missing.length
      ? [`还缺少：${missing.slice(0, 3).join('、')}。产品流程最好先从问题和用户开始，再进入方案。`]
      : ['整体顺序是对的，后续可以把每一步写得更具体。'],
    missingSteps: missing.length ? missing : ['暂无明显缺口'],
    mvpAdvice: `围绕“${idea.scene}”先做一个最小闭环，不要一开始做成全功能平台。`,
    nextTry: '下一轮只改一件事：把目标用户的真实场景写得更窄、更像能立刻验证的任务。',
  }
}

export default function Workshop() {
  const { user, workshop = { sessions: [] }, saveWorkshopSession, addExp, addFish } = useStore()
  const lang = user.settings.language
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [customIdea, setCustomIdea] = useState(null)
  const [answers, setAnswers] = useState({})
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generatingIdea, setGeneratingIdea] = useState(false)
  const [saved, setSaved] = useState(false)
  const [ideaNotice, setIdeaNotice] = useState('')
  const [mobileAnswerOpen, setMobileAnswerOpen] = useState(false)
  const completedFixedIds = useMemo(() => new Set(
    (workshop.sessions || [])
      .filter(session => WORKSHOP_IDEAS.some(item => item.id === session.ideaId))
      .map(session => session.ideaId)
  ), [workshop.sessions])
  const fixedIdea = WORKSHOP_IDEAS[ideaIndex]
  const idea = customIdea || fixedIdea
  const referenceFlow = useMemo(() => buildReferenceFlow(idea), [idea])
  const completedSteps = PRODUCT_FLOW_STEPS.filter(step => (answers[step.id] || '').trim()).length

  function resetDraft() {
    setAnswers({})
    setFeedback(null)
    setSaved(false)
  }

  function updateAnswer(stepId, value) {
    setSaved(false)
    setFeedback(null)
    setAnswers(prev => ({ ...prev, [stepId]: value }))
  }

  function chooseFixedIdea(index) {
    setCustomIdea(null)
    setIdeaIndex(index)
    setIdeaNotice('')
    resetDraft()
    setMobileAnswerOpen(true)
  }

  function pickRandomFixedIdea() {
    const pool = WORKSHOP_IDEAS
      .map((item, index) => ({ item, index }))
      .filter(({ item, index }) => index !== ideaIndex && !completedFixedIds.has(item.id))
      .map(({ index }) => index)

    if (!pool.length) {
      setIdeaNotice('固定题差不多都练过了，可以让老猫即兴出题，或者回头复盘已完成题。')
      return
    }

    const nextIndex = pool[Math.floor(Math.random() * pool.length)] ?? 0
    chooseFixedIdea(nextIndex)
  }

  async function generateImpromptuIdea() {
    if (!user.settings.apiKey) {
      setIdeaNotice('老猫即兴出题需要先在设置里添加 API Key。没有 Key 时，可以先练左侧 20 个固定题。')
      return
    }

    setGeneratingIdea(true)
    setIdeaNotice('')
    try {
      const res = await callClaude({
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
        maxTokens: 700,
        system: '你是 AI 产品经理训练题出题官。只输出 JSON，不要 Markdown。',
        messages: [{
          role: 'user',
          content: `请为零基础 AI PM 学习者生成一个全新的产品开发训练题，不要和这些固定题重复：${WORKSHOP_IDEAS.map(item => item.title).join('、')}。\n\n返回 JSON 字段：title, prompt, user, scene, hint, tag。要求题目具体、有真实用户和真实场景，不要太宏大。`,
        }],
      })
      const generated = parseJson(extractText(res), null)
      if (!generated?.title || !generated?.prompt) throw new Error('bad idea')
      setCustomIdea({
        id: `impromptu-${Date.now()}`,
        title: generated.title,
        prompt: generated.prompt,
        user: generated.user || '需要解决具体问题的目标用户',
        scene: generated.scene || '用户在一个明确场景里遇到重复成本或决策困难。',
        hint: generated.hint || '先缩小场景，再设计 MVP 和验证指标。',
        tag: generated.tag || '即兴题',
      })
      resetDraft()
      setMobileAnswerOpen(true)
      setIdeaNotice('老猫刚抓了一道即兴题。这道题不会占用固定 20 题进度。')
    } catch {
      setIdeaNotice('即兴题生成失败了，可能是 API Key 或网络问题。先练固定题也可以。')
    } finally {
      setGeneratingIdea(false)
    }
  }

  async function reviewFlow() {
    const answerText = PRODUCT_FLOW_STEPS
      .map(step => `${step.title}\n${answers[step.id] || '未填写'}`)
      .join('\n\n')

    setLoading(true)
    let result = buildLocalFeedback(idea, answers)

    if (user.settings.apiKey) {
      try {
        const res = await callClaude({
          apiKey: user.settings.apiKey,
          modelMode: user.settings.modelMode,
          maxTokens: 900,
          system: '你是一位严格但友好的 AI 产品经理导师。只输出 JSON，不要 Markdown。',
          messages: [{
            role: 'user',
            content: `请评价这个零基础学习者写的产品开发流程。返回 JSON 字段：score(number 0-100), summary(string), orderIssues(string[]), missingSteps(string[]), mvpAdvice(string), nextTry(string)。\n\n题目：${idea.title}\nIdea：${idea.prompt}\n目标用户：${idea.user}\n场景：${idea.scene}\n\n用户作答：\n${answerText}`,
          }],
        })
        result = parseJson(extractText(res), result)
      } catch {
        result = {
          ...result,
          summary: `${result.summary}（AI 反馈暂时不可用，已用本地规则先帮你看一版。）`,
        }
      }
    }

    const session = {
      ideaId: idea.id,
      ideaType: customIdea ? 'impromptu' : 'fixed',
      ideaTitle: idea.title,
      ideaPrompt: idea.prompt,
      answer: answerText,
      answers,
      score: result.score,
      feedback: result,
    }
    saveWorkshopSession(session)
    addExp(10)
    addFish(2)
    setFeedback(result)
    setSaved(true)
    setLoading(false)
  }

  return (
    <div className={`workshop-shell ${mobileAnswerOpen ? 'is-answer-open' : ''}`}>
      <section className="workshop-hero card">
        <div>
          <div className="section-kicker">产品流程训练</div>
          <h1>造物工坊</h1>
          <p>给你一个产品 idea，你来按真实产品开发顺序拆流程。老猫会看问题定义、MVP、验证指标和迭代风险。</p>
        </div>
        <BlinkingClayMascot type="oldcat" className="workshop-hero-cat" />
        <div className="workshop-stats">
          <span>已练习</span>
          <strong>{workshop.sessions?.length || 0}</strong>
        </div>
      </section>

      <div className="workshop-layout">
        <aside className="workshop-ideas">
          <button
            type="button"
            className="workshop-random-card"
            onClick={pickRandomFixedIdea}
          >
            <RefreshCw size={16} />
            <strong>随机抽固定题</strong>
            <span>只从没练过的固定题里抽一个。</span>
          </button>
          <button
            type="button"
            className="workshop-random-card workshop-random-card--ai"
            onClick={generateImpromptuIdea}
            disabled={generatingIdea}
          >
            <Wand2 size={16} />
            <strong>{generatingIdea ? '老猫出题中...' : '老猫即兴出题'}</strong>
            <span>不想做固定题时，让 AI 临场给一个新场景。</span>
          </button>
          {ideaNotice && <p className="workshop-idea-note">{ideaNotice}</p>}
          {WORKSHOP_IDEAS.map((item, index) => (
            <button
              type="button"
              key={item.id}
              className={`workshop-idea-card ${!customIdea && index === ideaIndex ? 'is-active' : ''} ${completedFixedIds.has(item.id) ? 'is-completed' : ''}`}
              onClick={() => chooseFixedIdea(index)}
            >
              <strong>{item.title}</strong>
              <span>{item.tag} · {item.user}</span>
              {completedFixedIds.has(item.id) && <em>已练习</em>}
            </button>
          ))}
        </aside>

        <main className="workshop-main">
          <button type="button" className="workshop-mobile-back" onClick={() => setMobileAnswerOpen(false)}>
            返回选题
          </button>
          <section className="workshop-brief card">
            <div>
              <span>本次题目</span>
              <h2>{idea.title}</h2>
              <p>{idea.prompt}</p>
            </div>
            <button type="button" className="workshop-refresh" onClick={pickRandomFixedIdea}>
              <RefreshCw size={16} />
              换个固定题
            </button>
            <div className="workshop-context-grid">
              <article>
                <b>目标用户</b>
                <p>{idea.user}</p>
              </article>
              <article>
                <b>场景</b>
                <p>{idea.scene}</p>
              </article>
              <article>
                <b>提醒</b>
                <p>{idea.hint}</p>
              </article>
            </div>
          </section>

          <section className="workshop-flow card">
            <div className="workshop-flow-head">
              <div>
                <span>{completedSteps} / {PRODUCT_FLOW_STEPS.length}</span>
                <h2>按产品开发顺序写一遍</h2>
              </div>
              {saved && <em><CheckCircle size={15} /> 已存入成长档案</em>}
            </div>

            <div className="workshop-step-list">
              {PRODUCT_FLOW_STEPS.map(step => (
                <label key={step.id} className="workshop-step">
                  <span>{step.title}</span>
                  <small>{step.guide}</small>
                  <div className="relative">
                    <textarea
                      value={answers[step.id] || ''}
                      onChange={event => updateAnswer(step.id, event.target.value)}
                      placeholder={step.placeholder}
                    />
                    <VoiceInputButton
                      enabled={user.settings.voiceEnabled}
                      lang={lang}
                      onText={text => updateAnswer(step.id, `${answers[step.id] || ''}${answers[step.id] ? ' ' : ''}${text}`)}
                      className="absolute bottom-3 right-3"
                    />
                  </div>
                </label>
              ))}
            </div>

            <button type="button" className="btn-primary workshop-review-button" onClick={reviewFlow} disabled={loading}>
              <Wand2 size={17} />
              {loading ? '老猫正在看...' : '让老猫看流程'}
            </button>
          </section>

          {feedback && (
            <motion.section
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              className="workshop-feedback card"
            >
              <div className="workshop-feedback-score">
                <span>流程分</span>
                <strong>{feedback.score}</strong>
              </div>
              <div className="workshop-feedback-body">
                <h2>{feedback.summary}</h2>
                <div className="workshop-feedback-grid">
                  <article>
                    <b>顺序问题</b>
                    {(feedback.orderIssues || []).map(item => <p key={item}>{item}</p>)}
                  </article>
                  <article>
                    <b>缺口提醒</b>
                    {(feedback.missingSteps || []).map(item => <p key={item}>{item}</p>)}
                  </article>
                  <article>
                    <b>MVP 建议</b>
                    <p>{feedback.mvpAdvice}</p>
                  </article>
                  <article>
                    <b>下一轮练习</b>
                    <p>{feedback.nextTry}</p>
                  </article>
                </div>
              </div>
            </motion.section>
          )}

          <section className="workshop-reference card">
            <div className="section-kicker"><Sparkles size={15} /> 参考思路</div>
            <h2>不是标准答案，只是帮你校准顺序</h2>
            <ol>
              {referenceFlow.map(item => <li key={item}>{item}</li>)}
            </ol>
          </section>
        </main>
      </div>
    </div>
  )
}

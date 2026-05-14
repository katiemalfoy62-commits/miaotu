import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, Clock, Copy, ExternalLink, Mic, MicOff, Plus, Send, X } from 'lucide-react'
import useStore from '../../store/useStore'
import { callClaude, extractText, getCatPersonalityPrompt } from '../../utils/claude'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import ClayIcon from '../../components/UI/ClayIcon'
import { buildTaskPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'

const MOCK_TASKS = [
  { type: 'qa', question: '请解释什么是大语言模型（LLM），它和传统 NLP 模型有什么本质区别？', difficulty: 'easy', curriculum: 'AI 基础认知' },
  { type: 'qa', question: '在进行用户需求分析时，如何识别用户的痛点？请给出两个具体方法。', difficulty: 'medium', curriculum: '用户研究' },
  { type: 'qa', question: '请分析一款主流 AI 产品的功能和市场定位，并提出你的改进建议。', difficulty: 'hard', curriculum: 'AI 产品分析' },
]

const DIFFICULTY_LABEL = {
  easy: '基础',
  medium: '进阶',
  hard: '困难',
}

function CountdownBar({ deadline }) {
  const now = Date.now()
  const total = 24 * 3600000
  const left = Math.max(0, new Date(deadline).getTime() - now)
  const pct = (left / total) * 100
  const h = Math.floor(left / 3600000)
  const m = Math.floor((left % 3600000) / 60000)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
        <Clock size={12} />
        剩余 {h}小时 {m}分钟
      </div>
      <div className="progress-track h-2">
        <div className="progress-fill h-full" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function useSpeechToText(setValue, lang) {
  const [listening, setListening] = useState(false)

  function toggle() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    if (listening) {
      setListening(false)
      return
    }
    const recog = new SpeechRecognition()
    recog.lang = lang === 'zh' ? 'zh-CN' : 'en-US'
    recog.onresult = e => setValue(prev => `${prev}${e.results[0][0].transcript}`)
    recog.onend = () => setListening(false)
    recog.start()
    setListening(true)
  }

  return { listening, toggle }
}

function TaskCard({ task, index, onSubmit, isActive, lang }) {
  const { user } = useStore()
  const [answer, setAnswer] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const { listening, toggle } = useSpeechToText(setAnswer, lang)

  async function submitAnswer() {
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    setError('')
    try {
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请批改这道 AI 产品经理练习题。

题目：${task.question}

我的回答：${answer}

请只返回 JSON：
{
  "score": {"structure":0-30,"logic":0-30,"accuracy":0-25,"completion":0-15},
  "totalScore":0-100,
  "summary":"一句话指出最核心问题",
  "goods":["具体优点"],
  "bads":["具体不足，必须点到表达结构和思维逻辑"],
  "advice":"下一次应该怎么改，150字以内",
  "rewriteExample":"把我的回答中最弱的一段改写成更好的 PREP 表达",
  "standardAnswer":"这道题的面试口语版高分参考答案，250-400字"
}`,
        }],
        system: `${getCatPersonalityPrompt(user.settings.catPersonality, lang)}
你是严格但有帮助的 AI 产品经理面试教练。评分重点不是背知识，而是训练表达结构和思维逻辑。
权重：表达结构清晰度30分、思维逻辑深度30分、内容准确性25分、完成度15分。
点评必须具体，指出回答里哪里没有先结论、哪里逻辑跳跃、哪里缺少因果链/权衡/案例。必须给可模仿的参考答案。`,
        maxTokens: 1800,
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
      })
      const text = extractText(res)
      const match = text.match(/\{[\s\S]*\}/)
      const feedback = match ? JSON.parse(match[0]) : fallbackFeedback(answer)
      onSubmit(task.id, answer, feedback)
    } catch (e) {
      if (e.message === 'NO_API_KEY') {
        setError('还没有设置 API Key。你可以先保存答案，之后再补批改。')
        onSubmit(task.id, answer, fallbackFeedback(answer))
      } else {
        setError('批改失败，已用本地模板保存这次作答。')
        onSubmit(task.id, answer, fallbackFeedback(answer))
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`card p-5 space-y-4 ${!isActive ? 'opacity-45 pointer-events-none' : ''}`}
    >
      <div className="flex items-center gap-2">
        <span className="tag bg-green-100 text-green-700">{task.type === 'qa' ? '问答题' : '实操题'}</span>
        <span className="tag bg-red-100 text-red-600">{DIFFICULTY_LABEL[task.difficulty] || task.difficulty}</span>
      </div>
      <p className="font-bold text-sm leading-relaxed">{task.question}</p>
      <CountdownBar deadline={task.deadline} />
      <div className="relative">
        <textarea
          className="input-base min-h-[130px] resize-none pr-11"
          placeholder="在这里输入你的答案，尽量先结论、再理由、再例子..."
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          disabled={submitting}
        />
        {user.settings.voiceEnabled && (
          <button
            type="button"
            onClick={toggle}
            className={`absolute bottom-3 right-3 rounded-full p-1.5 ${listening ? 'bg-primary text-white' : 'text-gray-400 hover:bg-border-light'}`}
          >
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>
        )}
      </div>
      {error && <div className="rounded-xl bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">{error}</div>}
      <button
        onClick={submitAnswer}
        disabled={!answer.trim() || submitting}
        className="btn-primary flex w-full items-center justify-center gap-2"
      >
        {submitting ? '老猫批改中...' : <><CheckCircle size={16} /> 提交答案</>}
      </button>
    </motion.div>
  )
}

function CompletedDetail({ task, onClose }) {
  const [copied, setCopied] = useState(false)
  const feedback = task.feedback || {}

  async function copyPrompt() {
    await copyText(buildTaskPrompt(task))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/20 px-4">
      <div className="task-detail-modal">
        <div className="task-detail-head">
          <div>
            <strong>任务复盘</strong>
            <span>{task.score || '-'} 分</span>
          </div>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="task-detail-body">
          <section>
            <h3>题目</h3>
            <p>{task.question}</p>
          </section>
          <section>
            <h3>我的回答</h3>
            <p>{task.answer || '未记录'}</p>
          </section>
          <section className="task-score-grid">
            <div>表达结构 <b>{feedback.score?.structure ?? '-'}/30</b></div>
            <div>逻辑深度 <b>{feedback.score?.logic ?? '-'}/30</b></div>
            <div>内容准确 <b>{feedback.score?.accuracy ?? '-'}/25</b></div>
            <div>完成度 <b>{feedback.score?.completion ?? '-'}/15</b></div>
          </section>
          {feedback.summary && <section><h3>核心问题</h3><p>{feedback.summary}</p></section>}
          {feedback.goods?.length > 0 && <section><h3>做得好的地方</h3><p>{feedback.goods.join('；')}</p></section>}
          {feedback.bads?.length > 0 && <section><h3>需要改进</h3><p>{feedback.bads.join('；')}</p></section>}
          {feedback.advice && <section><h3>改进建议</h3><p>{feedback.advice}</p></section>}
          {feedback.rewriteExample && <section><h3>改写示范</h3><p>{feedback.rewriteExample}</p></section>}
          {feedback.standardAnswer && <section><h3>参考答案</h3><p>{feedback.standardAnswer}</p></section>}
        </div>
        <div className="task-detail-actions">
          <button onClick={copyPrompt}><Copy size={15} /> {copied ? '已复制' : '复制给 GPT'}</button>
          <button onClick={openChatGPT}><ExternalLink size={15} /> 去 GPT</button>
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const { user, tasks, setActiveTasks, completeTask, addExp, addFish, addLearningRecord } = useStore()
  const lang = user.settings.language
  const [claiming, setClaiming] = useState(false)
  const [currentTaskIdx, setCurrentTaskIdx] = useState(0)
  const [selectedCompleted, setSelectedCompleted] = useState(null)

  async function claimTasks() {
    if (claiming) return
    setClaiming(true)
    try {
      const history = tasks.history.map(t => t.question).slice(0, 10)
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请生成 3 道 AI 产品经理学习任务。已做过的题目：${JSON.stringify(history)}。只返回 JSON 数组：[{"type":"qa","question":"...","difficulty":"easy|medium|hard","curriculum":"课程模块名称"}]`,
        }],
        system: '你是 AI 产品经理学习课程设计师。题目要训练表达结构、产品逻辑和 AI 产品理解，避免空泛。',
        maxTokens: 800,
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
      })
      const text = extractText(res)
      const match = text.match(/\[[\s\S]*\]/)
      const source = match ? JSON.parse(match[0]) : MOCK_TASKS
      addTasks(source)
    } catch {
      addTasks(MOCK_TASKS)
    } finally {
      setClaiming(false)
    }
  }

  function addTasks(source) {
    const newTasks = source.map((task, i) => ({
      ...task,
      id: Date.now() + i,
      deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
      claimedAt: new Date().toISOString(),
    }))
    const currentActive = tasks.active || []
    setActiveTasks([...currentActive, ...newTasks])
    setCurrentTaskIdx(currentActive.length)
  }

  function handleSubmit(taskId, answer, feedback) {
    const task = (tasks.active || []).find(t => t.id === taskId)
    if (!task) return
    const score = feedback?.totalScore || 0
    const expMap = { easy: 4, medium: 6, hard: 8 }
    const fishMap = { easy: 1, medium: 2, hard: 3 }
    addExp(expMap[task.difficulty] || 4)
    if (score >= 80) addFish((fishMap[task.difficulty] || 1) + 1)
    else if (score >= 60) addFish(fishMap[task.difficulty] || 1)

    const completed = { answer, feedback, score, module: 'task' }
    completeTask(taskId, completed)
    addLearningRecord({
      type: 'task',
      title: task.question,
      question: task.question,
      answer,
      score,
      feedback,
      source: '委托任务',
    })
    setCurrentTaskIdx(0)
  }

  const activeTasks = tasks.active || []

  return (
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="section-title text-xl">委托任务</h1>
          <button onClick={claimTasks} disabled={claiming} className="btn-primary flex items-center gap-2">
            {claiming ? '领取中...' : <><Plus size={16} /> 领取任务</>}
          </button>
        </div>

        {activeTasks.length === 0 ? (
          <div className="card p-10 text-center space-y-3">
            <ClayIcon name="tasks" className="empty-clay-icon mx-auto" alt="" />
            <div className="font-bold text-gray-600 dark:text-gray-400">还没有任务，点击「领取任务」开始吧！</div>
            <ClayIcon name="taskEmpty" className="task-empty-clay mx-auto" alt="" />
            <div className="text-xs text-gray-400">老猫说：一步一步来，积少成多。</div>
          </div>
        ) : (
          <div className="space-y-4">
            {activeTasks.map((task, i) => (
              <TaskCard
                key={task.id}
                task={task}
                index={i}
                lang={lang}
                onSubmit={handleSubmit}
                isActive={i === currentTaskIdx}
              />
            ))}
            {currentTaskIdx < activeTasks.length - 1 && (
              <div className="text-center text-xs text-gray-400 py-2">完成当前题目后解锁下一题</div>
            )}
          </div>
        )}

        {(tasks.completed || []).length > 0 && (
          <div className="card p-4">
            <div className="text-xs font-bold text-gray-400 mb-3">已完成任务 ({tasks.completed.length})</div>
            <div className="space-y-2">
              {(tasks.completed || []).slice(0, 6).map(task => (
                <button key={task.id} onClick={() => setSelectedCompleted(task)} className="flex w-full items-center gap-2 rounded-lg px-1 py-1 text-left text-xs text-gray-500 hover:bg-amber-50">
                  <CheckCircle size={12} className="text-green-500" />
                  <span className="flex-1 truncate">{task.question}</span>
                  <span>{task.score || '-'}分</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedCompleted && <CompletedDetail task={selectedCompleted} onClose={() => setSelectedCompleted(null)} />}

        <div className="fixed bottom-0 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center pointer-events-none">
          <div className="rounded-t-2xl border border-border-light bg-card-light px-4 pt-2 shadow-lg">
            <BlinkingClayMascot type="oldcat" className="task-bottom-oldcat" />
          </div>
          <div className="-mt-1 rounded-xl border border-border-light bg-card-light px-3 py-1.5 text-xs font-semibold text-primary shadow">
            有问题随时叫我~
          </div>
        </div>
      </div>
  )
}

function fallbackFeedback(answer) {
  return {
    score: { structure: 18, logic: 18, accuracy: 18, completion: answer?.length > 20 ? 12 : 8 },
    totalScore: answer?.length > 20 ? 66 : 52,
    summary: '这次已完成基本回答，但还需要更清楚的结构和更完整的逻辑链。',
    goods: ['能够围绕题目给出自己的判断'],
    bads: ['需要先给结论，再分层展开理由；需要补充更具体的产品案例或因果分析'],
    advice: '下次先用一句话给观点，再按用户、业务、数据或技术维度展开，每个维度都补一句为什么。',
    rewriteExample: '我认为这个问题可以从用户价值、业务目标和落地约束三层分析。首先，用户价值决定产品是否真的解决痛点；其次，业务目标决定功能优先级；最后，落地约束决定方案是否可执行。',
    standardAnswer: '高分回答可以先明确结论，再用三层结构展开。第一，定义问题和目标用户，说明这个产品到底解决谁的什么痛点。第二，从用户价值、商业价值、技术可行性三个角度分析方案。第三，用指标说明如何验证，例如留存、转化、使用频次或任务完成率。最后回到结论：一个好的 AI 产品方案，不只是功能完整，而是能在明确场景中持续创造价值。',
  }
}

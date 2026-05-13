import React, { useMemo, useState } from 'react'
import { Copy, ExternalLink, MessageSquare } from 'lucide-react'
import useStore from '../../store/useStore'
import ClayIcon from '../../components/UI/ClayIcon'
import { buildInterviewPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'

function formatDate(value) {
  if (!value) return '刚刚'
  return new Date(value).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function normalize(record) {
  const raw = record.raw || record.feedback || record
  return {
    ...raw,
    id: record.id || raw.id || raw.date || `interview_${Date.now()}`,
    title: record.title || `模拟面试 - ${raw.interviewer || '面试官'}`,
    createdAt: record.createdAt || raw.createdAt || raw.date,
    totalScore: raw.totalScore ?? record.score,
    questions: raw.questions || [],
  }
}

export default function InterviewRecords() {
  const { interview = {}, learningRecords = [] } = useStore()
  const [selected, setSelected] = useState(null)

  const records = useMemo(() => {
    const fromArchive = learningRecords.filter(item => item.type === 'interview').map(normalize)
    const fromHistory = (interview.history || []).map(normalize)
    const map = new Map()
    ;[...fromArchive, ...fromHistory].forEach(item => {
      map.set(item.id || `${item.title}_${item.createdAt}`, item)
    })
    return [...map.values()]
  }, [interview.history, learningRecords])

  async function copyInterview(record) {
    await copyText(buildInterviewPrompt(record))
  }

  return (
    <div className="interview-record-page">
      <section className="card interview-record-hero">
        <div>
          <div className="section-kicker"><MessageSquare size={16} /> 面试记录</div>
          <h1>每一次模拟面试都要能复盘</h1>
          <p>这里保存面试官、每道题、你的回答、考察方向、逐题评分和参考答案。之后回看时，不会只剩一个笼统总分。</p>
        </div>
        <ClayIcon name="interviewRecord" alt="" />
      </section>

      {records.length === 0 ? (
        <section className="card interview-record-empty">
          <ClayIcon name="interviewRecord" alt="" />
          <strong>还没有面试记录</strong>
          <span>完成一次模拟面试后，完整对话和评分会出现在这里。</span>
        </section>
      ) : (
        <div className="interview-record-layout">
          <section className="card interview-record-list">
            {records.map(record => (
              <button key={record.id} onClick={() => setSelected(record)} className={`interview-record-row ${selected?.id === record.id ? 'active' : ''}`}>
                <span>{record.totalScore ?? '-'}分</span>
                <div>
                  <b>{record.title}</b>
                  <small>{record.interviewer || '模拟面试'} · {formatDate(record.createdAt)}</small>
                </div>
              </button>
            ))}
          </section>

          <section className="card interview-record-detail">
            {selected ? (
              <>
                <div className="interview-record-detail-head">
                  <div>
                    <span>{selected.interviewer || '模拟面试'}</span>
                    <h2>{selected.title}</h2>
                  </div>
                  <strong>{selected.totalScore ?? '-'}分</strong>
                </div>
                <div className="interview-record-actions">
                  <button onClick={() => copyInterview(selected)}><Copy size={15} /> 复制整场给 GPT</button>
                  <button onClick={openChatGPT}><ExternalLink size={15} /> GPT</button>
                </div>
                <div className="interview-question-list">
                  {(selected.questions || []).map((q, i) => (
                    <article key={q.questionId || i}>
                      <div className="interview-question-title">
                        <b>第 {i + 1} 题</b>
                        <span>{q.score ?? '-'}分</span>
                      </div>
                      <h3>{q.question}</h3>
                      <section>
                        <label>面试官想考察</label>
                        <p>{q.intent || '产品判断、结构表达和逻辑拆解能力。'}</p>
                      </section>
                      <section>
                        <label>我的回答</label>
                        <p>{q.answer || '未作答'}</p>
                      </section>
                      {q.scoreDetail && (
                        <div className="task-score-grid">
                          <div>表达结构 <b>{q.scoreDetail.structure ?? '-'}/30</b></div>
                          <div>思维逻辑 <b>{q.scoreDetail.logic ?? '-'}/30</b></div>
                          <div>产品判断 <b>{q.scoreDetail.productJudgment ?? '-'}/25</b></div>
                          <div>沟通完成 <b>{q.scoreDetail.communication ?? '-'}/15</b></div>
                        </div>
                      )}
                      {q.comment && <section><label>具体点评</label><p>{q.comment}</p></section>}
                      {q.betterAnswer && <section><label>参考答案</label><p>{q.betterAnswer}</p></section>}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="interview-record-empty compact">选择左侧一场面试查看完整记录。</div>
            )}
          </section>
        </div>
      )}
    </div>
  )
}

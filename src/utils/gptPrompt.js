export const CHATGPT_URL = 'https://chatgpt.com/'

export async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text)
    return true
  }
  const area = document.createElement('textarea')
  area.value = text
  area.style.position = 'fixed'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.select()
  document.execCommand('copy')
  document.body.removeChild(area)
  return true
}

export function openChatGPT() {
  window.open(CHATGPT_URL, '_blank', 'noopener,noreferrer')
}

export function buildLinkPrompt(url, note = '') {
  return `请阅读这个网址的内容并整理主要内容：
${url}

${note ? `我的备注：${note}\n\n` : ''}请重点关注：
1. 这篇文章的核心观点是什么
2. 和 AI 产品经理 / AI 产品设计相关的内容
3. 有哪些值得我学习的方法、案例或表达
4. 用 PREP 结构整理：观点、理由、例子、总结
5. 最后给我 3 个可以继续追问的问题

输出控制在 800 字以内，语言专业但好懂。`
}

export function buildTaskPrompt(task) {
  return `我正在练习 AI 产品经理表达，请基于下面这道题继续深度分析。

【题目】
${task.question || ''}

【我的回答】
${task.answer || ''}

【已有评分/点评】
${JSON.stringify(task.feedback || task, null, 2)}

请重点帮我分析：
1. 我的表达结构是否清晰，应该如何用 PREP 或分层结构改写
2. 我的思维逻辑是否有因果链、权衡和产品判断
3. 这道题高分答案应该怎么答
4. 给我一版面试口语版参考答案
5. 指出我下次最该练的一个表达动作`
}

export function buildInterviewPrompt(interview) {
  const questions = (interview.questions || []).map((q, i) => `
【问题 ${i + 1}】
${q.question}

【我的回答】
${q.answer || '未作答'}

【已有评价】
${q.comment || q.analysis || ''}
`).join('\n')

  return `我完成了一场 AI 产品经理模拟面试，请继续帮我深度复盘。

【面试官】
${interview.interviewer || interview.interviewerName || ''}

${questions}

请你：
1. 逐题判断面试官想考察什么能力
2. 逐题评价我的表达结构、逻辑深度、产品判断和案例支撑
3. 每题给一版更好的面试口语参考答案
4. 总结我最影响面试成功的 3 个问题
5. 给我下一轮练习计划`
}

export function buildOldCatPrompt(messages) {
  const body = messages
    .filter(m => m.role !== 'system')
    .slice(-16)
    .map(m => `${m.role === 'user' ? '我' : '老猫'}：${m.content}`)
    .join('\n\n')

  return `我正在学习 AI 产品经理相关内容，下面是我和喵途老猫的对话。

${body}

请你先总结我们正在讨论的问题，再继续深入分析：
1. 给出更专业、更系统的解释
2. 补充真实行业背景或案例
3. 指出我可能忽略的关键点
4. 如果适合，请用 PREP 或时间线结构帮我整理
5. 最后给我 3 个可以继续追问的问题`
}

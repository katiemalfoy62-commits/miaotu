// OpenAI API helper. The exported name stays callClaude so older page code can keep working.
const MODEL_BY_MODE = {
  economy: 'gpt-4o-mini',
  balanced: 'gpt-4o-mini',
  deep: 'gpt-4o',
}

export function getModelForMode(mode = 'balanced') {
  return MODEL_BY_MODE[mode] || MODEL_BY_MODE.balanced
}

function normalizeMessages(messages = [], system) {
  const normalized = []
  if (system) normalized.push({ role: 'system', content: system })

  messages.forEach((message) => {
    if (!message?.content) return
    const role = message.role === 'assistant' ? 'assistant' : 'user'
    normalized.push({ role, content: String(message.content) })
  })

  return normalized
}

function classifyOpenAIError(status, payload) {
  const code = payload?.error?.code || ''
  const type = payload?.error?.type || ''
  const message = payload?.error?.message || ''
  const combined = `${code} ${type} ${message}`.toLowerCase()

  if (status === 401 || combined.includes('invalid api key') || combined.includes('incorrect api key')) {
    return 'INVALID_API_KEY'
  }
  if (status === 429 && (combined.includes('quota') || combined.includes('billing'))) {
    return 'INSUFFICIENT_QUOTA'
  }
  if (status === 429) return 'RATE_LIMIT'
  if (status >= 500) return 'API_SERVER_ERROR'
  return message || `API_HTTP_${status}`
}

export async function callClaude({
  messages,
  system,
  maxTokens = 900,
  apiKey,
  modelMode = 'balanced',
  model,
}) {
  const key = (apiKey || localStorage.getItem('miaotu_openai_apikey') || '').trim()
  if (!key) throw new Error('NO_API_KEY')

  let res
  try {
    res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: model || getModelForMode(modelMode),
        messages: normalizeMessages(messages, system),
        max_tokens: maxTokens,
        temperature: 0.7,
      }),
    })
  } catch {
    throw new Error('API_NETWORK')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(classifyOpenAIError(res.status, err))
  }

  return res.json()
}

export function extractText(response) {
  return response?.choices?.[0]?.message?.content
    || response?.output_text
    || response?.content?.find?.(b => b.type === 'text')?.text
    || ''
}

export function getApiErrorMessage(error, lang = 'zh') {
  const code = error?.message || String(error || '')
  const zh = {
    NO_API_KEY: '我现在还没有接上 OpenAI API Key。你可以去设置页填写 Key；如果暂时不填，我只能用基础陪伴模式。',
    INVALID_API_KEY: '这个 OpenAI API Key 好像无效或已经被删除了。请去设置页重新粘贴一次新的 Key。',
    INSUFFICIENT_QUOTA: 'OpenAI API 余额或额度可能不够了。你可以去 OpenAI Platform 的 Billing 页面检查余额。',
    RATE_LIMIT: 'OpenAI 请求太频繁了，我先缓一下。等一小会儿再问我就好。',
    API_NETWORK: '我现在连不上 OpenAI，可能是网络或代理问题。你可以稍后重试。',
    API_SERVER_ERROR: 'OpenAI 服务刚才有点不稳定，稍后再试一下。',
  }
  const en = {
    NO_API_KEY: 'I am not connected to an OpenAI API key yet. Add one in Settings, or I can only use basic companion mode for now.',
    INVALID_API_KEY: 'This OpenAI API key looks invalid or deleted. Please paste a fresh key in Settings.',
    INSUFFICIENT_QUOTA: 'Your OpenAI API balance or quota may be insufficient. Please check Billing in OpenAI Platform.',
    RATE_LIMIT: 'Too many OpenAI requests too quickly. Please try again in a moment.',
    API_NETWORK: 'I cannot reach OpenAI right now. This may be a network or proxy issue.',
    API_SERVER_ERROR: 'OpenAI seems unstable right now. Please try again later.',
  }

  const table = lang === 'zh' ? zh : en
  return table[code] || (lang === 'zh'
    ? `OpenAI 调用失败：${code}`
    : `OpenAI request failed: ${code}`)
}

// Personality system prompts for old cat
export function getCatPersonalityPrompt(personality, lang = 'zh') {
  const map = {
    mom: lang === 'zh'
      ? '你是一只温柔体贴的老猫，像妈妈一样鼓励用户，语气温暖、接纳、具体。'
      : 'You are a warm and caring cat mentor, always encouraging like a mother figure.',
    teacher: lang === 'zh'
      ? '你是一只严格但公正的老猫老师，点评有条理，有具体指导意见，不空泛表扬，也不回避指出问题。'
      : 'You are a strict but fair cat teacher, systematic in feedback, specific in guidance.',
    coach: lang === 'zh'
      ? '你是一只面试教练型老猫，特别关注表达结构、回答节奏、案例选择和追问准备。'
      : 'You are an interview-coach cat mentor, focused on answer structure, pacing, examples, and follow-up questions.',
    friend: lang === 'zh'
      ? '你是一只随意轻松的老猫朋友，说话自然，偶尔开玩笑，但始终有干货。'
      : 'You are a casual cat friend, relaxed in tone, occasional humor, but always helpful.',
    senior: lang === 'zh'
      ? '你是一只产品前辈型老猫，像资深 PM 一样帮用户拆思路、看取舍、补判断框架。'
      : 'You are a senior-PM cat mentor who helps users break down thinking, tradeoffs, and product judgment.',
    mentor: lang === 'zh'
      ? '你是一只高屋建瓴的老猫导师，善于讲底层逻辑和大局观，让用户看到更深层的东西。'
      : 'You are a wise cat mentor who sees the big picture and explains underlying logic.',
    boss: lang === 'zh'
      ? '你是一只结果导向的老猫老板，直接说重点，不废话，以结果和行动建议说话。'
      : 'You are a results-oriented cat boss, direct, no fluff, speaks in outcomes.',
    colleague: lang === 'zh'
      ? '你是一只平等交流的老猫同事，互相探讨，不摆架子，像同级朋友一样讨论问题。'
      : 'You are a cat colleague, peer-level discussion, no hierarchy, collaborative.',
    toxic: lang === 'zh'
      ? '你是一只毒舌但有料的老猫，每句话都直戳要害，但确实准确，偶尔刻薄但说到点上。'
      : 'You are a sharp-tongued but insightful cat, cutting but accurate, occasionally harsh but always on point.',
    tsundere: lang === 'zh'
      ? '你是一只傲娇毒舌型老猫，嘴上嫌弃但实际很负责。可以犀利吐槽，但必须准确、有帮助，不做人身攻击。'
      : 'You are a tsundere, sharp-tongued cat mentor: teasing and candid, but responsible, accurate, and never personally abusive.',
  }
  return map[personality] || map.teacher
}

export const NEWS_STYLES = {
  friend: { zh: '朋友聊天式', en: 'Casual Chat' },
  toxic: { zh: '毒舌吐槽式', en: 'Snarky Commentary' },
  story: { zh: '故事叙述式', en: 'Narrative Story' },
  serious: { zh: '严肃简报式', en: 'Serious Brief' },
  teacher: { zh: '老师教学式', en: 'Educational' },
  ai_buddy: { zh: 'AI伙伴式', en: 'AI Buddy' },
  curious: { zh: '好奇宝宝式', en: 'Curious Critter' },
}

export function getNewsStylePrompt(style, lang = 'zh') {
  const map = {
    friend: lang === 'zh'
      ? '用朋友聊天的语气，轻松有趣，像给好朋友发消息一样介绍这条 AI 新闻。'
      : 'Write like texting a friend, casual and fun.',
    toxic: lang === 'zh'
      ? '用毒舌吐槽的风格，幽默辛辣，但要说到点上，不能只是嘲讽。'
      : 'Write with snarky wit and sharp humor, but still insightful.',
    story: lang === 'zh'
      ? '用故事叙述的方式，有开头、发展、结尾，让读者有代入感。'
      : 'Narrative story format with a beginning, middle, and end.',
    serious: lang === 'zh'
      ? '用严肃简报的风格，精炼、客观、专业，适合快速获取信息。'
      : 'Serious and concise briefing style, professional and factual.',
    teacher: lang === 'zh'
      ? '用老师教学的方式，解释背景知识，帮助读者真正理解这条新闻的意义。'
      : 'Educational tone that explains context and significance.',
    ai_buddy: lang === 'zh'
      ? '把 AI 产品拟人化为朋友介绍，横向比较各 AI 产品，有个性、有观点。'
      : 'Personify AI products as characters, compare them with personality.',
    curious: lang === 'zh'
      ? '用好奇宝宝的视角，充满惊叹和疑问，活泼可爱但也有内容。'
      : 'From a curious, wide-eyed perspective, full of wonder and questions.',
  }
  return map[style] || map.friend
}

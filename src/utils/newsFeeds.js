import { AI_NEWS_SOURCES } from '../data/newsSources'

const AI_KEYWORDS = [
  'ai', 'artificial intelligence', 'openai', 'anthropic', 'claude', 'chatgpt',
  'gemini', 'deepmind', 'llm', 'model', 'agent', 'multimodal', 'copilot',
  'machine learning', 'generative', 'automation',
]

function stripHtml(value = '') {
  return String(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

function textFrom(node, selectors) {
  for (const selector of selectors) {
    const found = node.querySelector(selector)
    const text = found?.textContent?.trim()
    if (text) return text
  }
  return ''
}

function linkFrom(node) {
  const atomLink = node.querySelector('link[href]')
  if (atomLink?.getAttribute('href')) return atomLink.getAttribute('href')
  const rssLink = node.querySelector('link')
  return rssLink?.textContent?.trim() || ''
}

function parseFeed(xmlText, source) {
  const doc = new DOMParser().parseFromString(xmlText, 'text/xml')
  const entries = Array.from(doc.querySelectorAll('item, entry'))
  return entries.map((entry, index) => {
    const title = textFrom(entry, ['title'])
    const rawSummary = textFrom(entry, ['description', 'summary', 'content'])
    const publishedAt = textFrom(entry, ['pubDate', 'published', 'updated'])
    return {
      id: `${source.id}_${Date.parse(publishedAt) || Date.now()}_${index}`,
      title,
      summary: stripHtml(rawSummary).slice(0, 220),
      url: linkFrom(entry),
      source: source.name,
      publishedAt,
    }
  }).filter(item => item.title && item.url)
}

function feedUrls(feedUrl) {
  const encoded = encodeURIComponent(feedUrl)
  return [
    feedUrl,
    `https://api.allorigins.win/raw?url=${encoded}`,
  ]
}

async function fetchText(url, timeoutMs = 6500) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, { signal: controller.signal })
    if (!res.ok) throw new Error(`HTTP_${res.status}`)
    return await res.text()
  } finally {
    clearTimeout(timer)
  }
}

async function fetchFeed(feedUrl, source) {
  for (const url of feedUrls(feedUrl)) {
    try {
      const text = await fetchText(url)
      const items = parseFeed(text, source)
      if (items.length > 0) return items
    } catch {
      // Try the next URL variant, usually the CORS proxy.
    }
  }
  return []
}

function isRecentEnough(item) {
  const time = Date.parse(item.publishedAt)
  if (!time) return true
  const days = (Date.now() - time) / 86400000
  return days <= 14
}

function isUsefulAiItem(item) {
  const haystack = `${item.title} ${item.summary} ${item.source}`.toLowerCase()
  return AI_KEYWORDS.some(keyword => haystack.includes(keyword))
}

function dedupe(items) {
  const seen = new Set()
  return items.filter(item => {
    const key = (item.url || item.title).toLowerCase().replace(/[#?].*$/, '')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function fetchTrustedAiNews(limit = 5) {
  const feedTasks = AI_NEWS_SOURCES.flatMap(source =>
    source.feeds.map(feed => fetchFeed(feed, source))
  )
  const settled = await Promise.allSettled(feedTasks)
  const items = settled.flatMap(result => result.status === 'fulfilled' ? result.value : [])

  return dedupe(items)
    .filter(item => isRecentEnough(item) && isUsefulAiItem(item))
    .sort((a, b) => (Date.parse(b.publishedAt) || 0) - (Date.parse(a.publishedAt) || 0))
    .slice(0, limit)
}

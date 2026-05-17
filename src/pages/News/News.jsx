import React, { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronDown, ChevronUp, Copy, ExternalLink, MessageCircle, Plus } from 'lucide-react'
import useStore from '../../store/useStore'
import { callClaude, extractText, getNewsStylePrompt } from '../../utils/claude'
import { buildLinkPrompt, copyText } from '../../utils/gptPrompt'
import { describeNewsSources, SOURCE_GUIDE_ITEMS } from '../../data/newsSources'
import { fetchTrustedAiNews } from '../../utils/newsFeeds'

function isReliableUrl(url) {
  if (!url) return false
  try {
    const parsed = new URL(url)
    if (!['http:', 'https:'].includes(parsed.protocol)) return false
    const path = parsed.pathname.replace(/\/+$/, '')
    const lowerPath = path.toLowerCase()
    const genericPaths = new Set([
      '',
      '/',
      '/news',
      '/blog',
      '/research',
      '/technology',
      '/technology/ai',
      '/products',
      '/product',
      '/category',
      '/categories',
      '/tag',
      '/tags',
      '/search',
    ])
    if (genericPaths.has(lowerPath)) return false
    if (/\/(news|blog|technology|category|tag|tags|search)$/.test(lowerPath)) return false
    if (parsed.hostname.includes('woshipm.com') && !/\/[a-z]+\/\d+\.html$/i.test(path)) return false
    if (parsed.hostname.includes('anthropic.com') && !lowerPath.startsWith('/news/')) return false
    if (parsed.hostname.includes('blog.google') && lowerPath.split('/').filter(Boolean).length < 3) return false
    return true
  } catch {
    return false
  }
}

function normalizeNewsItems(items) {
  return (Array.isArray(items) ? items : [])
    .filter(item => item?.title && item?.summary)
    .map(item => ({
      ...item,
      url: isReliableUrl(item.url) ? item.url : '',
    }))
}

function linkKey(url = '') {
  return String(url).trim().replace(/#.*$/, '').replace(/\/$/, '').toLowerCase()
}

function formatSourceMeta(item, lang) {
  const date = item.publishedAt ? new Date(item.publishedAt) : null
  const validDate = date && !Number.isNaN(date.getTime())
  const dateText = validDate
    ? date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' })
    : ''
  return [item.source, dateText].filter(Boolean).join(' · ')
}

function NewsItem({ item, index }) {
  const { user, addLinkItem, linkVault = [] } = useStore()
  const lang = user.settings.language
  const [expanded, setExpanded] = useState(false)
  const [explanation, setExplanation] = useState(item.explanation || '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [savedFlash, setSavedFlash] = useState(false)
  const canOpenLink = item.isSourceGuide || isReliableUrl(item.url)
  const isSaved = useMemo(() => {
    const key = linkKey(item.url)
    return Boolean(key && linkVault.some(saved => linkKey(saved.url) === key))
  }, [item.url, linkVault])

  async function loadExplanation() {
    if (explanation) {
      setExpanded(e => !e)
      return
    }
    setExpanded(true)
    setLoading(true)
    try {
      const style = getNewsStylePrompt(user.settings.newsStyle, lang)
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: `请用 PREP + 时间线结构解读这条 AI 新闻，200-300 字。

语气模式：${style}
标题：${item.title}
摘要：${item.summary}
原文链接：${item.url || '暂无'}

要求：
1. P 观点：一句话说明这条新闻最重要的判断
2. R 理由：为什么值得 AI 产品经理关注
3. E 事例/细节：结合新闻里的产品、公司、模型或市场变化
4. P 总结：回到对 AI PM 的启发
5. 少寒暄，少废话，专业但好懂`,
        }],
        system: '你是 AI 产品经理领域的资深新闻分析师。输出要短、准、专业，不要闲聊。专业术语保留英文。',
        maxTokens: 520,
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
      })
      setExplanation(extractText(res))
    } catch {
      setExplanation('这条新闻值得关注，但当前无法生成站内解读。你可以先打开原文阅读，或复制 GPT Prompt 到网页端继续分析。')
    } finally {
      setLoading(false)
    }
  }

  async function copyPrompt() {
    await copyText(buildLinkPrompt(item.url || item.title, '请重点从 AI 产品经理视角分析。'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  function saveLink() {
    if (!canOpenLink) return
    addLinkItem({ url: item.url, title: item.title, note: item.summary, status: 'unread', source: item.source })
    setSavedFlash(true)
    window.dispatchEvent(new CustomEvent('miaotu:link-saved'))
    setTimeout(() => setSavedFlash(false), 1600)
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card overflow-hidden">
      <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-border-light/30 transition-colors" onClick={loadExplanation}>
        <div className="flex-1 min-w-0">
          {formatSourceMeta(item, lang) && <div className="news-source-meta">{formatSourceMeta(item, lang)}</div>}
          <div className="font-bold text-sm leading-snug mb-1.5">{item.title}</div>
          <div className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.summary}</div>
        </div>
        {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
      </button>
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-3 border-t border-border-light px-4 pb-4">
              {loading ? (
                <div className="pt-3 text-xs text-gray-400">正在生成 PREP 导读...</div>
              ) : (
                <p className="pt-3 text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{explanation}</p>
              )}
              <div className="flex flex-wrap gap-2">
                {canOpenLink ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="quick-button">
                    <ExternalLink size={13} /> {item.isSourceGuide ? '打开来源' : '原文链接'}
                  </a>
                ) : (
                  <span className="quick-button opacity-60">暂无可靠原文链接</span>
                )}
                <button type="button" onClick={copyPrompt} className="quick-button">
                  <Copy size={13} /> {copied ? '已复制' : '复制 GPT Prompt'}
                </button>
                <button type="button" onClick={saveLink} disabled={!canOpenLink || isSaved} className={`quick-button ${isSaved ? 'quick-button--saved' : ''}`}>
                  {isSaved ? <Check size={13} /> : <Plus size={13} />} {savedFlash ? '已存入资料夹' : isSaved ? '已存入' : '存入资料夹'}
                </button>
                <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('miaotu:open-oldcat'))} className="quick-button">
                  <MessageCircle size={13} /> 问老猫
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function News() {
  const { user, addExp, recordActivity } = useStore()
  const lang = user.settings.language
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadNews() }, [])

  async function loadNews() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const items = normalizeNewsItems(await fetchTrustedAiNews(5))
      if (items.length === 0) throw new Error('NO_FEED_ITEMS')
      setNews(prev => [...prev, ...items.map((item, i) => ({ ...item, id: `${Date.now()}_${i}` }))])
      addExp(2)
      recordActivity()
    } catch {
      setError('暂时没有拉到实时 RSS 内容，先展示固定来源入口；点原文可直接去对应站点查看最新 AI 动态。')
      setNews(SOURCE_GUIDE_ITEMS)
    } finally {
      setLoading(false)
    }
  }

  return (
      <div className="news-page flex gap-5">
        <div className="news-main flex-1 min-w-0 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="section-title text-xl">今日情报站</h1>
            <span className="text-xs text-gray-400">{new Date().toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          </div>
          {error && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">{error}</div>}
          <div className="space-y-3">
            {news.map((item, i) => <NewsItem key={item.id} item={item} index={i} />)}
          </div>
          <button onClick={loadNews} disabled={loading} className="btn-ghost w-full py-3 flex items-center justify-center gap-2">
            {loading ? '获取中...' : <><Plus size={16} /> 获取更多新闻</>}
          </button>
        </div>
        <aside className="news-source-aside w-56 flex-shrink-0 space-y-4">
          <div className="card p-4">
            <div className="text-xs font-bold text-gray-500 mb-2">今日来源</div>
            <p className="text-sm leading-relaxed text-gray-700">{describeNewsSources(lang)}</p>
          </div>
        </aside>
      </div>
  )
}

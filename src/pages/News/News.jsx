import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, Copy, ExternalLink, MessageCircle, Plus } from 'lucide-react'
import useStore from '../../store/useStore'
import { callClaude, extractText, getNewsStylePrompt } from '../../utils/claude'
import { buildLinkPrompt, copyText } from '../../utils/gptPrompt'
import PageTourGuide from '../../components/Tour/PageTourGuide'

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
    if (parsed.hostname.includes('openai.com') && !lowerPath.startsWith('/index/')) return false
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

function NewsItem({ item, index }) {
  const { user, addLinkItem } = useStore()
  const lang = user.settings.language
  const [expanded, setExpanded] = useState(false)
  const [explanation, setExplanation] = useState(item.explanation || '')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

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
    if (!isReliableUrl(item.url)) return
    addLinkItem({ url: item.url, title: item.title, note: item.summary, status: 'unread' })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="card overflow-hidden">
      <button className="w-full p-4 text-left flex items-start gap-3 hover:bg-border-light/30 transition-colors" onClick={loadExplanation}>
        <div className="flex-1 min-w-0">
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
                {isReliableUrl(item.url) ? (
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="quick-button">
                    <ExternalLink size={13} /> 原文链接
                  </a>
                ) : (
                  <span className="quick-button opacity-60">暂无可靠原文链接</span>
                )}
                <button type="button" onClick={copyPrompt} className="quick-button">
                  <Copy size={13} /> {copied ? '已复制' : '复制 GPT Prompt'}
                </button>
                <button type="button" onClick={saveLink} className="quick-button">
                  <Plus size={13} /> 存入资料夹
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
  const showPageTour = user.homeTourDone !== true && user.homeTourStep === 2
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { loadNews() }, [])

  async function loadNews() {
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await callClaude({
        messages: [{
          role: 'user',
          content: '请搜索最近 24-72 小时内 5 条重要 AI 行业新闻，必须返回具体原文文章链接，不要返回官网首页、新闻列表页、标签页、搜索页或栏目页。如果找不到具体文章链接，url 留空。返回 JSON 数组：[{"title":"","summary":"","url":""}]，不要有其他内容。',
        }],
        system: '你是 AI 新闻编辑，筛选对 AI 产品经理有学习价值的新闻。url 必须是可直接打开具体新闻原文的文章页，不能是站点首页、新闻中心、博客首页、分类页或聚合页。',
        maxTokens: 1200,
        tools: [{ type: 'web_search_20250305', name: 'web_search' }],
        apiKey: user.settings.apiKey,
        modelMode: user.settings.modelMode,
      })
      const text = extractText(res)
      const match = text.match(/\[[\s\S]*\]/)
      const items = normalizeNewsItems(match ? JSON.parse(match[0]) : MOCK_NEWS)
      setNews(prev => [...prev, ...items.map((item, i) => ({ ...item, id: `${Date.now()}_${i}` }))])
      addExp(2)
      recordActivity()
    } catch {
      setError('无法实时获取新闻，先展示示例新闻。设置 API Key 后可获取最新内容。')
      setNews(normalizeNewsItems(MOCK_NEWS))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className={`flex gap-5 ${showPageTour ? 'page-tour-highlight' : ''}`} data-tour-target="news-page">
        <div className="flex-1 min-w-0 space-y-4">
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
        <aside className="w-56 flex-shrink-0 space-y-4">
          <div className="card p-4">
            <div className="text-xs font-bold text-gray-500 mb-2">今日读法</div>
            <p className="text-sm leading-relaxed text-gray-700">每条新闻现在会按 PREP 导读：先观点，再理由，再细节，最后回到 AI PM 启发。重点还是打开原文看。</p>
          </div>
        </aside>
      </div>
      <PageTourGuide
        step={2}
        targetSelector="[data-tour-target='news-page']"
        titleZh="这里读 AI 新闻"
        titleEn="Read AI news here"
        bodyZh="进入情报站后，可以获取 AI 行业动态，展开每条新闻看 PREP 导读，也可以复制 GPT Prompt 或存入资料夹。"
        bodyEn="Inside the news station, fetch AI updates, expand each item for a PREP guide, copy a GPT prompt, or save useful links."
      />
    </>
  )
}

const MOCK_NEWS = [
  { id: 1, title: 'OpenAI 发布最新模型与开发者工具更新', summary: 'OpenAI 持续更新多模态模型、工具调用与开发者平台能力，AI 应用开发门槛进一步降低。', url: '' },
  { id: 2, title: 'Anthropic 更新 Claude 系列能力', summary: 'Claude 在代码、长上下文和 Agent 能力上继续强化，面向企业工作流的产品化趋势更明显。', url: '' },
  { id: 3, title: 'Google Gemini 面向更多企业场景开放', summary: 'Google 继续推进 Gemini 在 Workspace、云服务和企业 AI 场景中的集成。', url: '' },
  { id: 4, title: 'AI Agent 产品进入工作流落地阶段', summary: '越来越多 AI Agent 从演示型能力转向真实业务流程，产品经理需要关注任务闭环和可控性。', url: '' },
  { id: 5, title: 'AI 产品经理岗位持续升温', summary: '企业对懂产品、懂数据、懂 AI 能力边界的人才需求上升，面试更强调结构化表达和真实项目判断。', url: '' },
]

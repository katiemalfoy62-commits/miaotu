export const AI_NEWS_SOURCES = [
  {
    id: 'openai',
    name: 'OpenAI News',
    homepage: 'https://openai.com/news/',
    feeds: ['https://openai.com/news/rss.xml'],
    type: 'official',
  },
  {
    id: 'anthropic',
    name: 'Anthropic News',
    homepage: 'https://www.anthropic.com/news',
    feeds: ['https://www.anthropic.com/news/rss.xml'],
    type: 'official',
  },
  {
    id: 'deepmind',
    name: 'Google DeepMind Blog',
    homepage: 'https://deepmind.google/discover/blog/',
    feeds: ['https://deepmind.google/discover/blog/rss.xml'],
    type: 'official',
  },
  {
    id: 'meta-ai',
    name: 'Meta AI Blog',
    homepage: 'https://ai.meta.com/blog/',
    feeds: [],
    type: 'official',
  },
  {
    id: 'microsoft-ai',
    name: 'Microsoft AI Blog',
    homepage: 'https://blogs.microsoft.com/ai/',
    feeds: ['https://blogs.microsoft.com/ai/feed/'],
    type: 'official',
  },
  {
    id: 'mit-tr',
    name: 'MIT Technology Review',
    homepage: 'https://www.technologyreview.com/topic/artificial-intelligence/',
    feeds: ['https://www.technologyreview.com/feed/'],
    type: 'media',
  },
  {
    id: 'the-verge',
    name: 'The Verge AI',
    homepage: 'https://www.theverge.com/ai-artificial-intelligence',
    feeds: ['https://www.theverge.com/rss/ai-artificial-intelligence/index.xml'],
    type: 'media',
  },
  {
    id: 'techcrunch',
    name: 'TechCrunch AI',
    homepage: 'https://techcrunch.com/category/artificial-intelligence/',
    feeds: ['https://techcrunch.com/category/artificial-intelligence/feed/'],
    type: 'media',
  },
  {
    id: 'venturebeat',
    name: 'VentureBeat AI',
    homepage: 'https://venturebeat.com/ai/',
    feeds: ['https://venturebeat.com/category/ai/feed/'],
    type: 'media',
  },
  {
    id: 'ars-ai',
    name: 'Ars Technica AI',
    homepage: 'https://arstechnica.com/tag/artificial-intelligence/',
    feeds: ['https://arstechnica.com/tag/artificial-intelligence/feed/'],
    type: 'media',
  },
]

export const SOURCE_GUIDE_ITEMS = AI_NEWS_SOURCES.map(source => ({
  id: `source_${source.id}`,
  title: source.name,
  source: source.name,
  summary: source.type === 'official'
    ? '官方 AI 产品、模型、研究和平台更新来源，适合追踪一手发布。'
    : '权威科技媒体来源，适合观察 AI 产品落地、行业变化和商业影响。',
  url: source.homepage,
  publishedAt: '',
  isSourceGuide: true,
}))

export function describeNewsSources(lang = 'zh') {
  if (lang !== 'zh') {
    return 'MiaoTu follows official AI blogs and trusted tech media, then prioritizes recent product, model, tooling, and industry updates for AI PM learning.'
  }
  return '喵途会从 OpenAI、Anthropic、Google DeepMind、Meta AI、Microsoft AI 和主流科技媒体中挑选近期 AI 动态，优先保留适合 AI PM 学习的产品、工具、模型和行业新闻。'
}

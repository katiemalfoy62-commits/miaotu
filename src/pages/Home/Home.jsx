import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  BookOpen,
  ChevronRight,
  Fish,
  Heart,
  Sparkles,
  Star,
  Trophy,
} from 'lucide-react'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import ClayMascot from '../../components/Cat/ClayMascot'
import LayeredCat from '../../components/Cat/LayeredCat'
import ClayIcon from '../../components/UI/ClayIcon'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'
import { expInCurrentLevel } from '../../utils/levelCalc'
import stagePreview1 from '../../assets/cat-stages/clay-stage-1-transparent.png'
import stagePreview2 from '../../assets/cat-stages/clay-stage-2-transparent.png'
import stagePreview3 from '../../assets/cat-stages/clay-stage-3-transparent.png'
import stagePreview4 from '../../assets/cat-stages/clay-stage-4-transparent.png'
import stagePreview5 from '../../assets/cat-stages/clay-stage-5-transparent.png'
import stagePreview6 from '../../assets/cat-stages/clay-stage-6-transparent.png'

const MODULES = [
  {
    key: 'news',
    iconKey: 'news',
    path: '/news',
    titleKey: 'newsStation',
    descKey: 'newsDesc',
    labelZh: '今日 5 条',
    labelEn: '5 today',
    tone: 'module-amber',
  },
  {
    key: 'tasks',
    iconKey: 'tasks',
    path: '/tasks',
    titleKey: 'tasks',
    descKey: 'tasksDesc',
    labelZh: '可领取',
    labelEn: 'Ready',
    tone: 'module-mint',
  },
  {
    key: 'training',
    iconKey: 'training',
    path: '/training',
    titleKey: 'training',
    descKey: 'trainingDesc',
    labelZh: '未练习',
    labelEn: 'New round',
    tone: 'module-lavender',
  },
  {
    key: 'interview',
    iconKey: 'interview',
    path: '/interview',
    titleKey: 'interview',
    descKey: 'interviewDesc',
    labelZh: '模拟战',
    labelEn: 'Mock',
    tone: 'module-sky',
  },
]

const ABILITY_LABELS = {
  userNeeds: '用户需求分析',
  competitive: '竞品分析能力',
  business: '商业逻辑思维',
  data: '数据分析能力',
  expression: '表达结构清晰度',
  aiTech: 'AI技术理解深度',
}

const GROWTH_STATIONS = [
  { min: 1, max: 10, zh: '流浪小猫', en: 'Stray Kitten', noteZh: '开始认识 AI PM 世界', noteEn: 'Find your first direction' },
  { min: 11, max: 25, zh: '学生猫', en: 'Student Cat', noteZh: '补基础、练表达', noteEn: 'Build foundations' },
  { min: 26, max: 45, zh: '实习猫', en: 'Intern Cat', noteZh: '能写方案和拆问题', noteEn: 'Practice real PM work' },
  { min: 46, max: 70, zh: '初级 PM 猫', en: 'Junior PM Cat', noteZh: '形成产品判断力', noteEn: 'Grow product judgment' },
  { min: 71, max: 90, zh: '资深 PM 猫', en: 'Senior PM Cat', noteZh: '能独立负责模块', noteEn: 'Own bigger modules' },
  { min: 91, max: 100, zh: '首席猫', en: 'Chief Cat', noteZh: '带着全局视角做决策', noteEn: 'Lead with strategy' },
]

const GROWTH_STAGE_PREVIEWS = [
  stagePreview1,
  stagePreview2,
  stagePreview3,
  stagePreview4,
  stagePreview5,
  stagePreview6,
]

const TOUR_STEPS = [
  {
    key: 'hero',
    titleZh: '点击小猫查看成长地图',
    titleEn: 'Tap the cat to open the map',
    bodyZh: '先点一下小猫，它会展开你的 6 站成长地图。',
    bodyEn: 'Tap the cat first. It opens your six-stop growth map.',
    detailTitleZh: '这里是 6 站成长地图',
    detailTitleEn: 'Your six-stop growth map',
    detailBodyZh: '这里会展示从流浪小猫到首席猫的成长路线。可以点每一站，预览后续阶段会变成什么样。',
    detailBodyEn: 'This map shows the route from Stray Kitten to Chief Cat. Tap each station to preview future stages.',
  },
  {
    key: 'settings',
    titleZh: '先添加你的 API Key',
    titleEn: 'Add your API Key first',
    bodyZh: '喵途的总结、反馈、追问和老猫导师都需要你自己的 API Key。点击右上角设置，填好后就可以使用 AI 功能。',
    bodyEn: 'Miaotu uses your own API Key for summaries, feedback, follow-up questions, and Mentor Cat. Tap settings in the top right to add it.',
  },
  {
    key: 'news',
    titleZh: '今日情报站',
    titleEn: 'AI news station',
    bodyZh: '从这里读最新 AI/产品动态，适合每天快速热身。读完可以沉淀成你的产品观察和学习记录。',
    bodyEn: 'Read fresh AI and product updates here. It is a quick daily warm-up that can become product observations and study records.',
  },
  {
    key: 'tasks',
    titleZh: '委托任务',
    titleEn: 'Daily quests',
    bodyZh: '这里会给你每天的 PM 小任务，用真实工作场景练需求判断、拆解和表达。',
    bodyEn: 'Daily PM quests live here, so you can practice judgment, breakdowns, and communication in work-like scenarios.',
  },
  {
    key: 'training',
    titleZh: '思维训练',
    titleEn: 'Thinking drills',
    bodyZh: '这里用题目训练结构化思考。答得不好也没关系，后续会进入专项攻破和错题复盘。',
    bodyEn: 'Practice structured thinking here. Weak answers can later feed breakthrough drills and review.',
  },
  {
    key: 'interview',
    titleZh: '面试模拟',
    titleEn: 'Mock interview',
    bodyZh: '这里模拟 AI 产品经理面试，会根据回答继续追问，更像真实面试里的来回交流。',
    bodyEn: 'Practice AI PM interviews here. The interviewer follows up on your answers for a more realistic exchange.',
  },
  {
    key: 'cat',
    titleZh: '小猫、小鱼干和商城',
    titleEn: 'Your cat companion',
    bodyZh: '这里会显示小猫名字、等级和经验进度。完成学习会获得小鱼干，小鱼干可以去装扮商店慢慢解锁衣柜内容。',
    bodyEn: 'This area shows your cat name, level, and EXP. Learning earns fish, and fish can unlock shop and wardrobe items.',
  },
  {
    key: 'mentor',
    titleZh: '老猫导师和小猫树洞',
    titleEn: 'Ask Mentor Cat',
    bodyZh: '先点右上角的小老猫，它会打开导师对话面板。',
    bodyEn: 'Tap Mentor Cat on the right card to open the mentor panel.',
    detailTitleZh: '这里可以随时问老猫',
    detailTitleEn: 'Ask Mentor Cat here',
    detailBodyZh: '打开后可以问学习问题、整理思路，也可以把对话总结成提示词带去 GPT 深聊。左下角爱心入口是小猫树洞。',
    detailBodyEn: 'Use this panel for questions and thinking help. You can also copy a prompt for GPT. The heart entry opens Kitten Corner.',
  },
  {
    key: 'treehole',
    titleZh: '小猫树洞也在这里',
    titleEn: 'Kitten Corner is here too',
    bodyZh: '老猫聊天框收起后，可以点这个爱心入口进入小猫树洞。累了、卡住了或者想整理情绪时，可以先去那里待一会儿。',
    bodyEn: 'After Mentor Cat closes, tap this heart to enter Kitten Corner for softer support when you feel stuck or tired.',
  },
  {
    key: 'archive',
    titleZh: '攻破弱项和复盘',
    titleEn: 'Break through and review',
    bodyZh: '爆破猫咪负责专项练习；成长档案会记录任务、错题、日记和面试，方便你回头复盘。',
    bodyEn: 'Breakthrough drills target weak spots, while the archive keeps tasks, mistakes, diaries, and interviews.',
  },
  {
    key: 'floaters',
    titleZh: '右侧两个随身文件夹',
    titleEn: 'Two side folders',
    bodyZh: '右侧上方是资料夹，下方是老猫对话保存库。这里先看下方文件夹，之后可以回顾保存过的老猫讨论。',
    bodyEn: 'The upper folder saves links, and the lower one saves Mentor Cat chats. This step points to the saved-chat folder.',
    detailTitleZh: '资料和对话都可以先收起来',
    detailTitleEn: 'Save useful things here',
    detailBodyZh: '上方资料夹用来保存链接和素材；下方文件夹保存老猫对话。遇到有价值的资料和讨论，可以先放进来之后整理。',
    detailBodyEn: 'The upper folder saves links and materials. The lower folder saves Mentor Cat chats for later review.',
  },
]

const TOUR_TARGET_SELECTORS = {
  hero: '[data-tour-target="hero"]',
  heroDetail: '[data-tour-target="growth-map"]',
  settings: '[data-tour-target="settings"]',
  news: '[data-tour-target="news"]',
  tasks: '[data-tour-target="tasks"]',
  training: '[data-tour-target="training"]',
  interview: '[data-tour-target="interview"]',
  cat: '[data-tour-target="cat-avatar"]',
  mentor: '[data-tour-target="mentor"] .home-oldcat-entry',
  mentorDetail: '.oldcat-panel',
  treehole: '[data-tour-target="treehole"]',
  archive: '[data-tour-target="breakthrough-card"]',
  floaters: '.oldcat-memory-peek',
}

function ModuleCard({ mod, lang, index, highlighted = false, onTourOpen }) {
  return (
    <motion.div
      className={highlighted ? `tour-highlight tour-highlight-module tour-highlight-module-${mod.key}` : ''}
      data-tour-target={mod.key}
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <Link to={mod.path} className="block h-full" onClick={onTourOpen}>
        <article className={`module-card ${mod.tone}`}>
          <div className="module-card__shine" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-start justify-between gap-4">
              <div className="module-icon">
                <ClayIcon name={mod.iconKey} alt="" />
              </div>
              <span className="status-pill">{lang === 'zh' ? mod.labelZh : mod.labelEn}</span>
            </div>
            <div>
              <div className="mb-2 flex items-center gap-2">
                <h3 className="text-2xl font-black tracking-tight text-stone-900 dark:text-stone-50">
                  {t(mod.titleKey, lang)}
                </h3>
                <ChevronRight size={22} className="translate-y-0.5 opacity-55" />
              </div>
              <p className="max-w-[18rem] text-base font-bold leading-relaxed text-stone-600 dark:text-stone-300">
                {t(mod.descKey, lang)}
              </p>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  )
}

function AbilityRow({ name, value, index }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm font-black text-stone-600 dark:text-stone-300">
        <span className="truncate">{name}</span>
        <span>{value}</span>
      </div>
      <div className="clay-mini-track">
        <motion.div
          className="clay-mini-fill"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(value, index === 0 ? 12 : 6)}%` }}
          transition={{ delay: 0.45 + index * 0.05, duration: 0.7 }}
        />
      </div>
    </div>
  )
}

export default function Home() {
  const { user, tasks, stats, setHomeTourDone, setHomeTourStep } = useStore()
  const lang = user.settings.language
  const { current, needed, pct } = expInCurrentLevel(user.exp, user.level)
  const [mapOpen, setMapOpen] = useState(false)
  const [previewStationIndex, setPreviewStationIndex] = useState(null)
  const [showTour, setShowTour] = useState(() => user.homeTourDone !== true)
  const [tourIndex, setTourIndex] = useState(() => Math.min(user.homeTourStep || 0, TOUR_STEPS.length - 1))
  const [tourPhase, setTourPhase] = useState('prompt')
  const [pawPoint, setPawPoint] = useState(null)
  const tourStep = TOUR_STEPS[tourIndex]
  const tourDetailActive = showTour && tourPhase === 'detail'
  const heroMapOnlyActive = tourDetailActive && tourStep?.key === 'hero'
  const activeTourTitleZh = tourDetailActive ? (tourStep?.detailTitleZh || tourStep?.titleZh) : tourStep?.titleZh
  const activeTourTitleEn = tourDetailActive ? (tourStep?.detailTitleEn || tourStep?.titleEn) : tourStep?.titleEn
  const activeTourBodyZh = tourDetailActive ? (tourStep?.detailBodyZh || tourStep?.bodyZh) : tourStep?.bodyZh
  const activeTourBodyEn = tourDetailActive ? (tourStep?.detailBodyEn || tourStep?.bodyEn) : tourStep?.bodyEn

  useEffect(() => {
    document.documentElement.classList.toggle('dark', user.settings.theme === 'dark')
  }, [user.settings.theme])

  useEffect(() => {
    if (!showTour || user.homeTourDone === true) return
    const savedIndex = Math.min(user.homeTourStep || 0, TOUR_STEPS.length - 1)
    if (savedIndex !== tourIndex) {
      setTourIndex(savedIndex)
      setTourPhase('prompt')
    }
  }, [showTour, user.homeTourDone, user.homeTourStep, tourIndex])

  useEffect(() => {
    document.documentElement.classList.toggle('miaotu-home-tour-active', showTour)
    document.documentElement.classList.toggle('miaotu-home-tour-settings', showTour && tourStep?.key === 'settings')
    document.documentElement.classList.toggle('miaotu-home-tour-floaters', showTour && tourStep?.key === 'floaters')
    document.documentElement.classList.toggle('miaotu-home-tour-mentor', showTour && tourStep?.key === 'mentor')
    document.documentElement.classList.toggle('miaotu-home-tour-mentor-detail', showTour && tourStep?.key === 'mentor' && tourPhase === 'detail')
    return () => {
      document.documentElement.classList.remove('miaotu-home-tour-active')
      document.documentElement.classList.remove('miaotu-home-tour-settings')
      document.documentElement.classList.remove('miaotu-home-tour-floaters')
      document.documentElement.classList.remove('miaotu-home-tour-mentor')
      document.documentElement.classList.remove('miaotu-home-tour-mentor-detail')
    }
  }, [showTour, tourStep?.key, tourPhase])

  useEffect(() => {
    setTourPhase('prompt')
    if (tourStep?.key !== 'hero') {
      setMapOpen(false)
    }
  }, [tourStep?.key])

  useEffect(() => {
    if (!showTour || !tourStep) {
      setPawPoint(null)
      return undefined
    }

    const detailSelector = TOUR_TARGET_SELECTORS[`${tourStep.key}Detail`]
    const selector = tourPhase === 'detail' && detailSelector ? detailSelector : TOUR_TARGET_SELECTORS[tourStep.key]
    if (!selector) return undefined
    const shouldScroll = tourStep.key !== 'floaters' || tourPhase === 'detail'
    let cancelled = false

    function scrollTargetIntoView() {
      if (cancelled) return
      const target = document.querySelector(selector)
      if (target && shouldScroll) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' })
      }
    }

    function placePointer() {
      if (cancelled) return
      const target = document.querySelector(selector)
      if (!target) {
        setPawPoint(null)
        return
      }
      const rect = target.getBoundingClientRect()
      const nearRightEdge = rect.right > window.innerWidth - 128
      const rawX = nearRightEdge ? rect.left + rect.width * 0.5 : rect.left + rect.width * 0.74
      const rawY = nearRightEdge ? rect.top + rect.height * 0.5 : rect.top + rect.height * 0.42
      const x = Math.min(window.innerWidth - 40, Math.max(52, rawX))
      const y = Math.min(window.innerHeight - 40, Math.max(64, rawY))
      setPawPoint({ x, y })
    }

    const scrollTimers = shouldScroll ? [60, 320, 760, 1200].map(delay => window.setTimeout(scrollTargetIntoView, delay)) : []
    const timers = [80, 420, 760].map(delay => window.setTimeout(placePointer, delay))
    window.addEventListener('resize', placePointer)
    window.addEventListener('scroll', placePointer, { passive: true })

    return () => {
      cancelled = true
      scrollTimers.forEach(window.clearTimeout)
      timers.forEach(window.clearTimeout)
      window.removeEventListener('resize', placePointer)
      window.removeEventListener('scroll', placePointer)
    }
  }, [showTour, tourStep?.key, tourPhase])

  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const msLeft = midnight - now
  const hLeft = Math.floor(msLeft / 3600000)
  const mLeft = Math.floor((msLeft % 3600000) / 60000)
  const dayPct = (1 - msLeft / 86400000) * 100
  const activeTaskCount = (tasks.active || tasks.available || []).length
  const catName = user.catConfig.name || (lang === 'zh' ? 'Kivi' : 'Kivi')
  const currentStationIndex = GROWTH_STATIONS.findIndex(station => user.level >= station.min && user.level <= station.max)
  const safeStationIndex = currentStationIndex >= 0 ? currentStationIndex : 0
  const activePreviewIndex = previewStationIndex ?? safeStationIndex
  const activePreviewStation = GROWTH_STATIONS[activePreviewIndex]

  function closeTour(done = true) {
    setShowTour(false)
    if (done) setHomeTourDone(true)
  }

  function closeFloatingPanels() {
    window.dispatchEvent(new CustomEvent('miaotu:close-oldcat'))
    window.dispatchEvent(new CustomEvent('miaotu:close-floaters'))
  }

  function replayTour() {
    closeFloatingPanels()
    setTourIndex(0)
    setTourPhase('prompt')
    setMapOpen(false)
    setHomeTourStep(0)
    setShowTour(true)
    setHomeTourDone(false)
  }

  function activateTourDetail(key) {
    if (!showTour || tourStep?.key !== key) return
    setTourPhase('detail')
  }

  function nextTourStep() {
    closeFloatingPanels()
    if (tourIndex >= TOUR_STEPS.length - 1) {
      closeTour(true)
      return
    }
    const nextIndex = tourIndex + 1
    setTourPhase('prompt')
    setTourIndex(nextIndex)
    setHomeTourStep(nextIndex)
  }

  function closeGrowthMap() {
    setMapOpen(false)
    if (showTour && tourStep?.key === 'hero' && tourPhase === 'detail') {
      nextTourStep()
    }
  }

  const tourClass = (key) => showTour && tourStep?.key === key && tourPhase === 'prompt' ? 'tour-highlight' : ''

  function continueTourAfterModule(key) {
    if (!showTour || tourStep?.key !== key) return
    const nextIndex = Math.min(tourIndex + 1, TOUR_STEPS.length - 1)
    setTourIndex(nextIndex)
    setHomeTourStep(nextIndex)
    setTourPhase('prompt')
  }

  return (
    <div className={`home-shell clay-home ${showTour ? 'home-tour-active' : ''}`}>
      <section className={`clay-hero-panel ${mapOpen ? 'clay-hero-panel-map' : ''} ${tourClass('hero')}`}>
        {mapOpen && (
          <div
            className={`growth-map-panel ${showTour && tourStep?.key === 'hero' && tourPhase === 'detail' ? 'tour-map-spotlight' : ''}`}
            data-tour-target="growth-map"
          >
            <div className="growth-map-head">
              <div>
                <div className="eyebrow">
                  <Sparkles size={18} />
                  {lang === 'zh' ? 'Kivi 的 AI PM 成长地图' : "Kivi's AI PM map"}
                </div>
                <h1>{lang === 'zh' ? '六站养成路线' : 'Six-stop growth route'}</h1>
              </div>
              <button type="button" onClick={closeGrowthMap} className="growth-map-close">
                {lang === 'zh' ? '返回首页' : 'Back'}
              </button>
            </div>

            <div className="growth-route">
              <div className="growth-route-line" />
              {GROWTH_STATIONS.map((station, index) => {
                const reached = index <= safeStationIndex
                const active = index === safeStationIndex
                const previewing = previewStationIndex === index
                return (
                  <button
                    type="button"
                    key={station.en}
                    className={`growth-station ${reached ? 'is-reached' : ''} ${active ? 'is-active' : ''} ${previewing ? 'is-preview' : ''}`}
                    onMouseEnter={() => setPreviewStationIndex(index)}
                    onMouseLeave={() => setPreviewStationIndex(null)}
                    onFocus={() => setPreviewStationIndex(index)}
                    onBlur={() => setPreviewStationIndex(null)}
                    onClick={() => setPreviewStationIndex(index)}
                  >
                    <img
                      src={GROWTH_STAGE_PREVIEWS[index]}
                      alt=""
                      className="growth-station-cat"
                      aria-hidden="true"
                    />
                    <span className="growth-station-marker">{index + 1}</span>
                    <strong>{lang === 'zh' ? station.zh : station.en}</strong>
                    <small>Lv {station.min}-{station.max}</small>
                    <em>{lang === 'zh' ? station.noteZh : station.noteEn}</em>
                  </button>
                )
              })}
            </div>

            <div className="growth-map-footer">
              <div className="growth-map-preview-cat" aria-hidden="true">
                <img src={GROWTH_STAGE_PREVIEWS[activePreviewIndex]} alt="" />
              </div>
              <div className="growth-map-stage-copy">
                <strong>
                  {previewStationIndex === null
                    ? `${catName} · Lv ${user.level}`
                    : `${lang === 'zh' ? activePreviewStation.zh : activePreviewStation.en} · Lv ${activePreviewStation.min}-${activePreviewStation.max}`}
                </strong>
                <span>{lang === 'zh' ? `当前预览：${activePreviewStation.zh}` : `Preview: ${activePreviewStation.en}`}</span>
              </div>
              <div className="growth-map-progress">
                <i><b style={{ width: `${pct}%` }} /></i>
                <small>{current} / {needed}</small>
              </div>
            </div>
          </div>
        )}
        <div className="clay-hero-copy">
          <div className="eyebrow">
            <Sparkles size={18} />
            {lang === 'zh' ? 'AI PM 成长地图' : 'AI PM growth map'}
          </div>
          <h1>{lang === 'zh' ? '今天也要把小猫养成产品经理' : 'Train your PM cat today'}</h1>
          <p>
            {lang === 'zh'
              ? '读情报、接委托、练思维、模拟面试，每一步都会沉进你的成长档案。'
              : 'News, tasks, thinking drills, and interviews all flow into your growth archive.'}
          </p>
        </div>

        <button
          className="clay-hero-mascot"
          type="button"
          onClick={() => {
            setMapOpen(true)
            activateTourDetail('hero')
          }}
          title={lang === 'zh' ? '查看成长地图' : 'Open growth map'}
          data-tour-target="hero"
        >
          <span className="clay-star clay-star-one">✦</span>
          <LayeredCat
            catConfig={user.catConfig}
            level={user.level}
            equippedItems={user.equippedItems}
            className="hero-layered-cat"
          />
        </button>

        <div className="clay-hero-stats">
          <div>
            <span>{lang === 'zh' ? '等级' : 'Level'}</span>
            <strong>Lv {user.level}</strong>
            <i><b style={{ width: `${pct}%` }} /></i>
          </div>
          <div>
            <span>{lang === 'zh' ? '小鱼干' : 'Fish'}</span>
            <strong>{user.fish}</strong>
          </div>
          <div>
            <span>{lang === 'zh' ? '任务' : 'Tasks'}</span>
            <strong>{activeTaskCount}</strong>
          </div>
        </div>
      </section>

      <div className="home-grid clay-home-grid">
        <main className="space-y-5">
          <section>
            <div className="mb-3 flex items-end justify-between">
              <div>
                <div className="section-kicker">{lang === 'zh' ? '学习模块' : 'Modules'}</div>
                <h2 className="text-2xl font-black text-stone-900 dark:text-stone-50">
                  {lang === 'zh' ? '选择今天的闯关入口' : 'Choose today’s quest'}
                </h2>
              </div>
              <div className="hidden items-center gap-1 rounded-full border border-[#d9bd93] bg-[#fff8e9] px-3 py-1.5 text-xs font-black text-[#a95525] shadow-[0_5px_12px_rgba(87,52,22,0.12)] sm:flex">
                <Star size={13} fill="currentColor" />
                {lang === 'zh' ? '连续学习 1 天' : '1 day streak'}
              </div>
            </div>
            <button type="button" onClick={replayTour} className="tour-replay-button">
              {lang === 'zh' ? '新手指引' : 'Tour'}
            </button>
            <div className="grid gap-4 md:grid-cols-2">
              {MODULES.map((mod, i) => (
                <ModuleCard
                  key={mod.key}
                  mod={mod}
                  lang={lang}
                  index={i}
                  highlighted={showTour && tourStep?.key === mod.key}
                  onTourOpen={() => continueTourAfterModule(mod.key)}
                />
              ))}
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className={`clay-cat-stage-card ${tourClass('cat')}`}
            data-tour-target="cat"
          >
            <div className="clay-cat-scene">
              <span className="clay-stage-plant">🌱</span>
              <Link to="/wardrobe" title={t('clickToWardrobe', lang)} className="clay-cat-link" data-tour-target="cat-avatar">
                <LayeredCat
                  catConfig={user.catConfig}
                  level={user.level}
                  equippedItems={user.equippedItems}
                  className="home-layered-cat"
                />
              </Link>
              <ClayIcon name="fish" className="clay-stage-fish-icon" alt="" />
              <Link to="/wardrobe" className="wardrobe-link">
                {t('clickToWardrobe', lang)}
              </Link>
            </div>

            <div className="clay-cat-info">
              <div className="flex flex-wrap items-center gap-3">
                <span className="level-badge">{t(user.catStage, lang)} · Lv {user.level}</span>
                <span className="soft-badge"><Trophy size={14} /> {lang === 'zh' ? '新手旅程' : 'Starter trail'}</span>
              </div>

              <div>
                <h2>{catName}</h2>
                <p>
                  {lang === 'zh'
                    ? '下一阶段：学生猫。继续完成训练解锁新外形。'
                    : 'Next stage: Student Cat. Keep training to unlock a new look.'}
                </p>
              </div>

              <div>
                <div className="mb-2 flex justify-between text-sm font-black text-stone-600 dark:text-stone-300">
                  <span>{t('expProgress', lang)}</span>
                  <span>{current} / {needed}</span>
                </div>
                <div className="stage-progress">
                  <motion.div
                    className="stage-progress-fill"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link to="/shop">
                  <button className="fish-button">
                    <Fish size={19} />
                    <strong>{user.fish}</strong>
                    <span>{t('fishCount', lang)}</span>
                  </button>
                </Link>
                <Link to="/archive">
                  <button className="archive-button">
                    <BookOpen size={18} />
                    {t('growthArchive', lang)}
                  </button>
                </Link>
              </div>
            </div>
          </motion.section>
        </main>

        <aside className="space-y-4">
          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.18 }}
            className={`side-card timer-card clay-side-card ${tourClass('mentor')}`}
            data-tour-target="mentor"
          >
            <div className="clay-timer-layout">
              <div className="clay-timer-copy">
                <div className="side-card-title">{t('todayTaskTime', lang)}</div>
                <div className="time-display">
                  {hLeft}<span>h</span> {mLeft}<span>m</span>
                </div>
                <div className="stage-progress h-3">
                  <div className="stage-progress-fill" style={{ width: `${dayPct}%` }} />
                </div>
              </div>
              <button
                className="home-oldcat-entry"
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('miaotu:open-oldcat'))
                  window.setTimeout(() => activateTourDetail('mentor'), 80)
                }}
                title={lang === 'zh' ? '召唤老猫导师' : 'Open mentor cat'}
              >
                <BlinkingClayMascot type="oldcat" className="home-oldcat-mascot" interactive />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link to="/trehole" onClick={() => continueTourAfterModule('treehole')}>
                <button className={`treehole-button ${tourClass('treehole')}`} data-tour-target="treehole" title={lang === 'zh' ? '小猫树洞' : 'Kitten Corner'}>
                  <Heart size={17} />
                </button>
              </Link>
              <span className="text-sm font-black text-stone-500">
                {activeTaskCount > 0 ? `${activeTaskCount}${lang === 'zh' ? ' 个任务进行中' : ' active'}` : (lang === 'zh' ? '今日无任务' : 'No tasks')}
              </span>
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, x: 18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.28 }}
            className={`side-card growth-card clay-side-card ${tourClass('archive')}`}
            data-tour-target="archive"
          >
            <Link to="/breakthrough" className="home-breakthrough-card" data-tour-target="breakthrough-card">
              <div>
                <span>专项攻破</span>
                <strong>爆破猫咪</strong>
                <small>把难题拆成 5 道同类训练</small>
              </div>
              <ClayMascot type="breakthrough" className="home-breakthrough-mascot" />
            </Link>

            <div className="flex items-center justify-between">
              <div className="side-card-title">{t('growthArchive', lang)}</div>
              <Link to="/archive" className="text-[#c8622a]">
                <ChevronRight size={20} />
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {Object.entries(stats.abilityScores).slice(0, 6).map(([key, val], index) => (
                <AbilityRow key={key} name={lang === 'zh' ? (ABILITY_LABELS[key] || key) : t(key, lang)} value={val} index={index} />
              ))}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2">
              <Link to="/archive/wrongbook">
                <button className="quick-button quick-red">
                  <BookOpen size={15} />
                  {t('wrongBook', lang)}
                </button>
              </Link>
              <Link to="/archive/diary">
                <button className="quick-button quick-blue">
                  <span>📘</span>
                  {t('studyDiary', lang)}
                </button>
              </Link>
              <Link to="/archive/interviews">
                <button className="quick-button quick-blue">
                  <span>🎙</span>
                  面试记录
                </button>
              </Link>
              <Link to="/breakthrough">
                <button className="quick-button quick-red">
                  <span>💥</span>
                  专项攻破
                </button>
              </Link>
            </div>
          </motion.section>
        </aside>
      </div>

      {showTour && tourStep && (
        <>
          <div className="home-tour-dim" aria-hidden="true" />
          {pawPoint && !heroMapOnlyActive && (
            <motion.div
              className={`tour-paw-pointer tour-paw-pointer--${tourStep.key}`}
              initial={false}
              animate={{ left: pawPoint.x, top: pawPoint.y }}
              transition={{ type: 'spring', stiffness: 105, damping: 20, mass: 0.82 }}
              aria-hidden="true"
            >
              <span className="tour-paw-body">
                <span className="tour-paw-toe tour-paw-toe-one" />
                <span className="tour-paw-toe tour-paw-toe-two" />
                <span className="tour-paw-toe tour-paw-toe-three" />
                <span className="tour-paw-toe tour-paw-toe-four" />
                <span className="tour-paw-pad" />
              </span>
            </motion.div>
          )}
          {!heroMapOnlyActive && (
          <motion.div
            className={`home-tour-card home-tour-card--${tourStep.key}`}
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <BlinkingClayMascot type="oldcat" className="home-tour-oldcat" />
            <div className="home-tour-copy">
              <span>{tourIndex + 1} / {TOUR_STEPS.length}</span>
              <h3>{lang === 'zh' ? activeTourTitleZh : activeTourTitleEn}</h3>
              <p>{lang === 'zh' ? activeTourBodyZh : activeTourBodyEn}</p>
              <div className="home-tour-actions">
                {tourStep.key === 'settings' && (
                  <button type="button" onClick={nextTourStep}>
                    {lang === 'zh' ? '先跳过' : 'Skip for now'}
                  </button>
                )}
                <button type="button" onClick={nextTourStep}>
                  {tourIndex >= TOUR_STEPS.length - 1
                    ? (lang === 'zh' ? '开始学习' : 'Start')
                    : (lang === 'zh' ? '下一步' : 'Next')}
                </button>
              </div>
            </div>
          </motion.div>
          )}
        </>
      )}
    </div>
  )
}

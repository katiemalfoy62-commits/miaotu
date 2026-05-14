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
    titleZh: '先看今天的总览',
    titleEn: 'Start with today',
    bodyZh: '这里会告诉你等级、小鱼干、任务数量和成长路线。点小猫可以查看后续阶段会变成什么样。',
    bodyEn: 'This area shows level, fish, active tasks, and the growth route. Tap the cat to preview future stages.',
  },
  {
    key: 'modules',
    titleZh: '四个学习入口',
    titleEn: 'Four learning doors',
    bodyZh: '每天可以从情报站、委托任务、思维训练、面试模拟里选一个开始。它们都会沉淀到成长档案。',
    bodyEn: 'Pick AI news, quests, thinking drills, or interview practice. Each session flows into the archive.',
  },
  {
    key: 'cat',
    titleZh: '你的专属小猫',
    titleEn: 'Your cat companion',
    bodyZh: '这里会显示你的小猫名字、等级和经验进度。继续学习，就能沿着成长路线解锁新的阶段。',
    bodyEn: 'This area shows your cat name, level, and EXP progress. Keep learning to unlock new growth stages.',
  },
  {
    key: 'mentor',
    titleZh: '找老猫问问题',
    titleEn: 'Ask Mentor Cat',
    bodyZh: '右侧的老猫入口可以随时打开导师对话，不懂的题、新闻、面试表达都可以继续追问。',
    bodyEn: 'Open the mentor cat from the side panel when you want help with news, tasks, or interview answers.',
  },
  {
    key: 'archive',
    titleZh: '攻破弱项和复盘',
    titleEn: 'Break through and review',
    bodyZh: '爆破猫咪负责专项练习；成长档案会记录任务、错题、日记和面试，方便你回头复盘。',
    bodyEn: 'Breakthrough drills target weak spots, while the archive keeps tasks, mistakes, diaries, and interviews.',
  },
]

function ModuleCard({ mod, lang, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: index * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
    >
      <Link to={mod.path} className="block h-full">
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
  const { user, tasks, stats, setHomeTourDone } = useStore()
  const lang = user.settings.language
  const { current, needed, pct } = expInCurrentLevel(user.exp, user.level)
  const [mapOpen, setMapOpen] = useState(false)
  const [previewStationIndex, setPreviewStationIndex] = useState(null)
  const [showTour, setShowTour] = useState(() => user.homeTourDone !== true)
  const [tourIndex, setTourIndex] = useState(0)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', user.settings.theme === 'dark')
  }, [user.settings.theme])

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
  const tourStep = TOUR_STEPS[tourIndex]

  function closeTour(done = true) {
    setShowTour(false)
    if (done) setHomeTourDone(true)
  }

  function replayTour() {
    setTourIndex(0)
    setShowTour(true)
    setHomeTourDone(false)
  }

  function nextTourStep() {
    if (tourIndex >= TOUR_STEPS.length - 1) {
      closeTour(true)
      return
    }
    setTourIndex(index => index + 1)
  }

  const tourClass = (key) => showTour && tourStep?.key === key ? 'tour-highlight' : ''

  return (
    <div className={`home-shell clay-home ${showTour ? 'home-tour-active' : ''}`}>
      <section className={`clay-hero-panel ${mapOpen ? 'clay-hero-panel-map' : ''} ${tourClass('hero')}`}>
        {mapOpen && (
          <div className="growth-map-panel">
            <div className="growth-map-head">
              <div>
                <div className="eyebrow">
                  <Sparkles size={18} />
                  {lang === 'zh' ? 'Kivi 的 AI PM 成长地图' : "Kivi's AI PM map"}
                </div>
                <h1>{lang === 'zh' ? '六站养成路线' : 'Six-stop growth route'}</h1>
              </div>
              <button type="button" onClick={() => setMapOpen(false)} className="growth-map-close">
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

        <button className="clay-hero-mascot" type="button" onClick={() => setMapOpen(true)} title={lang === 'zh' ? '查看成长地图' : 'Open growth map'}>
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
          <section className={tourClass('modules')}>
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
                <ModuleCard key={mod.key} mod={mod} lang={lang} index={i} />
              ))}
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.32 }}
            className={`clay-cat-stage-card ${tourClass('cat')}`}
          >
            <div className="clay-cat-scene">
              <span className="clay-stage-plant">🌱</span>
              <Link to="/wardrobe" title={t('clickToWardrobe', lang)} className="clay-cat-link">
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
                onClick={() => window.dispatchEvent(new CustomEvent('miaotu:open-oldcat'))}
                title={lang === 'zh' ? '召唤老猫导师' : 'Open mentor cat'}
              >
                <BlinkingClayMascot type="oldcat" className="home-oldcat-mascot" interactive />
              </button>
            </div>
            <div className="mt-4 flex items-center justify-between">
              <Link to="/trehole">
                <button className="treehole-button" title={lang === 'zh' ? '小猫树洞' : 'Kitten Corner'}>
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
          >
            <Link to="/breakthrough" className="home-breakthrough-card">
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
          <motion.div
            className="home-tour-card"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
          >
            <BlinkingClayMascot type="oldcat" className="home-tour-oldcat" />
            <div className="home-tour-copy">
              <span>{tourIndex + 1} / {TOUR_STEPS.length}</span>
              <h3>{lang === 'zh' ? tourStep.titleZh : tourStep.titleEn}</h3>
              <p>{lang === 'zh' ? tourStep.bodyZh : tourStep.bodyEn}</p>
              <div className="home-tour-actions">
                <button type="button" onClick={() => closeTour(true)}>
                  {lang === 'zh' ? '跳过' : 'Skip'}
                </button>
                <button type="button" onClick={nextTourStep}>
                  {tourIndex >= TOUR_STEPS.length - 1
                    ? (lang === 'zh' ? '开始学习' : 'Start')
                    : (lang === 'zh' ? '下一步' : 'Next')}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </div>
  )
}

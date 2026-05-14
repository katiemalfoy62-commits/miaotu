import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import LayeredCat, { CAT_PATTERNS } from '../../components/Cat/LayeredCat'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'

const STEPS = [
  { id: 'welcome' },
  { id: 'modules' },
  { id: 'rewards' },
  { id: 'customize' },
]

const FOCUS_OPTIONS = ['news', 'tasks', 'training', 'interview', 'growth']
const COLOR_OPTIONS = ['orange', 'gray', 'brown', 'black', 'white', 'cream']
const EYE_OPTIONS = ['yellow', 'green', 'blue', 'amber']
const PATTERN_OPTIONS = CAT_PATTERNS

const focusLabels = {
  zh: {
    news: '行业动态',
    tasks: '任务实战',
    training: '结构思考',
    interview: '面试表达',
    growth: '成长复盘',
  },
  en: {
    news: 'AI news',
    tasks: 'Practice tasks',
    training: 'Structured thinking',
    interview: 'Interview expression',
    growth: 'Growth review',
  },
}

const colorLabels = {
  zh: { orange: '橘色', gray: '灰色', brown: '棕色', black: '黑色', white: '白色', cream: '奶白' },
  en: { orange: 'Orange', gray: 'Gray', brown: 'Brown', black: 'Black', white: 'White', cream: 'Cream' },
}

const eyeLabels = {
  zh: { yellow: '黄色', green: '绿色', blue: '蓝色', amber: '琥珀' },
  en: { yellow: 'Yellow', green: 'Green', blue: 'Blue', amber: 'Amber' },
}

const patternLabels = {
  zh: {
    none: '无花纹',
    tabby: '虎斑',
    spots: '斑点',
    calico_orange: '橘花',
    calico_black: '黑花',
    face_mask: '面具',
    socks_white: '白手套',
    tail_tip: '尾巴尖',
  },
  en: {
    none: 'None',
    tabby: 'Tabby',
    spots: 'Spots',
    calico_orange: 'Orange calico',
    calico_black: 'Black calico',
    face_mask: 'Mask',
    socks_white: 'White socks',
    tail_tip: 'Tail tip',
  },
}

const genderLabels = {
  zh: { male: '男生', female: '女生' },
  en: { male: 'Male', female: 'Female' },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setOnboardingDone, setCatConfig } = useStore()
  const lang = user.settings.language

  const [step, setStep] = useState(0)
  const [catForm, setCatForm] = useState({
    name: '',
    focus: 'training',
    color: 'orange',
    eyeColor: 'green',
    pattern: 'none',
    gender: 'female',
  })

  function next() {
    setStep(s => s + 1)
  }

  function finish() {
    setCatConfig(catForm)
    setOnboardingDone()
    navigate('/')
  }

  function skip() {
    finish()
  }

  const messages = {
    welcome: [
      lang === 'zh'
        ? '喵~ 你好！我是老猫，你的 AI 产品经理学习向导。'
        : 'Meow~ Hello! I am the Mentor Cat, your AI PM learning guide.',
      lang === 'zh'
        ? '喵途会陪你把新闻阅读、任务练习、结构化思考和模拟面试，慢慢沉淀成自己的成长档案。'
        : 'MiaoTu helps you turn news reading, practice tasks, structured thinking, and mock interviews into a real growth archive.',
    ],
    modules: [
      lang === 'zh'
        ? '我先带你认识喵途现在的学习入口。'
        : 'Let me show you the learning areas in MiaoTu.',
      lang === 'zh'
        ? '今日情报站：用 PREP 结构读 AI 新闻，保存原文链接\n委托任务：每天完成产品练习，获得反馈和奖励\n思维训练：两阶段答题，打磨 PM 分析框架\n专项突破：把薄弱题型拆成 5 道同类练习\n面试模拟：和 16 位面试官猫猫进行实战演练\n成长档案：复盘任务、错题、日记和面试记录\n老猫导师：随时提问、保存对话，也可以带着提示词去 GPT 深聊'
        : 'AI News: Read AI updates with PREP summaries and save source links\nQuests: Finish daily product tasks with feedback and rewards\nTraining: Practice two-stage PM thinking drills\nBreakthrough: Turn weak question types into five focused drills\nInterview Sim: Practice with 16 interviewer cats\nGrowth Archive: Review tasks, mistakes, diary notes, and interviews\nMentor Cat: Ask questions, save chats, and continue deeper in GPT',
    ],
    rewards: [
      lang === 'zh'
        ? '完成学习会获得经验值和小鱼干：经验让小猫成长，小鱼干可以去商店慢慢解锁装扮。'
        : 'Complete learning sessions to earn EXP and fish: EXP grows your cat, and fish unlock accessories over time.',
      lang === 'zh'
        ? '小猫会经历 6 个阶段：流浪小猫 -> 学生猫 -> 实习猫 -> 初级 PM 猫 -> 资深 PM 猫 -> 首席猫。'
        : 'Your cat has 6 growth stages: Stray Kitten -> Student Cat -> Intern Cat -> Junior PM Cat -> Senior Cat -> Chief Cat.',
    ],
    customize: [
      lang === 'zh'
        ? '最后，给你的学习搭档取个名字，再选一个当前最想加强的方向。'
        : 'Finally, name your learning companion and choose the area you want to strengthen first.',
    ],
  }

  const currentStepId = STEPS[step]?.id
  const currentMsgs = messages[currentStepId] || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bg-light p-4 dark:bg-bg-dark">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md space-y-6"
      >
        {['welcome', 'modules', 'rewards'].includes(currentStepId) && (
          <div className="card space-y-6 p-8 text-center">
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="flex justify-center"
            >
              <BlinkingClayMascot type="oldcat" className="onboarding-oldcat-clay" />
            </motion.div>

            <div className="space-y-3">
              {currentMsgs.map((msg, i) => (
                <motion.div
                  key={msg}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="card border-amber-200 bg-amber-50 p-4 text-left text-sm leading-relaxed dark:border-amber-700 dark:bg-amber-900/20 whitespace-pre-line"
                >
                  {msg}
                </motion.div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={skip} className="btn-ghost flex-1 text-sm">{t('skip', lang)}</button>
              <button onClick={next} className="btn-primary flex-1">{lang === 'zh' ? '下一步' : 'Next'}</button>
            </div>
          </div>
        )}

        {currentStepId === 'customize' && (
          <div className="card space-y-5 p-6">
            <div className="text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mb-4 flex justify-center">
                <BlinkingClayMascot type="oldcat" className="onboarding-oldcat-clay onboarding-oldcat-clay-small" />
              </motion.div>
              <div className="text-base font-bold text-primary dark:text-primary-dark">
                {lang === 'zh' ? '设计你的专属小猫！' : 'Design your own cat!'}
              </div>
            </div>

            <div className="flex justify-center">
              <motion.div
                key={JSON.stringify(catForm)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <LayeredCat catConfig={catForm} level={1} className="onboarding-layered-cat" />
              </motion.div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '名字' : 'Name'}</div>
              <input
                className="input-base"
                placeholder={lang === 'zh' ? '给小猫取个名字...' : 'Give your cat a name...'}
                value={catForm.name}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '学习重点' : 'Learning Focus'}</div>
              <div className="flex flex-wrap gap-2">
                {FOCUS_OPTIONS.map(focus => (
                  <button
                    key={focus}
                    onClick={() => setCatForm(f => ({ ...f, focus }))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${catForm.focus === focus ? 'border-primary bg-primary text-white' : 'border-border-light hover:bg-border-light dark:border-border-dark dark:hover:bg-border-dark'}`}
                  >
                    {focusLabels[lang][focus]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '毛色偏好' : 'Fur Color'}</div>
              <div className="flex flex-wrap gap-2">
                {COLOR_OPTIONS.map(color => (
                  <button
                    key={color}
                    onClick={() => setCatForm(f => ({ ...f, color }))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${catForm.color === color ? 'border-primary bg-primary text-white' : 'border-border-light hover:bg-border-light dark:border-border-dark dark:hover:bg-border-dark'}`}
                  >
                    {colorLabels[lang][color]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '眼睛颜色偏好' : 'Eye Color'}</div>
              <div className="flex gap-2">
                {EYE_OPTIONS.map(eyeColor => (
                  <button
                    key={eyeColor}
                    onClick={() => setCatForm(f => ({ ...f, eyeColor }))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${catForm.eyeColor === eyeColor ? 'border-primary bg-primary text-white' : 'border-border-light hover:bg-border-light dark:border-border-dark dark:hover:bg-border-dark'}`}
                  >
                    {eyeLabels[lang][eyeColor]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '花纹偏好' : 'Pattern'}</div>
              <div className="flex flex-wrap gap-2">
                {PATTERN_OPTIONS.map(pattern => (
                  <button
                    key={pattern}
                    onClick={() => setCatForm(f => ({ ...f, pattern }))}
                    className={`rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all ${catForm.pattern === pattern ? 'border-primary bg-primary text-white' : 'border-border-light hover:bg-border-light dark:border-border-dark dark:hover:bg-border-dark'}`}
                  >
                    {patternLabels[lang][pattern]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '称呼偏好' : 'Pronoun Style'}</div>
              <div className="flex gap-3">
                {['male', 'female'].map(gender => (
                  <button
                    key={gender}
                    onClick={() => setCatForm(f => ({ ...f, gender }))}
                    className={`flex-1 rounded-xl border py-2 text-xs font-bold transition-all ${catForm.gender === gender ? 'border-primary bg-primary text-white' : 'border-border-light hover:bg-border-light dark:border-border-dark dark:hover:bg-border-dark'}`}
                  >
                    {genderLabels[lang][gender]}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={finish}
              disabled={!catForm.name}
              className="btn-primary w-full py-3 font-bold"
            >
              {lang === 'zh' ? `完成！迎接 ${catForm.name || '小猫'}！` : `Done! Welcome ${catForm.name || 'Kitty'}!`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

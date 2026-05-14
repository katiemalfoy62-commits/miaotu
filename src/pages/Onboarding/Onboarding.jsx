import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import LayeredCat from '../../components/Cat/LayeredCat'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'

const STEPS = [
  { id: 'welcome' },
  { id: 'modules' },
  { id: 'rewards' },
  { id: 'setup' },
]

const MENTOR_PERSONALITIES = ['teacher', 'coach', 'friend', 'senior']

const personalityLabels = {
  zh: {
    teacher: '严格导师型',
    coach: '面试教练型',
    friend: '温柔鼓励型',
    senior: '产品前辈型',
  },
  en: {
    teacher: 'Strict mentor',
    coach: 'Interview coach',
    friend: 'Gentle encourager',
    senior: 'Senior PM',
  },
}

const personalityDescriptions = {
  zh: {
    teacher: '更直接指出问题，适合想快速补短板。',
    coach: '关注表达结构和面试回答。',
    friend: '语气更轻松，会多给鼓励。',
    senior: '像产品前辈一样给你拆思路。',
  },
  en: {
    teacher: 'Direct feedback for faster improvement.',
    coach: 'Focuses on interview expression and structure.',
    friend: 'Warmer and more encouraging.',
    senior: 'Thinks with you like a senior PM.',
  },
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setOnboardingDone, setCatConfig, updateSettings } = useStore()
  const lang = user.settings.language

  const [step, setStep] = useState(0)
  const [catName, setCatName] = useState(user.catConfig?.name || '')
  const [mentorStyle, setMentorStyle] = useState(user.settings.catPersonality || 'teacher')

  function next() {
    setStep(s => Math.min(s + 1, STEPS.length - 1))
  }

  function finish() {
    setCatConfig({
      name: catName.trim() || 'Kivi',
      focus: 'training',
    })
    updateSettings({ catPersonality: mentorStyle })
    setOnboardingDone()
    navigate('/')
  }

  function skip() {
    finish()
  }

  const messages = {
    welcome: [
      lang === 'zh'
        ? '喵，你好！我是老猫，你的 AI 产品经理学习向导。'
        : 'Meow, hello! I am Mentor Cat, your AI product manager learning guide.',
      lang === 'zh'
        ? '喵途会陪你把 AI 新闻、任务练习、结构化思考和模拟面试，慢慢沉淀成自己的成长档案。'
        : 'MiaoTu helps you turn AI news, practice tasks, structured thinking, and mock interviews into a real growth archive.',
    ],
    modules: [
      lang === 'zh'
        ? '先认识一下喵途现在的学习入口。'
        : 'Let me show you the learning areas in MiaoTu.',
      lang === 'zh'
        ? '今日情报站：用 PREP 结构读 AI 新闻，保存原文链接\n委托任务：每天完成产品练习，获得反馈和奖励\n思维训练：两阶段答题，打磨 PM 分析框架\n专项攻破：把薄弱题型拆成 5 道同类练习\n面试模拟：和 16 位面试官猫猫进行实战演练\n成长档案：复盘任务、错题、日记和面试记录\n老猫导师：随时提问，也可以带着提示词去 GPT 深聊'
        : 'AI News: Read AI updates with PREP summaries and save source links\nQuests: Finish daily product tasks with feedback and rewards\nTraining: Practice two-stage PM thinking drills\nBreakthrough: Turn weak question types into five focused drills\nInterview Sim: Practice with 16 interviewer cats\nGrowth Archive: Review tasks, mistakes, diary notes, and interviews\nMentor Cat: Ask questions and continue deeper in GPT',
    ],
    rewards: [
      lang === 'zh'
        ? '完成学习会获得经验值和小鱼干：经验让小猫成长，小鱼干可以慢慢解锁装扮。'
        : 'Complete learning sessions to earn EXP and fish: EXP grows your cat, and fish unlock accessories over time.',
      lang === 'zh'
        ? '小猫会经历 6 个阶段：流浪小猫、学生猫、实习猫、初级 PM 猫、资深 PM 猫、首席猫。'
        : 'Your cat has 6 growth stages: Stray Kitten, Student Cat, Intern Cat, Junior PM Cat, Senior PM Cat, and Chief Cat.',
    ],
    setup: [
      lang === 'zh'
        ? '最后，给你的小猫取个名字，再选择老猫陪你的方式。'
        : 'Finally, name your cat and choose how Mentor Cat should guide you.',
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
                  className="card whitespace-pre-line border-amber-200 bg-amber-50 p-4 text-left text-sm leading-relaxed dark:border-amber-700 dark:bg-amber-900/20"
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

        {currentStepId === 'setup' && (
          <div className="card space-y-5 p-6">
            <div className="text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mb-4 flex justify-center">
                <BlinkingClayMascot type="oldcat" className="onboarding-oldcat-clay onboarding-oldcat-clay-small" />
              </motion.div>
              <div className="text-base font-bold text-primary dark:text-primary-dark">
                {lang === 'zh' ? '准备开始你的 AI PM 养成路线' : 'Set up your AI PM journey'}
              </div>
            </div>

            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <LayeredCat className="onboarding-layered-cat" />
              </motion.div>
            </div>

            <div>
              <div className="mb-1.5 text-xs font-bold text-gray-500">{lang === 'zh' ? '小猫名字' : 'Cat Name'}</div>
              <input
                className="input-base"
                placeholder={lang === 'zh' ? '给小猫取个名字...' : 'Give your cat a name...'}
                value={catName}
                onChange={e => setCatName(e.target.value)}
              />
            </div>

            <div>
              <div className="mb-2 text-xs font-bold text-gray-500">{lang === 'zh' ? '老猫性格' : 'Mentor Style'}</div>
              <div className="grid gap-2">
                {MENTOR_PERSONALITIES.map(personality => (
                  <button
                    type="button"
                    key={personality}
                    onClick={() => setMentorStyle(personality)}
                    className={`rounded-2xl border px-4 py-3 text-left transition-all ${mentorStyle === personality ? 'border-primary bg-primary text-white shadow-lg' : 'border-border-light bg-white/70 hover:bg-border-light dark:border-border-dark dark:bg-gray-900/40 dark:hover:bg-border-dark'}`}
                  >
                    <span className="block text-sm font-black">{personalityLabels[lang][personality]}</span>
                    <span className={`mt-1 block text-xs font-semibold ${mentorStyle === personality ? 'text-white/85' : 'text-gray-500'}`}>
                      {personalityDescriptions[lang][personality]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={finish}
              className="btn-primary w-full py-3 font-bold"
            >
              {lang === 'zh' ? `开始！迎接 ${catName.trim() || 'Kivi'}！` : `Start! Welcome ${catName.trim() || 'Kivi'}!`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'

const STEPS = [
  { id: 'welcome', cat: 'teacher' },
  { id: 'modules', cat: 'teacher' },
  { id: 'rewards', cat: 'teacher' },
  { id: 'customize', cat: 'companion' },
]

const BREED_OPTIONS = ['orange', 'british', 'ragdoll', 'black', 'calico']
const COLOR_OPTIONS = ['orange', 'gray', 'brown', 'black', 'white', 'cream']
const EYE_OPTIONS = ['yellow', 'green', 'blue', 'amber']

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, setOnboardingDone, setCatConfig, updateSettings } = useStore()
  const lang = user.settings.language

  const [step, setStep] = useState(0)
  const [catForm, setCatForm] = useState({ name: '', breed: 'orange', color: 'orange', eyeColor: 'green', gender: 'female' })
  const [catRevealed, setCatRevealed] = useState(false)

  function next() { setStep(s => s + 1) }
  function skip() { finish() }

  function finish() {
    setCatConfig(catForm)
    setOnboardingDone()
    navigate('/')
  }

  const messages = {
    welcome: [
      lang === 'zh' ? '喵~ 你好！我是老猫，你的AI产品经理学习向导🐱' : 'Meow~ Hello! I\'m the Mentor Cat, your AI PM learning guide 🐱',
      lang === 'zh' ? '喵途是一个专为"想转型AI产品经理的小白"设计的成长平台～' : 'MiaoTu is a growth platform designed for beginners who want to become AI Product Managers~',
    ],
    modules: [
      lang === 'zh' ? '我来带你认识5个学习模块！' : 'Let me introduce the 5 learning modules!',
      lang === 'zh' ? '📰 今日情报站：实时AI新闻，了解行业动态\n📋 委托任务：每日学习任务，建立系统认知\n🧠 思维训练：两阶段答题，打磨PM思维\n👔 面试模拟：16位面试官猫猫，实战练习\n📊 成长档案：追踪你的成长曲线' : '📰 AI News: Real-time updates\n📋 Quests: Daily learning tasks\n🧠 Training: Two-stage thinking practice\n👔 Interview Sim: 16 interviewer cats\n📊 Growth Archive: Track your progress',
    ],
    rewards: [
      lang === 'zh' ? '完成任务会获得经验值（让猫猫进化！）和小鱼干（买配件装扮！）' : 'Complete tasks to earn EXP (evolve your cat!) and fish (buy accessories!)',
      lang === 'zh' ? '猫猫有6个成长阶段：流浪小猫→学生猫→实习猫→初级PM猫→资深PM猫→首席猫！' : 'Your cat has 6 growth stages: Stray Kitten → Student → Intern → Junior PM → Senior PM → Chief Cat!',
    ],
    customize: [
      lang === 'zh' ? '好！现在最重要的事：让我去给你找一只专属小猫！' : 'Now the most important part: let me find your very own cat!',
    ],
  }

  const currentStepId = STEPS[step]?.id
  const currentMsgs = messages[currentStepId] || []

  return (
    <div className="fixed inset-0 bg-bg-light dark:bg-bg-dark flex items-center justify-center p-4 z-50">
      <motion.div
        key={step}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-md space-y-6"
      >
        {/* Step: welcome / modules / rewards */}
        {['welcome', 'modules', 'rewards'].includes(currentStepId) && (
          <div className="card p-8 space-y-6 text-center">
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
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.4 }}
                  className="card p-4 text-sm text-left leading-relaxed whitespace-pre-line bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700"
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

        {/* Step: customize cat */}
        {currentStepId === 'customize' && (
          <div className="card p-6 space-y-5">
            <div className="text-center">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="flex justify-center mb-4">
                <BlinkingClayMascot type="oldcat" className="onboarding-oldcat-clay onboarding-oldcat-clay-small" />
              </motion.div>
              <div className="font-bold text-base text-primary dark:text-primary-dark">
                {lang === 'zh' ? '设计你的专属小猫！' : 'Design your own cat!'}
              </div>
            </div>

            {/* Cat preview */}
            <div className="flex justify-center">
              <motion.div
                key={JSON.stringify(catForm)}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <BlinkingClayMascot type="kivi" className="onboarding-kivi-clay" />
              </motion.div>
            </div>

            {/* Name */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1.5">{lang === 'zh' ? '名字' : 'Name'}</div>
              <input
                className="input-base"
                placeholder={lang === 'zh' ? '给猫咪取个名字...' : 'Give your cat a name...'}
                value={catForm.name}
                onChange={e => setCatForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>

            {/* Breed */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1.5">{lang === 'zh' ? '品种' : 'Breed'}</div>
              <div className="flex gap-2 flex-wrap">
                {BREED_OPTIONS.map(b => (
                  <button key={b} onClick={() => setCatForm(f => ({ ...f, breed: b }))} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${catForm.breed === b ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
                    {lang === 'zh' ? { orange: '橘猫', british: '英短', ragdoll: '布偶', black: '黑猫', calico: '三花' }[b] : b}
                  </button>
                ))}
              </div>
            </div>

            {/* Color */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1.5">{lang === 'zh' ? '毛色' : 'Fur Color'}</div>
              <div className="flex gap-2 flex-wrap">
                {COLOR_OPTIONS.map(c => (
                  <button key={c} onClick={() => setCatForm(f => ({ ...f, color: c }))} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${catForm.color === c ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
                    {lang === 'zh' ? { orange: '橘色', gray: '灰色', brown: '棕色', black: '黑色', white: '白色', cream: '奶白' }[c] : c}
                  </button>
                ))}
              </div>
            </div>

            {/* Eye color */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1.5">{lang === 'zh' ? '眼睛颜色' : 'Eye Color'}</div>
              <div className="flex gap-2">
                {EYE_OPTIONS.map(e => (
                  <button key={e} onClick={() => setCatForm(f => ({ ...f, eyeColor: e }))} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${catForm.eyeColor === e ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
                    {lang === 'zh' ? { yellow: '黄色', green: '绿色', blue: '蓝色', amber: '琥珀' }[e] : e}
                  </button>
                ))}
              </div>
            </div>

            {/* Gender */}
            <div>
              <div className="text-xs font-bold text-gray-500 mb-1.5">{lang === 'zh' ? '性别' : 'Gender'}</div>
              <div className="flex gap-3">
                {['male', 'female'].map(g => (
                  <button key={g} onClick={() => setCatForm(f => ({ ...f, gender: g }))} className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${catForm.gender === g ? 'bg-primary text-white border-primary' : 'border-border-light dark:border-border-dark hover:bg-border-light dark:hover:bg-border-dark'}`}>
                    {g === 'male' ? (lang === 'zh' ? '🐱 男生' : '🐱 Male') : (lang === 'zh' ? '🎀 女生' : '🎀 Female')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={finish}
              disabled={!catForm.name}
              className="btn-primary w-full py-3 font-bold"
            >
              {lang === 'zh' ? `完成！迎接${catForm.name || '小猫'}！` : `Done! Welcome ${catForm.name || 'Kitty'}!`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'

export default function PageTourGuide({ step, titleZh, titleEn, bodyZh, bodyEn, targetSelector }) {
  const { user, setHomeTourStep } = useStore()
  const navigate = useNavigate()
  const lang = user.settings.language
  const active = user.homeTourDone !== true && user.homeTourStep === step

  useEffect(() => {
    document.documentElement.classList.toggle('miaotu-page-tour-active', active)
    return () => document.documentElement.classList.remove('miaotu-page-tour-active')
  }, [active])

  useEffect(() => {
    if (!active || !targetSelector) return undefined
    const target = document.querySelector(targetSelector)
    window.setTimeout(() => target?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' }), 100)
    return undefined
  }, [active, targetSelector])

  if (!active) return null

  function continueHomeTour() {
    setHomeTourStep(step + 1)
    navigate('/')
  }

  return (
    <>
      <div className="page-tour-dim" aria-hidden="true" />
      <motion.div
        className="page-tour-card"
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24 }}
      >
        <div className="home-tour-copy">
          <span>{step + 1} / 10</span>
          <h3>{lang === 'zh' ? titleZh : titleEn}</h3>
          <p>{lang === 'zh' ? bodyZh : bodyEn}</p>
          <div className="home-tour-actions">
            <button type="button" onClick={continueHomeTour}>
              {lang === 'zh' ? '先跳过' : 'Skip for now'}
            </button>
            <button type="button" onClick={continueHomeTour}>
              {lang === 'zh' ? '回首页继续' : 'Continue'}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}

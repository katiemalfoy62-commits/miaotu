import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Moon, Sun, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'

export default function Navbar() {
  const { user, updateSettings } = useStore()
  const lang = user.settings.language
  const theme = user.settings.theme
  const location = useLocation()

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light'
    updateSettings({ theme: next })
    document.documentElement.classList.toggle('dark', next === 'dark')
  }

  function toggleLang() {
    updateSettings({ language: lang === 'zh' ? 'en' : 'zh' })
  }

  return (
    <nav className="sticky top-0 z-30 border-b border-border-light/80 bg-card-light/85 shadow-sm backdrop-blur-xl dark:border-border-dark/80 dark:bg-card-dark/85">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#f1d6ad] bg-gradient-to-br from-[#fff7db] to-[#ffc37b] text-2xl shadow-[0_8px_20px_rgba(200,98,42,0.18)] transition-transform group-hover:-rotate-6 group-hover:scale-105">
            🐱
          </span>
          <span className="font-black text-xl tracking-tight text-primary dark:text-primary-dark">
            {t('appName', lang)}
            <span className="ml-1.5 hidden text-xs font-black uppercase tracking-[0.18em] text-stone-400 sm:inline">MiaoTu</span>
          </span>
        </Link>

        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleLang}
            className="rounded-full border border-border-light bg-white/70 px-3.5 py-2 text-xs font-black shadow-sm transition-colors hover:bg-border-light dark:border-border-dark dark:bg-black/10 dark:hover:bg-border-dark"
          >
            {lang === 'zh' ? 'EN' : '中文'}
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-full p-2.5 transition-colors hover:bg-border-light dark:hover:bg-border-dark"
            title={theme === 'light' ? '切换深色' : '切换浅色'}
          >
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {theme === 'light' ? <Moon size={19} /> : <Sun size={19} className="text-primary-dark" />}
            </motion.div>
          </button>

          <Link
            to="/settings"
            className="rounded-full p-2.5 transition-colors hover:bg-border-light dark:hover:bg-border-dark"
            data-tour-target="settings"
          >
            <Settings size={19} className={location.pathname === '/settings' ? 'text-primary dark:text-primary-dark' : ''} />
          </Link>
        </div>
      </div>
    </nav>
  )
}

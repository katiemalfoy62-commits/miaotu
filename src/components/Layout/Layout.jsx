import React, { useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { BookOpen, GraduationCap, Home, Settings, Target, Wrench } from 'lucide-react'
import Navbar from './Navbar'
import OldCat from '../OldCat/OldCat'
import ClayIcon from '../UI/ClayIcon'
import FloatingLinkVault from '../LinkVault/FloatingLinkVault'
import FloatingOldCatArchive from '../OldCat/FloatingOldCatArchive'
import ToolDrawer from '../Tools/ToolDrawer'

// Pages where old cat is NOT available
const NO_OLDCAT_PATHS = ['/interview/session']
const MOBILE_NAV = [
  { to: '/', label: '首页', icon: Home },
  { to: '/classroom', label: '课堂', icon: GraduationCap },
  { to: '/tasks', label: '练习', icon: Target },
  { to: '/archive', label: '档案', icon: BookOpen },
  { to: '/settings', label: '设置', icon: Settings },
]

// Pages where old cat is restricted during first-attempt (handled inside Training page)
export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const mainRef = useRef(null)
  const hideOldCat = NO_OLDCAT_PATHS.some(p => location.pathname.startsWith(p))
  const isHome = location.pathname === '/'

  useEffect(() => {
    const main = mainRef.current
    if (!main) return undefined

    const mainKey = `miaotu-scroll:main:${location.pathname}`
    const windowKey = `miaotu-scroll:window:${location.pathname}`
    const savedMain = Number(sessionStorage.getItem(mainKey) || 0)
    const savedWindow = Number(sessionStorage.getItem(windowKey) || 0)
    const restore = window.setTimeout(() => {
      main.scrollTo({ top: savedMain, behavior: 'auto' })
      window.scrollTo({ top: savedWindow, behavior: 'auto' })
    }, 40)

    function saveScroll() {
      sessionStorage.setItem(mainKey, String(main.scrollTop || 0))
      sessionStorage.setItem(windowKey, String(window.scrollY || 0))
    }

    main.addEventListener('scroll', saveScroll, { passive: true })
    window.addEventListener('scroll', saveScroll, { passive: true })
    window.addEventListener('beforeunload', saveScroll)
    return () => {
      window.clearTimeout(restore)
      saveScroll()
      main.removeEventListener('scroll', saveScroll)
      window.removeEventListener('scroll', saveScroll)
      window.removeEventListener('beforeunload', saveScroll)
    }
  }, [location.pathname])

  return (
    <div className="app-bg min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar/>
      <main ref={mainRef} className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!isHome && (
          <button type="button" className="page-back-button" onClick={() => navigate(-1)}>
            <ClayIcon name="back" alt="" />
            <span>返回</span>
          </button>
        )}
        {children}
      </main>
      <FloatingLinkVault hideLauncher />
      <FloatingOldCatArchive hideLauncher />
      <OldCat visible={!hideOldCat} hideLauncher />
      <ToolDrawer oldCatAvailable={!hideOldCat} />
      <nav className="mobile-bottom-nav" aria-label="移动端导航">
        {MOBILE_NAV.map(item => {
          const Icon = item.icon
          const active = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to)
          return (
            <Link key={item.to} to={item.to} className={active ? 'active' : ''}>
              <Icon size={18} />
              <span>{item.label}</span>
            </Link>
          )
        })}
        <button type="button" onClick={() => window.dispatchEvent(new CustomEvent('miaotu:toggle-tool-drawer'))}>
          <Wrench size={18} />
          <span>工具</span>
        </button>
      </nav>
    </div>
  )
}

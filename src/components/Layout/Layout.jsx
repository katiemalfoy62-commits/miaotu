import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Navbar from './Navbar'
import OldCat from '../OldCat/OldCat'
import ClayIcon from '../UI/ClayIcon'
import FloatingLinkVault from '../LinkVault/FloatingLinkVault'
import FloatingOldCatArchive from '../OldCat/FloatingOldCatArchive'

// Pages where old cat is NOT available
const NO_OLDCAT_PATHS = ['/interview/session']

// Pages where old cat is restricted during first-attempt (handled inside Training page)
export default function Layout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const hideOldCat = NO_OLDCAT_PATHS.some(p => location.pathname.startsWith(p))
  const isHome = location.pathname === '/'

  return (
    <div className="app-bg min-h-screen bg-bg-light dark:bg-bg-dark">
      <Navbar/>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {!isHome && (
          <button type="button" className="page-back-button" onClick={() => navigate(-1)}>
            <ClayIcon name="back" alt="" />
            <span>返回</span>
          </button>
        )}
        {children}
      </main>
      <FloatingLinkVault />
      <FloatingOldCatArchive />
      <OldCat visible={!hideOldCat} hideLauncher={isHome}/>
    </div>
  )
}

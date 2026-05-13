import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import News from './pages/News/News'
import Tasks from './pages/Tasks/Tasks'
import Training from './pages/Training/Training'
import Interview from './pages/Interview/Interview'
import Archive from './pages/Archive/Archive'
import WrongBook from './pages/Archive/WrongBook'
import Diary from './pages/Archive/Diary'
import InterviewRecords from './pages/Archive/InterviewRecords'
import Breakthrough from './pages/Breakthrough/Breakthrough'
import Shop from './pages/Shop/Shop'
import Wardrobe from './pages/Wardrobe/Wardrobe'
import Settings from './pages/Settings/Settings'
import Collection from './pages/Collection/Collection'
import Trehole from './pages/Trehole/Trehole'
import Onboarding from './pages/Onboarding/Onboarding'
import useStore from './store/useStore'

function RequireOnboarding({ children }) {
  const { user } = useStore()
  if (!user.onboardingDone) return <Navigate to="/onboarding" replace/>
  return children
}

export default function App() {
  const { user } = useStore()

  // Apply persisted theme and language on startup
  useEffect(() => {
    document.documentElement.classList.toggle('dark', user.settings.theme === 'dark')
    document.documentElement.lang = user.settings.language === 'zh' ? 'zh' : 'en'
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Onboarding — no layout, no old cat */}
        <Route path="/onboarding" element={<Onboarding/>}/>

        {/* All other routes inside Layout */}
        <Route path="/*" element={
          <RequireOnboarding>
            <Layout>
              <Routes>
                <Route path="/" element={<Home/>}/>
                <Route path="/news" element={<News/>}/>
                <Route path="/tasks" element={<Tasks/>}/>
                <Route path="/training" element={<Training/>}/>
                <Route path="/breakthrough" element={<Breakthrough/>}/>
                <Route path="/interview" element={<Interview/>}/>
                <Route path="/interview/session" element={<Interview/>}/>
                <Route path="/archive" element={<Archive/>}/>
                <Route path="/archive/wrongbook" element={<WrongBook/>}/>
                <Route path="/archive/diary" element={<Diary/>}/>
                <Route path="/archive/interviews" element={<InterviewRecords/>}/>
                <Route path="/shop" element={<Shop/>}/>
                <Route path="/wardrobe" element={<Wardrobe/>}/>
                <Route path="/settings" element={<Settings/>}/>
                <Route path="/collection" element={<Collection/>}/>
                <Route path="/trehole" element={<Trehole/>}/>
                <Route path="*" element={<Navigate to="/" replace/>}/>
              </Routes>
            </Layout>
          </RequireOnboarding>
        }/>
      </Routes>
    </BrowserRouter>
  )
}

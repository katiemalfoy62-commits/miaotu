import React, { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { BookMarked, Bot, FolderOpen, MessageCircle, X } from 'lucide-react'
import ClayIcon from '../UI/ClayIcon'

const TOOL_ITEMS = [
  {
    id: 'oldcat',
    title: '问老猫',
    desc: '随时提问、整理思路',
    icon: Bot,
    event: 'miaotu:open-oldcat',
  },
  {
    id: 'linkVault',
    title: '资料夹',
    desc: '存网址、复制 GPT 精读提示',
    icon: FolderOpen,
    event: 'miaotu:open-link-vault',
  },
  {
    id: 'oldcatArchive',
    title: '老猫对话保存库',
    desc: '回看值得复盘的讨论',
    icon: BookMarked,
    event: 'miaotu:open-oldcat-archive',
  },
  {
    id: 'treehole',
    title: '小猫树洞',
    desc: '把想法和情绪先放进去',
    icon: MessageCircle,
    to: '/trehole',
  },
]

export default function ToolDrawer({ oldCatAvailable = true }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const buttonRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const openDrawer = () => setOpen(true)
    const toggleDrawer = () => setOpen(value => !value)
    window.addEventListener('miaotu:open-tool-drawer', openDrawer)
    window.addEventListener('miaotu:toggle-tool-drawer', toggleDrawer)
    return () => {
      window.removeEventListener('miaotu:open-tool-drawer', openDrawer)
      window.removeEventListener('miaotu:toggle-tool-drawer', toggleDrawer)
    }
  }, [])

  useEffect(() => {
    if (!open) return undefined

    function closeOnOutside(event) {
      if (buttonRef.current?.contains(event.target)) return
      if (panelRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutside)
    document.addEventListener('touchstart', closeOnOutside, { passive: true })
    return () => {
      document.removeEventListener('mousedown', closeOnOutside)
      document.removeEventListener('touchstart', closeOnOutside)
    }
  }, [open])

  function openTool(item) {
    if (item.id === 'oldcat' && !oldCatAvailable) return
    window.dispatchEvent(new CustomEvent('miaotu:close-floaters'))
    window.dispatchEvent(new CustomEvent('miaotu:close-oldcat'))
    if (item.event) window.dispatchEvent(new CustomEvent(item.event))
    if (item.to) navigate(item.to)
    setOpen(false)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="tool-drawer-button"
        onClick={() => setOpen(value => !value)}
        aria-label="打开工具抽屉"
      >
        <ClayIcon name="archive" alt="" />
      </button>

      {open && (
        <div ref={panelRef} className="tool-drawer-panel">
          <div className="tool-drawer-head">
            <div>
              <strong>工具抽屉</strong>
              <span>资料、老猫和树洞都放这里</span>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="关闭工具抽屉">
              <X size={18} />
            </button>
          </div>
          <div className="tool-drawer-list">
            {TOOL_ITEMS.map(item => {
              const Icon = item.icon
              const disabled = item.id === 'oldcat' && !oldCatAvailable
              return (
                <button
                  key={item.id}
                  type="button"
                  className="tool-drawer-item"
                  onClick={() => openTool(item)}
                  disabled={disabled}
                >
                  <span><Icon size={20} /></span>
                  <b>{item.title}</b>
                  <small>{disabled ? '面试进行中暂不可用' : item.desc}</small>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
}

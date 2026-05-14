import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, Copy, ExternalLink, Trash2, X } from 'lucide-react'
import useStore from '../../store/useStore'
import ClayIcon from '../UI/ClayIcon'
import { copyText, openChatGPT } from '../../utils/gptPrompt'

function formatDate(value) {
  return new Date(value || Date.now()).toLocaleString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function chatText(chat) {
  return (chat.messages || [])
    .filter(message => message.role !== 'system')
    .map(message => `${message.role === 'user' ? '我' : '老猫'}：${message.content}`)
    .join('\n\n')
}

export default function FloatingOldCatArchive() {
  const location = useLocation()
  const { savedOldCatChats = [], deleteOldCatChat, user } = useStore()
  const lang = user.settings.language
  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [copied, setCopied] = useState('')
  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const closePanel = () => setOpen(false)
    window.addEventListener('miaotu:close-floaters', closePanel)
    return () => window.removeEventListener('miaotu:close-floaters', closePanel)
  }, [])

  useEffect(() => {
    if (!open) return undefined

    function closeOnOutsidePointer(event) {
      if (buttonRef.current?.contains(event.target)) return
      if (panelRef.current?.contains(event.target)) return
      setOpen(false)
    }

    document.addEventListener('mousedown', closeOnOutsidePointer)
    document.addEventListener('touchstart', closeOnOutsidePointer, { passive: true })
    return () => {
      document.removeEventListener('mousedown', closeOnOutsidePointer)
      document.removeEventListener('touchstart', closeOnOutsidePointer)
    }
  }, [open])

  async function copyChat(chat) {
    await copyText(chatText(chat))
    setCopied(chat.id)
    setTimeout(() => setCopied(''), 1200)
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="oldcat-memory-peek"
        onClick={() => setOpen(value => !value)}
        title={lang === 'zh' ? '老猫对话保存库' : 'Saved mentor chats'}
      >
        <ClayIcon name="oldcatMemory" alt="" />
      </button>

      {open && (
        <div ref={panelRef} className="oldcat-memory-panel">
          <div className="oldcat-memory-head">
            <div>
              <strong>{lang === 'zh' ? '老猫对话保存库' : 'Saved Chats'}</strong>
              <span>{lang === 'zh' ? '保存值得复盘的讨论' : 'Review useful conversations'}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          {savedOldCatChats.length === 0 ? (
            <div className="oldcat-memory-empty">
              <ClayIcon name="oldcatMemory" alt="" />
              <span>{lang === 'zh' ? '还没有保存的对话' : 'No saved chats yet'}</span>
            </div>
          ) : (
            <div className="oldcat-memory-body">
              <div className="oldcat-memory-list">
                {savedOldCatChats.map(chat => (
                  <button key={chat.id} onClick={() => setSelected(chat)} className={selected?.id === chat.id ? 'active' : ''}>
                    <b>{chat.title || '老猫对话'}</b>
                    <small>{formatDate(chat.createdAt)}</small>
                  </button>
                ))}
              </div>
              <div className="oldcat-memory-detail">
                {selected ? (
                  <>
                    <div className="oldcat-memory-detail-actions">
                      <button onClick={() => copyChat(selected)}>{copied === selected.id ? <Check size={14} /> : <Copy size={14} />} 复制</button>
                      <button onClick={openChatGPT}><ExternalLink size={14} /> GPT</button>
                      <button onClick={() => { deleteOldCatChat(selected.id); setSelected(null) }}><Trash2 size={14} /> 删除</button>
                    </div>
                    <pre>{chatText(selected)}</pre>
                  </>
                ) : (
                  <span>{lang === 'zh' ? '选择一段对话查看' : 'Select a chat'}</span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

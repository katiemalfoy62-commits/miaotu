import React, { useState } from 'react'
import { BookMarked, Check, Copy, ExternalLink, FolderPlus, X } from 'lucide-react'
import useStore from '../../store/useStore'
import ClayIcon from '../UI/ClayIcon'
import { buildLinkPrompt, copyText, openChatGPT } from '../../utils/gptPrompt'

export default function FloatingLinkVault() {
  const { linkVault = [], addLinkItem, user } = useStore()
  const lang = user.settings.language
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const [note, setNote] = useState('')
  const [copied, setCopied] = useState(false)

  function cleanUrl(value) {
    const text = value.trim()
    if (!text) return ''
    if (/^https?:\/\//i.test(text)) return text
    return `https://${text}`
  }

  function save() {
    const finalUrl = cleanUrl(url)
    if (!finalUrl) return
    addLinkItem({ url: finalUrl, note, title: note || finalUrl })
    setUrl('')
    setNote('')
  }

  async function copyPrompt() {
    const finalUrl = cleanUrl(url) || linkVault[0]?.url
    if (!finalUrl) return
    await copyText(buildLinkPrompt(finalUrl, note))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }

  return (
    <>
      <button
        type="button"
        className="link-vault-peek"
        onClick={() => setOpen(true)}
        title={lang === 'zh' ? '保存学习链接' : 'Save link'}
      >
        <ClayIcon name="archive" alt="" />
      </button>

      {open && (
        <div className="link-vault-panel">
          <div className="link-vault-head">
            <div>
              <strong>{lang === 'zh' ? '资料夹' : 'Link Vault'}</strong>
              <span>{lang === 'zh' ? '存网址，复制 GPT 精读提示' : 'Save links and copy GPT prompts'}</span>
            </div>
            <button type="button" onClick={() => setOpen(false)}><X size={16} /></button>
          </div>

          <div className="link-vault-body">
            <button type="button" className="btn-ghost flex items-center justify-center gap-1.5" onClick={openChatGPT}>
              <ExternalLink size={15} />
              {lang === 'zh' ? '打开 GPT 网页' : 'Open GPT'}
            </button>
            <input
              className="input-base text-sm"
              value={url}
              onChange={e => setUrl(e.target.value)}
              placeholder={lang === 'zh' ? '粘贴文章网址...' : 'Paste article URL...'}
            />
            <input
              className="input-base text-sm"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={lang === 'zh' ? '标题/备注，可选' : 'Title or note, optional'}
            />
            <div className="grid grid-cols-2 gap-2">
              <button type="button" className="btn-primary flex items-center justify-center gap-1.5" onClick={save}>
                <FolderPlus size={15} />
                {lang === 'zh' ? '存入' : 'Save'}
              </button>
              <button type="button" className="btn-ghost flex items-center justify-center gap-1.5" onClick={copyPrompt}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? (lang === 'zh' ? '已复制' : 'Copied') : (lang === 'zh' ? '复制 Prompt' : 'Copy prompt')}
              </button>
            </div>

            <div className="link-vault-list">
              <div className="link-vault-list-title">
                <BookMarked size={14} />
                {lang === 'zh' ? '最近保存' : 'Recent'}
              </div>
              {linkVault.length === 0 ? (
                <p>{lang === 'zh' ? '还没有链接。' : 'No links yet.'}</p>
              ) : linkVault.slice(0, 4).map(item => (
                <div className="link-vault-item" key={item.id}>
                  <span>{item.note || item.title || item.url}</span>
                  <div>
                    <button type="button" onClick={() => copyText(buildLinkPrompt(item.url, item.note))}><Copy size={13} /></button>
                    <a href={item.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={13} /></a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

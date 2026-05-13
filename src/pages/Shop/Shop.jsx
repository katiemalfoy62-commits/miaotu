import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { BadgeCheck, Check, Fish, Lock, ShoppingBag, Sparkles } from 'lucide-react'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import { SHOP_CATEGORIES, SHOP_ITEMS, isItemUnlocked } from '../../data/shopItems'

export default function Shop() {
  const { user, unlockItem, setEquippedItems, spendFish } = useStore()
  const lang = user.settings.language
  const [filter, setFilter] = useState('all')
  const [notification, setNotification] = useState('')

  const purchasable = SHOP_ITEMS.filter(item => item.source === 'fish')
  const badgeOnly = SHOP_ITEMS.filter(item => item.source === 'badge')
  const shownPurchasable = filter === 'all' ? purchasable : purchasable.filter(item => item.category === filter)
  const shownBadgeOnly = filter === 'all' ? badgeOnly : badgeOnly.filter(item => item.category === filter)

  function notify(text) {
    setNotification(text)
    setTimeout(() => setNotification(''), 2200)
  }

  function buyItem(item) {
    if (isItemUnlocked(item, user)) return
    if (!spendFish(item.price)) {
      notify(t('notEnoughFish', lang))
      return
    }
    unlockItem(item.id)
    notify(lang === 'zh' ? `已兑换「${item.name}」` : `Redeemed ${item.nameEn}`)
  }

  function toggleEquip(item) {
    if (!isItemUnlocked(item, user)) return
    const equipped = user.equippedItems || []
    const isEquipped = equipped.some(e => e.id === item.id)
    if (isEquipped) {
      setEquippedItems(equipped.filter(e => e.id !== item.id))
      return
    }
    const withoutCategory = equipped.filter(e => e.category !== item.category)
    setEquippedItems([...withoutCategory, item])
  }

  return (
    <div className="shop-shell">
      <section className="shop-main">
        <div className="shop-hero">
          <div>
            <div className="eyebrow"><Sparkles size={15} /> {lang === 'zh' ? '小鱼干商店' : 'Fish Shop'}</div>
            <h1>{t('shop', lang)}</h1>
            <p>{lang === 'zh' ? '普通装扮可以用小鱼干慢慢兑换；勋章专属装扮只能靠成就解锁。' : 'Redeem regular outfits with fish. Badge outfits unlock through achievements only.'}</p>
          </div>
          <div className="fish-wallet">
            <Fish size={22} />
            <strong>{user.fish}</strong>
            <span>{t('fishCount', lang)}</span>
          </div>
        </div>

        <div className="shop-filters">
          {SHOP_CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setFilter(category.id)}
              className={filter === category.id ? 'active' : ''}
            >
              {lang === 'zh' ? category.name : category.nameEn}
            </button>
          ))}
        </div>

        {notification && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="shop-toast">
            {notification}
          </motion.div>
        )}

        <ShopSection
          title={lang === 'zh' ? '鱼干可兑换' : 'Redeem with fish'}
          subtitle={lang === 'zh' ? '攒够小鱼干就能买，买完进衣柜穿戴。' : 'Buy with fish, then equip in wardrobe.'}
          items={shownPurchasable}
          user={user}
          lang={lang}
          onBuy={buyItem}
          onEquip={toggleEquip}
        />

        <ShopSection
          title={lang === 'zh' ? '勋章专属' : 'Badge exclusives'}
          subtitle={lang === 'zh' ? '这些不能购买，只能通过对应勋章解锁。' : 'These cannot be bought. Unlock them with badges.'}
          items={shownBadgeOnly}
          user={user}
          lang={lang}
          onBuy={buyItem}
          onEquip={toggleEquip}
          badgeOnly
        />
      </section>

      <aside className="shop-preview">
        <div className="clay-preview-card">
          <div className="side-card-title">{lang === 'zh' ? '当前造型' : 'Current look'}</div>
          <div className="shop-clay-preview-stage">
            <span className="shop-preview-plant" aria-hidden="true">🌱</span>
            <span className="shop-preview-fish" aria-hidden="true">🐟</span>
            <BlinkingClayMascot type="kivi" mascotClassName="shop-clay-preview-cat" />
          </div>
          <h2>{user.catConfig.name || 'Kivi'}</h2>
          <p>{t(user.catStage, lang)} · Lv {user.level}</p>
          {user.equippedItems?.length > 0 ? (
            <div className="equipped-list">
              {user.equippedItems.map(item => (
                <button key={item.id} onClick={() => toggleEquip(item)}>
                  <span>{item.icon || item.emoji}</span>
                  {lang === 'zh' ? item.name : item.nameEn}
                  <b>×</b>
                </button>
              ))}
            </div>
          ) : (
            <div className="empty-equipped">{lang === 'zh' ? '还没有穿戴配饰' : 'No outfit equipped'}</div>
          )}
        </div>
      </aside>
    </div>
  )
}

function ShopSection({ title, subtitle, items, user, lang, onBuy, onEquip, badgeOnly = false }) {
  if (items.length === 0) return null

  return (
    <section className="shop-section">
      <div className="shop-section-head">
        <div>
          <h2>{title}</h2>
          <p>{subtitle}</p>
        </div>
      </div>

      <div className="shop-grid">
        {items.map((item, index) => {
          const unlocked = isItemUnlocked(item, user)
          const equipped = user.equippedItems?.some(e => e.id === item.id)
          const canAfford = item.source !== 'fish' || user.fish >= item.price

          return (
            <motion.article
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.035 }}
              className={`shop-item-card ${equipped ? 'equipped' : ''} ${!unlocked && badgeOnly ? 'locked' : ''}`}
            >
              <div className="shop-item-icon">{item.icon}</div>
              <div>
                <h3>{lang === 'zh' ? item.name : item.nameEn}</h3>
                <p>{categoryName(item.category, lang)}</p>
              </div>

              {item.source === 'fish' ? (
                <div className="item-price"><Fish size={14} /> {item.price}</div>
              ) : (
                <div className={`badge-requirement ${unlocked ? 'ok' : ''}`}>
                  {unlocked ? <BadgeCheck size={14} /> : <Lock size={14} />}
                  <span>{unlocked ? (lang === 'zh' ? '已由勋章解锁' : 'Unlocked') : item.unlockText}</span>
                </div>
              )}

              {unlocked ? (
                <button className={equipped ? 'wear-button active' : 'wear-button'} onClick={() => onEquip(item)}>
                  {equipped ? <><Check size={14} /> {t('equipped', lang)}</> : t('equip', lang)}
                </button>
              ) : item.source === 'fish' ? (
                <button className="buy-button" disabled={!canAfford} onClick={() => onBuy(item)}>
                  <ShoppingBag size={14} /> {lang === 'zh' ? '兑换' : 'Redeem'}
                </button>
              ) : (
                <button className="buy-button locked" disabled>
                  <Lock size={14} /> {lang === 'zh' ? '待解锁' : 'Locked'}
                </button>
              )}
            </motion.article>
          )
        })}
      </div>
    </section>
  )
}

function categoryName(category, lang) {
  const item = SHOP_CATEGORIES.find(c => c.id === category)
  if (!item) return category
  return lang === 'zh' ? item.name : item.nameEn
}

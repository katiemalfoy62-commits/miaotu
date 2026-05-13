import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Check, ShoppingBag, X } from 'lucide-react'
import useStore from '../../store/useStore'
import { t } from '../../utils/i18n'
import BlinkingClayMascot from '../../components/Cat/BlinkingClayMascot'
import { SHOP_ITEMS, isItemUnlocked } from '../../data/shopItems'

export default function Wardrobe() {
  const { user, setEquippedItems } = useStore()
  const lang = user.settings.language

  const unlockedItems = useMemo(
    () => SHOP_ITEMS.filter(item => isItemUnlocked(item, user)),
    [user.unlockedItems, user.badges]
  )

  function toggleEquip(item) {
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
    <div className="wardrobe-shell">
      <section className="wardrobe-preview">
        <div className="eyebrow">{lang === 'zh' ? '粘土衣柜' : 'Clay wardrobe'}</div>
        <h1>{t('wardrobe', lang)}</h1>
        <div className="wardrobe-clay-display">
          <BlinkingClayMascot type="kivi" className="wardrobe-kivi-mascot" />
        </div>
        <div className="text-center">
          <h2>{user.catConfig.name || (lang === 'zh' ? 'Kivi' : 'Kivi')}</h2>
          <p>{t(user.catStage, lang)} · Lv {user.level}</p>
        </div>
        {user.equippedItems?.length > 0 && (
          <button onClick={() => setEquippedItems([])} className="remove-all-button">
            <X size={14} /> {lang === 'zh' ? '取下全部配饰' : 'Remove all'}
          </button>
        )}
      </section>

      <section className="wardrobe-items">
        <div className="wardrobe-head">
          <div>
            <h2>{lang === 'zh' ? '已拥有装扮' : 'Owned outfits'}</h2>
            <p>{lang === 'zh' ? '每个类别同时只能穿一件，勋章装扮会在达成后自动出现在这里。' : 'Only one item per category can be equipped.'}</p>
          </div>
          <Link to="/shop" className="archive-button">
            <ShoppingBag size={17} />
            {t('shop', lang)}
          </Link>
        </div>

        {unlockedItems.length === 0 ? (
          <div className="wardrobe-empty">
            <div>🎁</div>
            <h3>{lang === 'zh' ? '衣柜还是空的' : 'The wardrobe is empty'}</h3>
            <p>{lang === 'zh' ? '去商店用小鱼干兑换第一件粘土装扮吧。' : 'Redeem your first clay outfit in the shop.'}</p>
            <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
              <ShoppingBag size={16} /> {t('shop', lang)}
            </Link>
          </div>
        ) : (
          <div className="wardrobe-grid">
            {unlockedItems.map(item => {
              const equipped = user.equippedItems?.some(e => e.id === item.id)
              return (
                <button
                  key={item.id}
                  onClick={() => toggleEquip(item)}
                  className={equipped ? 'wardrobe-item active' : 'wardrobe-item'}
                >
                  <span className="wardrobe-item-icon">{item.icon}</span>
                  <strong>{lang === 'zh' ? item.name : item.nameEn}</strong>
                  <small>{item.source === 'badge' ? (lang === 'zh' ? '勋章专属' : 'Badge') : (lang === 'zh' ? '鱼干兑换' : 'Fish')}</small>
                  {equipped && <em><Check size={13} /> {t('equipped', lang)}</em>}
                </button>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}

export const SHOP_ITEMS = [
  { id: 'hat_cap', category: 'hat', name: '奶油棒球帽', nameEn: 'Cream Cap', price: 90, icon: '🧢', shape: 'cap', color: '#2A4A8A', source: 'fish' },
  { id: 'hat_beret', category: 'hat', name: '焦糖贝雷帽', nameEn: 'Caramel Beret', price: 110, icon: '🎨', shape: 'beret', color: '#C8622A', source: 'fish' },
  { id: 'bow_pink', category: 'bow', name: '桃粉蝴蝶结', nameEn: 'Pink Bow', price: 80, icon: '🎀', color: '#FF8FAB', source: 'fish' },
  { id: 'bow_gold', category: 'bow', name: '金色领结', nameEn: 'Gold Bow Tie', price: 130, icon: '🎀', color: '#FFD700', source: 'fish' },
  { id: 'glasses_round', category: 'glasses', name: '圆框眼镜', nameEn: 'Round Glasses', price: 120, icon: '👓', source: 'fish' },
  { id: 'prop_coffee', category: 'prop', name: '陶土咖啡杯', nameEn: 'Clay Coffee', price: 75, icon: '☕', source: 'fish' },
  { id: 'prop_book', category: 'prop', name: '迷你学习本', nameEn: 'Mini Notebook', price: 95, icon: '📒', source: 'fish' },
  { id: 'prop_tablet', category: 'prop', name: 'PM 平板', nameEn: 'PM Tablet', price: 180, icon: '📱', source: 'fish' },

  { id: 'hat_grad', category: 'hat', name: '学士帽', nameEn: 'Graduation Cap', icon: '🎓', shape: 'grad', color: '#1A1A1A', source: 'badge', badge: '七日连续', unlockText: '获得「七日连续」勋章后解锁' },
  { id: 'hat_crown', category: 'hat', name: '首席小王冠', nameEn: 'Chief Crown', icon: '👑', shape: 'crown', color: '#FFD700', source: 'badge', badge: '猫咪进化III', unlockText: '升到首席猫后解锁' },
  { id: 'glasses_sunglasses', category: 'glasses', name: '自信墨镜', nameEn: 'Confidence Shades', icon: '🕶️', source: 'badge', badge: '面试高手', unlockText: '获得「面试高手」勋章后解锁' },
  { id: 'cape_chief', category: 'coat', name: '首席披风', nameEn: 'Chief Cape', icon: '🦸', source: 'badge', badge: '完美表现', unlockText: '获得满分表现后解锁' },
  { id: 'prop_starwand', category: 'prop', name: '洞见星杖', nameEn: 'Insight Wand', icon: '⭐', source: 'badge', badge: '深度思考者', unlockText: '完成 10 次思维训练后解锁' },
]

export const SHOP_CATEGORIES = [
  { id: 'all', name: '全部', nameEn: 'All' },
  { id: 'hat', name: '帽子', nameEn: 'Hats' },
  { id: 'bow', name: '领结', nameEn: 'Bows' },
  { id: 'glasses', name: '眼镜', nameEn: 'Glasses' },
  { id: 'coat', name: '外套', nameEn: 'Coats' },
  { id: 'prop', name: '道具', nameEn: 'Props' },
]

export function isItemUnlocked(item, user) {
  if (user.unlockedItems?.includes(item.id)) return true
  if (item.source === 'badge' && user.badges?.includes(item.badge)) return true
  return false
}

import React from 'react'
import stage1 from '../../assets/cat-stages/clay-stage-1.png'
import stage2 from '../../assets/cat-stages/clay-stage-2.png'
import stage3 from '../../assets/cat-stages/clay-stage-3.png'
import stage4 from '../../assets/cat-stages/clay-stage-4.png'
import stage5 from '../../assets/cat-stages/clay-stage-5.png'
import stage6 from '../../assets/cat-stages/clay-stage-6.png'

const STAGE_IMAGES = [stage1, stage2, stage3, stage4, stage5, stage6]

export function getStageIndex(level = 1) {
  if (level <= 10) return 0
  if (level <= 25) return 1
  if (level <= 45) return 2
  if (level <= 70) return 3
  if (level <= 90) return 4
  return 5
}

export default function CatStageImage({ level = 1, equippedItems = [], size = 220, className = '' }) {
  const src = STAGE_IMAGES[getStageIndex(level)]
  const visibleItems = equippedItems.slice(0, 4)

  return (
    <div className={`clay-cat-figure ${className}`} style={{ width: size }}>
      <img src={src} alt="Kivi clay stage" className="clay-cat-figure__image" />
      {visibleItems.length > 0 && (
        <div className="clay-cat-figure__items">
          {visibleItems.map(item => (
            <span key={item.id} title={item.name || item.nameEn}>{item.icon || item.emoji}</span>
          ))}
        </div>
      )}
    </div>
  )
}

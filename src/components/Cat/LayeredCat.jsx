import React from 'react'
import basePedestal from '../../assets/cat-customizer/base_pedestal.webp'
import furOrange from '../../assets/cat-customizer/fur_orange.webp'
import furGray from '../../assets/cat-customizer/fur_gray.webp'
import furBrown from '../../assets/cat-customizer/fur_brown.webp'
import furBlack from '../../assets/cat-customizer/fur_black.webp'
import furWhite from '../../assets/cat-customizer/fur_white.webp'
import furCream from '../../assets/cat-customizer/fur_cream.webp'
import stageShadow from '../../assets/cat-customizer/stages/stage_shadow_soft.webp'
import hatCap from '../../assets/cat-customizer/wearables-aligned/hat_cap.webp'
import hatBeret from '../../assets/cat-customizer/wearables-aligned/hat_beret.webp'
import bowPink from '../../assets/cat-customizer/wearables-aligned/bow_pink.webp'
import bowGold from '../../assets/cat-customizer/wearables-aligned/bow_gold.webp'
import glassesRound from '../../assets/cat-customizer/wearables-aligned/glasses_round.webp'
import propCoffee from '../../assets/cat-customizer/wearables-aligned/prop_coffee.webp'
import propBook from '../../assets/cat-customizer/wearables-aligned/prop_book.webp'
import propTablet from '../../assets/cat-customizer/wearables-aligned/prop_tablet.webp'
import hatGrad from '../../assets/cat-customizer/wearables-aligned/hat_grad.webp'
import hatCrown from '../../assets/cat-customizer/wearables-aligned/hat_crown.webp'
import glassesSunglasses from '../../assets/cat-customizer/wearables-aligned/glasses_sunglasses.webp'
import capeChief from '../../assets/cat-customizer/wearables-aligned/cape_chief.webp'
import propStarwand from '../../assets/cat-customizer/wearables-aligned/prop_starwand.webp'

export const CAT_COLORS = ['orange', 'gray', 'brown', 'black', 'white', 'cream']
export const CAT_EYE_COLORS = ['yellow', 'green', 'blue', 'amber']
export const CAT_PATTERNS = ['none', 'tabby', 'spots', 'calico_orange', 'calico_black', 'face_mask', 'socks_white', 'tail_tip']

const FUR_LAYERS = {
  orange: furOrange,
  gray: furGray,
  brown: furBrown,
  black: furBlack,
  white: furWhite,
  cream: furCream,
}

const WEARABLE_LAYERS = {
  hat_cap: hatCap,
  hat_beret: hatBeret,
  bow_pink: bowPink,
  bow_gold: bowGold,
  glasses_round: glassesRound,
  prop_coffee: propCoffee,
  prop_book: propBook,
  prop_tablet: propTablet,
  hat_grad: hatGrad,
  hat_crown: hatCrown,
  glasses_sunglasses: glassesSunglasses,
  cape_chief: capeChief,
  prop_starwand: propStarwand,
}

export function normalizeCatConfig(config = {}) {
  return {
    name: config.name || '',
    focus: config.focus || 'training',
    color: CAT_COLORS.includes(config.color) ? config.color : 'gray',
    eyeColor: CAT_EYE_COLORS.includes(config.eyeColor) ? config.eyeColor : 'yellow',
    pattern: CAT_PATTERNS.includes(config.pattern) ? config.pattern : 'none',
    gender: config.gender === 'male' ? 'male' : 'female',
  }
}

export function getStageIndex(level = 1) {
  if (level <= 10) return 0
  if (level <= 25) return 1
  if (level <= 45) return 2
  if (level <= 70) return 3
  if (level <= 90) return 4
  return 5
}

function sizeStyle(size) {
  if (!size) return undefined
  return { width: typeof size === 'number' ? `${size}px` : size }
}

export default function LayeredCat({
  catConfig,
  level = 1,
  stageIndex,
  equippedItems = [],
  size,
  className = '',
  alt = 'MiaoTu cat',
  showStage = true,
  showWearables = true,
}) {
  const config = normalizeCatConfig(catConfig)
  const resolvedStageIndex = typeof stageIndex === 'number' ? stageIndex : getStageIndex(level)
  const wearables = showWearables ? (equippedItems || []).map(item => WEARABLE_LAYERS[item.id]).filter(Boolean) : []

  const layers = [
    { src: stageShadow, key: 'shadow' },
    { src: basePedestal, key: 'base' },
    { src: FUR_LAYERS[config.color], key: `fur-${config.color}` },
    ...wearables.map((src, index) => ({ src, key: `wearable-${index}` })),
  ].filter(Boolean)

  return (
    <span
      className={`layered-cat layered-cat--pattern-${config.pattern} layered-cat--stage-${showStage ? resolvedStageIndex : 0} ${className}`}
      style={sizeStyle(size)}
      role="img"
      aria-label={alt}
    >
      {layers.map(layer => (
        <img
          key={layer.key}
          src={layer.src}
          alt=""
          aria-hidden="true"
          className="layered-cat__layer"
          draggable="false"
        />
      ))}
      <span className={`layered-cat__pattern layered-cat__pattern--${config.pattern}`} aria-hidden="true" />
      <span className={`layered-cat__eye layered-cat__eye--left layered-cat__eye--${config.eyeColor}`} aria-hidden="true" />
      <span className={`layered-cat__eye layered-cat__eye--right layered-cat__eye--${config.eyeColor}`} aria-hidden="true" />
      {config.gender === 'female' && <span className="layered-cat__fixed-bow" aria-hidden="true" />}
      {showStage && resolvedStageIndex > 0 && <span className={`layered-cat__stage-badge layered-cat__stage-badge--${resolvedStageIndex}`} aria-hidden="true" />}
    </span>
  )
}

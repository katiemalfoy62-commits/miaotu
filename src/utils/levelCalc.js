import { calcExpForLevel, getCatStage as getGrowthCatStage } from '../config/growthRules'

// Returns cumulative EXP needed to reach the given level.
export function expForLevel(level) {
  return calcExpForLevel(level)
}

// EXP earned inside the current level, for progress bars.
export function expInCurrentLevel(totalExp, level) {
  const start = expForLevel(level)
  const end = expForLevel(level + 1)
  const current = totalExp - start
  const needed = end - start
  return { current, needed, pct: Math.min(100, (current / needed) * 100) }
}

export function getCatStage(level) {
  return getGrowthCatStage(level)
}

export function getCatStageEn(level) {
  if (level <= 10) return 'Stray Kitten'
  if (level <= 25) return 'Student Cat'
  if (level <= 45) return 'Intern Cat'
  if (level <= 70) return 'Junior PM Cat'
  if (level <= 90) return 'Senior PM Cat'
  return 'Chief Cat'
}

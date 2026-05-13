// Returns cumulative EXP needed to reach the given level
export function expForLevel(level) {
  if (level <= 1) return 0
  if (level <= 10) return (level - 1) * 50
  if (level <= 25) return 450 + (level - 10) * 80
  if (level <= 45) return 1650 + (level - 25) * 120
  if (level <= 70) return 4050 + (level - 45) * 180
  if (level <= 90) return 8550 + (level - 70) * 250
  return 13550 + (level - 90) * 400
}

// EXP needed just for current level (for progress bar)
export function expInCurrentLevel(totalExp, level) {
  const start = expForLevel(level)
  const end = expForLevel(level + 1)
  const current = totalExp - start
  const needed = end - start
  return { current, needed, pct: Math.min(100, (current / needed) * 100) }
}

export function getCatStage(level) {
  if (level <= 10) return '流浪小猫'
  if (level <= 25) return '学生猫'
  if (level <= 45) return '实习猫'
  if (level <= 70) return '初级PM猫'
  if (level <= 90) return '资深PM猫'
  return '首席猫'
}

export function getCatStageEn(level) {
  if (level <= 10) return 'Stray Kitten'
  if (level <= 25) return 'Student Cat'
  if (level <= 45) return 'Intern Cat'
  if (level <= 70) return 'Junior PM Cat'
  if (level <= 90) return 'Senior PM Cat'
  return 'Chief Cat'
}

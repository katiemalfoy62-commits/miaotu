// Central growth economy rules. Keep all XP, fish, streak, and level rules here.

export const XP_REWARDS = {
  classroomLesson: 5,
  newsRead: 0,
  task: {
    easy: 5,
    medium: 8,
    hard: 10,
  },
  thinkingTraining: 10,
  mockInterview: 15,
  workshop: 18,
  breakthrough: 12,
  oldCatInsight: 0,
}

export const FISH_REWARDS = {
  classroomLesson: 0,
  newsRead: 0,
  task: {
    easy: 0,
    medium: 0,
    hard: 0,
  },
  thinkingTraining: 0,
  mockInterview: 5,
  workshop: 8,
  breakthrough: 3,
  oldCatInsight: 0,
  sevenDayStreak: 3,
}

export const STREAK_RULES = {
  fishPerSevenDays: FISH_REWARDS.sevenDayStreak,
  rewardIntervalDays: 7,
}

export const CAT_STAGES = [
  { minLevel: 1, maxLevel: 10, name: '流浪小猫' },
  { minLevel: 11, maxLevel: 25, name: '学生猫' },
  { minLevel: 26, maxLevel: 45, name: '实习猫' },
  { minLevel: 46, maxLevel: 70, name: '初级 PM 猫' },
  { minLevel: 71, maxLevel: 90, name: '资深 PM 猫' },
  { minLevel: 91, maxLevel: 100, name: '首席猫' },
]

export function getExpNeededForNextLevel(currentLevel) {
  if (currentLevel < 5) return 50
  if (currentLevel < 10) return 80
  if (currentLevel < 25) return 120
  if (currentLevel < 45) return 180
  if (currentLevel < 70) return 260
  if (currentLevel < 90) return 360
  return 500
}

export function calcExpForLevel(level) {
  if (level <= 1) return 0
  let total = 0
  for (let currentLevel = 1; currentLevel < level; currentLevel += 1) {
    total += getExpNeededForNextLevel(currentLevel)
  }
  return total
}

export function getCatStage(level) {
  return CAT_STAGES.find(stage => level >= stage.minLevel && level <= stage.maxLevel)?.name || CAT_STAGES[0].name
}

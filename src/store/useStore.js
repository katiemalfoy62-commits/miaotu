import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Level thresholds: cumulative EXP needed to reach each level
function calcExpForLevel(level) {
  if (level <= 2) return level * 80
  if (level <= 5) return 160 + (level - 2) * 160
  if (level <= 10) return 640 + (level - 5) * 260
  if (level <= 20) return 1940 + (level - 10) * 420
  if (level <= 50) return 6140 + (level - 20) * 620
  if (level <= 80) return 24740 + (level - 50) * 860
  return 50540 + (level - 80) * 1200
}

function getCatStage(level) {
  if (level <= 10) return '流浪小猫'
  if (level <= 25) return '学生猫'
  if (level <= 45) return '实习猫'
  if (level <= 70) return '初级PM猫'
  if (level <= 90) return '资深PM猫'
  return '首席猫'
}

const defaultUser = {
  level: 1,
  exp: 0,
  fish: 0,
  catStage: '流浪小猫',
  catConfig: { name: '', focus: 'training' },
  equippedItems: [],
  unlockedItems: [],
  badges: [],
  settings: {
    language: 'zh',
    theme: 'light',
    newsStyle: 'friend',
    catPersonality: 'teacher',
    voiceEnabled: false,
    apiKey: '',
    modelMode: 'balanced',
  },
  createdAt: new Date().toISOString(),
  onboardingDone: false,
  catCustomized: false,
  homeTourDone: false,
  homeTourStep: 0,
}

const defaultStats = {
  dailyActivity: {},
  abilityScores: {
    userNeeds: 0, competitive: 0, business: 0, data: 0,
    expression: 0, aiTech: 0, productDesign: 0, innovation: 0,
  },
  weeklyInterviewScores: [],
}

const useStore = create(
  persist(
    (set, get) => ({
      // ── User ──────────────────────────────────────────────
      user: defaultUser,
      stats: defaultStats,

      updateSettings: (patch) => set((s) => ({
        user: { ...s.user, settings: { ...s.user.settings, ...patch } }
      })),

      addExp: (amount) => set((s) => {
        const newExp = s.user.exp + amount
        let level = s.user.level
        // Increment level while exp exceeds threshold
        while (level < 100 && newExp >= calcExpForLevel(level + 1)) level++
        return {
          user: { ...s.user, exp: newExp, level, catStage: getCatStage(level) }
        }
      }),

      addFish: (amount) => set((s) => ({
        user: { ...s.user, fish: Math.max(0, s.user.fish + amount) }
      })),

      spendFish: (amount) => {
        const { user } = get()
        if (user.fish < amount) return false
        set((s) => ({ user: { ...s.user, fish: s.user.fish - amount } }))
        return true
      },

      setCatConfig: (config) => set((s) => ({
        user: { ...s.user, catConfig: config, catCustomized: true }
      })),

      setEquippedItems: (items) => set((s) => ({
        user: { ...s.user, equippedItems: items }
      })),

      unlockItem: (itemId) => set((s) => ({
        user: { ...s.user, unlockedItems: [...new Set([...s.user.unlockedItems, itemId])] }
      })),

      unlockBadge: (badgeId) => set((s) => {
        if (s.user.badges.includes(badgeId)) return s
        return { user: { ...s.user, badges: [...s.user.badges, badgeId] } }
      }),

      setOnboardingDone: () => set((s) => ({
        user: { ...s.user, onboardingDone: true, homeTourDone: false, homeTourStep: 0 }
      })),

      setHomeTourDone: (done = true) => set((s) => ({
        user: { ...s.user, homeTourDone: done, homeTourStep: done ? 0 : (s.user.homeTourStep || 0) }
      })),

      setHomeTourStep: (step = 0) => set((s) => ({
        user: { ...s.user, homeTourStep: Math.max(0, step) }
      })),

      recordActivity: () => set((s) => {
        const today = new Date().toISOString().slice(0, 10)
        const daily = { ...s.stats.dailyActivity }
        daily[today] = (daily[today] || 0) + 1
        return { stats: { ...s.stats, dailyActivity: daily } }
      }),

      updateAbilityScore: (dimension, delta) => set((s) => {
        const scores = { ...s.stats.abilityScores }
        scores[dimension] = Math.min(100, (scores[dimension] || 0) + delta)
        return { stats: { ...s.stats, abilityScores: scores } }
      }),

      addInterviewScore: (score) => set((s) => ({
        stats: {
          ...s.stats,
          weeklyInterviewScores: [...s.stats.weeklyInterviewScores.slice(-6), { score, date: new Date().toISOString().slice(0, 10) }]
        }
      })),

      // ── Vocab / Bag ────────────────────────────────────────
      vocab: [],

      addVocab: (item) => set((s) => {
        const exists = s.vocab.find(v => v.word === item.word)
        if (exists) return s
        return { vocab: [{ ...item, id: Date.now(), savedAt: new Date().toISOString() }, ...s.vocab] }
      }),

      removeVocab: (id) => set((s) => ({ vocab: s.vocab.filter(v => v.id !== id) })),

      // ── Question Collection (题目收藏) ─────────────────────
      savedQuestions: [],

      saveQuestion: (q) => set((s) => {
        const exists = s.savedQuestions.find(sq => sq.questionId === q.questionId)
        if (exists) return s
        return { savedQuestions: [{ ...q, savedAt: new Date().toISOString() }, ...s.savedQuestions] }
      }),

      removeSavedQuestion: (questionId) => set((s) => ({
        savedQuestions: s.savedQuestions.filter(q => q.questionId !== questionId)
      })),

      // ── Tasks ──────────────────────────────────────────────
      tasks: { active: [], completed: [], history: [] },

      setActiveTasks: (tasks) => set((s) => ({ tasks: { ...s.tasks, active: tasks } })),

      completeTask: (taskId, result) => set((s) => {
        const task = s.tasks.active.find(t => t.id === taskId)
        if (!task) return s
        const score = typeof result === 'number' ? result : result?.score
        const completed = {
          ...task,
          ...(typeof result === 'object' ? result : {}),
          completedAt: new Date().toISOString(),
          score,
        }
        return {
          tasks: {
            active: s.tasks.active.filter(t => t.id !== taskId),
            completed: [completed, ...s.tasks.completed],
            history: [completed, ...s.tasks.history],
          }
        }
      }),

      // ── Training ───────────────────────────────────────────
      training: { questionHistory: [], wrongBook: [], lockedTypes: [] },

      addTrainingResult: (result) => set((s) => {
        const history = [result, ...s.training.questionHistory]
        let wrongBook = [...s.training.wrongBook]

        if (result.score1 < 60 || result.score2 < 60) {
          const exists = wrongBook.find(w => w.questionId === result.questionId)
          if (!exists) wrongBook = [{ ...result, source: 'training', addedAt: new Date().toISOString() }, ...wrongBook]
        }

        return { training: { ...s.training, questionHistory: history, wrongBook } }
      }),

      resolveTrainingWrong: (questionId) => set((s) => ({
        training: { ...s.training, wrongBook: s.training.wrongBook.filter(w => w.questionId !== questionId) }
      })),

      setTrainingLocked: (locked) => set((s) => ({
        training: { ...s.training, locked }
      })),

      // ── Interview ──────────────────────────────────────────
      interview: { history: [], wrongBook: [] },

      addInterviewResult: (result) => set((s) => {
        const history = [result, ...s.interview.history]
        let wrongBook = [...s.interview.wrongBook]

        result.questions?.forEach(q => {
          if (q.score < 60) {
            const exists = wrongBook.find(w => w.questionId === q.questionId)
            if (!exists) wrongBook = [{ ...q, source: 'interview', addedAt: new Date().toISOString() }, ...wrongBook]
          }
        })

        return { interview: { history, wrongBook } }
      }),

      resolveInterviewWrong: (questionId) => set((s) => ({
        interview: { ...s.interview, wrongBook: s.interview.wrongBook.filter(w => w.questionId !== questionId) }
      })),

      // ── Diary ──────────────────────────────────────────────
      diary: [],

      addDiaryEntry: (entry) => set((s) => ({
        diary: [{ ...entry, id: Date.now() }, ...s.diary]
      })),

      // Learning records power the growth archive timeline.
      learningRecords: [],

      addLearningRecord: (record) => set((s) => ({
        learningRecords: [{
          ...record,
          id: record.id || `${record.type || 'record'}_${Date.now()}`,
          createdAt: record.createdAt || new Date().toISOString(),
        }, ...s.learningRecords]
      })),

      // Link vault stores article URLs without spending API tokens.
      linkVault: [],

      addLinkItem: (item) => set((s) => ({
        linkVault: [{
          ...item,
          id: item.id || `link_${Date.now()}`,
          status: item.status || 'unread',
          createdAt: item.createdAt || new Date().toISOString(),
        }, ...s.linkVault]
      })),

      updateLinkItem: (id, patch) => set((s) => ({
        linkVault: s.linkVault.map(item => item.id === id ? { ...item, ...patch } : item)
      })),

      // Targeted breakthrough drills and saved mentor conversations.
      breakthrough: { sessions: [] },

      addBreakthroughSession: (session) => set((s) => ({
        breakthrough: {
          ...(s.breakthrough || { sessions: [] }),
          sessions: [{
            ...session,
            id: session.id || `breakthrough_${Date.now()}`,
            createdAt: session.createdAt || new Date().toISOString(),
          }, ...((s.breakthrough && s.breakthrough.sessions) || [])],
        }
      })),

      lockTrainingType: (type, questions = []) => set((s) => {
        const lockedTypes = s.training.lockedTypes || []
        if (lockedTypes.some(item => item.type === type)) {
          return { training: { ...s.training, locked: true } }
        }
        return {
          training: {
            ...s.training,
            locked: true,
            lockedTypes: [{ type, questions: questions.slice(0, 3), lockedAt: new Date().toISOString() }, ...lockedTypes],
          }
        }
      }),

      unlockTrainingType: (type) => set((s) => {
        const lockedTypes = (s.training.lockedTypes || []).filter(item => item.type !== type)
        return { training: { ...s.training, lockedTypes, locked: lockedTypes.length > 0 } }
      }),

      savedOldCatChats: [],

      saveOldCatChat: (chat) => set((s) => ({
        savedOldCatChats: [{
          ...chat,
          id: chat.id || `oldcat_${Date.now()}`,
          createdAt: chat.createdAt || new Date().toISOString(),
        }, ...(s.savedOldCatChats || [])],
      })),

      deleteOldCatChat: (id) => set((s) => ({
        savedOldCatChats: (s.savedOldCatChats || []).filter(chat => chat.id !== id)
      })),

      // ── Reset ──────────────────────────────────────────────
      resetAll: () => set({
        user: { ...defaultUser, createdAt: new Date().toISOString() },
        stats: defaultStats,
        vocab: [],
        savedQuestions: [],
        tasks: { active: [], completed: [], history: [] },
        training: { questionHistory: [], wrongBook: [] },
        interview: { history: [], wrongBook: [] },
        diary: [],
        learningRecords: [],
        linkVault: [],
        breakthrough: { sessions: [] },
        savedOldCatChats: [],
      }),
    }),
    {
      name: 'miaotu_store',
      partialize: (state) => ({
        user: state.user,
        stats: state.stats,
        vocab: state.vocab,
        savedQuestions: state.savedQuestions,
        tasks: state.tasks,
        training: state.training,
        interview: state.interview,
        diary: state.diary,
        learningRecords: state.learningRecords,
        linkVault: state.linkVault,
        breakthrough: state.breakthrough,
        savedOldCatChats: state.savedOldCatChats,
      }),
    }
  )
)

export default useStore
export { calcExpForLevel, getCatStage }

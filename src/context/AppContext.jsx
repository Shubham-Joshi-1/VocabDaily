import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { fetchTodaysWords, fetchUserSettings, upsertUserSettings, updateStreak } from '../services/api.js'

const AppContext = createContext(null)

// Generate or retrieve a stable anonymous user ID
function getOrCreateUserId() {
  let uid = localStorage.getItem('vocab_user_id')
  if (!uid) {
    uid = 'user_' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
    localStorage.setItem('vocab_user_id', uid)
  }
  return uid
}

export function AppProvider({ children }) {
  const userId = useMemo(() => getOrCreateUserId(), [])

  const [wordsPerDay, setWordsPerDayState] = useState(() => {
    const saved = localStorage.getItem('vocab_words_per_day')
    return saved ? parseInt(saved, 10) : 5
  })

  const [words, setWords] = useState([])
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load data on mount
  useEffect(() => {
    initApp()
  }, [])

  const initApp = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Sync settings from Supabase (remote wins on first load)
      const remoteSettings = await fetchUserSettings(userId)
      const effectiveWordsPerDay = remoteSettings?.words_per_day
        || parseInt(localStorage.getItem('vocab_words_per_day') || '5', 10)
      setWordsPerDayState(effectiveWordsPerDay)
      localStorage.setItem('vocab_words_per_day', String(effectiveWordsPerDay))

      // 2. Update streak
      const updatedStreak = await updateStreak(userId)
      setStreak(updatedStreak || { current_streak: 0, longest_streak: 0 })

      // 3. Fetch today's words
      const todayWords = await fetchTodaysWords(userId, effectiveWordsPerDay)
      setWords(todayWords)
    } catch (err) {
      console.error('App init error:', err)
      setError(err.message || 'Failed to load. Check your connection.')
    } finally {
      setLoading(false)
    }
  }, [userId, wordsPerDay])

  const refreshWords = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const todayWords = await fetchTodaysWords(userId, wordsPerDay)
      setWords(todayWords)
    } catch (err) {
      setError(err.message || 'Failed to refresh words.')
    } finally {
      setLoading(false)
    }
  }, [userId, wordsPerDay])

  const setWordsPerDay = useCallback(async (count) => {
    const clamped = Math.min(5, Math.max(2, count))
    setWordsPerDayState(clamped)
    localStorage.setItem('vocab_words_per_day', String(clamped))

    try {
      await upsertUserSettings(userId, clamped)
      // Refresh words with new count
      const todayWords = await fetchTodaysWords(userId, clamped)
      setWords(todayWords)
    } catch (err) {
      console.error('Settings sync error:', err)
      // localStorage already saved — offline-first OK
    }
  }, [userId])

  const value = useMemo(() => ({
    userId,
    words,
    streak,
    loading,
    error,
    wordsPerDay,
    setWordsPerDay,
    refreshWords,
    initApp,
  }), [userId, words, streak, loading, error, wordsPerDay, setWordsPerDay, refreshWords, initApp])

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}

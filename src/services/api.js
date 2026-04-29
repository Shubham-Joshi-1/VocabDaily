import { supabase } from './supabaseClient.js'
import { getTodayDate, getYesterdayDate } from '../utils/dateHelpers.js'

// ─── Words ────────────────────────────────────────────────────────────────────

export async function fetchTodaysWords(userId, wordsPerDay = 5) {
  const today = getTodayDate()

  const { data, error } = await supabase
    .from('daily_words')
    .select('*')
    .eq('date', today)
    .limit(wordsPerDay)

  if (error) throw error

  // Record viewed words in word_history
  if (data && data.length > 0) {
    const historyRows = data.map((word) => ({
      user_id: userId,
      word_id: word.id,
      viewed_date: today,
    }))

    // Upsert to avoid duplicates on refresh
    await supabase
      .from('word_history')
      .upsert(historyRows, { onConflict: 'user_id,word_id,viewed_date', ignoreDuplicates: true })
  }

  return data || []
}

export async function fetchWordHistory(userId) {
  const { data, error } = await supabase
    .from('word_history')
    .select(`
      viewed_date,
      daily_words (
        id, word, meaning_en, meaning_hi, sentence, date
      )
    `)
    .eq('user_id', userId)
    .order('viewed_date', { ascending: false })

  if (error) throw error
  return data || []
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export async function fetchUserSettings(userId) {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertUserSettings(userId, wordsPerDay) {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, words_per_day: wordsPerDay },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Streaks ──────────────────────────────────────────────────────────────────

export async function fetchUserStreak(userId) {
  const { data, error } = await supabase
    .from('user_streaks')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function updateStreak(userId) {
  const today = getTodayDate()
  const yesterday = getYesterdayDate()

  // Get existing streak record
  const existing = await fetchUserStreak(userId)

  let newStreak = 1
  let longestStreak = 1

  if (!existing) {
    // First time ever
    newStreak = 1
    longestStreak = 1
  } else {
    longestStreak = existing.longest_streak || 1

    if (existing.last_opened_date === today) {
      // Already opened today — no change
      return existing
    } else if (existing.last_opened_date === yesterday) {
      // Opened yesterday — increment
      newStreak = (existing.current_streak || 0) + 1
    } else {
      // Missed a day — reset
      newStreak = 1
    }

    longestStreak = Math.max(longestStreak, newStreak)
  }

  const { data, error } = await supabase
    .from('user_streaks')
    .upsert(
      {
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longestStreak,
        last_opened_date: today,
      },
      { onConflict: 'user_id' }
    )
    .select()
    .single()

  if (error) throw error
  return data
}

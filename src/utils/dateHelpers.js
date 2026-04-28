/**
 * Returns today's date in YYYY-MM-DD format (local time)
 */
export function getTodayDate() {
  const now = new Date()
  return formatDate(now)
}

/**
 * Returns yesterday's date in YYYY-MM-DD format
 */
export function getYesterdayDate() {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return formatDate(d)
}

/**
 * Formats a Date object to YYYY-MM-DD
 */
export function formatDate(date) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Formats a YYYY-MM-DD string to a human-readable label
 * e.g. "2025-01-15" → "Wednesday, 15 Jan 2025"
 */
export function formatDateLabel(dateStr) {
  if (!dateStr) return ''
  const date = new Date(dateStr + 'T00:00:00')
  return date.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Returns a motivational message based on streak count
 */
export function getStreakMessage(streak) {
  if (streak === 0) return 'Start your streak today!'
  if (streak === 1) return 'Great start! Come back tomorrow.'
  if (streak < 5) return 'Building momentum! 💪'
  if (streak < 10) return 'You\'re on fire! Keep going!'
  if (streak < 20) return 'Incredible consistency! 🌟'
  if (streak < 30) return 'Legendary learner! 🏆'
  return `${streak} days of brilliance! 🎯`
}

/**
 * Groups an array of history records by viewed_date
 */
export function groupByDate(historyRecords) {
  const groups = {}
  for (const record of historyRecords) {
    const date = record.viewed_date
    if (!groups[date]) groups[date] = []
    groups[date].push(record.daily_words)
  }
  return groups
}

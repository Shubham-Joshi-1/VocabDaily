import { useState, useEffect } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { fetchWordHistory } from '../services/api.js'
import { formatDateLabel, groupByDate, getTodayDate } from '../utils/dateHelpers.js'
import styles from './History.module.css'

export default function History() {
  const { userId } = useApp()
  const [groups, setGroups] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    loadHistory()
  }, [userId])

  async function loadHistory() {
    setLoading(true)
    setError(null)
    try {
      const records = await fetchWordHistory(userId)
      setGroups(groupByDate(records))
    } catch (err) {
      setError(err.message || 'Failed to load history.')
    } finally {
      setLoading(false)
    }
  }

  const today = getTodayDate()
  const dates = Object.keys(groups).sort((a, b) => (b > a ? 1 : -1))

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>History</h1>
        <p className={styles.subtitle}>Your vocabulary journey</p>
      </header>

      <div className={styles.content}>
        {loading && (
          <div className={styles.loadingList}>
            {[1,2,3].map(i => <div key={i} className={styles.skeleton} />)}
          </div>
        )}

        {!loading && error && (
          <div className={styles.errorState}>
            <span>⚠️</span>
            <p>{error}</p>
            <button className={styles.retryBtn} onClick={loadHistory}>Try Again</button>
          </div>
        )}

        {!loading && !error && dates.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📅</span>
            <p className={styles.emptyTitle}>No history yet</p>
            <p className={styles.emptySubtitle}>Words you view on the home page will appear here.</p>
          </div>
        )}

        {!loading && !error && dates.map(date => {
          const isToday = date === today
          const dayWords = groups[date] || []

          return (
            <div key={date} className={styles.group}>
              <div className={styles.dateHeader}>
                <span className={styles.dateLabel}>{formatDateLabel(date)}</span>
                {isToday && <span className={styles.todayBadge}>Today</span>}
              </div>

              <div className={styles.wordPills}>
                {dayWords.map(word => word && (
                  <div key={word.id} className={styles.wordItem}>
                    <div className={styles.wordRow}>
                      <span className={styles.wordText}>{word.word}</span>
                      <span className={styles.enMeaning}>{word.meaning_en}</span>
                    </div>
                    <span className={styles.hiMeaning}>{word.meaning_hi}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import styles from './Settings.module.css'

const WORD_OPTIONS = [2, 3, 4, 5]

export default function Settings() {
  const { wordsPerDay, setWordsPerDay, streak, userId } = useApp()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSelect(count) {
    if (count === wordsPerDay) return
    setSaving(true)
    setSaved(false)
    try {
      await setWordsPerDay(count)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.subtitle}>Customize your experience</p>
      </header>

      <div className={styles.content}>
        {/* Words per day */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Words per day</div>
          <p className={styles.sectionDesc}>How many words would you like to learn each day?</p>
          <div className={styles.optionGrid}>
            {WORD_OPTIONS.map(count => (
              <button
                key={count}
                className={`${styles.optionBtn} ${count === wordsPerDay ? styles.active : ''}`}
                onClick={() => handleSelect(count)}
                disabled={saving}
              >
                <span className={styles.optionNum}>{count}</span>
                <span className={styles.optionWord}>word{count > 1 ? 's' : ''}</span>
              </button>
            ))}
          </div>
          {saved && (
            <p className={styles.savedMsg}>✓ Saved & synced!</p>
          )}
        </section>

        {/* Streak info */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Your Streak</div>
          <div className={styles.streakCard}>
            <div className={styles.streakStat}>
              <span className={styles.streakNum}>{streak?.current_streak || 0}</span>
              <span className={styles.streakStatLabel}>Current</span>
            </div>
            <div className={styles.streakDivider} />
            <div className={styles.streakStat}>
              <span className={styles.streakNum}>{streak?.longest_streak || 0}</span>
              <span className={styles.streakStatLabel}>Best Ever</span>
            </div>
          </div>
        </section>

        {/* About */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>About</div>
          <div className={styles.aboutCard}>
            <p className={styles.aboutText}>
              VocabDaily helps you build English vocabulary with Hindi meanings and example sentences.
              Open the app every day to keep your streak alive! 🔥
            </p>
          </div>
        </section>

        {/* User ID */}
        <section className={styles.section}>
          <div className={styles.sectionLabel}>Your ID</div>
          <div className={styles.uidCard}>
            <span className={styles.uid}>{userId}</span>
            <p className={styles.uidNote}>This anonymous ID is stored locally to track your progress.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

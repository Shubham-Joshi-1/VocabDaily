import { useApp } from '../context/AppContext.jsx'
import WordCard from '../components/WordCard.jsx'
import StreakBanner from '../components/StreakBanner.jsx'
import styles from './Home.module.css'
import { getTodayDate, formatDateLabel } from '../utils/dateHelpers.js'

export default function Home() {
  const { words, streak, loading, error, refreshWords, wordsPerDay } = useApp()
  const todayLabel = formatDateLabel(getTodayDate())

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>VocabDaily</h1>
          <p className={styles.date}>{todayLabel}</p>
        </div>
        <button
          className={styles.refreshBtn}
          onClick={refreshWords}
          disabled={loading}
          aria-label="Refresh words"
          title="Refresh"
        >
          <span className={loading ? styles.spinning : ''}>↻</span>
        </button>
      </header>

      <div className={styles.content}>
        <StreakBanner streak={streak} />

        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Today's Words</h2>
          <span className={styles.wordCount}>{wordsPerDay} words</span>
        </div>

        {loading && (
          <div className={styles.loadingState}>
            {[...Array(wordsPerDay)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        )}

        {!loading && error && (
          <div className={styles.errorState}>
            <span className={styles.errorIcon}>⚠️</span>
            <p className={styles.errorMsg}>{error}</p>
            <button className={styles.retryBtn} onClick={refreshWords}>Try Again</button>
          </div>
        )}

        {!loading && !error && words.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📚</span>
            <p className={styles.emptyTitle}>No words today yet</p>
            <p className={styles.emptySubtitle}>
              Words are added daily. Check back soon....
            </p>
          </div>
        )}

        {!loading && !error && words.length > 0 && (
          <div className={styles.wordsList}>
            {words.map((word, i) => (
              <WordCard key={word.id} word={word} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

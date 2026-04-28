import { getStreakMessage } from '../utils/dateHelpers.js'
import styles from './StreakBanner.module.css'

export default function StreakBanner({ streak }) {
  const current = streak?.current_streak || 0
  const longest = streak?.longest_streak || 0
  const message = getStreakMessage(current)

  return (
    <div className={styles.banner}>
      <div className={styles.left}>
        <span className={styles.fire} aria-label="fire emoji">🔥</span>
        <div className={styles.info}>
          <span className={styles.count}>{current} Day Streak</span>
          <span className={styles.message}>{message}</span>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.stat}>
          <span className={styles.statNum}>{longest}</span>
          <span className={styles.statLabel}>Best</span>
        </div>
      </div>
    </div>
  )
}

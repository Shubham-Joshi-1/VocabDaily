import styles from './WordCard.module.css'

export default function WordCard({ word, index = 0 }) {
  if (!word) return null

  return (
    <article
      className={styles.card}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className={styles.header}>
        <h2 className={styles.word}>{word.word}</h2>
        <span className={styles.dayBadge}>#{index + 1}</span>
      </div>

      <div className={styles.meanings}>
        <div className={styles.meaningRow}>
          <span className={styles.badge} data-lang="en">EN</span>
          <p className={styles.meaningText}>{word.meaning_en}</p>
        </div>
        <div className={styles.meaningRow}>
          <span className={styles.badge} data-lang="hi">हि</span>
          <p className={styles.meaningHindi}>{word.meaning_hi}</p>
        </div>
      </div>

      <div className={styles.sentence}>
        <span className={styles.quoteIcon}>"</span>
        <p className={styles.sentenceText}>{word.sentence}</p>
      </div>
    </article>
  )
}

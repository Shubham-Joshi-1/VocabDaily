// cron-job.js — Alternative Node.js cron for local/server use
// Usage: node cron-job.js
// Schedule: Add to crontab → 0 0 * * * node /path/to/cron-job.js

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project.supabase.co'
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'your-service-role-key'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const WORD_BANK = [
  { word: 'Perspicacious', meaning_en: 'Having a ready insight; shrewd', meaning_hi: 'तीक्ष्णबुद्धि', sentence: 'The perspicacious detective noticed details others overlooked.' },
  { word: 'Loquacious',    meaning_en: 'Tending to talk a great deal',   meaning_hi: 'बातूनी',          sentence: 'The loquacious host kept the party lively with stories.' },
  { word: 'Acrimony',      meaning_en: 'Bitterness or ill feeling',       meaning_hi: 'कटुता',           sentence: 'The debate was marked by acrimony on both sides.' },
  { word: 'Ebullient',     meaning_en: 'Cheerful and full of energy',     meaning_hi: 'जोशपूर्ण',        sentence: 'Her ebullient personality lit up every room.' },
  { word: 'Laconic',       meaning_en: 'Using very few words; brief',     meaning_hi: 'संक्षिप्त',       sentence: 'His laconic reply of "Fine" told me nothing.' },
  { word: 'Magnanimous',   meaning_en: 'Generous in forgiving; noble',    meaning_hi: 'उदार, महान्',      sentence: 'The magnanimous winner praised every other competitor.' },
  { word: 'Oblivious',     meaning_en: 'Not aware of surroundings',       meaning_hi: 'बेखबर',           sentence: 'He was oblivious to the chaos behind him.' },
  { word: 'Sagacious',     meaning_en: 'Having good judgment; wise',      meaning_hi: 'बुद्धिमान',       sentence: 'The sagacious mentor gave practical advice.' },
  { word: 'Recalcitrant',  meaning_en: 'Stubbornly refusing to obey',     meaning_hi: 'अड़ियल',          sentence: 'The recalcitrant student refused to follow the rules.' },
  { word: 'Harbinger',     meaning_en: 'A sign that something is coming', meaning_hi: 'पूर्वसूचक',       sentence: 'Dark clouds were a harbinger of the storm.' },
]

async function insertDailyWords() {
  const today = new Date().toISOString().split('T')[0]
  console.log(`[VocabDaily Cron] Running for date: ${today}`)

  try {
    // Get all previously used words
    const { data: allUsed } = await supabase.from('daily_words').select('word')
    const usedWords = new Set((allUsed || []).map(r => r.word))

    // Filter available words
    const available = WORD_BANK.filter(w => !usedWords.has(w.word))

    if (available.length === 0) {
      console.warn('[VocabDaily Cron] Word bank exhausted!')
      return
    }

    // Pick 5 random words
    const toInsert = available
      .sort(() => Math.random() - 0.5)
      .slice(0, 5)
      .map(w => ({ ...w, date: today }))

    const { data, error } = await supabase
      .from('daily_words')
      .insert(toInsert)
      .select()

    if (error) throw error

    console.log(`[VocabDaily Cron] ✅ Inserted ${data.length} words:`, data.map(w => w.word).join(', '))
  } catch (err) {
    console.error('[VocabDaily Cron] ❌ Error:', err.message)
    process.exit(1)
  }
}

insertDailyWords()

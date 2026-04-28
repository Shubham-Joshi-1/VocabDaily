// supabase/edge-functions/fetch-daily-words/index.js
// Deploy with: supabase functions deploy fetch-daily-words
// Schedule via pg_cron — see setup guide below.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WORD_BANK = [
  { word: 'Perspicacious', meaning_en: 'Having a ready insight into things; shrewd', meaning_hi: 'तीक्ष्णबुद्धि, कुशाग्र', sentence: 'The perspicacious detective noticed details others had overlooked.' },
  { word: 'Loquacious',    meaning_en: 'Tending to talk a great deal; talkative',   meaning_hi: 'बातूनी, वाचाल',           sentence: 'The loquacious host kept the party lively with endless stories.' },
  { word: 'Acrimony',      meaning_en: 'Bitterness or ill feeling',                  meaning_hi: 'कटुता, द्वेष',            sentence: 'The divorce was marked by acrimony on both sides.' },
  { word: 'Belligerent',   meaning_en: 'Hostile and aggressive',                     meaning_hi: 'आक्रामक, लड़ाकू',         sentence: 'The belligerent customer shouted at the staff over a small mistake.' },
  { word: 'Capricious',    meaning_en: 'Given to sudden changes of mood or behavior',meaning_hi: 'मनमौजी, अस्थिर',          sentence: 'Her capricious decisions made it hard to plan anything with her.' },
  { word: 'Diffident',     meaning_en: 'Modest or shy due to lack of confidence',    meaning_hi: 'संकोची, शर्मीला',          sentence: 'The diffident student rarely raised her hand in class.' },
  { word: 'Exacerbate',    meaning_en: 'Make a problem worse',                       meaning_hi: 'और बिगाड़ना, तीव्र करना', sentence: 'Stress can exacerbate many physical health conditions.' },
  { word: 'Fastidious',    meaning_en: 'Very attentive to accuracy and detail',      meaning_hi: 'नाज़ुकमिज़ाज, सूक्ष्म',    sentence: 'The fastidious chef rejected any ingredient that was not perfectly fresh.' },
  { word: 'Garrulous',     meaning_en: 'Excessively talkative',                      meaning_hi: 'बहुत बातूनी',              sentence: 'The garrulous taxi driver chatted non-stop during the entire journey.' },
  { word: 'Harbinger',     meaning_en: 'A sign that something is coming',            meaning_hi: 'पूर्वसूचक, संकेत',         sentence: 'Dark clouds were a harbinger of the approaching storm.' },
  { word: 'Impetuous',     meaning_en: 'Acting quickly without thinking',            meaning_hi: 'आवेगी, जल्दबाज़',          sentence: 'His impetuous decision to quit his job shocked everyone.' },
  { word: 'Jubilant',      meaning_en: 'Feeling or expressing great happiness',      meaning_hi: 'उल्लासपूर्ण, प्रसन्न',     sentence: 'The team was jubilant after winning the championship.' },
  { word: 'Laconic',       meaning_en: 'Using very few words; brief',                meaning_hi: 'संक्षिप्त, कम बोलना',      sentence: 'His laconic reply of "Fine" told me nothing.' },
  { word: 'Magnanimous',   meaning_en: 'Generous in forgiving; noble',               meaning_hi: 'उदार, महान्',               sentence: 'The magnanimous winner congratulated every other competitor.' },
  { word: 'Nonchalant',    meaning_en: 'Feeling no worry; casually calm',            meaning_hi: 'बेफिक्र, लापरवाह',         sentence: 'She appeared nonchalant about the exam, but had studied hard.' },
  { word: 'Oblivious',     meaning_en: 'Not aware of what is happening around',      meaning_hi: 'बेखबर, अनजान',             sentence: 'He was oblivious to the chaos happening right behind him.' },
  { word: 'Pedantic',      meaning_en: 'Overly concerned with minor details',        meaning_hi: 'अति सूक्ष्म, पांडित्यपूर्ण', sentence: 'The pedantic editor corrected every comma in the manuscript.' },
  { word: 'Querulous',     meaning_en: 'Complaining in a whining manner',            meaning_hi: 'शिकायती, कुड़कुड़ाने वाला', sentence: 'The querulous passenger complained about every aspect of the flight.' },
  { word: 'Recalcitrant',  meaning_en: 'Stubbornly refusing to obey',                meaning_hi: 'अड़ियल, हठी',              sentence: 'The recalcitrant child refused to eat his vegetables.' },
  { word: 'Sagacious',     meaning_en: 'Having or showing good judgment; wise',      meaning_hi: 'बुद्धिमान, दूरदर्शी',      sentence: 'The sagacious mentor guided young entrepreneurs with practical advice.' },
]

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const today = new Date().toISOString().split('T')[0]

    // Check how many words already exist for today
    const { data: existing } = await supabase
      .from('daily_words')
      .select('word')
      .eq('date', today)

    const existingWords = new Set((existing || []).map(r => r.word))

    // Get all words used on previous dates to avoid repeats
    const { data: allUsed } = await supabase
      .from('daily_words')
      .select('word')

    const usedWords = new Set((allUsed || []).map(r => r.word))

    // Filter available words from bank
    const available = WORD_BANK.filter(w => !usedWords.has(w.word))

    if (available.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Word bank exhausted — please add more words.', today }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Pick up to 5 words
    const toInsert = available
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.max(0, 5 - existingWords.size))
      .map(w => ({ ...w, date: today }))

    if (toInsert.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Today already has 5+ words.', today }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const { data, error } = await supabase
      .from('daily_words')
      .insert(toInsert)
      .select()

    if (error) throw error

    return new Response(
      JSON.stringify({ success: true, inserted: data.length, words: data.map(w => w.word) }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})

/*
─── SCHEDULE WITH pg_cron ──────────────────────────────────────────────────────

Run this SQL in Supabase Dashboard → SQL Editor:

  select cron.schedule(
    'daily-vocab-words',          -- job name
    '0 0 * * *',                  -- every day at midnight UTC
    $$
      select net.http_post(
        url    := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/fetch-daily-words',
        headers := '{"Authorization": "Bearer <YOUR_ANON_KEY>"}'::jsonb
      );
    $$
  );

To check scheduled jobs:
  select * from cron.job;

To remove the job:
  select cron.unschedule('daily-vocab-words');
*/

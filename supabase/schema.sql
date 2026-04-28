-- ============================================================
-- VocabDaily — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── Table: daily_words ──────────────────────────────────────
create table if not exists daily_words (
  id          uuid primary key default uuid_generate_v4(),
  word        text not null,
  meaning_en  text not null,
  meaning_hi  text not null,
  sentence    text not null,
  date        date not null,
  created_at  timestamptz default now()
);

create index if not exists idx_daily_words_date on daily_words(date);
create unique index if not exists idx_daily_words_word_date on daily_words(word, date);

-- ─── Table: user_settings ────────────────────────────────────
create table if not exists user_settings (
  id            uuid primary key default uuid_generate_v4(),
  user_id       text not null unique,
  words_per_day integer not null default 5 check (words_per_day between 2 and 5),
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists idx_user_settings_user_id on user_settings(user_id);

-- ─── Table: user_streaks ─────────────────────────────────────
create table if not exists user_streaks (
  id                uuid primary key default uuid_generate_v4(),
  user_id           text not null unique,
  current_streak    integer not null default 0,
  longest_streak    integer not null default 0,
  last_opened_date  date,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);

create index if not exists idx_user_streaks_user_id on user_streaks(user_id);

-- ─── Table: word_history ─────────────────────────────────────
create table if not exists word_history (
  id           uuid primary key default uuid_generate_v4(),
  user_id      text not null,
  word_id      uuid not null references daily_words(id) on delete cascade,
  viewed_date  date not null,
  created_at   timestamptz default now()
);

create index if not exists idx_word_history_user_id on word_history(user_id);
create index if not exists idx_word_history_viewed_date on word_history(viewed_date);
create unique index if not exists idx_word_history_unique on word_history(user_id, word_id, viewed_date);

-- ─── Row Level Security ──────────────────────────────────────
-- For simplicity with anonymous users, we disable RLS.
-- In production, enable RLS and use auth.uid() or a custom claim.
alter table daily_words    disable row level security;
alter table user_settings  disable row level security;
alter table user_streaks   disable row level security;
alter table word_history   disable row level security;

-- ─── Seed Data: 30 Words (6 days × 5 words) ─────────────────
-- Replace the dates with the actual dates you want to test.
-- TODAY = run this query to see today: select current_date;

insert into daily_words (word, meaning_en, meaning_hi, sentence, date) values

-- Day 1 (today - adjust date as needed)
('Ephemeral',   'Lasting for a very short time; transitory',         'क्षणिक, अल्पकालिक',         'The ephemeral beauty of cherry blossoms makes them all the more precious.',        current_date),
('Luminous',    'Full of or shedding light; bright and radiant',     'चमकीला, प्रकाशमान',         'The moon cast a luminous glow over the quiet village at night.',                  current_date),
('Resilient',   'Able to recover quickly from difficulties',         'लचीला, दृढ़',               'She remained resilient despite facing numerous obstacles in her career.',          current_date),
('Enigmatic',   'Difficult to interpret or understand; mysterious',  'रहस्यमय, अबूझ',             'His enigmatic smile left everyone guessing what he was thinking.',                current_date),
('Tranquil',    'Free from disturbance; calm and peaceful',          'शांत, निर्मल',              'They found a tranquil spot by the river for their afternoon picnic.',             current_date),

-- Day 2 (yesterday)
('Benevolent',  'Well-meaning and kindly; generous',                 'परोपकारी, दयालु',           'The benevolent doctor treated poor patients free of charge.',                     current_date - 1),
('Verbose',     'Using more words than needed; wordy',               'वाचाल, लंबे-चौड़े',          'His verbose report could have been summarized in just one page.',                 current_date - 1),
('Tenacious',   'Holding firm; persistent and determined',           'दृढ़ निश्चयी, जिद्दी',       'The tenacious athlete trained every day despite the pain.',                       current_date - 1),
('Melancholy',  'A deep, persistent sadness or gloom',              'उदासी, विषाद',               'A deep melancholy settled over him after the loss of his old friend.',            current_date - 1),
('Eloquent',    'Fluent or persuasive in speaking or writing',       'वाक्पटु, प्रभावशाली',        'Her eloquent speech moved the audience to tears.',                                current_date - 1),

-- Day 3
('Pragmatic',   'Dealing sensibly with practical problems',          'व्यावहारिक, यथार्थवादी',     'A pragmatic leader focuses on solutions rather than blame.',                      current_date - 2),
('Serendipity', 'Finding good things by accident',                   'सुखद संयोग, अचानक खुशी',    'Meeting his future business partner was pure serendipity.',                       current_date - 2),
('Vivid',       'Producing powerful feelings; very bright',          'जीवंत, स्पष्ट',              'She painted a vivid picture of life in the mountain village.',                    current_date - 2),
('Diligent',    'Having or showing care and effort in work',         'परिश्रमी, मेहनती',           'The diligent student revised her notes every evening before bed.',                current_date - 2),
('Candid',      'Truthful and straightforward; frank',               'स्पष्टवादी, खुलकर बोलना',   'Please be candid with me — I want to know the honest truth.',                    current_date - 2),

-- Day 4
('Ambiguous',   'Having more than one possible meaning; unclear',    'अस्पष्ट, संदिग्ध',          'The contract contained several ambiguous clauses that caused confusion.',          current_date - 3),
('Nostalgia',   'A sentimental longing for the past',               'पुरानी यादों की चाहत',       'The old song filled her with nostalgia for her childhood days.',                   current_date - 3),
('Articulate',  'Expressing ideas clearly and effectively',          'स्पष्ट रूप से बोलना',        'He was articulate and confident during the job interview.',                        current_date - 3),
('Frivolous',   'Not having any serious purpose; silly',             'तुच्छ, फालतू',               'He wasted time on frivolous games instead of studying for exams.',               current_date - 3),
('Intricate',   'Very complicated or detailed',                      'जटिल, पेचीदा',               'The watch had an intricate mechanism of hundreds of tiny gears.',                 current_date - 3),

-- Day 5
('Perseverance','Continued effort despite difficulty',               'दृढ़ता, लगन',                'Her perseverance in the face of failure eventually led to success.',              current_date - 4),
('Aloof',       'Not friendly; distant in manner',                   'दूर, उदासीन',                'He remained aloof at parties, preferring to observe rather than talk.',           current_date - 4),
('Profound',    'Having deep meaning or great importance',           'गहरा, अत्यंत महत्त्वपूर्ण', 'The book had a profound effect on how she viewed the world.',                     current_date - 4),
('Zealous',     'Having or showing great energy or enthusiasm',      'उत्साही, जोशीला',            'The zealous volunteer worked twelve hours a day without complaining.',            current_date - 4),
('Meticulous',  'Showing great attention to detail and care',        'सूक्ष्म, बहुत सावधान',       'The meticulous surgeon checked every instrument before the operation.',           current_date - 4),

-- Day 6
('Ebullient',   'Cheerful and full of energy; exuberant',           'जोशपूर्ण, उत्साहित',         'Her ebullient personality lit up every room she walked into.',                    current_date - 5),
('Stoic',       'Enduring pain without showing feelings',            'शांत, भावहीन',               'He faced the bad news with a stoic expression, hiding his grief.',               current_date - 5),
('Audacious',   'Showing willingness to take bold risks',            'साहसी, दुस्साहसी',           'It was an audacious plan, but somehow it actually worked.',                       current_date - 5),
('Empathy',     'Understanding and sharing another's feelings',      'सहानुभूति, दूसरे को समझना', 'Good doctors treat patients with both skill and empathy.',                         current_date - 5),
('Conundrum',   'A confusing and difficult problem or question',     'पहेली, उलझन',                'How to reduce pollution without slowing growth is the great conundrum of our time.', current_date - 5)

on conflict (word, date) do nothing;

-- ─── Verify ──────────────────────────────────────────────────
select date, count(*) as word_count from daily_words group by date order by date desc;

// supabase/edge-functions/fetch-daily-words/index.js
// Deploy with: supabase functions deploy fetch-daily-words
// Schedule via pg_cron — see setup guide below.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WORD_BANK = [
  { word: 'Perspicacious', meaning_en: 'Having a ready insight; shrewd', meaning_hi: 'तीक्ष्णबुद्धि, कुशाग्र', sentence: 'The perspicacious detective noticed details others had overlooked.' },
  { word: 'Loquacious', meaning_en: 'Tending to talk a great deal', meaning_hi: 'बातूनी, वाचाल', sentence: 'The loquacious host kept the party lively with endless stories.' },
  { word: 'Acrimony', meaning_en: 'Bitterness or ill feeling', meaning_hi: 'कटुता, द्वेष', sentence: 'The divorce was marked by acrimony on both sides.' },
  { word: 'Belligerent', meaning_en: 'Hostile and aggressive', meaning_hi: 'आक्रामक, लड़ाकू', sentence: 'The belligerent customer shouted at the staff over a small mistake.' },
  { word: 'Capricious', meaning_en: 'Given to sudden changes of mood', meaning_hi: 'मनमौजी, अस्थिर', sentence: 'Her capricious decisions made it hard to plan anything.' },
  { word: 'Diffident', meaning_en: 'Modest or shy due to lack of confidence', meaning_hi: 'संकोची, शर्मीला', sentence: 'The diffident student rarely raised her hand in class.' },
  { word: 'Exacerbate', meaning_en: 'Make a problem worse', meaning_hi: 'और बिगाड़ना, तीव्र करना', sentence: 'Stress can exacerbate many physical health conditions.' },
  { word: 'Fastidious', meaning_en: 'Very attentive to accuracy and detail', meaning_hi: 'नाज़ुकमिज़ाज, सूक्ष्म', sentence: 'The fastidious chef rejected any ingredient that was not perfectly fresh.' },
  { word: 'Garrulous', meaning_en: 'Excessively talkative', meaning_hi: 'बहुत बातूनी', sentence: 'The garrulous taxi driver chatted non-stop during the journey.' },
  { word: 'Harbinger', meaning_en: 'A sign that something is coming', meaning_hi: 'पूर्वसूचक, संकेत', sentence: 'Dark clouds were a harbinger of the approaching storm.' },
  { word: 'Impetuous', meaning_en: 'Acting quickly without thinking', meaning_hi: 'आवेगी, जल्दबाज़', sentence: 'His impetuous decision to quit his job shocked everyone.' },
  { word: 'Jubilant', meaning_en: 'Feeling or expressing great happiness', meaning_hi: 'उल्लासपूर्ण, प्रसन्न', sentence: 'The team was jubilant after winning the championship.' },
  { word: 'Laconic', meaning_en: 'Using very few words; brief', meaning_hi: 'संक्षिप्त, कम बोलना', sentence: 'His laconic reply of "Fine" told me nothing.' },
  { word: 'Magnanimous', meaning_en: 'Generous in forgiving; noble', meaning_hi: 'उदार, महान्', sentence: 'The magnanimous winner congratulated every other competitor.' },
  { word: 'Nonchalant', meaning_en: 'Feeling no worry; casually calm', meaning_hi: 'बेफिक्र, लापरवाह', sentence: 'She appeared nonchalant about the exam, but had studied hard.' },
  { word: 'Oblivious', meaning_en: 'Not aware of what is happening around', meaning_hi: 'बेखबर, अनजान', sentence: 'He was oblivious to the chaos happening right behind him.' },
  { word: 'Pedantic', meaning_en: 'Overly concerned with minor details', meaning_hi: 'अति सूक्ष्म, पांडित्यपूर्ण', sentence: 'The pedantic editor corrected every comma in the manuscript.' },
  { word: 'Querulous', meaning_en: 'Complaining in a whining manner', meaning_hi: 'शिकायती, कुड़कुड़ाने वाला', sentence: 'The querulous passenger complained about every aspect of the flight.' },
  { word: 'Recalcitrant', meaning_en: 'Stubbornly refusing to obey', meaning_hi: 'अड़ियल, हठी', sentence: 'The recalcitrant child refused to eat his vegetables.' },
  { word: 'Sagacious', meaning_en: 'Having or showing good judgment; wise', meaning_hi: 'बुद्धिमान, दूरदर्शी', sentence: 'The sagacious mentor guided young entrepreneurs with practical advice.' },
  { word: 'Taciturn', meaning_en: 'Reserved or uncommunicative in speech', meaning_hi: 'कम बोलने वाला, चुप्पा', sentence: 'The taciturn professor rarely spoke outside of class.' },
  { word: 'Ubiquitous', meaning_en: 'Present everywhere at the same time', meaning_hi: 'सर्वव्यापी, हर जगह मौजूद', sentence: 'Smartphones have become ubiquitous in modern society.' },
  { word: 'Vacillate', meaning_en: 'Waver between different opinions', meaning_hi: 'डगमगाना, अनिश्चित रहना', sentence: 'He vacillated between accepting and rejecting the offer.' },
  { word: 'Wistful', meaning_en: 'Having a feeling of vague longing', meaning_hi: 'उदासीन, तरसना', sentence: 'She gave a wistful smile when she saw her old school.' },
  { word: 'Xenial', meaning_en: 'Friendly to strangers; hospitable', meaning_hi: 'मेहमाननवाज़, अतिथि-सत्कार करने वाला', sentence: 'The xenial villagers welcomed every traveler with open arms.' },
  { word: 'Yearning', meaning_en: 'A feeling of intense longing', meaning_hi: 'तड़प, आकांक्षा', sentence: 'He felt a deep yearning for his hometown after years abroad.' },
  { word: 'Zealot', meaning_en: 'A person who is fanatical about a cause', meaning_hi: 'कट्टरपंथी, अत्यधिक उत्साही', sentence: 'The zealot refused to consider any other point of view.' },
  { word: 'Abate', meaning_en: 'Become less intense or widespread', meaning_hi: 'कम होना, घटना', sentence: 'The storm finally abated after three days of heavy rain.' },
  { word: 'Benign', meaning_en: 'Gentle and kind; not harmful', meaning_hi: 'सौम्य, हानिरहित', sentence: 'The doctor confirmed the tumor was benign and not dangerous.' },
  { word: 'Candor', meaning_en: 'The quality of being open and honest', meaning_hi: 'स्पष्टवादिता, खुलापन', sentence: 'I appreciated her candor when she told me the truth directly.' },
  { word: 'Dauntless', meaning_en: 'Showing fearlessness and determination', meaning_hi: 'निडर, साहसी', sentence: 'The dauntless firefighter rushed into the burning building.' },
  { word: 'Ebullient', meaning_en: 'Cheerful and full of energy', meaning_hi: 'जोशपूर्ण, उत्साहित', sentence: 'Her ebullient personality lit up every room she walked into.' },
  { word: 'Fervent', meaning_en: 'Having or displaying passionate intensity', meaning_hi: 'उत्साही, जोशीला', sentence: 'He was a fervent supporter of environmental conservation.' },
  { word: 'Gregarious', meaning_en: 'Fond of company; sociable', meaning_hi: 'मिलनसार, सामाजिक', sentence: 'The gregarious student made friends everywhere she went.' },
  { word: 'Hapless', meaning_en: 'Unfortunate; having no luck', meaning_hi: 'बदकिस्मत, अभागा', sentence: 'The hapless traveler missed his flight and lost his luggage.' },
  { word: 'Incisive', meaning_en: 'Intelligently analytical and clear-thinking', meaning_hi: 'तीक्ष्ण, सटीक', sentence: 'Her incisive analysis of the problem impressed everyone.' },
  { word: 'Jocular', meaning_en: 'Fond of joking; humorous', meaning_hi: 'हंसमुख, मज़ाकिया', sentence: 'His jocular remarks kept the mood light during the long meeting.' },
  { word: 'Kinetic', meaning_en: 'Relating to or resulting from motion', meaning_hi: 'गतिज, गति से संबंधित', sentence: 'The kinetic energy of the falling water powered the turbine.' },
  { word: 'Languid', meaning_en: 'Displaying or having a disinclination for exertion', meaning_hi: 'सुस्त, थका हुआ', sentence: 'The hot afternoon made everyone languid and sleepy.' },
  { word: 'Maverick', meaning_en: 'An independent-minded person', meaning_hi: 'स्वतंत्र विचारक, अपरंपरागत', sentence: 'The maverick scientist challenged decades of established theory.' },
  { word: 'Nascent', meaning_en: 'Just coming into existence; emerging', meaning_hi: 'उभरता हुआ, नवजात', sentence: 'The nascent technology showed great promise for the future.' },
  { word: 'Opulent', meaning_en: 'Ostentatiously rich and luxurious', meaning_hi: 'वैभवशाली, समृद्ध', sentence: 'The opulent palace had hundreds of rooms filled with gold.' },
  { word: 'Placid', meaning_en: 'Not easily upset; calm', meaning_hi: 'शांत, स्थिर', sentence: 'The placid lake reflected the mountains perfectly.' },
  { word: 'Quixotic', meaning_en: 'Extremely idealistic; unrealistic', meaning_hi: 'अव्यावहारिक आदर्शवादी', sentence: 'His quixotic plan to end world hunger in a year was admirable but unrealistic.' },
  { word: 'Rancor', meaning_en: 'Bitterness or resentfulness', meaning_hi: 'कड़वाहट, द्वेष', sentence: 'Years of rancor between the two families finally ended in peace.' },
  { word: 'Sanguine', meaning_en: 'Optimistic, especially in difficult situations', meaning_hi: 'आशावादी, उत्साही', sentence: 'Despite the setbacks, she remained sanguine about the future.' },
  { word: 'Tenuous', meaning_en: 'Very weak or slight', meaning_hi: 'कमज़ोर, नाज़ुक', sentence: 'The evidence for his theory was tenuous at best.' },
  { word: 'Umbrage', meaning_en: 'Offense or annoyance', meaning_hi: 'नाराज़गी, रोष', sentence: 'She took umbrage at the suggestion that she was wrong.' },
  { word: 'Vivacious', meaning_en: 'Attractively lively and animated', meaning_hi: 'जीवंत, उत्साही', sentence: 'Her vivacious personality made her the center of every gathering.' },
  { word: 'Wary', meaning_en: 'Feeling or showing caution about possible dangers', meaning_hi: 'सतर्क, चौकन्ना', sentence: 'Be wary of strangers who offer help without reason.' },
  { word: 'Xenophobia', meaning_en: 'Dislike of people from other countries', meaning_hi: 'विदेशी लोगों से भय या नफ़रत', sentence: 'Xenophobia creates divisions and hinders progress.' },
  { word: 'Zeal', meaning_en: 'Great energy or enthusiasm for a cause', meaning_hi: 'जोश, उत्साह', sentence: 'She pursued her studies with incredible zeal and dedication.' },
  { word: 'Aplomb', meaning_en: 'Self-confidence or assurance', meaning_hi: 'आत्मविश्वास, दृढ़ता', sentence: 'She handled the difficult interview with great aplomb.' },
  { word: 'Brevity', meaning_en: 'Concise and exact use of words', meaning_hi: 'संक्षिप्तता', sentence: 'The speech was praised for its brevity and clarity.' },
  { word: 'Cogent', meaning_en: 'Clear, logical and convincing', meaning_hi: 'तर्कसंगत, प्रभावशाली', sentence: 'She made a cogent argument that changed many minds.' },
  { word: 'Deft', meaning_en: 'Neatly skillful and quick', meaning_hi: 'कुशल, चतुर', sentence: 'The surgeon made a deft incision with practiced hands.' },
  { word: 'Empathy', meaning_en: 'Understanding and sharing the feelings of another', meaning_hi: 'सहानुभूति', sentence: 'Good leaders treat their team with empathy and respect.' },
  { word: 'Furtive', meaning_en: 'Attempting to avoid notice; secretive', meaning_hi: 'चोरी-छुपे, गुपचुप', sentence: 'He cast a furtive glance over his shoulder before entering.' },
  { word: 'Genial', meaning_en: 'Friendly and cheerful', meaning_hi: 'मिलनसार, खुशमिज़ाज', sentence: 'The genial shopkeeper always greeted customers with a smile.' },
  { word: 'Harangue', meaning_en: 'A lengthy and aggressive speech', meaning_hi: 'लंबा भाषण, डांट', sentence: 'The manager harangued the team for arriving late.' },
  { word: 'Insolent', meaning_en: 'Showing a rude and arrogant lack of respect', meaning_hi: 'अभिमानी, ढीठ', sentence: 'The insolent student talked back to the teacher.' },
  { word: 'Jovial', meaning_en: 'Cheerful and friendly', meaning_hi: 'प्रसन्नचित्त, खुशमिज़ाज', sentence: 'His jovial nature made him popular at every gathering.' },
  { word: 'Keen', meaning_en: 'Having a sharp or penetrating quality', meaning_hi: 'तीव्र, उत्सुक', sentence: 'She had a keen eye for spotting errors in the data.' },
  { word: 'Lament', meaning_en: 'Express grief or regret', meaning_hi: 'विलाप करना, शोक मनाना', sentence: 'He lamented the loss of his childhood home.' },
  { word: 'Mundane', meaning_en: 'Lacking interest or excitement; ordinary', meaning_hi: 'सामान्य, नीरस', sentence: 'Even mundane tasks become meaningful when done with care.' },
  { word: 'Nefarious', meaning_en: 'Wicked or criminal', meaning_hi: 'दुष्ट, पापी', sentence: 'The villain hatched a nefarious plot to steal the treasure.' },
  { word: 'Ominous', meaning_en: 'Giving the impression that something bad is coming', meaning_hi: 'अशुभ, बुरे संकेत देने वाला', sentence: 'There was an ominous silence before the storm hit.' },
  { word: 'Pensive', meaning_en: 'Engaged in deep or serious thought', meaning_hi: 'विचारमग्न, चिंतित', sentence: 'She sat by the window with a pensive expression.' },
  { word: 'Quirky', meaning_en: 'Having unusual and unexpected traits', meaning_hi: 'विचित्र, अजीब तरीके का', sentence: 'His quirky sense of humor made everyone laugh unexpectedly.' },
  { word: 'Resilience', meaning_en: 'The ability to recover quickly from difficulties', meaning_hi: 'लचीलापन, दृढ़ता', sentence: 'Resilience is the most important quality for long-term success.' },
  { word: 'Solace', meaning_en: 'Comfort in a time of distress', meaning_hi: 'सांत्वना, राहत', sentence: 'She found solace in music during the difficult times.' },
  { word: 'Trepidation', meaning_en: 'A feeling of fear or anxiety', meaning_hi: 'घबराहट, भय', sentence: 'He entered the examination hall with great trepidation.' },
  { word: 'Unravel', meaning_en: 'Investigate and solve a mystery', meaning_hi: 'सुलझाना, खोलना', sentence: 'The detective worked hard to unravel the complex case.' },
  { word: 'Valiant', meaning_en: 'Possessing or showing courage', meaning_hi: 'वीर, साहसी', sentence: 'The valiant soldiers protected the village through the night.' },
  { word: 'Whimsical', meaning_en: 'Playfully quaint or fanciful', meaning_hi: 'मनमौजी, सनकी', sentence: 'The whimsical painting featured flying elephants and pink trees.' },
  { word: 'Xenial', meaning_en: 'Of or relating to hospitality', meaning_hi: 'अतिथि-सत्कार से संबंधित', sentence: 'The xenial host made sure every guest felt at home.' },
  { word: 'Yonder', meaning_en: 'At some distance in that direction', meaning_hi: 'उस दिशा में, वहाँ', sentence: 'The treasure was buried yonder, past the old oak tree.' },
  { word: 'Zest', meaning_en: 'Great enthusiasm and energy', meaning_hi: 'उत्साह, जोश', sentence: 'She approached every challenge with zest and positivity.' },
  { word: 'Amiable', meaning_en: 'Having a friendly and pleasant manner', meaning_hi: 'मिलनसार, प्रिय', sentence: 'The amiable neighbor always stopped to chat.' },
  { word: 'Boisterous', meaning_en: 'Noisy, energetic, and cheerful', meaning_hi: 'शोरगुल वाला, उत्साही', sentence: 'The boisterous children played in the park all afternoon.' },
  { word: 'Circumspect', meaning_en: 'Wary and unwilling to take risks', meaning_hi: 'सतर्क, सावधान', sentence: 'A circumspect investor always researches before putting in money.' },
  { word: 'Debonair', meaning_en: 'Confident, stylish and charming', meaning_hi: 'शालीन, आकर्षक', sentence: 'The debonair actor charmed everyone at the premiere.' },
  { word: 'Eclectic', meaning_en: 'Deriving ideas from a broad range of sources', meaning_hi: 'विविध, मिश्रित', sentence: 'Her eclectic taste in music ranged from jazz to classical.' },
  { word: 'Flagrant', meaning_en: 'Conspicuously wrong or immoral', meaning_hi: 'स्पष्ट, घोर', sentence: 'The referee ignored a flagrant foul in the final minute.' },
  { word: 'Gullible', meaning_en: 'Easily persuaded to believe things', meaning_hi: 'भोला, आसानी से बहकने वाला', sentence: 'The gullible tourist was tricked into paying double the price.' },
  { word: 'Halcyon', meaning_en: 'Denoting a period of time in the past that was happy', meaning_hi: 'सुखद, शांतिपूर्ण', sentence: 'Those were halcyon days before the war changed everything.' },
  { word: 'Impartial', meaning_en: 'Treating all rivals equally; fair', meaning_hi: 'निष्पक्ष, न्यायसंगत', sentence: 'A good judge must always remain impartial in court.' },
  { word: 'Judicious', meaning_en: 'Having or showing good judgment', meaning_hi: 'विवेकशील, समझदार', sentence: 'She made a judicious choice by saving before spending.' },
  { word: 'Kindle', meaning_en: 'Light or set on fire; arouse a feeling', meaning_hi: 'जलाना, प्रज्वलित करना', sentence: 'His words kindled a passion for science in the young students.' },
  { word: 'Listless', meaning_en: 'Lacking energy or enthusiasm', meaning_hi: 'सुस्त, निरुत्साही', sentence: 'She felt listless and tired after the long journey.' },
  { word: 'Meander', meaning_en: 'Follow a winding course; wander', meaning_hi: 'घूमना, इधर-उधर भटकना', sentence: 'The river meandered through the green valley.' },
  { word: 'Nuance', meaning_en: 'A subtle difference in meaning or expression', meaning_hi: 'सूक्ष्म अंतर, बारीकी', sentence: 'A good translator understands every nuance of the language.' },
  { word: 'Ostentatious', meaning_en: 'Characterized by showiness', meaning_hi: 'दिखावटी, आडंबरी', sentence: 'His ostentatious lifestyle made others uncomfortable.' },
  { word: 'Pertinent', meaning_en: 'Relevant or applicable to a particular matter', meaning_hi: 'प्रासंगिक, उचित', sentence: 'Please ask only pertinent questions during the meeting.' },
  { word: 'Quandary', meaning_en: 'A state of uncertainty or perplexity', meaning_hi: 'दुविधा, असमंजस', sentence: 'She was in a quandary about whether to take the job abroad.' },
  { word: 'Recluse', meaning_en: 'A person who lives alone and avoids others', meaning_hi: 'एकांतप्रिय, वैरागी', sentence: 'After retiring, he became a recluse in the mountains.' },
  { word: 'Serene', meaning_en: 'Calm, peaceful and untroubled', meaning_hi: 'शांत, प्रसन्न', sentence: 'The serene countryside was a welcome escape from the city.' },
  { word: 'Turmoil', meaning_en: 'A state of great disturbance or confusion', meaning_hi: 'उथल-पुथल, अशांति', sentence: 'The country was in turmoil after the sudden change of government.' },
  { word: 'Unwavering', meaning_en: 'Steady or resolute; not wavering', meaning_hi: 'अटल, दृढ़', sentence: 'Her unwavering commitment to justice inspired many.' },
  { word: 'Venerable', meaning_en: 'Accorded a great deal of respect', meaning_hi: 'पूजनीय, आदरणीय', sentence: 'The venerable teacher was celebrated after fifty years of service.' },
  { word: 'Whimsy', meaning_en: 'Playfully quaint or fanciful behavior', meaning_hi: 'सनक, मनमौजीपन', sentence: 'The garden was designed with delightful whimsy and creativity.' },
  { word: 'Exuberant', meaning_en: 'Filled with lively energy and excitement', meaning_hi: 'उत्साही, जोशीला', sentence: 'The exuberant crowd cheered as the team scored.' },
  { word: 'Forbearance', meaning_en: 'Patient self-control; tolerance', meaning_hi: 'धैर्य, सहनशीलता', sentence: 'Dealing with difficult customers requires great forbearance.' },
  { word: 'Gallant', meaning_en: 'Brave and heroic', meaning_hi: 'वीर, साहसी', sentence: 'The gallant soldier saved three lives during the rescue mission.' },
  { word: 'Humility', meaning_en: 'The quality of being modest', meaning_hi: 'विनम्रता, नम्रता', sentence: 'True greatness always comes with humility.' },
  { word: 'Immutable', meaning_en: 'Unchanging over time', meaning_hi: 'अपरिवर्तनीय, स्थायी', sentence: 'The laws of mathematics are immutable and universal.' },
  { word: 'Jeopardize', meaning_en: 'Put someone or something into a situation of risk', meaning_hi: 'खतरे में डालना', sentence: 'His reckless driving could jeopardize his career.' },
  { word: 'Knack', meaning_en: 'A special skill at doing something', meaning_hi: 'विशेष योग्यता, हुनर', sentence: 'She has a knack for making people feel at ease.' },
  { word: 'Lavish', meaning_en: 'Sumptuously rich, elaborate or luxurious', meaning_hi: 'भव्य, विलासितापूर्ण', sentence: 'They threw a lavish party to celebrate the launch.' },
  { word: 'Momentous', meaning_en: 'Of great importance or significance', meaning_hi: 'महत्त्वपूर्ण, ऐतिहासिक', sentence: 'Independence Day was a momentous occasion for the nation.' },
  { word: 'Nebulous', meaning_en: 'In the form of a cloud; vague', meaning_hi: 'धुंधला, अस्पष्ट', sentence: 'His plans for the future were still nebulous and undefined.' },
  { word: 'Obstinate', meaning_en: 'Stubbornly refusing to change ones opinion', meaning_hi: 'जिद्दी, हठी', sentence: 'The obstinate man refused to admit he was wrong.' },
  { word: 'Palpable', meaning_en: 'So intense as to seem almost touchable', meaning_hi: 'स्पष्ट, महसूस करने योग्य', sentence: 'The tension in the room was palpable before the announcement.' },
  { word: 'Quintessential', meaning_en: 'Representing the most perfect example', meaning_hi: 'सर्वोत्तम उदाहरण, आदर्श', sentence: 'The Taj Mahal is the quintessential symbol of love.' },
  { word: 'Rapport', meaning_en: 'A close and harmonious relationship', meaning_hi: 'तालमेल, घनिष्ठता', sentence: 'The teacher built a strong rapport with her students.' },
  { word: 'Steadfast', meaning_en: 'Resolutely firm and unwavering', meaning_hi: 'दृढ़, अटल', sentence: 'He remained steadfast in his belief despite opposition.' },
  { word: 'Timid', meaning_en: 'Showing a lack of courage or confidence', meaning_hi: 'डरपोक, संकोची', sentence: 'The timid child hid behind her mother at the party.' },
  { word: 'Unprecedented', meaning_en: 'Never done or known before', meaning_hi: 'अभूतपूर्व, बेमिसाल', sentence: 'The pandemic caused unprecedented disruption worldwide.' },
  { word: 'Versatile', meaning_en: 'Able to adapt or be used in many ways', meaning_hi: 'बहुमुखी, अनुकूलनीय', sentence: 'A versatile actor can play any kind of role convincingly.' },
  { word: 'Wholeheartedly', meaning_en: 'With complete sincerity and commitment', meaning_hi: 'पूरे दिल से', sentence: 'She wholeheartedly supported her friend through the tough times.' },
  { word: 'Exemplary', meaning_en: 'Serving as a desirable model', meaning_hi: 'अनुकरणीय, आदर्श', sentence: 'Her exemplary conduct earned her the respect of all.' },
  { word: 'Fathom', meaning_en: 'Understand after much thought', meaning_hi: 'समझना, थाह लगाना', sentence: 'I cannot fathom why he made such a strange decision.' },
  { word: 'Gratitude', meaning_en: 'The quality of being thankful', meaning_hi: 'कृतज्ञता, आभार', sentence: 'Expressing gratitude regularly improves mental wellbeing.' },
  { word: 'Haughty', meaning_en: 'Arrogantly superior and disdainful', meaning_hi: 'घमंडी, अहंकारी', sentence: 'The haughty manager never listened to his team.' },
  { word: 'Illuminate', meaning_en: 'Light up or make clear and understandable', meaning_hi: 'रोशन करना, स्पष्ट करना', sentence: 'The documentary illuminated the hidden struggles of farmers.' },
  { word: 'Jubilee', meaning_en: 'A special anniversary celebration', meaning_hi: 'जयंती, उत्सव', sentence: 'The school celebrated its golden jubilee with great fanfare.' },
  { word: 'Kindle', meaning_en: 'Arouse or inspire a feeling or emotion', meaning_hi: 'भड़काना, जगाना', sentence: 'The coach kindled a competitive spirit in the young athletes.' },
]

Deno.serve(async (req) => {
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    )

    const today = new Date().toISOString().split('T')[0]

    // Check words already used on ANY date
    const { data: allUsed } = await supabase
      .from('daily_words')
      .select('word')

    const usedWords = new Set((allUsed || []).map(r => r.word))

    // Check how many words already exist for today
    const { data: todayWords } = await supabase
      .from('daily_words')
      .select('word')
      .eq('date', today)

    const todayCount = (todayWords || []).length

    if (todayCount >= 5) {
      return new Response(
        JSON.stringify({ message: 'Today already has 5+ words.', today }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Filter available words
    const available = WORD_BANK.filter(w => !usedWords.has(w.word))

    if (available.length === 0) {
      return new Response(
        JSON.stringify({ message: 'Word bank exhausted. Please add more words.', today }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Pick needed words
    const needed = 5 - todayCount
    const toInsert = available
      .sort(() => Math.random() - 0.5)
      .slice(0, needed)
      .map(w => ({ ...w, date: today }))

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
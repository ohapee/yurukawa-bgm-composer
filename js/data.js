/**
 * ゆるかわBGMコンポーザー - 設定データ定義
 * 激しい要素を一切排除し、「かわいい！」「癒やされる」に特化した音作りデータ
 */

// ゆるかわシチュエーション・世界観
export const SITUATIONS = [
  { id: 'nap', ja: 'ひだまりおひるね (ぽかぽか・すやすや)', en: 'a warm, cozy afternoon nap feeling with sunny gentle warmth', enShort: 'cozy afternoon nap' },
  { id: 'tea_time', ja: 'あまいティータイム (スイーツ・マシュマロ)', en: 'a sweet and pastel cafe tea-time vibe with treats and marshmallows', enShort: 'sweet cafe tea-time' },
  { id: 'fluffy_animals', ja: 'もふもふ動物たち (ねこ・うさぎ・子犬)', en: 'a fluffy, wholesome atmosphere full of cute sleeping kittens and puppies', enShort: 'fluffy cute animals' },
  { id: 'stroll', ja: 'ぽてぽてお散歩 (のんびり・シャボン玉)', en: 'a cheerful, light-footed stroll through a quiet park with floating soap bubbles', enShort: 'peaceful stroll with bubbles' },
  { id: 'storybook', ja: 'よるの絵本タイム (子守唄・星空)', en: 'a magical bedtime storybook feel under sparkling gentle stars', enShort: 'bedtime fairy-tale vibe' },
  { id: 'pajama', ja: 'パジャマでおしゃべり (ほっこり・安心)', en: 'a relaxed, friendly sleepover atmosphere in cozy pajamas', enShort: 'cozy sleepover mood' },
  { id: 'cloud_cafe', ja: '雲の上のカフェ (ふわふわ・わたあめ)', en: 'a whimsical, dreamy cloud-top cafe surrounded by cotton candy', enShort: 'dreamy cotton candy cafe' },
  { id: 'rainy_day', ja: 'あめの日の窓辺 (しっとり・カエルとあじさい)', en: 'a calm, cozy rainy-day melody watching raindrops on the window', enShort: 'gentle rainy-day calm' }
];

// 癒やしの音色・楽器
export const INSTRUMENTS = [
  { id: 'music_box', ja: 'オルゴール (Music Box)', en: 'a delicate nostalgic music box chime' },
  { id: 'toy_piano', ja: 'トイピアノ (Toy Piano)', en: 'an innocent and sweet toy piano melody' },
  { id: 'rhodes', ja: 'まろやかローズピアノ (Rhodes)', en: 'warm, velvety Rhodes electric piano chords' },
  { id: 'marimba', ja: 'マリンバ/木琴', en: 'bouncy, round acoustic marimba drops' },
  { id: 'ukulele', ja: 'アコースティックウクレレ', en: 'a sunny, mellow acoustic ukulele strum' },
  { id: 'bubble_synth', ja: 'ぷくぷくバブルシンセ', en: 'springy, bubbly pure-sine water drop plucks' },
  { id: 'celesta', ja: 'チェレスタ/ちいさな鈴', en: 'soft, sparkling celesta bell tones' },
  { id: 'nylon_guitar', ja: 'やさしいナイロン弦ギター', en: 'soft fingerpicked acoustic nylon guitar' },
  { id: 'wind_chimes', ja: 'ウィンドチャイム (光の粒)', en: 'gentle shimmering breeze wind chimes' },
  { id: 'cotton_pad', ja: 'わたあめパッドシンセ', en: 'a super-soft, pillowy ambient synth pad' }
];

// ゆるかわ効果音（アクセント）
export const SFX = [
  { id: 'poyon', ja: 'ぽよ〜ん (プリン・ゼリー)', en: 'a cute soft bouncy jelly boing' },
  { id: 'koron', ja: 'ころん (木のおもちゃ)', en: 'a tiny wooden toy tumble sound' },
  { id: 'pukupuku', ja: 'ぷくぷく (シャボン玉・泡)', en: 'gentle popping soap bubble drops' },
  { id: 'cat_meow', ja: 'にゃ〜ん (甘えん坊な子猫)', en: 'an adorable tiny kitten meow purr' },
  { id: 'yawn', ja: 'ふわぁ〜 (小さなあくび)', en: 'a soft, sweet sleepy kitten yawn' },
  { id: 'tiny_bell', ja: 'チリン (子猫の首輪の鈴)', en: 'a single sparkling mini collar bell chime' },
  { id: 'munch', ja: 'もぐもぐ (お菓子の時間)', en: 'cute cartoon biscuit nibble sounds' },
  { id: 'toy_camera', ja: 'パシャッ (トイカメラ)', en: 'a soft retro toy camera click' },
  { id: 'kyurun', ja: 'きゅるん (ハートのキラキラ)', en: 'twinkling pastel heart sparkle chimes' },
  { id: 'sigh', ja: 'ほっ… (安心のため息)', en: 'a peaceful relaxed sigh of comfort' }
];

// 調性・和声（あたたかい日だまり感）
export const KEYS = {
  sunny_maj7: {
    ja: '陽だまりメジャー7th (やさしく包み込む安心感)',
    en: 'warm, uplifting major 7th harmony bathed in sunlight',
    baseNote: 'C',
    scaleType: 'major7'
  },
  sweet_add9: {
    ja: 'あまいadd9 (お砂糖のような愛おしい甘酸っぱさ)',
    en: 'sweet, tender add9 chords reminiscent of sugar candy',
    baseNote: 'F',
    scaleType: 'add9'
  },
  penta_lullaby: {
    ja: 'ぽかぽかペンタトニック (素朴な子守唄・童話)',
    en: 'a gentle, nostalgic pentatonic lullaby melody',
    baseNote: 'G',
    scaleType: 'pentatonic'
  },
  waltz_34: {
    ja: 'ゆらゆらワルツ (3拍子のゆりかご・お昼寝)',
    en: 'a slow, swaying 3/4 cradle waltz rhythm for sleepy naptime',
    baseNote: 'C',
    scaleType: 'waltz'
  }
};

// 効果音の出現頻度
export const DENSITY = {
  none: { ja: '使わない (音楽のみで静かに)', en: 'no sound effects' },
  occasional: { ja: 'たまにコロンと挟む (推奨)', en: 'subtly sprinkled here and there' },
  frequent: { ja: '楽しげに散りばめる (にぎやか)', en: 'frequently scattered like cute confetti' }
};

// やさしさ・脱力レベル（激しさの完全排除指示）
export const GENTLE_LEVELS = {
  gentle: {
    id: 'gentle',
    label: 'おだやかカフェ (ほんのりビート)',
    ja: '刺激的な音や急な盛り上がりは避け、のんびりとしたカフェBGMのように心安らぐ音にしてほしい。',
    en: 'Keep the music utterly gentle and soothing, avoiding any dramatic builds or aggressive sounds, like a peaceful afternoon cafe.'
  },
  extra_soft: {
    id: 'extra_soft',
    label: 'ふんわりマシュマロ (完全ドラムレス)',
    ja: 'ドラムや強いビートは一切使わず、オルゴールと鍵盤、木琴の優しい調べだけで作ってほしい。',
    en: 'Completely drumless and beatless; composed solely of gentle music box, soft keys, and wooden acoustic tones with zero percussion.'
  },
  sleepy: {
    id: 'sleepy',
    label: 'すやすや子守唄 (眠気を誘う究極の脱力)',
    ja: '聴いていると自然に眠くなるような、極限まで優しく静かな子守唄。音量は控えめで、すべてが丸く柔らかい。',
    en: 'An ultra-soothing, slow lullaby designed to gently lull the listener to sleep. Ultra-soft dynamics, pillowy-soft attack, pure calm.'
  }
};

// ネガティブプロンプト（完全除外したい激しい要素）
export const NEGATIVE_OPTIONS = [
  { id: 'drums_heavy', ja: '重いドラム・激しいビート・EDMドロップ', en: 'heavy drums, EDM drops, trap beats, aggressive bass, dubstep' },
  { id: 'loud_screaming', ja: '大きな音・叫び声・鋭いシンセ', en: 'loud piercing synths, harsh highs, distortion, noisy screech' },
  { id: 'fast_tense', ja: '早いテンポ・緊張感・ホラー・焦燥感', en: 'fast tempo, intense rhythm, horror, tension, dark dramatic swells' },
  { id: 'vocals_shouting', ja: '早口ボーカル・騒がしいコール・ラップ', en: 'fast vocals, rapping, shouting, aggressive speech' }
];

// トラック長（SNS・リール・ループ用）
export const DURATIONS = [
  { id: '15', label: '15秒 (TikTok/リール演出用)', sec: 15, stinger: true },
  { id: '30', label: '30秒 (ショート動画用)', sec: 30 },
  { id: '60', label: '60秒 (作業用ループ・標準)', sec: 60 },
  { id: '90', label: '90秒 (ゆったり鑑賞用)', sec: 90 },
  { id: 'loop', label: 'ループ (尺指定なし・シームレス)', sec: null }
];

// ランダム曲名ガチャ（思わず「かわいい！」と叫びたくなる言葉たち）
export const TITLE_SUGGESTIONS = [
  'ねこのおひるねワルツ',
  'もふもふマシュマロ村',
  'ひだまりティータイム',
  'プリンのぽよぽよ行進曲',
  'こいぬのぽてぽてお散歩',
  '星くずのドロップキャンディ',
  'パジャマでおやすみ',
  'わたあめ雲のカフェテラス',
  'こねこのちいさなあくび',
  '雨ふりシャボン玉とあじさい',
  'お砂糖の妖精たちのステップ',
  'おもちゃ箱のゆりかごソング',
  'いちごみるくの夢のなか',
  'ふわふわひつじの数えうた',
  '陽だまりのすずめさん',
  'ホットココアと絵本のじかん',
  'しあわせのクローバー畑',
  'まどろみブランケット'
];

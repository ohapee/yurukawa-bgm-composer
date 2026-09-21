/**
 * ゆるかわBGMプロンプト生成＆構成タイムライン計算エンジン
 */
import { SITUATIONS, INSTRUMENTS, SFX, KEYS, DENSITY, GENTLE_LEVELS, DURATIONS, NEGATIVE_OPTIONS } from './data.js';

function joinList(arr, lang) {
  if (!arr || arr.length === 0) return '';
  if (arr.length === 1) return arr[0];
  if (lang === 'ja') return arr.join('、');
  return arr.slice(0, -1).join(', ') + ' and ' + arr[arr.length - 1];
}

function pick(items, ids) {
  return ids.map(id => items.find(i => i.id === id)).filter(Boolean);
}

function fmtTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return m + ':' + String(s).padStart(2, '0');
}

/**
 * 構成タイムラインのデータ生成（ゆるふわ仕様）
 */
export function buildTimelineData(state) {
  const durationDef = DURATIONS.find(d => d.id === state.duration) || DURATIONS[2];
  const sit = SITUATIONS.find(s => s.id === state.situation) || SITUATIONS[0];
  const insts = pick(INSTRUMENTS, [...state.insts]);
  const sfx = pick(SFX, [...state.sfx]);
  const lang = state.lang;
  const useSfx = state.density !== 'none' && sfx.length > 0;

  const coreInsts = insts.length ? insts : [{ ja: 'オルゴール', en: 'a music box' }];
  const sfxA = sfx[0] || { ja: 'ぽよ〜ん', en: 'a cute bouncy sound' };
  const sfxB = sfx[1] || sfx[0] || { ja: 'チリン', en: 'a sweet bell chime' };

  if (durationDef.sec === null) {
    return {
      isSeamless: true,
      sections: [],
      message: lang === 'ja'
        ? '穏やかなシームレスループ前提です。プロンプトを音楽AIに入力してリピート再生をお楽しみください。'
        : 'Designed for gentle, seamless looping with no harsh shifts. Pass prompt directly to music AI.'
    };
  }

  let sections = [];
  if (durationDef.stinger) {
    // 15秒（TikTok・リール用）
    sections = lang === 'ja' ? [
      { label: 'はじめ (ふわり導入)', ratio: 0.30, desc: `${coreInsts[0].ja}の優しい音色でふんわりと始まります。` },
      { label: 'まんなか (かわいいサビ)', ratio: 0.40, desc: useSfx ? `一番かわいい主旋律に、${sfxA.ja}が優しくアクセント。` : '心なごむあたたかいメロディが優しく広がります。' },
      { label: 'おわり (まどろみ着地)', ratio: 0.30, desc: useSfx ? `${sfxB.ja}とともに、余韻を残してぽわんと終わります。` : 'そっと静かに着地してやわらかく閉じます。' }
    ] : [
      { label: 'Beginning (Soft Entry)', ratio: 0.30, desc: `Gentle opening with ${coreInsts[0].en}.` },
      { label: 'Center (Cute Motif)', ratio: 0.40, desc: useSfx ? `Sweetest melody line accented with ${sfxA.en}.` : 'Warm and soothing main motif unfolds.' },
      { label: 'Ending (Soft Cadence)', ratio: 0.30, desc: useSfx ? `Peaceful fade with ${sfxB.en}.` : 'Quiet, cozy resolution without sudden stops.' }
    ];
  } else {
    // ループ曲（30秒〜90秒）
    sections = lang === 'ja' ? [
      { label: '導入 (木漏れ日)', ratio: 0.18, desc: `${coreInsts.map(i => i.ja).join('・')}が優しく語りかける静かな導入。` },
      { label: 'テーマ (すやすやループ)', ratio: 0.46, desc: useSfx ? `心拍数に寄り添うテンポ。時々${sfxA.ja}がコロンと転がる。` : 'お昼寝しているような、ほっとする温かいメロディ。' },
      { label: '変化 (そよ風のゆらぎ)', ratio: 0.20, desc: useSfx ? `音圧はそのままに、${sfxB.ja}を添えて心地よい揺らぎをプラス。` : '盛り上げすぎず、そよ風のように心地よい音色の抜き差し。' },
      { label: 'ループ地点 (まどろみ)', ratio: 0.16, desc: '先頭へすんなり戻れる、なめらかで安心できるつなぎ目。' }
    ] : [
      { label: 'Intro (Sunlight)', ratio: 0.18, desc: `Quiet, warm entry led by ${coreInsts.map(i => i.en).join(', ')}.` },
      { label: 'Main Loop (Cozy Theme)', ratio: 0.46, desc: useSfx ? `Relaxed pace, sweetly sprinkled with ${sfxA.en}.` : 'Wholesome, soothing main melody.' },
      { label: 'Gentle Fluctuation', ratio: 0.20, desc: useSfx ? `Soft texture change accented by ${sfxB.en} without raising energy.` : 'Delicate instrumental shift like a soft breeze.' },
      { label: 'Loop Point (Rest)', ratio: 0.16, desc: 'Pillowy turnaround designed to cycle back seamlessly.' }
    ];
  }

  let currentTime = 0;
  const computedSections = sections.map(sec => {
    const startSec = currentTime;
    const duration = durationDef.sec * sec.ratio;
    currentTime += duration;
    return {
      ...sec,
      timeFormatted: fmtTime(startSec),
      durationSec: Math.round(duration)
    };
  });

  return {
    isSeamless: false,
    sections: computedSections,
    totalSeconds: durationDef.sec
  };
}

/**
 * ゆるかわプロンプト本文の組み立て
 */
export function buildPrompt(state) {
  const sit = SITUATIONS.find(s => s.id === state.situation) || SITUATIONS[0];
  const insts = pick(INSTRUMENTS, [...state.insts]);
  const sfx = pick(SFX, [...state.sfx]);
  const key = KEYS[state.key] || KEYS.sunny_maj7;
  const density = DENSITY[state.density] || DENSITY.occasional;
  const gentle = GENTLE_LEVELS[state.gentleLevel] || GENTLE_LEVELS.gentle;
  const aiTarget = state.aiTarget || 'flow';
  const title = (state.trackTitle || '').trim();

  let prompt = '';

  if (state.lang === 'ja') {
    const instText = insts.length ? joinList(insts.map(i => i.ja), 'ja') : 'オルゴールと優しいトイピアノ';
    const sfxText = sfx.length && state.density !== 'none'
      ? `、${density.ja}${joinList(sfx.map(s => s.ja), 'ja')}のような効果音を忍ばせる`
      : '';
    const titlePrefix = title ? `曲名「${title}」のあたたかい世界観。` : '';

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      prompt = `${titleTag}[Genre: Cute Lofi Toy-Pop, Wholesome Instrumental, Music Box] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}]\n` +
        `${titlePrefix}Z世代女子が「かわいい！」と癒やされるゆるいBGM。シチュエーションは「${sit.ja}」。` +
        `音色は${instText}を中心に、${key.ja}を使用${sfxText}。${gentle.ja} 激しいドラムや強い音圧は一切不要。`;
    } else {
      prompt = `${titlePrefix}テンポ${state.tempo}BPMのとてもかわいい癒やしBGM。「${sit.ja}」の雰囲気。` +
        `編成は${instText}を基調とし、${key.ja}のあたたかい響き${sfxText}。` +
        `${gentle.ja} ドラムや重低音は控えめに、終始ふわふわと穏やかに。`;
    }

    // タイムライン埋め込み
    if (state.embedTimeline && state.duration !== 'loop') {
      const tl = buildTimelineData(state);
      if (!tl.isSeamless && tl.sections.length > 0) {
        prompt += '\n\n【構成タイムライン指示】\n' +
          tl.sections.map(s => `[${s.timeFormatted}] ${s.label}: ${s.desc}`).join('\n');
      }
    }
  } else {
    // 英語プロンプト
    const instText = insts.length ? joinList(insts.map(i => i.en), 'en') : 'soft music box and innocent toy piano';
    const sfxText = sfx.length && state.density !== 'none'
      ? ` ${density.en.charAt(0).toUpperCase() + density.en.slice(1)}, gently sprinkle in ${joinList(sfx.map(s => s.en), 'en')}.`
      : '';
    const titleThemed = title ? ` themed after "${title}",` : '';

    if (aiTarget === 'suno_udio') {
      const titleTag = title ? `[Title: ${title}] ` : '';
      prompt = `${titleTag}[Genre: Cute Lofi Bedroom Pop, Soft Music Box, Cozy Instrumental] [Tempo: ${state.tempo} BPM] [Key: ${key.baseNote}]\n` +
        `An ultra-cute, wholesome and soothing background track${titleThemed} capturing ${sit.en}. Built around ${instText}, bathed in ${key.en}.${sfxText} ${gentle.en} Absolutely no heavy beats or loud drops.`;
    } else {
      prompt = `A gentle ${state.tempo} BPM pastel cozy instrumental track${titleThemed} evoking ${sit.en}. ` +
        `Centered around ${instText}, featuring ${key.en}.${sfxText} ` +
        `${gentle.en} Completely peaceful, soft, and relaxing with no sudden crescendos.`;
    }

    if (state.embedTimeline && state.duration !== 'loop') {
      const tl = buildTimelineData(state);
      if (!tl.isSeamless && tl.sections.length > 0) {
        prompt += '\n\nStructure Timeline:\n' +
          tl.sections.map(s => `[${s.timeFormatted}] ${s.label}: ${s.desc}`).join('\n');
      }
    }
  }

  return prompt.trim();
}

/**
 * 激しい要素を完全排除するためのネガティブプロンプト
 */
export function buildNegativePrompt(state) {
  const selected = pick(NEGATIVE_OPTIONS, [...state.negatives]);
  if (selected.length === 0) return '';

  if (state.lang === 'ja') {
    return '【除外指示】' + selected.map(n => n.ja).join('、') + 'は一切含めず、静かで優しい音にすること。';
  }
  return selected.map(n => n.en).join(', ');
}

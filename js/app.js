/**
 * ゆるかわBGMコンポーザー - アプリケーションメイン制御
 */

import {
  SITUATIONS,
  INSTRUMENTS,
  SFX,
  KEYS,
  DENSITY,
  GENTLE_LEVELS,
  DURATIONS,
  NEGATIVE_OPTIONS,
  TITLE_SUGGESTIONS
} from './data.js';

import { buildPrompt, buildNegativePrompt, buildTimelineData } from './prompt_generator.js';
import { yurukawaAudio } from './audio_preview.js';
import {
  saveLastState,
  loadLastState,
  getPresets,
  savePreset,
  deletePreset,
  exportPresetsAsJSON,
  importPresetsFromJSON,
  getShareURL,
  loadFromURLHash
} from './storage.js';

const state = {
  trackTitle: 'ねこのおひるねワルツ',
  situation: 'nap',
  insts: new Set(['music_box', 'toy_piano', 'marimba', 'bubble_synth']),
  sfx: new Set(['poyon', 'cat_meow', 'tiny_bell']),
  density: 'occasional',
  gentleLevel: 'gentle',
  negatives: new Set(['drums_heavy', 'loud_screaming', 'fast_tense']),
  key: 'sunny_maj7',
  tempo: 80,
  duration: '60',
  lang: 'ja',
  aiTarget: 'flow',
  embedTimeline: false
};

function flash(msg) {
  const f = document.getElementById('flash');
  if (!f) return;
  f.textContent = msg;
  f.classList.add('show');
  setTimeout(() => f.classList.remove('show'), 1600);
}

// 複数選択チップ群の生成
function buildMultiChips(container, items, stateSet, onChange) {
  container.innerHTML = '';
  items.forEach(item => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (stateSet.has(item.id) ? ' on' : '');
    b.textContent = item.ja;
    b.addEventListener('click', () => {
      if (stateSet.has(item.id)) {
        stateSet.delete(item.id);
      } else {
        stateSet.add(item.id);
      }
      b.classList.toggle('on');
      onChange();
    });
    container.appendChild(b);
  });
}

// 単一選択（ラジオ風）チップ群の生成
function buildSingleChips(container, items, currentId, onSelect) {
  container.innerHTML = '';
  items.forEach(item => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (item.id === currentId ? ' on' : '');
    b.textContent = item.ja || item.label;
    b.addEventListener('click', () => {
      [...container.children].forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      onSelect(item.id);
    });
    container.appendChild(b);
  });
}

function renderTimeline() {
  const container = document.getElementById('timeline');
  if (!container) return;

  const tl = buildTimelineData(state);
  container.innerHTML = '';

  if (tl.isSeamless) {
    const note = document.createElement('div');
    note.className = 'empty-note';
    note.textContent = tl.message;
    container.appendChild(note);
    return;
  }

  tl.sections.forEach(sec => {
    const row = document.createElement('div');
    row.className = 'screen-row';
    row.innerHTML = `
      <div class="screen-time">${sec.timeFormatted}</div>
      <div class="screen-body">
        <span class="lab">${sec.label}</span>
        <span class="desc">${sec.desc}</span>
      </div>
    `;
    container.appendChild(row);
  });
}

function generate() {
  const promptOut = document.getElementById('promptOut');
  const negativeOut = document.getElementById('negativeOut');
  const negativeSection = document.getElementById('negativeSection');

  promptOut.value = buildPrompt(state);
  const negText = buildNegativePrompt(state);

  if (negativeOut) {
    negativeOut.value = negText;
    if (negativeSection) {
      negativeSection.style.display = negText ? 'block' : 'none';
    }
  }

  renderTimeline();
}

function maybeRegenerate() {
  saveLastState(state);
  generate();
}

function updatePresetPlaceholder() {
  const pInput = document.getElementById('presetNameInput');
  if (pInput) {
    pInput.placeholder = state.trackTitle
      ? `プリセット名 (空欄なら「${state.trackTitle}」)`
      : 'プリセット名 (例: おひるねカフェ)';
  }
}

function renderPresets() {
  const container = document.getElementById('presetChips');
  if (!container) return;
  container.innerHTML = '';

  const presets = getPresets();
  const names = Object.keys(presets);

  if (names.length === 0) {
    const note = document.createElement('span');
    note.className = 'preset-empty';
    note.textContent = '保存されたプリセットはありません';
    container.appendChild(note);
    return;
  }

  names.forEach(name => {
    const item = document.createElement('span');
    item.className = 'preset-item';

    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.textContent = name;
    b.addEventListener('click', () => {
      applyState(presets[name]);
      generate();
      saveLastState(state);
      flash(`「${name}」を読み込みました`);
    });

    const del = document.createElement('button');
    del.type = 'button';
    del.className = 'preset-del';
    del.textContent = '×';
    del.title = '削除';
    del.addEventListener('click', (e) => {
      e.stopPropagation();
      deletePreset(name);
      renderPresets();
      flash(`「${name}」を削除しました`);
    });

    item.appendChild(b);
    item.appendChild(del);
    container.appendChild(item);
  });
}

function applyState(obj) {
  if (!obj) return;
  state.trackTitle = obj.trackTitle || '';
  state.situation = obj.situation || 'nap';
  state.insts = new Set(obj.insts || []);
  state.sfx = new Set(obj.sfx || []);
  state.density = obj.density || 'occasional';
  state.gentleLevel = obj.gentleLevel || 'gentle';
  state.negatives = new Set(obj.negatives || []);
  state.key = obj.key || 'sunny_maj7';
  state.tempo = Number(obj.tempo) || 80;
  state.duration = obj.duration || '60';
  state.lang = obj.lang || 'ja';
  state.aiTarget = obj.aiTarget || 'flow';
  state.embedTimeline = Boolean(obj.embedTimeline);

  const titleInput = document.getElementById('trackTitleInput');
  if (titleInput) titleInput.value = state.trackTitle;
  updatePresetPlaceholder();

  buildSingleChips(document.getElementById('situationChips'), SITUATIONS, state.situation, (id) => {
    state.situation = id;
    maybeRegenerate();
  });

  buildMultiChips(document.getElementById('instChips'), INSTRUMENTS, state.insts, maybeRegenerate);
  buildMultiChips(document.getElementById('sfxChips'), SFX, state.sfx, maybeRegenerate);
  buildMultiChips(document.getElementById('negativeChips'), NEGATIVE_OPTIONS, state.negatives, maybeRegenerate);

  // 尺チップ
  const durContainer = document.getElementById('durationChips');
  durContainer.innerHTML = '';
  DURATIONS.forEach(d => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip' + (state.duration === d.id ? ' on' : '');
    b.textContent = d.label;
    b.addEventListener('click', () => {
      state.duration = d.id;
      [...durContainer.children].forEach(c => c.classList.remove('on'));
      b.classList.add('on');
      maybeRegenerate();
    });
    durContainer.appendChild(b);
  });

  document.getElementById('sfxDensity').value = state.density;
  document.getElementById('gentleSelect').value = state.gentleLevel;
  document.getElementById('keySelect').value = state.key;
  document.getElementById('aiTargetSelect').value = state.aiTarget;
  document.getElementById('embedTimelineCheck').checked = state.embedTimeline;

  const tempoRange = document.getElementById('tempoRange');
  const tempoReadout = document.getElementById('tempoReadout');
  tempoRange.value = state.tempo;
  tempoReadout.innerHTML = state.tempo + '<span> BPM</span>';

  document.querySelectorAll('#langToggle button').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === state.lang);
  });
}

function init() {
  const urlState = loadFromURLHash();
  const lastState = loadLastState();
  applyState(urlState || lastState || state);

  // 曲名入力
  const titleInput = document.getElementById('trackTitleInput');
  titleInput.addEventListener('input', (e) => {
    state.trackTitle = e.target.value;
    updatePresetPlaceholder();
    maybeRegenerate();
  });

  // 🎲 ゆるかわ曲名ガチャ
  document.getElementById('randomTitleBtn').addEventListener('click', () => {
    const rand = TITLE_SUGGESTIONS[Math.floor(Math.random() * TITLE_SUGGESTIONS.length)];
    state.trackTitle = rand;
    titleInput.value = rand;
    updatePresetPlaceholder();
    maybeRegenerate();
    flash(`「${rand}」をセットしました✨`);
  });

  // テンポ
  const tempoRange = document.getElementById('tempoRange');
  const tempoReadout = document.getElementById('tempoReadout');
  tempoRange.addEventListener('input', () => {
    state.tempo = tempoRange.value;
    tempoReadout.innerHTML = state.tempo + '<span> BPM</span>';
    maybeRegenerate();
  });

  document.getElementById('sfxDensity').addEventListener('change', (e) => {
    state.density = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('gentleSelect').addEventListener('change', (e) => {
    state.gentleLevel = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('keySelect').addEventListener('change', (e) => {
    state.key = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('aiTargetSelect').addEventListener('change', (e) => {
    state.aiTarget = e.target.value;
    maybeRegenerate();
  });

  document.getElementById('embedTimelineCheck').addEventListener('change', (e) => {
    state.embedTimeline = e.target.checked;
    maybeRegenerate();
  });

  // 言語切替
  document.querySelectorAll('#langToggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#langToggle button').forEach(b => b.classList.remove('on'));
      btn.classList.add('on');
      state.lang = btn.dataset.lang;
      saveLastState(state);
      generate();
    });
  });

  // 生成ボタン
  document.getElementById('genBtn').addEventListener('click', generate);

  // 🎲 おまかせ生成
  document.getElementById('randomBtn').addEventListener('click', () => {
    function sample(arr, min, max) {
      const n = Math.floor(Math.random() * (max - min + 1)) + min;
      const sh = [...arr].sort(() => Math.random() - 0.5);
      return sh.slice(0, n).map(i => i.id);
    }
    state.trackTitle = TITLE_SUGGESTIONS[Math.floor(Math.random() * TITLE_SUGGESTIONS.length)];
    titleInput.value = state.trackTitle;
    updatePresetPlaceholder();

    state.situation = SITUATIONS[Math.floor(Math.random() * SITUATIONS.length)].id;
    state.insts = new Set(sample(INSTRUMENTS, 2, 4));
    state.sfx = new Set(sample(SFX, 1, 3));
    state.tempo = 65 + Math.floor(Math.random() * 35); // 65〜100 BPM（まったり）
    const keyKeys = Object.keys(KEYS);
    state.key = keyKeys[Math.floor(Math.random() * keyKeys.length)];

    applyState(state);
    generate();
    saveLastState(state);
    flash(`🎲 おまかせ設定「${state.trackTitle}」を作りました✨`);
  });

  // リセット
  document.getElementById('resetBtn').addEventListener('click', () => {
    state.trackTitle = 'ねこのおひるねワルツ';
    state.situation = 'nap';
    state.insts = new Set(['music_box', 'toy_piano', 'marimba', 'bubble_synth']);
    state.sfx = new Set(['poyon', 'cat_meow', 'tiny_bell']);
    state.density = 'occasional';
    state.gentleLevel = 'gentle';
    state.negatives = new Set(['drums_heavy', 'loud_screaming', 'fast_tense']);
    state.key = 'sunny_maj7';
    state.tempo = 80;
    state.duration = '60';
    state.embedTimeline = false;

    applyState(state);
    generate();
    saveLastState(state);
    flash('初期設定にもどしました');
  });

  // プリセット保存
  document.getElementById('savePresetBtn').addEventListener('click', () => {
    const input = document.getElementById('presetNameInput');
    let name = input.value.trim();
    if (!name && state.trackTitle) {
      name = state.trackTitle.trim();
    }
    if (!name) {
      flash('プリセット名を入力してください');
      return;
    }
    if (savePreset(name, state)) {
      input.value = '';
      renderPresets();
      flash(`「${name}」を保存しました🌸`);
    }
  });

  // プリセット書き出し
  document.getElementById('exportPresetBtn').addEventListener('click', () => {
    exportPresetsAsJSON();
    flash('プリセットを書き出しました');
  });

  // プリセット読み込み
  const fileInput = document.getElementById('importPresetFile');
  document.getElementById('importPresetBtn').addEventListener('click', () => {
    fileInput.click();
  });
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importPresetsFromJSON(file, (success, count, errMsg) => {
        if (success) {
          renderPresets();
          flash(`${count}件のプリセットを取り込みました`);
        } else {
          flash(errMsg || '読み込みに失敗しました');
        }
        fileInput.value = '';
      });
    }
  });

  // 共有URLコピー
  document.getElementById('shareUrlBtn').addEventListener('click', async () => {
    const url = getShareURL(state);
    try {
      await navigator.clipboard.writeText(url);
      flash('共有用URLをコピーしました！💌');
    } catch (e) {
      prompt('以下のURLをコピーしてください:', url);
    }
  });

  // プロンプトコピー
  document.getElementById('copyBtn').addEventListener('click', async () => {
    const out = document.getElementById('promptOut');
    if (!out.value) return;
    try {
      await navigator.clipboard.writeText(out.value);
      flash('プロンプトをコピーしました！🌸');
    } catch (e) {
      out.select();
      document.execCommand('copy');
      flash('コピーしました！');
    }
  });

  // 除外指示コピー
  document.getElementById('copyNegBtn')?.addEventListener('click', async () => {
    const out = document.getElementById('negativeOut');
    if (!out.value) return;
    try {
      await navigator.clipboard.writeText(out.value);
      flash('除外指示をコピーしました！');
    } catch (e) {
      out.select();
      document.execCommand('copy');
      flash('コピーしました！');
    }
  });

  // オルゴール音源試聴
  const previewToggleBtn = document.getElementById('previewToggleBtn');
  const previewVolume = document.getElementById('previewVolume');
  const stepLeds = document.querySelectorAll('.step-led');

  previewVolume.addEventListener('input', (e) => {
    yurukawaAudio.setVolume(parseFloat(e.target.value));
  });

  previewToggleBtn.addEventListener('click', () => {
    yurukawaAudio.toggle(
      () => state,
      (activeStep) => {
        stepLeds.forEach((led, idx) => {
          led.classList.toggle('active', idx === activeStep);
        });
      },
      (isPlaying) => {
        if (isPlaying) {
          previewToggleBtn.textContent = '■ やすむ (停止)';
          previewToggleBtn.classList.add('playing');
        } else {
          previewToggleBtn.textContent = '▶ オルゴールで試聴 (ほっこり音源)';
          previewToggleBtn.classList.remove('playing');
          stepLeds.forEach(led => led.classList.remove('active'));
        }
      }
    );
  });

  renderPresets();
  generate();
  saveLastState(state);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

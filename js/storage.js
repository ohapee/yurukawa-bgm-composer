/**
 * ゆるかわBGMコンポーザー - ストレージ管理
 */

const LAST_STATE_KEY = 'yurukawa-bgm-laststate-v1';
const PRESETS_KEY = 'yurukawa-bgm-presets-v1';

export function serializeState(state) {
  return {
    trackTitle: state.trackTitle || '',
    situation: state.situation || 'nap',
    insts: [...state.insts],
    sfx: [...state.sfx],
    density: state.density || 'occasional',
    gentleLevel: state.gentleLevel || 'gentle',
    negatives: [...state.negatives],
    key: state.key || 'sunny_maj7',
    tempo: Number(state.tempo) || 80,
    duration: state.duration || '60',
    lang: state.lang || 'ja',
    aiTarget: state.aiTarget || 'flow',
    embedTimeline: Boolean(state.embedTimeline)
  };
}

export function saveLastState(state) {
  try {
    localStorage.setItem(LAST_STATE_KEY, JSON.stringify(serializeState(state)));
  } catch (e) {
    console.warn('保存に失敗しました:', e);
  }
}

export function loadLastState() {
  try {
    const raw = localStorage.getItem(LAST_STATE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
}

export function getPresets() {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

export function savePreset(name, state) {
  if (!name || !name.trim()) return false;
  const presets = getPresets();
  presets[name.trim()] = serializeState(state);
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  } catch (e) {
    return false;
  }
}

export function deletePreset(name) {
  const presets = getPresets();
  if (presets[name]) {
    delete presets[name];
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
    return true;
  }
  return false;
}

export function exportPresetsAsJSON() {
  const presets = getPresets();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(presets, null, 2));
  const a = document.createElement('a');
  const now = new Date();
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  a.setAttribute('href', dataStr);
  a.setAttribute('download', `yurukawa_presets_${dateStr}.json`);
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function importPresetsFromJSON(file, callback) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (typeof imported === 'object' && imported !== null) {
        const current = getPresets();
        const merged = { ...current, ...imported };
        localStorage.setItem(PRESETS_KEY, JSON.stringify(merged));
        callback(true, Object.keys(imported).length);
      } else {
        callback(false, 0, '無効なJSONフォーマットです');
      }
    } catch (err) {
      callback(false, 0, 'JSONの解析に失敗しました');
    }
  };
  reader.onerror = () => callback(false, 0, 'ファイルの読み込みに失敗しました');
  reader.readAsText(file);
}

export function getShareURL(state) {
  const serialized = serializeState(state);
  const jsonStr = JSON.stringify(serialized);
  const base64 = btoa(encodeURIComponent(jsonStr));
  const url = new URL(window.location.href);
  url.hash = `cfg=${base64}`;
  return url.toString();
}

export function loadFromURLHash() {
  try {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#cfg=')) {
      const base64 = hash.replace('#cfg=', '');
      const jsonStr = decodeURIComponent(atob(base64));
      return JSON.parse(jsonStr);
    }
  } catch (e) {
    console.warn('URLパラメータからの復元に失敗しました:', e);
  }
  return null;
}

/**
 * ゆるかわ癒やし音源プレビューエンジン (Web Audio API)
 * オルゴール・トイピアノ・木琴の優しい調べをリアルタイム合成
 */

class YurukawaAudioEngine {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.timerId = null;
    this.currentStep = 0;
    this.masterGain = null;
    this.volume = 0.25;
  }

  initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  // スケールごとのピッチ周波数テーブル (Hz)
  getScaleData(keyId) {
    switch (keyId) {
      case 'sweet_add9':
        // F add9 (F4, G4, A4, C5, F5, G5, A5, C6) - お砂糖のような甘酸っぱさ
        return [349.23, 392.00, 440.00, 523.25, 698.46, 783.99, 880.00, 1046.50];
      case 'penta_lullaby':
        // Gペンタトニック (G4, A4, B4, D5, E5, G5, A5, B5) - 素朴な子守唄
        return [392.00, 440.00, 493.88, 587.33, 659.25, 783.99, 880.00, 987.77];
      case 'waltz_34':
        // Cメジャーワルツ (C4, E4, G4, A4, B4, C5, E5, G5) - ゆらゆらゆりかご
        return [261.63, 329.63, 392.00, 440.00, 493.88, 523.25, 659.25, 783.99];
      case 'sunny_maj7':
      default:
        // C maj7 (C4, E4, G4, B4, D5, E5, G5, B5) - ぽかぽか陽だまり
        return [261.63, 329.63, 392.00, 493.88, 587.33, 659.25, 783.99, 987.77];
    }
  }

  // オルゴール / トイピアノの優しい鈴音 (サイン波 + 微細な倍音 + 長い減衰)
  playMusicBoxTone(freq, time, duration = 1.2, gainLevel = 0.22) {
    if (!this.ctx) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, time);

    // 2倍音（かすかなオルゴールの金属性）
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, time);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(gainLevel, time + 0.008); // やわらかいアタック
    gain.gain.exponentialRampToValueAtTime(0.0005, time + duration);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + duration);
    osc2.stop(time + duration);
  }

  // 木琴 / マリンバ (丸くポコッと弾む低めの音)
  playMarimbaTone(freq, time, duration = 0.35) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq / 2, time); // 1オクターブ下の丸み

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.3, time + 0.006);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // ぷくぷく水滴音 / シャボン玉
  playBubbleDrop(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(600, time);
    osc.frequency.exponentialRampToValueAtTime(1400, time + 0.09); // 下から上にポコッと跳ねる

    gain.gain.setValueAtTime(0.18, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // ウッドブロック / やさしい木のノック音
  playWoodClick(time) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.04);

    gain.gain.setValueAtTime(0.2, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  // ループ演奏開始
  start(getStateFn, onStepCallback) {
    this.initContext();
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;

    const scheduleNext = () => {
      if (!this.isPlaying) return;

      const state = getStateFn();
      const bpm = Math.max(50, Math.min(110, Number(state.tempo) || 80));
      // 8分音符のステップ秒数（お昼寝ペースでゆったり）
      const stepDuration = (60 / bpm) / 2;
      const now = this.ctx.currentTime;
      const step = this.currentStep;

      const scaleData = this.getScaleData(state.key);

      // 8ステップ（4拍分）のやさしいフレーズ
      // 1. ウッドブロック（偶数拍でコッと優しく刻む、激しいドラムは鳴らさない）
      if (step % 2 === 0) {
        this.playWoodClick(now);
      }

      // 2. 木琴ベース（1拍目と3拍目でポコッと支える）
      if (step === 0 || step === 4) {
        this.playMarimbaTone(scaleData[0], now, stepDuration * 1.5);
      } else if (step === 2 || step === 6) {
        this.playMarimbaTone(scaleData[2], now, stepDuration * 1.5);
      }

      // 3. オルゴールメロディ（ポロポロと優しいアルペジオ）
      const melodyIdxPattern = [0, 2, 4, 3, 2, 4, 6, 7];
      const noteIdx = melodyIdxPattern[step % 8];
      const freq = scaleData[noteIdx % scaleData.length];
      this.playMusicBoxTone(freq, now, 1.4, 0.22);

      // 4. 時々ぽこっと鳴るシャボン玉泡
      if (step === 3 || step === 7) {
        this.playBubbleDrop(now + stepDuration * 0.4);
      }

      if (onStepCallback) {
        onStepCallback(step % 8);
      }

      this.currentStep = (this.currentStep + 1) % 8;
      this.timerId = setTimeout(scheduleNext, stepDuration * 1000);
    };

    scheduleNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  toggle(getStateFn, onStepCallback, onStateChange) {
    if (this.isPlaying) {
      this.stop();
      if (onStateChange) onStateChange(false);
    } else {
      this.start(getStateFn, onStepCallback);
      if (onStateChange) onStateChange(true);
    }
  }
}

export const yurukawaAudio = new YurukawaAudioEngine();

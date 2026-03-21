// Web Audio API sound engine. No external dependencies, zero imports.
// AudioContext is created lazily on first sound call (browser requires user gesture).

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
    if (!ctx || ctx.state === 'closed') {
        ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
}

function playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    gainPeak = 0.18,
    startTime?: number,
) {
    const c = getCtx();
    const t = startTime ?? c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(gainPeak, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.start(t);
    osc.stop(t + duration + 0.01);
}

export function playCorrect() {
    const c = getCtx();
    const t = c.currentTime;
    playTone(880, 0.12, 'sine', 0.15, t);
    playTone(1320, 0.18, 'sine', 0.10, t + 0.05);
}

export function playWrong() {
    const c = getCtx();
    const t = c.currentTime;
    playTone(120, 0.25, 'sawtooth', 0.12, t);
    playTone(90, 0.30, 'triangle', 0.08, t + 0.05);
}

// ~0.85s total, peak gain 0.065. Called with ~350ms delay from GameArea.
export function playGameOver() {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.72);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.065, t + 0.03);
    gain.gain.setValueAtTime(0.065, t + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
    osc.start(t);
    osc.stop(t + 0.86);
}

export function playClick() {
    const c = getCtx();
    const t = c.currentTime;
    playTone(600, 0.04, 'sine', 0.07, t);
}

export function playDifficultyChange() {
    const c = getCtx();
    const t = c.currentTime;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.linearRampToValueAtTime(660, t + 0.18);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.10, t + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.start(t);
    osc.stop(t + 0.25);
}

export function playBeginDecryption() {
    const c = getCtx();
    const t = c.currentTime;
    playTone(440, 0.06, 'sine', 0.12, t);
    playTone(660, 0.10, 'sine', 0.10, t + 0.08);
    playTone(880, 0.14, 'sine', 0.08, t + 0.16);
}

export function playAccessibilityTick() {
    const c = getCtx();
    const t = c.currentTime;
    playTone(1200, 0.03, 'sine', 0.05, t);
}

// Short digital glitch burst for title letter clicks.
export function playGlitchBurst() {
    const c = getCtx();
    const t = c.currentTime;
    const bufSize = Math.floor(c.sampleRate * 0.055);
    const buf = c.createBuffer(1, bufSize, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufSize, 1.6);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.9;
    const gain = c.createGain();
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(c.destination);
    src.start(t);
    src.stop(t + 0.06);
}

// Tighter tick. startTimerTick called when timeRemaining <= 15000ms.
let tickInterval: ReturnType<typeof setInterval> | null = null;

export function startTimerTick() {
    if (tickInterval) return;
    const fire = () => {
        try { playTone(520, 0.035, 'sine', 0.08); } catch { /* ignore */ }
    };
    fire();
    tickInterval = setInterval(fire, 1000);
}

export function stopTimerTick() {
    if (tickInterval) {
        clearInterval(tickInterval);
        tickInterval = null;
    }
}

// All sounds are synthesized with the Web Audio API, so the game needs no
// audio files. Call audio.unlock() from a user gesture (the start button).

let ctx = null
let master = null
let musicBus = null
let noiseBuf = null
let muted = false
let musicTimer = null
let nextNote = 0
let step = 0

const MASTER_VOL = 0.9
const MUSIC_VOL = 0.45

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return null
    ctx = new AC()
    master = ctx.createGain()
    master.gain.value = muted ? 0 : MASTER_VOL
    master.connect(ctx.destination)
    musicBus = ctx.createGain()
    musicBus.gain.value = 0
    musicBus.connect(master)
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate)
    const d = noiseBuf.getChannelData(0)
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1
  }
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

function tone({ freq, t = 0, at, dur = 0.3, type = 'sine', vol = 0.2, attack = 0.01, to, dest }) {
  const c = ensure()
  if (!c) return
  const t0 = at ?? c.currentTime + t
  const o = c.createOscillator()
  const g = c.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t0)
  if (to) o.frequency.exponentialRampToValueAtTime(to, t0 + dur)
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  o.connect(g)
  g.connect(dest || master)
  o.start(t0)
  o.stop(t0 + dur + 0.05)
}

function noise({ t = 0, dur = 0.3, vol = 0.3, type = 'lowpass', f0 = 1200, f1, q = 1, attack = 0.004 }) {
  const c = ensure()
  if (!c) return
  const t0 = c.currentTime + t
  const src = c.createBufferSource()
  src.buffer = noiseBuf
  const filter = c.createBiquadFilter()
  filter.type = type
  filter.Q.value = q
  filter.frequency.setValueAtTime(f0, t0)
  if (f1) filter.frequency.exponentialRampToValueAtTime(f1, t0 + dur)
  const g = c.createGain()
  g.gain.setValueAtTime(0.0001, t0)
  g.gain.exponentialRampToValueAtTime(vol, t0 + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur)
  src.connect(filter)
  filter.connect(g)
  g.connect(master)
  src.start(t0, Math.random() * 0.5)
  src.stop(t0 + dur + 0.05)
}

/* ---------- Background music: a soft, cheerful music box ---------- */

const N = {
  A2: 110, F2: 87.31, G2: 98, C3: 130.81,
  G4: 392, A4: 440, C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99, A5: 880,
}
// 32 eighth-note steps (two bars). null = rest.
const MELODY = [
  N.E5, N.G5, N.A5, N.G5, N.E5, N.D5, N.C5, N.D5,
  N.E5, N.G5, N.E5, N.D5, N.C5, null, N.A4, null,
  N.A4, N.C5, N.D5, N.E5, N.D5, N.C5, N.A4, N.G4,
  N.A4, N.C5, N.D5, N.C5, N.A4, null, N.G4, null,
]
const BASS = { 0: N.C3, 8: N.F2, 16: N.A2, 24: N.G2 }
const STEP_SEC = 0.3

function playStep(i, at) {
  const f = MELODY[i]
  if (f) {
    tone({ freq: f, at, dur: 0.9, type: 'sine', vol: 0.16, attack: 0.008, dest: musicBus })
    tone({ freq: f * 2, at, dur: 0.45, type: 'sine', vol: 0.05, attack: 0.005, dest: musicBus })
  }
  if (BASS[i]) {
    tone({ freq: BASS[i], at, dur: 2.2, type: 'triangle', vol: 0.14, attack: 0.05, dest: musicBus })
  }
}

function schedule() {
  if (!ctx) return
  while (nextNote < ctx.currentTime + 0.35) {
    playStep(step, nextNote)
    nextNote += STEP_SEC
    step = (step + 1) % MELODY.length
  }
}

/* ---------- Public API ---------- */

export const audio = {
  unlock() {
    ensure()
  },

  setMuted(v) {
    muted = v
    if (master && ctx) master.gain.setTargetAtTime(v ? 0 : MASTER_VOL, ctx.currentTime, 0.02)
  },

  click() {
    tone({ freq: 700, to: 1100, dur: 0.09, vol: 0.14 })
  },

  pop() {
    tone({ freq: 520, to: 900, dur: 0.12, vol: 0.18 })
    tone({ freq: 1046, t: 0.07, dur: 0.16, vol: 0.12 })
  },

  boom() {
    noise({ dur: 0.65, vol: 0.55, f0: 1800, f1: 120 })
    tone({ freq: 150, to: 40, dur: 0.55, vol: 0.5 })
  },

  angry() {
    tone({ freq: 190, to: 120, dur: 0.35, type: 'sawtooth', vol: 0.12 })
    tone({ freq: 170, to: 100, t: 0.18, dur: 0.4, type: 'sawtooth', vol: 0.12 })
  },

  applause() {
    if (!ensure()) return
    noise({ dur: 2.9, vol: 0.07, type: 'bandpass', f0: 2500, q: 0.5, attack: 0.5 })
    for (let i = 0; i < 110; i++) {
      noise({
        t: 0.1 + Math.pow(Math.random(), 1.2) * 2.6,
        dur: 0.04 + Math.random() * 0.05,
        vol: 0.05 + Math.random() * 0.09,
        type: 'bandpass',
        f0: 1200 + Math.random() * 3500,
        q: 0.8,
      })
    }
    ;[N.C5, N.E5, N.G5, N.G5 * 1.26].forEach((f, k) =>
      tone({ freq: f, t: k * 0.11, dur: 0.5, type: 'triangle', vol: 0.15 }),
    )
  },

  gameOver() {
    ;[392, 349, 311, 262].forEach((f, k) =>
      tone({ freq: f, t: k * 0.28, dur: 0.45, type: 'triangle', vol: 0.2 }),
    )
    tone({ freq: 196, to: 110, t: 1.15, dur: 1, type: 'triangle', vol: 0.22 })
  },

  startMusic() {
    if (!ensure() || musicTimer) return
    nextNote = ctx.currentTime + 0.6
    step = 0
    musicBus.gain.cancelScheduledValues(ctx.currentTime)
    musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime)
    musicBus.gain.linearRampToValueAtTime(MUSIC_VOL, ctx.currentTime + 1.8)
    musicTimer = setInterval(schedule, 80)
    schedule()
  },

  stopMusic() {
    if (!musicTimer) return
    clearInterval(musicTimer)
    musicTimer = null
    if (ctx) {
      musicBus.gain.cancelScheduledValues(ctx.currentTime)
      musicBus.gain.setValueAtTime(musicBus.gain.value, ctx.currentTime)
      musicBus.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.6)
    }
  },
}

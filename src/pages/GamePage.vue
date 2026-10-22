<script>
import { store } from '../store'
import Dino from '../components/Dino.vue'
import BorderBeam from '../components/BorderBeam.vue'
import Confetti from '../components/Confetti.vue'
import { audio } from '../audio'



const TOTAL = 20 
const BOMBS = 3 
const MAX_HEARTS = 3
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

const DARES = [
  'Say out loud: "I am a tiny cute dinosaur!"',
  'Jump ten times in a row.',
  'Tell a joke, even a bad one.',
  'Roar like a dinosaur.',
  'Drink a glass of water.',
  'Make a heart with your hands and show it to me.',
  'Name five fruits in ten seconds.',
  'Stand on one leg for ten seconds.',
]


const HEART_MAP = [
  '.oo...oo.',
  'owwrorrro',
  'owrrrrrro',
  'orrrrrrro',
  '.orrrrro.',
  '..orrro..',
  '...oro...',
  '....o....',
]
const HEART_PX = HEART_MAP.flatMap((row, y) =>
  [...row].flatMap((t, x) => (t === '.' ? [] : [{ x, y, t }])),
)

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)]
function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default {
  name: 'GamePage',
  components: { Dino, BorderBeam, Confetti },

  /* ---------- state ---------- */
  data() {
    return {
      store,
      TOTAL,
      MAX_HEARTS,
      HEART_PX,

      phase: 'playing', 
      hearts: MAX_HEARTS,
      entries: [], // { letter, bomb }
      bombList: [],
      bubble: { text: '', key: 0 },
      dare: { letter: '', task: '' },
      muted: false,
      shaking: false,
      flashKey: 0,
      shakeInput: false,
    }
  },

  computed: {
    slots() {
      return Array.from({ length: TOTAL }, (_, i) => this.entries[i] || null)
    },
    correct() {
      return this.entries.filter((e) => !e.bomb).length
    },
    pct() {
      return this.phase === 'won' ? 100 : (this.correct / TOTAL) * 100
    },
    sortedBombs() {
      return [...this.bombList].sort()
    },
  },

  created() {
    this.moodTimer = null
    this.shakeTimer = null
  },

  mounted() {
    window.addEventListener('keydown', this.onKeydown)
    this.newGame()
  },

  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown)
    clearTimeout(this.moodTimer)
    clearTimeout(this.shakeTimer)
    audio.stopMusic()
    this.$refs.confetti?.stop()
    this.store.mood = 'normal'
  },

  methods: {
    faNum(n) {
      return n.toLocaleString('fa-IR')
    },

    // The dino only speaks when you repeat a letter.
    showBubble(text) {
      this.bubble.text = text
      this.bubble.key++
    },
    hideBubble() {
      this.bubble.text = ''
    },

    focusInput() {
      this.$refs.inputEl?.focus({ preventScroll: true })
    },

    /* ---------- game flow ---------- */

    newGame() {
      clearTimeout(this.moodTimer)
      this.$refs.confetti?.stop()
      audio.stopMusic()
      this.bombList = shuffle(ALPHABET).slice(0, BOMBS)
      this.entries = []
      this.hearts = MAX_HEARTS
      this.phase = 'playing'
      this.store.mood = 'normal'
      this.hideBubble()
      this.$nextTick(this.focusInput)
    },

    win() {
      this.phase = 'won'
      this.store.mood = 'happy'
      audio.applause()
      audio.startMusic()
      this.$refs.confetti?.start()
    },

    lose() {
      this.phase = 'lost'
      this.store.mood = 'sad'
      audio.gameOver()
    },

    hitBomb() {
      audio.boom()
      this.flashKey++
      this.shaking = true
      clearTimeout(this.shakeTimer)
      this.shakeTimer = setTimeout(() => (this.shaking = false), 520)
    },

    submit(raw) {
      if (this.phase !== 'playing') return
      const letter = raw.toUpperCase()
      clearTimeout(this.moodTimer)
     
      this.store.mood = 'normal'
      this.hideBubble()

      
      if (this.entries.some((e) => e.letter === letter)) {
        this.phase = 'dare'
        this.store.mood = 'angry'
        this.dare.letter = letter
        this.dare.task = pick(DARES)
        this.showBubble('Do you want to lose a heart... or will you obey?')
        audio.angry()
        return
      }

      const bomb = this.bombList.includes(letter)
      this.entries.push({ letter, bomb })

      if (bomb) {
        this.hearts--
        this.hitBomb()
        if (this.hearts <= 0) return this.lose()
        this.store.mood = 'sad'
        this.moodTimer = setTimeout(() => {
          if (this.phase === 'playing') this.store.mood = 'normal'
        }, 1800)
      } else {
        audio.pop()
        this.$refs.dino?.poke()
      }

      if (this.entries.length >= TOTAL) this.win()
    },

    resolveDare() {
      this.phase = 'playing'
      this.store.mood = 'normal'
      this.hideBubble()
      this.$nextTick(this.focusInput)
    },

    doDare() {
      audio.pop()
      this.resolveDare()
    },

    payHeart() {
      this.hearts--
      this.hitBomb()
      if (this.hearts <= 0) return this.lose()
      this.resolveDare()
    },

    /* ---------- input: only A-Z, every key press is one guess ---------- */

    onInput(e) {
      const value = e.target.value
      e.target.value = ''
      if (!value) return
      const letters = value.match(/[a-zA-Z]/g)
      if (!letters) {
        this.shakeInput = true
        setTimeout(() => (this.shakeInput = false), 400)
        return
      }
      this.submit(letters[letters.length - 1])
    },

    // Typing while the input isn't focused still counts.
    onKeydown(e) {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      if (document.activeElement === this.$refs.inputEl) return
      if (/^[a-zA-Z]$/.test(e.key)) this.submit(e.key)
    },

    toggleSound() {
      this.muted = !this.muted
      audio.setMuted(this.muted)
    },

    goHome() {
      this.store.page = 'start'
    },
  },
}
</script>

<template>
  <main
    class="relative z-10 flex h-full flex-col px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-[max(0.75rem,env(safe-area-inset-bottom))]"
    :class="{ 'screen-shake': shaking }"
  >
    <div class="wordmark" aria-hidden="true">DINOLEX</div>

    <!-- one glass pill: hearts + sound + home -->
    <header class="mx-auto flex w-full justify-center">
      <div class="hud" dir="ltr">
        <div class="flex items-center gap-2 px-2" role="img" :aria-label="`${faNum(hearts)} قلب باقی مانده`">
          <svg
            v-for="i in MAX_HEARTS"
            :key="i"
            viewBox="0 0 9 8"
            shape-rendering="crispEdges"
            class="heart"
            :class="{ 'heart-lost': i > hearts }"
          >
            <rect
              v-for="(p, k) in HEART_PX"
              :key="k"
              :x="p.x"
              :y="p.y"
              width="1"
              height="1"
              :class="'px-' + p.t"
            />
          </svg>
        </div>

        <span class="hud-sep" />

        <button
          type="button"
          class="hud-btn"
          :aria-label="muted ? 'روشن کردن صدا' : 'بی‌صدا کردن'"
          @click="toggleSound"
        >
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 5L6 9H2v6h4l5 4V5z" />
            <template v-if="!muted">
              <path d="M15.5 8.5a5 5 0 010 7" />
              <path d="M19 5a9 9 0 010 14" />
            </template>
            <template v-else>
              <path d="M23 9l-6 6" />
              <path d="M17 9l6 6" />
            </template>
          </svg>
        </button>
        <button type="button" class="hud-btn" aria-label="بازگشت به صفحه اول" @click="goHome">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 11l9-8 9 8v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V11z" />
          </svg>
        </button>
      </div>
    </header>

    <!-- body: dino bottom-left, letters box on the right (stacked on phones) -->
    <div class="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col md:max-w-6xl md:flex-row" dir="ltr">
      <div class="min-h-0 w-full flex-1 md:h-full md:w-1/2 md:flex-none">
        <Dino ref="dino" left :mood="store.mood" :text="bubble.text" :text-key="bubble.key" />
      </div>

      <section
        dir="rtl"
        class="w-full space-y-3 md:flex md:w-1/2 md:flex-col md:justify-center md:space-y-8 md:px-6"
      >
      <div class="space-y-3">
        <p class="hint3d" dir="ltr">
          Enter 20 different letters, A to Z.<br />
          Five are secret bombs, and each one costs you a heart.
        </p>

      <!-- playing: the input -->
      <BorderBeam v-if="phase === 'playing'" :radius="26">
        <label class="panel" :class="{ 'input-shake': shakeInput }">
          <div class="grid grid-cols-10 gap-1.5 md:grid-cols-5 md:gap-2.5" dir="ltr" aria-hidden="true">
            <span
              v-for="(s, i) in slots"
              :key="i"
              class="slot"
              :class="s ? (s.bomb ? 'bomb' : 'safe') : 'empty'"
            >{{ s ? s.letter : '' }}</span>
          </div>
          <input
            ref="inputEl"
            type="text"
            class="field"
            dir="ltr"
            autocomplete="off"
            autocapitalize="characters"
            autocorrect="off"
            spellcheck="false"
            enterkeyhint="done"
            aria-label="حرف بعدی، از A تا Z"
            placeholder="Type a letter"
            @input="onInput"
          />
        </label>
      </BorderBeam>

      <!-- repeated letter: a choice -->
      <div v-else-if="phase === 'dare'" class="card" dir="ltr">
        <p class="text-lg font-extrabold">Repeated letter “{{ dare.letter }}”!</p>
        <p class="font-bold leading-7">Dino commands: {{ dare.task }}</p>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn btn-go" @click="doDare">I obey</button>
          <button type="button" class="btn btn-pay" @click="payHeart">Lose a heart</button>
        </div>
      </div>

      <!-- finished -->
      <div v-else class="card">
        <p class="text-xl font-extrabold">
          {{ phase === 'won' ? 'بردی!' : 'باختی' }}
        </p>
        <div class="flex flex-wrap items-center justify-center gap-2 font-bold">
          <span>بمب‌ها این‌ها بودن:</span>
          <span class="flex gap-1.5" dir="ltr">
            <span v-for="b in sortedBombs" :key="b" class="slot bomb !h-8 !w-8 !text-base">{{ b }}</span>
          </span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button type="button" class="btn btn-go" @click="newGame">دوباره بازی کن</button>
          <button type="button" class="btn btn-ghost" @click="goHome">صفحه اول</button>
        </div>
      </div>

      </div>

      <!-- status bar: red -> green as correct letters pile up -->
      <div
        class="bar"
        role="progressbar"
        aria-label="پیشرفت"
        aria-valuemin="0"
        :aria-valuemax="TOTAL"
        :aria-valuenow="correct"
      >
        <div
          class="bar-fill"
          :style="{ width: pct + '%', backgroundSize: 10000 / Math.max(pct, 1) + '% 100%' }"
        />
      </div>
      </section>
    </div>

    <div v-if="flashKey" :key="flashKey" class="boom-flash" />
    <Confetti ref="confetti" />
  </main>
</template>

<style scoped>
/* giant translucent 3D name behind the dino and the input */
.wordmark {
  position: absolute;
  z-index: -1;
  top: 12%;
  left: 50%;
  translate: -50% 0;
  font-family: "Outfit", "Vazirmatn", system-ui, sans-serif;
  font-size: clamp(4.5rem, 21vw, 22rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.03em;
  white-space: nowrap;
  user-select: none;
  pointer-events: none;
  color: transparent;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.22) 55%, rgba(255, 255, 255, 0.05) 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-stroke: 2px rgba(255, 255, 255, 0.3);
  filter: drop-shadow(0 3px 0 rgba(255, 255, 255, 0.22)) drop-shadow(0 14px 16px rgba(0, 45, 28, 0.3));
}

/* top bar: one translucent glass pill with a single border */
.hud {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.13);
  border: 1px solid rgba(255, 255, 255, 0.35);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  box-shadow: 0 10px 28px rgba(5, 40, 25, 0.22);
  color: #fffdf4;
}
.hud-sep {
  width: 1px;
  height: 26px;
  margin: 0 4px;
  background: rgba(255, 255, 255, 0.3);
}
.hud-btn {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: inherit;
  transition: background 0.15s, transform 0.15s;
}
.hud-btn:hover { background: rgba(255, 255, 255, 0.18); }
.hud-btn:active { transform: scale(0.92); }

/* pixel hearts */
.heart { width: 38px; height: 34px; image-rendering: pixelated; }
.px-o { fill: #2b0f12; }
.px-w { fill: #ffd9d4; }
.px-r { fill: #e5322d; }
.heart-lost .px-w,
.heart-lost .px-r { fill: #4a393c; }
.heart-lost { animation: heart-break 0.5s ease; }
@keyframes heart-break {
  0% { transform: scale(1.4) rotate(-12deg); filter: brightness(1.8); }
  60% { transform: scale(0.75) rotate(8deg); }
  100% { transform: scale(1); filter: none; }
}

/* gray, embossed hint above the input */
.hint3d {
  margin: 0;
  text-align: center;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.55;
  color: #cbd3ce;
  text-shadow: 0 -1px 0 rgba(255, 255, 255, 0.5), 0 1px 0 #9aa6a0, 0 2px 0 #77837d, 0 3px 0 #5d6963,
    0 4px 0 #4a5550, 0 9px 10px rgba(0, 0, 0, 0.35);
}

/* input panel */
.panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 14px;
  border-radius: 26px;
  background: rgba(14, 40, 28, 0.78);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.1), 0 14px 30px rgba(6, 30, 20, 0.35);
  backdrop-filter: blur(10px);
  cursor: text;
}
.input-shake { animation: input-shake 0.4s ease; }
@keyframes input-shake {
  20%, 60% { transform: translateX(-7px); }
  40%, 80% { transform: translateX(7px); }
}

.field {
  width: 100%;
  border: 0;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px 14px;
  text-align: center;
  font-family: inherit;
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: #fffbe8;
  caret-color: #ffd45e;
}
.field::placeholder {
  font-size: 1rem;
  letter-spacing: 0;
  text-transform: none;
  font-weight: 700;
  color: rgba(255, 251, 232, 0.5);
}
.field:focus { outline: 2px solid rgba(255, 212, 94, 0.7); outline-offset: 0; }

.slot {
  display: grid;
  place-items: center;
  aspect-ratio: 1;
  border-radius: 9px;
  font-weight: 800;
  font-size: 0.95rem;
  line-height: 1;
}
.slot.empty { background: rgba(255, 255, 255, 0.07); border: 1.5px dashed rgba(255, 255, 255, 0.22); }
.slot.safe { background: #7be28a; color: #0f3a1d; animation: slot-pop 0.35s cubic-bezier(0.3, 1.6, 0.5, 1); }
.slot.bomb { background: #ff6a5c; color: #fff; animation: slot-pop 0.35s cubic-bezier(0.3, 1.6, 0.5, 1); }
@keyframes slot-pop {
  from { transform: scale(0.3) rotate(-12deg); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

@media (min-width: 768px) {
  .panel { padding: 22px; gap: 18px; }
  .slot { font-size: 1.6rem; border-radius: 14px; }
  .field { font-size: 1.7rem; padding: 16px 18px; }
  .bar { height: 20px; }
  .heart { width: 46px; height: 41px; }
}

/* dare / result cards */
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border-radius: 26px;
  background: #fffbe8;
  color: #1f4d34;
  text-align: center;
  box-shadow: 0 14px 30px rgba(6, 30, 20, 0.35);
  animation: card-in 0.4s cubic-bezier(0.3, 1.4, 0.5, 1);
}
@keyframes card-in {
  from { transform: translateY(24px) scale(0.96); opacity: 0; }
  to { transform: none; opacity: 1; }
}
.btn {
  border: 0;
  border-radius: 16px;
  padding: 12px 10px;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 800;
  transition: transform 0.12s, box-shadow 0.12s;
}
.btn:active { transform: translateY(3px); box-shadow: none !important; }
.btn-go { background: #7be28a; color: #0f3a1d; box-shadow: 0 4px 0 #3f9f55; }
.btn-pay { background: #ff7a6b; color: #fff; box-shadow: 0 4px 0 #c2483b; }
.btn-ghost { background: #e5ecd9; color: #1f4d34; box-shadow: 0 4px 0 #b9c7a8; }

/* status bar */
.bar {
  height: 16px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(14, 40, 28, 0.6);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12);
}
.bar-fill {
  height: 100%;
  border-radius: 999px;
  background-image: linear-gradient(90deg, #ef4444, #f59e0b 40%, #84cc16 72%, #22c55e);
  background-repeat: no-repeat;
  background-position: 0 0;
  transition: width 0.6s cubic-bezier(0.3, 1.2, 0.5, 1), background-size 0.6s cubic-bezier(0.3, 1.2, 0.5, 1);
}

/* bomb effects */
.screen-shake { animation: screen-shake 0.52s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
@keyframes screen-shake {
  10%, 90% { transform: translate(-2px, 1px); }
  20%, 80% { transform: translate(4px, -2px); }
  30%, 50%, 70% { transform: translate(-7px, 3px); }
  40%, 60% { transform: translate(7px, -3px); }
}
.boom-flash {
  position: fixed;
  inset: 0;
  z-index: 30;
  pointer-events: none;
  background: radial-gradient(circle at 50% 55%, rgba(255, 230, 150, 0.95), rgba(255, 90, 60, 0.55) 45%, rgba(255, 60, 40, 0) 75%);
  animation: boom-flash 0.65s ease-out forwards;
}
@keyframes boom-flash {
  from { opacity: 1; transform: scale(0.6); }
  to { opacity: 0; transform: scale(1.4); }
}

@media (prefers-reduced-motion: reduce) {
  .screen-shake, .input-shake, .boom-flash { animation: none; }
}
</style>

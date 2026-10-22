<script>
function rng(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

// Leaf-shaped shadows cast on the wall. [x, y, scale] of each cluster in a 1600x900 viewBox.
const centers = [
  [260, 360, 2.6],
  [650, 140, 2.1],
  [1000, 300, 1.7],
  [90, 80, 1.9],
  [1340, 150, 2.1],
  [1500, 480, 1.5],
  [560, 600, 1.4],
]
const clusters = (() => {
  const r = rng(41)
  return centers.map(([x, y, s]) => {
    const n = 6 + Math.floor(r() * 3)
    return {
      x,
      y,
      delay: -r() * 8,
      fronds: Array.from({ length: n }, (_, k) => ({
        a: (360 / n) * k + (r() - 0.5) * 24,
        len: s * (0.8 + r() * 0.5),
      })),
    }
  })
})()

// Mood tint (the "Inside Out" recolor)
const palette = {
  happy: ['#ffe27a', '#ffb23e'],
  angry: ['#ff8f7a', '#d9343f'],
  sad: ['#a9c8f5', '#5d7fc8'],
}

export default {
  name: 'Backdrop',

  props: {
    mood: { type: String, default: 'normal' },
    variant: { type: String, default: 'stage' }, // 'photo' (start page) | 'stage' (game page)
  },

  data() {
    return {
      photoUrl: `${import.meta.env.BASE_URL}start-bg.jpg`,
      clusters,
      palette,
      lastTint: 'happy', // keeps the colors while the tint fades out
    }
  },

  watch: {
    mood: {
      immediate: true,
      handler(m) {
        if (palette[m]) this.lastTint = m
      },
    },
  },

  created() {
    // Pointer parallax state (not reactive on purpose).
    this.tx = 0
    this.ty = 0
    this.cx = 0
    this.cy = 0
    this.raf = 0
  },

  mounted() {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) return
    window.addEventListener('pointermove', this.onMove)
    this.raf = requestAnimationFrame(this.loop)
  },

  beforeUnmount() {
    window.removeEventListener('pointermove', this.onMove)
    cancelAnimationFrame(this.raf)
  },

  methods: {
    onMove(e) {
      this.tx = (e.clientX / window.innerWidth - 0.5) * 2
      this.ty = (e.clientY / window.innerHeight - 0.5) * 2
    },
    loop() {
      this.cx += (this.tx - this.cx) * 0.05
      this.cy += (this.ty - this.cy) * 0.05
      const root = this.$refs.root
      if (root) {
        root.style.setProperty('--px', this.cx.toFixed(4))
        root.style.setProperty('--py', this.cy.toFixed(4))
      }
      this.raf = requestAnimationFrame(this.loop)
    },
  },
}
</script>

<template>
  <div ref="root" class="backdrop" aria-hidden="true">
    <!-- light from the upper left -->
    <div class="light" />

    <!-- soft leaf shadows on the wall, drifting like a breeze outside the window -->
    <div class="shadows">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" class="h-full w-full">
        <defs>
          <filter id="stage-soft" x="-10%" y="-10%" width="120%" height="120%">
            <feGaussianBlur stdDeviation="1.6" />
          </filter>
        </defs>
        <g filter="url(#stage-soft)" fill="rgba(3, 38, 27, 0.3)">
          <g v-for="(c, i) in clusters" :key="i" :transform="`translate(${c.x} ${c.y})`">
            <g class="cluster" :style="{ animationDelay: c.delay + 's' }">
              <polygon
                v-for="(f, j) in c.fronds"
                :key="j"
                points="0,0 60,-20 170,0 60,20"
                :transform="`rotate(${f.a}) scale(${f.len})`"
              />
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- lit floor -->
    <div class="floor" />
    <div class="pool" />

    <!-- mood tint: spreads out from behind the dino -->
    <div
      class="tint tint-color"
      :class="{ on: mood !== 'normal' }"
      :style="{ '--c1': palette[lastTint][0], '--c2': palette[lastTint][1] }"
    />
    <div
      class="tint tint-soft"
      :class="{ on: mood !== 'normal' }"
      :style="{ '--c1': palette[lastTint][0], '--c2': palette[lastTint][1] }"
    />

    <div class="vignette" />

    <!-- start page: a still painting -->
    <Transition name="photo">
      <div v-if="variant === 'photo'" class="photo">
        <div class="photo-img" :style="{ backgroundImage: `url(${photoUrl})` }" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.backdrop {
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
  background: linear-gradient(180deg, #12513a 0%, #1b6e4c 38%, #2a8d5c 60%, #52b873 74%, #7fd388 100%);
  --px: 0;
  --py: 0;
}

.light {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    112deg,
    rgba(255, 255, 220, 0) 18%,
    rgba(255, 255, 220, 0.22) 34%,
    rgba(255, 255, 220, 0.06) 46%,
    rgba(255, 255, 220, 0) 60%
  );
  mix-blend-mode: screen;
  animation: light-pulse 9s ease-in-out infinite alternate;
}
@keyframes light-pulse {
  from { opacity: 0.55; }
  to { opacity: 1; }
}

.shadows {
  position: absolute;
  inset: -40px;
  transform: translate3d(calc(var(--px) * -18px), calc(var(--py) * -8px), 0);
  will-change: transform;
}
.cluster {
  animation: leaf-sway 7s ease-in-out infinite alternate;
}
@keyframes leaf-sway {
  from { transform: rotate(-2.5deg); }
  to { transform: rotate(2.5deg); }
}

.floor {
  position: absolute;
  inset: auto 0 0 0;
  height: 40%;
  background: linear-gradient(180deg, rgba(150, 230, 150, 0), rgba(160, 235, 155, 0.3) 50%, rgba(200, 248, 175, 0.5));
}
.pool {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 36% 34% at 22% 90%, rgba(255, 255, 215, 0.55), rgba(255, 255, 215, 0) 72%);
}

/* mood tint */
.tint {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(165deg, var(--c1), var(--c2));
  clip-path: circle(var(--r) at 25% 75%);
  --r: 0%;
  transition: --r 1.1s cubic-bezier(0.6, 0, 0.2, 1), --c1 0.9s ease, --c2 0.9s ease;
}
.tint.on { --r: 160%; }
.tint-color { mix-blend-mode: color; opacity: 0.95; }
.tint-soft { mix-blend-mode: soft-light; opacity: 0.85; }

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at 40% 50%, rgba(0, 0, 0, 0) 55%, rgba(6, 30, 20, 0.45) 100%);
}

/* start page photo */
.photo {
  position: absolute;
  inset: 0;
  overflow: hidden;
  background: #7cc45e;
}
.photo-img {
  position: absolute;
  inset: -3%;
  background-size: cover;
  background-position: 55% center;
  transform: translate3d(calc(var(--px) * -10px), calc(var(--py) * -6px), 0);
  animation: photo-drift 18s ease-in-out infinite alternate;
}
@keyframes photo-drift {
  from { scale: 1; }
  to { scale: 1.06; }
}
.photo-enter-active,
.photo-leave-active { transition: opacity 0.6s ease; }
.photo-enter-from,
.photo-leave-to { opacity: 0; }

@media (prefers-reduced-motion: reduce) {
  .light, .cluster, .photo-img { animation: none; }
}
</style>

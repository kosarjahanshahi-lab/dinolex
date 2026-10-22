<script>
export default {
  name: 'Dino',

  props: {
    left: { type: Boolean, default: false }, // sit at the left edge on wide screens
    mood: { type: String, default: 'normal' }, // normal | happy | angry | sad
    text: { type: String, default: '' },
    textKey: { type: Number, default: 0 }, // change it to replay the bubble pop
  },

  data() {
    return {
      poses: ['normal', 'happy', 'angry', 'sad', 'left', 'right', 'up'],
      alts: {
        normal: 'دایناسور سبز با لبخند کج',
        happy: 'دایناسور خوشحال',
        angry: 'دایناسور عصبانی',
        sad: 'دایناسور ناراحت',
        left: 'دایناسور به چپ نگاه می‌کند',
        right: 'دایناسور به راست نگاه می‌کند',
        up: 'دایناسور به بالا نگاه می‌کند',
      },
      look: 'normal', // which looking pose is showing while the mood is normal
    }
  },

  computed: {
    current() {
      return this.mood === 'normal' ? this.look : this.mood
    },
  },

  watch: {
    mood() {
      this.bounce()
    },
  },

  created() {
    // Pointer target and a damped spring that chases it. The little overshoot
    // is what makes the head feel soft instead of mechanical.
    this.tx = 0
    this.ty = 0
    this.x = 0
    this.y = 0
    this.vx = 0
    this.vy = 0
    this.lastMove = 0
    this.raf = 0
    this.reduce =
      typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  mounted() {
    window.addEventListener('pointermove', this.onMove)
    window.addEventListener('pointerdown', this.onMove)
    this.raf = requestAnimationFrame(this.loop)
  },

  beforeUnmount() {
    window.removeEventListener('pointermove', this.onMove)
    window.removeEventListener('pointerdown', this.onMove)
    cancelAnimationFrame(this.raf)
  },

  methods: {
    src(p) {
      return `${import.meta.env.BASE_URL}dino/${p}.webp`
    },

    clamp(v) {
      return Math.max(-1, Math.min(1, v))
    },

    onMove(e) {
      const rig = this.$refs.rig
      if (!rig) return
      const r = rig.getBoundingClientRect()
      this.tx = this.clamp((e.clientX - (r.left + r.width / 2)) / (window.innerWidth / 2))
      this.ty = this.clamp((e.clientY - (r.top + r.height * 0.3)) / (window.innerHeight / 2))
      this.lastMove = performance.now()
    },

    pickLook() {
      const a = this.look === 'normal' ? 0.3 : 0.18
      let next = 'normal'
      if (this.y < -a * 0.75 && -this.y > Math.abs(this.x) * 0.8) next = 'up'
      else if (this.x < -a) next = 'left'
      else if (this.x > a) next = 'right'
      if (next !== this.look) this.look = next
    },

    loop() {
      if (performance.now() - this.lastMove > 5000) {
        this.tx = 0
        this.ty = 0
      }
      this.vx = (this.vx + (this.tx - this.x) * 0.055) * 0.84
      this.vy = (this.vy + (this.ty - this.y) * 0.055) * 0.84
      this.x += this.vx
      this.y += this.vy
      if (this.mood === 'normal') this.pickLook()

      const rig = this.$refs.rig
      if (!this.reduce && rig) {
        const speed = Math.min(Math.abs(this.vx) * 5, 0.05)
        rig.style.transform =
          `perspective(1100px) rotateY(${this.x * 9}deg) rotateX(${-this.y * 5}deg) ` +
          `translateX(${this.x * 1.2}%) scale(${1 + speed}, ${1 - speed})`
        const shadow = this.$refs.shadow
        if (shadow) shadow.style.transform = `translateX(${-this.x * 6}%)`
      }
      this.raf = requestAnimationFrame(this.loop)
    },

    bounce() {
      const pop = this.$refs.pop
      if (!pop) return
      pop.classList.remove('go')
      void pop.offsetWidth
      pop.classList.add('go')
    },

    poke() {
      this.bounce()
    },
  },
}
</script>

<template>
  <div
    class="flex h-full w-full items-center pt-[1vh] pb-[2.5vh]"
    :class="left ? 'justify-center md:justify-start md:pl-[3vw]' : 'justify-center'"
  >
    <div ref="rig" class="rig" @click="poke">
      <div ref="shadow" class="shadow" />
      <div ref="pop" class="pop">
        <div class="fig" :class="mood">
          <img
            v-for="p in poses"
            :key="p"
            :src="src(p)"
            :alt="alts[p]"
            :class="{ on: p === current }"
            draggable="false"
          />
        </div>
      </div>
      <div v-if="text" :key="textKey" class="bubble" aria-live="polite">{{ text }}</div>
    </div>
  </div>
</template>

<style scoped>
.rig {
  position: relative;
  height: 100%;
  aspect-ratio: 628 / 900;
  max-width: 100%;
  transform-origin: 50% 80%;
  cursor: pointer;
  will-change: transform;
}
.shadow {
  position: absolute;
  left: 52%;
  bottom: -2%;
  width: 125%;
  height: 8%;
  translate: -50% 0;
  rotate: -5deg;
  background: radial-gradient(ellipse at center, rgba(3, 30, 20, 0.55), rgba(3, 30, 20, 0) 70%);
  filter: blur(5px);
}
.pop,
.fig {
  position: relative;
  height: 100%;
  width: 100%;
  transform-origin: 50% 100%;
}
.fig img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0;
  transition: opacity 0.16s ease;
  user-select: none;
  -webkit-user-drag: none;
  filter: drop-shadow(0 14px 18px rgba(8, 35, 20, 0.28));
}
.fig img.on {
  opacity: 1;
}

.bubble {
  position: absolute;
  top: 2%;
  left: 0;
  z-index: 2;
  max-width: 62%;
  background: #fffdf6;
  color: #1f3a28;
  padding: 12px 16px;
  border-radius: 22px 22px 22px 6px;
  font-weight: 700;
  font-size: 0.95rem;
  line-height: 1.7;
  box-shadow: 0 10px 24px rgba(8, 35, 20, 0.28);
  transform-origin: bottom left;
  pointer-events: none;
  animation: bubble-in 0.45s cubic-bezier(0.3, 1.6, 0.5, 1);
}
@keyframes bubble-in {
  from {
    transform: scale(0.4) rotate(-6deg);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.pop.go {
  animation: squash 0.55s cubic-bezier(0.3, 1.3, 0.5, 1);
}
@keyframes squash {
  0% { transform: scale(1.08, 0.9); }
  35% { transform: scale(0.94, 1.08) translateY(-3%); }
  70% { transform: scale(1.02, 0.98); }
  100% { transform: scale(1); }
}

.fig.normal { animation: breathe 3.4s ease-in-out infinite; }
@keyframes breathe { 50% { transform: scale(1.012, 0.988); } }

.fig.happy { animation: hop 0.62s ease-in-out infinite; }
@keyframes hop {
  0%, 100% { transform: translateY(0) scale(1.03, 0.97); }
  50% { transform: translateY(-4%) scale(0.985, 1.025); }
}

.fig.angry { animation: shake 0.09s linear infinite alternate; }
@keyframes shake {
  from { transform: translateX(-1%) rotate(-0.7deg); }
  to { transform: translateX(1%) rotate(0.7deg); }
}

.fig.sad { animation: sway 3.8s ease-in-out infinite; }
@keyframes sway {
  0%, 100% { transform: rotate(-1.4deg) scale(0.975); }
  50% { transform: rotate(1.4deg) scale(0.965) translateY(1%); }
}

@media (prefers-reduced-motion: reduce) {
  .fig,
  .pop.go {
    animation: none !important;
  }
}
</style>

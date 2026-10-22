<script>
const COLORS = ['#ff5d73', '#ffd166', '#06d6a0', '#4cc9f0', '#b388ff', '#ff9f1c', '#ffffff']

export default {
  name: 'Confetti',

  created() {
    // Plain (non-reactive) animation state.
    this.ctx = null
    this.parts = []
    this.raf = 0
    this.running = false
    this.emitUntil = 0
    this.w = 0
    this.h = 0
    this.dpr = 1
  },

  mounted() {
    this.resize()
    window.addEventListener('resize', this.resize)
  },

  beforeUnmount() {
    this.stop()
    window.removeEventListener('resize', this.resize)
  },

  methods: {
    resize() {
      const canvas = this.$refs.canvas
      if (!canvas) return
      this.dpr = Math.min(window.devicePixelRatio || 1, 2)
      this.w = window.innerWidth
      this.h = window.innerHeight
      canvas.width = this.w * this.dpr
      canvas.height = this.h * this.dpr
      this.ctx = canvas.getContext('2d')
      this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0)
    },

    spawn(n) {
      for (let i = 0; i < n; i++) {
        this.parts.push({
          x: Math.random() * this.w,
          y: -20 - Math.random() * this.h * 0.35,
          vx: (Math.random() - 0.5) * 2,
          vy: 2 + Math.random() * 3.2,
          size: 6 + Math.random() * 8,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: 0.03 + Math.random() * 0.05,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          round: Math.random() < 0.28,
        })
      }
    },

    frame() {
      const ctx = this.ctx
      ctx.clearRect(0, 0, this.w, this.h)
      const now = performance.now()
      if (now < this.emitUntil && this.parts.length < 280) this.spawn(3)

      for (const p of this.parts) {
        p.sway += p.swaySpeed
        p.x += p.vx + Math.sin(p.sway) * 1.1
        p.y += p.vy
        p.rot += p.vr
        ctx.save()
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.scale(1, Math.cos(p.sway * 1.7))
        ctx.fillStyle = p.color
        if (p.round) {
          ctx.beginPath()
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
        }
        ctx.restore()
      }
      this.parts = this.parts.filter((p) => p.y < this.h + 30)

      if (this.parts.length || now < this.emitUntil) {
        this.raf = requestAnimationFrame(this.frame)
      } else {
        this.running = false
      }
    },

    start() {
      this.resize()
      this.emitUntil = performance.now() + 6000
      this.spawn(110)
      if (!this.running) {
        this.running = true
        this.raf = requestAnimationFrame(this.frame)
      }
    },

    stop() {
      cancelAnimationFrame(this.raf)
      this.running = false
      this.emitUntil = 0
      this.parts = []
      if (this.ctx) this.ctx.clearRect(0, 0, this.w, this.h)
    },
  },
}
</script>

<template>
  <canvas
    ref="canvas"
    class="pointer-events-none fixed inset-0 z-40 h-full w-full"
    aria-hidden="true"
  />
</template>

<script>
import StarButton from '../components/StarButton.vue'
import { audio } from '../audio'

export default {
  name: 'StartPage',
  components: { StarButton },
  emits: ['start'],
  methods: {
    go() {
      // Browsers only allow sound after a click, so the audio engine wakes up here.
      audio.unlock()
      audio.click()
      this.$emit('start')
    },
  },
}
</script>

<template>
  <main
    dir="ltr"
    class="relative z-10 flex h-full flex-col items-start justify-center gap-5 px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))] md:gap-7 md:px-10"
  >
    <h1 class="title" lang="en" dir="ltr">Dare<br />to play?</h1>

    <div class="menu-card">
      <StarButton @click="go">Start</StarButton>
    </div>
  </main>
</template>

<style scoped>
.title {
  margin: 0;
  font-family: "Chewy", "Vazirmatn", system-ui, sans-serif;
  font-size: clamp(4.6rem, 16vw, 10.5rem);
  font-weight: 400;
  line-height: 0.92;
  letter-spacing: 0.02em;
  color: #fffdf4;
  -webkit-text-stroke: 0.1em #2f6f73;
  paint-order: stroke fill;
  text-shadow: 0 0.05em 0 #25585b, 0 0.14em 0.25em rgba(20, 60, 50, 0.3);
  transform: rotate(-4deg);
  transform-origin: left top;
  animation: title-drop 0.9s cubic-bezier(0.3, 1.5, 0.5, 1) both;
}
@keyframes title-drop {
  from {
    transform: translateY(-60px) rotate(-10deg) scale(0.75);
    opacity: 0;
  }
  to {
    transform: rotate(-4deg);
    opacity: 1;
  }
}

/* cream menu card with a stitched dashed edge, like the reference menu */
.menu-card {
  position: relative;
  width: min(100%, 29rem);
  padding: 2rem;
  border-radius: 2.2rem;
  background: #fff6df;
  box-shadow: 0 16px 36px rgba(20, 60, 40, 0.3);
}
.menu-card::before {
  content: "";
  position: absolute;
  inset: 9px;
  border: 2px dashed #d8c79a;
  border-radius: 1.8rem;
  pointer-events: none;
}

@media (prefers-reduced-motion: reduce) {
  .title { animation: none; }
}
</style>

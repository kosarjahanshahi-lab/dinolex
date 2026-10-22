<script>
import { store } from './store'
import Backdrop from './components/Backdrop.vue'
import StartPage from './pages/StartPage.vue'
import GamePage from './pages/GamePage.vue'

export default {
  name: 'App',
  components: { Backdrop, StartPage, GamePage },
  data() {
    return { store }
  },
}
</script>

<template>
  <div class="relative h-dvh w-full overflow-hidden">
    <Backdrop :mood="store.mood" :variant="store.page === 'start' ? 'photo' : 'stage'" />
    <Transition name="page" mode="out-in">
      <StartPage v-if="store.page === 'start'" key="start" @start="store.page = 'game'" />
      <GamePage v-else key="game" />
    </Transition>
  </div>
</template>

<style>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.5s ease, transform 0.6s cubic-bezier(0.2, 0.8, 0.2, 1),
    filter 0.5s ease;
}
.page-enter-from {
  opacity: 0;
  transform: scale(0.96) translateY(24px);
}
.page-leave-to {
  opacity: 0;
  transform: scale(1.06);
  filter: blur(6px);
}
</style>

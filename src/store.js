import { reactive } from 'vue'

// Tiny shared state: which page is showing, and the dino's current mood
// (the forest background reacts to the mood).
export const store = reactive({
  page: 'start', // 'start' | 'game'
  mood: 'normal', // 'normal' | 'happy' | 'angry' | 'sad'
})

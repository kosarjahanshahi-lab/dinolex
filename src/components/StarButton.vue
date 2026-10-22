<script>
// Vue port of the star-button: gold button that releases glittering stars
// on hover. Colors are tuned to the theme.
// Class strings are written out in full so Tailwind can detect them.
export default {
  name: 'StarButton',
  data() {
    return {
      stars: [
      'absolute top-[20%] left-[20%] w-[25px] z-[-5] transition-all duration-[1000ms] ease-[cubic-bezier(0.05,0.83,0.43,0.96)] drop-shadow-[0_0_0_var(--tw-shadow-color)] group-hover:top-[-80%] group-hover:left-[-30%] group-hover:drop-shadow-[0_0_10px_var(--tw-shadow-color)] group-hover:z-[2]',
      'absolute top-[45%] left-[45%] w-[15px] z-[-5] transition-all duration-[1000ms] ease-[cubic-bezier(0,0.4,0,1.01)] drop-shadow-[0_0_0_var(--tw-shadow-color)] group-hover:top-[-25%] group-hover:left-[10%] group-hover:drop-shadow-[0_0_10px_var(--tw-shadow-color)] group-hover:z-[2]',
      'absolute top-[40%] left-[40%] w-[5px] z-[-5] transition-all duration-[1000ms] ease-[cubic-bezier(0,0.4,0,1.01)] drop-shadow-[0_0_0_var(--tw-shadow-color)] group-hover:top-[55%] group-hover:left-[25%] group-hover:drop-shadow-[0_0_10px_var(--tw-shadow-color)] group-hover:z-[2]',
      'absolute top-[20%] left-[40%] w-[8px] z-[-5] transition-all duration-[800ms] ease-[cubic-bezier(0,0.4,0,1.01)] drop-shadow-[0_0_0_var(--tw-shadow-color)] group-hover:top-[30%] group-hover:left-[80%] group-hover:drop-shadow-[0_0_10px_var(--tw-shadow-color)] group-hover:z-[2]',
      'absolute top-[25%] left-[45%] w-[15px] z-[-5] transition-all duration-[600ms] ease-[cubic-bezier(0,0.4,0,1.01)] drop-shadow-[0_0_0_var(--tw-shadow-color)] group-hover:top-[25%] group-hover:left-[115%] group-hover:drop-shadow-[0_0_10px_var(--tw-shadow-color)] group-hover:z-[2]',
      'absolute top-[5%] left-[50%] w-[5px] z-[-5] transition-all duration-[800ms] ease-in-out drop-shadow-[0_0_0_var(--tw-shadow-color)] group-hover:top-[5%] group-hover:left-[60%] group-hover:drop-shadow-[0_0_10px_var(--tw-shadow-color)] group-hover:z-[2]',
    ],
    }
  },
}
</script>

<template>
  <button
    type="button"
    class="group relative w-full cursor-pointer rounded-2xl border-[3px] border-[#7fae3e] bg-[#7fae3e] px-[40px] py-[18px] text-[30px] font-extrabold text-[#fffbe8] shadow-[0_0_0_#7fae3e8c] transition-all duration-300 ease-in-out hover:bg-transparent hover:text-[#7fae3e] hover:shadow-[0_0_28px_#7fae3e8c] focus-visible:bg-transparent focus-visible:text-[#7fae3e] active:scale-95"
  >
    <slot />

    <div v-for="(cls, i) in stars" :key="i" :class="cls" aria-hidden="true">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 784.11 815.53"
        class="h-auto w-full fill-[#9bc653] dark:fill-[#e8f7b8]"
      >
        <path
          d="M392.05 0c-20.9,210.08-184.06,378.41-392.05,407.78 207.96,29.37 371.12,197.68 392.05,407.74 20.93-210.06 184.09-378.37 392.05-407.74-207.98-29.38-371.16-197.69-392.06-407.78z"
        />
      </svg>
    </div>
  </button>
</template>

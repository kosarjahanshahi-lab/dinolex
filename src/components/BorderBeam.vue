<script>
// Vue port of the "border-beam" effect: a bright arc that travels around
// the border of whatever is inside the slot. Pure CSS, no dependencies.
export default {
  name: 'BorderBeam',
  props: {
    radius: { type: Number, default: 28 },
    duration: { type: Number, default: 3.4 },
    thickness: { type: Number, default: 2.5 },
  },
}
</script>

<template>
  <div
    class="beam"
    :style="{
      '--beam-radius': radius + 'px',
      '--beam-dur': duration + 's',
      '--beam-w': thickness + 'px',
    }"
  >
    <slot />
  </div>
</template>

<style scoped>
.beam {
  position: relative;
  border-radius: var(--beam-radius);
}
.beam::before,
.beam::after {
  content: "";
  position: absolute;
  inset: calc(var(--beam-w) * -1);
  padding: var(--beam-w);
  border-radius: calc(var(--beam-radius) + var(--beam-w));
  background: conic-gradient(
    from var(--beam),
    transparent 0 52%,
    #b7f06a 68%,
    #ffe27a 80%,
    #7ff0c8 91%,
    transparent 100%
  );
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
  animation: beam-spin var(--beam-dur) linear infinite;
  pointer-events: none;
}
.beam::after {
  filter: blur(9px);
  opacity: 0.75;
}
@keyframes beam-spin {
  to {
    --beam: 360deg;
  }
}
@media (prefers-reduced-motion: reduce) {
  .beam::before,
  .beam::after {
    animation-duration: 12s;
  }
}
</style>

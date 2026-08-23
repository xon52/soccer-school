<script setup lang="ts">
defineProps<{
  label: string
  revealed?: boolean
  selected?: boolean
  correct?: boolean
  locked?: boolean
}>()

defineEmits<{
  choose: []
}>()
</script>

<template>
  <button
    class="choice"
    type="button"
    :class="{
      selected,
      revealed,
      yes: revealed && correct,
      no: revealed && selected && !correct,
    }"
    :disabled="revealed || locked"
    @click="$emit('choose')"
  >
    {{ label }}
  </button>
</template>

<style scoped>
.choice {
  width: 100%;
  min-height: 3.4rem;
  text-align: center;
  font: inherit;
  font-weight: 800;
  font-size: clamp(0.85rem, 1.7vw, 1.05rem);
  line-height: 1.25;
  padding: 0.7rem 0.55rem;
  border-radius: 14px;
  border: 3px solid #14221b;
  background: #fff;
  color: #14221b;
  box-shadow: 0 4px 0 #14221b;
  cursor: pointer;
}

.choice:hover:not(:disabled),
.choice:focus-visible {
  background: #e8f6ec;
}

.choice.selected:not(.revealed) {
  background: #dbeafe;
}

.choice.yes {
  background: #bbf7d0;
}

.choice.no {
  background: #fecaca;
}

.choice:disabled {
  cursor: default;
}
</style>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import PlayStage from '@/components/PlayStage.vue'
import { getGroup, isGroupId } from '@/data/groups'
import { useGroupSession } from '@/composables/useGroupSession'

const props = defineProps<{
  groupId: string
}>()

const router = useRouter()
const {
  current,
  total,
  questionNumber,
  revealed,
  isLast,
  isLastLayer,
  start,
  recordAnswer,
  next,
  finished,
} = useGroupSession()

const group = computed(() => getGroup(props.groupId))

onMounted(async () => {
  if (!isGroupId(props.groupId) || group.value?.comingSoon) {
    await router.replace({ name: 'home' })
    return
  }
  start(props.groupId)
})

function onAnswered(correct: boolean) {
  recordAnswer(correct)
}

async function onNext() {
  next()
  if (finished.value) {
    await router.push({ name: 'results', params: { groupId: props.groupId } })
  }
}
</script>

<template>
  <section v-if="current && group" class="play">
    <p class="progress">{{ group.title }} · Question {{ questionNumber }} of {{ total }}</p>

    <PlayStage
      :key="current.scenarioId"
      :play="current.play"
      :question="current.question"
      :is-last-layer="isLastLayer"
      @answered="onAnswered"
    >
      <button v-if="revealed" class="btn primary" type="button" @click="onNext">
        {{ isLast ? 'See your score' : 'Next' }}
      </button>
    </PlayStage>
  </section>
</template>

<style scoped>
.play {
  display: grid;
  gap: 0.7rem;
}

.progress {
  margin: 0;
  font-weight: 800;
  color: #facc15;
}
</style>

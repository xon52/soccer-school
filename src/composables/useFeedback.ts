import { computed, ref } from 'vue'
import { sendFeedback } from '@/feedback/client'
import type { FeedbackCategory, FeedbackContext } from '@/feedback/client'

export type FeedbackStatus = 'idle' | 'sending' | 'sent' | 'error'

const isOpen = ref(false)
const category = ref<FeedbackCategory>('other')
const message = ref('')
const context = ref<FeedbackContext>({})
const status = ref<FeedbackStatus>('idle')

export function useFeedback() {
  const isQuestionReport = computed(() => typeof context.value.questionId === 'string')
  const canSend = computed(() => message.value.trim().length > 0 && status.value !== 'sending')

  /**
   * The context is snapshotted here rather than read at submit time, so a report
   * can never drift onto whatever question came next.
   */
  function open(nextContext?: FeedbackContext) {
    context.value = nextContext ?? {}
    category.value = nextContext ? 'bug' : 'other'
    message.value = ''
    status.value = 'idle'
    isOpen.value = true
  }

  function close() {
    isOpen.value = false
  }

  async function submit(turnstileToken: string): Promise<boolean> {
    if (!canSend.value) return false
    status.value = 'sending'
    try {
      const sent = await sendFeedback({
        category: category.value,
        message: message.value.trim(),
        context: context.value,
        turnstileToken,
      })
      if (!sent) {
        status.value = 'error'
        return false
      }
      status.value = 'sent'
      message.value = ''
      return true
    } catch {
      status.value = 'error'
      return false
    }
  }

  return {
    isOpen,
    category,
    message,
    context,
    status,
    isQuestionReport,
    canSend,
    open,
    close,
    submit,
  }
}

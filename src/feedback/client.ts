/**
 * Talks to the admin feedback endpoint directly instead of loading
 * `admin.xon5.com/embed/widget.js`. The drop-in embed ships its own floating
 * button and modal with no way to open them from code, and the button would sit
 * on top of the play dock. The payload below is the one the embed sends.
 */

export const FEEDBACK_APP = 'soccer-school'
export const FEEDBACK_ENDPOINT = 'https://admin.xon5.com/api/feedback'

/** Public sitekey, same one the embed ships with. */
export const TURNSTILE_SITEKEY = '0x4AAAAAAEbirAJqxTON9gCa'
export const TURNSTILE_ACTION = 'feedback'

const TURNSTILE_SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

export type FeedbackCategory = 'bug' | 'idea' | 'other'

export type FeedbackContext = Record<string, string | number | undefined>

export interface FeedbackReport {
  category: FeedbackCategory
  message: string
  context: FeedbackContext
  turnstileToken: string
}

interface TurnstileOptions {
  sitekey: string
  action?: string
  theme?: 'auto' | 'light' | 'dark'
  appearance?: 'always' | 'execute' | 'interaction-only'
  callback?: (token: string) => void
  'expired-callback'?: () => void
  'error-callback'?: (code?: string) => void
}

export interface Turnstile {
  render(container: string | HTMLElement, options: TurnstileOptions): string | undefined
  remove(widgetId: string): void
  reset(widgetId?: string): void
  getResponse(widgetId?: string): string | undefined
}

declare global {
  interface Window {
    turnstile?: Turnstile
  }
}

let loading: Promise<Turnstile> | null = null

/**
 * `window.turnstile` is normally set by the time the script fires `load`, but
 * poll for a beat rather than reporting a verification failure on a race.
 */
function waitForApi(): Promise<Turnstile> {
  return new Promise((resolve, reject) => {
    let tries = 0
    const poll = window.setInterval(() => {
      if (window.turnstile) {
        window.clearInterval(poll)
        resolve(window.turnstile)
        return
      }
      tries += 1
      if (tries > 40) {
        window.clearInterval(poll)
        reject(new Error('turnstile-missing'))
      }
    }, 50)
  })
}

export function loadTurnstile(): Promise<Turnstile> {
  if (window.turnstile) return Promise.resolve(window.turnstile)
  if (loading) return loading
  loading = new Promise<Turnstile>((resolve, reject) => {
    const script = document.createElement('script')
    script.src = TURNSTILE_SRC
    script.async = true
    script.onload = () => {
      if (window.turnstile) resolve(window.turnstile)
      else waitForApi().then(resolve, reject)
    }
    script.onerror = () => {
      script.remove()
      reject(new Error('turnstile-unreachable'))
    }
    document.head.appendChild(script)
  })
  // Offline on the first try should not poison every later attempt.
  loading.catch(() => {
    loading = null
  })
  return loading
}

export async function sendFeedback(report: FeedbackReport): Promise<boolean> {
  const response = await fetch(FEEDBACK_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      app: FEEDBACK_APP,
      category: report.category,
      message: report.message,
      context: report.context,
      turnstileToken: report.turnstileToken,
      // Honeypot the endpoint checks; a real submission always leaves it empty.
      website: '',
    }),
  })
  return response.ok
}

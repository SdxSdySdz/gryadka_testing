import axios from 'axios'
import { retrieveLaunchParams } from '@telegram-apps/sdk-react'

const baseURL = import.meta.env.VITE_API_BASE_URL || '/api'

let authHeader = ''

try {
  const { initDataRaw } = retrieveLaunchParams()
  if (initDataRaw) {
    authHeader = initDataRaw
  }
} catch {
  // Not in Telegram environment (dev mode)
  console.warn('Not in Telegram environment, using dev auth')
}

export const http = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
    ...(authHeader ? { Authorization: authHeader } : {}),
  },
})

// For dev mode: allow setting dev user ID
export function setDevUserId(userId: number) {
  http.defaults.headers.common['X-Dev-User-ID'] = String(userId)
}

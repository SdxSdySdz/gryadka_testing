import { retrieveLaunchParams } from '@telegram-apps/sdk-react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { init } from './utils/init'
import './index.css'

const root = ReactDOM.createRoot(document.getElementById('root')!)

try {
  const launchParams = retrieveLaunchParams()
  init(launchParams.startParam === 'debug' || import.meta.env.DEV)
  root.render(<App />)
} catch (e) {
  // Not in Telegram environment — render anyway for dev
  console.warn('TMA SDK init failed, rendering in dev mode:', e)
  root.render(<App />)
}

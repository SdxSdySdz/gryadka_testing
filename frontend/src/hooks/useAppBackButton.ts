import { backButton } from '@telegram-apps/sdk-react'
import { useEffect } from 'react'

export const useAppBackButton = (handler: () => void) => {
  useEffect(() => {
    if (!backButton.isSupported()) return

    backButton.show()
    backButton.onClick(handler)

    return () => {
      backButton.offClick(handler)
      backButton.hide()
    }
  }, [handler])
}

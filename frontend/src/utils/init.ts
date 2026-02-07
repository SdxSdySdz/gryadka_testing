import {
  backButton,
  viewport,
  themeParams,
  miniApp,
  initData,
  $debug,
  init as initSDK,
  swipeBehavior,
} from '@telegram-apps/sdk-react'

export function init(debug: boolean): void {
  $debug.set(debug)
  initSDK()

  if (!miniApp.isSupported()) {
    throw new Error('ERR_NOT_SUPPORTED')
  }

  if (backButton.isSupported()) {
    backButton.mount()
  }

  miniApp.mount()
  themeParams.mount()
  initData.restore()

  void viewport
    .mount()
    .catch((e) => {
      console.error('Something went wrong mounting the viewport', e)
    })
    .then(() => {
      if (viewport.bindCssVars.isAvailable()) {
        viewport.bindCssVars()
      }
    })

  if (miniApp.bindCssVars.isAvailable()) {
    miniApp.bindCssVars()
  }
  if (themeParams.bindCssVars.isAvailable()) {
    themeParams.bindCssVars()
  }

  // Disable vertical swipe to close
  if (swipeBehavior.isSupported()) {
    swipeBehavior.mount()
    if (swipeBehavior.disableVertical.isAvailable()) {
      swipeBehavior.disableVertical()
    }
  }

  // Expand to full height
  if (viewport.expand.isAvailable()) {
    viewport.expand()
  }
}

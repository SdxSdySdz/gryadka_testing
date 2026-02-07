import { create } from 'zustand'

interface FavoritesState {
  ids: number[]
  toggle: (id: number) => void
  isFavorite: (id: number) => boolean
}

// Load from localStorage
function loadFavorites(): number[] {
  try {
    const raw = localStorage.getItem('gryadka_favorites')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveFavorites(ids: number[]) {
  try {
    localStorage.setItem('gryadka_favorites', JSON.stringify(ids))
  } catch {
    // localStorage might not be available in TMA
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => ({
  ids: loadFavorites(),

  toggle: (id) => {
    const ids = get().ids
    const newIds = ids.includes(id) ? ids.filter((i) => i !== id) : [...ids, id]
    saveFavorites(newIds)
    set({ ids: newIds })
  },

  isFavorite: (id) => get().ids.includes(id),
}))

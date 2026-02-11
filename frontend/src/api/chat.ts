import { http } from './http'
import type { ChatMessage, ChatRoom } from '../types'

function buildFormData(text: string, file?: File | null): FormData {
  const fd = new FormData()
  if (text) fd.append('text', text)
  if (file) {
    if (file.type.startsWith('video/')) {
      fd.append('video', file)
    } else {
      fd.append('image', file)
    }
  }
  return fd
}

export const chatApi = {
  // Client
  getMessages: (after?: string) =>
    http.get<ChatMessage[]>('/chat/messages/', { params: after ? { after } : {} }).then((r) => r.data),

  sendMessage: (text: string, file?: File | null) =>
    http.post<ChatMessage>('/chat/messages/send/', buildFormData(text, file), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),

  // Admin
  getRooms: () =>
    http.get<ChatRoom[]>('/chat/admin/rooms/').then((r) => r.data),

  getRoomMessages: (roomId: number, after?: string) =>
    http.get<ChatMessage[]>(`/chat/admin/rooms/${roomId}/messages/`, { params: after ? { after } : {} }).then((r) => r.data),

  sendAdminMessage: (roomId: number, text: string, file?: File | null) =>
    http.post<ChatMessage>(`/chat/admin/rooms/${roomId}/messages/send/`, buildFormData(text, file), {
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then((r) => r.data),
}

import { http } from './http'
import type { ChatMessage, ChatRoom } from '../types'

export const chatApi = {
  // Client
  openChat: () =>
    http.post('/chat/open/').then((r) => r.data),

  getMessages: (after?: string) =>
    http.get<ChatMessage[]>('/chat/messages/', { params: after ? { after } : {} }).then((r) => r.data),

  sendMessage: (text: string) =>
    http.post<ChatMessage>('/chat/messages/send/', { text }).then((r) => r.data),

  // Admin
  getRooms: () =>
    http.get<ChatRoom[]>('/chat/admin/rooms/').then((r) => r.data),

  getRoomMessages: (roomId: number, after?: string) =>
    http.get<ChatMessage[]>(`/chat/admin/rooms/${roomId}/messages/`, { params: after ? { after } : {} }).then((r) => r.data),

  sendAdminMessage: (roomId: number, text: string) =>
    http.post<ChatMessage>(`/chat/admin/rooms/${roomId}/messages/send/`, { text }).then((r) => r.data),
}

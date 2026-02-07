import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppBackButton } from '../../hooks/useAppBackButton'
import { chatApi } from '../../api/chat'
import { useUserStore } from '../../store/userStore'
import type { ChatRoom, ChatMessage } from '../../types'

export default function AdminChat() {
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMsgIdRef = useRef<number>(0)

  useAppBackButton(useCallback(() => {
    if (selectedRoom) {
      setSelectedRoom(null)
    } else {
      navigate('/admin')
    }
  }, [navigate, selectedRoom]))

  // Poll rooms list
  useEffect(() => {
    loadRooms()
    const interval = setInterval(loadRooms, 5000)
    return () => clearInterval(interval)
  }, [])

  // Poll messages when a room is selected
  useEffect(() => {
    if (!selectedRoom) return

    const loadMsgs = async () => {
      try {
        const data = await chatApi.getRoomMessages(selectedRoom)
        setMessages(data)
      } catch (e) { console.error(e) }
    }

    loadMsgs()
    const interval = setInterval(loadMsgs, 3000)
    return () => clearInterval(interval)
  }, [selectedRoom])

  // Auto-scroll on new messages
  useEffect(() => {
    if (messages.length > 0) {
      const lastId = messages[messages.length - 1].id
      if (lastId !== lastMsgIdRef.current) {
        lastMsgIdRef.current = lastId
        setTimeout(() => {
          scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
        }, 50)
      }
    }
  }, [messages])

  const loadRooms = async () => {
    try {
      const data = await chatApi.getRooms()
      setRooms(data)
    } catch (e) { console.error(e) }
  }

  const handleSend = async () => {
    if (!text.trim() || !selectedRoom || sending) return
    setSending(true)
    try {
      const msg = await chatApi.sendAdminMessage(selectedRoom, text.trim())
      setMessages((prev) => [...prev, msg])
      lastMsgIdRef.current = msg.id
      setText('')
      setTimeout(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
      }, 50)
    } catch (e) { console.error(e) }
    finally { setSending(false) }
  }

  // Room list view
  if (!selectedRoom) {
    return (
      <div style={{ padding: 16 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Чаты</h2>
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
            Нет активных чатов
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                style={{
                  background: 'var(--white)', borderRadius: 14,
                  padding: '14px 16px', boxShadow: 'var(--shadow)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  textAlign: 'left', width: '100%',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: 16, flexShrink: 0,
                }}>
                  {room.client_name?.[0] || '?'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>
                    {room.client_name}
                    {room.client_username && <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> @{room.client_username}</span>}
                  </div>
                  {room.last_message && (
                    <div style={{
                      fontSize: 12, color: 'var(--text-secondary)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {room.last_message.sender_is_admin ? 'Вы: ' : ''}{room.last_message.text}
                    </div>
                  )}
                </div>

                {room.unread_count > 0 && (
                  <span style={{
                    background: 'var(--green-main)', color: 'white',
                    borderRadius: '50%', width: 22, height: 22,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, flexShrink: 0,
                  }}>
                    {room.unread_count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Chat view
  const currentRoom = rooms.find((r) => r.id === selectedRoom)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
        padding: '16px 20px', color: 'white',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700 }}>{currentRoom?.client_name || 'Чат'}</div>
        {currentRoom?.client_username && (
          <div style={{ fontSize: 12, opacity: 0.8 }}>@{currentRoom.client_username}</div>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>
            Нет сообщений
          </div>
        )}
        {messages.map((msg) => {
          const isAdmin = msg.sender_is_admin
          return (
            <div key={msg.id} style={{ alignSelf: isAdmin ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              {isAdmin && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, textAlign: 'right', paddingRight: 4 }}>
                  {msg.sender_name}
                </div>
              )}
              <div style={{
                background: isAdmin ? 'var(--green-main)' : 'var(--white)',
                color: isAdmin ? 'white' : 'var(--text-primary)',
                padding: '10px 14px', borderRadius: isAdmin ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 14, lineHeight: 1.4, boxShadow: 'var(--shadow)',
              }}>
                {msg.text}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-hint)', marginTop: 2, textAlign: isAdmin ? 'right' : 'left', padding: '0 4px' }}>
                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', background: 'var(--white)', display: 'flex', gap: 10, boxShadow: '0 -2px 10px rgba(0,0,0,0.05)' }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ответить..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid #e0e0e0', fontSize: 14, outline: 'none' }}
        />
        <button
          onClick={handleSend}
          disabled={!text.trim() || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: text.trim() ? 'var(--green-main)' : '#e0e0e0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
          </svg>
        </button>
      </div>
    </div>
  )
}

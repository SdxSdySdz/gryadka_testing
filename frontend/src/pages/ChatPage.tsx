import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { chatApi } from '../api/chat'
import { useUserStore } from '../store/userStore'
import { useAppBackButton } from '../hooks/useAppBackButton'
import type { ChatMessage } from '../types'

export default function ChatPage() {
  const navigate = useNavigate()
  const user = useUserStore((s) => s.user)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  // Load messages
  const loadMessages = async () => {
    try {
      const msgs = await chatApi.getMessages()
      setMessages(msgs)
    } catch (e) {
      console.error(e)
    }
  }

  // Poll for new messages
  const pollMessages = async () => {
    if (messages.length === 0) return
    const lastMsg = messages[messages.length - 1]
    try {
      const newMsgs = await chatApi.getMessages(lastMsg.created_at)
      if (newMsgs.length > 0) {
        setMessages((prev) => [...prev, ...newMsgs])
      }
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    // Notify admins that client opened the chat
    chatApi.openChat().catch(console.error)
    loadMessages()
    pollingRef.current = setInterval(pollMessages, 3000)
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || sending) return
    setSending(true)
    try {
      const msg = await chatApi.sendMessage(text.trim())
      setMessages((prev) => [...prev, msg])
      setText('')
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100vh', background: 'var(--bg)',
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, var(--green-dark), var(--green-light))',
        padding: '16px 20px',
        color: 'white',
      }}>
        <div style={{ fontSize: 18, fontWeight: 700 }}>Поддержка</div>
        <div style={{ fontSize: 12, opacity: 0.8 }}>Напишите нам, мы ответим!</div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        style={{
          flex: 1, overflowY: 'auto',
          padding: 16, display: 'flex',
          flexDirection: 'column', gap: 8,
        }}
      >
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 40 }}>
            Начните диалог!
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender === user?.id
          return (
            <div
              key={msg.id}
              style={{
                alignSelf: isMe ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
              }}
            >
              {!isMe && (
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 2, paddingLeft: 4 }}>
                  {msg.sender_name}
                </div>
              )}
              <div style={{
                background: isMe ? 'var(--green-main)' : 'var(--white)',
                color: isMe ? 'white' : 'var(--text-primary)',
                padding: '10px 14px',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: 'var(--shadow)',
              }}>
                {msg.text}
              </div>
              <div style={{
                fontSize: 10, color: 'var(--text-hint)',
                marginTop: 2, textAlign: isMe ? 'right' : 'left',
                paddingLeft: 4, paddingRight: 4,
              }}>
                {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--white)',
        display: 'flex', gap: 10,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Написать сообщение..."
          style={{
            flex: 1, padding: '12px 16px',
            borderRadius: 24, border: '1px solid #e0e0e0',
            fontSize: 14, outline: 'none',
          }}
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

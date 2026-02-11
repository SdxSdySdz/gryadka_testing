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
  const [file, setFile] = useState<File | null>(null)
  const [filePreview, setFilePreview] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const lastMsgIdRef = useRef<number>(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useAppBackButton(useCallback(() => navigate(-1), [navigate]))

  const loadMessages = useCallback(async () => {
    try {
      const msgs = await chatApi.getMessages()
      setMessages(msgs)
      if (msgs.length > 0) {
        lastMsgIdRef.current = msgs[msgs.length - 1].id
      }
    } catch (e) {
      console.error(e)
    }
  }, [])

  // Initial load + start polling
  useEffect(() => {
    loadMessages()

    const interval = setInterval(() => {
      loadMessages()
    }, 3000)

    return () => clearInterval(interval)
  }, [loadMessages])

  // Auto-scroll when new messages arrive
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

  // Scroll on first load too
  useEffect(() => {
    if (messages.length > 0) {
      scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
    }
  }, [messages.length > 0])

  // Generate preview URL for selected file
  useEffect(() => {
    if (!file) {
      setFilePreview(null)
      return
    }
    const url = URL.createObjectURL(file)
    setFilePreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setFile(f)
    e.target.value = '' // reset so same file can be re-selected
  }

  const removeFile = () => setFile(null)

  const handleSend = async () => {
    if ((!text.trim() && !file) || sending) return
    setSending(true)
    try {
      const msg = await chatApi.sendMessage(text.trim(), file)
      setMessages((prev) => [...prev, msg])
      lastMsgIdRef.current = msg.id
      setText('')
      setFile(null)
      setTimeout(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight)
      }, 50)
    } catch (e) {
      console.error(e)
    } finally {
      setSending(false)
    }
  }

  const renderMedia = (msg: ChatMessage) => {
    if (msg.image) {
      return (
        <a href={msg.image} target="_blank" rel="noopener noreferrer" style={{ display: 'block' }}>
          <img
            src={msg.image}
            alt=""
            style={{
              maxWidth: '100%',
              maxHeight: 260,
              borderRadius: 10,
              display: 'block',
            }}
          />
        </a>
      )
    }
    if (msg.video) {
      return (
        <video
          src={msg.video}
          controls
          playsInline
          preload="metadata"
          style={{
            maxWidth: '100%',
            maxHeight: 260,
            borderRadius: 10,
            display: 'block',
          }}
        />
      )
    }
    return null
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
          const hasMedia = !!msg.image || !!msg.video
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
                padding: hasMedia ? '6px' : '10px 14px',
                borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                fontSize: 14,
                lineHeight: 1.4,
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
              }}>
                {renderMedia(msg)}
                {msg.text && (
                  <div style={{ padding: hasMedia ? '6px 8px 4px' : 0 }}>
                    {msg.text}
                  </div>
                )}
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

      {/* File preview */}
      {file && filePreview && (
        <div style={{
          padding: '8px 16px',
          background: 'var(--white)',
          borderTop: '1px solid #e0e0e0',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          {file.type.startsWith('video/') ? (
            <video
              src={filePreview}
              style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
            />
          ) : (
            <img
              src={filePreview}
              alt=""
              style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover' }}
            />
          )}
          <div style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {file.name}
          </div>
          <button
            onClick={removeFile}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#FFF3F0', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="#e53935">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
            </svg>
          </button>
        </div>
      )}

      {/* Input */}
      <div style={{
        padding: '12px 16px',
        background: 'var(--white)',
        display: 'flex', gap: 10, alignItems: 'center',
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
      }}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        {/* Attach button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="var(--text-secondary)">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5a2.5 2.5 0 0 1 5 0v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5a2.5 2.5 0 0 0 5 0V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z"/>
          </svg>
        </button>
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
          disabled={(!text.trim() && !file) || sending}
          style={{
            width: 44, height: 44, borderRadius: '50%',
            background: (text.trim() || file) ? 'var(--green-main)' : '#e0e0e0',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
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

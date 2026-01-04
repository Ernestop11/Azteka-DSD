'use client'

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'

interface Message {
  id: string
  message: string
  isFromCustomer: boolean
  repId?: string
  readAt?: string
  createdAt: string
}

interface Conversation {
  customerId: string
  businessName: string
  contactName: string
  phone: string
  salesRep: { id: string; name: string } | null
  messages: Message[]
  unreadCount: number
  lastMessage: Message | null
}

export default function AdminMessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConversations()
  }, [showUnreadOnly])

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation?.messages])

  // Poll for new messages every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadConversations()
    }, 30000)
    return () => clearInterval(interval)
  }, [showUnreadOnly])

  const loadConversations = async () => {
    try {
      const params = new URLSearchParams()
      if (showUnreadOnly) params.set('unreadOnly', 'true')

      const res = await fetch(`/api/admin/messages?${params}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])

        // Update selected conversation if it exists
        if (selectedConversation) {
          const updated = data.conversations.find(
            (c: Conversation) => c.customerId === selectedConversation.customerId
          )
          if (updated) {
            setSelectedConversation(updated)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendReply = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/admin/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedConversation.customerId,
          message: newMessage.trim()
        })
      })

      if (res.ok) {
        setNewMessage('')
        // Reload to get the new message
        await loadConversations()
      }
    } catch (error) {
      console.error('Failed to send reply:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const totalUnread = conversations.reduce((sum, c) => sum + c.unreadCount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-120px)] flex">
      {/* Conversations List */}
      <div className={`w-full md:w-96 bg-slate-800/50 border-r border-slate-700 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
        {/* Header */}
        <div className="p-4 border-b border-slate-700">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold text-white">Messages</h1>
            {totalUnread > 0 && (
              <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                {totalUnread} unread
              </span>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-slate-400">
            <input
              type="checkbox"
              checked={showUnreadOnly}
              onChange={(e) => setShowUnreadOnly(e.target.checked)}
              className="rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500"
            />
            Show unread only
          </label>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-center">
              <span className="text-4xl mb-4 block">💬</span>
              <p className="text-slate-400">No messages yet</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.customerId}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-4 text-left border-b border-slate-700/50 hover:bg-slate-700/50 transition-colors ${
                  selectedConversation?.customerId === conv.customerId ? 'bg-slate-700/50' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold">
                      {conv.businessName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-white truncate">{conv.businessName}</h3>
                      {conv.lastMessage && (
                        <span className="text-xs text-slate-400 flex-shrink-0">
                          {formatTime(conv.lastMessage.createdAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-400 truncate">
                      {conv.lastMessage?.message || 'No messages'}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      {conv.salesRep && (
                        <span className="text-xs text-emerald-400">
                          Rep: {conv.salesRep.name}
                        </span>
                      )}
                      {conv.unreadCount > 0 && (
                        <span className="px-2 py-0.5 bg-emerald-500 text-white text-xs font-bold rounded-full">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat View */}
      <div className={`flex-1 flex flex-col bg-slate-900 ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 bg-slate-800 px-4 py-3 flex items-center gap-3 border-b border-slate-700">
              <button
                onClick={() => setSelectedConversation(null)}
                className="md:hidden p-2 hover:bg-slate-700 rounded-lg"
              >
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="w-10 h-10 bg-slate-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {selectedConversation.businessName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-white">{selectedConversation.businessName}</h2>
                <p className="text-xs text-slate-400">
                  {selectedConversation.contactName} • {selectedConversation.phone}
                </p>
              </div>
              <Link
                href={`/admin/customers?id=${selectedConversation.customerId}`}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                View Customer
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedConversation.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.isFromCustomer ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      msg.isFromCustomer
                        ? 'bg-slate-700 text-white rounded-bl-md'
                        : 'bg-emerald-600 text-white rounded-br-md'
                    }`}
                  >
                    {!msg.isFromCustomer && (
                      <p className="text-emerald-200 text-xs font-medium mb-1">
                        You
                      </p>
                    )}
                    <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                    <p className={`text-xs mt-1 ${msg.isFromCustomer ? 'text-slate-400' : 'text-emerald-200'}`}>
                      {formatTime(msg.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Input */}
            <div className="flex-shrink-0 bg-slate-800 p-3 border-t border-slate-700">
              <div className="flex items-end gap-2">
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      sendReply()
                    }
                  }}
                  placeholder="Type your reply..."
                  rows={1}
                  className="flex-1 bg-slate-700 text-white rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 max-h-32"
                  style={{ minHeight: '44px' }}
                />
                <button
                  onClick={sendReply}
                  disabled={!newMessage.trim() || sending}
                  className="w-11 h-11 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-colors"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <span className="text-6xl mb-4 block">💬</span>
              <h2 className="text-xl font-semibold text-white mb-2">Select a conversation</h2>
              <p className="text-slate-400">Choose a customer to view and reply to their messages</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

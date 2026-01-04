'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  MessageCircle,
  Send,
  ArrowLeft,
  Search,
  User,
  Check,
  CheckCheck,
  Clock,
  ChevronRight,
  Phone,
  Building2,
  Sparkles
} from 'lucide-react'

interface Conversation {
  customerId: string
  customerName: string
  contactName: string
  lastMessage: string
  lastMessageAt: string
  isFromCustomer: boolean
  unreadCount: number
}

interface Message {
  id: string
  message: string
  isFromCustomer: boolean
  isRead: boolean
  createdAt: string
}

interface Customer {
  id: string
  businessName: string
  contactName: string
  phone: string
}

export default function MessagesPage() {
  const searchParams = useSearchParams()
  const initialCustomerId = searchParams.get('customer')

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(initialCustomerId)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [unreadTotal, setUnreadTotal] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedCustomerId) {
      fetchMessages(selectedCustomerId)
    }
  }, [selectedCustomerId])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const fetchConversations = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/ana/messages')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
        setUnreadTotal(data.unreadTotal || 0)
      }
    } catch (error) {
      console.error('Error loading conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (customerId: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/ana/messages?customerId=${customerId}`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
        setSelectedCustomer(data.customer)
        // Update unread count in conversations
        setConversations(prev =>
          prev.map(c => c.customerId === customerId ? { ...c, unreadCount: 0 } : c)
        )
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoadingMessages(false)
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedCustomerId || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/ana/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          message: newMessage.trim()
        })
      })

      if (res.ok) {
        const data = await res.json()
        setMessages(prev => [...prev, data.message])
        setNewMessage('')
        // Update conversation list
        setConversations(prev => {
          const existing = prev.find(c => c.customerId === selectedCustomerId)
          if (existing) {
            return [
              { ...existing, lastMessage: newMessage.trim(), lastMessageAt: new Date().toISOString(), isFromCustomer: false },
              ...prev.filter(c => c.customerId !== selectedCustomerId)
            ]
          }
          return prev
        })
      }
    } catch (error) {
      console.error('Send message error:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    } else if (diffDays === 1) {
      return 'Ayer'
    } else if (diffDays < 7) {
      return date.toLocaleDateString('es-MX', { weekday: 'short' })
    } else {
      return date.toLocaleDateString('es-MX', { month: 'short', day: 'numeric' })
    }
  }

  const formatMessageTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
  }

  const filteredConversations = conversations.filter(c =>
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.contactName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-[calc(100vh-64px)] lg:h-screen flex">
      {/* Conversations List */}
      <div className={`${selectedCustomerId ? 'hidden lg:flex' : 'flex'} flex-col w-full lg:w-96 bg-white border-r border-gray-100`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-800">Mensajes</h1>
            {unreadTotal > 0 && (
              <span className="px-2.5 py-1 bg-rose-500 text-white text-sm font-bold rounded-full">
                {unreadTotal}
              </span>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar conversación..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
            />
          </div>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center">
              <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No hay conversaciones</p>
              <p className="text-gray-400 text-sm mt-1">Los mensajes de clientes aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {filteredConversations.map(conv => (
                <button
                  key={conv.customerId}
                  onClick={() => setSelectedCustomerId(conv.customerId)}
                  className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left ${
                    selectedCustomerId === conv.customerId ? 'bg-rose-50' : ''
                  }`}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {conv.customerName.charAt(0)}
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h3 className={`font-semibold text-gray-800 truncate ${conv.unreadCount > 0 ? 'font-bold' : ''}`}>
                        {conv.customerName}
                      </h3>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${conv.unreadCount > 0 ? 'text-gray-800 font-medium' : 'text-gray-500'}`}>
                      {conv.isFromCustomer ? '' : 'Tú: '}{conv.lastMessage}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`${selectedCustomerId ? 'flex' : 'hidden lg:flex'} flex-col flex-1 bg-gray-50`}>
        {selectedCustomerId && selectedCustomer ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-100 p-4 flex items-center gap-4">
              <button
                onClick={() => setSelectedCustomerId(null)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-xl"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                {selectedCustomer.businessName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-gray-800">{selectedCustomer.businessName}</h2>
                <p className="text-sm text-gray-500">{selectedCustomer.contactName}</p>
              </div>
              <Link
                href={`/ana/customers/${selectedCustomerId}`}
                className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700"
              >
                <Building2 className="w-5 h-5" />
              </Link>
              {selectedCustomer.phone && (
                <a
                  href={`tel:${selectedCustomer.phone}`}
                  className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-gray-700"
                >
                  <Phone className="w-5 h-5" />
                </a>
              )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <div className="w-8 h-8 border-4 border-rose-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-rose-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Inicia la conversación</h3>
                  <p className="text-gray-500 text-sm max-w-xs">
                    Envía un mensaje a {selectedCustomer.contactName} para comenzar
                  </p>
                </div>
              ) : (
                <>
                  {messages.map((msg, index) => {
                    const showDate = index === 0 ||
                      new Date(msg.createdAt).toDateString() !== new Date(messages[index - 1].createdAt).toDateString()

                    return (
                      <div key={msg.id}>
                        {showDate && (
                          <div className="flex items-center justify-center my-4">
                            <span className="px-3 py-1 bg-white rounded-full text-xs text-gray-500 shadow-sm">
                              {new Date(msg.createdAt).toLocaleDateString('es-MX', {
                                weekday: 'long',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${msg.isFromCustomer ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-[75%] ${
                            msg.isFromCustomer
                              ? 'bg-white rounded-2xl rounded-tl-md'
                              : 'bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-2xl rounded-tr-md'
                          } px-4 py-2.5 shadow-sm`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              msg.isFromCustomer ? 'text-gray-400' : 'text-white/70'
                            }`}>
                              <span className="text-xs">{formatMessageTime(msg.createdAt)}</span>
                              {!msg.isFromCustomer && (
                                msg.isRead
                                  ? <CheckCheck className="w-4 h-4" />
                                  : <Check className="w-4 h-4" />
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-100 p-4">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Escribe un mensaje..."
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                />
                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-24 h-24 bg-rose-100 rounded-full flex items-center justify-center mb-6">
              <MessageCircle className="w-12 h-12 text-rose-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">Mensajes con Clientes</h2>
            <p className="text-gray-500 max-w-sm">
              Selecciona una conversación para ver los mensajes o inicia una nueva desde la página del cliente
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

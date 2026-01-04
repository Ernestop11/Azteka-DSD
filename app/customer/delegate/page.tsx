'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Users, Link as LinkIcon, Copy, Check, ExternalLink,
  Building2, Send, Clock, Activity, ChevronLeft, Home,
  Store, Share2, Menu
} from 'lucide-react'

interface CustomerSession {
  token: string
  customerId: string
  businessName: string
  role: 'STANDARD' | 'OWNER' | 'MANAGER'
  expiresAt: string
}

interface StoreData {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
}

interface GeneratedLink {
  storeId: string
  storeName: string
  link: string
  type: 'HANDOFF' | 'INSTALL'
  createdAt: Date
}

export default function DelegatePage() {
  const router = useRouter()
  const [session, setSession] = useState<CustomerSession | null>(null)
  const [stores, setStores] = useState<StoreData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStore, setSelectedStore] = useState<string | null>(null)
  const [linkType, setLinkType] = useState<'HANDOFF' | 'INSTALL'>('HANDOFF')
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([])
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem('customerSession')
    if (!stored) {
      router.replace('/customer/login')
      return
    }

    const parsed = JSON.parse(stored) as CustomerSession
    if (parsed.role !== 'OWNER') {
      router.replace('/customer/dashboard')
      return
    }

    setSession(parsed)
    loadStores(parsed.customerId)
  }, [router])

  const loadStores = async (ownerId: string) => {
    try {
      const res = await fetch(`/api/customer/multi-store?ownerId=${ownerId}`)
      if (res.ok) {
        const data = await res.json()
        setStores(data.stores || [])
      }
    } catch (error) {
      console.error('Error loading stores:', error)
    } finally {
      setLoading(false)
    }
  }

  const getShortName = (businessName: string) => {
    const superiorMatch = businessName.match(/la\s*superior\s*#?(\d+)/i)
    if (superiorMatch) return `#${superiorMatch[1]}`
    const parts = businessName.split(' - ')
    return parts.length > 1 ? parts[parts.length - 1] : businessName
  }

  const generateLink = async () => {
    if (!selectedStore || !session) return

    const store = stores.find(s => s.id === selectedStore)
    if (!store) return

    setGenerating(true)
    try {
      const res = await fetch(`/api/rep/customer/${selectedStore}/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkPurpose: linkType,
          createdById: session.customerId,
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newLink: GeneratedLink = {
          storeId: selectedStore,
          storeName: store.businessName,
          link: data.magicLink,
          type: linkType,
          createdAt: new Date()
        }
        setGeneratedLinks(prev => [newLink, ...prev.filter(l => l.storeId !== selectedStore)])
      }
    } catch (error) {
      console.error('Error generating link:', error)
    } finally {
      setGenerating(false)
    }
  }

  const copyLink = async (link: string, storeId: string) => {
    await navigator.clipboard.writeText(link)
    setCopiedId(storeId)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const shareLink = async (link: string, storeName: string) => {
    if (navigator.share) {
      await navigator.share({
        title: `Order Link - ${storeName}`,
        text: `Use this link to place an order for ${storeName}`,
        url: link
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 pb-24">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="flex items-center gap-3">
          <Link
            href="/customer/multi-store"
            className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Share2 className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Delegate Orders</h1>
            <p className="text-slate-400 text-xs">Generate links for store managers</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Info Banner */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-blue-400 font-medium">Delegate Ordering Tasks</p>
              <p className="text-sm text-slate-400 mt-1">
                Generate secure links for store managers to place orders on behalf of their location.
              </p>
            </div>
          </div>
        </div>

        {/* Link Generator */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-emerald-400" />
            Generate Order Link
          </h3>

          {/* Store Selector */}
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">Select Store</label>
            <div className="grid grid-cols-3 gap-2">
              {stores.map((store) => (
                <button
                  key={store.id}
                  onClick={() => setSelectedStore(store.id)}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${
                    selectedStore === store.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {getShortName(store.businessName)}
                </button>
              ))}
            </div>
          </div>

          {/* Link Type Selector */}
          <div className="mb-4">
            <label className="text-sm text-slate-400 mb-2 block">Link Type</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setLinkType('HANDOFF')}
                className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                  linkType === 'HANDOFF'
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Activity className="w-4 h-4" />
                  <span>Handoff</span>
                </div>
                <p className="text-[10px] mt-1 opacity-75">One-time ordering session</p>
              </button>
              <button
                onClick={() => setLinkType('INSTALL')}
                className={`p-3 rounded-lg text-sm font-medium transition-all border ${
                  linkType === 'INSTALL'
                    ? 'bg-purple-600 text-white border-purple-500'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600 border-slate-600'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  <span>App Install</span>
                </div>
                <p className="text-[10px] mt-1 opacity-75">Full app setup + PIN</p>
              </button>
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={generateLink}
            disabled={!selectedStore || generating}
            className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              !selectedStore || generating
                ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                : 'bg-emerald-600 text-white hover:bg-emerald-500'
            }`}
          >
            {generating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <LinkIcon className="w-4 h-4" />
                Generate Link
              </>
            )}
          </button>
        </div>

        {/* Generated Links */}
        {generatedLinks.length > 0 && (
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-white font-medium mb-4">Generated Links</h3>
            <div className="space-y-3">
              {generatedLinks.map((link) => (
                <div
                  key={`${link.storeId}-${link.createdAt.getTime()}`}
                  className="bg-slate-700/50 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium text-sm">
                        {getShortName(link.storeName)}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] rounded-full font-medium ${
                        link.type === 'HANDOFF'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {link.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyLink(link.link, link.storeId)}
                        className="p-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                      >
                        {copiedId === link.storeId ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-slate-300" />
                        )}
                      </button>
                      <button
                        onClick={() => shareLink(link.link, link.storeName)}
                        className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                      >
                        <Send className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-slate-800 rounded px-3 py-2 text-xs text-slate-400 truncate">
                    {link.link}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Activity */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            Recent Link Activity
          </h3>
          <p className="text-slate-400 text-sm text-center py-4">
            No recent activity to show
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 z-40 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around py-2">
          <Link
            href="/customer/multi-store"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <Store className="w-6 h-6" />
            <span className="text-xs">Stores</span>
          </Link>

          <div className="flex flex-col items-center gap-1 px-4 py-2 text-emerald-400">
            <Share2 className="w-6 h-6" />
            <span className="text-xs">Delegate</span>
          </div>

          <Link
            href="/customer/managers"
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <Users className="w-6 h-6" />
            <span className="text-xs">Managers</span>
          </Link>

          <button
            onClick={() => {/* Open menu */}}
            className="flex flex-col items-center gap-1 px-4 py-2 text-slate-400"
          >
            <Menu className="w-6 h-6" />
            <span className="text-xs">Menu</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

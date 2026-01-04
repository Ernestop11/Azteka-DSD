'use client'

import { useState } from 'react'
import {
  Users, Link as LinkIcon, Copy, Check, ExternalLink,
  Building2, Send, Clock, Activity
} from 'lucide-react'

interface Store {
  id: string
  businessName: string
  contactName: string
  phone: string
  email: string
}

interface DelegationPanelProps {
  stores: Store[]
  ownerId: string
  preSelectedStoreId?: string | null
  preSelectedStoreName?: string | null
}

interface GeneratedLink {
  storeId: string
  storeName: string
  link: string
  type: 'HANDOFF' | 'INSTALL'
}

export default function DelegationPanel({ stores, ownerId, preSelectedStoreId, preSelectedStoreName }: DelegationPanelProps) {
  const [selectedStore, setSelectedStore] = useState<string | null>(preSelectedStoreId || null)
  const [linkType, setLinkType] = useState<'HANDOFF' | 'INSTALL'>('HANDOFF')
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([])
  const [generating, setGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const getShortName = (businessName: string) => {
    const parts = businessName.split(' - ')
    return parts.length > 1 ? parts[parts.length - 1] : businessName
  }

  const generateLink = async () => {
    if (!selectedStore) return

    const store = stores.find(s => s.id === selectedStore)
    if (!store) return

    setGenerating(true)
    try {
      const res = await fetch(`/api/rep/customer/${selectedStore}/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkPurpose: linkType,
          createdById: ownerId,
        })
      })

      if (res.ok) {
        const data = await res.json()
        const newLink: GeneratedLink = {
          storeId: selectedStore,
          storeName: store.businessName,
          link: data.magicLink, // API returns 'magicLink'
          type: linkType
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

  return (
    <div className="space-y-4">
      {/* Info Banner */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-blue-400 font-medium">Delegate Ordering Tasks</p>
            <p className="text-sm text-slate-400 mt-1">
              Generate secure links for store managers to place orders on behalf of their location.
              Track all activity in real-time.
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
                key={link.storeId}
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
  )
}

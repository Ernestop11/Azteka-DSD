'use client'

import { useState, useEffect } from 'react'
import {
  Link2, Smartphone, ShoppingCart, Share2, Copy, Check,
  Loader2, ChevronDown, Search, ExternalLink, BarChart3
} from 'lucide-react'

interface Customer {
  id: string
  businessName: string
  contactName: string
  phone: string
}

interface GeneratedLink {
  magicLink: string
  expiresAt: string
  linkPurpose: string
  customer: {
    id: string
    businessName: string
  }
}

interface LinkStats {
  customerId: string
  businessName: string
  totalLinks: number
  handoffLinks: number
  installLinks: number
  lastLinkDate: string | null
}

interface LinksTabProps {
  repId: string
  customers: Customer[]
}

export default function LinksTab({ repId, customers }: LinksTabProps) {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)
  const [generating, setGenerating] = useState<string | null>(null)
  const [generatedLink, setGeneratedLink] = useState<GeneratedLink | null>(null)
  const [copied, setCopied] = useState(false)
  const [recentLinks, setRecentLinks] = useState<LinkStats[]>([])
  const [loadingStats, setLoadingStats] = useState(false)

  // Filter customers by search
  const filteredCustomers = customers.filter(c =>
    c.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.contactName.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Load recent link stats
  useEffect(() => {
    loadRecentStats()
  }, [])

  const loadRecentStats = async () => {
    setLoadingStats(true)
    try {
      const res = await fetch('/api/rep/link-analytics/summary')
      if (res.ok) {
        const data = await res.json()
        setRecentLinks(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setLoadingStats(false)
    }
  }

  const generateLink = async (linkPurpose: 'HANDOFF' | 'INSTALL' | 'CATALOG_SHARE') => {
    if (!selectedCustomer) return

    setGenerating(linkPurpose)
    setGeneratedLink(null)

    try {
      const res = await fetch(`/api/rep/customer/${selectedCustomer.id}/generate-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          linkPurpose,
          createdById: repId
        })
      })

      if (res.ok) {
        const data = await res.json()
        setGeneratedLink(data)
      } else {
        const error = await res.json()
        alert(error.error || 'Failed to generate link')
      }
    } catch (error) {
      console.error('Generate link error:', error)
      alert('Failed to generate link')
    } finally {
      setGenerating(null)
    }
  }

  const copyLink = async () => {
    if (!generatedLink) return

    try {
      await navigator.clipboard.writeText(generatedLink.magicLink)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      alert('Failed to copy link')
    }
  }

  const shareLink = async () => {
    if (!generatedLink) return

    const shareText = getLinkShareText(generatedLink.linkPurpose)

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Azteka Order Link',
          text: shareText,
          url: generatedLink.magicLink
        })
      } catch {
        // User cancelled or share failed
        copyLink()
      }
    } else {
      copyLink()
    }
  }

  const getLinkShareText = (purpose: string) => {
    switch (purpose) {
      case 'HANDOFF':
        return 'Here is your ordering link. Browse our catalog and place your order!'
      case 'INSTALL':
        return 'Install our app and set up your account for easy ordering!'
      case 'CATALOG_SHARE':
        return 'Check out our catalog and place an order!'
      default:
        return 'Here is your link to order with Azteka.'
    }
  }

  const getLinkTypeInfo = (purpose: string) => {
    switch (purpose) {
      case 'HANDOFF':
        return {
          icon: ShoppingCart,
          label: 'Handoff Link',
          description: 'Customer browses catalog with their favorites in menu',
          color: 'emerald'
        }
      case 'INSTALL':
        return {
          icon: Smartphone,
          label: 'App Install Link',
          description: 'Onboarding flow: install app + set PIN',
          color: 'blue'
        }
      case 'CATALOG_SHARE':
        return {
          icon: Link2,
          label: 'Catalog Link',
          description: 'Direct access to catalog',
          color: 'purple'
        }
      default:
        return {
          icon: Link2,
          label: 'Link',
          description: '',
          color: 'slate'
        }
    }
  }

  return (
    <div className="p-4 space-y-6">
      {/* Customer Selection */}
      <div className="bg-slate-800 rounded-xl p-4">
        <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
          <Link2 className="w-5 h-5 text-emerald-400" />
          Generate Customer Link
        </h3>

        {/* Customer Dropdown */}
        <div className="relative mb-4">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-xl text-left flex items-center justify-between"
          >
            <span className={selectedCustomer ? 'text-white' : 'text-slate-400'}>
              {selectedCustomer ? selectedCustomer.businessName : 'Select a customer...'}
            </span>
            <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </button>

          {showDropdown && (
            <div className="absolute z-20 w-full mt-2 bg-slate-700 border border-slate-600 rounded-xl shadow-xl max-h-60 overflow-hidden">
              <div className="p-2 border-b border-slate-600">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search customers..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white placeholder-slate-400 text-sm"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {filteredCustomers.length === 0 ? (
                  <p className="p-3 text-sm text-slate-400 text-center">No customers found</p>
                ) : (
                  filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowDropdown(false)
                        setSearchQuery('')
                        setGeneratedLink(null)
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-600 transition-colors"
                    >
                      <p className="text-white font-medium">{customer.businessName}</p>
                      <p className="text-sm text-slate-400">{customer.contactName}</p>
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Link Type Buttons */}
        {selectedCustomer && (
          <div className="grid grid-cols-1 gap-3">
            {/* Handoff Link */}
            <button
              onClick={() => generateLink('HANDOFF')}
              disabled={generating !== null}
              className="flex items-center gap-3 p-4 bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-emerald-500/30 rounded-lg flex items-center justify-center">
                {generating === 'HANDOFF' ? (
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                ) : (
                  <ShoppingCart className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Handoff Link</p>
                <p className="text-sm text-slate-400">Customer browses catalog (favorites in menu)</p>
              </div>
            </button>

            {/* App Install Link */}
            <button
              onClick={() => generateLink('INSTALL')}
              disabled={generating !== null}
              className="flex items-center gap-3 p-4 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-blue-500/30 rounded-lg flex items-center justify-center">
                {generating === 'INSTALL' ? (
                  <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                ) : (
                  <Smartphone className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">App Install Link</p>
                <p className="text-sm text-slate-400">Setup flow: install app + create PIN</p>
              </div>
            </button>

            {/* Catalog Share Link */}
            <button
              onClick={() => generateLink('CATALOG_SHARE')}
              disabled={generating !== null}
              className="flex items-center gap-3 p-4 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/30 rounded-xl transition-colors disabled:opacity-50"
            >
              <div className="w-10 h-10 bg-purple-500/30 rounded-lg flex items-center justify-center">
                {generating === 'CATALOG_SHARE' ? (
                  <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
                ) : (
                  <Link2 className="w-5 h-5 text-purple-400" />
                )}
              </div>
              <div className="text-left">
                <p className="text-white font-medium">Catalog Link</p>
                <p className="text-sm text-slate-400">Direct access to browse and order</p>
              </div>
            </button>
          </div>
        )}

        {/* Generated Link Display */}
        {generatedLink && (
          <div className="mt-4 p-4 bg-slate-700 rounded-xl border border-emerald-500/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {(() => {
                  const info = getLinkTypeInfo(generatedLink.linkPurpose)
                  const Icon = info.icon
                  return (
                    <>
                      <Icon className={`w-5 h-5 text-${info.color}-400`} />
                      <span className="text-white font-medium">{info.label}</span>
                    </>
                  )
                })()}
              </div>
              <span className="text-xs text-slate-400">
                Expires in 12 hours
              </span>
            </div>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                readOnly
                value={generatedLink.magicLink}
                className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded-lg text-white text-sm"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors"
                title="Copy link"
              >
                {copied ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Copy className="w-5 h-5 text-slate-300" />
                )}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={shareLink}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                Share Link
              </button>
              <a
                href={generatedLink.magicLink}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-3 bg-slate-600 hover:bg-slate-500 text-white rounded-lg flex items-center justify-center transition-colors"
                title="Preview link"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Analytics Preview */}
      <div className="bg-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Link Activity
          </h3>
          <a
            href="/rep/analytics"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            View All
          </a>
        </div>

        {loadingStats ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
          </div>
        ) : recentLinks.length === 0 ? (
          <p className="text-slate-400 text-center py-8">
            No link activity yet. Generate links above to get started!
          </p>
        ) : (
          <div className="space-y-2">
            {recentLinks.slice(0, 5).map((stat) => (
              <div
                key={stat.customerId}
                className="flex items-center justify-between p-3 bg-slate-700/50 rounded-lg"
              >
                <div>
                  <p className="text-white font-medium">{stat.businessName}</p>
                  <p className="text-sm text-slate-400">
                    {stat.totalLinks} link{stat.totalLinks !== 1 ? 's' : ''} generated
                  </p>
                </div>
                <div className="flex gap-2">
                  {stat.handoffLinks > 0 && (
                    <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                      {stat.handoffLinks} handoff
                    </span>
                  )}
                  {stat.installLinks > 0 && (
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                      {stat.installLinks} install
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

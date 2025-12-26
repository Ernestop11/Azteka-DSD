'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface RewardTier {
  id: string
  name: string
  minSpend: number
  color: string
  multiplier: number
  position: number
  active: boolean
}

interface RewardPrize {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  pointsCost: number
  stock: number
  active: boolean
}

interface TradeOffDeal {
  id: string
  name: string
  description: string | null
  rewardProductId: string | null
  rewardBrandId: string | null
  rewardPrice: number
  rewardMaxQty: number
  requirementType: string
  minSpend: number
  excludeBrandId: string | null
  excludeCategoryId: string | null
  active: boolean
}

export default function RewardsBuilder() {
  const queryClient = useQueryClient()
  const [selectedSection, setSelectedSection] = useState<'tiers' | 'rewards' | 'tradeoffs'>('tiers')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingItem, setEditingItem] = useState<RewardTier | RewardPrize | TradeOffDeal | null>(null)

  // Form state for new items
  const [newTier, setNewTier] = useState({ name: '', minSpend: 0, color: '#6b7280', multiplier: 1 })
  const [newPrize, setNewPrize] = useState({ name: '', description: '', pointsCost: 100, stock: 10 })
  const [newDeal, setNewDeal] = useState({
    name: '',
    description: '',
    rewardPrice: 0,
    rewardMaxQty: 1,
    requirementType: 'MIN_ORDER',
    minSpend: 0,
  })

  // Fetch tiers
  const { data: tiers = [], isLoading: tiersLoading } = useQuery<RewardTier[]>({
    queryKey: ['reward-tiers'],
    queryFn: async () => {
      const res = await fetch('/api/builder/rewards/tiers')
      const json = await res.json()
      return json.data || []
    },
  })

  // Fetch prizes
  const { data: prizes = [], isLoading: prizesLoading } = useQuery<RewardPrize[]>({
    queryKey: ['reward-prizes'],
    queryFn: async () => {
      const res = await fetch('/api/builder/rewards/prizes')
      const json = await res.json()
      return json.data || []
    },
  })

  // Fetch trade-off deals
  const { data: tradeoffs = [], isLoading: tradeoffsLoading } = useQuery<TradeOffDeal[]>({
    queryKey: ['tradeoff-deals'],
    queryFn: async () => {
      const res = await fetch('/api/builder/rewards/tradeoffs')
      const json = await res.json()
      return json.data || []
    },
  })

  // Tier mutations
  const createTierMutation = useMutation({
    mutationFn: async (data: typeof newTier) => {
      const res = await fetch('/api/builder/rewards/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers'] })
      setShowAddModal(false)
      setNewTier({ name: '', minSpend: 0, color: '#6b7280', multiplier: 1 })
    },
  })

  const updateTierMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RewardTier> & { id: string }) => {
      const res = await fetch(`/api/builder/rewards/tiers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers'] })
      setEditingItem(null)
    },
  })

  const deleteTierMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/builder/rewards/tiers/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-tiers'] })
    },
  })

  // Prize mutations
  const createPrizeMutation = useMutation({
    mutationFn: async (data: typeof newPrize) => {
      const res = await fetch('/api/builder/rewards/prizes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-prizes'] })
      setShowAddModal(false)
      setNewPrize({ name: '', description: '', pointsCost: 100, stock: 10 })
    },
  })

  const updatePrizeMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<RewardPrize> & { id: string }) => {
      const res = await fetch(`/api/builder/rewards/prizes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-prizes'] })
      setEditingItem(null)
    },
  })

  const deletePrizeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/builder/rewards/prizes/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reward-prizes'] })
    },
  })

  // Trade-off mutations
  const createDealMutation = useMutation({
    mutationFn: async (data: typeof newDeal) => {
      const res = await fetch('/api/builder/rewards/tradeoffs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeoff-deals'] })
      setShowAddModal(false)
      setNewDeal({ name: '', description: '', rewardPrice: 0, rewardMaxQty: 1, requirementType: 'MIN_ORDER', minSpend: 0 })
    },
  })

  const updateDealMutation = useMutation({
    mutationFn: async ({ id, ...data }: Partial<TradeOffDeal> & { id: string }) => {
      const res = await fetch(`/api/builder/rewards/tradeoffs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeoff-deals'] })
      setEditingItem(null)
    },
  })

  const deleteDealMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/builder/rewards/tradeoffs/${id}`, { method: 'DELETE' })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tradeoff-deals'] })
    },
  })

  const isLoading = tiersLoading || prizesLoading || tradeoffsLoading

  return (
    <div className="flex min-h-[calc(100vh-130px)]">
      {/* Sidebar */}
      <div className="w-72 bg-slate-900 border-r border-slate-800 p-4">
        <h2 className="text-lg font-semibold mb-4 text-slate-200">Rewards Program</h2>

        <div className="space-y-2">
          <button
            onClick={() => setSelectedSection('tiers')}
            className={`w-full p-3 rounded-lg text-left flex items-center justify-between ${
              selectedSection === 'tiers' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🏆</span>
              <span className="font-medium">Reward Tiers</span>
            </div>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{tiers.length}</span>
          </button>
          <button
            onClick={() => setSelectedSection('rewards')}
            className={`w-full p-3 rounded-lg text-left flex items-center justify-between ${
              selectedSection === 'rewards' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>🎁</span>
              <span className="font-medium">Free Rewards</span>
            </div>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{prizes.length}</span>
          </button>
          <button
            onClick={() => setSelectedSection('tradeoffs')}
            className={`w-full p-3 rounded-lg text-left flex items-center justify-between ${
              selectedSection === 'tradeoffs' ? 'bg-blue-600' : 'bg-slate-800 hover:bg-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>💰</span>
              <span className="font-medium">Trade-Off Deals</span>
            </div>
            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{tradeoffs.length}</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-slate-400">Loading...</div>
          </div>
        ) : (
          <>
            {/* TIERS */}
            {selectedSection === 'tiers' && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Reward Tiers</h3>
                    <p className="text-slate-400 text-sm">Configure customer loyalty tiers based on spending</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                  >
                    + Add Tier
                  </button>
                </div>

                <div className="space-y-4">
                  {tiers.sort((a, b) => a.minSpend - b.minSpend).map(tier => (
                    <div
                      key={tier.id}
                      className="p-4 bg-slate-800 rounded-lg"
                      style={{ borderLeft: `4px solid ${tier.color}` }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full" style={{ background: tier.color }} />
                          <span className="font-bold">{tier.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-400">{tier.multiplier}x points</span>
                          <button
                            onClick={() => deleteTierMutation.mutate(tier.id)}
                            className="p-1 hover:bg-slate-700 rounded text-red-400"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-slate-400">
                        Min spend: ${tier.minSpend.toLocaleString()}/month
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PRIZES */}
            {selectedSection === 'rewards' && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Free Rewards</h3>
                    <p className="text-slate-400 text-sm">Domino's-style rewards customers can redeem with points</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                  >
                    + Add Reward
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {prizes.map(prize => (
                    <div key={prize.id} className="p-4 bg-slate-800 rounded-lg relative group">
                      <button
                        onClick={() => deletePrizeMutation.mutate(prize.id)}
                        className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="w-full h-20 bg-slate-700 rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-3xl">🎁</span>
                      </div>
                      <h4 className="font-semibold">{prize.name}</h4>
                      <p className="text-sm text-amber-400">{prize.pointsCost} points</p>
                      <p className="text-xs text-slate-500">{prize.stock} in stock</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TRADE-OFFS */}
            {selectedSection === 'tradeoffs' && (
              <div className="max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold">Trade-Off Deals</h3>
                    <p className="text-slate-400 text-sm">Special pricing for customers who meet conditions</p>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium"
                  >
                    + Create Deal
                  </button>
                </div>

                <div className="space-y-4">
                  {tradeoffs.map(deal => (
                    <div key={deal.id} className="bg-slate-800 rounded-lg p-4 relative group">
                      <button
                        onClick={() => deleteDealMutation.mutate(deal.id)}
                        className="absolute top-2 right-2 p-1 bg-slate-700 hover:bg-red-600 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-2xl">💰</span>
                        <div>
                          <h4 className="font-bold">{deal.name}</h4>
                          <p className="text-sm text-slate-400">{deal.description}</p>
                        </div>
                      </div>
                      <div className="bg-slate-700/50 rounded p-3 text-sm">
                        <p className="text-slate-300">Requirement: ${deal.minSpend.toLocaleString()} ({deal.requirementType})</p>
                        <p className="text-green-400 mt-1">Reward: {deal.rewardMaxQty} units at ${deal.rewardPrice}/each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowAddModal(false)}>
          <div className="bg-slate-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl ring-1 ring-slate-800" onClick={(e) => e.stopPropagation()}>
            <div className="bg-slate-800 px-6 py-4 border-b border-slate-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">
                  {selectedSection === 'tiers' ? 'Add Reward Tier' :
                   selectedSection === 'rewards' ? 'Add Free Reward' :
                   'Create Trade-Off Deal'}
                </h2>
                <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white text-2xl">×</button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Tier Form */}
              {selectedSection === 'tiers' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Tier Name</label>
                    <input
                      type="text"
                      value={newTier.name}
                      onChange={(e) => setNewTier({ ...newTier, name: e.target.value })}
                      className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      placeholder="e.g., Gold, Platinum"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Spend ($/month)</label>
                      <input
                        type="number"
                        value={newTier.minSpend}
                        onChange={(e) => setNewTier({ ...newTier, minSpend: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Points Multiplier</label>
                      <input
                        type="number"
                        step="0.25"
                        value={newTier.multiplier}
                        onChange={(e) => setNewTier({ ...newTier, multiplier: parseFloat(e.target.value) || 1 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Color</label>
                    <input
                      type="color"
                      value={newTier.color}
                      onChange={(e) => setNewTier({ ...newTier, color: e.target.value })}
                      className="w-16 h-10 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Prize Form */}
              {selectedSection === 'rewards' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Reward Name</label>
                    <input
                      type="text"
                      value={newPrize.name}
                      onChange={(e) => setNewPrize({ ...newPrize, name: e.target.value })}
                      className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      placeholder="e.g., Free Case of Takis"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newPrize.description}
                      onChange={(e) => setNewPrize({ ...newPrize, description: e.target.value })}
                      className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Points Cost</label>
                      <input
                        type="number"
                        value={newPrize.pointsCost}
                        onChange={(e) => setNewPrize({ ...newPrize, pointsCost: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Stock</label>
                      <input
                        type="number"
                        value={newPrize.stock}
                        onChange={(e) => setNewPrize({ ...newPrize, stock: parseInt(e.target.value) || 0 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Trade-off Form */}
              {selectedSection === 'tradeoffs' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Deal Name</label>
                    <input
                      type="text"
                      value={newDeal.name}
                      onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                      className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      placeholder="e.g., Electrolit at Cost"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newDeal.description}
                      onChange={(e) => setNewDeal({ ...newDeal, description: e.target.value })}
                      className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      rows={2}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Min Spend Requirement</label>
                      <input
                        type="number"
                        value={newDeal.minSpend}
                        onChange={(e) => setNewDeal({ ...newDeal, minSpend: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Requirement Type</label>
                      <select
                        value={newDeal.requirementType}
                        onChange={(e) => setNewDeal({ ...newDeal, requirementType: e.target.value })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      >
                        <option value="MIN_ORDER">Min Order Total</option>
                        <option value="MIN_AVERAGE">Min Average Order</option>
                        <option value="EXCLUDE_BRAND">Excluding Brand</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Reward Price</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newDeal.rewardPrice}
                        onChange={(e) => setNewDeal({ ...newDeal, rewardPrice: parseFloat(e.target.value) || 0 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Max Quantity</label>
                      <input
                        type="number"
                        value={newDeal.rewardMaxQty}
                        onChange={(e) => setNewDeal({ ...newDeal, rewardMaxQty: parseInt(e.target.value) || 1 })}
                        className="w-full bg-slate-800 rounded-lg p-3 text-sm"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="bg-slate-800 px-6 py-4 border-t border-slate-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedSection === 'tiers') {
                    createTierMutation.mutate(newTier)
                  } else if (selectedSection === 'rewards') {
                    createPrizeMutation.mutate(newPrize)
                  } else {
                    createDealMutation.mutate(newDeal)
                  }
                }}
                disabled={createTierMutation.isPending || createPrizeMutation.isPending || createDealMutation.isPending}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {(createTierMutation.isPending || createPrizeMutation.isPending || createDealMutation.isPending) ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

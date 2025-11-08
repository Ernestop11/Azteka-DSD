import { Trophy, Star, Award, Crown, Heart, Sparkles } from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_type: string;
  color: string;
  reward_description: string;
  earned?: boolean;
}

interface RewardsPanelProps {
  pointsBalance: number;
  tier: string;
  badges: Badge[];
  onClose: () => void;
}

const badgeIcons: Record<string, any> = {
  star: Star,
  award: Award,
  trophy: Trophy,
  crown: Crown,
  heart: Heart,
};

const tierInfo: Record<string, { color: string; icon: any; nextTier: string; pointsNeeded: number }> = {
  bronze: { color: '#CD7F32', icon: Award, nextTier: 'Silver', pointsNeeded: 2000 },
  silver: { color: '#C0C0C0', icon: Award, nextTier: 'Gold', pointsNeeded: 5000 },
  gold: { color: '#FFD700', icon: Trophy, nextTier: 'Platinum', pointsNeeded: 10000 },
};

export default function RewardsPanel({ pointsBalance, tier, badges, onClose }: RewardsPanelProps) {
  const currentTier = tierInfo[tier.toLowerCase()] || tierInfo.bronze;
  const TierIcon = currentTier.icon;
  const progress = (pointsBalance / currentTier.pointsNeeded) * 100;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-gradient-to-br from-purple-600 to-pink-600 shadow-2xl flex flex-col text-white overflow-y-auto">
        <div className="p-6 border-b border-white/20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black">Rewards Program</h2>
            <button onClick={onClose} className="text-white hover:text-white/70">
              ✕
            </button>
          </div>

          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-white/80">Current Tier</p>
                <div className="flex items-center gap-2">
                  <TierIcon size={24} style={{ color: currentTier.color }} />
                  <p className="text-2xl font-black capitalize">{tier}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80">Points Balance</p>
                <p className="text-3xl font-black">{pointsBalance}</p>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-bold">Progress to {currentTier.nextTier}</p>
                <p className="text-sm font-bold">{Math.min(progress, 100).toFixed(0)}%</p>
              </div>
              <div className="w-full h-3 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 transition-all duration-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-xs text-white/80 mt-2">
                {currentTier.pointsNeeded - pointsBalance > 0
                  ? `${currentTier.pointsNeeded - pointsBalance} points to ${currentTier.nextTier}`
                  : 'Max tier reached!'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div>
            <h3 className="text-xl font-black mb-4 flex items-center gap-2">
              <Sparkles size={20} />
              Your Badges
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {badges.map((badge) => {
                const BadgeIcon = badgeIcons[badge.icon_type] || Star;
                return (
                  <div
                    key={badge.id}
                    className={`rounded-xl p-4 border-2 transition-all ${
                      badge.earned
                        ? 'bg-white/20 border-white/30'
                        : 'bg-white/5 border-white/10 opacity-50'
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-2 mx-auto"
                      style={{ backgroundColor: badge.earned ? badge.color : '#666' }}
                    >
                      <BadgeIcon size={24} className="text-white" />
                    </div>
                    <h4 className="font-black text-sm text-center mb-1">{badge.name}</h4>
                    <p className="text-xs text-white/80 text-center">{badge.description}</p>
                    {badge.earned && (
                      <div className="mt-2 px-2 py-1 bg-green-500 rounded-full text-xs font-bold text-center">
                        Earned!
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-lg font-black mb-3">How to Earn Points</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>100 points per $100 spent</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Bonus points on featured products</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>2X points during special promotions</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                <span>Unlock badges for extra rewards</span>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-6 text-gray-900">
            <h3 className="text-xl font-black mb-2">Redeem Your Points</h3>
            <p className="text-sm font-bold mb-4">Get FREE products and exclusive discounts!</p>
            <button className="w-full py-3 bg-white text-gray-900 font-black rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
              View Rewards Catalog
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

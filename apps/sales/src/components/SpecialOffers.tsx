import { Zap, Sparkles, Trophy, Truck, Clock } from 'lucide-react';

interface SpecialOffer {
  id: string;
  title: string;
  description: string;
  badge_text: string;
  badge_color: string;
  icon_type: string;
  expires_at: string;
}

interface SpecialOffersProps {
  offers: SpecialOffer[];
}

const offerIcons: Record<string, any> = {
  zap: Zap,
  sparkles: Sparkles,
  trophy: Trophy,
  truck: Truck,
};

export default function SpecialOffers({ offers }: SpecialOffersProps) {
  if (offers.length === 0) return null;

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date().getTime();
    const expiry = new Date(expiresAt).getTime();
    const diff = expiry - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h left`;
    return 'Ending soon!';
  };

  return (
    <div className="mb-16">
      <div className="mb-6">
        <h2 className="text-4xl font-black text-gray-900 mb-2 flex items-center gap-3">
          <Zap className="text-orange-500 fill-orange-500" size={36} />
          Special Offers
        </h2>
        <p className="text-gray-600 text-lg">Limited time deals - don't miss out!</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {offers.map((offer) => {
          const Icon = offerIcons[offer.icon_type] || Sparkles;

          return (
            <div
              key={offer.id}
              className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group cursor-pointer"
              style={{ backgroundColor: offer.badge_color }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-md rounded-xl flex items-center justify-center">
                    <Icon size={24} />
                  </div>
                  <div className="flex items-center gap-1 px-3 py-1 bg-white/30 backdrop-blur-md rounded-full text-xs font-black">
                    <Clock size={12} />
                    {getTimeRemaining(offer.expires_at)}
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="text-2xl font-black leading-tight">{offer.title}</h3>
                  <p className="text-sm text-white/90 leading-relaxed">{offer.description}</p>
                </div>

                <div className="mt-4 px-4 py-2 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 text-center">
                  <p className="text-sm font-black">{offer.badge_text}</p>
                </div>
              </div>

              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

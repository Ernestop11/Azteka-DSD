import { Store, ShoppingBag, Fuel, Layers } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

type Mode = 'mexican' | 'convenience' | 'gas' | 'hybrid';

interface ModeSelectorProps {
  mode: string;
  onModeChange: (mode: Mode) => void;
}

export default function ModeSelector({ mode, onModeChange }: ModeSelectorProps) {
  const { t } = useLanguage();

  const modes: { value: Mode; icon: any; label: string }[] = [
    { value: 'mexican', icon: Store, label: t('salesrep.mode.mexican') },
    { value: 'convenience', icon: ShoppingBag, label: t('salesrep.mode.convenience') },
    { value: 'gas', icon: Fuel, label: t('salesrep.mode.gas') },
    { value: 'hybrid', icon: Layers, label: t('salesrep.mode.hybrid') },
  ];

  return (
    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
      {modes.map((m) => {
        const Icon = m.icon;
        return (
          <button
            key={m.value}
            onClick={() => onModeChange(m.value)}
            className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold transition-all ${
              mode === m.value
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon size={16} />
            <span className="hidden sm:inline">{m.label}</span>
          </button>
        );
      })}
    </div>
  );
}


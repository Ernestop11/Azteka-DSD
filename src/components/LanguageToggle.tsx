import { Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <button
      onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors font-semibold text-gray-700"
      aria-label="Toggle language"
    >
      <Globe size={18} />
      <span className="uppercase">{language === 'en' ? 'ES' : 'EN'}</span>
    </button>
  );
}


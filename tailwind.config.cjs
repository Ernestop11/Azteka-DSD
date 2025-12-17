/** @type {import('tailwindcss').Config} */
module.exports = {
  safelist: [
    'bg-flowing-holiday',
    'bg-gold-foil',
    'bg-holiday-red',
    'bg-festival-green',
    'bg-posada-stars',
    'glossy-card-surface',
    'shine-sweep',
    'product-pop-hover',
    'festive-icon-scatter',
    // Alessa theme colors - critical for catalog UI
    'bg-alessa-dark',
    'bg-alessa-card',
    'bg-alessa-card-hover',
    'bg-alessa-border',
    'bg-alessa-border-hover',
    'bg-alessa-input',
    'bg-alessa-gold',
    'bg-alessa-gold-hover',
    'text-alessa-gold',
    'border-alessa-dark',
    'border-alessa-card',
    'border-alessa-border',
    'border-alessa-border-hover',
    // Arbitrary value fallbacks
    { pattern: /bg-\[#[0-9a-fA-F]+\]/ },
    { pattern: /text-\[#[0-9a-fA-F]+\]/ },
    { pattern: /border-\[#[0-9a-fA-F]+\]/ },
    { pattern: /from-\[#[0-9a-fA-F]+\]/ },
    { pattern: /via-\[#[0-9a-fA-F]+\]/ },
    { pattern: /to-\[#[0-9a-fA-F]+\]/ },
  ],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './modules/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        tablet: '768px',
        tabletWide: '912px',
        laptop: '1024px',
        desktop: '1440px',
      },
      colors: {
        azteka: {
          ember: '#FF6B00',
          hibiscus: '#FF2D55',
          gold: '#F4CE6A',
          neon: '#16FFBD',
          midnight: '#05060A',
        },
        // Alessa theme colors - named for consistent use
        alessa: {
          dark: '#1a2e1a',
          card: '#1e3a1e',
          'card-hover': '#243424',
          border: '#2d4a2d',
          'border-hover': '#4a6a4a',
          input: '#243424',
          gold: '#d4a853',
          'gold-hover': '#c49843',
        },
      },
      backgroundImage: {
        'hero-grid':
          'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.15), transparent 55%), radial-gradient(circle at 80% 0%, rgba(255,255,255,0.12), transparent 45%), linear-gradient(120deg, rgba(15,23,42,0.35), rgba(2,6,23,0.65))',
        'glass-gradient':
          'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.05) 100%)',
        'gold-foil':
          'radial-gradient(circle at 20% 20%, rgba(255, 247, 209, 0.9), rgba(248, 205, 116, 0.8), rgba(194, 145, 68, 0.95))',
        'holiday-red':
          'linear-gradient(135deg, #9b0000 0%, #d90429 45%, #ff4d6d 100%)',
        'festival-green':
          'linear-gradient(135deg, #057a55 0%, #06d6a0 45%, #ffe066 100%)',
        'promo-blue':
          'linear-gradient(135deg, #060C47 0%, #142F7A 40%, #2EC8FF 100%)',
        'posada-stars':
          'radial-gradient(circle at 10% 20%, rgba(255,255,255,0.35) 2px, transparent 3px), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.22) 1.5px, transparent 3px), radial-gradient(circle at 50% 80%, rgba(255,255,255,0.3) 1.5px, transparent 3px)',
        'retail-orange':
          'linear-gradient(120deg, #ff7c02 0%, #ff3c00 48%, #ff9a3c 100%)',
        'catalog-blue':
          'linear-gradient(135deg, #051937 0%, #032c6d 45%, #1c64f2 100%)',
        'holiday-red-deep':
          'linear-gradient(135deg, #3d0000 0%, #7a0400 35%, #d7263d 90%)',
        'foil-green':
          'linear-gradient(145deg, #0b3d20 0%, #1f8a5c 40%, #9ef01a 100%)',
        'posada-purple':
          'linear-gradient(135deg, #2a0e61 0%, #6c1bb0 45%, #f72585 100%)',
        'latin-fiesta':
          'linear-gradient(115deg, #f72585 0%, #ffb703 35%, #06d6a0 70%, #118ab2 100%)',
        'latin-catalog':
          'linear-gradient(135deg, #ff7a18 0%, #af002d 45%, #319197 100%)',
        'gradient-radial-spotlight':
          'radial-gradient(circle at 35% 20%, rgba(255,255,255,0.8), rgba(16,24,39,0.1) 45%, rgba(4,7,14,0.95) 80%)',
        'summer-splash':
          'linear-gradient(130deg, #00c6ff 0%, #0072ff 40%, #ffe066 78%, #ff5f6d 100%)',
      },
      boxShadow: {
        'neon-tag': '0 0 25px rgba(22, 255, 189, 0.65)',
        'hero-ambient': '0 25px 80px rgba(5, 6, 10, 0.45)',
        'glow-soft': '0 25px 65px rgba(255, 255, 255, 0.25)',
        'glow-hard': '0 15px 45px rgba(250, 204, 21, 0.55)',
        'glow-edge': '0 0 0 2px rgba(255, 255, 255, 0.35), 0 15px 45px rgba(244, 63, 94, 0.35)',
      },
      keyframes: {
        kenburns: {
          '0%': { transform: 'scale(1) translate3d(0, 0, 0)' },
          '100%': { transform: 'scale(1.15) translate3d(-3%, -2%, 0)' },
        },
        sparkleDrift: {
          '0%': { transform: 'translate3d(-10%, -10%, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(5%, 5%, 0) rotate(2deg)' },
          '100%': { transform: 'translate3d(-10%, -5%, 0) rotate(-2deg)' },
        },
        glossPulse: {
          '0%': { opacity: 0.15, transform: 'translateX(-15%)' },
          '50%': { opacity: 0.75, transform: 'translateX(15%)' },
          '100%': { opacity: 0.15, transform: 'translateX(-15%)' },
        },
        borderGlow: {
          '0%': { filter: 'hue-rotate(0deg)' },
          '100%': { filter: 'hue-rotate(360deg)' },
        },
        rewardPulse: {
          '0%': { transform: 'scale(0.95)', boxShadow: '0 0 0 rgba(250, 204, 21, 0.6)' },
          '70%': { transform: 'scale(1)', boxShadow: '0 0 25px rgba(250, 204, 21, 0)' },
          '100%': { transform: 'scale(0.95)', boxShadow: '0 0 0 rgba(250, 204, 21, 0)' },
        },
        shineSweep: {
          '0%': { transform: 'translateX(-120%) skewX(-12deg)', opacity: 0 },
          '40%': { opacity: 0.9 },
          '70%': { transform: 'translateX(120%) skewX(-12deg)', opacity: 0.4 },
          '100%': { opacity: 0 },
        },
        retailBounce: {
          '0%': { transform: 'translateY(0)' },
          '45%': { transform: 'translateY(-6px)' },
          '70%': { transform: 'translateY(0)' },
          '85%': { transform: 'translateY(-2px)' },
          '100%': { transform: 'translateY(0)' },
        },
        snowfall: {
          '0%': { transform: 'translateY(-10%) translateX(0)', opacity: 0 },
          '25%': { opacity: 0.6 },
          '50%': { transform: 'translateY(35%) translateX(8%)' },
          '100%': { transform: 'translateY(120%) translateX(-6%)', opacity: 0 },
        },
        confettiFloat: {
          '0%': { transform: 'translate3d(0, -20%, 0) rotate(0deg)' },
          '50%': { transform: 'translate3d(-10%, 10%, 0) rotate(180deg)' },
          '100%': { transform: 'translate3d(10%, 120%, 0) rotate(360deg)' },
        },
        snowDrift: {
          '0%': { transform: 'translateY(-15%) translateX(-5%)', opacity: 0.2 },
          '50%': { opacity: 0.85 },
          '100%': { transform: 'translateY(105%) translateX(5%)', opacity: 0 },
        },
        sparkleTwinkle: {
          '0%': { opacity: 0.3, transform: 'scale(0.8)' },
          '50%': { opacity: 1, transform: 'scale(1.05)' },
          '100%': { opacity: 0.3, transform: 'scale(0.9)' },
        },
        stringGlow: {
          '0%': { opacity: 0.6, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 14px rgba(255,255,255,0.9))' },
          '100%': { opacity: 0.6, filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.6))' },
        },
        neonPulse: {
          '0%': { opacity: 0.7, filter: 'drop-shadow(0 0 10px rgba(72, 187, 255, 0.6))' },
          '50%': { opacity: 1, filter: 'drop-shadow(0 0 20px rgba(72, 187, 255, 0.9))' },
          '100%': { opacity: 0.7, filter: 'drop-shadow(0 0 10px rgba(72, 187, 255, 0.6))' },
        },
      },
      animation: {
        slideIn: 'slideIn 0.3s ease-out',
        kenburns: 'kenburns 22s ease-in-out infinite alternate',
        sparkle: 'sparkleDrift 16s linear infinite',
        gloss: 'glossPulse 12s ease-in-out infinite',
        reward: 'rewardPulse 2.4s ease-in-out infinite',
        shine: 'shineSweep 2.2s ease-in-out',
        'retail-bounce': 'retailBounce 1.8s ease-in-out infinite',
        snowfall: 'snowfall 16s linear infinite',
        confetti: 'confettiFloat 16s linear infinite',
        'snow-drift': 'snowDrift 20s linear infinite',
        'sparkle-glow': 'sparkleTwinkle 3s ease-in-out infinite',
        'string-lights': 'stringGlow 4s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.catalog': 'Catalog',
    'nav.admin': 'Admin',
    'nav.sales': 'Sales',
    'nav.customer': 'Customer',
    'nav.driver': 'Driver',
    'nav.login': 'Login',
    'nav.logout': 'Logout',
    
    // Catalog
    'catalog.title': 'Product Catalog',
    'catalog.search': 'Search products...',
    'catalog.addToCart': 'Add to Cart',
    'catalog.bulkOrder': 'Bulk Order',
    'catalog.viewCart': 'View Cart',
    'catalog.checkout': 'Checkout',
    'catalog.featured': 'Featured Products',
    'catalog.special': 'Special Offers',
    'catalog.bundles': 'Product Bundles',
    
    // General User View
    'general.welcome': 'Welcome to Azteka DSD',
    'general.subtitle': 'Your trusted wholesale partner',
    'general.loginPrompt': 'Login to see prices and place orders',
    'general.onboarding': 'Get Started',
    'general.noPrices': 'Prices available after login',
    
    // Customer View
    'customer.welcome': 'Welcome back!',
    'customer.orderAgain': 'Order Again',
    'customer.recentOrders': 'Recent Orders',
    'customer.recommended': 'Recommended for You',
    'customer.favorites': 'Your Favorites',
    
    // Sales Rep View
    'salesrep.welcome': 'Sales Rep Dashboard',
    'salesrep.selectMode': 'Select Store Mode',
    'salesrep.mode.mexican': 'Mexican Grocery',
    'salesrep.mode.convenience': 'Convenience Store',
    'salesrep.mode.gas': 'Gas Station',
    'salesrep.mode.hybrid': 'Hybrid',
    'salesrep.customize': 'Customize Catalog',
    
    // Bulk Order
    'bulk.title': 'Bulk Order',
    'bulk.selectStores': 'Select Stores',
    'bulk.addProduct': 'Add Product',
    'bulk.submit': 'Submit Order',
    'bulk.carlosOnly': 'Bulk ordering available for Carlos',
    
    // Contract Worker
    'worker.dashboard': 'Worker Dashboard',
    'worker.availableJobs': 'Available Jobs',
    'worker.myJobs': 'My Jobs',
    'worker.accept': 'Accept Job',
    'worker.complete': 'Complete Job',
    'worker.commission': 'Commission',
    'worker.earnings': 'Earnings',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.close': 'Close',
  },
  es: {
    // Navigation
    'nav.catalog': 'Catálogo',
    'nav.admin': 'Administrador',
    'nav.sales': 'Ventas',
    'nav.customer': 'Cliente',
    'nav.driver': 'Conductor',
    'nav.login': 'Iniciar Sesión',
    'nav.logout': 'Cerrar Sesión',
    
    // Catalog
    'catalog.title': 'Catálogo de Productos',
    'catalog.search': 'Buscar productos...',
    'catalog.addToCart': 'Agregar al Carrito',
    'catalog.bulkOrder': 'Pedido al Por Mayor',
    'catalog.viewCart': 'Ver Carrito',
    'catalog.checkout': 'Pagar',
    'catalog.featured': 'Productos Destacados',
    'catalog.special': 'Ofertas Especiales',
    'catalog.bundles': 'Paquetes de Productos',
    
    // General User View
    'general.welcome': 'Bienvenido a Azteka DSD',
    'general.subtitle': 'Su socio mayorista de confianza',
    'general.loginPrompt': 'Inicie sesión para ver precios y realizar pedidos',
    'general.onboarding': 'Comenzar',
    'general.noPrices': 'Precios disponibles después de iniciar sesión',
    
    // Customer View
    'customer.welcome': '¡Bienvenido de nuevo!',
    'customer.orderAgain': 'Pedir de Nuevo',
    'customer.recentOrders': 'Pedidos Recientes',
    'customer.recommended': 'Recomendado para Ti',
    'customer.favorites': 'Tus Favoritos',
    
    // Sales Rep View
    'salesrep.welcome': 'Panel de Representante de Ventas',
    'salesrep.selectMode': 'Seleccionar Modo de Tienda',
    'salesrep.mode.mexican': 'Tienda Mexicana',
    'salesrep.mode.convenience': 'Tienda de Conveniencia',
    'salesrep.mode.gas': 'Gasolinera',
    'salesrep.mode.hybrid': 'Híbrido',
    'salesrep.customize': 'Personalizar Catálogo',
    
    // Bulk Order
    'bulk.title': 'Pedido al Por Mayor',
    'bulk.selectStores': 'Seleccionar Tiendas',
    'bulk.addProduct': 'Agregar Producto',
    'bulk.submit': 'Enviar Pedido',
    'bulk.carlosOnly': 'Pedidos al por mayor disponibles para Carlos',
    
    // Contract Worker
    'worker.dashboard': 'Panel de Trabajador',
    'worker.availableJobs': 'Trabajos Disponibles',
    'worker.myJobs': 'Mis Trabajos',
    'worker.accept': 'Aceptar Trabajo',
    'worker.complete': 'Completar Trabajo',
    'worker.commission': 'Comisión',
    'worker.earnings': 'Ganancias',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.close': 'Cerrar',
  },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('aztekaLanguage');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('aztekaLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};


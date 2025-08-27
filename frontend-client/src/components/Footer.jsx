import React from 'react';
import { useStoreSettings } from '../contexts/StoreSettingsContext';

const Footer = () => {
  const { settings } = useStoreSettings();
  
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto">
      <div className="container mx-auto px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-3">
            {settings.store_logo ? (
              <img 
                src={settings.store_logo} 
                alt={`Logo ${settings.store_name}`}
                className="w-6 h-6 object-contain"
              />
            ) : (
              <span className="text-lg">🍕</span>
            )}
            <span className="font-medium text-gray-800">{settings.store_name}</span>
          </div>
          
          <p className="text-gray-500 text-sm">
            © 2024 {settings.store_name}. Feito com ❤️ para você.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

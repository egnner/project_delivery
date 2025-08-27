import React from 'react';
import { useStoreSettings } from '../contexts/StoreSettingsContext';

const Footer = () => {
  const { settings, formatOpeningHours } = useStoreSettings();
  
  return (
    <footer className="bg-gray-800 text-white py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Informações da empresa */}
                     <div>
             <div className="flex items-center space-x-2 mb-4">
               {settings.store_logo ? (
                 <img 
                   src={settings.store_logo} 
                   alt={`Logo ${settings.store_name}`}
                   className="w-8 h-8 object-contain"
                 />
               ) : (
                 <span className="text-2xl">🍕</span>
               )}
               <h3 className="text-xl font-bold">{settings.store_name}</h3>
             </div>
            <p className="text-gray-300 mb-2">
              Entregamos qualidade e sabor na sua casa
            </p>
            <p className="text-gray-300">
              Horário: {formatOpeningHours()}
            </p>
          </div>

          {/* Links úteis */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Links Úteis</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white transition-colors">
                  Início
                </a>
              </li>
              <li>
                <a href="/menu" className="text-gray-300 hover:text-white transition-colors">
                  Cardápio
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nós
                </a>
              </li>
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contato</h4>
            <div className="space-y-2 text-gray-300">
              {settings.show_phone && <p>📞 {settings.contact_phone}</p>}
              {settings.show_email && <p>📧 {settings.contact_email}</p>}
              {settings.show_address && (
                <p>📍 {settings.address}, {settings.number}, {settings.neighborhood}, {settings.city} - {settings.state}</p>
              )}
            </div>
          </div>
        </div>

        {/* Linha divisória */}
        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {settings.store_name}. Todos os direitos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                Termos de Uso
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

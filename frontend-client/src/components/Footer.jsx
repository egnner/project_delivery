import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col items-center space-y-4">
          {/* Logo e Nome da Loja */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">LT</span>
            </div>
            <span className="text-lg font-semibold text-gray-800">Loja Teste</span>
          </div>
          
          {/* Linha Divisória */}
          <div className="w-24 h-px bg-gray-300"></div>
          
          {/* Informações de Copyright */}
          <div className="text-center space-y-2">
            <p className="text-gray-600 text-sm">
              © 2024 Loja Teste. Todos os direitos reservados.
            </p>
            <p className="text-gray-500 text-xs">
              Desenvolvido com ❤️ por{' '}
              <a 
                href="https://www.linkedin.com/in/egnner/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 hover:underline"
              >
                Egnner Bruno
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

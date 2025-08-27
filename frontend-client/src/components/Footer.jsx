import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Loja Teste. Desenvolvido com ❤️ por{' '}
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
    </footer>
  );
};

export default Footer;

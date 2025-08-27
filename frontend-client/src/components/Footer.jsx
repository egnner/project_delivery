import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-auto w-full">
      <div className="w-full text-center">
        <p className="text-gray-500 text-sm">
          © 2024 Loja Teste. Desenvolvido por{' '}
          <a 
            href="https://www.linkedin.com/in/egnner/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline transition-colors"
          >
            Egnner Bruno
          </a>
        </p>
      </div>
    </footer>
  );
};

export default Footer;

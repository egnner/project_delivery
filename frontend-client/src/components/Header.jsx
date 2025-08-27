import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Menu, X, Search } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useStoreSettings } from '../contexts/StoreSettingsContext'
import { useState } from 'react'

export default function Header({ searchTerm, setSearchTerm }) {
  const { itemCount, total } = useCart()
  const { settings } = useStoreSettings()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            {settings.store_logo ? (
              <img 
                src={settings.store_logo} 
                alt={`Logo ${settings.store_name}`}
                className="w-10 h-10 object-contain rounded-lg group-hover:scale-105 transition-transform duration-200"
              />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-200">
                <span className="text-white text-lg font-bold">🍕</span>
              </div>
            )}
            <span className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors duration-200">
              {settings.store_name}
            </span>
          </Link>

          {/* Barra de Busca Desktop - Apenas na página inicial */}
          {isHomePage && (
            <div className="hidden lg:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm || ''}
                  onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          )}

          {/* Desktop Navigation */}
          <nav className={`hidden ${isHomePage ? 'lg:flex' : 'md:flex'} items-center space-x-8`}>
            <Link 
              to="/" 
              className="text-gray-700 hover:text-red-600 transition-colors font-medium relative group"
            >
              Início
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
            <Link 
              to="/order-history" 
              className="text-gray-700 hover:text-red-600 transition-colors font-medium relative group"
            >
              Meus Pedidos
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-200 group-hover:w-full"></span>
            </Link>
          </nav>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="relative flex items-center gap-3 p-2 text-gray-700 hover:text-red-600 transition-all duration-200 group"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            {itemCount > 0 && (
              <span className="hidden sm:block text-sm font-semibold bg-red-50 px-3 py-1 rounded-full">
                R$ {total.toFixed(2)}
              </span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
            aria-label="Abrir menu mobile"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4 animate-slide-in-left">
            {/* Barra de Busca Mobile - Apenas na página inicial */}
            {isHomePage && (
              <div className="px-4 mb-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    value={searchTerm || ''}
                    onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>
            )}
            
            <nav className="flex flex-col space-y-2">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Início
              </Link>
              <Link 
                to="/cart" 
                className="text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  Carrinho
                </div>
                {itemCount > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-bold">
                      {itemCount}
                    </span>
                    <span className="text-sm font-semibold">
                      R$ {total.toFixed(2)}
                    </span>
                  </div>
                )}
              </Link>
              <Link 
                to="/order-history" 
                className="text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-3 rounded-lg hover:bg-gray-50 flex items-center gap-3"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Meus Pedidos
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

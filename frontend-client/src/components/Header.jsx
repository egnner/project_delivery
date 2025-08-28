import { Link, useLocation } from 'react-router-dom'
import { ShoppingCart, Package } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useStoreSettings } from '../contexts/StoreSettingsContext'

export default function Header() {
  const { itemCount, total } = useCart()
  const { settings, isStoreOpen } = useStoreSettings()

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo e Status */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center group">
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
            </Link>
            
            {/* Indicador de Status */}
            <div className={`w-3 h-3 rounded-full animate-pulse ${
              isStoreOpen() ? 'bg-green-500' : 'bg-red-500'
            }`} 
            title={isStoreOpen() ? 'Aberto agora' : 'Fechado'}
            />
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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

          {/* Mobile Navigation */}
          <nav className="md:hidden flex items-center space-x-4">
            <Link 
              to="/order-history" 
              className="p-2 text-gray-700 hover:text-red-600 transition-colors rounded-lg hover:bg-gray-100"
              title="Meus Pedidos"
            >
              <Package className="w-5 h-5" />
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
              <span className="text-sm font-semibold bg-red-50 px-3 py-1 rounded-full">
                R$ {total.toFixed(2)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}

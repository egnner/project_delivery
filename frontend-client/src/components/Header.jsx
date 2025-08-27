import { Link } from 'react-router-dom'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useCart } from '../contexts/CartContext'
import { useStoreSettings } from '../contexts/StoreSettingsContext'
import { useState } from 'react'

export default function Header() {
  const { itemCount, total } = useCart()
  const { settings } = useStoreSettings()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
                     <Link to="/" className="flex items-center space-x-2">
             {settings.store_logo ? (
               <img 
                 src={settings.store_logo} 
                 alt={`Logo ${settings.store_name}`}
                 className="w-8 h-8 object-contain"
               />
             ) : (
               <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                 <span className="text-white text-lg font-bold">🍕</span>
               </div>
             )}
             <span className="text-xl font-bold text-gray-900">{settings.store_name}</span>
           </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              Início
            </Link>
            <Link 
              to="/order-history" 
              className="text-gray-700 hover:text-red-600 transition-colors font-medium"
            >
              Meus Pedidos
            </Link>
          </nav>

          {/* Cart Icon */}
          <Link 
            to="/cart" 
            className="relative flex items-center gap-2 p-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            <div className="relative">
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </div>
            {itemCount > 0 && (
              <span className="hidden sm:block text-sm font-medium">
                R$ {total.toFixed(2)}
              </span>
            )}
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 text-gray-700 hover:text-red-600 transition-colors"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                to="/cart" 
                className="text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Carrinho ({itemCount}) {itemCount > 0 && `- R$ ${total.toFixed(2)}`}
              </Link>
              <Link 
                to="/order-history" 
                className="text-gray-700 hover:text-red-600 transition-colors font-medium px-4 py-2 rounded-md hover:bg-gray-50"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Meus Pedidos
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

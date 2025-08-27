import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  Tag, 
  BarChart3, 
  Settings, 
  Users,
  LogOut
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 min-h-screen p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
          <ShoppingBag className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
      </div>

      {/* Menu de Navegação */}
      <nav className="mt-8">
        <ul className="space-y-2">

          <li>
            <Link
              to="/orders"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/orders' 
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="w-5 h-5" />
              Pedidos
            </Link>
          </li>
          <li>
            <Link
              to="/customers"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/customers' 
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Users className="w-5 h-5" />
              Clientes
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/products' 
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Package className="w-5 h-5" />
              Produtos
            </Link>
          </li>
          <li>
            <Link
              to="/categories"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/categories' 
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Tag className="w-5 h-5" />
              Categorias
            </Link>
          </li>
          <li>
            <Link
              to="/"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/' || location.pathname === '/reports'
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              Relatórios
            </Link>
          </li>
          <li>
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/settings' 
                  ? 'bg-primary-100 text-primary-700 border-r-2 border-primary-700' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <Settings className="w-5 h-5" />
              Configurações
            </Link>
          </li>
        </ul>
      </nav>

      {/* Botão de Logout */}
      <div className="mt-auto pt-8">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 w-full text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  ShoppingCart, 
  Clock, 
  Star, 
  Package, 
  Coffee, 
  Utensils, 
  Cookie, 
  Pizza, 
  Wine, 
  Sandwich, 
  IceCream, 
  Soup, 
  Cake, 
  Phone, 
  Mail, 
  MapPin, 
  Filter, 
  X,
  Grid,
  Search,
  ChevronDown
} from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = ({ searchTerm = '' }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const { addToCart, items: cartItems } = useCart();
  const { settings, formatOpeningHours, isStoreOpen } = useStoreSettings();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.data || []);

      const productsResponse = await fetch('/api/products');
      const productsData = await productsResponse.json();
      setProducts(productsData.data || []);
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    const activeSearchTerm = localSearchTerm || searchTerm;
    return products.filter(product => {
      const matchesCategory = !selectedCategory || 
        product.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = !activeSearchTerm || 
        product.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(activeSearchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch && product.available;
    });
  }, [products, selectedCategory, searchTerm, localSearchTerm]);

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image_url: product.image_url || product.image,
      quantity: 1
    });
  };

  const getCartItemQuantity = (productId) => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getIconForCategory = (iconName) => {
    const iconMap = {
      'Pizza': Pizza,
      'Coffee': Coffee,
      'Cookie': Cookie,
      'Wine': Wine,
      'Sandwich': Sandwich,
      'IceCream': IceCream,
      'Soup': Soup,
      'Cake': Cake,
      'Package': Package,
      'Utensils': Utensils
    };
    
    const IconComponent = iconMap[iconName] || Utensils;
    return <IconComponent className="w-4 h-4" />;
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Layout Desktop */}
      <div className="hidden lg:flex">
        {/* Sidebar Desktop */}
        <div className="w-80 bg-white border-r border-gray-200 fixed left-0 top-16 h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="p-6">

            
            {/* Categorias */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-4">Categorias</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    !selectedCategory 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span className="font-medium">Todos os produtos</span>
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === category.name 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {getIconForCategory(category.icon)}
                    <span className="font-medium">{category.name}</span>
                    <span className="ml-auto text-xs text-gray-500">
                      {products.filter(p => p.category_name === category.name && p.available).length}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Informações de Contato */}
            {settings.show_contact_info && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Contato</h3>
                <div className="space-y-3 text-sm">
                  {settings.contact_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{settings.contact_phone}</span>
                    </div>
                  )}
                  
                  {settings.contact_email && (
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-700">{settings.contact_email}</span>
                    </div>
                  )}
                  
                  {settings.address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div className="text-gray-700 leading-relaxed">
                        <div>{settings.address}, {settings.number}</div>
                        {settings.neighborhood && <div>{settings.neighborhood}</div>}
                        <div>{settings.city} - {settings.state}</div>
                        {settings.zip_code && <div>CEP: {settings.zip_code}</div>}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal Desktop */}
        <div className="flex-1 ml-80 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Barra de Busca Desktop */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                />
                {localSearchTerm && (
                  <button
                    onClick={() => setLocalSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                {selectedCategory || 'Cardápio'}
              </h1>
              <p className="text-gray-600">
                {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
                {selectedCategory && ` em ${selectedCategory}`}
                {(localSearchTerm || searchTerm) && ` para "${localSearchTerm || searchTerm}"`}
              </p>
            </div>

            {/* Grid de Produtos Desktop */}
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1 line-clamp-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="font-bold text-lg text-gray-900">
                            R$ {parseFloat(product.price).toFixed(2)}
                          </span>
                          {(() => {
                            const productCategory = categories.find(cat => cat.name === product.category_name);
                            if (productCategory && productCategory.show_prep_time && productCategory.prep_time_min && productCategory.prep_time_max) {
                              return (
                                <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{productCategory.prep_time_min}-{productCategory.prep_time_max} min</span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                        </div>

                        <div className="flex items-center gap-2">
                          {getCartItemQuantity(product.id) > 0 && (
                            <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold min-w-[20px] text-center">
                              {getCartItemQuantity(product.id)}
                            </span>
                          )}
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                            aria-label={`Adicionar ${product.name} ao carrinho`}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Imagem */}
                    <div className="w-24 h-24 flex-shrink-0">
                      {product.image_url || product.image ? (
                        <img 
                          src={product.image_url || product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${
                        (product.image_url || product.image) ? 'hidden' : 'flex'
                      }`}>
                        <Package className="w-6 h-6 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Layout Mobile */}
      <div className="lg:hidden">
        {/* Barra de Busca Mobile */}
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar produtos..."
              value={localSearchTerm}
              onChange={(e) => setLocalSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
            />
            {localSearchTerm && (
              <button
                onClick={() => setLocalSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Header Mobile */}
        <div className="bg-white border-b border-gray-200 sticky top-16 z-30">
          {/* Filtros Mobile */}
          <div className="px-4 py-3">
            <div className="flex items-center justify-between mb-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  selectedCategory 
                    ? 'bg-red-50 border-red-200 text-red-600' 
                    : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="font-medium text-sm">
                  {selectedCategory || 'Categorias'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {(selectedCategory || localSearchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setLocalSearchTerm('');
                  }}
                  className="text-red-600 text-sm font-medium"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Conteúdo Mobile */}
        <div className="px-4 py-4">
          {/* Header da seção */}
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-1">
              {selectedCategory || 'Cardápio'}
            </h1>
            <p className="text-gray-600 text-sm">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'produto' : 'produtos'}
              {selectedCategory && ` em ${selectedCategory}`}
              {(localSearchTerm || searchTerm) && ` para "${localSearchTerm || searchTerm}"`}
            </p>
          </div>

          {/* Lista de Produtos Mobile */}
          <div className="space-y-4">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-lg text-gray-900">
                          R$ {parseFloat(product.price).toFixed(2)}
                        </span>
                        {(() => {
                          const productCategory = categories.find(cat => cat.name === product.category_name);
                          if (productCategory && productCategory.show_prep_time && productCategory.prep_time_min && productCategory.prep_time_max) {
                            return (
                              <div className="flex items-center gap-1 text-gray-500 text-xs mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{productCategory.prep_time_min}-{productCategory.prep_time_max} min</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>

                      <div className="flex items-center gap-2">
                        {getCartItemQuantity(product.id) > 0 && (
                          <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-xs font-semibold min-w-[20px] text-center">
                            {getCartItemQuantity(product.id)}
                          </span>
                        )}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2.5 rounded-full transition-colors"
                          aria-label={`Adicionar ${product.name} ao carrinho`}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Imagem Mobile */}
                  <div className="w-20 h-20 flex-shrink-0">
                    {product.image_url || product.image ? (
                      <img 
                        src={product.image_url || product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${
                      (product.image_url || product.image) ? 'hidden' : 'flex'
                    }`}>
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Estado vazio */}
          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Nenhum produto encontrado
              </h3>
              <p className="text-gray-600 text-sm mb-4">
                Tente buscar por outro termo ou categoria
              </p>
              {(selectedCategory || localSearchTerm) && (
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setLocalSearchTerm('');
                  }}
                  className="text-red-600 font-medium text-sm"
                >
                  Ver todos os produtos
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de Categorias Mobile */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4">
              {/* Header do Modal */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                <h3 className="font-semibold text-lg text-gray-900">Categorias</h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lista de Categorias */}
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    !selectedCategory 
                      ? 'bg-red-50 text-red-600 border border-red-200' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                  <span className="font-medium">Todos os produtos</span>
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.name);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === category.name 
                        ? 'bg-red-50 text-red-600 border border-red-200' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    {getIconForCategory(category.icon)}
                    <span className="font-medium">{category.name}</span>
                    <span className="ml-auto text-sm text-gray-500">
                      {products.filter(p => p.category_name === category.name && p.available).length}
                    </span>
                  </button>
                ))}
              </div>


            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
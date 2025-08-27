import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart, Clock, Star, Package, Coffee, Utensils, Cookie, Pizza, Wine, Sandwich, IceCream, Soup, Cake, Phone, Mail, MapPin, Filter, X } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = ({ searchTerm = '' }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { addToCart, items: cartItems } = useCart();
  const { settings, formatOpeningHours, isStoreOpen } = useStoreSettings();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Buscar categorias
      const categoriesResponse = await fetch('/api/categories');
      const categoriesData = await categoriesResponse.json();
      setCategories(categoriesData.data || []);

      // Buscar produtos
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
    return products.filter(product => {
      const matchesCategory = !selectedCategory || 
        product.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
      const matchesSearch = !searchTerm || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch && product.available;
    });
  }, [products, selectedCategory, searchTerm]);

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
    <div className="min-h-screen bg-gray-50">
      {/* Layout Principal */}
      <div className="flex h-screen">
        {/* Sidebar Desktop - Fixo na esquerda */}
        <div className="hidden lg:block w-80 bg-white shadow-xl fixed left-0 top-16 h-screen z-40 border-r border-gray-100 overflow-y-auto">
          <div className="p-4 h-full flex flex-col">
            {/* Header da Sidebar */}
            <div className="mb-4">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                  <Package className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">Cardápio</h3>
                  <p className="text-sm text-gray-500">Explore nossas categorias</p>
                </div>
              </div>
            </div>
            
            {/* Seção de Categorias */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Categorias</h4>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                    !selectedCategory 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105' 
                      : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm hover:scale-102'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span className="font-medium text-sm">Todos os produtos</span>
                  {!selectedCategory && (
                    <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                  )}
                </button>
                
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      selectedCategory === category.name 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md transform scale-105' 
                        : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm hover:scale-102'
                    }`}
                  >
                    {getIconForCategory(category.icon)}
                    <span className="font-medium text-sm">{category.name}</span>
                    {selectedCategory === category.name && (
                      <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Seção de Status da Loja */}
            <div className="mb-3">
              <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Status</h4>
              <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200 shadow-sm">
                <div className="text-center">
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-1.5 ${
                    isStoreOpen() 
                      ? 'bg-green-100 text-green-800 border border-green-200' 
                      : 'bg-red-100 text-red-800 border border-red-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${
                      isStoreOpen() ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {isStoreOpen() ? 'Aberto' : 'Fechado'}
                  </div>
                  <p className="text-sm text-gray-600 font-medium">
                    {formatOpeningHours()}
                  </p>
                </div>
              </div>
            </div>

            {/* Seção de Informações de Contato */}
            {settings.show_contact_info && (
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Contato</h4>
                <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200 shadow-sm">
                  <div className="space-y-2">
                    {settings.contact_phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Phone className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{settings.contact_phone}</span>
                      </div>
                    )}
                    
                    {settings.contact_email && (
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Mail className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <span className="font-medium">{settings.contact_email}</span>
                      </div>
                    )}
                    
                    {settings.address && (
                      <div className="flex items-start gap-2 text-sm text-gray-700">
                        <MapPin className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="space-y-1">
                          <div className="font-medium">{settings.address}, {settings.number}</div>
                          {settings.neighborhood && <div className="text-gray-600">{settings.neighborhood}</div>}
                          <div className="text-gray-600">{settings.city} - {settings.state}</div>
                          {settings.zip_code && <div className="text-gray-600">CEP: {settings.zip_code}</div>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:ml-80 h-full overflow-y-auto">
          {/* Header Mobile com Filtros */}
          <div className="lg:hidden bg-white shadow-sm sticky top-16 z-30">
            <div className="px-4 py-4">
              {/* Botão para abrir sidebar mobile */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  <span className="text-sm font-medium">Filtros</span>
                </button>
                
                {selectedCategory && (
                  <button
                    onClick={() => setSelectedCategory('')}
                    className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs"
                  >
                    <X className="w-3 h-3" />
                    Limpar
                  </button>
                )}
              </div>
              
              {/* Categorias em scroll horizontal */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    !selectedCategory 
                      ? 'bg-red-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todos
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      selectedCategory === category.name 
                        ? 'bg-red-500 text-white shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          

          {/* Grade de Produtos */}
          <div className="container mx-auto px-4 lg:px-6 py-6 lg:py-8">
            {/* Header da seção */}
            {selectedCategory && (
              <div className="mb-6 lg:mb-8">
                <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
                  {selectedCategory}
                </h2>
                <p className="text-gray-600 text-base lg:text-lg">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}

            {/* Grid responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden group">
                  {/* Imagem do Produto */}
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    {product.image_url || product.image ? (
                      <img 
                        src={product.image_url || product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${
                      (product.image_url || product.image) ? 'hidden' : 'flex'
                    }`}>
                      <Package className="w-16 h-16 text-gray-300" />
                    </div>
                  </div>

                  {/* Informações do Produto */}
                  <div className="p-4 lg:p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm ml-2">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="font-medium">4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl lg:text-2xl font-bold text-gray-800">
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
                          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                            {getCartItemQuantity(product.id)}
                          </span>
                        )}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-all duration-200 hover:scale-110 shadow-lg"
                          aria-label={`Adicionar ${product.name} ao carrinho`}
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Estado vazio */}
            {filteredProducts.length === 0 && (
              <div className="text-center py-16 lg:py-24">
                <Package className="w-24 h-24 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl lg:text-3xl font-semibold text-gray-600 mb-3">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  Tente buscar por outro termo ou selecionar uma categoria diferente
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Mobile Overlay */}
      {isSidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed left-0 top-0 h-full w-80 bg-white shadow-2xl z-50 overflow-y-auto">
            <div className="p-4">
              {/* Header da Sidebar Mobile */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                    <Package className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">Cardápio</h3>
                    <p className="text-sm text-gray-500">Filtros</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categorias Mobile */}
              <div className="mb-4">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Categorias</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setIsSidebarOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                      !selectedCategory 
                        ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span className="font-medium text-sm">Todos os produtos</span>
                  </button>
                  
                  {categories.map(category => (
                    <button
                      key={category.id}
                      onClick={() => {
                        setSelectedCategory(category.name);
                        setIsSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                        selectedCategory === category.name 
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      {getIconForCategory(category.icon)}
                      <span className="font-medium text-sm">{category.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status da Loja Mobile */}
              <div className="mb-3">
                <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Status</h4>
                <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="text-center">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold mb-1.5 ${
                      isStoreOpen() 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${
                        isStoreOpen() ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {isStoreOpen() ? 'Aberto' : 'Fechado'}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                      {formatOpeningHours()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Contato Mobile */}
              {settings.show_contact_info && (
                <div className="mb-3">
                  <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wider">Contato</h4>
                  <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                    <div className="space-y-2">
                      {settings.contact_phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Phone className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="font-medium">{settings.contact_phone}</span>
                        </div>
                      )}
                      
                      {settings.contact_email && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Mail className="w-3 h-3 text-blue-500 flex-shrink-0" />
                          <span className="font-medium">{settings.contact_email}</span>
                        </div>
                      )}
                      
                      {settings.address && (
                        <div className="flex items-start gap-2 text-sm text-gray-700">
                          <MapPin className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          <div className="space-y-1">
                            <div className="font-medium">{settings.address}, {settings.number}</div>
                            {settings.neighborhood && <div className="text-gray-600">{settings.neighborhood}</div>}
                            <div className="text-gray-600">{settings.city} - {settings.state}</div>
                            {settings.zip_code && <div className="text-gray-600">CEP: {settings.zip_code}</div>}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

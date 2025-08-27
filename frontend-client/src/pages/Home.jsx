import React, { useState, useEffect } from 'react';
import { Search, Plus, ShoppingCart, Clock, Star, ChevronDown } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart, cartItems } = useCart();
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

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || 
      product.category_name?.toLowerCase().includes(selectedCategory.toLowerCase());
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch && product.available;
  });

  const handleAddToCart = (product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1
    });
  };

  const getCartItemQuantity = (productId) => {
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout estilo iFood */}
      <div className="flex">
        {/* Sidebar de Categorias - Fixo na direita em desktop */}
        <div className="hidden lg:block w-80 bg-white shadow-lg fixed right-0 top-16 h-screen overflow-y-auto z-40">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Categorias</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  !selectedCategory 
                    ? 'bg-red-500 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                🍽️ Todos os produtos
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    selectedCategory === category.name 
                      ? 'bg-red-500 text-white' 
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {category.emoji || '🍴'} {category.name}
                </button>
              ))}
            </div>

            {/* Informações da Loja */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                {settings.store_logo ? (
                  <img 
                    src={settings.store_logo} 
                    alt={`Logo ${settings.store_name}`}
                    className="w-16 h-16 mx-auto mb-3 object-contain rounded-full"
                  />
                ) : (
                  <div className="w-16 h-16 mx-auto mb-3 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-2xl text-white">🍕</span>
                  </div>
                )}
                <h4 className="font-bold text-gray-800">{settings.store_name}</h4>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mt-2 ${
                  isStoreOpen() 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isStoreOpen() ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                  {isStoreOpen() ? 'Aberto' : 'Fechado'}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formatOpeningHours()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:mr-80">
          {/* Header Mobile com Categorias */}
          <div className="lg:hidden bg-white shadow-sm sticky top-16 z-30">
            <div className="p-4">
              <div className="flex gap-2 overflow-x-auto pb-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    !selectedCategory 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Todos
                </button>
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.name 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Barra de Busca */}
          <div className="bg-white shadow-sm border-b">
            <div className="container mx-auto px-4 py-4">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Grade de Produtos */}
          <div className="container mx-auto px-4 py-6">
            {selectedCategory && (
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {selectedCategory || 'Todos os produtos'}
                </h2>
                <p className="text-gray-600">
                  {filteredProducts.length} produto(s) encontrado(s)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                  {/* Imagem do Produto */}
                  <div className="aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}
                  </div>

                  {/* Informações do Produto */}
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg leading-tight">
                        {product.name}
                      </h3>
                      <div className="flex items-center gap-1 text-yellow-500 text-sm">
                        <Star className="w-4 h-4 fill-current" />
                        <span>4.5</span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-xl font-bold text-gray-800">
                          R$ {parseFloat(product.price).toFixed(2)}
                        </span>
                        <div className="flex items-center gap-1 text-gray-500 text-xs">
                          <Clock className="w-3 h-3" />
                          <span>25-35 min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {getCartItemQuantity(product.id) > 0 && (
                          <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                            {getCartItemQuantity(product.id)}
                          </span>
                        )}
                        <button
                          onClick={() => handleAddToCart(product)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-full transition-colors"
                        >
                          <Plus className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🍽️</div>
                <h3 className="text-xl font-medium text-gray-600 mb-2">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500">
                  Tente buscar por outro termo ou categoria
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Botão Carrinho Flutuante */}
      {getTotalCartItems() > 0 && (
        <button
          onClick={() => window.location.href = '/cart'}
          className="fixed bottom-6 left-6 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 transition-colors z-50"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="font-medium">
            {getTotalCartItems()} item(s)
          </span>
          <span className="bg-red-600 px-2 py-1 rounded-full text-sm">
            R$ {cartItems.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)}
          </span>
        </button>
      )}
    </div>
  );
};

export default Home;

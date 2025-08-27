import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, ShoppingCart, Clock, Star, Package, Coffee, Utensils, Cookie, Pizza, Wine, Sandwich, IceCream, Soup, Cake, Phone, Mail, MapPin } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
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
      image_url: product.image_url || product.image,
      quantity: 1
    });
  };

  const getCartItemQuantity = (productId) => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    const item = cartItems.find(item => item.id === productId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Layout estilo iFood */}
      <div className="flex">
        {/* Sidebar de Categorias - Fixo na esquerda em desktop */}
        <div className="hidden lg:block w-80 bg-white shadow-lg fixed left-0 top-16 h-screen overflow-y-auto z-40">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-4 text-gray-800">Categorias</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                  !selectedCategory 
                    ? 'bg-red-500 text-white' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <Package className="w-5 h-5" />
                Todos os produtos
              </button>
              {categories.map(category => {
                const getIconForCategory = (iconName) => {
                  switch(iconName) {
                    case 'Pizza': return <Pizza className="w-5 h-5" />;
                    case 'Coffee': return <Coffee className="w-5 h-5" />;
                    case 'Cookie': return <Cookie className="w-5 h-5" />;
                    case 'Wine': return <Wine className="w-5 h-5" />;
                    case 'Sandwich': return <Sandwich className="w-5 h-5" />;
                    case 'IceCream': return <IceCream className="w-5 h-5" />;
                    case 'Soup': return <Soup className="w-5 h-5" />;
                    case 'Cake': return <Cake className="w-5 h-5" />;
                    case 'Package': return <Package className="w-5 h-5" />;
                    case 'Utensils': return <Utensils className="w-5 h-5" />;
                    default: return <Utensils className="w-5 h-5" />;
                  }
                };

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.name)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                      selectedCategory === category.name 
                        ? 'bg-red-500 text-white' 
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {getIconForCategory(category.icon)}
                    <div className="flex-1 text-left">
                      <div className="font-medium">{category.name}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Status da Loja */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${
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

            {/* Informações de Contato */}
            {settings.show_contact_info && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Informações de Contato</h4>
                
                {settings.contact_phone && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Phone className="w-3 h-3" />
                    <span>{settings.contact_phone}</span>
                  </div>
                )}
                
                {settings.contact_email && (
                  <div className="flex items-center gap-2 text-xs text-gray-600 mb-2">
                    <Mail className="w-3 h-3" />
                    <span>{settings.contact_email}</span>
                  </div>
                )}
                
                {settings.address && (
                  <div className="flex items-start gap-2 text-xs text-gray-600">
                    <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <div>{settings.address}, {settings.number}</div>
                      {settings.neighborhood && <div>{settings.neighborhood}</div>}
                      <div>{settings.city} - {settings.state}</div>
                      {settings.zip_code && <div>CEP: {settings.zip_code}</div>}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:ml-80">
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
            <div className="flex justify-center py-4 px-4">
              <div className="relative w-full max-w-lg">
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
                    {product.image_url || product.image ? (
                      <img 
                        src={product.image_url || product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${
                      (product.image_url || product.image) ? 'hidden' : 'flex'
                    }`}>
                      <Package className="w-12 h-12 text-gray-400" />
            </div>
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
                                                 {(() => {
                           const productCategory = categories.find(cat => cat.name === product.category_name);
                           if (productCategory && productCategory.show_prep_time && productCategory.prep_time_min && productCategory.prep_time_max) {
                             return (
                               <div className="flex items-center gap-1 text-gray-500 text-xs">
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
                <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
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


    </div>
  );
};

export default Home;

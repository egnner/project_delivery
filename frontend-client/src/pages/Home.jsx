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
      <div className="flex h-screen">
                 {/* Sidebar de Categorias - Fixo na esquerda em desktop */}
         <div className="hidden lg:block w-80 bg-white shadow-xl fixed left-0 top-16 h-screen z-40 border-r border-gray-100">
           <div className="p-4 h-full flex flex-col">
             {/* Header da Sidebar */}
             <div className="mb-4">
               <div className="flex items-center space-x-3">
                 <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                   <Package className="w-4 h-4 text-white" />
                 </div>
                 <div>
                   <h3 className="font-bold text-lg text-gray-900">Cardápio</h3>
                   <p className="text-xs text-gray-500">Explore nossas categorias</p>
                 </div>
               </div>
             </div>
             
             {/* Seção de Categorias */}
             <div className="mb-4 flex-1">
               <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Categorias</h4>
               <div className="space-y-1">
                                 <button
                   onClick={() => setSelectedCategory('')}
                   className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                     !selectedCategory 
                       ? 'bg-red-500 text-white shadow-md' 
                       : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                   }`}
                 >
                   <Package className="w-4 h-4" />
                   <span className="font-medium text-sm">Todos os produtos</span>
                   {!selectedCategory && (
                     <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                   )}
                 </button>
                {categories.map(category => {
                                     const getIconForCategory = (iconName) => {
                     switch(iconName) {
                       case 'Pizza': return <Pizza className="w-4 h-4" />;
                       case 'Coffee': return <Coffee className="w-4 h-4" />;
                       case 'Cookie': return <Cookie className="w-4 h-4" />;
                       case 'Wine': return <Wine className="w-4 h-4" />;
                       case 'Sandwich': return <Sandwich className="w-4 h-4" />;
                       case 'IceCream': return <IceCream className="w-4 h-4" />;
                       case 'Soup': return <Soup className="w-4 h-4" />;
                       case 'Cake': return <Cake className="w-4 h-4" />;
                       case 'Package': return <Package className="w-4 h-4" />;
                       case 'Utensils': return <Utensils className="w-4 h-4" />;
                       default: return <Utensils className="w-4 h-4" />;
                     }
                   };

                                     return (
                     <button
                       key={category.id}
                       onClick={() => setSelectedCategory(category.name)}
                       className={`w-full text-left px-3 py-2 rounded-lg transition-all duration-200 flex items-center gap-2 ${
                         selectedCategory === category.name 
                           ? 'bg-red-500 text-white shadow-md' 
                           : 'hover:bg-gray-50 text-gray-700 hover:shadow-sm'
                       }`}
                     >
                       {getIconForCategory(category.icon)}
                       <span className="font-medium text-sm">{category.name}</span>
                       {selectedCategory === category.name && (
                         <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                       )}
                     </button>
                   );
                })}
              </div>
            </div>

                         {/* Seção de Status da Loja */}
             <div className="mb-3">
               <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Status</h4>
               <div className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                 <div className="text-center">
                   <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${
                     isStoreOpen() 
                       ? 'bg-green-100 text-green-800 border border-green-200' 
                       : 'bg-red-100 text-red-800 border border-red-200'
                   }`}>
                     <div className={`w-1.5 h-1.5 rounded-full ${
                       isStoreOpen() ? 'bg-green-500' : 'bg-red-500'
                     }`}></div>
                     {isStoreOpen() ? 'Aberto' : 'Fechado'}
                   </div>
                   <p className="text-xs text-gray-600 mt-1.5 font-medium">
                     {formatOpeningHours()}
                   </p>
                 </div>
               </div>
             </div>

                         {/* Seção de Informações de Contato */}
             {settings.show_contact_info && (
               <div className="mb-3">
                 <h4 className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Contato</h4>
                 <div className="p-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                   <div className="space-y-2">
                     {settings.contact_phone && (
                       <div className="flex items-center gap-2 text-xs text-gray-700">
                         <Phone className="w-3 h-3 text-blue-500 flex-shrink-0" />
                         <span className="font-medium">{settings.contact_phone}</span>
                       </div>
                     )}
                     
                     {settings.contact_email && (
                       <div className="flex items-center gap-2 text-xs text-gray-700">
                         <Mail className="w-3 h-3 text-blue-500 flex-shrink-0" />
                         <span className="font-medium">{settings.contact_email}</span>
                       </div>
                     )}
                     
                     {settings.address && (
                       <div className="flex items-start gap-2 text-xs text-gray-700">
                         <MapPin className="w-3 h-3 text-blue-500 mt-0.5 flex-shrink-0" />
                         <div className="space-y-0.5">
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

             {/* Footer dentro do menu lateral */}
             <div className="mt-auto pt-4 border-t border-gray-200">
               <div className="text-center">
                 <p className="text-gray-500 text-xs">
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
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="flex-1 lg:ml-80 h-full overflow-y-auto">
          {/* Header Mobile com Categorias */}
          <div className="lg:hidden bg-white shadow-sm sticky top-16 z-30">
            <div className="px-6 py-4">
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
            <div className="flex justify-center py-6 px-6">
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
          <div className="container mx-auto px-6 py-8">
            {selectedCategory && (
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-3">
                  {selectedCategory || 'Todos os produtos'}
                </h2>
                <p className="text-gray-600 text-lg">
                  {filteredProducts.length} produto(s) encontrado(s)
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden">
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
                  <div className="p-6">
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
              <div className="text-center py-16">
                <Package className="w-20 h-20 mx-auto mb-6 text-gray-300" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-3">
                  Nenhum produto encontrado
                </h3>
                <p className="text-gray-500 text-lg">
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

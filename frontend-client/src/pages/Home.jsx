import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Clock, Truck, Star } from 'lucide-react';
import { useStoreSettings } from '../contexts/StoreSettingsContext';

const Home = () => {
  const { settings, formatOpeningHours, isStoreOpen } = useStoreSettings();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-20">
                 <div className="container mx-auto px-4 text-center">
           <div className="mb-6">
             {settings.store_logo ? (
               <img 
                 src={settings.store_logo} 
                 alt={`Logo ${settings.store_name}`}
                 className="w-24 h-24 mx-auto mb-4 object-contain"
               />
             ) : (
               <span className="text-6xl mb-4 block">🍕</span>
             )}
           </div>
           <h1 className="text-5xl md:text-6xl font-bold mb-6">
             {settings.store_name}
           </h1>
                      <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              {settings.about_us}
            </p>
                      {/* Status da Loja */}
            <div className="mb-6">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isStoreOpen() 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  isStoreOpen() ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
                {isStoreOpen() ? 'Loja Aberta' : 'Loja Fechada'}
              </div>
              <p className="text-sm text-gray-300 mt-2">
                Horário: {formatOpeningHours()}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
              to="/menu"
              className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors"
            >
              Ver Cardápio
            </Link>
                         <Link
               to="/about"
               className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary-600 transition-colors"
             >
               Sobre Nós
             </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Por que escolher o Delivery Express?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Entrega Rápida
              </h3>
              <p className="text-gray-600">
                Entregamos em até 30 minutos ou sua pizza é grátis!
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Qualidade Premium
              </h3>
              <p className="text-gray-600">
                Ingredientes frescos e receitas tradicionais italianas
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Truck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">
                Rastreamento em Tempo Real
              </h3>
              <p className="text-gray-600">
                Acompanhe seu pedido desde a preparação até a entrega
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Categorias Populares
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 h-32 flex items-center justify-center">
                <span className="text-4xl">🍕</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Pizzas</h3>
                <p className="text-gray-600 text-sm mb-3">
                  As melhores pizzas da cidade
                </p>
                <Link
                  to="/menu?category=pizzas"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver pizzas →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 h-32 flex items-center justify-center">
                <span className="text-4xl">🍔</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Hambúrgueres</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Hambúrgueres artesanais
                </p>
                <Link
                  to="/menu?category=hamburgueres"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver hambúrgueres →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 h-32 flex items-center justify-center">
                <span className="text-4xl">🥤</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Bebidas</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Refrigerantes e sucos naturais
                </p>
                <Link
                  to="/menu?category=bebidas"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver bebidas →
                </Link>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="bg-primary-100 h-32 flex items-center justify-center">
                <span className="text-4xl">🍰</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">Sobremesas</h3>
                <p className="text-gray-600 text-sm mb-3">
                  Doces e sobremesas deliciosas
                </p>
                <Link
                  to="/menu?category=sobremesas"
                  className="text-primary-600 hover:text-primary-700 font-medium"
                >
                  Ver sobremesas →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para fazer seu pedido?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Acesse nosso cardápio e escolha os melhores sabores
          </p>
          <Link
            to="/menu"
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center gap-2"
          >
            <ShoppingCart className="w-5 h-5" />
            Fazer Pedido
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;

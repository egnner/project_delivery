import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Clock, AlertCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const { settings, isStoreOpen, formatOpeningHours } = useStoreSettings();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-8">
            Adicione alguns produtos deliciosos ao seu carrinho!
          </p>
          <Link
            to="/"
            className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver Cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-800">
              Seu Carrinho
            </h1>
          </div>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Limpar Carrinho
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Lista de Itens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Itens ({itemCount})
                </h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {items.map((item) => (
                  <div key={item.id} className="p-6 flex items-center gap-4">
                    {/* Imagem */}
                    <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      {item.image_url ? (
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <span className="text-2xl">🍕</span>
                      )}
                    </div>
                    
                    {/* Informações */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-800 mb-1">
                        {item.name}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        R$ {item.price.toFixed(2).replace('.', ',')} cada
                      </p>
                    </div>
                    
                    {/* Controles de Quantidade */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-12 text-center font-semibold text-gray-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Preço Total do Item */}
                    <div className="text-right min-w-0">
                      <p className="font-semibold text-lg text-gray-800">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                    
                    {/* Botão Remover */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-500 hover:text-red-700 p-2 transition-colors"
                      title="Remover item"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Resumo do Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Resumo do Pedido
              </h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({itemCount} itens):</span>
                  <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                </div>
                
                {/* Taxa de entrega - só aparece se a entrega estiver habilitada */}
                {settings.delivery_enabled && (
                  <div className="flex justify-between text-gray-600">
                    <span>Taxa de entrega:</span>
                    <span>
                      {total >= settings.free_delivery_threshold 
                        ? 'Grátis' 
                        : `R$ ${settings.delivery_fee.toFixed(2).replace('.', ',')}`
                      }
                    </span>
                  </div>
                )}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between text-xl font-bold text-gray-800">
                    <span>Total:</span>
                    <span>
                      R$ {settings.delivery_enabled 
                        ? (total + (total >= settings.free_delivery_threshold ? 0 : settings.delivery_fee)).toFixed(2).replace('.', ',')
                        : total.toFixed(2).replace('.', ',')
                      }
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Verificação do status da loja */}
              {!isStoreOpen() && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-red-800">Loja Fechada</span>
                  </div>
                  <p className="text-sm text-red-700 mb-2">
                    Não é possível finalizar pedidos fora do horário de funcionamento.
                  </p>
                  <div className="flex items-center gap-2 text-xs text-red-600">
                    <Clock className="w-4 h-4" />
                    <span>Horário: {formatOpeningHours()}</span>
                  </div>
                </div>
              )}
              
              {isStoreOpen() ? (
                <Link
                  to="/checkout"
                  className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors text-center block"
                >
                  Finalizar Pedido
                </Link>
              ) : (
                <button
                  disabled
                  className="w-full bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold cursor-not-allowed text-center block"
                >
                  Loja Fechada
                </button>
              )}
              
              <Link
                to="/"
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-medium hover:bg-gray-300 transition-colors text-center block mt-3"
              >
                Continuar Comprando
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

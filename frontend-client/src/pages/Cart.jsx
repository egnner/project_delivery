import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft, Clock, AlertCircle, Package } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, clearCart, total, itemCount } = useCart();
  const { settings, isStoreOpen, formatOpeningHours } = useStoreSettings();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            Seu carrinho está vazio
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Adicione alguns produtos deliciosos ao seu carrinho para começar seu pedido!
          </p>
          <Link
            to="/"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Ver Cardápio
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Layout Desktop */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-8 h-8 text-gray-700" />
              <h1 className="text-3xl font-bold text-gray-900">
                Carrinho ({itemCount})
              </h1>
            </div>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 font-medium flex items-center gap-2 px-3 py-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Limpar Carrinho
            </button>
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Lista de Itens */}
            <div className="col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      {/* Imagem */}
                      <div className="w-20 h-20 flex-shrink-0">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <div className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${
                          item.image_url ? 'hidden' : 'flex'
                        }`}>
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      </div>
                      
                      {/* Informações */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg text-gray-900 mb-1">
                          {item.name}
                        </h3>
                        <p className="text-gray-600">
                          R$ {item.price.toFixed(2).replace('.', ',')} cada
                        </p>
                      </div>
                      
                      {/* Controles de Quantidade */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      {/* Preço Total do Item */}
                      <div className="text-right min-w-[100px]">
                        <p className="font-bold text-lg text-gray-900">
                          R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      
                      {/* Botão Remover */}
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 p-2 transition-colors"
                        title="Remover item"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Resumo do Pedido */}
            <div className="col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Resumo do Pedido
                </h2>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal ({itemCount} itens):</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {/* Taxa de entrega */}
                  {settings.delivery_enabled && (
                    <div className="flex justify-between text-gray-700">
                      <span>Taxa de entrega:</span>
                      <span>
                        {total >= settings.free_delivery_threshold 
                          ? 'Grátis' 
                          : `R$ ${settings.delivery_fee.toFixed(2).replace('.', ',')}`
                        }
                      </span>
                    </div>
                  )}
                  
                  <div className="border-t border-gray-300 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
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
                
                {/* Status da loja */}
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
                
                <div className="space-y-3">
                  {isStoreOpen() ? (
                    <Link
                      to="/checkout"
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
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
                    className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-6 rounded-lg font-medium transition-colors text-center block"
                  >
                    Continuar Comprando
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Mobile */}
      <div className="lg:hidden min-h-screen">
        {/* Header Mobile */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-16 z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link 
                to="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-lg font-bold text-gray-900">Carrinho</h1>
                <p className="text-sm text-gray-600">{itemCount} itens</p>
              </div>
            </div>
            <button
              onClick={clearCart}
              className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Itens Mobile */}
        <div className="p-4 pb-32">
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex gap-3">
                  {/* Imagem */}
                  <div className="w-16 h-16 flex-shrink-0">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center bg-gray-100 rounded-lg ${
                      item.image_url ? 'hidden' : 'flex'
                    }`}>
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-gray-900 text-sm leading-tight">
                        {item.name}
                      </h3>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-gray-400 hover:text-red-600 p-1 transition-colors ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3">
                      R$ {item.price.toFixed(2).replace('.', ',')} cada
                    </p>
                    
                    <div className="flex items-center justify-between">
                      {/* Controles de Quantidade */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(0, item.quantity - 1))}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-900 text-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full border border-gray-300 hover:bg-gray-50 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                      
                      {/* Preço Total */}
                      <p className="font-bold text-gray-900">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Fixo com Resumo Mobile */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          {/* Status da loja mobile */}
          {!isStoreOpen() && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-800 text-sm">Loja Fechada</span>
              </div>
              <p className="text-xs text-red-700">
                Horário: {formatOpeningHours()}
              </p>
            </div>
          )}

          {/* Resumo */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">Subtotal ({itemCount} itens):</span>
              <span className="font-bold text-gray-900">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            
            {settings.delivery_enabled && (
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 text-sm">Taxa de entrega:</span>
                <span className="text-gray-900 text-sm font-medium">
                  {total >= settings.free_delivery_threshold 
                    ? 'Grátis' 
                    : `R$ ${settings.delivery_fee.toFixed(2).replace('.', ',')}`
                  }
                </span>
              </div>
            )}
            
            <div className="border-t border-gray-200 pt-2 mt-2">
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold text-gray-900">
                  R$ {settings.delivery_enabled 
                    ? (total + (total >= settings.free_delivery_threshold ? 0 : settings.delivery_fee)).toFixed(2).replace('.', ',')
                    : total.toFixed(2).replace('.', ',')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="space-y-2">
            {isStoreOpen() ? (
              <Link
                to="/checkout"
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-6 rounded-lg font-semibold transition-colors text-center block"
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
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 py-2 px-6 rounded-lg font-medium transition-colors text-center block"
            >
              Continuar Comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
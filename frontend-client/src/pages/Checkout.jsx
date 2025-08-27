import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import CEPInput from '../components/CEPInput';
import { phoneMask, removePhoneMask } from '../utils/inputMasks';
import { CreditCard, Smartphone, DollarSign, Truck, CheckCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, total, clearCart, setCustomerInfo } = useCart();
  const { settings, isStoreOpen } = useStoreSettings();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    deliveryType: 'delivery',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    paymentMethod: 'pix',
    notes: ''
  });

  // Definir tipo de entrega padrão baseado nas configurações
  useEffect(() => {
    if (settings.delivery_enabled && !settings.pickup_enabled) {
      setFormData(prev => ({ ...prev, deliveryType: 'delivery' }));
    } else if (!settings.delivery_enabled && settings.pickup_enabled) {
      setFormData(prev => ({ ...prev, deliveryType: 'pickup' }));
    } else if (settings.delivery_enabled && settings.pickup_enabled) {
      setFormData(prev => ({ ...prev, deliveryType: 'delivery' }));
    }
  }, [settings.delivery_enabled, settings.pickup_enabled]);
  const [loading, setLoading] = useState(false);
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Conectar ao WebSocket
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const maskedValue = phoneMask(value);
    setFormData(prev => ({
      ...prev,
      phone: maskedValue
    }));
  };

  const handleCEPFound = (addressData) => {
    setFormData(prev => ({
      ...prev,
      address: addressData.logradouro || '',
      neighborhood: addressData.bairro || '',
      city: addressData.localidade || '',
      state: addressData.uf || ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Verificar se a loja está aberta
    if (!isStoreOpen()) {
      alert('A loja está fechada no momento. Não é possível finalizar pedidos fora do horário de funcionamento.');
      return;
    }
    
    if (!formData.name || !formData.phone) {
      alert('Por favor, preencha os campos obrigatórios.');
      return;
    }

    if (formData.deliveryType === 'delivery' && !formData.address) {
      alert('Por favor, preencha o endereço para entrega.');
      return;
    }

    setLoading(true);

    try {
      // Salvar informações do cliente no contexto
      setCustomerInfo({
        name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.number}, ${formData.neighborhood}, ${formData.city} - ${formData.state}`
      });

      // Criar pedido
      const orderData = {
        customer_name: formData.name,
        customer_phone: removePhoneMask(formData.phone), // Remove máscara antes de enviar
        customer_address: formData.deliveryType === 'delivery' 
          ? `${formData.address}, ${formData.number}, ${formData.neighborhood}, ${formData.city} - ${formData.state}`
          : null,
        delivery_type: formData.deliveryType,
        payment_method: formData.paymentMethod,
        notes: formData.notes,
        items: items.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: item.price
        })),
        total_amount: formData.deliveryType === 'delivery' 
          ? total + (total >= settings.free_delivery_threshold ? 0 : settings.delivery_fee)
          : total
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const order = await response.json();
        setOrderSubmitted(true);
        clearCart();
        
        // Entrar na sala do pedido via WebSocket para receber atualizações
        if (socket) {
          socket.emit('join-client', order.data.id);
        }
        
        // Redirecionar para status do pedido imediatamente
        navigate(`/order/${order.data.id}`);
      } else {
        const errorData = await response.json();
        
        // Tratar erro específico de loja fechada
        if (response.status === 403 && errorData.error === 'Loja fechada') {
          alert('A loja está fechada no momento. Não é possível finalizar pedidos fora do horário de funcionamento.');
        } else {
          throw new Error(errorData.message || 'Erro ao criar pedido');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      
      // Não mostrar alerta genérico se já foi tratado acima
      if (!error.message.includes('loja fechada')) {
        alert('Erro ao finalizar pedido. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pedido Enviado com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Seu pedido foi recebido e está sendo processado.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500 mb-4">
              Redirecionando para acompanhamento...
            </p>
          </div>
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            Voltar ao Início
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Finalizar Pedido
            </h1>
            <p className="text-gray-600">
              Complete suas informações para receber seu pedido
            </p>
            
            {/* Status da Loja */}
            {!isStoreOpen() && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto">
                <div className="flex items-center justify-center gap-2 text-red-800">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-semibold">Loja Fechada</span>
                </div>
                <p className="text-sm text-red-700 mt-1">
                  Não é possível finalizar pedidos fora do horário de funcionamento.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Informações Pessoais */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nome Completo *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handlePhoneChange}
                          required
                          placeholder="(27) 99999-9999"
                          maxLength="15"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Tipo de Entrega */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Como você quer receber seu pedido?
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {settings.delivery_enabled && (
                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.deliveryType === 'delivery' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="deliveryType"
                            value="delivery"
                            checked={formData.deliveryType === 'delivery'}
                            onChange={handleInputChange}
                            className="mr-3 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex items-center">
                            <Truck className="w-5 h-5 text-primary-600 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">Entrega</div>
                              <div className="text-sm text-gray-500">
                                {total >= settings.free_delivery_threshold 
                                  ? 'Entrega gratuita!' 
                                  : `Taxa de entrega: R$ ${settings.delivery_fee?.toFixed(2) || '0.00'}`
                                }
                              </div>
                            </div>
                          </div>
                        </label>
                      )}
                      
                      {settings.pickup_enabled && (
                        <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          formData.deliveryType === 'pickup' 
                            ? 'border-primary-500 bg-primary-50' 
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}>
                          <input
                            type="radio"
                            name="deliveryType"
                            value="pickup"
                            checked={formData.deliveryType === 'pickup'}
                            onChange={handleInputChange}
                            className="mr-3 text-primary-600 focus:ring-primary-500"
                          />
                          <div className="flex items-center">
                            <CheckCircle className="w-5 h-5 text-primary-600 mr-2" />
                            <div>
                              <div className="font-medium text-gray-900">Retirada no Balcão</div>
                              <div className="text-sm text-gray-500">Sem taxa de entrega</div>
                            </div>
                          </div>
                        </label>
                      )}
                    </div>
                    
                    {!settings.delivery_enabled && !settings.pickup_enabled && (
                      <div className="text-center py-4 text-gray-500">
                        Nenhuma opção de entrega disponível no momento.
                      </div>
                    )}
                  </div>

                  {/* Endereço - Só aparece se for entrega */}
                  {formData.deliveryType === 'delivery' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Endereço de Entrega
                    </h3>
                    <div className="space-y-4">
                      {/* CEP com busca automática */}
                      <CEPInput
                        value={formData.zipCode}
                        onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                        onCEPFound={handleCEPFound}
                        placeholder="00000-000"
                        label="CEP"
                        showNumberField={true}
                        numberValue={formData.number}
                        onNumberChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                      />

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Endereço *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          required
                          placeholder="Rua, número, complemento"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bairro
                          </label>
                          <input
                            type="text"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Cidade
                          </label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Estado
                          </label>
                          <input
                            type="text"
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  )}

                  {/* Método de Pagamento */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">
                      Método de Pagamento
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="pix"
                          checked={formData.paymentMethod === 'pix'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <Smartphone className="w-5 h-5 text-green-600 mr-2" />
                          <span>PIX</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cartao"
                          checked={formData.paymentMethod === 'cartao'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                          <span>Cartão</span>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="dinheiro"
                          checked={formData.paymentMethod === 'dinheiro'}
                          onChange={handleInputChange}
                          className="mr-3"
                        />
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                          <span>Dinheiro</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Observações */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="3"
                      placeholder="Instruções especiais para entrega..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>

                  {/* Botão Submit */}
                  <button
                    type="submit"
                    disabled={loading || !isStoreOpen()}
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                      isStoreOpen() 
                        ? 'bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed'
                        : 'bg-gray-400 text-white cursor-not-allowed'
                    }`}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Processando...
                      </>
                    ) : !isStoreOpen() ? (
                      <>
                        <div className="w-5 h-5 bg-red-500 rounded-full"></div>
                        Loja Fechada
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5" />
                        Finalizar Pedido
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Resumo do Pedido */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Resumo do Pedido
                </h3>
                
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-800">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {/* Taxa de entrega - só aparece se for entrega */}
                  {formData.deliveryType === 'delivery' && (
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
                  
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between text-lg font-bold text-gray-800">
                      <span>Total:</span>
                      <span>
                        R$ {formData.deliveryType === 'delivery' 
                          ? (total + (total >= settings.free_delivery_threshold ? 0 : settings.delivery_fee)).toFixed(2).replace('.', ',')
                          : total.toFixed(2).replace('.', ',')
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;

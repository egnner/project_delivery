import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import CEPInput from '../components/CEPInput';
import { phoneMask, removePhoneMask } from '../utils/inputMasks';
import { 
  CreditCard, 
  Smartphone, 
  DollarSign, 
  Truck, 
  CheckCircle, 
  ArrowLeft,
  AlertCircle,
  MapPin,
  User,
  Phone,
  MessageSquare
} from 'lucide-react';
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
      setCustomerInfo({
        name: formData.name,
        phone: formData.phone,
        address: `${formData.address}, ${formData.number}, ${formData.neighborhood}, ${formData.city} - ${formData.state}`
      });

      const orderData = {
        customer_name: formData.name,
        customer_phone: removePhoneMask(formData.phone),
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
        
        if (socket) {
          socket.emit('join-client', order.data.id);
        }
        
        navigate(`/order/${order.data.id}`);
      } else {
        const errorData = await response.json();
        
        if (response.status === 403 && errorData.error === 'Loja fechada') {
          alert('A loja está fechada no momento. Não é possível finalizar pedidos fora do horário de funcionamento.');
        } else {
          throw new Error(errorData.message || 'Erro ao criar pedido');
        }
      }
    } catch (error) {
      console.error('Erro:', error);
      
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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg max-w-md">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pedido Enviado com Sucesso!
          </h2>
          <p className="text-gray-600 mb-6">
            Seu pedido foi recebido e está sendo processado.
          </p>
          <div className="animate-pulse mb-6">
            <p className="text-sm text-gray-500">
              Redirecionando para acompanhamento...
            </p>
          </div>
          <Link
            to="/"
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
          >
            Voltar ao Início
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
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link 
                to="/cart"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Finalizar Pedido</h1>
                <p className="text-gray-600">Complete suas informações para receber seu pedido</p>
              </div>
            </div>
            
            {!isStoreOpen() && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-red-800">Loja Fechada</span>
                </div>
                <p className="text-sm text-red-700">
                  Não é possível finalizar pedidos fora do horário de funcionamento.
                </p>
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-8">
            {/* Formulário */}
            <div className="col-span-2">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Informações Pessoais */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Informações Pessoais</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
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
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
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
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Tipo de Entrega */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Truck className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Como você quer receber seu pedido?</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {settings.delivery_enabled && (
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.deliveryType === 'delivery' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryType"
                          value="delivery"
                          checked={formData.deliveryType === 'delivery'}
                          onChange={handleInputChange}
                          className="mr-3 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex items-center">
                          <Truck className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">Entrega</div>
                            <div className="text-sm text-gray-500">
                              {total >= settings.free_delivery_threshold 
                                ? 'Entrega gratuita!' 
                                : `Taxa: R$ ${settings.delivery_fee?.toFixed(2) || '0,00'}`
                              }
                            </div>
                          </div>
                        </div>
                      </label>
                    )}
                    
                    {settings.pickup_enabled && (
                      <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.deliveryType === 'pickup' 
                          ? 'border-red-500 bg-red-50' 
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="deliveryType"
                          value="pickup"
                          checked={formData.deliveryType === 'pickup'}
                          onChange={handleInputChange}
                          className="mr-3 text-red-600 focus:ring-red-500"
                        />
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-red-600 mr-3" />
                          <div>
                            <div className="font-medium text-gray-900">Retirada no Balcão</div>
                            <div className="text-sm text-gray-500">Sem taxa de entrega</div>
                          </div>
                        </div>
                      </label>
                    )}
                  </div>
                </div>

                {/* Endereço */}
                {formData.deliveryType === 'delivery' && (
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-gray-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Endereço de Entrega</h3>
                    </div>
                    
                    <div className="space-y-4">
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
                          placeholder="Rua, avenida..."
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                        />
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bairro
                          </label>
                          <input
                            type="text"
                            name="neighborhood"
                            value={formData.neighborhood}
                            onChange={handleInputChange}
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
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
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
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
                            className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Método de Pagamento */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-4 h-4 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Método de Pagamento</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentMethod === 'pix' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="pix"
                        checked={formData.paymentMethod === 'pix'}
                        onChange={handleInputChange}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center">
                        <Smartphone className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium">PIX</span>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentMethod === 'cartao' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cartao"
                        checked={formData.paymentMethod === 'cartao'}
                        onChange={handleInputChange}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">Cartão</span>
                      </div>
                    </label>
                    
                    <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.paymentMethod === 'dinheiro' ? 'border-red-500 bg-red-50' : 'border-gray-300 hover:bg-gray-50'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="dinheiro"
                        checked={formData.paymentMethod === 'dinheiro'}
                        onChange={handleInputChange}
                        className="mr-3 text-red-600 focus:ring-red-500"
                      />
                      <div className="flex items-center">
                        <DollarSign className="w-5 h-5 text-green-600 mr-2" />
                        <span className="font-medium">Dinheiro</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Observações */}
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                    </div>
                    <label className="text-lg font-semibold text-gray-900">
                      Observações
                    </label>
                  </div>
                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Instruções especiais para entrega..."
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  />
                </div>

                {/* Botão Submit */}
                <button
                  type="submit"
                  disabled={loading || !isStoreOpen()}
                  className={`w-full py-4 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    isStoreOpen() 
                      ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed'
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
                      <AlertCircle className="w-5 h-5" />
                      Loja Fechada
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Finalizar Pedido
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Resumo do Pedido */}
            <div className="col-span-1">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 sticky top-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Resumo do Pedido
                </h3>
                
                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start">
                      <div className="flex-1 mr-3">
                        <p className="font-medium text-gray-900 text-sm leading-tight">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity}x R$ {item.price.toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-gray-300 pt-4 space-y-2">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal:</span>
                    <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                  
                  {formData.deliveryType === 'delivery' && (
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
                  
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
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

      {/* Layout Mobile */}
      <div className="lg:hidden min-h-screen pb-32">
        {/* Header Mobile */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-16 z-30">
          <div className="flex items-center gap-3">
            <Link 
              to="/cart"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Finalizar Pedido</h1>
              <p className="text-sm text-gray-600">Complete suas informações</p>
            </div>
          </div>
          
          {!isStoreOpen() && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-800 text-sm">Loja Fechada</span>
              </div>
            </div>
          )}
        </div>

        {/* Formulário Mobile */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Informações Pessoais */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Informações Pessoais</h3>
              </div>
              
              <div className="space-y-4">
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
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Tipo de Entrega */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <Truck className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Tipo de Entrega</h3>
              </div>
              
              <div className="space-y-3">
                {settings.delivery_enabled && (
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.deliveryType === 'delivery' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="delivery"
                      checked={formData.deliveryType === 'delivery'}
                      onChange={handleInputChange}
                      className="mr-3 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <Truck className="w-4 h-4 text-red-600 mr-2" />
                        <span className="font-medium">Entrega</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {total >= settings.free_delivery_threshold 
                          ? 'Entrega gratuita!' 
                          : `Taxa: R$ ${settings.delivery_fee?.toFixed(2) || '0,00'}`
                        }
                      </div>
                    </div>
                  </label>
                )}
                
                {settings.pickup_enabled && (
                  <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.deliveryType === 'pickup' 
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name="deliveryType"
                      value="pickup"
                      checked={formData.deliveryType === 'pickup'}
                      onChange={handleInputChange}
                      className="mr-3 text-red-600"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="font-medium">Retirada no Balcão</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        Sem taxa de entrega
                      </div>
                    </div>
                  </label>
                )}
              </div>
            </div>

            {/* Endereço Mobile */}
            {formData.deliveryType === 'delivery' && (
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-4 h-4 text-gray-600" />
                  <h3 className="font-semibold text-gray-900">Endereço de Entrega</h3>
                </div>
                
                <div className="space-y-4">
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
                      placeholder="Rua, avenida..."
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bairro
                      </label>
                      <input
                        type="text"
                        name="neighborhood"
                        value={formData.neighborhood}
                        onChange={handleInputChange}
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
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
                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                      />
                    </div>
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
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Método de Pagamento Mobile */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-4 h-4 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Método de Pagamento</h3>
              </div>
              
              <div className="space-y-3">
                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'pix' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="pix"
                    checked={formData.paymentMethod === 'pix'}
                    onChange={handleInputChange}
                    className="mr-3 text-red-600"
                  />
                  <div className="flex items-center">
                    <Smartphone className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium">PIX</span>
                  </div>
                </label>
                
                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'cartao' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cartao"
                    checked={formData.paymentMethod === 'cartao'}
                    onChange={handleInputChange}
                    className="mr-3 text-red-600"
                  />
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="font-medium">Cartão</span>
                  </div>
                </label>
                
                <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.paymentMethod === 'dinheiro' ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="dinheiro"
                    checked={formData.paymentMethod === 'dinheiro'}
                    onChange={handleInputChange}
                    className="mr-3 text-red-600"
                  />
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                    <span className="font-medium">Dinheiro</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Observações Mobile */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-gray-600" />
                <label className="font-semibold text-gray-900">
                  Observações
                </label>
              </div>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                placeholder="Instruções especiais para entrega..."
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
              />
            </div>
          </form>
        </div>

        {/* Footer Mobile com Resumo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-40">
          {/* Resumo Mobile */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-gray-700">Subtotal:</span>
              <span className="font-bold text-gray-900">R$ {total.toFixed(2).replace('.', ',')}</span>
            </div>
            
            {formData.deliveryType === 'delivery' && (
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
                  R$ {formData.deliveryType === 'delivery' 
                    ? (total + (total >= settings.free_delivery_threshold ? 0 : settings.delivery_fee)).toFixed(2).replace('.', ',')
                    : total.toFixed(2).replace('.', ',')
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Botão Mobile */}
          <button
            type="submit"
            form="checkout-form"
            disabled={loading || !isStoreOpen()}
            className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
              isStoreOpen() 
                ? 'bg-red-500 text-white hover:bg-red-600 disabled:opacity-50'
                : 'bg-gray-400 text-white cursor-not-allowed'
            }`}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Processando...
              </>
            ) : !isStoreOpen() ? (
              <>
                <AlertCircle className="w-5 h-5" />
                Loja Fechada
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Finalizar Pedido
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Upload, 
  Store, 
  Clock, 
  Phone, 
  MapPin, 
  Image as ImageIcon,
  Truck,
  Search,
  CreditCard,
  Smartphone,
  DollarSign,
  Settings as SettingsIcon
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useViaCEP } from '../hooks/useViaCEP';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { searchCEP, loading: cepLoading, error: cepError, clearError } = useViaCEP();
  const [formData, setFormData] = useState({
    store_name: '',
    store_logo: '',
    contact_phone: '',
    contact_email: '',
    address: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zip_code: '',
    opening_hours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false }
    },
    delivery_info: '',
    delivery_enabled: true,
    pickup_enabled: true,
    min_order_amount: 0,
    delivery_fee: 0,
    free_delivery_threshold: 0,
    show_contact_info: true,
    payment_methods: ['dinheiro', 'pix', 'cartao'],
    payment_pix_enabled: true,
    payment_cartao_enabled: true,
    payment_dinheiro_enabled: true,
    payment_gateway_enabled: false,
    payment_gateway_provider: '',
    payment_gateway_credentials: ''
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      const response = await fetch('http://localhost:3000/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Converter valores numéricos para string para os inputs e garantir valores booleanos
          const settings = {
            ...data.data,
            min_order_amount: data.data.min_order_amount?.toString() || '',
            delivery_fee: data.data.delivery_fee?.toString() || '',
            free_delivery_threshold: data.data.free_delivery_threshold?.toString() || '',
            // Garantir que os valores booleanos sejam booleanos
            payment_dinheiro_enabled: Boolean(data.data.payment_dinheiro_enabled),
            payment_pix_enabled: Boolean(data.data.payment_pix_enabled),
            payment_cartao_enabled: Boolean(data.data.payment_cartao_enabled),
            payment_gateway_enabled: Boolean(data.data.payment_gateway_enabled),
            delivery_enabled: Boolean(data.data.delivery_enabled),
            pickup_enabled: Boolean(data.data.pickup_enabled),
            show_contact_info: Boolean(data.data.show_contact_info)
          };
          
          // Garantir que opening_hours seja um objeto válido
          console.log('Dados recebidos da API:', data.data);
          console.log('Tipo de opening_hours:', typeof settings.opening_hours);
          console.log('Valor de opening_hours:', settings.opening_hours);
          
          if (typeof settings.opening_hours === 'string') {
            try {
              settings.opening_hours = JSON.parse(settings.opening_hours);
            } catch (e) {
              console.error('Erro ao fazer parse dos horários:', e);
              // Usar horários padrão se der erro
              settings.opening_hours = {
                monday: { open: '08:00', close: '22:00', closed: false },
                tuesday: { open: '08:00', close: '22:00', closed: false },
                wednesday: { open: '08:00', close: '22:00', closed: false },
                thursday: { open: '08:00', close: '22:00', closed: false },
                friday: { open: '08:00', close: '23:00', closed: false },
                saturday: { open: '09:00', close: '23:00', closed: false },
                sunday: { open: '10:00', close: '22:00', closed: false }
              };
            }
          }
          
          setFormData(settings);
        }
      } else {
        toast.error('Erro ao carregar configurações');
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast.error('Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpar erro do CEP quando o usuário digitar
    if (name === 'zip_code') {
      clearError();
    }
  };

  const handleCEPBlur = async () => {
    if (formData.zip_code && formData.zip_code.length >= 8) {
      const addressData = await searchCEP(formData.zip_code);
      if (addressData) {
        setFormData(prev => ({
          ...prev,
          address: addressData.logradouro || '',
          neighborhood: addressData.bairro || '',
          city: addressData.localidade || '',
          state: addressData.uf || ''
        }));
      }
    }
  };

  const handleOpeningHoursChange = (day, field, value) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [day]: {
          ...prev.opening_hours[day],
          [field]: value
        }
      }
    }));
  };

  const getDayLabel = (day) => {
    const labels = {
      monday: 'Segunda-feira',
      tuesday: 'Terça-feira',
      wednesday: 'Quarta-feira',
      thursday: 'Quinta-feira',
      friday: 'Sexta-feira',
      saturday: 'Sábado',
      sunday: 'Domingo'
    };
    return labels[day] || day;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que pelo menos um método de pagamento está selecionado
    const selectedPaymentMethods = [
      ...(formData.payment_dinheiro_enabled ? ['dinheiro'] : []),
      ...(formData.payment_pix_enabled ? ['pix'] : []),
      ...(formData.payment_cartao_enabled ? ['cartao'] : [])
    ];
    
    if (selectedPaymentMethods.length === 0) {
      toast.error('Selecione pelo menos uma forma de pagamento');
      return;
    }
    
    try {
      setSaving(true);
      
      const response = await fetch('http://localhost:3000/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({
          ...formData,
          min_order_amount: parseFloat(formData.min_order_amount) || 0,
          delivery_fee: parseFloat(formData.delivery_fee) || 0,
          free_delivery_threshold: parseFloat(formData.free_delivery_threshold) || 0,
          payment_methods: selectedPaymentMethods
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          toast.success('Configurações salvas com sucesso!');
        } else {
          toast.error(data.message || 'Erro ao salvar configurações');
        }
      } else {
        toast.error('Erro ao salvar configurações');
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast.error('Erro ao salvar configurações');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações da Loja</h1>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Store className="w-5 h-5 text-primary-600" />
              Informações Básicas
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome da Loja *
                </label>
                <input
                  type="text"
                  name="store_name"
                  value={formData.store_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nome da sua loja"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo da Loja
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                    {formData.store_logo ? (
                      <img src={formData.store_logo} alt="Logo" className="w-12 h-12 object-contain" />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <button
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Funcionalidade de upload será implementada em breve
                </p>
              </div>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary-600" />
              Informações de Contato
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                  required
                  placeholder="(11) 99999-9999"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                  placeholder="contato@loja.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Endereço da Loja */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-600" />
              Endereço da Loja
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CEP com busca automática */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="zip_code"
                    value={formData.zip_code}
                    onChange={handleAddressChange}
                    onBlur={handleCEPBlur}
                    placeholder="00000-000"
                    className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                    {cepLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    ) : (
                      <MapPin className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </div>
                {cepError && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <Search className="w-4 h-4" />
                    {cepError}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Endereço Completo *
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleAddressChange}
                  required
                  placeholder="Rua, avenida, etc."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  name="number"
                  value={formData.number}
                  onChange={handleAddressChange}
                  required
                  placeholder="123"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bairro
                </label>
                <input
                  type="text"
                  name="neighborhood"
                  value={formData.neighborhood}
                  onChange={handleAddressChange}
                  placeholder="Centro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleAddressChange}
                  required
                  placeholder="São Paulo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleAddressChange}
                  required
                  placeholder="SP"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Controles de Visibilidade */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary-600" />
              Controles de Visibilidade
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Configure quais informações serão exibidas no site público
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="show_contact_info"
                  name="show_contact_info"
                  checked={formData.show_contact_info}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_contact_info: e.target.checked }))}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                />
                <label htmlFor="show_contact_info" className="text-sm font-medium text-gray-700">
                  Exibir endereço e dados de contato no menu lateral
                </label>
              </div>
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary-600" />
              Horário de Funcionamento
            </h2>
            
            <div className="space-y-4">
              {Object.entries(formData.opening_hours).map(([day, hours]) => (
                <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="w-32">
                    <span className="font-medium text-gray-700">{getDayLabel(day)}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={!hours.closed}
                      onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-600">Aberto</span>
                  </div>
                  
                  {!hours.closed && (
                    <>
                      <input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                      <span className="text-gray-500">às</span>
                      <input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Configurações de Entrega */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary-600" />
              Configurações de Entrega
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pedido Mínimo (R$)
                </label>
                <input
                  type="number"
                  name="min_order_amount"
                  value={formData.min_order_amount}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Taxa de Entrega (R$)
                </label>
                <input
                  type="number"
                  name="delivery_fee"
                  value={formData.delivery_fee}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Entrega Grátis a partir de (R$)
                </label>
                <input
                  type="number"
                  name="free_delivery_threshold"
                  value={formData.free_delivery_threshold}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Configurações de Entrega e Retirada */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Configurações de Entrega e Retirada</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="delivery_enabled"
                    checked={formData.delivery_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, delivery_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Ativar Entrega
                  </label>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="pickup_enabled"
                    checked={formData.pickup_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, pickup_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm font-medium text-gray-700">
                    Ativar Retirada no Balcão
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Informações de Entrega
              </label>
              <textarea
                name="delivery_info"
                value={formData.delivery_info}
                onChange={handleInputChange}
                rows="3"
                placeholder="Informações sobre prazo de entrega, regiões atendidas, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Configurações de Pagamento */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-primary-600" />
              Configurações de Pagamento
            </h2>
            
            <p className="text-sm text-gray-600 mb-6">
              Configure os métodos de pagamento disponíveis para seus clientes
            </p>

            {/* Métodos de Pagamento Básicos */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Métodos de Pagamento</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Dinheiro */}
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="payment_dinheiro_enabled"
                    name="payment_dinheiro_enabled"
                    checked={formData.payment_dinheiro_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_dinheiro_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payment_dinheiro_enabled" className="ml-3 flex items-center gap-2 cursor-pointer">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">Dinheiro</span>
                  </label>
                </div>

                {/* PIX */}
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="payment_pix_enabled"
                    name="payment_pix_enabled"
                    checked={formData.payment_pix_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_pix_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payment_pix_enabled" className="ml-3 flex items-center gap-2 cursor-pointer">
                    <Smartphone className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-gray-700">PIX</span>
                  </label>
                </div>

                {/* Cartão */}
                <div className="flex items-center p-4 border border-gray-200 rounded-lg">
                  <input
                    type="checkbox"
                    id="payment_cartao_enabled"
                    name="payment_cartao_enabled"
                    checked={formData.payment_cartao_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_cartao_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payment_cartao_enabled" className="ml-3 flex items-center gap-2 cursor-pointer">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <span className="font-medium text-gray-700">Cartão</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Gateway de Pagamento */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Gateway de Pagamento (Futuro)</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="payment_gateway_enabled"
                    name="payment_gateway_enabled"
                    checked={formData.payment_gateway_enabled}
                    onChange={(e) => setFormData(prev => ({ ...prev, payment_gateway_enabled: e.target.checked }))}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="payment_gateway_enabled" className="ml-2 block text-sm font-medium text-gray-700">
                    Ativar integração com gateway de pagamento
                  </label>
                </div>

                {formData.payment_gateway_enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Provedor do Gateway
                      </label>
                      <select
                        name="payment_gateway_provider"
                        value={formData.payment_gateway_provider}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="">Selecione um provedor</option>
                        <option value="mercadopago">Mercado Pago</option>
                        <option value="stripe">Stripe</option>
                        <option value="paypal">PayPal</option>
                        <option value="pagseguro">PagSeguro</option>
                        <option value="asaas">Asaas</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Credenciais (JSON)
                      </label>
                      <textarea
                        name="payment_gateway_credentials"
                        value={formData.payment_gateway_credentials}
                        onChange={handleInputChange}
                        rows="3"
                        placeholder='{"api_key": "sua_chave_aqui", "secret_key": "sua_chave_secreta"}'
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <SettingsIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-900">Integração Futura</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Esta funcionalidade permitirá integração com gateways de pagamento para processamento automático de PIX e cartão de crédito/débito.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Botão Salvar */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Salvar Configurações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;

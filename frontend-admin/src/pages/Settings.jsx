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
  Search
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
    free_delivery_threshold: 0
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
          // Converter valores numéricos para string para os inputs
          const settings = {
            ...data.data,
            min_order_amount: data.data.min_order_amount?.toString() || '',
            delivery_fee: data.data.delivery_fee?.toString() || '',
            free_delivery_threshold: data.data.free_delivery_threshold?.toString() || ''
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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
          free_delivery_threshold: parseFloat(formData.free_delivery_threshold) || 0
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

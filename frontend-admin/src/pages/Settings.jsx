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
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Info,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useViaCEP } from '../hooks/useViaCEP';

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { searchCEP, loading: cepLoading, error: cepError, clearError } = useViaCEP();
  const [activeSection, setActiveSection] = useState('basic');
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
          const settings = {
            ...data.data,
            min_order_amount: data.data.min_order_amount?.toString() || '',
            delivery_fee: data.data.delivery_fee?.toString() || '',
            free_delivery_threshold: data.data.free_delivery_threshold?.toString() || '',
            payment_dinheiro_enabled: Boolean(data.data.payment_dinheiro_enabled),
            payment_pix_enabled: Boolean(data.data.payment_pix_enabled),
            payment_cartao_enabled: Boolean(data.data.payment_cartao_enabled),
            payment_gateway_enabled: Boolean(data.data.payment_gateway_enabled),
            delivery_enabled: Boolean(data.data.delivery_enabled),
            pickup_enabled: Boolean(data.data.pickup_enabled),
            show_contact_info: Boolean(data.data.show_contact_info)
          };

          if (typeof settings.opening_hours === 'string') {
            try {
              settings.opening_hours = JSON.parse(settings.opening_hours);
            } catch (e) {
              console.error('Erro ao fazer parse dos horários:', e);
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

  // Stats calculados
  const stats = {
    deliveryMethods: (formData.delivery_enabled ? 1 : 0) + (formData.pickup_enabled ? 1 : 0),
    paymentMethods: [formData.payment_dinheiro_enabled, formData.payment_pix_enabled, formData.payment_cartao_enabled].filter(Boolean).length,
    openDays: Object.values(formData.opening_hours).filter(day => !day.closed).length,
    isComplete: formData.store_name && formData.contact_phone && formData.address && formData.city
  };

  const sections = [
    { id: 'basic', label: 'Informações Básicas', icon: Store },
    { id: 'contact', label: 'Contato & Endereço', icon: Phone },
    { id: 'hours', label: 'Funcionamento', icon: Clock },
    { id: 'delivery', label: 'Entrega', icon: Truck },
    { id: 'payment', label: 'Pagamento', icon: CreditCard },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Configurações da Loja
              </h1>
              <p className="text-gray-600">
                Configure as informações gerais da sua loja
              </p>
            </div>
            <div className="flex items-center gap-2">
              {stats.isComplete ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Perfil Completo</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Configuração Incompleta</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.isComplete ? '100%' : '75%'}</p>
                <p className="text-sm text-gray-600">Perfil Completo</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Truck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.deliveryMethods}</p>
                <p className="text-sm text-gray-600">Métodos de Entrega</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.paymentMethods}</p>
                <p className="text-sm text-gray-600">Formas de Pagamento</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.openDays}/7</p>
                <p className="text-sm text-gray-600">Dias de Funcionamento</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar de Navegação */}
          <div className="lg:w-80">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Seções</h3>
              <nav className="space-y-2">
                {sections.map((section) => {
                  const IconComponent = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === section.id
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'text-gray-700 hover:bg-gray-50'
                        }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Informações Básicas */}
              {activeSection === 'basic' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-600" />
                    Informações Básicas
                  </h2>

                  <div className="space-y-6">
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
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo da Loja
                      </label>
                      <div className="flex items-center gap-6">
                        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                          {formData.store_logo ? (
                            <img src={formData.store_logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                          ) : (
                            <ImageIcon className="w-10 h-10 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <button
                            type="button"
                            className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-gray-600 hover:text-blue-600"
                          >
                            <Upload className="w-5 h-5" />
                            Upload Logo
                          </button>
                          <p className="text-xs text-gray-500 mt-2">
                            Recomendado: 200x200px, PNG ou JPG
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Sobre as Informações Básicas</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          O nome da sua loja aparecerá no topo do cardápio e será usado para identificar seu negócio. O logo será exibido junto ao nome.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Informações de Contato e Endereço */}
              {activeSection === 'contact' && (
                <div className="space-y-8">
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <Phone className="w-5 h-5 text-blue-600" />
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="show_contact_info"
                          name="show_contact_info"
                          checked={formData.show_contact_info}
                          onChange={(e) => setFormData(prev => ({ ...prev, show_contact_info: e.target.checked }))}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                        <label htmlFor="show_contact_info" className="text-sm font-medium text-gray-700">
                          Exibir informações de contato no menu lateral
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      Endereço da Loja
                    </h2>

                    <div className="space-y-6">
                      <div>
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
                            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                          <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                            {cepLoading ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
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

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-3">
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Horário de Funcionamento */}
              {activeSection === 'hours' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Clock className="w-5 h-5 text-blue-600" />
                    Horário de Funcionamento
                  </h2>

                  <div className="space-y-4">
                    {Object.entries(formData.opening_hours).map(([day, hours]) => (
                      <div key={day} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <div className="w-32">
                          <span className="font-medium text-gray-700">{getDayLabel(day)}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={!hours.closed}
                            onChange={(e) => handleOpeningHoursChange(day, 'closed', !e.target.checked)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-600">Aberto</span>
                        </div>

                        {!hours.closed && (
                          <div className="flex items-center gap-3">
                            <input
                              type="time"
                              value={hours.open}
                              onChange={(e) => handleOpeningHoursChange(day, 'open', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                            <span className="text-gray-500">às</span>
                            <input
                              type="time"
                              value={hours.close}
                              onChange={(e) => handleOpeningHoursChange(day, 'close', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-medium text-blue-900">Sobre os Horários</h4>
                        <p className="text-sm text-blue-700 mt-1">
                          Os horários de funcionamento são exibidos no cardápio e utilizados para controlar quando os pedidos podem ser feitos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Entrega */}
              {activeSection === 'delivery' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <Truck className="w-5 h-5 text-blue-600" />
                    Configurações de Entrega
                  </h2>

                  <div className="space-y-8">
                    {/* Tipos de Entrega */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Métodos Disponíveis</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                          <input
                            type="checkbox"
                            name="delivery_enabled"
                            checked={formData.delivery_enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, delivery_enabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Truck className="w-5 h-5 text-blue-600" />
                              <label className="text-sm font-medium text-gray-900">
                                Entrega em Domicílio
                              </label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Permite que os clientes recebam os pedidos em casa
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                          <input
                            type="checkbox"
                            name="pickup_enabled"
                            checked={formData.pickup_enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, pickup_enabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Store className="w-5 h-5 text-green-600" />
                              <label className="text-sm font-medium text-gray-900">
                                Retirada no Balcão
                              </label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Clientes podem buscar os pedidos na loja
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Valores de Entrega */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Valores e Limites</h3>
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
                            placeholder="0.00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">Valor mínimo para fazer pedidos</p>
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
                            placeholder="0.00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">Valor cobrado pela entrega</p>
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
                            placeholder="0.00"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                          />
                          <p className="text-xs text-gray-500 mt-1">Valor para isentar taxa de entrega</p>
                        </div>
                      </div>
                    </div>

                    {/* Informações de Entrega */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Informações Adicionais sobre Entrega
                      </label>
                      <textarea
                        name="delivery_info"
                        value={formData.delivery_info}
                        onChange={handleInputChange}
                        rows="4"
                        placeholder="Ex: Entregamos de segunda a domingo. Tempo estimado: 30-45 minutos. Atendemos um raio de 5km da loja."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Estas informações aparecerão no cardápio para orientar os clientes
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Configurações de Pagamento */}
              {activeSection === 'payment' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Configurações de Pagamento
                  </h2>

                  <div className="space-y-8">
                    {/* Métodos de Pagamento Básicos */}
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Métodos de Pagamento</h3>
                      <p className="text-sm text-gray-600 mb-6">
                        Selecione as formas de pagamento que sua loja aceita
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Dinheiro */}
                        <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-green-200 transition-colors">
                          <input
                            type="checkbox"
                            id="payment_dinheiro_enabled"
                            name="payment_dinheiro_enabled"
                            checked={formData.payment_dinheiro_enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, payment_dinheiro_enabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <DollarSign className="w-5 h-5 text-green-600" />
                              <label htmlFor="payment_dinheiro_enabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Dinheiro
                              </label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Pagamento em dinheiro na entrega ou retirada
                            </p>
                          </div>
                        </div>

                        {/* PIX */}
                        <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-green-200 transition-colors">
                          <input
                            type="checkbox"
                            id="payment_pix_enabled"
                            name="payment_pix_enabled"
                            checked={formData.payment_pix_enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, payment_pix_enabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Smartphone className="w-5 h-5 text-green-600" />
                              <label htmlFor="payment_pix_enabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                                PIX
                              </label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Transferência instantânea via PIX
                            </p>
                          </div>
                        </div>

                        {/* Cartão */}
                        <div className="flex items-start p-4 border border-gray-200 rounded-lg hover:border-blue-200 transition-colors">
                          <input
                            type="checkbox"
                            id="payment_cartao_enabled"
                            name="payment_cartao_enabled"
                            checked={formData.payment_cartao_enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, payment_cartao_enabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-4 flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                              <label htmlFor="payment_cartao_enabled" className="text-sm font-medium text-gray-900 cursor-pointer">
                                Cartão
                              </label>
                            </div>
                            <p className="text-sm text-gray-600">
                              Cartão de crédito ou débito
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Gateway de Pagamento */}
                    <div className="border-t border-gray-200 pt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <SettingsIcon className="w-5 h-5 text-purple-600" />
                        <h3 className="text-lg font-medium text-gray-900">Gateway de Pagamento</h3>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                          Futuro
                        </span>
                      </div>

                      <div className="space-y-6">
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            id="payment_gateway_enabled"
                            name="payment_gateway_enabled"
                            checked={formData.payment_gateway_enabled}
                            onChange={(e) => setFormData(prev => ({ ...prev, payment_gateway_enabled: e.target.checked }))}
                            className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <label htmlFor="payment_gateway_enabled" className="text-sm font-medium text-gray-900">
                              Ativar integração com gateway de pagamento
                            </label>
                            <p className="text-sm text-gray-600 mt-1">
                              Processa pagamentos PIX e cartão automaticamente
                            </p>
                          </div>
                        </div>

                        {formData.payment_gateway_enabled && (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-7 p-4 bg-gray-50 rounded-lg">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Provedor do Gateway
                              </label>
                              <select
                                name="payment_gateway_provider"
                                value={formData.payment_gateway_provider}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors bg-white"
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
                                placeholder='{"api_key": "sua_chave_aqui"}'
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                              />
                            </div>
                          </div>
                        )}

                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-purple-600 mt-0.5" />
                            <div>
                              <h4 className="text-sm font-medium text-purple-900">Integração Futura</h4>
                              <p className="text-sm text-purple-700 mt-1">
                                Esta funcionalidade permitirá integração com gateways de pagamento para processamento automático de PIX e cartão de crédito/débito, com confirmação instantânea de pagamentos.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aviso sobre métodos de pagamento */}
                    {!formData.payment_dinheiro_enabled && !formData.payment_pix_enabled && !formData.payment_cartao_enabled && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                          <div>
                            <h4 className="text-sm font-medium text-red-900">Atenção</h4>
                            <p className="text-sm text-red-700 mt-1">
                              Você deve selecionar pelo menos uma forma de pagamento para que os clientes possam finalizar seus pedidos.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botão Salvar */}
              <div className="mt-8 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-blue-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
      </div>
    </div>
  );
};

export default Settings;
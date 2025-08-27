import React from 'react';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import { MapPin, Phone, Mail, Clock, Truck, Star } from 'lucide-react';

const About = () => {
  const { settings, formatOpeningHours, isStoreOpen } = useStoreSettings();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-6">
            {settings.store_logo ? (
              <img 
                src={settings.store_logo} 
                alt={`Logo ${settings.store_name}`}
                className="w-20 h-20 mx-auto mb-4 object-contain"
              />
            ) : (
              <span className="text-5xl mb-4 block">🍕</span>
            )}
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sobre {settings.store_name}
          </h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Conheça nossa história, valores e compromisso com a qualidade
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* História da Loja */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Nossa História
            </h2>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-600 leading-relaxed mb-4">
                {settings.about_us}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Desde o início, nossa missão tem sido entregar não apenas alimentos deliciosos, 
                mas também uma experiência gastronômica excepcional, diretamente na sua casa.
              </p>
            </div>
          </div>

          {/* Informações de Contato */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Informações de Contato
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">{settings.contact_phone}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-primary-600" />
                <span className="text-gray-700">{settings.contact_email}</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-primary-600 mt-1" />
                <div>
                  {settings.show_address && (
                    <>
                      <p className="text-gray-700">{settings.address}, {settings.number}</p>
                      <p className="text-gray-600 text-sm">
                        {settings.neighborhood}, {settings.city} - {settings.state}
                      </p>
                    </>
                  )}
                  {settings.zip_code && (
                    <p className="text-gray-600 text-sm">CEP: {settings.zip_code}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Horários e Delivery */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mt-12">
          {/* Horários de Funcionamento */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-primary-600" />
              Horários de Funcionamento
            </h2>
            
            {/* Status Atual */}
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
            </div>

            {/* Horários Detalhados */}
            <div className="space-y-3">
              {Object.entries(settings.opening_hours).map(([day, hours]) => {
                const dayLabels = {
                  monday: 'Segunda-feira',
                  tuesday: 'Terça-feira',
                  wednesday: 'Quarta-feira',
                  thursday: 'Quinta-feira',
                  friday: 'Sexta-feira',
                  saturday: 'Sábado',
                  sunday: 'Domingo'
                };

                return (
                  <div key={day} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                    <span className="font-medium text-gray-700">{dayLabels[day]}</span>
                    <span className="text-gray-600">
                      {hours.closed ? (
                        <span className="text-red-600 font-medium">Fechado</span>
                      ) : (
                        `${hours.open} - ${hours.close}`
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Informações de Delivery */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <Truck className="w-6 h-6 text-primary-600" />
              Informações de Delivery
            </h2>
            
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-800 text-sm">
                  {settings.delivery_info}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Pedido Mínimo:</span>
                  <span className="font-semibold text-gray-800">
                    R$ {settings.min_order_amount.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-700">Taxa de Entrega:</span>
                  <span className="font-semibold text-gray-800">
                    R$ {settings.delivery_fee.toFixed(2).replace('.', ',')}
                  </span>
                </div>
                
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-700">Entrega Grátis a partir de:</span>
                  <span className="font-semibold text-green-600">
                    R$ {settings.free_delivery_threshold.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Valores e Compromissos */}
        <div className="mt-12">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              Nossos Valores
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Qualidade</h3>
                <p className="text-gray-600">
                  Utilizamos apenas ingredientes frescos e de alta qualidade em todos os nossos pratos.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Rapidez</h3>
                <p className="text-gray-600">
                  Entregamos seus pedidos com agilidade, garantindo que cheguem quentes e no tempo certo.
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Star className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Satisfação</h3>
                <p className="text-gray-600">
                  Nosso compromisso é com a sua satisfação total, desde o pedido até a entrega.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;

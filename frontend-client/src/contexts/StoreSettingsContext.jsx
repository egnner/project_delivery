import { createContext, useContext, useState, useEffect } from 'react';

const StoreSettingsContext = createContext();

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings deve ser usado dentro de um StoreSettingsProvider');
  }
  return context;
};

export const StoreSettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    store_name: 'Delivery Express',
    contact_phone: '(11) 99999-9999',
    contact_email: 'contato@delivery.com',
    address: 'Rua das Flores, 123',
    neighborhood: 'Centro',
    city: 'São Paulo',
    state: 'SP',
    zip_code: '01234-567',
    opening_hours: {
      monday: { open: '08:00', close: '22:00', closed: false },
      tuesday: { open: '08:00', close: '22:00', closed: false },
      wednesday: { open: '08:00', close: '22:00', closed: false },
      thursday: { open: '08:00', close: '22:00', closed: false },
      friday: { open: '08:00', close: '23:00', closed: false },
      saturday: { open: '09:00', close: '23:00', closed: false },
      sunday: { open: '10:00', close: '22:00', closed: false }
    },

    delivery_info: 'Entregamos em toda a região com prazo médio de 30-45 minutos.',
    delivery_enabled: true,
    pickup_enabled: true,
    min_order_amount: 15.00,
    delivery_fee: 5.00,
    free_delivery_threshold: 50.00
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoreSettings();
  }, []);

  const loadStoreSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Garantir que opening_hours seja um objeto válido
          let openingHours = data.data.opening_hours;
          if (typeof openingHours === 'string') {
            try {
              openingHours = JSON.parse(openingHours);
            } catch (e) {
              console.error('Erro ao fazer parse dos horários:', e);
            }
          }
          
          setSettings({
            ...data.data,
            opening_hours: openingHours || settings.opening_hours
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações da loja:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para formatar horários de funcionamento
  const formatOpeningHours = () => {
    const days = {
      monday: 'Seg',
      tuesday: 'Ter',
      wednesday: 'Qua',
      thursday: 'Qui',
      friday: 'Sex',
      saturday: 'Sáb',
      sunday: 'Dom'
    };

    const weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    const weekend = ['saturday', 'sunday'];

    // Verificar se todos os dias úteis têm o mesmo horário
    const weekdaysHours = weekdays.map(day => settings.opening_hours[day]);
    const allWeekdaysSame = weekdaysHours.every(hours => 
      hours.open === weekdaysHours[0].open && hours.close === weekdaysHours[0].close
    );

    // Verificar se todos os fins de semana têm o mesmo horário
    const weekendHours = weekend.map(day => settings.opening_hours[day]);
    const allWeekendSame = weekendHours.every(hours => 
      hours.open === weekendHours[0].open && hours.close === weekendHours[0].close
    );

    if (allWeekdaysSame && allWeekendSame) {
      const weekdaysTime = `${weekdaysHours[0].open}-${weekdaysHours[0].close}`;
      const weekendTime = `${weekendHours[0].open}-${weekendHours[0].close}`;
      return `Seg-Sex ${weekdaysTime} | Sáb-Dom ${weekendTime}`;
    }

    // Se não for uniforme, retornar horários individuais
    return Object.entries(settings.opening_hours)
      .map(([day, hours]) => {
        if (hours.closed) return null;
        const dayLabel = days[day];
        return `${dayLabel} ${hours.open}-${hours.close}`;
      })
      .filter(Boolean)
      .join(' | ');
  };

  // Função para verificar se a loja está aberta
  const isStoreOpen = () => {
    const now = new Date();
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = days[now.getDay()];
    const currentTime = now.toLocaleTimeString('pt-BR', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });

    const todayHours = settings.opening_hours[currentDay];
    if (!todayHours || todayHours.closed) return false;

    return currentTime >= todayHours.open && currentTime <= todayHours.close;
  };

  const value = {
    settings,
    loading,
    formatOpeningHours,
    isStoreOpen,
    reloadSettings: loadStoreSettings
  };

  return (
    <StoreSettingsContext.Provider value={value}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

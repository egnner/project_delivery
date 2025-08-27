import { useEffect } from 'react';
import { useStoreSettings } from '../contexts/StoreSettingsContext';

const PageTitle = ({ suffix = " - Faça seu pedido!" }) => {
  const { settings } = useStoreSettings();

  useEffect(() => {
    if (settings.store_name) {
      document.title = `🍕 ${settings.store_name}${suffix}`;
    }
  }, [settings.store_name, suffix]);

  return null; // Este componente não renderiza nada visualmente
};

export default PageTitle;

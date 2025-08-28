import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  Eye, 
  Copy,
  Search,
  Filter,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  DollarSign,
  Smartphone,
  AlertCircle,
  MoreVertical,
  Mail,
  TrendingUp
} from 'lucide-react';
import { io } from 'socket.io-client';
import { api } from '../config/api';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [socket, setSocket] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [toasts, setToasts] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Função para adicionar toast
  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };
    
    setToasts(prev => [...prev, toast]);
    
    // Auto-remover toast
    setTimeout(() => {
      removeToast(id);
    }, duration);
    
    return id;
  };

  // Função para remover toast
  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Função para mostrar toast de sucesso
  const showSuccessToast = (message) => {
    addToast(message, 'success');
  };

  // Função para mostrar toast de erro
  const showErrorToast = (message) => {
    addToast(message, 'error');
  };

  // Função para mostrar toast de informação
  const showInfoToast = (message) => {
    addToast(message, 'info');
  };

  // Função para buscar cliente por telefone
  const fetchCustomerByPhone = async (phone) => {
    try {
      const response = await api.get(`/api/admin/customers?phone=${phone}`);
      if (response && response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return data.data[0]; // Retorna o primeiro cliente encontrado
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    }
    return null;
  };

  // Função para abrir modal do cliente
  const handleCustomerClick = async (order) => {
    const customer = await fetchCustomerByPhone(order.customer_phone);
    if (customer) {
      // Adiciona o endereço de entrega do pedido ao objeto do cliente
      setSelectedCustomer({ ...customer, order_delivery_address: order.delivery_address });
      setShowCustomerModal(true);
    } else {
      // Se não encontrar o cliente, mostrar dados básicos do pedido
      setSelectedCustomer({
        customer_name: order.customer_name,
        customer_phone: order.customer_phone,
        customer_address: order.customer_address,
        order_delivery_address: order.delivery_address,
        total_orders: 1,
        total_spent: order.total_amount,
        first_order_date: order.created_at,
        last_order_date: order.created_at
      });
      setShowCustomerModal(true);
    }
  };

  // Função para solicitar permissão de notificação
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      
      if (permission === 'granted') {
        console.log('✅ Permissão de notificação concedida');
      } else {
        console.log('❌ Permissão de notificação negada');
      }
    }
  };

  // Função para tocar som de notificação
  const playNotificationSound = () => {
    try {
      // Tentar usar arquivo de áudio personalizado primeiro
      const audio = new Audio();
      
      // Criar um beep personalizado usando Web Audio API
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Configurações do som
      const frequency = 800; // Hz - tom médio
      const duration = 0.4; // segundos
      const volume = 0.3; // volume moderado
      
      // Criar oscilador para o tom principal
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      // Configurar oscilador
      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine'; // Onda senoidal para som mais suave
      
      // Configurar envelope de volume (fade in/out)
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      // Conectar nós
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Tocar som
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
      
      console.log('🔊 Som de notificação personalizado tocado');
      
      // Adicionar um segundo beep mais agudo para chamar atenção
      setTimeout(() => {
        const oscillator2 = audioContext.createOscillator();
        const gainNode2 = audioContext.createGain();
        
        oscillator2.frequency.setValueAtTime(1000, audioContext.currentTime);
        oscillator2.type = 'sine';
        
        gainNode2.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode2.gain.linearRampToValueAtTime(volume * 0.7, audioContext.currentTime + 0.02);
        gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator2.connect(gainNode2);
        gainNode2.connect(audioContext.destination);
        
        oscillator2.start(audioContext.currentTime);
        oscillator2.stop(audioContext.currentTime + 0.2);
      }, 200);
      
    } catch (error) {
      console.error('❌ Erro ao tocar som personalizado:', error);
      
      // Fallback 1: Beep simples com data URL
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT');
        audio.volume = 0.5;
        audio.play();
        console.log('🔊 Fallback de áudio executado');
      } catch (fallbackError) {
        console.error('❌ Fallback de áudio também falhou:', fallbackError);
        
        // Fallback 2: Tentar usar o sistema de áudio do navegador
        try {
          // Criar um elemento de áudio com frequência específica
          const audioContext = new (window.AudioContext || window.webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
          oscillator.type = 'square'; // Onda quadrada para som mais audível
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
          
          console.log('🔊 Som de fallback final executado');
        } catch (finalError) {
          console.error('❌ Todos os métodos de áudio falharam:', finalError);
        }
      }
    }
  };

  // Função para mostrar notificação do navegador
  const showBrowserNotification = (title, body, icon = null) => {
    if (notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'new-order',
          requireInteraction: false, // Mudado para false para não bloquear
          silent: false, // Permitir som do sistema
          actions: [
            {
              action: 'view',
              title: '👁️ Ver Pedido'
            },
            {
              action: 'dismiss',
              title: '❌ Fechar'
            }
          ],
          // Adicionar dados extras para identificar o pedido
          data: {
            type: 'new-order',
            timestamp: new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })
          }
        });

        // Lidar com cliques na notificação
        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          
          // Aqui você pode adicionar lógica para destacar o pedido na lista
          // Por exemplo, rolar para o pedido ou abrir o modal
          
          notification.close();
        };

        // Lidar com ações da notificação
        notification.onaction = (event) => {
          event.preventDefault();
          
          if (event.action === 'view') {
            window.focus();
            // Lógica para visualizar o pedido
            console.log('👁️ Usuário clicou em "Ver Pedido"');
          } else if (event.action === 'dismiss') {
            console.log('❌ Usuário fechou a notificação');
          }
          
          notification.close();
        };

        // Lidar com fechamento da notificação
        notification.onclose = () => {
          console.log('🔔 Notificação fechada');
        };

        // Auto-fechar após 15 segundos (aumentado para dar mais tempo)
        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, 15000);

        console.log('🔔 Notificação do navegador exibida com sucesso');
        
        // Retornar a notificação para possível manipulação posterior
        return notification;
      } catch (error) {
        console.error('❌ Erro ao mostrar notificação:', error);
        return null;
      }
    } else {
      console.log('⚠️ Permissão de notificação não concedida');
      return null;
    }
  };

  // Função para notificar sobre novo pedido
  const notifyNewOrder = (order) => {
    // Tocar som
    playNotificationSound();
    
    // Mostrar notificação do navegador
    const notification = showBrowserNotification(
      '🆕 Novo Pedido Recebido!',
      `Pedido #${order.id} de ${order.customer_name} - R$ ${order.total_amount.toFixed(2).replace('.', ',')}`,
      '/favicon.ico'
    );
    
    // Mostrar toast de informação
    showInfoToast(`Novo pedido #${order.id} recebido de ${order.customer_name}`);
    
    // Se a notificação do navegador falhou, mostrar toast mais proeminente
    if (!notification) {
      showSuccessToast(`🆕 Novo pedido #${order.id} recebido!`);
    }
  };

  useEffect(() => {
    // Verificar permissão de notificação ao carregar
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
      
      // Se não foi solicitada permissão ainda, solicitar
      if (Notification.permission === 'default') {
        // Aguardar um pouco antes de solicitar para não ser intrusivo
        setTimeout(() => {
          requestNotificationPermission();
        }, 2000);
      }
    }

    // Conectar ao WebSocket
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Entrar na sala de admin
    newSocket.emit('join-admin');

    // Escutar eventos de novos pedidos
    newSocket.on('new-order', (data) => {
      console.log('🔔 Novo pedido recebido via WebSocket:', data);
      
      // Adicionar o novo pedido no início da lista
      setOrders(prevOrders => [data.order, ...prevOrders]);
      
      // Notificar sobre o novo pedido
      notifyNewOrder(data.order);
    });

    // Escutar eventos de pedidos atualizados
    newSocket.on('order-updated', (data) => {
      console.log('🔔 Pedido atualizado via WebSocket:', data);
      // Atualizar o pedido na lista
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === data.order.id ? data.order : order
        )
      );
    });

    return () => {
      newSocket.close();
    };
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      console.log('🔍 Debug - Buscando pedidos...');
      
      const response = await api.get('/api/admin/orders');
      
      if (response && response.ok) {
        const data = await response.json();
        console.log('✅ Debug - Pedidos carregados:', data.data?.length || 0);
        setOrders(data.data || []);
      } else if (response && response.error) {
        console.error('❌ Debug - Erro ao carregar pedidos:', response);
        showErrorToast(response.message || 'Erro ao carregar pedidos');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      showErrorToast('Erro ao buscar pedidos');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      console.log('🔍 Debug - Tentando atualizar status:', { orderId, newStatus });
      
      const response = await api.put(`/api/admin/orders/${orderId}/status`, { order_status: newStatus });

      if (response && response.ok) {
        console.log('✅ Debug - Status atualizado com sucesso');
        showSuccessToast('Status do pedido atualizado com sucesso!');
        fetchOrders();
        setShowModal(false);
        setSelectedOrder(null);
      } else if (response && response.error) {
        console.error('❌ Debug - Erro ao atualizar status:', response);
        showErrorToast(response.message || 'Erro ao atualizar status do pedido');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showErrorToast('Erro ao atualizar status do pedido');
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      console.log('🔍 Debug - Confirmando pagamento para pedido:', orderId);
      
      const response = await api.post(`/api/admin/orders/${orderId}/confirm-payment`);

      if (response && response.ok) {
        console.log('✅ Debug - Pagamento confirmado com sucesso');
        showSuccessToast('Pagamento confirmado com sucesso!');
        fetchOrders();
        setShowPaymentModal(false);
        setSelectedOrderForPayment(null);
      } else if (response && response.error) {
        console.error('❌ Debug - Erro ao confirmar pagamento:', response);
        showErrorToast(response.message || 'Erro ao confirmar pagamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      showErrorToast('Erro ao confirmar pagamento');
    }
  };

  const rejectPayment = async (orderId) => {
    try {
      console.log('🔍 Debug - Rejeitando pagamento para pedido:', orderId);
      
      const response = await api.post(`/api/admin/orders/${orderId}/reject-payment`);

      if (response.ok) {
        console.log('✅ Debug - Pagamento rejeitado com sucesso');
        showSuccessToast('Pagamento rejeitado e pedido cancelado');
        fetchOrders();
        setShowPaymentModal(false);
        setSelectedOrderForPayment(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Debug - Erro ao rejeitar pagamento:', errorData);
        showErrorToast('Erro ao rejeitar pagamento');
      }
    } catch (error) {
      console.error('Erro ao rejeitar pagamento:', error);
      showErrorToast('Erro ao rejeitar pagamento');
    }
  };

  const copyTrackingLink = (orderId) => {
    const link = `http://localhost:3001/order/${orderId}`;
    navigator.clipboard.writeText(link);
    
    // Mostrar toast de sucesso
    showSuccessToast('Link de rastreamento copiado para a área de transferência!');
    
    console.log('📋 Link de rastreamento copiado:', link);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'novo':
        return <Package className="w-4 h-4" />;
      case 'preparando':
        return <Clock className="w-4 h-4" />;
      case 'pronto':
        return <CheckCircle className="w-4 h-4" />;
      case 'entregando':
        return <Truck className="w-4 h-4" />;
      case 'entregue':
        return <CheckCircle className="w-4 h-4" />;
      case 'cancelado':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Package className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'preparando':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'pronto':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'entregador_designado':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'saiu_entrega':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'cliente_avisado':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'pronto_retirada':
        return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'entregue':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'retirado':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'finalizado':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'cancelado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'confirmado':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'rejeitado':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'pix':
        return <Smartphone className="w-4 h-4" />;
      case 'cartao':
        return <CreditCard className="w-4 h-4" />;
      case 'dinheiro':
        return <DollarSign className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Função para verificar se um pedido está finalizado
  const isOrderFinished = (order) => {
    return order.order_status === 'entregue' || 
           order.order_status === 'cancelado' || 
           order.order_status === 'finalizado' ||
           order.order_status === 'retirado';
  };

  // Função para obter prioridade do pedido (pedidos não finalizados têm prioridade)
  const getOrderPriority = (order) => {
    if (isOrderFinished(order)) {
      return 100; // Prioridade baixa para pedidos finalizados
    }
    
    // Prioridade alta para pedidos não finalizados
    // Quanto menor o número, maior a prioridade
    switch (order.order_status) {
      case 'novo':
        return order.payment_status === 'pendente' ? 0 : 1; // Pagamento pendente tem prioridade máxima
      case 'preparando':
        return 2;
      case 'pronto':
        return 3;
      case 'saiu_entrega':
        return 4;
      case 'pronto_retirada':
        return 5;
      default:
        return 8;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || order.order_status === statusFilter;
    
    console.log('🔍 Debug - Filtros aplicados:', { 
      order_id: order.id, 
      matchesSearch, 
      matchesStatus, 
      searchTerm, 
      statusFilter 
    });
    
    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    // Primeiro ordena por prioridade (não finalizados primeiro)
    const priorityDiff = getOrderPriority(a) - getOrderPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    
    // Se ambos têm a mesma prioridade, ordena por data de criação (mais recentes primeiro)
    return new Date(b.created_at) - new Date(a.created_at);
  });

  // Debug: mostrar ordenação dos pedidos
  console.log('🔍 Debug - Pedidos ordenados:', filteredOrders.map(order => ({
    id: order.id,
    status: order.order_status,
    payment: order.payment_status,
    priority: getOrderPriority(order),
    created_at: order.created_at
  })));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm border border-blue-100 p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciar Pedidos</h1>
            <p className="text-gray-600 text-lg">Acompanhe e gerencie todos os pedidos em tempo real</p>
          </div>
          <div className="flex items-center gap-6">
            {/* Indicador de Notificações */}
            <div className="flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-xl p-3">
              <div className="text-center">
                <p className="text-sm text-gray-600 font-medium">Notificações</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-3 h-3 rounded-full ${
                    notificationPermission === 'granted' ? 'bg-green-500' : 
                    notificationPermission === 'denied' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></span>
                  <span className="text-xs text-gray-600">
                    {notificationPermission === 'granted' ? 'Ativas' : 
                     notificationPermission === 'denied' ? 'Bloqueadas' : 'Pendentes'}
                  </span>
                </div>
              </div>
              
              {/* Botão para testar som */}
              <button
                onClick={playNotificationSound}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                title="Testar som de notificação"
              >
                🔊
              </button>
              
              {/* Botão para solicitar permissão */}
              {notificationPermission !== 'granted' && (
                <button
                  onClick={requestNotificationPermission}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm"
                  title="Ativar notificações"
                >
                  Ativar
                </button>
              )}
            </div>
            
            <div className="text-center bg-white/70 backdrop-blur-sm rounded-xl p-4">
              <p className="text-sm text-gray-600 font-medium">Total de Pedidos</p>
              <p className="text-3xl font-bold text-blue-600">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por cliente, ID ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm text-gray-700 placeholder-gray-500"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-12 pr-10 py-4 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/80 backdrop-blur-sm appearance-none cursor-pointer text-gray-700"
            >
              <option value="all">Todos os status</option>
              <option value="novo">Novo</option>
              <option value="preparando">Preparando</option>
              <option value="pronto">Pronto</option>
              <option value="saiu_entrega">Saiu para Entrega</option>
              <option value="pronto_retirada">Pronto para Retirada</option>
              <option value="entregue">Entregue</option>
              <option value="retirado">Retirado</option>
              <option value="finalizado">Finalizado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="grid gap-6">
        {/* Indicador de Ordenação */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-blue-700 font-medium">
              🎯 Ordenação inteligente: Pedidos em andamento aparecem primeiro
            </span>
          </div>
          <div className="mt-2 text-xs text-blue-600">
            Prioridade: Pagamento pendente → Em preparo → Pronto → Em entrega → Finalizados
          </div>
        </div>
        {filteredOrders.map((order) => {
          console.log('🔍 Debug - Renderizando pedido:', { 
            id: order.id, 
            payment_status: order.payment_status, 
            order_status: order.order_status 
          });
          
          return (
            <div key={order.id} className={`bg-white rounded-2xl shadow-sm border-2 hover:shadow-lg transition-all duration-300 ${
              isOrderFinished(order) 
                ? 'border-gray-200 opacity-75' 
                : 'border-blue-200 hover:border-blue-300'
            } ${!isOrderFinished(order) ? 'ring-2 ring-blue-50' : ''}`}>
              <div className="p-6">
                {/* Header do Card */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${isOrderFinished(order) ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        {getStatusIcon(order.order_status)}
                      </div>
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${getStatusColor(order.order_status)}`}>
                        {order.order_status === 'novo' && '⏳ Aguardando Pagamento'}
                        {order.order_status === 'preparando' && '👨‍🍳 Preparando'}
                        {order.order_status === 'pronto' && '✅ Pedido Pronto'}
                        {order.order_status === 'saiu_entrega' && '🚛 Saiu para Entrega'}
                        {order.order_status === 'pronto_retirada' && '✅ Pronto para Retirada'}
                        {order.order_status === 'entregue' && '🎉 Entregue'}
                        {order.order_status === 'retirado' && '📦 Retirado'}
                        {order.order_status === 'finalizado' && '🏁 Finalizado'}
                        {order.order_status === 'cancelado' && '❌ Cancelado'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-gray-500" />
                      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.payment_status)}`}>
                        {order.payment_status === 'pendente' && '⏳ Aguardando Pagamento'}
                        {order.payment_status === 'confirmado' && '✅ Pagamento Confirmado'}
                        {order.payment_status === 'rejeitado' && '❌ Pagamento Rejeitado'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyTrackingLink(order.id)}
                      className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      title="Copiar link de rastreamento"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowModal(true);
                      }}
                      className="p-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all duration-200"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Informações do Pedido */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                                     <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                     <Phone className="w-5 h-5 text-blue-500" />
                     <div>
                       <p className="text-xs text-gray-500 font-medium">Telefone</p>
                       <button
                         onClick={() => {
                           const phoneNumber = order.customer_phone.replace(/\D/g, '');
                           const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                           window.open(whatsappUrl, '_blank');
                         }}
                         className="text-sm text-gray-900 font-semibold hover:text-green-600 hover:underline transition-colors duration-200 cursor-pointer"
                         title="Abrir WhatsApp"
                       >
                         {order.customer_phone}
                       </button>
                     </div>
                   </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <MapPin className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Local</p>
                      {order.delivery_type === 'pickup' ? (
                        <p className="text-sm text-gray-900 font-semibold truncate">
                          Retirada no Balcão
                        </p>
                      ) : (
                        <button
                          onClick={() => {
                            const address = order.delivery_address || order.customer_address;
                            if (address) {
                              const encodedAddress = encodeURIComponent(address);
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                              window.open(googleMapsUrl, '_blank');
                            }
                          }}
                          className="text-sm text-gray-900 font-semibold truncate hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left"
                          title="Abrir no Google Maps"
                        >
                          {order.delivery_address || order.customer_address || 'Endereço não informado'}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    <Truck className="w-5 h-5 text-purple-500" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Tipo</p>
                      <p className="text-sm text-gray-900 font-semibold capitalize">
                        {order.delivery_type === 'pickup' ? 'Retirada' : 'Entrega'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                    {getPaymentMethodIcon(order.payment_method)}
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Pagamento</p>
                      <p className="text-sm text-gray-900 font-semibold capitalize">{order.payment_method}</p>
                    </div>
                  </div>
                </div>

                {/* Detalhes do Pedido */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                                      <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleCustomerClick(order)}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 cursor-pointer"
                    >
                      <span className="text-white font-bold text-lg">{order.customer_name.charAt(0).toUpperCase()}</span>
                    </button>
                    <div>
                      <button
                        onClick={() => handleCustomerClick(order)}
                        className="text-left hover:text-blue-600 transition-colors duration-200"
                      >
                        <p className="font-bold text-gray-900 text-lg hover:text-blue-600">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">Pedido #{order.id} • {formatDate(order.created_at)}</p>
                      </button>
                    </div>
                  </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">
                        R$ {order.total_amount.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-wrap items-center gap-3">
                    {order.payment_status === 'pendente' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedOrderForPayment(order);
                            setShowPaymentModal(true);
                          }}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          ✅ Confirmar Pagamento
                        </button>
                        <button
                          onClick={() => rejectPayment(order.id)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white text-sm font-semibold rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        >
                          ❌ Rejeitar
                        </button>
                      </>
                    )}
                    
                    {order.payment_status === 'confirmado' && !isOrderFinished(order) && (
                      <div className="flex flex-wrap items-center gap-3">
                    {order.order_status === 'novo' && (
                      <button
                        onClick={() => {
                          console.log('🔍 Debug - Clicando em Iniciar Preparo para pedido:', { 
                            id: order.id, 
                            payment_status: order.payment_status, 
                            order_status: order.order_status 
                          });
                          updateOrderStatus(order.id, 'preparando');
                        }}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        👨‍🍳 Iniciar Preparo
                      </button>
                    )}
                    {order.order_status === 'preparando' && order.delivery_type === 'delivery' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'pronto')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        ✅ Marcar Pronto
                      </button>
                    )}
                    {order.order_status === 'preparando' && order.delivery_type === 'pickup' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'pronto_retirada')}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white text-sm font-semibold rounded-xl hover:from-indigo-600 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        ✅ Pronto para Retirada
                      </button>
                    )}
                    {order.order_status === 'pronto' && order.delivery_type === 'delivery' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'saiu_entrega')}
                        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        🚛 Saiu para Entrega
                      </button>
                    )}
                    {order.order_status === 'saiu_entrega' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'entregue')}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        🎉 Confirmar Entrega
                      </button>
                    )}

                    {order.order_status === 'pronto_retirada' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'retirado')}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white text-sm font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        📦 Confirmar Retirada
                      </button>
                    )}
                    {(order.order_status === 'entregue' || order.order_status === 'retirado') && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'finalizado')}
                        className="px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white text-sm font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        🏁 Finalizar Pedido
                      </button>
                    )}
                  </div>
                )}
                
                    {isOrderFinished(order) && (
                      <div className="px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-xl">
                        Pedido Finalizado
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
      })}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pedido #{selectedOrder.id}</h2>
                  <p className="text-gray-600">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Link de Rastreamento */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Link de Rastreamento:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={`http://localhost:3001/order/${selectedOrder.id}`}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                  <button
                    onClick={() => copyTrackingLink(selectedOrder.id)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações do Cliente</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nome:</span> {selectedOrder.customer_name}</p>
                                         <p>
                       <span className="font-medium">Telefone:</span> 
                       <button
                         onClick={() => {
                           const phoneNumber = selectedOrder.customer_phone.replace(/\D/g, '');
                           const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                           window.open(whatsappUrl, '_blank');
                         }}
                         className="ml-2 text-blue-600 hover:text-green-600 hover:underline transition-colors duration-200 cursor-pointer"
                         title="Abrir WhatsApp"
                       >
                         {selectedOrder.customer_phone}
                       </button>
                     </p>
                    <p><span className="font-medium">Tipo de Entrega:</span> 
                      <span className="ml-2 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {selectedOrder.delivery_type === 'pickup' ? 'Retirada no Balcão' : 'Entrega'}
                      </span>
                    </p>
                                         <p>
                       <span className="font-medium">Endereço:</span> 
                       {selectedOrder.delivery_type === 'pickup' ? (
                         'Retirada no local'
                       ) : (
                         <button
                           onClick={() => {
                             const address = selectedOrder.delivery_address || selectedOrder.customer_address;
                             if (address) {
                               const encodedAddress = encodeURIComponent(address);
                               const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                               window.open(googleMapsUrl, '_blank');
                             }
                           }}
                           className="ml-2 text-blue-600 hover:text-green-600 hover:underline transition-colors duration-200 cursor-pointer"
                           title="Abrir no Google Maps"
                         >
                           {selectedOrder.delivery_address || selectedOrder.customer_address || 'Endereço não informado'}
                         </button>
                       )}
                     </p>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Status e Pagamento</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Status do Pedido:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                        {selectedOrder.order_status}
                      </span>
                    </p>
                    <p><span className="font-medium">Status do Pagamento:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                        {selectedOrder.payment_status}
                      </span>
                    </p>
                    <p><span className="font-medium">Método de Pagamento:</span> {selectedOrder.payment_method}</p>
                    <p><span className="font-medium">Total:</span> 
                      <span className="ml-2 text-lg font-bold text-primary-600">
                        R$ {selectedOrder.total_amount.toFixed(2).replace('.', ',')}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Itens do Pedido */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Itens do Pedido</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{selectedOrder.items_summary}</p>
                </div>
              </div>

              {/* Notas do Administrador */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Notas do Administrador</h3>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Adicione observações sobre o pedido..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Pagamento */}
      {showPaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Pagamento</h3>
                <p className="text-gray-600">Pedido #{selectedOrderForPayment.id} - {selectedOrderForPayment.customer_name}</p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => confirmPayment(selectedOrderForPayment.id)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => rejectPayment(selectedOrderForPayment.id)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Detalhes do Cliente */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">{selectedCustomer.customer_name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.customer_name}</h2>
                    <p className="text-gray-600">{selectedCustomer.customer_phone}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Informações Básicas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Básicas</h3>
                  
                  <div className="space-y-3">
                                         <div className="flex items-center gap-3">
                       <Phone className="w-5 h-5 text-gray-400" />
                       <button
                         onClick={() => {
                           const phoneNumber = selectedCustomer.customer_phone.replace(/\D/g, '');
                           const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                           window.open(whatsappUrl, '_blank');
                         }}
                         className="text-gray-700 hover:text-green-600 hover:underline transition-colors duration-200 cursor-pointer"
                         title="Abrir WhatsApp"
                       >
                         {selectedCustomer.customer_phone}
                       </button>
                     </div>
                    
                                         {selectedCustomer.customer_address && (
                       <div className="flex items-start gap-3">
                         <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                         <button
                           onClick={() => {
                             const encodedAddress = encodeURIComponent(selectedCustomer.customer_address);
                             const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                             window.open(googleMapsUrl, '_blank');
                           }}
                           className="text-gray-700 hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left"
                           title="Abrir no Google Maps"
                         >
                           {selectedCustomer.customer_address}
                         </button>
                       </div>
                     )}
                     
                                           {selectedCustomer.order_delivery_address && (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-gray-400 mt-0.5" />
                          <div>
                            <span className="text-sm text-gray-500 font-medium">Endereço de Entrega:</span>
                            <button
                              onClick={() => {
                                const encodedAddress = encodeURIComponent(selectedCustomer.order_delivery_address);
                                const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                                window.open(googleMapsUrl, '_blank');
                              }}
                              className="text-gray-700 hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left"
                              title="Abrir no Google Maps"
                            >
                              {selectedCustomer.order_delivery_address}
                            </button>
                          </div>
                        </div>
                      )}
                    
                    {selectedCustomer.customer_email && (
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">{selectedCustomer.customer_email}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Estatísticas */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Estatísticas</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Total de Pedidos</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomer.total_orders || 1}</p>
                    </div>
                    
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-5 h-5 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Total Gasto</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {(selectedCustomer.total_spent || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>

                  {selectedCustomer.total_orders > 1 && (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        <span className="text-sm font-medium text-purple-900">Ticket Médio</span>
                      </div>
                      <p className="text-2xl font-bold text-purple-600">
                        R$ {((selectedCustomer.total_spent || 0) / (selectedCustomer.total_orders || 1)).toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Histórico de Pedidos */}
              {selectedCustomer.total_orders > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Histórico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Primeiro Pedido</p>
                        <p className="font-medium text-gray-900">
                          {selectedCustomer.first_order_date 
                            ? new Date(selectedCustomer.first_order_date).toLocaleDateString('pt-BR')
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Último Pedido</p>
                        <p className="font-medium text-gray-900">
                          {selectedCustomer.last_order_date 
                            ? new Date(selectedCustomer.last_order_date).toLocaleDateString('pt-BR')
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Sistema de Toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ${
              toast.type === 'success' ? 'border-l-green-500' :
              toast.type === 'error' ? 'border-l-red-500' :
              'border-l-blue-500'
            }`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {toast.type === 'success' && (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                )}
                {toast.type === 'error' && (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                {toast.type === 'info' && (
                  <AlertCircle className="w-5 h-5 text-blue-500" />
                )}
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {toast.message}
                </p>
              </div>
              <div className="ml-4 flex-shrink-0">
                <button
                  onClick={() => removeToast(toast.id)}
                  className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;

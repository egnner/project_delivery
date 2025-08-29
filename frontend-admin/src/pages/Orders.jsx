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
  Mail,
  TrendingUp,
  X,
  User,
  Bell,
  BellOff,
  Volume2,
  ExternalLink,
  MessageCircle,
  AlertTriangle,
  Timer,
  CheckCircle2,
  Ban
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

  const addToast = (message, type = 'info', duration = 5000) => {
    const id = Date.now();
    const toast = { id, message, type, duration };

    setToasts(prev => [...prev, toast]);

    setTimeout(() => {
      removeToast(id);
    }, duration);

    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showSuccessToast = (message) => {
    addToast(message, 'success');
  };

  const showErrorToast = (message) => {
    addToast(message, 'error');
  };

  const showInfoToast = (message) => {
    addToast(message, 'info');
  };

  const fetchCustomerByPhone = async (phone) => {
    try {
      const response = await api.get(`/api/admin/customers?phone=${phone}`);
      if (response && response.ok) {
        const data = await response.json();
        if (data.data && data.data.length > 0) {
          return data.data[0];
        }
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
    }
    return null;
  };

  const handleCustomerClick = async (order) => {
    const customer = await fetchCustomerByPhone(order.customer_phone);
    if (customer) {
      setSelectedCustomer({ ...customer, order_delivery_address: order.delivery_address });
      setShowCustomerModal(true);
    } else {
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

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const frequency = 800;
      const duration = 0.4;
      const volume = 0.3;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);

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
      console.error('Erro ao tocar som:', error);
    }
  };

  const showBrowserNotification = (title, body, icon = null) => {
    if (notificationPermission === 'granted') {
      try {
        const notification = new Notification(title, {
          body: body,
          icon: icon || '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'new-order',
          requireInteraction: false,
          silent: false
        });

        notification.onclick = (event) => {
          event.preventDefault();
          window.focus();
          notification.close();
        };

        setTimeout(() => {
          if (notification) {
            notification.close();
          }
        }, 15000);

        return notification;
      } catch (error) {
        console.error('Erro ao mostrar notificação:', error);
        return null;
      }
    }
    return null;
  };

  const notifyNewOrder = (order) => {
    playNotificationSound();

    const notification = showBrowserNotification(
      'Novo Pedido Recebido!',
      `Pedido #${order.id} de ${order.customer_name} - R$ ${order.total_amount.toFixed(2).replace('.', ',')}`,
      '/favicon.ico'
    );

    showInfoToast(`Novo pedido #${order.id} recebido de ${order.customer_name}`);
  };

  useEffect(() => {
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);

      if (Notification.permission === 'default') {
        setTimeout(() => {
          requestNotificationPermission();
        }, 2000);
      }
    }

    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('join-admin');

    newSocket.on('new-order', (data) => {
      setOrders(prevOrders => [data.order, ...prevOrders]);
      notifyNewOrder(data.order);
    });

    newSocket.on('order-updated', (data) => {
      console.log('Socket: Pedido atualizado:', data.order.id, 'Status:', data.order.order_status);
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
      const response = await api.get('/api/admin/orders');

      if (response && response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
      } else if (response && response.error) {
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
      const response = await api.put(`/api/admin/orders/${orderId}/status`, { order_status: newStatus });

      if (response && response.ok) {
        showSuccessToast('Status do pedido atualizado com sucesso!');
        fetchOrders();
        setShowModal(false);
        setSelectedOrder(null);
      } else if (response && response.error) {
        showErrorToast(response.message || 'Erro ao atualizar status do pedido');
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      showErrorToast('Erro ao atualizar status do pedido');
    }
  };

  const confirmPayment = async (orderId) => {
    try {
      const response = await api.post(`/api/admin/orders/${orderId}/confirm-payment`);

      if (response && response.ok) {
        showSuccessToast('Pagamento confirmado com sucesso!');
        fetchOrders();
        setShowPaymentModal(false);
        setSelectedOrderForPayment(null);
      } else if (response && response.error) {
        showErrorToast(response.message || 'Erro ao confirmar pagamento');
      }
    } catch (error) {
      console.error('Erro ao confirmar pagamento:', error);
      showErrorToast('Erro ao confirmar pagamento');
    }
  };

  const rejectPayment = async (orderId) => {
    try {
      const response = await api.post(`/api/admin/orders/${orderId}/reject-payment`);

      if (response.ok) {
        showSuccessToast('Pagamento rejeitado e pedido cancelado');
        fetchOrders();
        setShowPaymentModal(false);
        setSelectedOrderForPayment(null);
      } else {
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
    showSuccessToast('Link de rastreamento copiado!');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'preparando':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pronto':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'pronto_retirada':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'saiu_entrega':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'entregue':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'retirado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'finalizado':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pendente':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'confirmado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejeitado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'novo':
        return <Clock className="w-5 h-5 text-blue-600" />;
      case 'preparando':
        return <Package className="w-5 h-5 text-yellow-600" />;
      case 'pronto':
        return <CheckCircle className="w-5 h-5 text-indigo-600" />;
      case 'pronto_retirada':
        return <CheckCircle className="w-5 h-5 text-indigo-600" />;
      case 'saiu_entrega':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'entregue':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'retirado':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'finalizado':
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
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

  const isOrderFinished = (order) => {
    const finished = order.order_status === 'entregue' ||
      order.order_status === 'cancelado' ||
      order.order_status === 'finalizado' ||
      order.order_status === 'retirado';
    
    // Debug log para verificar status
    if (order.order_status === 'retirado' || order.order_status === 'finalizado') {
      console.log(`Pedido #${order.id} - Status: ${order.order_status} - Finalizado: ${finished}`);
    }
    
    return finished;
  };

  const getOrderPriority = (order) => {
    if (isOrderFinished(order)) return 100;

    switch (order.order_status) {
      case 'novo':
        return order.payment_status === 'pendente' ? 0 : 1;
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

    return matchesSearch && matchesStatus;
  }).sort((a, b) => {
    const priorityDiff = getOrderPriority(a) - getOrderPriority(b);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.created_at) - new Date(a.created_at);
  });

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.payment_status === 'pendente').length,
    active: orders.filter(o => !isOrderFinished(o)).length,
    finished: orders.filter(o => isOrderFinished(o)).length,
    today: orders.filter(o => {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }).length
  };

  // Debug: Log das estatísticas
  console.log('📊 Estatísticas:', {
    total: stats.total,
    pending: stats.pending,
    active: stats.active,
    finished: stats.finished,
    today: stats.today
  });

  // Debug: Log dos pedidos com status finalizado/retirado
  orders.forEach(order => {
    if (order.order_status === 'finalizado' || order.order_status === 'retirado') {
      console.log(`🔍 Pedido #${order.id}: Status=${order.order_status}, Finalizado=${isOrderFinished(order)}`);
    }
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando pedidos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Pedidos
              </h1>
              <p className="text-gray-600">
                Acompanhe e gerencie todos os pedidos em tempo real
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Status de Notificações */}
              <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="text-center">
                  <p className="text-sm text-gray-600 font-medium">Notificações</p>
                  <div className="flex items-center gap-2 mt-1">
                    {notificationPermission === 'granted' ? (
                      <Bell className="w-4 h-4 text-green-600" />
                    ) : (
                      <BellOff className="w-4 h-4 text-red-600" />
                    )}
                    <span className="text-xs text-gray-600">
                      {notificationPermission === 'granted' ? 'Ativas' : 'Inativas'}
                    </span>
                  </div>
                </div>

                <div className="h-8 w-px bg-gray-200"></div>

                <button
                  onClick={playNotificationSound}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Testar som"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                {notificationPermission !== 'granted' && (
                  <>
                    <div className="h-8 w-px bg-gray-200"></div>
                    <button
                      onClick={requestNotificationPermission}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm"
                      title="Ativar notificações"
                    >
                      Ativar
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

                {/* Stats Cards - Design Técnico */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border-2 border-blue-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-blue-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-mono">{stats.total.toString().padStart(3, '0')}</p>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide">TOTAL PEDIDOS</p>
              </div>
            </div>
          </div>
          
          <div className={`bg-white border-2 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 ${stats.pending > 0
              ? 'border-orange-300 ring-2 ring-orange-200/50 animate-pulse'
                : 'border-orange-200 hover:border-orange-300'
            }`}>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-mono">{stats.pending.toString().padStart(3, '0')}</p>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  PENDENTE PGTO
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-yellow-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-yellow-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                <Truck className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-mono">{stats.active.toString().padStart(3, '0')}</p>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide flex items-center gap-1">
                  <Timer className="w-3 h-3" />
                  EM ANDAMENTO
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-green-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-green-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-mono">{stats.finished.toString().padStart(3, '0')}</p>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  FINALIZADOS
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border-2 border-purple-200 rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:border-purple-300">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-500 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 font-mono">{stats.today.toString().padStart(3, '0')}</p>
                <p className="text-xs text-gray-600 font-bold uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  PEDIDOS HOJE
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-8 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente, ID ou telefone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-gray-50 focus:bg-white"
                />
              </div>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 focus:bg-white appearance-none cursor-pointer text-gray-700"
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
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-8 text-center shadow-sm">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Package className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-sm text-gray-600">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros para encontrar o que procura'
                : 'Quando chegarem novos pedidos, eles aparecerão aqui'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const isPending = order.payment_status === 'pendente';
              const isActive = !isOrderFinished(order);

              return (
                <div
                  key={order.id}
                  className={`relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 ${isPending
                      ? 'bg-gradient-to-r from-orange-50 via-white to-orange-50 border-2 border-orange-300 ring-2 ring-orange-200/50'
                      : isActive
                        ? 'bg-gradient-to-r from-blue-50 via-white to-blue-50 border-2 border-blue-200 hover:border-blue-300'
                        : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border-2 border-gray-200 opacity-90'
                    }`}
                >
                  {/* Indicador de Prioridade */}
                  {isPending && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-red-400"></div>
                  )}
                  {isActive && !isPending && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 to-indigo-400"></div>
                  )}

                  <div className="p-4">
                    {/* Header Técnico do Card */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                                                {/* Status Principal */}
                        <div className="relative">
                          <div className={`p-2 rounded-lg shadow-sm ${isPending
                              ? 'bg-gradient-to-br from-orange-100 to-orange-200 ring-2 ring-orange-300/50'
                                : isActive
                                  ? 'bg-gradient-to-br from-blue-100 to-blue-200'
                                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
                            }`}>
                            {getStatusIcon(order.order_status)}
                          </div>
                          {isPending && (
                            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                              <AlertTriangle className="w-2 h-2 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Status Labels Modernos */}
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold border-2 shadow-sm ${getStatusColor(order.order_status)} ${isPending ? 'ring-2 ring-orange-300/50' : ''
                              }`}>
                              <span className="flex items-center gap-1">
                                {order.order_status === 'novo' && <><Clock className="w-3 h-3" /> AGUARDANDO PAGAMENTO</>}
                                {order.order_status === 'preparando' && <><Package className="w-3 h-3" /> EM PREPARO</>}
                                {order.order_status === 'pronto' && <><CheckCircle className="w-3 h-3" /> PRONTO</>}
                                {order.order_status === 'saiu_entrega' && <><Truck className="w-3 h-3" /> EM ROTA</>}
                                {order.order_status === 'pronto_retirada' && <><CheckCircle className="w-3 h-3" /> PRONTO P/ RETIRADA</>}
                                {order.order_status === 'entregue' && <><CheckCircle className="w-3 h-3" /> ENTREGUE</>}
                                {order.order_status === 'retirado' && <><CheckCircle className="w-3 h-3" /> RETIRADO</>}
                                {order.order_status === 'finalizado' && <><CheckCircle className="w-3 h-3" /> FINALIZADO</>}
                                {order.order_status === 'cancelado' && <><XCircle className="w-3 h-3" /> CANCELADO</>}
                              </span>
                            </span>

                            {/* ID do Pedido - Destaque Técnico */}
                            <span className="px-2 py-1 bg-gray-900 text-white text-xs font-mono rounded">
                              #{order.id.toString().padStart(4, '0')}
                            </span>
                          </div>

                          <span className={`px-2 py-1 rounded text-xs font-bold border ${getPaymentStatusColor(order.payment_status)} ${isPending ? 'animate-pulse ring-2 ring-orange-300/50' : ''
                            }`}>
                            {order.payment_status === 'pendente' && <span className="flex items-center gap-1"><Timer className="w-3 h-3" /> PAGAMENTO PENDENTE</span>}
                            {order.payment_status === 'confirmado' && <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> PAGAMENTO OK</span>}
                            {order.payment_status === 'rejeitado' && <span className="flex items-center gap-1"><Ban className="w-3 h-3" /> PAGAMENTO REJEITADO</span>}
                          </span>
                        </div>
                      </div>

                      {/* Ações Rápidas */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyTrackingLink(order.id)}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Copiar link de rastreamento"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowModal(true);
                          }}
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-100 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                          title="Ver detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Dados Técnicos do Pedido */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                      <div className={`flex items-center gap-2 p-3 rounded-lg shadow-sm border ${isPending ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="p-1.5 bg-blue-100 rounded">
                          <Phone className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">CONTATO</p>
                          <button
                            onClick={() => {
                              const phoneNumber = order.customer_phone.replace(/\D/g, '');
                              const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                              window.open(whatsappUrl, '_blank');
                            }}
                            className="text-xs text-gray-900 font-bold hover:text-green-600 transition-colors flex items-center gap-1 w-full group"
                            title="Abrir WhatsApp"
                          >
                            <span className="truncate font-mono">{order.customer_phone}</span>
                          </button>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 p-3 rounded-lg shadow-sm border ${isPending ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="p-1.5 bg-green-100 rounded">
                          <MapPin className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">DESTINO</p>
                          {order.delivery_type === 'pickup' ? (
                            <p className="text-xs text-gray-900 font-bold">RETIRADA NO BALCÃO</p>
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
                              className="text-xs text-gray-900 font-bold hover:text-blue-600 transition-colors flex items-center gap-1 w-full group"
                              title="Abrir no Google Maps"
                            >
                              <ExternalLink className="w-2 h-2 flex-shrink-0 group-hover:text-blue-600" />
                              <span className="truncate">{order.delivery_address || order.customer_address || 'Endereço não informado'}</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 p-3 rounded-lg shadow-sm border ${isPending ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="p-1.5 bg-purple-100 rounded">
                          <Truck className="w-3 h-3 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">MODALIDADE</p>
                          <p className="text-xs text-gray-900 font-bold">
                            {order.delivery_type === 'pickup' ? 'RETIRADA' : 'ENTREGA'}
                          </p>
                        </div>
                      </div>

                      <div className={`flex items-center gap-2 p-3 rounded-lg shadow-sm border ${isPending ? 'bg-orange-50 border-orange-200' : 'bg-gray-50 border-gray-200'
                        }`}>
                        <div className="p-1.5 bg-indigo-100 rounded">
                          {getPaymentMethodIcon(order.payment_method)}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">PAGAMENTO</p>
                          <p className="text-xs text-gray-900 font-bold uppercase">{order.payment_method}</p>
                        </div>
                      </div>
                    </div>

                                        {/* Cliente e Valor - Layout Técnico */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 bg-white/80 rounded-lg border border-gray-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleCustomerClick(order)}
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 ${isPending
                              ? 'bg-gradient-to-br from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600'
                                : 'bg-gradient-to-br from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
                            }`}
                        >
                          <span className="text-white font-bold text-lg">{order.customer_name.charAt(0).toUpperCase()}</span>
                        </button>
                        <div className="min-w-0 flex-1">
                          <button
                            onClick={() => handleCustomerClick(order)}
                            className="text-left hover:text-blue-600 transition-colors w-full group"
                          >
                            <p className="font-bold text-gray-900 text-lg group-hover:text-blue-600 truncate">{order.customer_name}</p>
                            <p className="text-xs text-gray-500 font-mono">
                              <span className="font-bold">ORDER:</span> #{order.id.toString().padStart(4, '0')} •
                              <span className="font-bold ml-1">TIME:</span> {formatDate(order.created_at)}
                            </p>
                          </button>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg ${isPending ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                          <DollarSign className="w-4 h-4" />
                          <span className="text-2xl font-bold font-mono">
                            R$ {order.total_amount.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Botões de Ação - Design Técnico */}
                    <div className={`flex flex-wrap items-center gap-3 mt-4 pt-4 border-t-2 ${isPending ? 'border-orange-200' : 'border-gray-200'
                      }`}>
                                              {order.payment_status === 'pendente' && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedOrderForPayment(order);
                                setShowPaymentModal(true);
                              }}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-green-500/20 ring-2 ring-green-200/50"
                            >
                              <CheckCircle className="w-4 h-4" />
                              CONFIRMAR PAGAMENTO
                            </button>
                            <button
                              onClick={() => rejectPayment(order.id)}
                              className="px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-red-500/20"
                            >
                              <XCircle className="w-4 h-4" />
                              REJEITAR PAGAMENTO
                            </button>
                          </>
                        )}

                      {order.payment_status === 'confirmado' && !isOrderFinished(order) && (
                        <div className="flex flex-wrap items-center gap-3">
                          {order.order_status === 'novo' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'preparando')}
                              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-blue-500/20"
                            >
                              <Clock className="w-4 h-4" />
                              INICIAR PREPARO
                            </button>
                          )}
                          {order.order_status === 'preparando' && order.delivery_type === 'delivery' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'pronto')}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-indigo-500/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                              MARCAR PRONTO
                            </button>
                          )}
                          {order.order_status === 'preparando' && order.delivery_type === 'pickup' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'pronto_retirada')}
                              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-indigo-500/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                              PRONTO P/ RETIRADA
                            </button>
                          )}
                          {order.order_status === 'pronto' && order.delivery_type === 'delivery' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'saiu_entrega')}
                              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-purple-500/20"
                            >
                              <Truck className="w-4 h-4" />
                              SAIU PARA ENTREGA
                            </button>
                          )}
                          {order.order_status === 'saiu_entrega' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'entregue')}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-green-500/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                              CONFIRMAR ENTREGA
                            </button>
                          )}
                          {order.order_status === 'pronto_retirada' && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'retirado')}
                              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-green-500/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                              CONFIRMAR RETIRADA
                            </button>
                          )}
                          {(order.order_status === 'entregue' || order.order_status === 'retirado') && (
                            <button
                              onClick={() => updateOrderStatus(order.id, 'finalizado')}
                              className="px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white text-xs font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 border-2 border-gray-500/20"
                            >
                              <CheckCircle className="w-4 h-4" />
                              FINALIZAR PEDIDO
                            </button>
                          )}
                        </div>
                      )}

                      {isOrderFinished(order) && (
                        <div className="px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 text-xs font-bold rounded-lg flex items-center gap-2 border-2 border-gray-300">
                          <CheckCircle className="w-4 h-4" />
                          PEDIDO FINALIZADO
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes do Pedido */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Pedido #{selectedOrder.id}</h2>
                  <p className="text-gray-600">{formatDate(selectedOrder.created_at)}</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Link de Rastreamento</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`http://localhost:3001/order/${selectedOrder.id}`}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                    />
                    <button
                      onClick={() => copyTrackingLink(selectedOrder.id)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    >
                      Copiar
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Cliente</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Nome:</span>
                        <span className="ml-2">{selectedOrder.customer_name}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Telefone:</span>
                        <button
                          onClick={() => {
                            const phoneNumber = selectedOrder.customer_phone.replace(/\D/g, '');
                            const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                          className="ml-2 text-blue-600 hover:text-green-600 hover:underline transition-colors"
                        >
                          {selectedOrder.customer_phone}
                        </button>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Tipo:</span>
                        <span className="ml-2 capitalize">
                          {selectedOrder.delivery_type === 'pickup' ? 'Retirada no Balcão' : 'Entrega'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Endereço:</span>
                        {selectedOrder.delivery_type === 'pickup' ? (
                          <span className="ml-2">Retirada no local</span>
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
                            className="ml-2 text-blue-600 hover:text-blue-800 hover:underline transition-colors"
                          >
                            {selectedOrder.delivery_address || selectedOrder.customer_address || 'Endereço não informado'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Pagamento</h3>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Status do Pedido:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getStatusColor(selectedOrder.order_status)}`}>
                          {selectedOrder.order_status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status do Pagamento:</span>
                        <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getPaymentStatusColor(selectedOrder.payment_status)}`}>
                          {selectedOrder.payment_status}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Método:</span>
                        <span className="ml-2 capitalize">{selectedOrder.payment_method}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Total:</span>
                        <span className="ml-2 text-lg font-bold text-blue-600">
                          R$ {selectedOrder.total_amount.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Itens do Pedido</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700 leading-relaxed">{selectedOrder.items_summary}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Observações</h3>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Adicione observações sobre o pedido..."
                    rows="3"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Pagamento */}
      {showPaymentModal && selectedOrderForPayment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="text-center mb-6">
                <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Confirmar Pagamento</h3>
                <p className="text-gray-600">Pedido #{selectedOrderForPayment.id} - {selectedOrderForPayment.customer_name}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => confirmPayment(selectedOrderForPayment.id)}
                  className="flex-1 px-4 py-3 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => rejectPayment(selectedOrderForPayment.id)}
                  className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Rejeitar
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal do Cliente */}
      {showCustomerModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
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
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <button
                        onClick={() => {
                          const phoneNumber = selectedCustomer.customer_phone.replace(/\D/g, '');
                          const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                          window.open(whatsappUrl, '_blank');
                        }}
                        className="text-gray-700 hover:text-green-600 hover:underline transition-colors flex items-center gap-1"
                      >
                        {selectedCustomer.customer_phone}
                      </button>
                    </div>

                    {selectedCustomer.customer_address && (
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        <button
                          onClick={() => {
                            const encodedAddress = encodeURIComponent(selectedCustomer.customer_address);
                            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                            window.open(googleMapsUrl, '_blank');
                          }}
                          className="text-gray-700 hover:text-blue-600 hover:underline transition-colors text-left flex items-center gap-1"
                        >
                          {selectedCustomer.customer_address}
                        </button>
                      </div>
                    )}

                    {selectedCustomer.order_delivery_address && (
                      <div className="flex items-start gap-3">
                        <Truck className="w-4 h-4 text-gray-400 mt-0.5" />
                        <div>
                          <span className="text-sm text-gray-500 font-medium">Endereço de Entrega:</span>
                          <button
                            onClick={() => {
                              const encodedAddress = encodeURIComponent(selectedCustomer.order_delivery_address);
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                              window.open(googleMapsUrl, '_blank');
                            }}
                            className="text-gray-700 hover:text-blue-600 hover:underline transition-colors text-left flex items-center gap-1 mt-1"
                          >
                            <ExternalLink className="w-3 h-3" />
                            {selectedCustomer.order_delivery_address}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-900">Total de Pedidos</span>
                      </div>
                      <p className="text-2xl font-bold text-blue-600">{selectedCustomer.total_orders || 1}</p>
                    </div>

                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium text-green-900">Total Gasto</span>
                      </div>
                      <p className="text-2xl font-bold text-green-600">
                        R$ {(selectedCustomer.total_spent || 0).toFixed(2).replace('.', ',')}
                      </p>
                    </div>

                    {selectedCustomer.total_orders > 1 && (
                      <div className="bg-purple-50 border border-purple-200 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-purple-600" />
                          <span className="text-sm font-medium text-purple-900">Ticket Médio</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-600">
                          R$ {((selectedCustomer.total_spent || 0) / (selectedCustomer.total_orders || 1)).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {selectedCustomer.total_orders > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-gray-400" />
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
                      <Clock className="w-4 h-4 text-gray-400" />
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
            className={`max-w-sm w-full bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ${toast.type === 'success' ? 'border-l-green-500' :
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
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-4 h-4" />
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
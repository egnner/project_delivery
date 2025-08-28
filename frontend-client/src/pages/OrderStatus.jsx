import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStoreSettings } from '../contexts/StoreSettingsContext';
import { 
  Clock, 
  Package, 
  Truck, 
  CheckCircle, 
  XCircle, 
  CreditCard,
  DollarSign,
  Smartphone,
  ArrowLeft,
  Copy,
  User,
  Phone,
  MapPin,
  MessageSquare,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { io } from 'socket.io-client';

const OrderStatus = () => {
  const { id } = useParams();
  const { settings } = useStoreSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);
  const [copied, setCopied] = useState(false);

  const getOrderSteps = (deliveryType) => {
    if (deliveryType === 'delivery') {
      return [
        { key: 'aguardando_pagamento', label: 'Aguardando Pagamento', icon: CreditCard, color: 'text-orange-600' },
        { key: 'pagamento_confirmado', label: 'Pagamento Confirmado', icon: CheckCircle, color: 'text-green-600' },
        { key: 'preparando', label: 'Preparando', icon: Package, color: 'text-blue-600' },
        { key: 'em_rota', label: 'Em Rota', icon: Truck, color: 'text-indigo-600' },
        { key: 'finalizado', label: 'Finalizado', icon: CheckCircle, color: 'text-green-600' }
      ];
    } else {
      return [
        { key: 'aguardando_pagamento', label: 'Aguardando Pagamento', icon: CreditCard, color: 'text-orange-600' },
        { key: 'pagamento_confirmado', label: 'Pagamento Confirmado', icon: CheckCircle, color: 'text-green-600' },
        { key: 'preparando', label: 'Preparando', icon: Package, color: 'text-blue-600' },
        { key: 'pronto_retirada', label: 'Pronto para Retirada', icon: Package, color: 'text-indigo-600' },
        { key: 'finalizado', label: 'Finalizado', icon: CheckCircle, color: 'text-green-600' }
      ];
    }
  };

  const getCurrentStep = (order) => {
    if (!order) return 0;
    
    if (order.order_status === 'cancelado') return -1;
    
    if (order.delivery_type === 'delivery') {
      switch (order.order_status) {
        case 'novo':
          return order.payment_status === 'confirmado' ? 1 : 0;
        case 'preparando':
          return 2;
        case 'pronto':
        case 'saiu_entrega':
          return 3;
        case 'entregue':
        case 'finalizado':
          return 4;
        default:
          return 0;
      }
    }
    
    if (order.delivery_type === 'pickup') {
      switch (order.order_status) {
        case 'novo':
          return order.payment_status === 'confirmado' ? 1 : 0;
        case 'preparando':
          return 2;
        case 'pronto_retirada':
          return 3;
        case 'retirado':
        case 'finalizado':
          return 4;
        default:
          return 0;
      }
    }
    
    return 0;
  };

  const getPaymentMethodInfo = (method) => {
    switch (method) {
      case 'pix':
        return { icon: Smartphone, color: 'text-green-600', label: 'PIX' };
      case 'cartao':
        return { icon: CreditCard, color: 'text-blue-600', label: 'Cartão' };
      case 'dinheiro':
        return { icon: DollarSign, color: 'text-green-600', label: 'Dinheiro' };
      default:
        return { icon: CreditCard, color: 'text-gray-600', label: method };
    }
  };

  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'pendente':
        return { color: 'bg-orange-100 text-orange-800', label: 'Aguardando Confirmação' };
      case 'confirmado':
        return { color: 'bg-green-100 text-green-800', label: 'Confirmado' };
      case 'rejeitado':
        return { color: 'bg-red-100 text-red-800', label: 'Rejeitado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  const getOrderStatusInfo = (status) => {
    switch (status) {
      case 'novo':
        return { color: 'bg-blue-100 text-blue-800', label: 'Novo Pedido' };
      case 'preparando':
        return { color: 'bg-yellow-100 text-yellow-800', label: 'Preparando' };
      case 'pronto':
        return { color: 'bg-indigo-100 text-indigo-800', label: 'Pronto para Entrega' };
      case 'entregador_designado':
        return { color: 'bg-purple-100 text-purple-800', label: 'Entregador Designado' };
      case 'saiu_entrega':
        return { color: 'bg-indigo-100 text-indigo-800', label: 'Saiu para Entrega' };
      case 'cliente_avisado':
        return { color: 'bg-purple-100 text-purple-800', label: 'Cliente Avisado' };
      case 'entregue':
        return { color: 'bg-green-100 text-green-800', label: 'Entregue' };
      case 'retirado':
        return { color: 'bg-green-100 text-green-800', label: 'Retirado' };
      case 'finalizado':
        return { color: 'bg-gray-100 text-gray-800', label: 'Finalizado' };
      case 'cancelado':
        return { color: 'bg-red-100 text-red-800', label: 'Cancelado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', label: status };
    }
  };

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.emit('join-client', id);

    newSocket.on('order-status-updated', (data) => {
      console.log('Status atualizado via WebSocket:', data);
      if (data.order) {
        setOrder(data.order);
        showUpdateNotification(data.order.order_status, order?.order_status);
      }
    });

    newSocket.on('payment-confirmed', (data) => {
      console.log('Pagamento confirmado via WebSocket:', data);
      if (data.order) {
        setOrder(data.order);
        showUpdateNotification('Pagamento Confirmado', 'Aguardando Pagamento');
      }
    });

    newSocket.on('payment-rejected', (data) => {
      console.log('Pagamento rejeitado via WebSocket:', data);
      if (data.order) {
        setOrder(data.order);
        showUpdateNotification('Pagamento Rejeitado', 'Aguardando Pagamento');
      }
    });

    return () => {
      newSocket.close();
    };
  }, [id]);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/${id}`);
        
        if (response.ok) {
          const data = await response.json();
          
          if (data.success && data.data && data.data.order) {
            setOrder(data.data.order);
          } else {
            console.error('Estrutura de dados inesperada:', data);
            setError('Formato de dados inválido');
          }
        } else {
          console.error('Erro na resposta:', response.status);
          setError('Pedido não encontrado');
        }
      } catch (error) {
        console.error('Erro ao buscar pedido:', error);
        setError('Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  const showUpdateNotification = (newStatus, oldStatus) => {
    if (newStatus !== oldStatus) {
      console.log(`Status atualizado: ${oldStatus} → ${newStatus}`);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/order/${order.id}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'O pedido solicitado não existe ou foi removido.'}
          </p>
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

  const currentStep = getCurrentStep(order);
  const paymentMethodInfo = getPaymentMethodInfo(order.payment_method);
  const paymentStatusInfo = getPaymentStatusInfo(order.payment_status);
  const orderStatusInfo = getOrderStatusInfo(order.order_status);

  return (
    <div className="min-h-screen bg-white">
      {/* Layout Desktop */}
      <div className="hidden lg:block">
        <div className="container mx-auto px-6 py-8 max-w-6xl">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Link 
                to="/"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Acompanhe seu Pedido</h1>
                <p className="text-gray-600">
                  Pedido #{order.id} • {new Date(order.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
                </p>
              </div>
            </div>
          </div>

          {/* Link de Rastreamento */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Copy className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Link de Rastreamento</h2>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={`${window.location.origin}/order/${order.id}`}
                readOnly
                className="flex-1 px-3 py-3 border border-gray-300 rounded-lg bg-white text-gray-600 text-sm"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                  copied 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {copied ? 'Copiado!' : 'Copiar'}
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Compartilhe este link para acompanhar o status do pedido
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {/* Progresso do Pedido */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 text-gray-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Status do Pedido</h2>
              </div>
              
              {/* Etapas */}
              <div className="relative">
                {getOrderSteps(order.delivery_type).map((step, index) => {
                  const Icon = step.icon;
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;
                  const isPending = index > currentStep;
                  
                  return (
                    <div key={step.key} className="flex items-center mb-6 last:mb-0 relative">
                      {/* Linha conectora */}
                      {index < getOrderSteps(order.delivery_type).length - 1 && (
                        <div 
                          className={`absolute left-5 top-10 w-0.5 h-6 transition-colors duration-300 ${
                            isCompleted ? 'bg-green-500' : 'bg-gray-300'
                          }`} 
                          style={{ zIndex: 1 }}
                        ></div>
                      )}
                      
                      {/* Ícone da etapa */}
                      <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                        isCompleted 
                          ? 'bg-green-500 border-green-500 text-white' 
                          : isCurrent 
                          ? 'bg-red-500 border-red-500 text-white'
                          : 'bg-gray-100 border-gray-300 text-gray-400'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      {/* Informações da etapa */}
                      <div className="ml-4 flex-1">
                        <h3 className={`font-semibold ${
                          isCompleted ? 'text-green-600' : isCurrent ? 'text-red-600' : 'text-gray-500'
                        }`}>
                          {step.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {isCompleted ? 'Concluído' : isCurrent ? 'Em andamento' : 'Aguardando'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Cancelado */}
              {order.order_status === 'cancelado' && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-red-600" />
                    <div>
                      <h3 className="font-semibold text-red-800">Pedido Cancelado</h3>
                      <p className="text-sm text-red-600">
                        {order.admin_notes || 'Este pedido foi cancelado.'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Informações do Pedido */}
            <div className="space-y-6">
              {/* Detalhes do Cliente */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Informações do Cliente</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Cliente</p>
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Telefone</p>
                      <p className="font-medium text-gray-900">{order.customer_phone}</p>
                    </div>
                  </div>
                  
                  {order.customer_address && (
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Endereço</p>
                        <p className="font-medium text-gray-900 text-sm leading-relaxed">{order.customer_address}</p>
                      </div>
                    </div>
                  )}
                  
                  {order.notes && (
                    <div className="flex items-start gap-3">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Observações</p>
                        <p className="font-medium text-gray-900 text-sm leading-relaxed">{order.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Status e Pagamento */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-gray-600" />
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Pagamento e Status</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status do Pedido</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${orderStatusInfo.color}`}>
                      {orderStatusInfo.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Status do Pagamento</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${paymentStatusInfo.color}`}>
                      {paymentStatusInfo.label}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Método de Pagamento</p>
                    <div className="flex items-center gap-2">
                      <paymentMethodInfo.icon className={`w-5 h-5 ${paymentMethodInfo.color}`} />
                      <span className="font-medium text-gray-900">{paymentMethodInfo.label}</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500 mb-2">Total</p>
                    <span className="text-2xl font-bold text-gray-900">
                      R$ {order.total_amount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mt-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Package className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Itens do Pedido</h2>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700 leading-relaxed">{order.items_summary}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Mobile */}
      <div className="lg:hidden">
        {/* Header Mobile */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-16 z-30">
          <div className="flex items-center gap-3">
            <Link 
              to="/"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Pedido #{order.id}</h1>
              <p className="text-sm text-gray-600">
                {new Date(order.created_at).toLocaleString('pt-BR', { 
                  day: '2-digit', 
                  month: '2-digit', 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-6">
          {/* Link de Rastreamento Mobile */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Copy className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Link de Rastreamento</h3>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={`${window.location.origin}/order/${order.id}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-600 text-xs"
              />
              <button
                onClick={handleCopyLink}
                className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
                  copied 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {copied ? 'OK' : 'Copiar'}
              </button>
            </div>
          </div>

          {/* Progresso Mobile */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Status do Pedido</h3>
            </div>
            
            <div className="relative">
              {getOrderSteps(order.delivery_type).map((step, index) => {
                const Icon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.key} className="flex items-center mb-4 last:mb-0 relative">
                    {index < getOrderSteps(order.delivery_type).length - 1 && (
                      <div 
                        className={`absolute left-4 top-8 w-0.5 h-4 ${
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      ></div>
                    )}
                    
                    <div className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    <div className="ml-3 flex-1">
                      <h4 className={`font-medium text-sm ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-red-600' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h4>
                      <p className="text-xs text-gray-600">
                        {isCompleted ? 'Concluído' : isCurrent ? 'Em andamento' : 'Aguardando'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {order.order_status === 'cancelado' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <div>
                    <h4 className="font-semibold text-red-800 text-sm">Pedido Cancelado</h4>
                    <p className="text-xs text-red-600 mt-1">
                      {order.admin_notes || 'Este pedido foi cancelado.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Informações Mobile */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Informações</h3>
            </div>
            
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-500">Cliente</p>
                <p className="font-medium text-gray-900">{order.customer_name}</p>
              </div>
              
              <div>
                <p className="text-gray-500">Telefone</p>
                <p className="font-medium text-gray-900">{order.customer_phone}</p>
              </div>
              
              {order.customer_address && (
                <div>
                  <p className="text-gray-500">Endereço</p>
                  <p className="font-medium text-gray-900 leading-relaxed">{order.customer_address}</p>
                </div>
              )}
              
              {order.notes && (
                <div>
                  <p className="text-gray-500">Observações</p>
                  <p className="font-medium text-gray-900 leading-relaxed">{order.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Pagamento Mobile */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Receipt className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Pagamento</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Status do Pedido</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${orderStatusInfo.color}`}>
                  {orderStatusInfo.label}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Pagamento</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${paymentStatusInfo.color}`}>
                  {paymentStatusInfo.label}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-gray-500 text-sm">Método</span>
                <div className="flex items-center gap-1">
                  <paymentMethodInfo.icon className={`w-4 h-4 ${paymentMethodInfo.color}`} />
                  <span className="font-medium text-gray-900 text-sm">{paymentMethodInfo.label}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="text-gray-900 font-medium">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  R$ {order.total_amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Itens Mobile */}
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-4 h-4 text-gray-600" />
              <h3 className="font-semibold text-gray-900">Itens do Pedido</h3>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-gray-700 text-sm leading-relaxed">{order.items_summary}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;
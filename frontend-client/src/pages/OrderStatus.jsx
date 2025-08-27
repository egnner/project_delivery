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
  Smartphone
} from 'lucide-react';
import { io } from 'socket.io-client';

const OrderStatus = () => {
  const { id } = useParams();
  const { settings } = useStoreSettings();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [socket, setSocket] = useState(null);

  // Etapas do pedido em ordem - baseadas no tipo de entrega
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

  // Mapeamento de status para etapas
  const getCurrentStep = (order) => {
    if (!order) return 0;
    
    if (order.order_status === 'cancelado') return -1;
    
    // Para DELIVERY
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
    
    // Para RETIRADA
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

  // Obter ícone e cor do método de pagamento
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

  // Obter status de pagamento
  const getPaymentStatusInfo = (status) => {
    switch (status) {
      case 'pendente':
        return { color: 'text-orange-600', label: 'Aguardando Confirmação' };
      case 'confirmado':
        return { color: 'text-green-600', label: 'Confirmado' };
      case 'rejeitado':
        return { color: 'text-red-600', label: 'Rejeitado' };
      default:
        return { color: 'text-gray-600', label: status };
    }
  };

  // Obter status do pedido
  const getOrderStatusInfo = (status) => {
    switch (status) {
      case 'novo':
        return { color: 'text-blue-600', label: 'Novo Pedido' };
      case 'preparando':
        return { color: 'text-yellow-600', label: 'Preparando' };
      case 'pronto':
        return { color: 'text-indigo-600', label: 'Pronto para Entrega' };
      case 'entregador_designado':
        return { color: 'text-purple-600', label: 'Entregador Designado' };
      case 'saiu_entrega':
        return { color: 'text-indigo-600', label: 'Saiu para Entrega' };
      case 'cliente_avisado':
        return { color: 'text-purple-600', label: 'Cliente Avisado' };
      case 'entregue':
        return { color: 'text-green-600', label: 'Entregue' };
      case 'retirado':
        return { color: 'text-green-600', label: 'Retirado' };
      case 'finalizado':
        return { color: 'text-gray-600', label: 'Finalizado' };
      case 'cancelado':
        return { color: 'text-red-600', label: 'Cancelado' };
      default:
        return { color: 'text-gray-600', label: status };
    }
  };

  useEffect(() => {
    // Conectar ao WebSocket
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    // Entrar na sala do pedido específico
    newSocket.emit('join-client', id);

    // Escutar eventos de atualização de status
    newSocket.on('order-status-updated', (data) => {
      console.log('🔔 Status atualizado via WebSocket:', data);
      if (data.order) {
        setOrder(data.order);
        // Mostrar notificação de atualização
        showUpdateNotification(data.order.order_status, order?.order_status);
      }
    });

    // Escutar eventos de confirmação de pagamento
    newSocket.on('payment-confirmed', (data) => {
      console.log('🔔 Pagamento confirmado via WebSocket:', data);
      if (data.order) {
        setOrder(data.order);
        showUpdateNotification('Pagamento Confirmado', 'Aguardando Pagamento');
      }
    });

    // Escutar eventos de rejeição de pagamento
    newSocket.on('payment-rejected', (data) => {
      console.log('🔔 Pagamento rejeitado via WebSocket:', data);
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
          
          // Verificar a estrutura da resposta
          if (data.success && data.data && data.data.order) {
            setOrder(data.data.order);
          } else {
            console.error('❌ Estrutura de dados inesperada:', data);
            setError('Formato de dados inválido');
          }
        } else {
          console.error('❌ Erro na resposta:', response.status);
          setError('Pedido não encontrado');
        }
      } catch (error) {
        console.error('💥 Erro ao buscar pedido:', error);
        setError('Erro ao carregar pedido');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

  // Função para mostrar notificação de atualização
  const showUpdateNotification = (newStatus, oldStatus) => {
    if (newStatus !== oldStatus) {
      // Aqui você pode implementar uma notificação toast ou alert
      console.log(`Status atualizado: ${oldStatus} → ${newStatus}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando status do pedido...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Pedido não encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            {error || 'O pedido solicitado não existe ou foi removido.'}
          </p>
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
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
  
  // Debug logs
  console.log('🔍 Debug - Order Status:', {
    order_id: order.id,
    delivery_type: order.delivery_type,
    order_status: order.order_status,
    payment_status: order.payment_status,
    currentStep: currentStep,
    steps: getOrderSteps(order.delivery_type).length
  });
  
  // Verificar se o currentStep está correto
  console.log('🔍 Debug - Current Step Validation:', {
    currentStep,
    expectedSteps: getOrderSteps(order.delivery_type).map((step, index) => ({
      index,
      label: step.label,
      shouldBeCompleted: index < currentStep
    }))
  });
  


  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Acompanhe seu Pedido
            </h1>
            <p className="text-gray-600">
              Pedido #{order.id} • {new Date(order.created_at).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' })}
            </p>
          </div>

          {/* Link de Rastreamento */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              🔗 Link de Rastreamento
            </h2>
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={`${window.location.origin}/order/${order.id}`}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
              />
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/order/${order.id}`)}
                className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Copiar
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Compartilhe este link para acompanhar o status do pedido
            </p>
          </div>

          {/* Progresso do Pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Status do Pedido
            </h2>
            
                         {/* Etapas */}
             <div className="relative">
               {getOrderSteps(order.delivery_type).map((step, index) => {
                 const Icon = step.icon;
                 const isCompleted = index < currentStep;
                 const isCurrent = index === currentStep;
                 const isPending = index > currentStep;
                 
                 console.log(`🔍 Debug - Step ${index}:`, {
                   step: step.label,
                   isCompleted,
                   isCurrent,
                   isPending,
                   currentStep
                 });
                 
                 return (
                   <div key={step.key} className="flex items-center mb-8 last:mb-0 relative">
                     {/* Linha conectora */}
                     {index < getOrderSteps(order.delivery_type).length - 1 && (
                       <div 
                         className={`absolute left-6 top-12 w-0.5 h-8 transition-colors duration-300 ${
                           isCompleted ? 'bg-green-500' : 'bg-gray-300'
                         }`} 
                         style={{ zIndex: 1 }}
                       ></div>
                     )}
                    
                    {/* Ícone da etapa */}
                    <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-2 ${
                      isCompleted 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : isCurrent 
                        ? 'bg-primary-500 border-primary-500 text-white'
                        : 'bg-gray-100 border-gray-300 text-gray-400'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {/* Informações da etapa */}
                    <div className="ml-4 flex-1">
                      <h3 className={`font-semibold ${
                        isCompleted ? 'text-green-600' : isCurrent ? 'text-primary-600' : 'text-gray-500'
                      }`}>
                        {step.label}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {isCompleted ? 'Concluído' : isCurrent ? (step.key === 'finalizado' ? 'Concluído' : 'Em andamento') : 'Aguardando'}
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Detalhes do Cliente */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Informações do Pedido
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Cliente:</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Telefone:</span>
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-700">Endereço:</span>
                  <span className="text-sm">{order.customer_address}</span>
                </div>
                {order.notes && (
                  <div className="flex items-start gap-2">
                    <span className="font-medium text-gray-700">Observações:</span>
                    <span className="text-sm">{order.notes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Status e Pagamento */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Status e Pagamento
              </h2>
              <div className="space-y-4">
                {/* Status do Pedido */}
                <div>
                  <span className="text-sm font-medium text-gray-600">Status do Pedido:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${orderStatusInfo.color} bg-opacity-10`}>
                      {orderStatusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Status do Pagamento */}
                <div>
                  <span className="text-sm font-medium text-gray-600">Status do Pagamento:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentStatusInfo.color} bg-opacity-10`}>
                      {paymentStatusInfo.label}
                    </span>
                  </div>
                </div>

                {/* Método de Pagamento */}
                <div>
                  <span className="text-sm font-medium text-gray-600">Método de Pagamento:</span>
                  <div className="flex items-center gap-2 mt-1">
                    <paymentMethodInfo.icon className={`w-5 h-5 ${paymentMethodInfo.color}`} />
                    <span className="capitalize">{paymentMethodInfo.label}</span>
                  </div>
                </div>

                {/* Total */}
                <div>
                  <span className="text-sm font-medium text-gray-600">Total:</span>
                  <div className="mt-1">
                    <span className="text-2xl font-bold text-primary-600">
                      R$ {order.total_amount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Itens do Pedido */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-8">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Itens do Pedido
            </h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700">{order.items_summary}</p>
            </div>
          </div>

          {/* Botão Voltar */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Voltar ao Início
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;

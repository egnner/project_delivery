import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Search, 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Truck, 
  ArrowLeft,
  Phone,
  Calendar,
  CreditCard,
  User,
  Receipt
} from 'lucide-react';
import { phoneMask, removePhoneMask } from '../utils/inputMasks';

const OrderHistory = () => {
  const [phone, setPhone] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);

  const handlePhoneChange = (e) => {
    const { value } = e.target;
    const maskedValue = phoneMask(value);
    setPhone(maskedValue);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;

    setLoading(true);
    setError(null);
    setOrders([]);

    try {
      const response = await fetch(`/api/orders/customer/${removePhoneMask(phone)}`);
      
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data || []);
        setSearched(true);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao buscar pedidos');
      }
    } catch (error) {
      console.error('Erro ao buscar pedidos:', error);
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'novo':
        return <Package className="w-5 h-5 text-blue-600" />;
      case 'preparando':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      case 'pronto':
        return <Package className="w-5 h-5 text-indigo-600" />;
      case 'pronto_retirada':
        return <Package className="w-5 h-5 text-indigo-600" />;
      case 'saiu_entrega':
        return <Truck className="w-5 h-5 text-purple-600" />;
      case 'entregue':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'cancelado':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Package className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'novo':
        return 'Novo Pedido';
      case 'preparando':
        return 'Preparando';
      case 'pronto':
        return 'Pronto';
      case 'pronto_retirada':
        return 'Pronto para Retirada';
      case 'saiu_entrega':
        return 'Em Entrega';
      case 'entregue':
        return 'Entregue';
      case 'cancelado':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'novo':
        return 'bg-blue-100 text-blue-800';
      case 'preparando':
        return 'bg-yellow-100 text-yellow-800';
      case 'pronto':
        return 'bg-indigo-100 text-indigo-800';
      case 'pronto_retirada':
        return 'bg-indigo-100 text-indigo-800';
      case 'saiu_entrega':
        return 'bg-purple-100 text-purple-800';
      case 'entregue':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', { 
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

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
                <h1 className="text-3xl font-bold text-gray-900">Histórico de Pedidos</h1>
                <p className="text-gray-600">Digite seu telefone para ver todos os seus pedidos</p>
              </div>
            </div>
          </div>

          {/* Formulário de busca */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <Search className="w-4 h-4 text-gray-600" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900">Buscar Pedidos</h2>
            </div>
            
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(27) 99999-9999"
                  maxLength="15"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-colors"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar Pedidos
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Resultados Desktop */}
          {searched && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">
                  Resultados da Busca
                </h2>
                <span className="text-gray-600">
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
                </span>
              </div>

              {error ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                  <p className="text-red-600 font-medium">{error}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Nenhum pedido encontrado</h3>
                  <p className="text-gray-600">Não encontramos pedidos para este número de telefone</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.order_status)}
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              Pedido #{order.id}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-3 py-2 rounded-lg text-sm font-semibold ${getStatusColor(order.order_status)}`}>
                          {getStatusText(order.order_status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-6 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Cliente</span>
                          </div>
                          <p className="text-gray-900 font-medium">{order.customer_name}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Phone className="w-3 h-3" />
                            <span>{order.customer_phone}</span>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Pagamento</span>
                          </div>
                          <p className="text-gray-900 font-medium capitalize">{order.payment_method}</p>
                          <p className="text-2xl font-bold text-red-600 mt-1">
                            R$ {order.total_amount.toFixed(2).replace('.', ',')}
                          </p>
                        </div>

                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-medium text-gray-600">Itens</span>
                          </div>
                          <p className="text-gray-900 text-sm leading-relaxed">{order.items_summary}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end pt-4 border-t border-gray-200">
                        <Link
                          to={`/order/${order.id}`}
                          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
              <h1 className="text-lg font-bold text-gray-900">Histórico de Pedidos</h1>
              <p className="text-sm text-gray-600">Busque seus pedidos pelo telefone</p>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* Formulário Mobile */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-4 h-4 text-gray-600" />
              <h2 className="font-semibold text-gray-900">Buscar Pedidos</h2>
            </div>
            
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={handlePhoneChange}
                  placeholder="(27) 99999-9999"
                  maxLength="15"
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading || !phone.trim()}
                className="w-full bg-red-500 hover:bg-red-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Buscando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Buscar Pedidos
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Resultados Mobile */}
          {searched && (
            <div className="space-y-4">
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <h2 className="font-semibold text-gray-900 mb-2">Resultados</h2>
                <p className="text-sm text-gray-600">
                  {orders.length} pedido{orders.length !== 1 ? 's' : ''} encontrado{orders.length !== 1 ? 's' : ''}
                </p>
              </div>

              {error ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                    <p className="text-red-600 font-medium">{error}</p>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Package className="w-6 h-6 text-gray-400" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">Nenhum pedido encontrado</h3>
                    <p className="text-sm text-gray-600">Não encontramos pedidos para este telefone</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.order_status)}
                          <div>
                            <h3 className="font-semibold text-gray-900">Pedido #{order.id}</h3>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${getStatusColor(order.order_status)}`}>
                          {getStatusText(order.order_status)}
                        </span>
                      </div>

                      <div className="space-y-3 mb-4">
                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <User className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Cliente</span>
                          </div>
                          <p className="text-sm font-medium text-gray-900">{order.customer_name}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-600">
                            <Phone className="w-3 h-3" />
                            <span>{order.customer_phone}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-1 mb-1">
                              <CreditCard className="w-3 h-3 text-gray-400" />
                              <span className="text-xs font-medium text-gray-600">Pagamento</span>
                            </div>
                            <p className="text-sm font-medium text-gray-900 capitalize">{order.payment_method}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600 mb-1">Total</p>
                            <p className="text-lg font-bold text-red-600">
                              R$ {order.total_amount.toFixed(2).replace('.', ',')}
                            </p>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center gap-1 mb-1">
                            <Package className="w-3 h-3 text-gray-400" />
                            <span className="text-xs font-medium text-gray-600">Itens</span>
                          </div>
                          <p className="text-sm text-gray-900 leading-relaxed">{order.items_summary}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200">
                        <Link
                          to={`/order/${order.id}`}
                          className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg font-medium transition-colors text-center block"
                        >
                          Ver Detalhes
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
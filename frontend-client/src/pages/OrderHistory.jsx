import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Package, Clock, CheckCircle, XCircle, Truck } from 'lucide-react';
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
    return new Date(dateString).toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Histórico de Pedidos
            </h1>
            <p className="text-gray-600">
              Digite seu telefone para ver todos os seus pedidos
            </p>
          </div>

          {/* Formulário de busca */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={loading || !phone.trim()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Resultados */}
          {searched && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Pedidos encontrados: {orders.length}
              </h2>

              {error ? (
                <div className="text-center py-8">
                  <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                  <p className="text-red-600">{error}</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Nenhum pedido encontrado para este CPF</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(order.order_status)}
                          <div>
                            <h3 className="font-semibold text-gray-800">
                              Pedido #{order.id}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.order_status)}`}>
                          {getStatusText(order.order_status)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-sm font-medium text-gray-600">Cliente:</span>
                          <p className="text-gray-800">{order.customer_name}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Telefone:</span>
                          <p className="text-gray-800">{order.customer_phone}</p>
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-600">Total:</span>
                          <p className="text-lg font-bold text-primary-600">
                            R$ {order.total_amount.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>

                      <div className="mb-3">
                        <span className="text-sm font-medium text-gray-600">Itens:</span>
                        <p className="text-gray-800">{order.items_summary}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Método de Pagamento:</span>
                          <span className="ml-2 capitalize">{order.payment_method}</span>
                        </div>
                        <Link
                          to={`/order/${order.id}`}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
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

export default OrderHistory;

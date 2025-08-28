import React, { useState, useEffect } from 'react';
import { 
  Users, 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Package, 
  DollarSign, 
  Search, 
  Filter, 
  Download,
  Eye,
  Mail,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  ShoppingBag,
  X,
  Star,
  Award,
  Activity
} from 'lucide-react';
import { api } from '../config/api';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/admin/customers');
      
      if (response && response.ok) {
        const data = await response.json();
        setCustomers(data.data || []);
      } else if (response && response.error) {
        console.error('Erro ao carregar clientes:', response);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    try {
      const csvData = customers.map(customer => ({
        'ID Cliente': customer.id,
        'Nome': customer.customer_name,
        'Telefone': customer.customer_phone,
        'Email': customer.customer_email || 'N/A',
        'Endereço': customer.customer_address || 'N/A',
        'Total de Pedidos': customer.total_orders || 0,
        'Valor Total Gasto (R$)': customer.total_spent?.toFixed(2).replace('.', ',') || '0,00',
        'Ticket Médio (R$)': customer.total_orders > 0 
          ? (customer.total_spent / customer.total_orders).toFixed(2).replace('.', ',')
          : '0,00',
        'Primeiro Pedido': customer.first_order_date 
          ? new Date(customer.first_order_date).toLocaleDateString('pt-BR')
          : 'N/A',
        'Último Pedido': customer.last_order_date 
          ? new Date(customer.last_order_date).toLocaleDateString('pt-BR')
          : 'N/A',
        'Status': customer.status || 'Ativo',
        'Categoria': (customer.total_spent || 0) > 100 ? 'VIP' : 
                    (customer.total_spent || 0) > 50 ? 'Regular' : 'Novo'
      }));

      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      const BOM = '\uFEFF';
      const csvContentWithBOM = BOM + csvContent;
      const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      const timestamp = new Date().toLocaleDateString('pt-BR').split('/').reverse().join('-');
      const time = new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-');
      link.setAttribute('download', `clientes_${timestamp}_${time}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error('Erro ao exportar CSV:', error);
    }
  };

  const getCustomerStats = () => {
    if (customers.length === 0) return {};

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status !== 'inativo').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const totalOrders = customers.reduce((sum, c) => sum + (c.total_orders || 0), 0);
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      avgOrderValue
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const getCustomerCategory = (totalSpent) => {
    if (totalSpent > 200) return { label: 'VIP', color: 'bg-purple-100 text-purple-800 border-purple-200' };
    if (totalSpent > 100) return { label: 'Premium', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (totalSpent > 50) return { label: 'Regular', color: 'bg-green-100 text-green-800 border-green-200' };
    return { label: 'Novo', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_phone?.includes(searchTerm) ||
      customer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'active' && customer.status !== 'inativo') ||
      (filterType === 'inactive' && customer.status === 'inativo') ||
      (filterType === 'vip' && (customer.total_spent || 0) > 100) ||
      (filterType === 'new' && (customer.total_spent || 0) <= 50);

    return matchesSearch && matchesFilter;
  });

  const stats = getCustomerStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando clientes...</p>
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
                Clientes
              </h1>
              <p className="text-gray-600">
                Visualize e gerencie todos os clientes e seus pedidos
              </p>
            </div>
            <button
              onClick={exportToCSV}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 w-fit"
            >
              <Download className="w-5 h-5" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.totalCustomers}</p>
                <p className="text-sm text-gray-600">Total de Clientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.activeCustomers}</p>
                <p className="text-sm text-gray-600">Clientes Ativos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-sm text-gray-600">Receita Total</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
                <p className="text-sm text-gray-600">Ticket Médio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 lg:p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por nome, telefone ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilterType('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setFilterType('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'active'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ativos
              </button>
              <button
                onClick={() => setFilterType('vip')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'vip'
                    ? 'bg-purple-100 text-purple-700 border border-purple-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                VIP/Premium
              </button>
              <button
                onClick={() => setFilterType('new')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterType === 'new'
                    ? 'bg-gray-100 text-gray-700 border border-gray-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Novos
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Clientes */}
        {filteredCustomers.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {searchTerm || filterType !== 'all' ? (
                <Search className="w-8 h-8 text-gray-400" />
              ) : (
                <Users className="w-8 h-8 text-gray-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterType !== 'all' ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </h3>
            <p className="text-gray-600">
              {searchTerm || filterType !== 'all' 
                ? 'Tente ajustar os filtros para encontrar o que procura'
                : 'Quando os clientes fizerem pedidos, eles aparecerão aqui automaticamente'
              }
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:gap-6">
            {filteredCustomers.map((customer) => {
              const category = getCustomerCategory(customer.total_spent || 0);
              
              return (
                <div key={customer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">{customer.customer_name}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">ID: {customer.id}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${category.color}`}>
                            {category.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Informações de Contato</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <button
                          onClick={() => {
                            const phoneNumber = customer.customer_phone.replace(/\D/g, '');
                            const whatsappUrl = `https://wa.me/55${phoneNumber}`;
                            window.open(whatsappUrl, '_blank');
                          }}
                          className="hover:text-green-600 hover:underline transition-colors duration-200 cursor-pointer"
                          title="Abrir WhatsApp"
                        >
                          {customer.customer_phone}
                        </button>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span>{customer.customer_email || 'Email não informado'}</span>
                      </div>
                      <div className="flex items-start gap-3 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        {customer.customer_address ? (
                          <button
                            onClick={() => {
                              const encodedAddress = encodeURIComponent(customer.customer_address);
                              const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
                              window.open(googleMapsUrl, '_blank');
                            }}
                            className="line-clamp-2 hover:text-blue-600 hover:underline transition-colors duration-200 cursor-pointer text-left"
                            title="Abrir no Google Maps"
                          >
                            {customer.customer_address}
                          </button>
                        ) : (
                          <span className="line-clamp-2">Endereço não informado</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Datas Importantes</h4>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-medium">Cliente desde: </span>
                          <span>{formatDate(customer.first_order_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-medium">Último pedido: </span>
                          <span>{formatDate(customer.last_order_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <Package className="w-4 h-4 text-blue-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">{customer.total_orders || 0}</p>
                      <p className="text-xs text-gray-600">Pedidos</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(customer.total_spent)}
                      </p>
                      <p className="text-xs text-gray-600">Total Gasto</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-center gap-1 mb-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {customer.total_orders > 0 ? formatCurrency((customer.total_spent || 0) / customer.total_orders) : 'R$ 0,00'}
                      </p>
                      <p className="text-xs text-gray-600">Ticket Médio</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.customer_name}</h2>
                    <p className="text-gray-600">Cliente #{selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Informações de Contato</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedCustomer.customer_name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-gray-400" />
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
                      <div className="flex items-center gap-3">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{selectedCustomer.customer_email || 'Não informado'}</span>
                      </div>
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                        {selectedCustomer.customer_address ? (
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
                        ) : (
                          <span className="text-gray-700">Não informado</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Datas Importantes</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-700">Primeiro Pedido: </span>
                          <span className="text-gray-600">{formatDate(selectedCustomer.first_order_date)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <span className="font-medium text-gray-700">Último Pedido: </span>
                          <span className="text-gray-600">{formatDate(selectedCustomer.last_order_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Estatísticas</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-blue-900">{selectedCustomer.total_orders || 0}</p>
                      <p className="text-sm text-blue-700">Total de Pedidos</p>
                    </div>
                    
                    <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                      <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(selectedCustomer.total_spent)}</p>
                      <p className="text-sm text-green-700">Total Gasto</p>
                    </div>
                    
                    <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-purple-900">
                        {selectedCustomer.total_orders > 0 
                          ? formatCurrency((selectedCustomer.total_spent || 0) / selectedCustomer.total_orders)
                          : 'R$ 0,00'
                        }
                      </p>
                      <p className="text-sm text-purple-700">Ticket Médio</p>
                    </div>
                    
                    <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <Award className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <p className="text-lg font-bold text-orange-900">
                        {getCustomerCategory(selectedCustomer.total_spent || 0).label}
                      </p>
                      <p className="text-sm text-orange-700">Categoria</p>
                    </div>
                  </div>
                </div>
              </div>

              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Pedidos</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">Pedido #{order.id}</p>
                          <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-blue-600">{formatCurrency(order.total_amount)}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            order.order_status === 'entregue' ? 'bg-green-100 text-green-700' :
                            order.order_status === 'cancelado' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {order.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
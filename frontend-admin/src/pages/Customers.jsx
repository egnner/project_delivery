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
  ShoppingBag
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
      console.log('🔍 Buscando clientes...');
      
      const response = await api.get('/api/admin/customers');
      
      if (response && response.ok) {
        const data = await response.json();
        console.log('✅ Clientes carregados:', data.data?.length || 0);
        setCustomers(data.data || []);
      } else if (response && response.error) {
        console.error('❌ Erro ao carregar clientes:', response);
      }
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  // Função para exportar dados como CSV
  const exportToCSV = () => {
    try {
      // Preparar dados para CSV com mais informações
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
                    (customer.total_spent || 0) > 50 ? 'Regular' : 'Novo',
        'Dias desde último pedido': customer.last_order_date 
          ? Math.floor((new Date() - new Date(customer.last_order_date)) / (1000 * 60 * 60 * 24))
          : 'N/A'
      }));

      // Criar cabeçalho CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => 
          headers.map(header => {
            const value = row[header];
            // Escapar vírgulas e aspas no CSV
            if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\n');

      // Adicionar BOM para UTF-8 (importante para Excel)
      const BOM = '\uFEFF';
      const csvContentWithBOM = BOM + csvContent;

      // Criar e baixar arquivo
      const blob = new Blob([csvContentWithBOM], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Nome do arquivo com timestamp
      const timestamp = new Date().toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' }).split('/').reverse().join('-');
      const time = new Date().toLocaleTimeString('pt-BR', { timeZone: 'America/Sao_Paulo' }).replace(/:/g, '-');
      link.setAttribute('download', `clientes_${timestamp}_${time}.csv`);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Limpar URL
      URL.revokeObjectURL(url);

      console.log('📊 CSV exportado com sucesso');
      
      // Mostrar toast de sucesso
      showSuccessToast('CSV exportado com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao exportar CSV:', error);
      showErrorToast('Erro ao exportar CSV. Tente novamente.');
    }
  };

  // Função para calcular estatísticas dos clientes
  const getCustomerStats = () => {
    if (customers.length === 0) return {};

    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.status !== 'inativo').length;
    const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
    const avgOrderValue = totalRevenue / customers.reduce((sum, c) => sum + (c.total_orders || 0), 1);
    const topCustomer = customers.reduce((max, c) => 
      (c.total_spent || 0) > (max.total_spent || 0) ? c : max
    );

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      avgOrderValue,
      topCustomer
    };
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    });
  };

  // Função para formatar valor monetário
  const formatCurrency = (value) => {
    if (!value) return 'R$ 0,00';
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  // Filtrar clientes
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_phone?.includes(searchTerm) ||
      customer.customer_email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'active' && customer.status !== 'inativo') ||
      (filterType === 'inactive' && customer.status === 'inativo') ||
      (filterType === 'vip' && (customer.total_spent || 0) > 100);

    return matchesSearch && matchesFilter;
  });

  const stats = getCustomerStats();

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gerenciar Clientes</h1>
            <p className="text-gray-600">Visualize e gerencie todos os clientes e seus pedidos</p>
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Clientes Ativos</p>
                <p className="text-2xl font-bold text-green-900">{stats.activeCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.avgOrderValue)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Busca e Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar por nome, telefone ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 appearance-none cursor-pointer"
            >
              <option value="all">Todos os clientes</option>
              <option value="active">Clientes ativos</option>
              <option value="inactive">Clientes inativos</option>
              <option value="vip">Clientes VIP (R$ 100+)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="grid gap-4">
        {filteredCustomers.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            {searchTerm || filterType !== 'all' ? (
              <div>
                <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente encontrado</h3>
                <p className="text-gray-500">
                  Não encontramos clientes com os filtros aplicados. Tente ajustar sua busca.
                </p>
              </div>
            ) : (
              <div>
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum cliente cadastrado</h3>
                <p className="text-gray-500">
                  Quando os clientes fizerem pedidos, eles aparecerão aqui automaticamente.
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredCustomers.map((customer) => (
            <div key={customer.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
              {/* Header do Card */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{customer.customer_name}</h3>
                    <p className="text-sm text-gray-500">Cliente #{customer.id}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setSelectedCustomer(customer);
                      setShowModal(true);
                    }}
                    className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{customer.customer_phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {customer.customer_email || 'Email não informado'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">
                    {customer.customer_address || 'Endereço não informado'}
                  </span>
                </div>
              </div>

              {/* Estatísticas do Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Package className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">{customer.total_orders || 0}</p>
                  <p className="text-xs text-gray-500">Total de Pedidos</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <DollarSign className="w-6 h-6 text-green-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">
                    {formatCurrency(customer.total_spent)}
                  </p>
                  <p className="text-xs text-gray-500">Total Gasto</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">
                    {customer.total_orders > 0 ? formatCurrency((customer.total_spent || 0) / customer.total_orders) : 'R$ 0,00'}
                  </p>
                  <p className="text-xs text-gray-500">Ticket Médio</p>
                </div>
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-lg font-bold text-gray-900">
                    {customer.last_order_date ? formatDate(customer.last_order_date) : 'N/A'}
                  </p>
                  <p className="text-xs text-gray-500">Último Pedido</p>
                </div>
              </div>

              {/* Status e Categoria */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    (customer.total_spent || 0) > 100 
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : (customer.total_spent || 0) > 50
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'bg-gray-100 text-gray-700 border border-gray-200'
                  }`}>
                    {(customer.total_spent || 0) > 100 ? 'VIP' : 
                     (customer.total_spent || 0) > 50 ? 'Regular' : 'Novo'}
                  </span>
                  
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    customer.status === 'inativo' 
                      ? 'bg-red-100 text-red-700 border border-red-200'
                      : 'bg-green-100 text-green-700 border border-green-200'
                  }`}>
                    {customer.status === 'inativo' ? 'Inativo' : 'Ativo'}
                  </span>
                </div>
                
                <div className="text-right">
                  <p className="text-sm text-gray-500">Cliente desde</p>
                  <p className="text-sm font-medium text-gray-900">
                    {customer.first_order_date ? formatDate(customer.first_order_date) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalhes do Cliente */}
      {showModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.customer_name}</h2>
                    <p className="text-gray-600">Cliente #{selectedCustomer.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              {/* Informações Detalhadas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Informações de Contato</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Nome:</span> {selectedCustomer.customer_name}</p>
                    <p><span className="font-medium">Telefone:</span> {selectedCustomer.customer_phone}</p>
                    <p><span className="font-medium">Email:</span> {selectedCustomer.customer_email || 'Não informado'}</p>
                    <p><span className="font-medium">Endereço:</span> {selectedCustomer.customer_address || 'Não informado'}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3">Estatísticas</h3>
                  <div className="space-y-2">
                    <p><span className="font-medium">Total de Pedidos:</span> {selectedCustomer.total_orders || 0}</p>
                    <p><span className="font-medium">Valor Total Gasto:</span> {formatCurrency(selectedCustomer.total_spent)}</p>
                    <p><span className="font-medium">Ticket Médio:</span> {
                      selectedCustomer.total_orders > 0 
                        ? formatCurrency((selectedCustomer.total_spent || 0) / selectedCustomer.total_orders)
                        : 'R$ 0,00'
                    }</p>
                    <p><span className="font-medium">Categoria:</span> {
                      (selectedCustomer.total_spent || 0) > 100 ? 'VIP' : 
                      (selectedCustomer.total_spent || 0) > 50 ? 'Regular' : 'Novo'
                    }</p>
                  </div>
                </div>
              </div>

              {/* Histórico de Pedidos */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Histórico de Pedidos</h3>
                {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((order) => (
                      <div key={order.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">Pedido #{order.id}</p>
                            <p className="text-sm text-gray-600">{formatDate(order.created_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary-600">{formatCurrency(order.total_amount)}</p>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              order.order_status === 'entregue' ? 'bg-green-100 text-green-700' :
                              order.order_status === 'cancelado' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {order.order_status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">Nenhum pedido encontrado</p>
                )}
              </div>

              {/* Datas Importantes */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Datas Importantes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Primeiro Pedido:</span> {formatDate(selectedCustomer.first_order_date)}</p>
                    <p><span className="font-medium">Último Pedido:</span> {formatDate(selectedCustomer.last_order_date)}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">Status:</span> {selectedCustomer.status || 'Ativo'}</p>
                    <p><span className="font-medium">Cliente desde:</span> {formatDate(selectedCustomer.first_order_date)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;

import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  Filter,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  CreditCard,
  Smartphone,
  Star,
  AlertCircle,
  Target,
  Zap,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';
import { api } from '../config/api';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  AreaChart
} from 'recharts';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7'); // dias
  const [reportData, setReportData] = useState({
    // Métricas principais
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    growthRate: 0,
    
    // Dados temporais
    revenueByDay: [],
    ordersByDay: [],
    ordersByHour: [],
    
    // Status e tipos
    ordersByStatus: [],
    ordersByType: [],
    paymentMethods: [],
    
    // Produtos e performance
    topProducts: [],
    topCustomers: [],
    
    // Métricas operacionais
    averagePreparationTime: 0,
    deliveryPerformance: {},
    cancellationRate: 0,
    
    // Comparações
    previousPeriod: {},
    
    // Dados recentes
    recentOrders: [],
    alerts: []
  });

  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [dateRange]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      
      // Buscar dados de relatórios
      const response = await api.get(`/api/admin/reports?days=${dateRange}`);
      
      if (response && response.ok) {
        const data = await response.json();
        console.log('📊 Dados de relatórios recebidos:', data.data);
        setReportData(data.data || {});
      } else {
        console.error('Erro ao buscar relatórios:', response?.status || 'Erro desconhecido');
        // Fallback para dados mock em caso de erro
        setReportData({
          totalOrders: 156,
          totalRevenue: 8750.80,
          totalCustomers: 89,
          averageOrderValue: 56.09,
          growthRate: 12.5,
          
          revenueByDay: [
            { day: 'Seg', revenue: 1200, orders: 24 },
            { day: 'Ter', revenue: 1500, orders: 28 },
            { day: 'Qua', revenue: 1100, orders: 22 },
            { day: 'Qui', revenue: 1800, orders: 35 },
            { day: 'Sex', revenue: 2200, orders: 42 },
            { day: 'Sab', revenue: 1950, orders: 38 },
            { day: 'Dom', revenue: 1750, orders: 33 }
          ],
          
          ordersByHour: [
            { hour: '08h', orders: 2 },
            { hour: '09h', orders: 4 },
            { hour: '10h', orders: 8 },
            { hour: '11h', orders: 15 },
            { hour: '12h', orders: 28 },
            { hour: '13h', orders: 22 },
            { hour: '14h', orders: 18 },
            { hour: '15h', orders: 12 },
            { hour: '16h', orders: 8 },
            { hour: '17h', orders: 6 },
            { hour: '18h', orders: 12 },
            { hour: '19h', orders: 18 },
            { hour: '20h', orders: 25 },
            { hour: '21h', orders: 15 },
            { hour: '22h', orders: 8 }
          ],
          
          ordersByStatus: [
            { status: 'Finalizado', count: 120, color: '#10B981' },
            { status: 'Em Andamento', count: 18, color: '#3B82F6' },
            { status: 'Cancelado', count: 8, color: '#EF4444' },
            { status: 'Pendente', count: 10, color: '#F59E0B' }
          ],
          
          ordersByType: [
            { type: 'Delivery', count: 98, percentage: 62.8, color: '#8B5CF6' },
            { type: 'Retirada', count: 58, percentage: 37.2, color: '#06B6D4' }
          ],
          
          paymentMethods: [
            { method: 'PIX', count: 78, percentage: 50, color: '#10B981' },
            { method: 'Cartão', count: 58, percentage: 37.2, color: '#3B82F6' },
            { method: 'Dinheiro', count: 20, percentage: 12.8, color: '#F59E0B' }
          ],
          
          topProducts: [
            { name: 'Pizza Marguerita', sales: 45, revenue: 1350, avgRating: 4.8 },
            { name: 'Hambúrguer Artesanal', sales: 38, revenue: 1140, avgRating: 4.6 },
            { name: 'Lasanha Bolonhesa', sales: 32, revenue: 960, avgRating: 4.9 },
            { name: 'Sushi Combo', sales: 28, revenue: 1400, avgRating: 4.7 },
            { name: 'Açaí 500ml', sales: 25, revenue: 375, avgRating: 4.5 }
          ],
          
          topCustomers: [
            { name: 'João Silva', orders: 12, spent: 720, lastOrder: '2025-01-15' },
            { name: 'Maria Santos', orders: 8, spent: 480, lastOrder: '2025-01-14' },
            { name: 'Pedro Costa', orders: 7, spent: 420, lastOrder: '2025-01-13' },
            { name: 'Ana Oliveira', orders: 6, spent: 360, lastOrder: '2025-01-12' }
          ],
          
          averagePreparationTime: 28,
          deliveryPerformance: {
            onTime: 85,
            delayed: 12,
            veryDelayed: 3
          },
          cancellationRate: 5.1,
          
          previousPeriod: {
            totalOrders: 139,
            totalRevenue: 7800.50,
            totalCustomers: 76
          },
          
          recentOrders: [
            { id: 156, customer: 'Ana Costa', total: 67.50, status: 'preparando', time: '14:32' },
            { id: 155, customer: 'Carlos Lima', total: 45.90, status: 'pronto', time: '14:28' },
            { id: 154, customer: 'Mariana Souza', total: 89.20, status: 'saiu_entrega', time: '14:15' },
            { id: 153, customer: 'Roberto Silva', total: 34.50, status: 'finalizado', time: '14:10' },
            { id: 152, customer: 'Fernanda Alves', total: 78.30, status: 'finalizado', time: '14:05' }
          ],
          
          alerts: [
            { type: 'warning', message: 'Tempo médio de preparo aumentou 15% esta semana', priority: 'medium' },
            { type: 'success', message: 'Taxa de conversão de clientes aumentou 8%', priority: 'low' },
            { type: 'info', message: 'Pico de pedidos às 20h - considere aumentar equipe', priority: 'medium' }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao buscar dados de relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchReportData();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'preparando': return 'bg-yellow-100 text-yellow-800';
      case 'pronto': return 'bg-blue-100 text-blue-800';
      case 'saiu_entrega': return 'bg-purple-100 text-purple-800';
      case 'finalizado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'preparando': return <Clock className="w-4 h-4" />;
      case 'pronto': return <CheckCircle className="w-4 h-4" />;
      case 'saiu_entrega': return <Truck className="w-4 h-4" />;
      case 'finalizado': return <CheckCircle className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
          <h1 className="text-3xl font-bold text-gray-900">Relatórios Gerenciais</h1>
          <p className="text-gray-600 mt-1">Análise completa do desempenho do seu negócio</p>
          </div>
        
        <div className="flex items-center gap-3">
          {/* Filtro de período */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="1">Hoje</option>
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>
          
          {/* Botão de atualizar */}
            <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Atualizar
            </button>
          </div>
        </div>

      {/* Alertas */}
      {reportData.alerts?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            Alertas e Insights
          </h3>
          <div className="space-y-3">
            {reportData.alerts.map((alert, index) => (
              <div key={index} className={`flex items-start gap-3 p-4 rounded-lg border-l-4 ${
                alert.type === 'warning' ? 'bg-amber-50 border-amber-400' :
                alert.type === 'success' ? 'bg-green-50 border-green-400' :
                'bg-blue-50 border-blue-400'
              }`}>
                <div className={`p-1 rounded-full ${
                  alert.type === 'warning' ? 'bg-amber-100' :
                  alert.type === 'success' ? 'bg-green-100' :
                  'bg-blue-100'
                }`}>
                  {alert.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-600" />}
                  {alert.type === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                  {alert.type === 'info' && <Zap className="w-4 h-4 text-blue-600" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <span className={`text-xs px-2 py-1 rounded-full mt-1 inline-block ${
                    alert.priority === 'high' ? 'bg-red-100 text-red-700' :
                    alert.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {alert.priority === 'high' ? 'Alta Prioridade' :
                     alert.priority === 'medium' ? 'Média Prioridade' : 'Baixa Prioridade'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {/* Total de Pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-medium text-gray-600 truncate">Total de Pedidos</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{reportData.totalOrders}</p>
              <div className="flex items-center mt-2 text-xs sm:text-sm">
                {calculateGrowth(reportData.totalOrders, reportData.previousPeriod?.totalOrders) >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={`ml-1 font-medium ${
                  calculateGrowth(reportData.totalOrders, reportData.previousPeriod?.totalOrders) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(calculateGrowth(reportData.totalOrders, reportData.previousPeriod?.totalOrders)).toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-1 hidden sm:inline">vs período anterior</span>
              </div>
            </div>
            <div className="p-2 lg:p-3 bg-blue-100 rounded-lg flex-shrink-0">
              <ShoppingBag className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600" />
              </div>
            </div>
          </div>
          
        {/* Receita Total */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-medium text-gray-600 truncate">Receita Total</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.totalRevenue)}</p>
              <div className="flex items-center mt-2 text-xs sm:text-sm">
                {calculateGrowth(reportData.totalRevenue, reportData.previousPeriod?.totalRevenue) >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={`ml-1 font-medium ${
                  calculateGrowth(reportData.totalRevenue, reportData.previousPeriod?.totalRevenue) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(calculateGrowth(reportData.totalRevenue, reportData.previousPeriod?.totalRevenue)).toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-1 hidden sm:inline">vs período anterior</span>
              </div>
            </div>
            <div className="p-2 lg:p-3 bg-green-100 rounded-lg flex-shrink-0">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
              </div>
            </div>
          </div>
          
        {/* Ticket Médio */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-medium text-gray-600 truncate">Ticket Médio</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{formatCurrency(reportData.averageOrderValue)}</p>
              <div className="flex items-center mt-2 text-xs sm:text-sm">
                <Target className="w-3 h-3 sm:w-4 sm:h-4 text-purple-500 flex-shrink-0" />
                <span className="text-gray-500 ml-1 truncate">Meta: R$ 60,00</span>
              </div>
            </div>
            <div className="p-2 lg:p-3 bg-purple-100 rounded-lg flex-shrink-0">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-purple-600" />
              </div>
            </div>
          </div>
          
        {/* Total de Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-3">
              <p className="text-sm font-medium text-gray-600 truncate">Total de Clientes</p>
              <p className="text-2xl lg:text-3xl font-bold text-gray-900 mt-2">{reportData.totalCustomers}</p>
              <div className="flex items-center mt-2 text-xs sm:text-sm">
                {calculateGrowth(reportData.totalCustomers, reportData.previousPeriod?.totalCustomers) >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 sm:w-4 sm:h-4 text-red-500 flex-shrink-0" />
                )}
                <span className={`ml-1 font-medium ${
                  calculateGrowth(reportData.totalCustomers, reportData.previousPeriod?.totalCustomers) >= 0 
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Math.abs(calculateGrowth(reportData.totalCustomers, reportData.previousPeriod?.totalCustomers)).toFixed(1)}%
                </span>
                <span className="text-gray-500 ml-1 hidden sm:inline">vs período anterior</span>
              </div>
            </div>
            <div className="p-2 lg:p-3 bg-amber-100 rounded-lg flex-shrink-0">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

      {/* Gráficos Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Receita por Dia */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Receita por Dia</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={reportData.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Receita']} />
              <Area type="monotone" dataKey="revenue" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.1} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Pedidos por Hora */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pedidos por Horário</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={reportData.ordersByHour}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="orders" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status e Tipos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Status dos Pedidos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status dos Pedidos</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={reportData.ordersByStatus}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                dataKey="count"
              >
                {reportData.ordersByStatus?.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
      </div>

        {/* Tipos de Entrega */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tipos de Entrega</h3>
          <div className="space-y-4">
            {reportData.ordersByType?.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: type.color }}
                    ></div>
                  <span className="text-sm font-medium text-gray-700">{type.type}</span>
                  </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{type.count}</div>
                  <div className="text-xs text-gray-500">{type.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Métodos de Pagamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métodos de Pagamento</h3>
          <div className="space-y-4">
            {reportData.paymentMethods?.map((method, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: method.color }}
                    ></div>
                  <span className="text-sm font-medium text-gray-700">{method.method}</span>
                  </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">{method.count}</div>
                  <div className="text-xs text-gray-500">{method.percentage}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Produtos e Clientes Top */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Top Produtos */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Produtos Mais Vendidos</h3>
          <div className="space-y-4">
          {reportData.topProducts?.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm text-gray-600">{product.avgRating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{product.sales} vendas</p>
                  <p className="text-sm text-gray-600">{formatCurrency(product.revenue)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

        {/* Top Clientes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Melhores Clientes</h3>
          <div className="space-y-4">
            {reportData.topCustomers?.map((customer, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
          <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-600">Último pedido: {customer.lastOrder}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{customer.orders} pedidos</p>
                  <p className="text-sm text-gray-600">{formatCurrency(customer.spent)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Métricas Operacionais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Tempo de Preparo */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            Tempo de Preparo
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {reportData.averagePreparationTime}min
            </div>
            <p className="text-sm text-gray-600">Tempo médio</p>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Meta: 25min</span>
                <span>{reportData.averagePreparationTime > 25 ? 'Acima' : 'Dentro'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${reportData.averagePreparationTime > 25 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((reportData.averagePreparationTime / 35) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Performance de Entrega */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Truck className="w-5 h-5 text-green-500" />
            Performance de Entrega
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">No prazo</span>
              <span className="font-bold text-green-600">{reportData.deliveryPerformance?.onTime}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Atrasado</span>
              <span className="font-bold text-yellow-600">{reportData.deliveryPerformance?.delayed}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Muito atrasado</span>
              <span className="font-bold text-red-600">{reportData.deliveryPerformance?.veryDelayed}%</span>
            </div>
          </div>
        </div>

        {/* Taxa de Cancelamento */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-500" />
            Taxa de Cancelamento
          </h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-red-600 mb-2">
              {reportData.cancellationRate}%
            </div>
            <p className="text-sm text-gray-600">Dos pedidos totais</p>
            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Meta: &lt;5%</span>
                <span>{reportData.cancellationRate < 5 ? 'Dentro' : 'Acima'}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${reportData.cancellationRate > 5 ? 'bg-red-500' : 'bg-green-500'}`}
                  style={{ width: `${Math.min((reportData.cancellationRate / 10) * 100, 100)}%` }}
                ></div>
              </div>
          </div>
          </div>
        </div>
      </div>

      {/* Pedidos Recentes */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Pedidos Recentes</h3>
          <button className="flex items-center gap-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
            <Eye className="w-4 h-4" />
            Ver todos
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Pedido</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Cliente</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Valor</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Horário</th>
              </tr>
            </thead>
            <tbody>
              {reportData.recentOrders?.map((order) => (
                <tr key={order.id} className="border-b border-gray-100">
                  <td className="py-3 px-4">
                    <span className="font-medium text-gray-900">#{order.id}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-700">{order.customer}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      {order.status === 'preparando' && 'Preparando'}
                      {order.status === 'pronto' && 'Pronto'}
                      {order.status === 'saiu_entrega' && 'Em Entrega'}
                      {order.status === 'finalizado' && 'Finalizado'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{order.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Reports;

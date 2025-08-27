import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';

const Reports = () => {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalCustomers: 0,
    averageOrderValue: 0,
    ordersByStatus: [],
    revenueByMonth: [],
    topProducts: []
  });

  useEffect(() => {
    fetchReportData();
  }, []);

  const fetchReportData = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Buscar dados de relatórios
      const response = await fetch('http://localhost:3000/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setReportData(data.data || {});
      } else {
        console.log('Relatórios não implementados ainda, usando dados mock');
        // Dados mock para demonstração
        setReportData({
          totalOrders: 25,
          totalRevenue: 1250.50,
          totalCustomers: 18,
          averageOrderValue: 50.02,
          ordersByStatus: [
            { status: 'Novo', count: 5 },
            { status: 'Preparando', count: 3 },
            { status: 'Pronto', count: 2 },
            { status: 'Entregando', count: 1 },
            { status: 'Entregue', count: 14 }
          ],
          revenueByMonth: [
            { month: 'Janeiro', revenue: 450.00 },
            { month: 'Fevereiro', revenue: 380.00 },
            { month: 'Março', revenue: 420.50 }
          ],
          topProducts: [
            { name: 'Produto A', sales: 45 },
            { name: 'Produto B', sales: 32 },
            { name: 'Produto C', sales: 28 }
          ]
        });
      }
    } catch (error) {
      console.error('Erro ao buscar relatórios:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = (type) => {
    // Função para exportar relatórios (implementar depois)
    console.log(`Exportando relatório: ${type}`);
    alert(`Funcionalidade de exportação ${type} será implementada em breve!`);
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
      {/* Header da Página */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Relatórios</h1>
            <p className="text-gray-600">Análise completa do desempenho do negócio</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => exportReport('vendas')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Vendas
            </button>
            <button
              onClick={() => exportReport('clientes')}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar Clientes
            </button>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600 font-medium">Total de Pedidos</p>
                <p className="text-2xl font-bold text-blue-900">{reportData.totalOrders}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-green-600 font-medium">Receita Total</p>
                <p className="text-2xl font-bold text-green-900">
                  R$ {reportData.totalRevenue?.toFixed(2).replace('.', ',') || '0,00'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600 font-medium">Total de Clientes</p>
                <p className="text-2xl font-bold text-purple-900">{reportData.totalCustomers}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-sm text-orange-600 font-medium">Ticket Médio</p>
                <p className="text-2xl font-bold text-orange-900">
                  R$ {reportData.averageOrderValue?.toFixed(2).replace('.', ',') || '0,00'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos e Análises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos por Status */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Pedidos por Status</h3>
          <div className="space-y-3">
            {reportData.ordersByStatus?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.status}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / reportData.totalOrders) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-8 text-right">
                    {item.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Receita por Mês */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Receita por Mês</h3>
          <div className="space-y-3">
            {reportData.revenueByMonth?.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{item.month}</span>
                <div className="flex items-center gap-2">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${(item.revenue / Math.max(...reportData.revenueByMonth.map(r => r.revenue))) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 w-20 text-right">
                    R$ {item.revenue.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Produtos Mais Vendidos */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Produtos Mais Vendidos</h3>
        <div className="space-y-3">
          {reportData.topProducts?.map((product, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-500 w-6">#{index + 1}</span>
                <span className="text-sm font-medium text-gray-900">{product.name}</span>
              </div>
              <span className="text-sm font-medium text-primary-600">
                {product.sales} vendas
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mensagem de Desenvolvimento */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-yellow-600" />
          <div>
            <h4 className="font-medium text-yellow-800">Relatórios em Desenvolvimento</h4>
            <p className="text-sm text-yellow-700">
              Esta página está sendo desenvolvida. Em breve teremos gráficos interativos, 
              filtros avançados e exportação de dados em múltiplos formatos.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

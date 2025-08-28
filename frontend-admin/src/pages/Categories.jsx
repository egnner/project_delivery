import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Tag,
  Package,
  Utensils,
  Coffee,
  Cookie,
  Wine,
  Pizza,
  Sandwich,
  IceCream,
  Soup,
  Cake,
  ChevronDown,
  Check,
  Clock,
  Filter,
  MoreVertical,
  Eye,
  EyeOff,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../config/api';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showIconDropdown, setShowIconDropdown] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true,
    icon: 'Utensils',
    prep_time_min: 25,
    prep_time_max: 35,
    show_prep_time: true
  });

  const availableIcons = {
    'Utensils': { component: Utensils, name: 'Utensílios' },
    'Pizza': { component: Pizza, name: 'Pizza' },
    'Coffee': { component: Coffee, name: 'Café/Bebidas' },
    'Cookie': { component: Cookie, name: 'Biscoito/Doces' },
    'Wine': { component: Wine, name: 'Vinho/Bebidas' },
    'Sandwich': { component: Sandwich, name: 'Sanduíche' },
    'IceCream': { component: IceCream, name: 'Sorvete' },
    'Soup': { component: Soup, name: 'Sopa' },
    'Cake': { component: Cake, name: 'Bolo' },
    'Package': { component: Package, name: 'Acompanhamentos' },
    'Tag': { component: Tag, name: 'Genérico' }
  };

  const renderIcon = (iconName, className = "w-5 h-5") => {
    const IconComponent = availableIcons[iconName]?.component || Utensils;
    return <IconComponent className={className} />;
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/admin/categories');
      
      if (response && response.ok) {
        const data = await response.json();
        setCategories(data.data || []);
      } else if (response && response.error) {
        toast.error(response.message || 'Erro ao carregar categorias');
      }
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      toast.error('Erro ao carregar categorias');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Por favor, preencha o nome da categoria');
      return;
    }

    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      
      const method = editingCategory ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingCategory ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!');
        setShowModal(false);
        setEditingCategory(null);
        resetForm();
        fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao salvar categoria');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao salvar categoria');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      active: category.active,
      icon: category.icon || 'Utensils',
      prep_time_min: category.prep_time_min || 25,
      prep_time_max: category.prep_time_max || 35,
      show_prep_time: category.show_prep_time !== undefined ? category.show_prep_time : true
    });
    setShowModal(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria? Produtos associados podem ser afetados.')) return;

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      if (response.ok) {
        toast.success('Categoria excluída com sucesso!');
        fetchData();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Erro ao excluir categoria');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao excluir categoria');
    }
  };

  const toggleCategoryStatus = async (categoryId, currentStatus) => {
    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ active: !currentStatus }),
      });

      if (response.ok) {
        toast.success(`Categoria ${!currentStatus ? 'ativada' : 'desativada'} com sucesso!`);
        fetchData();
      } else {
        toast.error('Erro ao alterar status da categoria');
      }
    } catch (error) {
      console.error('Erro:', error);
      toast.error('Erro ao alterar status da categoria');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      active: true,
      icon: 'Utensils',
      prep_time_min: 25,
      prep_time_max: 35,
      show_prep_time: true
    });
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setShowIconDropdown(false);
    resetForm();
  };

  const filteredCategories = categories.filter(category => {
    const matchesSearch = !searchTerm || 
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'active' && category.active) ||
      (filterStatus === 'inactive' && !category.active);
    
    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: categories.length,
    active: categories.filter(c => c.active).length,
    inactive: categories.filter(c => !c.active).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando categorias...</p>
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
                Categorias
              </h1>
              <p className="text-gray-600">
                Organize seus produtos em categorias para melhor navegação
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2 w-fit"
            >
              <Plus className="w-5 h-5" />
              Nova Categoria
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Tag className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-sm text-gray-600">Total de Categorias</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">Categorias Ativas</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <EyeOff className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                <p className="text-sm text-gray-600">Categorias Inativas</p>
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
                  placeholder="Buscar categorias..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setFilterStatus('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todas
              </button>
              <button
                onClick={() => setFilterStatus('active')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'active'
                    ? 'bg-green-100 text-green-700 border border-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Ativas
              </button>
              <button
                onClick={() => setFilterStatus('inactive')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filterStatus === 'inactive'
                    ? 'bg-red-100 text-red-700 border border-red-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Inativas
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Categorias */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {filteredCategories.map((category) => (
            <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    category.active ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {renderIcon(category.icon, `w-6 h-6 ${category.active ? 'text-blue-600' : 'text-gray-400'}`)}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {category.name}
                    </h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      category.active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {category.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => toggleCategoryStatus(category.id, category.active)}
                    className={`p-2 rounded-lg transition-colors ${
                      category.active 
                        ? 'text-green-600 hover:bg-green-100' 
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    title={category.active ? 'Desativar categoria' : 'Ativar categoria'}
                  >
                    {category.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Editar categoria"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Excluir categoria"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              {category.description && (
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {category.description}
                </p>
              )}
              
              {category.show_prep_time && category.prep_time_min && category.prep_time_max && (
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4 bg-gray-50 px-3 py-2 rounded-lg">
                  <Clock className="w-4 h-4" />
                  <span>Preparo: {category.prep_time_min}-{category.prep_time_max} min</span>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-200">
                <span>ID: {category.id}</span>
                <div className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  <span>{category.product_count || 0} produtos</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {filteredCategories.length === 0 && (
          <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm || filterStatus !== 'all' ? 'Nenhuma categoria encontrada' : 'Nenhuma categoria criada'}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || filterStatus !== 'all' 
                ? 'Tente ajustar os filtros para encontrar o que procura'
                : 'Comece criando sua primeira categoria para organizar seus produtos'
              }
            </p>
            {!searchTerm && filterStatus === 'all' && (
              <button
                onClick={openCreateModal}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Criar Primeira Categoria
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome da Categoria *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Ex: Pizzas, Bebidas, Sobremesas..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows="3"
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                    placeholder="Descreva brevemente esta categoria..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone da Categoria
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowIconDropdown(!showIconDropdown)}
                      className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white flex items-center justify-between outline-none transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {renderIcon(formData.icon, "w-5 h-5")}
                        <span>{availableIcons[formData.icon]?.name || 'Selecionar ícone'}</span>
                      </div>
                      <ChevronDown className={`w-4 h-4 transition-transform ${showIconDropdown ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showIconDropdown && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {Object.entries(availableIcons).map(([iconKey, iconData]) => (
                          <button
                            key={iconKey}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, icon: iconKey});
                              setShowIconDropdown(false);
                            }}
                            className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-left transition-colors"
                          >
                            {renderIcon(iconKey, "w-5 h-5")}
                            <span className="flex-1">{iconData.name}</span>
                            {formData.icon === iconKey && (
                              <Check className="w-4 h-4 text-blue-600" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h4 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600" />
                    Configurações de Tempo de Preparo
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        id="show_prep_time"
                        name="show_prep_time"
                        checked={formData.show_prep_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, show_prep_time: e.target.checked }))}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div>
                        <label htmlFor="show_prep_time" className="text-sm font-medium text-gray-900">
                          Exibir tempo de preparo
                        </label>
                        <p className="text-xs text-gray-600 mt-1">
                          Mostra o tempo estimado de preparo no cardápio
                        </p>
                      </div>
                    </div>
                    
                    {formData.show_prep_time && (
                      <div className="grid grid-cols-2 gap-4 ml-7">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tempo Mínimo
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="prep_time_min"
                              value={formData.prep_time_min}
                              onChange={handleInputChange}
                              min="1"
                              max="120"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">min</span>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tempo Máximo
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              name="prep_time_max"
                              value={formData.prep_time_max}
                              onChange={handleInputChange}
                              min="1"
                              max="120"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                            />
                            <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-500">min</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div>
                    <label htmlFor="active" className="text-sm font-medium text-gray-900">
                      Categoria ativa
                    </label>
                    <p className="text-xs text-gray-600 mt-1">
                      Apenas categorias ativas aparecem no cardápio
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    {editingCategory ? 'Salvar Alterações' : 'Criar Categoria'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-semibold transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
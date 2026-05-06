'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import { useCurrentUser } from '@/hooks/useAuth';
import { useCategories, useSubcategories, useTopics, useLetters } from '@/hooks/useContent';
import { useCreateCategory, useUpdateCategory, useDeleteCategory, useCreateSubcategory, useCreateTopic, useCreateLetter } from '@/hooks/useContent';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('categories');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [formType, setFormType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use our custom hooks
  const { data: userData, isLoading: userLoading, error: userError } = useCurrentUser();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useSubcategories();
  const { data: topicsData, isLoading: topicsLoading } = useTopics();
  const { data: lettersData, isLoading: lettersLoading } = useLetters();

  const user = userData;
  const categories = categoriesData || [];
  const subcategories = subcategoriesData || [];
  const topics = topicsData || [];
  const letters = lettersData || [];

  // Mutation hooks
  const createCategoryMutation = useCreateCategory();
  const updateCategoryMutation = useUpdateCategory();
  const deleteCategoryMutation = useDeleteCategory();
  const createSubcategoryMutation = useCreateSubcategory();
  const createTopicMutation = useCreateTopic();
  const createLetterMutation = useCreateLetter();

  const checkAdminAndFetch = useCallback(async () => {
    if (userError) {
      router.push('/login');
      return;
    }
    // Only redirect if user is loaded (not undefined) and role is not admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
      return;
    }
  }, [userError, router, user]);

  useEffect(() => {
    checkAdminAndFetch();
  }, [checkAdminAndFetch]);

  if (!isClient || userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="space-y-6">
          <div className="animate-spin rounded-full h-32 w-32 border-4 border-indigo-200 border-t-sky-500 mx-auto"></div>
          <p className="text-gray-900 text-center text-lg font-medium">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }



  const openForm = (type, item = null) => {
    setFormType(type);
    if (item) {
      setEditingItem(item);
      setFormData({
        id: item._id,
        name: item.name || '',
        description: item.description || '',
        category: item.category?._id || item.category || '',
        subcategory: item.subcategory?._id || item.subcategory || '',
        topic: item.topic?._id || item.topic || '',
        title: item.title || '',
        content: item.content || '',
      });
    } else {
      setEditingItem(null);
      setFormData({});
    }
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setFormData({});
    setFormType('');
    setEditingItem(null);
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) {
      return;
    }
    
    if (type === 'category') {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isClient) return;
    
    if (formType === 'category') {
      if (editingItem) {
        updateCategoryMutation.mutate({
          id: editingItem._id,
          data: {
            name: formData.name,
            description: formData.description
          }
        });
      } else {
        createCategoryMutation.mutate({
          name: formData.name,
          description: formData.description
        });
      }
    } else if (formType === 'subcategory') {
      createSubcategoryMutation.mutate({
        name: formData.name,
        description: formData.description,
        category: formData.category
      });
    } else if (formType === 'topic') {
      createTopicMutation.mutate({
        name: formData.name,
        description: formData.description,
        subcategory: formData.subcategory
      });
    } else if (formType === 'letter') {
      createLetterMutation.mutate({
        title: formData.title,
        content: formData.content,
        topic: formData.topic
      });
    }
    closeForm();
  };

  const renderForm = () => {
    if (!showForm) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-sky-500 to-cyan-500 bg-clip-text text-transparent capitalize">
              {editingItem ? `Edit ${formType}` : `Create New ${formType}`}
            </h3>
            <button
              onClick={closeForm}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {formType === 'category' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📚 Category Name *</label>
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">📝 Description</label>
                  <textarea
                    placeholder="Enter description (optional)"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 outline-none transition-all"
                    rows="3"
                  />
                </div>
              </>
            )}

            {formType === 'subcategory' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Select Category *</label>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 outline-none transition-all"
                    required
                  >
                    <option value="">Choose a category...</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Subcategory Name *</label>
                  <input
                    type="text"
                    placeholder="Enter subcategory name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea
                    placeholder="Enter description (optional)"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-200/50 outline-none transition-all"
                    rows="3"
                  />
                </div>
              </>
            )}

            {formType === 'topic' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Select Subcategory *</label>
                  <select
                    value={formData.subcategory || ''}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 outline-none transition-all"
                    required
                  >
                    <option value="">Choose a subcategory...</option>
                    {subcategories.map(sub => (
                      <option key={sub._id} value={sub._id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Topic Name *</label>
                  <input
                    type="text"
                    placeholder="Enter topic name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
                  <textarea
                    placeholder="Enter description (optional)"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-200/50 outline-none transition-all"
                    rows="3"
                  />
                </div>
              </>
            )}

            {formType === 'letter' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Select Topic *</label>
                  <select
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition-all"
                    required
                  >
                    <option value="">Choose a topic...</option>
                    {topics.map(topic => (
                      <option key={topic._id} value={topic._id}>{topic.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Letter Title *</label>
                  <input
                    type="text"
                    placeholder="Enter letter title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Letter Content *</label>
                  <textarea
                    placeholder="Enter letter content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full p-3 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-200/50 outline-none transition-all"
                    rows="6"
                    required
                  />
                </div>
              </>
            )}

            <div className="flex gap-3 pt-6">
              <button
                type="submit"
                className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              >
                {editingItem ? 'Update' : 'Create'}
              </button>
              <button
                type="button"
                onClick={closeForm}
                className="flex-1 bg-white text-gray-900 py-3 px-4 rounded-xl hover:bg-gray-100 transition-all font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filteredCategories = categories.filter(cat => 
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredSubcategories = subcategories.filter(sub => 
    sub.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTopics = topics.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLetters = letters.filter(letter => 
    letter.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {renderForm()}
      <DashboardShell title="Admin Control Center" subtitle="Manage categories, subcategories, topics and letters">
        <div className="space-y-8">
          {/* Header with Welcome & Logout */}
          <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-gray-900">
            <div className="relative z-10 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold mb-2">Welcome back, <span className="text-gray-900">{user?.name}!</span> 👑</h1>
                <p className="text-gray-600 text-lg">You have full control over content management</p>
              </div>
            
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Categories', value: categories.length, color: 'red', icon: '📚' },
              { label: 'Subcategories', value: subcategories.length, color: 'green', icon: '📂' },
              { label: 'Topics', value: topics.length, color: 'purple', icon: '📋' },
              { label: 'Letters', value: letters.length, color: 'amber', icon: '📄' }
            ].map((stat, idx) => (
              <div key={idx} className={`bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg`}>
                <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600 font-semibold flex items-center gap-2">
                  <span>{stat.icon}</span>
                  <span>{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-modern block w-full pl-12 pr-5 py-4 text-lg text-gray-900 placeholder-gray-400"
            />
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-2xl p-2 border border-gray-200 shadow-lg">
            <nav className="flex space-x-1">
              {[
                { id: 'categories', label: 'Categories', count: categories.length, color: 'error' },
                { id: 'subcategories', label: 'Subcategories', count: subcategories.length, color: 'success' },
                { id: 'topics', label: 'Topics', count: topics.length, color: 'accent' },
                { id: 'letters', label: 'Letters', count: letters.length, color: 'warning' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group relative flex-1 rounded-xl px-4 py-3 font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? `bg-gray-100 text-gray-900 shadow-lg`
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <span>{tab.label}</span>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                      activeTab === tab.id ? 'bg-gray-200 text-gray-900' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tab.count}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="space-y-6">
            {/* Categories */}
            {activeTab === 'categories' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📚</span> Categories ({filteredCategories.length})
                  </h2>
                  <button
                    onClick={() => openForm('category')}
                    className="bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold flex items-center gap-2"
                  >
                    <span>➕</span> Add Category
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCategories.map(cat => (
                    <div key={cat._id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-red-400 hover:shadow-xl hover:shadow-red-500/20 transition-all duration-300 shadow-lg group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                          📚
                        </div>
                        <button
                          onClick={() => handleDelete('category', cat._id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          🗑️
                        </button>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{cat.name}</h3>
                      {cat.description && <p className="text-gray-600 text-sm mb-4">{cat.description}</p>}
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openForm('category', cat)}
                          className="text-sm text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Subcategories */}
            {activeTab === 'subcategories' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📂</span> Subcategories ({filteredSubcategories.length})
                  </h2>
                  <button
                    onClick={() => openForm('subcategory')}
                    className="bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold flex items-center gap-2"
                  >
                    <span>➕</span> Add Subcategory
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredSubcategories.map(sub => (
                    <div key={sub._id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-green-400 hover:shadow-xl hover:shadow-green-500/20 transition-all duration-300 shadow-lg group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                          📂
                        </div>
                        <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">{sub.category?.name}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{sub.name}</h3>
                      {sub.description && <p className="text-gray-600 text-sm mb-4">{sub.description}</p>}
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openForm('subcategory', sub)}
                          className="text-sm text-green-600 hover:text-green-700 font-semibold flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topics */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📋</span> Topics ({filteredTopics.length})
                  </h2>
                  <button
                    onClick={() => openForm('topic')}
                    className="bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold flex items-center gap-2"
                  >
                    <span>➕</span> Add Topic
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredTopics.map(topic => (
                    <div key={topic._id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-cyan-400 hover:shadow-xl hover:shadow-sky-500/20 transition-all duration-300 shadow-lg group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-sky-500 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                          📋
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-2">{topic.name}</h3>
                      {topic.description && <p className="text-gray-600 text-sm mb-4">{topic.description}</p>}
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openForm('topic', topic)}
                          className="text-sm text-cyan-500 hover:text-sky-700 font-semibold flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Letters */}
            {activeTab === 'letters' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <span>📄</span> Letters ({filteredLetters.length})
                  </h2>
                  <button
                    onClick={() => openForm('letter')}
                    className="bg-white text-gray-900 px-6 py-3 rounded-xl hover:bg-gray-100 transition-all font-semibold flex items-center gap-2"
                  >
                    <span>➕</span> Add Letter
                  </button>
                </div>
                <div className="grid gap-6 md:grid-cols-2">
                  {filteredLetters.map(letter => (
                    <div key={letter._id} className="bg-white rounded-2xl p-6 border-2 border-gray-200 hover:border-amber-400 hover:shadow-xl hover:shadow-amber-500/20 transition-all duration-300 shadow-lg group">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-white text-2xl shadow-lg group-hover:scale-110 transition-transform">
                          📄
                        </div>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg mb-3">{letter.title}</h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-4">{letter.content}</p>
                      <div className="pt-4 border-t border-gray-100">
                        <button
                          onClick={() => openForm('letter', letter)}
                          className="text-sm text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1"
                        >
                          ✏️ Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </DashboardShell>
    </>
  );
}

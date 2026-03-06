import React, { useEffect, useState } from 'react';
import { menuApi } from '../services/api';
import type { Category, MenuItem, CreateCategoryRequest, CreateMenuItemRequest, UpdateMenuItemRequest, UpdateCategoryRequest } from '../types';
import { useToast } from '../hooks/useToast';
import Modal from '../components/Modal';
import CustomSelect from '../components/CustomSelect';
import { Plus, UtensilsCrossed, Tag, Search, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';

const MenuItems: React.FC = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editForm, setEditForm] = useState<UpdateMenuItemRequest>({});
  // Category CRUD state
  const [showEditCatModal, setShowEditCatModal] = useState(false);
  const [showDeleteCatModal, setShowDeleteCatModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [editCatForm, setEditCatForm] = useState<UpdateCategoryRequest>({});
  const [catStatusFilter, setCatStatusFilter] = useState('');

  const [categoryForm, setCategoryForm] = useState<CreateCategoryRequest>({
    categoryName: '', categoryNameHindi: '', description: '', displayOrder: 0, iconUrl: '',
  });
  const [itemForm, setItemForm] = useState<CreateMenuItemRequest>({
    itemName: '', itemNameHindi: '', description: '', categoryId: '', cuisineType: '',
    foodType: 'VEG', spiceLevel: '', dietaryTags: [], allergens: [], isPopular: false,
  });
  const [createDietaryTagsInput, setCreateDietaryTagsInput] = useState('');
  const [createAllergensInput, setCreateAllergensInput] = useState('');
  const [editDietaryTagsInput, setEditDietaryTagsInput] = useState('');
  const [editAllergensInput, setEditAllergensInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cats, items] = await Promise.all([
        menuApi.getAllCategories(),
        menuApi.getAllMenuItems(),
      ]);
      setCategories(cats);
      setMenuItems(items);
    } catch (error) {
      showToast('Failed to load menu data', 'error');
    }
    finally { setLoading(false); }
  };

  // Filter categories by status for display purposes (when filter is selected)
  const filteredCategories = catStatusFilter
    ? categories.filter(cat => cat.status === catStatusFilter)
    : categories;

  const openCreateCategoryModal = () => {
    const maxOrder = categories.length > 0 ? Math.max(...categories.map(c => c.displayOrder)) : 0;
    setCategoryForm({ categoryName: '', categoryNameHindi: '', description: '', displayOrder: maxOrder + 1, iconUrl: '' });
    setShowCategoryModal(true);
  };

  const handleCreateCategory = async () => {
    setSubmitting(true);
    try {
      await menuApi.createCategory(categoryForm);
      setShowCategoryModal(false);
      setCategoryForm({ categoryName: '', categoryNameHindi: '', description: '', displayOrder: 0, iconUrl: '' });
      loadData();
      showToast('Category created successfully!', 'success');
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Failed to create category', 'error');
    }
    finally { setSubmitting(false); }
  };

  const openEditCatModal = (cat: Category) => {
    setSelectedCategory(cat);
    setEditCatForm({
      categoryName: cat.categoryName,
      categoryNameHindi: cat.categoryNameHindi || '',
      description: cat.description || '',
      displayOrder: cat.displayOrder,
      iconUrl: cat.iconUrl || '',
    });
    setShowEditCatModal(true);
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await menuApi.updateCategory(selectedCategory.categoryId, editCatForm);
      setShowEditCatModal(false);
      loadData();
      showToast('Category updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update category', 'error');
    } finally { setSubmitting(false); }
  };

  const handleToggleCatStatus = async (cat: Category) => {
    try {
      if (cat.status === 'ACTIVE') {
        await menuApi.inactivateCategory(cat.categoryId);
        showToast('Category inactivated successfully!', 'success');
      } else {
        await menuApi.activateCategory(cat.categoryId);
        showToast('Category activated successfully!', 'success');
      }
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update category status', 'error');
    }
  };

  const openDeleteCatModal = (cat: Category) => {
    setSelectedCategory(cat);
    setShowDeleteCatModal(true);
  };

  const handleDeleteCategory = async () => {
    if (!selectedCategory) return;
    setSubmitting(true);
    try {
      await menuApi.deleteCategory(selectedCategory.categoryId);
      setShowDeleteCatModal(false);
      setSelectedCategory(null);
      loadData();
      showToast('Category deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete category (may have items attached)', 'error');
    } finally { setSubmitting(false); }
  };

  const handleCreateItem = async () => {
    setSubmitting(true);
    try {
      const payload = {
        ...itemForm,
        dietaryTags: createDietaryTagsInput.split(',').map(s => s.trim()).filter(Boolean),
        allergens: createAllergensInput.split(',').map(s => s.trim()).filter(Boolean),
      };
      await menuApi.createMenuItem(payload);
      setShowItemModal(false);
      setItemForm({ itemName: '', itemNameHindi: '', description: '', categoryId: '', cuisineType: '', foodType: 'VEG', spiceLevel: '', dietaryTags: [], allergens: [], isPopular: false });
      setCreateDietaryTagsInput('');
      setCreateAllergensInput('');
      loadData();
      showToast('Menu item created successfully!', 'success');
    } catch (error: any) { 
      showToast(error.response?.data?.message || 'Failed to create menu item', 'error');
    }
    finally { setSubmitting(false); }
  };

  const openEditModal = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setEditForm({
      itemName: item.itemName,
      itemNameHindi: item.itemNameHindi || '',
      description: item.description,
      categoryId: item.categoryId,
      cuisineType: item.cuisineType,
      foodType: item.foodType,
      spiceLevel: item.spiceLevel,
      dietaryTags: item.dietaryTags || [],
      allergens: item.allergens || [],
      isPopular: item.isPopular,
      nutritionalInfo: item.nutritionalInfo || undefined,
    });
    setEditDietaryTagsInput((item.dietaryTags || []).join(', '));
    setEditAllergensInput((item.allergens || []).join(', '));
    setShowEditModal(true);
  };

  const handleUpdateItem = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      const payload = {
        ...editForm,
        dietaryTags: editDietaryTagsInput.split(',').map(s => s.trim()).filter(Boolean),
        allergens: editAllergensInput.split(',').map(s => s.trim()).filter(Boolean),
      };
      await menuApi.updateMenuItem(selectedItem.masterItemId, payload);
      setShowEditModal(false);
      loadData();
      showToast('Menu item updated successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update menu item', 'error');
    } finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (item.status === 'ACTIVE') {
        await menuApi.inactivateMenuItem(item.masterItemId);
        showToast('Menu item inactivated successfully!', 'success');
      } else {
        await menuApi.activateMenuItem(item.masterItemId);
        showToast('Menu item activated successfully!', 'success');
      }
      loadData();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to update status', 'error');
    }
  };

  const openDeleteModal = (item: MenuItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItem(item);
    setShowDeleteModal(true);
  };

  const handleDeleteItem = async () => {
    if (!selectedItem) return;
    setSubmitting(true);
    try {
      await menuApi.deleteMenuItem(selectedItem.masterItemId);
      setShowDeleteModal(false);
      setSelectedItem(null);
      loadData();
      showToast('Menu item deleted successfully!', 'success');
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete menu item', 'error');
    } finally { setSubmitting(false); }
  };

  const filteredItems = menuItems.filter(item =>
    !searchQuery || item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) || item.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" /></div>;
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-orange-500 rounded-2xl shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold flex items-center gap-3"><UtensilsCrossed className="w-8 h-8" />Menu Management</h1>
        <p className="text-orange-100 mt-1">{categories.length} categories • {menuItems.length} items</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setActiveTab('categories')} className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'categories' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}>
          <Tag className="w-4 h-4 inline mr-2" />Categories ({categories.length})
        </button>
        <button onClick={() => setActiveTab('items')} className={`px-6 py-3 rounded-xl font-semibold transition-all ${activeTab === 'items' ? 'bg-orange-500 text-white' : 'bg-white text-gray-700 hover:bg-gray-50 border'}`}>
          <UtensilsCrossed className="w-4 h-4 inline mr-2" />Menu Items ({menuItems.length})
        </button>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="w-56">
              <CustomSelect
                value={catStatusFilter}
                onChange={(val) => setCatStatusFilter(val)}
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' },
                ]}
                placeholder="Filter by status"
              />
            </div>
            <button onClick={openCreateCategoryModal} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600 hover:scale-105 transition-all duration-200">
              <Plus className="w-5 h-5" />Add Category
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map(cat => (
              <div key={cat.categoryId} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all relative">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 pr-2">{cat.categoryName}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${cat.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{cat.status}</span>
                </div>
                {cat.categoryNameHindi && <p className="text-sm text-gray-500 mb-1">{cat.categoryNameHindi}</p>}
                <p className="text-gray-600 text-sm">{cat.description || 'No description'}</p>
                <div className="mt-2 mb-4 text-xs text-gray-400">Display order: {cat.displayOrder}</div>
                {/* Category Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
                  <button onClick={() => openEditCatModal(cat)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:shadow-md hover:scale-105 transition-all duration-200">
                    <Edit2 className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => handleToggleCatStatus(cat)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md hover:scale-105 transition-all duration-200 ${
                      cat.status === 'ACTIVE'
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        : 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                    }`}>
                    {cat.status === 'ACTIVE' ? <><XCircle className="w-3 h-3" />Inactivate</> : <><CheckCircle className="w-3 h-3" />Activate</>}
                  </button>
                  <button onClick={() => openDeleteCatModal(cat)}
                    className="p-1.5 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Menu Items Tab */}
      {activeTab === 'items' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input type="text" placeholder="Search items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500" />
            </div>
            <button onClick={() => setShowItemModal(true)} className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2 rounded-xl hover:bg-orange-600">
              <Plus className="w-5 h-5" />Add Item
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => (
              <div key={item.masterItemId} onClick={() => { setSelectedItem(item); setShowDetailModal(true); }}
                className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-all cursor-pointer relative">
                {/* Status badge */}
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${item.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>{item.status}</span>
                </div>
                <div className="flex items-start justify-between mb-2 pr-20">
                  <h3 className="text-lg font-bold text-gray-900">{item.itemName}</h3>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                    item.foodType === 'VEG' ? 'bg-green-100 text-green-800' :
                    item.foodType === 'NON_VEG' ? 'bg-red-100 text-red-800' :
                    item.foodType === 'VEGAN' ? 'bg-emerald-100 text-emerald-800' :
                    item.foodType === 'EGG' ? 'bg-amber-100 text-amber-800' :
                    item.foodType === 'BEVERAGES' ? 'bg-orange-100 text-orange-800' :
                    item.foodType === 'DESSERTS' ? 'bg-pink-100 text-pink-800' :
                    item.foodType === 'SNACKS' ? 'bg-orange-100 text-orange-800' :
                    item.foodType === 'SWEETS' ? 'bg-orange-100 text-orange-800' :
                    item.foodType === 'OTHER' ? 'bg-gray-100 text-gray-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>{item.foodType}</span>
                </div>
                {item.itemNameHindi && <p className="text-sm text-gray-500 mb-1">{item.itemNameHindi}</p>}
                <p className="text-gray-600 text-sm line-clamp-2 mb-2">{item.description}</p>
                <div className="flex flex-wrap gap-1 mb-2">
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">{item.cuisineType}</span>
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded text-xs">{item.spiceLevel}</span>
                  {item.isPopular && <span className="px-2 py-0.5 bg-yellow-50 text-yellow-700 rounded text-xs">⭐ Popular</span>}
                </div>
                <div className="text-xs text-gray-400 mb-3">{item.categoryName || 'Uncategorized'}</div>
                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100" onClick={(e) => e.stopPropagation()}>
                  <button onClick={(e) => openEditModal(item, e)}
                    className="flex-1 flex items-center justify-center gap-1 py-1.5 bg-orange-500 text-white rounded-lg text-xs font-semibold hover:shadow-md hover:scale-105 transition-all duration-200">
                    <Edit2 className="w-3 h-3" />Edit
                  </button>
                  <button onClick={(e) => handleToggleStatus(item, e)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs font-semibold hover:shadow-md hover:scale-105 transition-all duration-200 ${
                      item.status === 'ACTIVE'
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white'
                        : 'bg-gradient-to-br from-green-400 to-green-600 text-white'
                    }`}>
                    {item.status === 'ACTIVE' ? <><XCircle className="w-3 h-3" />Inactivate</> : <><CheckCircle className="w-3 h-3" />Activate</>}
                  </button>
                  <button onClick={(e) => openDeleteModal(item, e)}
                    className="p-1.5 bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg hover:shadow-md hover:scale-105 transition-all duration-200">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Category Modal */}
      <Modal isOpen={showCategoryModal} onClose={() => setShowCategoryModal(false)} title="Create Category">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name <span className="text-red-500">*</span></label>
            <input type="text" value={categoryForm.categoryName} onChange={(e) => setCategoryForm({ ...categoryForm, categoryName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="e.g., Main Course" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hindi Name</label>
            <input type="text" value={categoryForm.categoryNameHindi} onChange={(e) => setCategoryForm({ ...categoryForm, categoryNameHindi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="e.g., मुख्य व्यंजन" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
              <input type="number" value={categoryForm.displayOrder} onChange={(e) => setCategoryForm({ ...categoryForm, displayOrder: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icon URL</label>
              <input type="text" value={categoryForm.iconUrl} onChange={(e) => setCategoryForm({ ...categoryForm, iconUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateCategory} disabled={submitting || !categoryForm.categoryName}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">{submitting ? 'Creating...' : 'Create Category'}</button>
            <button onClick={() => setShowCategoryModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal isOpen={showEditCatModal} onClose={() => setShowEditCatModal(false)} title={`Edit: ${selectedCategory?.categoryName || ''}`}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category Name</label>
            <input type="text" value={editCatForm.categoryName || ''} onChange={(e) => setEditCatForm({ ...editCatForm, categoryName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Hindi Name</label>
            <input type="text" value={editCatForm.categoryNameHindi || ''} onChange={(e) => setEditCatForm({ ...editCatForm, categoryNameHindi: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="e.g., मुख्य व्यंजन" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={editCatForm.description || ''} onChange={(e) => setEditCatForm({ ...editCatForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Display Order</label>
              <input type="number" value={editCatForm.displayOrder ?? 0} onChange={(e) => setEditCatForm({ ...editCatForm, displayOrder: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Icon URL</label>
              <input type="text" value={editCatForm.iconUrl || ''} onChange={(e) => setEditCatForm({ ...editCatForm, iconUrl: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleUpdateCategory} disabled={submitting}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-orange-600">{submitting ? 'Saving...' : 'Save Changes'}</button>
            <button onClick={() => setShowEditCatModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Category Modal */}
      <Modal isOpen={showDeleteCatModal} onClose={() => setShowDeleteCatModal(false)} title="Delete Category">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <Trash2 className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Are you sure you want to delete?</p>
              <p className="text-sm text-gray-600 mt-1"><strong>{selectedCategory?.categoryName}</strong> will be permanently removed.</p>
              <p className="text-xs text-red-500 mt-1">This will fail if the category has menu items attached.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDeleteCategory} disabled={submitting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-red-700">{submitting ? 'Deleting...' : 'Yes, Delete'}</button>
            <button onClick={() => setShowDeleteCatModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Create Menu Item Modal */}
      <Modal isOpen={showItemModal} onClose={() => setShowItemModal(false)} title="Create Menu Item" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name <span className="text-red-500">*</span></label>
              <input type="text" value={itemForm.itemName} onChange={(e) => setItemForm({ ...itemForm, itemName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="e.g., Paneer Butter Masala" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hindi Name</label>
              <input type="text" value={itemForm.itemNameHindi || ''} onChange={(e) => setItemForm({ ...itemForm, itemNameHindi: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description <span className="text-red-500">*</span></label>
            <textarea value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
              <CustomSelect
                value={itemForm.categoryId}
                onChange={(val) => setItemForm({ ...itemForm, categoryId: val })}
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map(c => ({ value: c.categoryId, label: c.categoryName })),
                ]}
                placeholder="Select category"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine Type <span className="text-red-500">*</span></label>
              <input type="text" value={itemForm.cuisineType} onChange={(e) => setItemForm({ ...itemForm, cuisineType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" placeholder="e.g., NORTH_INDIAN" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Food Type <span className="text-red-500">*</span></label>
              <CustomSelect
                value={itemForm.foodType}
                onChange={(val) => setItemForm({ ...itemForm, foodType: val })}
                options={[
                  { value: 'VEG', label: 'Veg' },
                  { value: 'NON_VEG', label: 'Non-Veg' },
                  { value: 'VEGAN', label: 'Vegan' },
                  { value: 'EGG', label: 'Egg' },
                  { value: 'BEVERAGES', label: 'Beverages' },
                  { value: 'DESSERTS', label: 'Desserts' },
                  { value: 'SNACKS', label: 'Snacks' },
                  { value: 'SWEETS', label: 'Sweets' },
                  { value: 'OTHER', label: 'Other' },
                ]}
                placeholder="Select type"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Spice Level</label>
              <CustomSelect
                value={itemForm.spiceLevel}
                onChange={(val) => setItemForm({ ...itemForm, spiceLevel: val })}
                options={[
                  { value: '', label: 'None' },
                  { value: 'MILD', label: 'Mild' },
                  { value: 'MEDIUM', label: 'Medium' },
                  { value: 'SPICY', label: 'Spicy' },
                  { value: 'EXTRA_SPICY', label: 'Extra Spicy' },
                  { value: 'HOT', label: 'Hot' },
                  { value: 'EXTRA_HOT', label: 'Extra Hot' },
                  { value: 'COLD', label: 'Cold' },
                ]}
                placeholder="Select level"
              />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={itemForm.isPopular} onChange={(e) => setItemForm({ ...itemForm, isPopular: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm font-semibold text-gray-700">Popular</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dietary Tags</label>
              <input type="text" placeholder="e.g., GLUTEN_FREE, DAIRY_FREE"
                value={createDietaryTagsInput}
                onChange={(e) => setCreateDietaryTagsInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Allergens</label>
              <input type="text" placeholder="e.g., NUTS, DAIRY, GLUTEN"
                value={createAllergensInput}
                onChange={(e) => setCreateAllergensInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Nutritional Info <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Calories', key: 'calories' },
                { label: 'Protein (g)', key: 'proteinGrams' },
                { label: 'Carbs (g)', key: 'carbsGrams' },
                { label: 'Fat (g)', key: 'fatGrams' },
                { label: 'Serving (g)', key: 'servingSizeGrams' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                  <input type="number" min="0"
                    value={(itemForm.nutritionalInfo as any)?.[key] || ''}
                    onChange={(e) => setItemForm({ ...itemForm, nutritionalInfo: { ...(itemForm.nutritionalInfo || {}), [key]: Number(e.target.value) } as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="0" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleCreateItem} disabled={submitting || !itemForm.itemName || !itemForm.description || !itemForm.categoryId || !itemForm.cuisineType}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50">{submitting ? 'Creating...' : 'Create Item'}</button>
            <button onClick={() => setShowItemModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Item Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Menu Item Details">
        {selectedItem && (
          <>
          <div className="space-y-4">
            {/* Header Banner */}
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl ring-2 ring-white/30 flex-shrink-0">
                  {selectedItem.foodType === 'VEG' ? '🥗' : selectedItem.foodType === 'NON_VEG' ? '🍖' : selectedItem.foodType === 'VEGAN' ? '🌱' : selectedItem.foodType === 'BEVERAGES' ? '🥤' : selectedItem.foodType === 'DESSERTS' ? '🍰' : selectedItem.foodType === 'SWEETS' ? '🍬' : selectedItem.foodType === 'SNACKS' ? '🍿' : '🍽️'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold leading-tight">{selectedItem.itemName}</h2>
                  {selectedItem.itemNameHindi && <p className="text-orange-100 text-sm">{selectedItem.itemNameHindi}</p>}
                  <p className="text-orange-200 text-sm mt-0.5">{selectedItem.categoryName} · {selectedItem.cuisineType}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedItem.status === 'ACTIVE' ? 'bg-green-400/30 ring-1 ring-green-300' : 'bg-gray-400/30 ring-1 ring-gray-300'
                  }`}>{selectedItem.status}</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                    selectedItem.foodType === 'VEG' ? 'bg-green-400/30 ring-1 ring-green-300'
                    : selectedItem.foodType === 'NON_VEG' ? 'bg-red-400/30 ring-1 ring-red-300'
                    : selectedItem.foodType === 'VEGAN' ? 'bg-emerald-400/30 ring-1 ring-emerald-300'
                    : 'bg-white/20 ring-1 ring-white/30'
                  }`}>{selectedItem.foodType}</span>
                  {selectedItem.isPopular && <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-400/30 ring-1 ring-yellow-300">⭐ Popular</span>}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Description</p>
              <p className="text-sm text-gray-700">{selectedItem.description}</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Spice Level', value: selectedItem.spiceLevel || '—' },
                { label: 'Category', value: selectedItem.categoryName || '—' },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {/* Dietary Tags */}
            {(selectedItem.dietaryTags?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Dietary Tags</p>
                <div className="flex flex-wrap gap-2">{selectedItem.dietaryTags.map(t => <span key={t} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">{t}</span>)}</div>
              </div>
            )}

            {/* Allergens */}
            {(selectedItem.allergens?.length ?? 0) > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Allergens</p>
                <div className="flex flex-wrap gap-2">{selectedItem.allergens.map(a => <span key={a} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">{a}</span>)}</div>
              </div>
            )}

            {/* Nutritional Info */}
            {selectedItem.nutritionalInfo && (
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Nutritional Info</p>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { val: selectedItem.nutritionalInfo.calories, unit: '', label: 'Calories' },
                    { val: selectedItem.nutritionalInfo.proteinGrams, unit: 'g', label: 'Protein' },
                    { val: selectedItem.nutritionalInfo.carbsGrams, unit: 'g', label: 'Carbs' },
                    { val: selectedItem.nutritionalInfo.fatGrams, unit: 'g', label: 'Fat' },
                    { val: selectedItem.nutritionalInfo.servingSizeGrams, unit: 'g', label: 'Serving' },
                  ].map(({ val, unit, label }) => (
                    <div key={label} className="bg-orange-50 rounded-xl p-3 text-center border border-orange-100">
                      <p className="text-lg font-bold text-orange-700">{val}{unit}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Detail modal action buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100 mt-4">
            <button onClick={(e) => { setShowDetailModal(false); openEditModal(selectedItem, e); }}
              className="flex-1 flex items-center justify-center gap-2 bg-orange-500 text-white py-2.5 rounded-xl hover:bg-orange-600 font-semibold">
              <Edit2 className="w-4 h-4" />Edit
            </button>
            <button onClick={(e) => { setShowDetailModal(false); handleToggleStatus(selectedItem, e); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl ${selectedItem.status === 'ACTIVE' ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-green-600 text-white hover:bg-green-700'}`}>
              {selectedItem.status === 'ACTIVE' ? <><XCircle className="w-4 h-4" />Inactivate</> : <><CheckCircle className="w-4 h-4" />Activate</>}
            </button>
            <button onClick={(e) => { setShowDetailModal(false); openDeleteModal(selectedItem, e); }}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-xl hover:bg-red-700">
              <Trash2 className="w-4 h-4" />Delete
            </button>
          </div>
          </>
        )}
      </Modal>

      {/* Edit Menu Item Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit: ${selectedItem?.itemName || ''}`} size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Item Name</label>
              <input type="text" value={editForm.itemName || ''} onChange={(e) => setEditForm({ ...editForm, itemName: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Hindi Name</label>
              <input type="text" value={editForm.itemNameHindi || ''} onChange={(e) => setEditForm({ ...editForm, itemNameHindi: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <textarea value={editForm.description || ''} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl" rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
              <CustomSelect
                value={editForm.categoryId || ''}
                onChange={(val) => setEditForm({ ...editForm, categoryId: val })}
                options={[
                  { value: '', label: 'Select category' },
                  ...categories.map(c => ({ value: c.categoryId, label: c.categoryName })),
                ]}
                placeholder="Select category"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine Type</label>
              <input type="text" value={editForm.cuisineType || ''} onChange={(e) => setEditForm({ ...editForm, cuisineType: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Food Type</label>
              <CustomSelect value={editForm.foodType || 'VEG'} onChange={(val) => setEditForm({ ...editForm, foodType: val })}
                options={[{ value: 'VEG', label: 'Veg' }, { value: 'NON_VEG', label: 'Non-Veg' }, { value: 'VEGAN', label: 'Vegan' }, { value: 'EGG', label: 'Egg' }, { value: 'BEVERAGES', label: 'Beverages' }, { value: 'DESSERTS', label: 'Desserts' }, { value: 'SNACKS', label: 'Snacks' }, { value: 'SWEETS', label: 'Sweets' }, { value: 'OTHER', label: 'Other' }]}
                placeholder="Select type" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Spice Level</label>
              <CustomSelect value={editForm.spiceLevel || ''} onChange={(val) => setEditForm({ ...editForm, spiceLevel: val })}
                options={[{ value: '', label: 'None' }, { value: 'MILD', label: 'Mild' }, { value: 'MEDIUM', label: 'Medium' }, { value: 'SPICY', label: 'Spicy' }, { value: 'EXTRA_SPICY', label: 'Extra Spicy' }, { value: 'HOT', label: 'Hot' }, { value: 'EXTRA_HOT', label: 'Extra Hot' }, { value: 'COLD', label: 'Cold' }]}
                placeholder="Select level" />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={editForm.isPopular || false} onChange={(e) => setEditForm({ ...editForm, isPopular: e.target.checked })}
                  className="w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500" />
                <span className="text-sm font-semibold text-gray-700">Popular</span>
              </label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Dietary Tags</label>
              <input type="text" placeholder="e.g., GLUTEN_FREE, DAIRY_FREE"
                value={editDietaryTagsInput}
                onChange={(e) => setEditDietaryTagsInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Allergens</label>
              <input type="text" placeholder="e.g., NUTS, DAIRY, GLUTEN"
                value={editAllergensInput}
                onChange={(e) => setEditAllergensInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm" />
              <p className="text-xs text-gray-400 mt-1">Comma-separated</p>
            </div>
          </div>
          <div className="border border-gray-200 rounded-xl p-4 space-y-3">
            <p className="text-sm font-semibold text-gray-700">Nutritional Info <span className="text-gray-400 font-normal">(optional)</span></p>
            <div className="grid grid-cols-5 gap-3">
              {[
                { label: 'Calories', key: 'calories' },
                { label: 'Protein (g)', key: 'proteinGrams' },
                { label: 'Carbs (g)', key: 'carbsGrams' },
                { label: 'Fat (g)', key: 'fatGrams' },
                { label: 'Serving (g)', key: 'servingSizeGrams' },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                  <input type="number" min="0"
                    value={(editForm.nutritionalInfo as any)?.[key] || ''}
                    onChange={(e) => setEditForm({ ...editForm, nutritionalInfo: { ...(editForm.nutritionalInfo || {}), [key]: Number(e.target.value) } as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm" placeholder="0" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleUpdateItem} disabled={submitting}
              className="flex-1 bg-orange-500 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-orange-600">{submitting ? 'Saving...' : 'Save Changes'}</button>
            <button onClick={() => setShowEditModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Menu Item">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl">
            <Trash2 className="w-8 h-8 text-red-500 flex-shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Are you sure you want to delete?</p>
              <p className="text-sm text-gray-600 mt-1"><strong>{selectedItem?.itemName}</strong> will be permanently removed.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleDeleteItem} disabled={submitting}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 hover:bg-red-700">{submitting ? 'Deleting...' : 'Yes, Delete'}</button>
            <button onClick={() => setShowDeleteModal(false)} className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-xl">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MenuItems;





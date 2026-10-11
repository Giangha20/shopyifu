'use client';

import React, { useEffect, useState } from 'react';
import {
  FolderPlus,
  Edit,
  Trash2,
  ChevronRight,
  Folder,
  Layers,
  CheckCircle,
  XCircle,
  X,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal form states
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [image, setImage] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setParentId('');
    setImage('');
    setIsActive(true);
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setName(cat.name);
    setDescription(cat.description || '');
    setParentId(cat.parentId || '');
    setImage(cat.image || '');
    setIsActive(cat.isActive);
    setIsFeatured(Boolean(cat.isFeatured));
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSubmitting(true);
      const payload = {
        name,
        description,
        parentId: parentId || null,
        image: image || null,
        isActive,
        isFeatured,
      };

      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra');
        return;
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này?')) return;
    try {
      const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Không thể xóa danh mục');
        return;
      }
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const rootCategories = categories.filter((c) => !c.parentId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Danh Mục
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Cấu trúc cây danh mục sản phẩm của hệ thống cửa hàng.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-luxury-black text-white hover:bg-luxury-black-light shadow-sm"
        >
          <FolderPlus className="mr-1.5 h-4 w-4" />
          Thêm danh mục mới
        </Button>
      </div>

      {/* Tree view table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-semibold uppercase text-slate-500">
          <span>Tên danh mục</span>
          <span>Thao tác</span>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-luxury-gold" />
            <p className="mt-2 text-xs text-slate-400">Đang tải danh mục...</p>
          </div>
        ) : rootCategories.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            Chưa có danh mục nào được tạo
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {rootCategories.map((root) => {
              const children = categories.filter((c) => c.parentId === root.id);

              return (
                <div key={root.id} className="p-4">
                  {/* Root Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-luxury-gold">
                        <Folder className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{root.name}</span>
                          <span className="text-2xs font-mono text-slate-400">/{root.slug}</span>
                          {root.isFeatured && (
                            <span className="rounded bg-amber-100 px-1.5 py-0.5 text-2xs font-semibold text-amber-800">
                              Nổi bật
                            </span>
                          )}
                        </div>
                        <p className="text-2xs text-slate-400">
                          {root._count?.products || 0} sản phẩm trực tiếp
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(root)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                        title="Chỉnh sửa"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(root.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
                        title="Xóa"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Children categories */}
                  {children.length > 0 && (
                    <div className="mt-3 ml-6 space-y-2 border-l-2 border-slate-100 pl-4">
                      {children.map((child) => (
                        <div
                          key={child.id}
                          className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                            <span className="text-xs font-medium text-slate-800">{child.name}</span>
                            <span className="text-2xs font-mono text-slate-400">/{child.slug}</span>
                            <span className="text-2xs text-slate-400">
                              ({child._count?.products || 0} SP)
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => openEditModal(child)}
                              className="rounded p-1 text-slate-400 hover:text-slate-900"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(child.id)}
                              className="rounded p-1 text-slate-400 hover:text-rose-600"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                {editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="rounded p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Tên danh mục *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Đầm Thiết Kế"
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Danh mục cha (Tùy chọn)</label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                >
                  <option value="">-- Là danh mục gốc (Cấp 1) --</option>
                  {rootCategories
                    .filter((c) => c.id !== editingCategory?.id)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Ảnh đại diện URL</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Mô tả tóm tắt</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-4 text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-luxury-gold"
                  />
                  <span>Hoạt động</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="h-4 w-4 rounded text-luxury-gold"
                  />
                  <span>Nổi bật trang chủ</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={submitting}
                  className="bg-luxury-black text-white hover:bg-luxury-black-light"
                >
                  {submitting && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                  Lưu danh mục
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

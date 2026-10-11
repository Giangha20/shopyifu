'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, Image as ImageIcon, ExternalLink, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';


export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<any | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [image, setImage] = useState('');
  const [link, setLink] = useState('');
  const [buttonText, setButtonText] = useState('Khám phá ngay');
  const [position, setPosition] = useState('hero');
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/banners');
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setTitle('');
    setSubtitle('');
    setImage('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1600');
    setLink('/san-pham');
    setButtonText('Khám phá ngay');
    setPosition('hero');
    setIsActive(true);
    setModalOpen(true);
  };

  const openEditModal = (b: any) => {
    setEditingBanner(b);
    setTitle(b.title);
    setSubtitle(b.subtitle || '');
    setImage(b.image);
    setLink(b.link || '');
    setButtonText(b.buttonText || 'Khám phá ngay');
    setPosition(b.position || 'hero');
    setIsActive(b.isActive);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        id: editingBanner?.id,
        title,
        subtitle,
        image,
        link,
        buttonText,
        position,
        isActive,
      };

      const res = await fetch('/api/admin/banners', {
        method: editingBanner ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');
      setModalOpen(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa banner này?')) return;
    try {
      const res = await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
      if (res.ok) fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Quản Lý Banner Quảng Cáo
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Hình ảnh slider chính trang chủ và các vị trí khuyến mãi nổi bật.
          </p>
        </div>

        <Button
          onClick={openCreateModal}
          className="bg-luxury-black text-white hover:bg-luxury-black-light shadow-sm"
        >
          <Plus className="mr-1.5 h-4 w-4" />
          Thêm Banner mới
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {loading ? (
          <div className="col-span-full py-16 text-center">
            <Loader2 className="mx-auto h-6 w-6 animate-spin text-luxury-gold" />
          </div>
        ) : banners.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-slate-400">
            Chưa có banner quảng cáo nào
          </div>
        ) : (
          banners.map((b) => (
            <div
              key={b.id}
              className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:shadow-md"
            >
              <div className="relative aspect-[21/9] w-full bg-slate-100">
                <img
                  src={b.image}
                  alt={b.title}
                  className="h-full w-full object-cover"
                  onError={(e: any) => {
                    e.target.src = '/placeholder.jpg';
                  }}
                />
                <span
                  className={`absolute top-3 left-3 rounded-md px-2 py-0.5 text-2xs font-bold uppercase ${
                    b.isActive ? 'bg-emerald-500 text-white' : 'bg-slate-500 text-white'
                  }`}
                >
                  {b.isActive ? 'Đang hiển thị' : 'Đã ẩn'}
                </span>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{b.title}</h3>
                    {b.subtitle && <p className="text-xs text-slate-500">{b.subtitle}</p>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(b)}
                      className="rounded p-1 text-slate-400 hover:text-slate-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="rounded p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-2xs text-slate-400 border-t border-slate-100 pt-2">
                  <span>Vị trí: <strong>{b.position}</strong></span>
                  {b.link && (
                    <Link href={b.link} target="_blank" className="hover:text-luxury-gold flex items-center gap-1">
                      {b.link} <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                {editingBanner ? 'Sửa Banner' : 'Tạo Banner mới'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="rounded p-1 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Tiêu đề Banner *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Mô tả phụ</label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">Đường dẫn ảnh (URL) *</label>
                <input
                  type="text"
                  required
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">Liên kết khi click</label>
                  <input
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">Nút bấm</label>
                  <input
                    type="text"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 rounded text-luxury-gold"
                  />
                  <span>Kích hoạt hiển thị</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
                  Hủy
                </Button>
                <Button type="submit" size="sm" disabled={saving} className="bg-luxury-black text-white">
                  {saving && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}
                  Lưu Banner
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

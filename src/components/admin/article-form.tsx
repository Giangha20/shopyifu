'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ArticleFormProps {
  initialData?: any;
  articleId?: string;
}

export function ArticleForm({ initialData, articleId }: ArticleFormProps) {
  const router = useRouter();
  const isEdit = Boolean(articleId);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState(initialData?.title || '');
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=800'
  );
  const [status, setStatus] = useState(initialData?.status || 'published');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        title,
        excerpt,
        content,
        featuredImage,
        status,
      };

      const url = isEdit ? `/api/admin/articles/${articleId}` : '/api/admin/articles';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save');

      router.push('/admin/bai-viet');
      router.refresh();
    } catch (err) {
      console.error(err);
      alert('Lỗi lưu bài viết');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl space-y-6 pb-16">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/bai-viet"
            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
              {isEdit ? 'Chỉnh Sửa Bài Viết' : 'Viết Bài Mới'}
            </h1>
            <p className="text-xs text-slate-500">Soạn thảo nội dung phong cách sống và thời trang cao cấp.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/admin/bai-viet">
            <Button type="button" variant="outline">Hủy</Button>
          </Link>
          <Button type="submit" disabled={loading} className="bg-luxury-black text-white hover:bg-luxury-black-light">
            {loading && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
            {isEdit ? 'Lưu bài viết' : 'Xuất bản bài viết'}
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Tiêu đề bài viết *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ví dụ: Xu Hướng Thời Trang Dạ Tiệc Thu Đông 2026"
            className="h-11 w-full rounded-lg border border-slate-300 px-3.5 text-sm font-semibold focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Ảnh đại diện (URL)</label>
            <input
              type="text"
              value={featuredImage}
              onChange={(e) => setFeaturedImage(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Trạng thái bài viết</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            >
              <option value="published">Xuất bản ngay (Published)</option>
              <option value="draft">Lưu bản nháp (Draft)</option>
              <option value="archived">Lưu trữ (Archived)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Tóm tắt ngắn (Excerpt)</label>
          <textarea
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Đoạn văn ngắn hiển thị trong danh sách tin tức..."
            className="w-full rounded-lg border border-slate-300 p-3 text-xs focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Nội dung chi tiết *</label>
          <textarea
            rows={12}
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung bài viết..."
            className="w-full rounded-lg border border-slate-300 p-3.5 text-sm leading-relaxed focus:border-luxury-gold focus:outline-none"
          />
        </div>
      </div>
    </form>
  );
}

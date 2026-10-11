'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Edit, Trash2, ExternalLink, FileText, CheckCircle, Eye } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/utils';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/articles');
      if (res.ok) {
        const data = await res.json();
        setArticles(data.articles || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa bài viết này?')) return;
    try {
      const res = await fetch(`/api/admin/articles/${id}`, { method: 'DELETE' });
      if (res.ok) fetchArticles();
    } catch (err) {
      console.error(err);
    }
  };

  const columns: Column<any>[] = [
    {
      header: 'Tiêu đề bài viết',
      cell: (row) => (
        <div className="flex items-center gap-3">
          {row.featuredImage && (
            <div className="h-10 w-14 shrink-0 overflow-hidden rounded bg-slate-100">
              <img src={row.featuredImage} alt={row.title} className="h-full w-full object-cover" />
            </div>
          )}
          <div>
            <Link
              href={`/admin/bai-viet/${row.id}`}
              className="font-semibold text-slate-900 hover:text-luxury-gold block"
            >
              {row.title}
            </Link>
            <span className="text-2xs text-slate-400 font-mono">/{row.slug}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Chuyên mục',
      cell: (row) => <span className="text-xs text-slate-600">{row.category?.name || 'Tin tức'}</span>,
    },
    {
      header: 'Lượt xem',
      cell: (row) => <span className="font-medium text-slate-700">{row.viewCount}</span>,
      sortable: true,
    },
    {
      header: 'Trạng thái',
      cell: (row) => (
        <span
          className={`rounded-full px-2 py-0.5 text-2xs font-semibold ${
            row.status === 'published'
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {row.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
        </span>
      ),
    },
    {
      header: 'Ngày đăng',
      cell: (row) => <span className="text-2xs text-slate-400">{formatDate(row.createdAt)}</span>,
    },
    {
      header: 'Thao tác',
      className: 'text-right',
      cell: (row) => (
        <div className="flex items-center justify-end gap-1">
          <Link
            href={`/admin/bai-viet/${row.id}`}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          >
            <Edit className="h-4 w-4" />
          </Link>
          <button
            onClick={() => handleDelete(row.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Tin Tức & Bài Viết
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Biên tập tin tức thời trang, xu hướng và cẩm nang phong cách.
          </p>
        </div>

        <Link href="/admin/bai-viet/them">
          <Button className="bg-luxury-black text-white hover:bg-luxury-black-light shadow-sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Viết bài mới
          </Button>
        </Link>
      </div>

      <DataTable columns={columns} data={articles} isLoading={loading} />
    </div>
  );
}

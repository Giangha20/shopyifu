'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ArticleForm } from '@/components/admin/article-form';
import { Loader2 } from 'lucide-react';

export default function EditArticlePage() {
  const params = useParams();
  const id = params?.id as string;
  const [article, setArticle] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/articles/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setArticle(data.article);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
        <p className="text-sm text-slate-500">Đang tải bài viết...</p>
      </div>
    );
  }

  if (!article) return <p className="py-20 text-center text-sm text-rose-600">Không tìm thấy bài viết!</p>;

  return <ArticleForm initialData={article} articleId={id} />;
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Send, CheckCircle, Mail, Phone, Calendar, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';

export default function TicketDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('in_progress');
  const [response, setResponse] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTicket = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/support/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setTicket(data.ticket);
      setStatus(data.ticket.status);
      setResponse(data.ticket.response || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchTicket();
  }, [id]);

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await fetch(`/api/admin/support/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, response }),
      });

      if (!res.ok) throw new Error('Failed to update');
      alert('Đã lưu phản hồi cho khách hàng');
      fetchTicket();
    } catch (err) {
      console.error(err);
      alert('Lỗi khi gửi phản hồi');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-luxury-gold" />
        <p className="text-sm text-slate-500">Đang tải ticket...</p>
      </div>
    );
  }

  if (!ticket) return <p className="py-20 text-center text-sm text-rose-600">Không tìm thấy yêu cầu hỗ trợ!</p>;

  return (
    <div className="max-w-4xl space-y-6 pb-16">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/ho-tro"
          className="rounded-lg border border-slate-200 bg-white p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            {ticket.subject}
          </h1>
          <p className="text-xs text-slate-500">
            Từ {ticket.name} ({ticket.email}) • Gửi lúc {formatDateTime(ticket.createdAt)}
          </p>
        </div>
      </div>

      {/* Customer Question Card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Nội dung yêu cầu từ khách hàng
        </h2>
        <div className="rounded-xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-800">
          {ticket.message}
        </div>
      </div>

      {/* Response Form */}
      <form
        onSubmit={handleSubmitResponse}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
      >
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Phản hồi của ban quản trị
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase text-slate-700">Trạng thái xử lý</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-xs focus:border-luxury-gold focus:outline-none"
            >
              <option value="open">Mới mở (Open)</option>
              <option value="in_progress">Đang xử lý (In Progress)</option>
              <option value="resolved">Đã giải quyết xong (Resolved)</option>
              <option value="closed">Đóng yêu cầu (Closed)</option>
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase text-slate-700">Nội dung trả lời khách hàng</label>
          <textarea
            rows={6}
            required
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            placeholder="Kính chào quý khách, bộ phận CSKH LUXE SHOP xin được phản hồi..."
            className="w-full rounded-lg border border-slate-300 p-3.5 text-sm focus:border-luxury-gold focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="submit"
            disabled={saving}
            className="bg-luxury-black text-white hover:bg-luxury-black-light"
          >
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Send className="mr-2 h-4 w-4" />
            Gửi phản hồi
          </Button>
        </div>
      </form>
    </div>
  );
}

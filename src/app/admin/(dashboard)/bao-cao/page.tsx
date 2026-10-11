'use client';

import React, { useEffect, useState } from 'react';
import {
  TrendingUp,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Package,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function AdminReportsPage() {
  const [period, setPeriod] = useState('30d');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async (p: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?period=${p}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(period);
  }, [period]);

  const handleExportCSV = () => {
    if (!data?.chartData) return;

    const headers = ['Ngày', 'Doanh thu (VNĐ)', 'Số đơn hàng'];
    const rows = data.chartData.map((d: any) => [d.date, d.revenue, d.orders]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e: any) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Bao_cao_kinh_doanh_LUXE_${period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartData = data?.chartData || [];
  const topProducts = data?.topProducts || [];
  const metrics = data?.metrics || { revenue: 0, orders: 0, customers: 0 };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
            Báo Cáo & Phân Tích Doanh Thu
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Xuất dữ liệu kế toán và phân tích xu hướng tăng trưởng kinh doanh.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold focus:border-luxury-gold focus:outline-none"
          >
            <option value="7d">7 ngày qua</option>
            <option value="30d">30 ngày qua</option>
            <option value="90d">90 ngày qua</option>
            <option value="1y">1 năm qua</option>
          </select>

          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="gap-1.5 text-xs shadow-sm"
          >
            <Download className="h-4 w-4" />
            Xuất file CSV
          </Button>
        </div>
      </div>

      {/* Overview Metric Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-2xs font-bold uppercase text-slate-400">Tổng doanh thu kỳ này</p>
          <p className="mt-2 text-2xl font-bold text-luxury-gold">{formatPrice(metrics.revenue)}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-2xs font-bold uppercase text-slate-400">Tổng đơn hàng hoàn thành</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.orders} đơn</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-2xs font-bold uppercase text-slate-400">Khách hàng mới tạo tài khoản</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{metrics.customers} khách</p>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">Biểu đồ đối soát doanh thu</h2>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: '#64748b' }}
                tickFormatter={(val) => `${(val / 1000000).toFixed(0)}Tr`}
              />
              <Tooltip
                formatter={(val: any) => [formatPrice(val), 'Doanh thu']}
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
              />
              <Bar dataKey="revenue" fill="#C9A96E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top products table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-4">
          Hiệu suất sản phẩm bán chạy nhất kỳ này
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 uppercase">
                <th className="pb-3">Sản phẩm</th>
                <th className="pb-3">Giá bán</th>
                <th className="pb-3">Đã bán</th>
                <th className="pb-3 text-right">Tồn kho còn lại</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {topProducts.map((p: any, idx: number) => (
                <tr key={p.id || idx}>
                  <td className="py-3 font-semibold text-slate-900 flex items-center gap-3">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="h-9 w-9 rounded-lg object-cover bg-slate-100"
                    />
                    <span>{p.name}</span>
                  </td>
                  <td className="py-3 font-medium">{formatPrice(p.price)}</td>
                  <td className="py-3 font-bold text-slate-900">{p.soldCount}</td>
                  <td className="py-3 text-right">{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

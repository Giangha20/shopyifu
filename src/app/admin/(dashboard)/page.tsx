'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Users,
  Package,
  ArrowRight,
  AlertTriangle,
  Clock,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { StatsCard } from '@/components/admin/stats-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, formatDateTime, ORDER_STATUSES } from '@/lib/utils';

const STATUS_COLORS: Record<string, string> = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  preparing: '#6366f1',
  shipping: '#a855f7',
  delivered: '#10b981',
  cancelled: '#f43f5e',
  returned: '#64748b',
};

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  const fetchDashboardData = async (selectedPeriod: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/dashboard?period=${selectedPeriod}`);
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const metrics = {
    revenue: Number(data?.metrics?.revenue ?? data?.metrics?.totalRevenue ?? 0),
    revenueTrend: Number(data?.metrics?.revenueTrend ?? 0),
    orders: Number(data?.metrics?.orders ?? data?.metrics?.totalOrders ?? 0),
    ordersTrend: Number(data?.metrics?.ordersTrend ?? 0),
    customers: Number(data?.metrics?.customers ?? data?.metrics?.totalCustomers ?? 0),
    customersTrend: Number(data?.metrics?.customersTrend ?? 0),
    products: Number(data?.metrics?.products ?? data?.metrics?.totalProducts ?? 0),
  };

  const chartData = data?.chartData || [];
  const recentOrders = data?.recentOrders || [];
  const topProducts = data?.topProducts || [];
  const lowStockProducts = data?.lowStockProducts || [];
  const ordersByStatus = data?.ordersByStatus || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Page Title & Filter Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bảng Điều Khiển
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Tổng quan hiệu suất kinh doanh và hoạt động của LUXE SHOP.
          </p>
        </div>

        {/* Time period toggle */}
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {(['7d', '30d', '90d', '1y'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                period === p
                  ? 'bg-luxury-black text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {p === '7d' && '7 ngày'}
              {p === '30d' && '30 ngày'}
              {p === '90d' && '90 ngày'}
              {p === '1y' && '1 năm'}
            </button>
          ))}
          <button
            onClick={() => fetchDashboardData(period)}
            className="ml-1 rounded-lg p-1.5 text-slate-400 hover:text-slate-700"
            title="Làm mới"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Doanh thu"
          value={formatPrice(metrics.revenue)}
          trend={metrics.revenueTrend}
          icon={DollarSign}
          variant="gold"
        />
        <StatsCard
          title="Đơn hàng"
          value={metrics.orders}
          trend={metrics.ordersTrend}
          icon={ShoppingBag}
          variant="emerald"
        />
        <StatsCard
          title="Khách hàng mới"
          value={metrics.customers}
          trend={metrics.customersTrend}
          icon={Users}
          variant="blue"
        />
        <StatsCard
          title="Sản phẩm hoạt động"
          value={metrics.products}
          description="Đang hiển thị trên website"
          icon={Package}
          variant="default"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Revenue area chart (2 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Xu hướng Doanh thu</h2>
              <p className="text-xs text-slate-500">Biểu đồ tăng trưởng doanh số theo thời gian</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-luxury-gold font-semibold">
              <TrendingUp className="h-4 w-4" />
              <span>Thời gian thực</span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C9A96E" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#C9A96E" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={(val) => `${(val / 1000000).toFixed(0)}M`}
                />
                <Tooltip
                  formatter={(val: any) => [formatPrice(val), 'Doanh thu']}
                  labelStyle={{ fontWeight: 'bold', color: '#1e293b' }}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#C9A96E"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Status Distribution Donut Chart (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Trạng thái đơn hàng</h2>
            <p className="text-xs text-slate-500">Tỷ lệ các trạng thái xử lý đơn</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="count"
                  nameKey="status"
                >
                  {ordersByStatus.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={STATUS_COLORS[entry.status] || '#94a3b8'}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any) => [
                    `${value} đơn`,
                    ORDER_STATUSES[name]?.label || name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom legend */}
          <div className="mt-2 grid grid-cols-2 gap-2 text-2xs">
            {ordersByStatus.slice(0, 4).map((item: any, idx: number) => (
              <div key={idx} className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: STATUS_COLORS[item.status] || '#94a3b8' }}
                />
                <span className="truncate text-slate-600">
                  {ORDER_STATUSES[item.status]?.label || item.status} ({item.count})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Volume Bar Chart & Top Selling */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Orders Bar Chart (2 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-base font-bold text-slate-900">Số lượng Đơn hàng</h2>
            <p className="text-xs text-slate-500">Số đơn phát sinh mỗi ngày</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={{ stroke: '#e2e8f0' }}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  allowDecimals={false}
                />
                <Tooltip
                  formatter={(val: any) => [`${val} đơn`, 'Số đơn']}
                  contentStyle={{
                    borderRadius: '12px',
                    borderColor: '#e2e8f0',
                  }}
                />
                <Bar dataKey="orders" fill="#1A1A1A" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Products */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Top Bán chạy</h2>
              <p className="text-xs text-slate-500">5 sản phẩm được mua nhiều nhất</p>
            </div>
            <Link
              href="/admin/san-pham"
              className="text-2xs font-semibold text-luxury-gold hover:underline"
            >
              Xem tất cả
            </Link>
          </div>

          <div className="space-y-4">
            {topProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-slate-400">Chưa có sản phẩm nào được bán</p>
            ) : (
              topProducts.map((prod: any, idx: number) => (
                <div key={prod.id || idx} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                    {idx + 1}
                  </div>
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50">
                    <img
                      src={prod.image}
                      alt={prod.name}
                      className="h-full w-full object-cover"
                      onError={(e: any) => {
                        e.target.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-900">{prod.name}</p>
                    <p className="text-2xs text-slate-500">{formatPrice(prod.price)}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900">{prod.soldCount}</span>
                    <span className="block text-2xs text-slate-400">đã bán</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders & Low Stock Warning Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent 10 Orders Table (2 cols) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Đơn hàng gần đây</h2>
              <p className="text-xs text-slate-500">10 đơn hàng vừa phát sinh trên hệ thống</p>
            </div>
            <Link
              href="/admin/don-hang"
              className="flex items-center gap-1 text-xs font-semibold text-luxury-gold hover:underline"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400">
                  <th className="pb-3 font-semibold uppercase">Mã đơn</th>
                  <th className="pb-3 font-semibold uppercase">Khách hàng</th>
                  <th className="pb-3 font-semibold uppercase">Tổng tiền</th>
                  <th className="pb-3 font-semibold uppercase">Trạng thái</th>
                  <th className="pb-3 font-semibold uppercase">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order: any) => {
                    const statusMeta = ORDER_STATUSES[order.status] || {
                      label: order.status,
                      color: 'bg-slate-100 text-slate-700',
                    };

                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 font-mono font-bold text-slate-900">
                          <Link href={`/admin/don-hang/${order.id}`} className="hover:text-luxury-gold">
                            #{order.orderNumber}
                          </Link>
                        </td>
                        <td className="py-3">
                          <p className="font-medium text-slate-900">{order.customerName}</p>
                          <p className="text-2xs text-slate-400">{order.customerEmail}</p>
                        </td>
                        <td className="py-3 font-semibold text-slate-900">
                          {formatPrice(order.totalAmount)}
                        </td>
                        <td className="py-3">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-2xs font-semibold ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="py-3 text-slate-400">
                          {formatDateTime(order.createdAt)}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                <AlertTriangle className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">Cảnh báo tồn kho</h2>
                <p className="text-xs text-slate-500">Sản phẩm sắp hết hàng</p>
              </div>
            </div>
            <Link
              href="/admin/kho-hang"
              className="text-2xs font-semibold text-luxury-gold hover:underline"
            >
              Kho hàng
            </Link>
          </div>

          <div className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-emerald-600">
                Tất cả sản phẩm đều có số lượng an toàn!
              </p>
            ) : (
              lowStockProducts.map((p: any) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl border border-rose-100 bg-rose-50/30 p-3"
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="h-8 w-8 shrink-0 overflow-hidden rounded bg-white border border-slate-100">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-full w-full object-cover"
                        onError={(e: any) => {
                          e.target.src = '/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-xs font-semibold text-slate-900">{p.name}</p>
                      <p className="text-2xs font-mono text-slate-400">SKU: {p.sku}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block rounded-md bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                      Còn {p.quantity}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

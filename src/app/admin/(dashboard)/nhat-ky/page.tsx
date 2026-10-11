'use client';

import React, { useEffect, useState } from 'react';
import { History, Eye, X } from 'lucide-react';
import { DataTable, Column } from '@/components/admin/data-table';
import { formatDateTime } from '@/lib/utils';

export default function AdminAuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [modalLog, setModalLog] = useState<any | null>(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '15',
      });

      const res = await fetch(`/api/admin/audit-logs?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalItems(data.pagination?.total || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const columns: Column<any>[] = [
    {
      header: 'Người thực hiện',
      cell: (row) => (
        <div>
          <p className="font-semibold text-slate-900">{row.userName}</p>
          <p className="text-2xs text-slate-400">{row.userEmail}</p>
        </div>
      ),
    },
    {
      header: 'Hành động',
      cell: (row) => (
        <span className="rounded bg-slate-100 px-2 py-0.5 text-2xs font-mono font-bold text-slate-700">
          {row.action}
        </span>
      ),
    },
    {
      header: 'Đối tượng',
      cell: (row) => (
        <span className="text-xs font-medium text-slate-800">
          {row.entity} {row.entityId ? `(#${row.entityId.slice(-6)})` : ''}
        </span>
      ),
    },
    {
      header: 'Địa chỉ IP',
      cell: (row) => <span className="text-2xs font-mono text-slate-500">{row.ipAddress}</span>,
    },
    {
      header: 'Thời gian',
      cell: (row) => <span className="text-2xs text-slate-500">{formatDateTime(row.createdAt)}</span>,
      sortable: true,
    },
    {
      header: 'Chi tiết',
      className: 'text-right',
      cell: (row) => (
        <button
          onClick={() => setModalLog(row)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold tracking-tight text-slate-900">
          Nhật Ký Kiểm Toán (Audit Log)
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Theo dõi toàn bộ các hoạt động nhạy cảm, thay đổi dữ liệu và đăng nhập hệ thống.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={logs}
        isLoading={loading}
        page={page}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={setPage}
      />

      {modalLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-serif text-lg font-bold text-slate-900">
                Chi tiết bản ghi kiểm toán
              </h3>
              <button onClick={() => setModalLog(null)} className="rounded p-1 text-slate-400">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <span className="font-semibold text-slate-500">Người thực hiện: </span>
                <span className="font-bold text-slate-900">{modalLog.userName} ({modalLog.userEmail})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Hành động: </span>
                <span className="font-bold text-slate-900">{modalLog.action}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Đối tượng: </span>
                <span className="font-mono text-slate-900">{modalLog.entity} (ID: {modalLog.entityId || 'N/A'})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-500">Thời gian: </span>
                <span className="text-slate-900">{formatDateTime(modalLog.createdAt)}</span>
              </div>

              <div className="space-y-1 pt-2">
                <span className="font-semibold text-slate-500">Dữ liệu thay đổi:</span>
                <pre className="max-h-60 overflow-auto rounded-xl bg-slate-900 p-3 text-2xs font-mono text-emerald-400">
                  {JSON.stringify(modalLog.changes, null, 2) || '{}'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

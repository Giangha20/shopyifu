'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Plus,
  MapPin,
  Phone,
  User,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Loader2,
  Building,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { addressSchema, type AddressInput } from '@/lib/validations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/components/ui/modal';

interface AddressItem {
  id: string;
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  createdAt?: string;
}

// Vietnam Administrative Divisions data for smooth selection
const VIETNAM_LOCATIONS: Record<
  string,
  {
    districts: Record<string, string[]>;
  }
> = {
  'Hà Nội': {
    districts: {
      'Quận Ba Đình': ['Phường Trúc Bạch', 'Phường Điện Biên', 'Phường Đội Cấn', 'Phường Kim Mã', 'Phường Giảng Võ'],
      'Quận Hoàn Kiếm': ['Phường Tràng Tiền', 'Phường Hàng Bài', 'Phường Hàng Đào', 'Phường Cửa Đông', 'Phường Lý Thái Tổ'],
      'Quận Đống Đa': ['Phường Láng Hạ', 'Phường Ô Chợ Dừa', 'Phường Quốc Tử Giám', 'Phường Nam Đồng', 'Phường Khâm Thiên'],
      'Quận Cầu Giấy': ['Phường Dịch Vọng', 'Phường Yên Hòa', 'Phường Nghĩa Đô', 'Phường Quan Hoa', 'Phường Trung Hòa'],
      'Quận Tây Hồ': ['Phường Quảng An', 'Phường Xuân La', 'Phường Yên Phụ', 'Phường Bưởi', 'Phường Nhật Tân'],
      'Quận Hai Bà Trưng': ['Phường Bách Khoa', 'Phường Lê Đại Hành', 'Phường Bạch Mai', 'Phường Phố Huế', 'Phường Thanh Lương'],
      'Quận Thanh Xuân': ['Phường Nhân Chính', 'Phường Khương Mai', 'Phường Thanh Xuân Bắc', 'Phường Hạ Đình'],
      'Quận Nam Từ Liêm': ['Phường Mỹ Đình 1', 'Phường Mỹ Đình 2', 'Phường Mễ Trì', 'Phường Cầu Diễn'],
    },
  },
  'TP. Hồ Chí Minh': {
    districts: {
      'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Đa Kao', 'Phường Tân Định', 'Phường Phạm Ngũ Lão'],
      'Quận 3': ['Phường Võ Thị Sáu', 'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4'],
      'Quận 7': ['Phường Tân Phong', 'Phường Tân Phú', 'Phường Phú Mỹ', 'Phường Tân Hưng', 'Phường Tân Quy'],
      'TP. Thủ Đức': ['Phường Thảo Điền', 'Phường An Phú', 'Phường Bình An', 'Phường Linh Trung', 'Phường Hiệp Phú'],
      'Quận Bình Thạnh': ['Phường 22', 'Phường 19', 'Phường 25', 'Phường 17', 'Phường 26'],
      'Quận Phú Nhuận': ['Phường 1', 'Phường 2', 'Phường 9', 'Phường 15', 'Phường 17'],
      'Quận Tân Bình': ['Phường 2', 'Phường 4', 'Phường 12', 'Phường 13', 'Phường 15'],
      'Quận 10': ['Phường 12', 'Phường 14', 'Phường 15', 'Phường 6', 'Phường 8'],
    },
  },
  'Đà Nẵng': {
    districts: {
      'Quận Hải Châu': ['Phường Hải Châu 1', 'Phường Hải Châu 2', 'Phường Thạch Thang', 'Phường Phước Ninh'],
      'Quận Thanh Khê': ['Phường Vĩnh Trung', 'Phường Tân Chính', 'Phường Tam Thuận', 'Phường Thạc Gián'],
      'Quận Sơn Trà': ['Phường An Hải Bắc', 'Phường Phước Mỹ', 'Phường Thọ Quang', 'Phường Mân Thái'],
      'Quận Ngũ Hành Sơn': ['Phường Mỹ An', 'Phường Khuê Mỹ', 'Phường Hòa Quý', 'Phường Hòa Hải'],
    },
  },
  'Hải Phòng': {
    districts: {
      'Quận Hồng Bàng': ['Phường Hoàng Văn Thụ', 'Phường Minh Khai', 'Phường Phan Bội Châu'],
      'Quận Ngô Quyền': ['Phường Máy Chai', 'Phường Cầu Đất', 'Phường Lạc Viên'],
      'Quận Lê Chân': ['Phường An Biên', 'Phường Cát Dài', 'Phường Trại Cau'],
    },
  },
  'Cần Thơ': {
    districts: {
      'Quận Ninh Kiều': ['Phường Tân An', 'Phường An Cư', 'Phường An Hòa', 'Phường Xuân Khánh'],
      'Quận Cái Răng': ['Phường Lê Bình', 'Phường Hưng Phú', 'Phường Ba Láng'],
    },
  },
  'Bình Dương': {
    districts: {
      'TP. Thủ Dầu Một': ['Phường Phú Cường', 'Phường Hiệp Thành', 'Phường Chánh Nghĩa'],
      'TP. Dĩ An': ['Phường Dĩ An', 'Phường Tân Đông Hiệp', 'Phường Đông Hòa'],
      'TP. Thuận An': ['Phường Lái Thiêu', 'Phường An Phú', 'Phường Bình Hòa'],
    },
  },
  'Khánh Hòa': {
    districts: {
      'TP. Nha Trang': ['Phường Lộc Thọ', 'Phường Phước Tiến', 'Phường Vĩnh Nguyên', 'Phường Vĩnh Hải'],
      'TP. Cam Ranh': ['Phường Cam Nghĩa', 'Phường Cam Phúc Bắc', 'Phường Ba Ngòi'],
    },
  },
  'Quảng Ninh': {
    districts: {
      'TP. Hạ Long': ['Phường Bãi Cháy', 'Phường Hồng Gai', 'Phường Bạch Đằng', 'Phường Hòn Gai'],
      'TP. Cẩm Phả': ['Phường Cẩm Trung', 'Phường Cẩm Thành', 'Phường Cẩm Phả'],
    },
  },
};

export default function AddressesPage() {
  const [addresses, setAddresses] = React.useState<AddressItem[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [actionError, setActionError] = React.useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingAddress, setEditingAddress] = React.useState<AddressItem | null>(null);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  // Dependent location selects
  const [selectedProvince, setSelectedProvince] = React.useState('');
  const [selectedDistrict, setSelectedDistrict] = React.useState('');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      isDefault: false,
    },
  });

  const fetchAddresses = React.useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/user/addresses');
      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses || []);
      }
    } catch {
      setActionError('Không thể tải danh sách địa chỉ');
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const openAddModal = () => {
    setEditingAddress(null);
    setSelectedProvince('');
    setSelectedDistrict('');
    reset({
      fullName: '',
      phone: '',
      province: '',
      district: '',
      ward: '',
      street: '',
      isDefault: addresses.length === 0,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (addr: AddressItem) => {
    setEditingAddress(addr);
    setSelectedProvince(addr.province);
    setSelectedDistrict(addr.district);
    reset({
      fullName: addr.fullName,
      phone: addr.phone,
      province: addr.province,
      district: addr.district,
      ward: addr.ward,
      street: addr.street,
      isDefault: addr.isDefault,
    });
    setIsModalOpen(true);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedProvince(val);
    setValue('province', val, { shouldValidate: true });
    setSelectedDistrict('');
    setValue('district', '', { shouldValidate: true });
    setValue('ward', '', { shouldValidate: true });
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrict(val);
    setValue('district', val, { shouldValidate: true });
    setValue('ward', '', { shouldValidate: true });
  };

  const onSaveAddress = async (data: AddressInput) => {
    setActionError(null);
    try {
      const url = editingAddress
        ? `/api/user/addresses/${editingAddress.id}`
        : '/api/user/addresses';
      const method = editingAddress ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const resData = await res.json();
      if (!res.ok) {
        setActionError(resData.error || 'Thao tác không thành công');
        return;
      }

      setIsModalOpen(false);
      await fetchAddresses();
    } catch {
      setActionError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const res = await fetch(`/api/user/addresses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setDefault' }),
      });

      if (res.ok) {
        await fetchAddresses();
      }
    } catch {
      setActionError('Không thể thiết lập địa chỉ mặc định');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/user/addresses/${deleteId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteId(null);
        await fetchAddresses();
      }
    } catch {
      setActionError('Không thể xóa địa chỉ lúc này');
    }
  };

  const availableDistricts = selectedProvince && VIETNAM_LOCATIONS[selectedProvince]
    ? Object.keys(VIETNAM_LOCATIONS[selectedProvince].districts)
    : [];

  const availableWards = selectedProvince && selectedDistrict && VIETNAM_LOCATIONS[selectedProvince]?.districts[selectedDistrict]
    ? VIETNAM_LOCATIONS[selectedProvince].districts[selectedDistrict]
    : [];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <h2 className="font-serif text-2xl font-bold text-luxury-black">
            Sổ địa chỉ nhận hàng
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý các địa chỉ giao nhận để quá trình thanh toán diễn ra thuận tiện và nhanh chóng
          </p>
        </div>

        <Button
          onClick={openAddModal}
          variant="primary"
          size="md"
          className="bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs uppercase tracking-wider shrink-0"
        >
          <Plus className="h-4 w-4 mr-1.5" />
          <span>Thêm địa chỉ mới</span>
        </Button>
      </div>

      {actionError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-50 p-4 text-xs font-medium text-rose-800">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center space-y-3">
          <Loader2 className="h-7 w-7 animate-spin text-amber-600" />
          <p className="text-xs text-slate-500">Đang tải danh sách địa chỉ...</p>
        </div>
      ) : addresses.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600 mb-4">
            <MapPin className="h-7 w-7" />
          </div>
          <h3 className="font-serif text-lg font-bold text-slate-900">
            Chưa có địa chỉ nào được lưu
          </h3>
          <p className="mt-1 text-xs text-slate-500 max-w-sm">
            Thêm địa chỉ giao hàng để LUXE SHOP vận chuyển các thiết kế trang nhã đến tận tay quý khách.
          </p>
          <div className="mt-6">
            <Button onClick={openAddModal} variant="gold" size="md">
              <Plus className="h-4 w-4 mr-1.5" />
              <span>Thêm địa chỉ đầu tiên</span>
            </Button>
          </div>
        </div>
      ) : (
        /* Address List Grid */
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((addr) => (
            <motion.div
              key={addr.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`relative flex flex-col justify-between rounded-2xl border p-5 transition-all duration-200 ${
                addr.isDefault
                  ? 'border-amber-500/50 bg-amber-50/20 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {addr.fullName}
                    </span>
                    {addr.isDefault && (
                      <Badge variant="bestseller" size="sm" className="bg-amber-600 text-white font-normal text-2xs">
                        Mặc định
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{addr.phone}</span>
                  </div>
                  <div className="flex items-start gap-2 pt-0.5">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">
                      {addr.street}, {addr.ward}, {addr.district}, {addr.province}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div>
                  {!addr.isDefault ? (
                    <button
                      type="button"
                      onClick={() => handleSetDefault(addr.id)}
                      className="font-medium text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      Đặt làm mặc định
                    </button>
                  ) : (
                    <span className="text-2xs font-medium text-emerald-600 flex items-center gap-1">
                      <Check className="h-3 w-3" />
                      Địa chỉ nhận hàng chính
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => openEditModal(addr)}
                    className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Sửa</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteId(addr.id)}
                    className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent size="default" className="sm:max-w-lg">
          <ModalHeader>
            <ModalTitle>
              {editingAddress ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ nhận hàng mới'}
            </ModalTitle>
            <ModalDescription>
              Vui lòng cung cấp chính xác địa chỉ và số điện thoại người nhận
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleSubmit(onSaveAddress)} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Họ và tên người nhận <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Nguyễn Văn A"
                  {...register('fullName')}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {errors.fullName && (
                  <p className="mt-1 text-xs text-rose-500">{errors.fullName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Số điện thoại <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="0912345678"
                  {...register('phone')}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                {errors.phone && (
                  <p className="mt-1 text-xs text-rose-500">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Province selection */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Tỉnh / Thành phố <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedProvince}
                onChange={handleProvinceChange}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                <option value="">-- Chọn Tỉnh / Thành phố --</option>
                {Object.keys(VIETNAM_LOCATIONS).map((prov) => (
                  <option key={prov} value={prov}>
                    {prov}
                  </option>
                ))}
              </select>
              {errors.province && (
                <p className="mt-1 text-xs text-rose-500">{errors.province.message}</p>
              )}
            </div>

            {/* District & Ward Row */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Quận / Huyện <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  disabled={!selectedProvince}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Chọn Quận / Huyện --</option>
                  {availableDistricts.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
                {errors.district && (
                  <p className="mt-1 text-xs text-rose-500">{errors.district.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Phường / Xã <span className="text-rose-500">*</span>
                </label>
                <select
                  {...register('ward')}
                  disabled={!selectedDistrict}
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                >
                  <option value="">-- Chọn Phường / Xã --</option>
                  {availableWards.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                {errors.ward && (
                  <p className="mt-1 text-xs text-rose-500">{errors.ward.message}</p>
                )}
              </div>
            </div>

            {/* Street Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Địa chỉ chi tiết (Số nhà, tên đường, tòa nhà) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Tòa nhà Bitexco, số 2 Hải Triều"
                {...register('street')}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              {errors.street && (
                <p className="mt-1 text-xs text-rose-500">{errors.street.message}</p>
              )}
            </div>

            {/* Default address checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
                <input
                  type="checkbox"
                  {...register('isDefault')}
                  className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500/20"
                />
                <span>Đặt làm địa chỉ nhận hàng mặc định</span>
              </label>
            </div>

            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsModalOpen(false)}
              >
                Hủy bỏ
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                loadingText="Đang lưu..."
                className="bg-slate-900 hover:bg-slate-800 text-white"
              >
                Lưu địa chỉ
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={Boolean(deleteId)} onOpenChange={(open) => !open && setDeleteId(null)}>
        <ModalContent size="default" className="sm:max-w-md">
          <ModalHeader>
            <ModalTitle className="text-rose-600">Xác nhận xóa địa chỉ</ModalTitle>
            <ModalDescription>
              Quý khách có chắc chắn muốn xóa địa chỉ này khỏi sổ địa chỉ của mình? Thao tác này không thể hoàn tác.
            </ModalDescription>
          </ModalHeader>
          <ModalFooter>
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setDeleteId(null)}
            >
              Giữ lại
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="md"
              onClick={handleDelete}
            >
              Xác nhận xóa
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}

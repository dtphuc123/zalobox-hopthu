import React, { useEffect, useRef, useState } from 'react';
import { Table, Tag, Typography, Alert, Empty, Avatar, Space, Input, Select } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { BoCucChinh } from '../components/BoCucChinh';
import { timKiemHoiThoai } from '../api/hoiThoai';
import { layDanhSachNhan } from '../api/nhan';
import type { HoiThoai, Nhan, TrangThaiHoiThoai } from '../api/types';

const { Title } = Typography;

const NHAN_TRANG_THAI: Record<TrangThaiHoiThoai, { mau: string; chu: string }> = {
  moi: { mau: 'blue', chu: 'Mới' },
  dang_xu_ly: { mau: 'orange', chu: 'Đang xử lý' },
  da_xong: { mau: 'default', chu: 'Đã xong' },
};

const CHU_KY_LAM_MOI_MS = 8000;

export function DanhSachHoiThoai() {
  const navigate = useNavigate();
  const [danhSach, setDanhSach] = useState<HoiThoai[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [tuKhoa, setTuKhoa] = useState('');
  const [trangThai, setTrangThai] = useState<TrangThaiHoiThoai | undefined>();
  const [nhanId, setNhanId] = useState<string | undefined>();
  const [danhSachNhan, setDanhSachNhan] = useState<Nhan[]>([]);

  // Polling dùng bộ lọc mới nhất thông qua ref (interval chỉ tạo một lần).
  const boLocRef = useRef({ tuKhoa, trangThai, nhanId });
  boLocRef.current = { tuKhoa, trangThai, nhanId };

  useEffect(() => {
    layDanhSachNhan()
      .then(setDanhSachNhan)
      .catch((err) => console.debug('Không tải được danh sách nhãn:', err));
  }, []);

  // Tải lại mỗi khi đổi bộ lọc.
  useEffect(() => {
    taiDanhSach();
  }, [tuKhoa, trangThai, nhanId]);

  // Polling: tự động cập nhật danh sách hội thoại mỗi vài giây (chưa có WebSocket).
  useEffect(() => {
    const bo = setInterval(() => {
      lamMoiNgam();
    }, CHU_KY_LAM_MOI_MS);
    return () => clearInterval(bo);
  }, []);

  async function taiDanhSach() {
    setDangTai(true);
    setLoi(null);
    try {
      const data = await timKiemHoiThoai(boLocRef.current);
      setDanhSach(data);
    } catch (err: any) {
      setLoi(
        err?.response?.data?.message ||
          'Không tải được danh sách hội thoại. Vui lòng thử lại.',
      );
    } finally {
      setDangTai(false);
    }
  }

  async function lamMoiNgam() {
    try {
      const data = await timKiemHoiThoai(boLocRef.current);
      setDanhSach(data);
    } catch (err) {
      // polling ngầm nên không hiện Alert, chỉ log lại để còn biết lúc debug
      console.debug('Làm mới danh sách hội thoại (ngầm) thất bại:', err);
    }
  }

  const columns = [
    {
      title: 'Khách hàng',
      dataIndex: 'khachHang',
      key: 'khachHang',
      render: (_: unknown, record: HoiThoai) => (
        <Space>
          <Avatar icon={<UserOutlined />} />
          {record.khachHang?.ten || record.khachHang?.maNgoai || '—'}
        </Space>
      ),
    },
    {
      title: 'Nhãn',
      dataIndex: 'danhSachNhan',
      key: 'danhSachNhan',
      render: (_: unknown, record: HoiThoai) => (
        <Space size={4} wrap>
          {record.danhSachNhan?.length
            ? record.danhSachNhan.map((nhan) => <Tag key={nhan.id}>{nhan.ten}</Tag>)
            : '—'}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'trangThai',
      key: 'trangThai',
      render: (trangThai: TrangThaiHoiThoai) => {
        const info = NHAN_TRANG_THAI[trangThai] ?? { mau: 'default', chu: trangThai };
        return <Tag color={info.mau}>{info.chu}</Tag>;
      },
    },
    {
      title: 'Cập nhật lúc',
      dataIndex: 'ngayCapNhat',
      key: 'ngayCapNhat',
      render: (ngay: string) => dayjs(ngay).format('DD/MM/YYYY HH:mm'),
    },
  ];

  return (
    <BoCucChinh>
      <Title level={4} style={{ marginBottom: 16 }}>
        Hội thoại
      </Title>

      <Space wrap style={{ marginBottom: 16 }}>
        <Input.Search
          placeholder="Tìm theo tên, SĐT hoặc nội dung tin nhắn"
          allowClear
          onSearch={(v) => setTuKhoa(v.trim())}
          style={{ width: 300 }}
        />
        <Select
          placeholder="Trạng thái"
          allowClear
          value={trangThai}
          onChange={(v) => setTrangThai(v)}
          style={{ width: 160 }}
          options={(Object.keys(NHAN_TRANG_THAI) as TrangThaiHoiThoai[]).map((k) => ({
            value: k,
            label: NHAN_TRANG_THAI[k].chu,
          }))}
        />
        <Select
          placeholder="Nhãn"
          allowClear
          value={nhanId}
          onChange={(v) => setNhanId(v)}
          style={{ width: 160 }}
          options={danhSachNhan.map((n) => ({ value: n.id, label: n.ten }))}
        />
      </Space>

      {loi && (
        <Alert
          type="error"
          message={loi}
          showIcon
          closable
          onClose={() => setLoi(null)}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        rowKey="id"
        loading={dangTai}
        columns={columns}
        dataSource={danhSach}
        scroll={{ x: 700 }}
        onRow={(record) => ({
          onClick: () => navigate(`/hoi-thoai/${record.id}`),
          style: { cursor: 'pointer' },
        })}
        locale={{
          emptyText: (
            <Empty description="Chưa có hội thoại nào được giao cho bạn" />
          ),
        }}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
      />
    </BoCucChinh>
  );
}
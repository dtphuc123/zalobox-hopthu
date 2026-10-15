import React, { useEffect, useState } from 'react';
import { Table, Typography, Alert, DatePicker, Space } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import { BoCucChinh } from '../components/BoCucChinh';
import { layBaoCaoHieuSuat } from '../api/baoCao';
import type { HieuSuatNhanVien } from '../api/types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

export function BaoCaoHieuSuat() {
  const [danhSach, setDanhSach] = useState<HieuSuatNhanVien[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [khoangNgay, setKhoangNgay] = useState<[Dayjs, Dayjs] | null>(null);

  useEffect(() => {
    taiBaoCao();
  }, [khoangNgay]);

  async function taiBaoCao() {
    setDangTai(true);
    setLoi(null);
    try {
      const tuNgay = khoangNgay?.[0]?.format('YYYY-MM-DD');
      const denNgay = khoangNgay?.[1]?.format('YYYY-MM-DD');
      const data = await layBaoCaoHieuSuat(tuNgay, denNgay);
      setDanhSach(data);
    } catch (err: any) {
      setLoi(
        err?.response?.data?.message ||
          'Không tải được báo cáo hiệu suất. Vui lòng thử lại.',
      );
    } finally {
      setDangTai(false);
    }
  }

  const columns = [
    { title: 'Nhân viên', dataIndex: 'hoTen', key: 'hoTen' },
    {
      title: 'Hội thoại đã xử lý',
      dataIndex: 'soHoiThoaiDaXuLy',
      key: 'soHoiThoaiDaXuLy',
    },
    {
      title: 'Hội thoại đã xong',
      dataIndex: 'soHoiThoaiDaXong',
      key: 'soHoiThoaiDaXong',
    },
    {
      title: 'Tin nhắn đã gửi',
      dataIndex: 'soTinNhanDaGui',
      key: 'soTinNhanDaGui',
    },
    {
      title: 'Thời gian phản hồi TB (phút)',
      dataIndex: 'thoiGianPhanHoiTrungBinhPhut',
      key: 'thoiGianPhanHoiTrungBinhPhut',
      render: (gia: number | null) => (gia === null ? '—' : gia.toFixed(1)),
    },
  ];

  return (
    <BoCucChinh>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Title level={4} style={{ margin: 0 }}>
          Báo cáo hiệu suất
        </Title>
        <Space>
          <RangePicker
            onChange={(gia) =>
              setKhoangNgay(gia && gia[0] && gia[1] ? [gia[0], gia[1]] : null)
            }
            format="DD/MM/YYYY"
          />
        </Space>
      </div>

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
        rowKey="nguoiDungId"
        loading={dangTai}
        columns={columns}
        dataSource={danhSach}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />
    </BoCucChinh>
  );
}
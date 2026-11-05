import React, { useEffect, useState } from 'react';
import { Card, Result, Spin, Tag, Typography, Alert, Space, Button, Popconfirm, message } from 'antd';
import {
  CheckCircleFilled,
  LoadingOutlined,
  QrcodeOutlined,
  WarningFilled,
} from '@ant-design/icons';
import { BoCucChinh } from '../components/BoCucChinh';
import { layTrangThaiZalo, doiTaiKhoanZalo, ThongTinZalo, TrangThaiZalo } from '../api/zalo';

const { Title, Text, Paragraph } = Typography;

const KHOANG_CACH_CAP_NHAT_MS = 3000;

const NHAN_TRANG_THAI: Record<TrangThaiZalo, { mau: string; chu: string }> = {
  hoat_dong: { mau: 'success', chu: 'Đã kết nối' },
  cho_quet_qr: { mau: 'processing', chu: 'Đang chờ quét QR' },
  dang_ket_noi: { mau: 'processing', chu: 'Đang kết nối' },
  ngat_ket_noi: { mau: 'default', chu: 'Chưa kết nối' },
  loi: { mau: 'error', chu: 'Lỗi kết nối' },
};

export function KetNoiZalo() {
  const [thongTin, setThongTin] = useState<ThongTinZalo | null>(null);
  const [loi, setLoi] = useState<string | null>(null);

  useEffect(() => {
    let daHuy = false;

    async function capNhat() {
      try {
        const ketQua = await layTrangThaiZalo();
        if (!daHuy) {
          setThongTin(ketQua);
          setLoi(null);
        }
      } catch {
        if (!daHuy) setLoi('Không lấy được trạng thái Zalo từ máy chủ.');
      }
    }

    void capNhat();
    const timer = setInterval(() => void capNhat(), KHOANG_CACH_CAP_NHAT_MS);
    return () => {
      daHuy = true;
      clearInterval(timer);
    };
  }, []);

  async function xuLyDoiTaiKhoan() {
    try {
      await doiTaiKhoanZalo();
      message.success('Đã ngắt kết nối, vui lòng quét mã QR mới');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Không đổi được tài khoản Zalo');
    }
  }

  function hienNoiDung() {
    if (!thongTin) {
      return (
        <div style={{ textAlign: 'center', padding: 48 }}>
          <Spin />
        </div>
      );
    }

    switch (thongTin.trangThai) {
      case 'hoat_dong':
        return (
          <Result
            icon={<CheckCircleFilled style={{ color: '#52c41a' }} />}
            title="Đã kết nối Zalo"
            subTitle={
              thongTin.idTaiKhoanZalo
                ? `ID tài khoản Zalo: ${thongTin.idTaiKhoanZalo}`
                : undefined
            }
            extra={
              <Popconfirm
                title="Đổi sang tài khoản Zalo khác?"
                description="Hệ thống sẽ ngắt kết nối hiện tại và hiện mã QR mới."
                okText="Đổi tài khoản"
                cancelText="Hủy"
                onConfirm={xuLyDoiTaiKhoan}
              >
                <Button>Đổi tài khoản Zalo</Button>
              </Popconfirm>
            }
          />
        );

      case 'cho_quet_qr':
        return (
          <div style={{ textAlign: 'center' }}>
            <Title level={5}>
              <QrcodeOutlined /> Quét mã QR bằng ứng dụng Zalo trên điện thoại
            </Title>
            {thongTin.maQr && (
              <img
                src={`data:image/png;base64,${thongTin.maQr}`}
                alt="Mã QR đăng nhập Zalo"
                style={{
                  width: 260,
                  height: 260,
                  border: '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: 8,
                  background: '#fff',
                }}
              />
            )}
            <Paragraph type="secondary" style={{ marginTop: 16 }}>
              Mở Zalo → biểu tượng quét QR → quét mã trên → bấm xác nhận đăng nhập.
              <br />
              Mã QR hết hạn sau khoảng 1 phút, hệ thống sẽ tự tạo mã mới.
            </Paragraph>
          </div>
        );

      case 'loi':
        return (
          <Result
            icon={<WarningFilled style={{ color: '#ff4d4f' }} />}
            title="Kết nối Zalo bị lỗi"
            subTitle="Hệ thống đang tự thử kết nối lại, vui lòng đợi trong giây lát."
          />
        );

      default:
        return (
          <Result
            icon={<LoadingOutlined />}
            title="Đang chuẩn bị kết nối Zalo..."
            subTitle="Mã QR sẽ hiện ra trong vài giây."
          />
        );
    }
  }

  return (
    <BoCucChinh>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Space align="center">
          <Title level={3} style={{ margin: 0 }}>
            Kết nối Zalo
          </Title>
          {thongTin && (
            <Tag color={NHAN_TRANG_THAI[thongTin.trangThai].mau}>
              {NHAN_TRANG_THAI[thongTin.trangThai].chu}
            </Tag>
          )}
        </Space>

        {loi && <Alert type="error" showIcon message={loi} />}

        <Card style={{ maxWidth: 520 }}>{hienNoiDung()}</Card>

        <Text type="secondary">
          Phiên đăng nhập được lưu lại, khởi động lại hệ thống không cần quét lại.
        </Text>
      </Space>
    </BoCucChinh>
  );
}
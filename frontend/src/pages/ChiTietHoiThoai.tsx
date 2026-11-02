import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Input,
  Typography,
  Alert,
  Spin,
  Avatar,
  Space,
  Empty,
  Select,
  Card,
  List,
  message,
  Modal,
  Row,
  Col,
} from 'antd';
import { SendOutlined, UserOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import { BoCucChinh } from '../components/BoCucChinh';
import {
  layLichSuTinNhan,
  guiTinNhan,
  layHoiThoai,
  doiTrangThai,
  ganNguoiPhuTrach,
  ganNhan,
  goNhan,
  layDanhSachGhiChu,
  themGhiChu,
} from '../api/hoiThoai';
import { layDanhSachNhanVien } from '../api/nguoiDung';
import { layDanhSachNhan, taoNhan } from '../api/nhan';
import { useAuth } from '../context/AuthContext';
import type {
  TinNhan,
  HoiThoai,
  NhanVien,
  Nhan,
  GhiChuNoiBo,
  TrangThaiHoiThoai,
} from '../api/types';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TUY_CHON_TRANG_THAI: { value: TrangThaiHoiThoai; label: string }[] = [
  { value: 'moi', label: 'Mới' },
  { value: 'dang_xu_ly', label: 'Đang xử lý' },
  { value: 'da_xong', label: 'Đã xong' },
];

const CHU_KY_LAM_MOI_MS = 5000;

export function ChiTietHoiThoai() {
  const { id } = useParams<{ id: string }>();
  const { nguoiDung: nguoiDungHienTai } = useAuth();

  const [tinNhans, setTinNhans] = useState<TinNhan[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [noiDung, setNoiDung] = useState('');
  const [dangGui, setDangGui] = useState(false);
  const cuoiDanhSachRef = useRef<HTMLDivElement>(null);

  const [hoiThoai, setHoiThoai] = useState<HoiThoai | null>(null);
  const [nhanVienList, setNhanVienList] = useState<NhanVien[]>([]);
  const [nhanList, setNhanList] = useState<Nhan[]>([]);
  const [ghiChuList, setGhiChuList] = useState<GhiChuNoiBo[]>([]);
  const [ghiChuMoi, setGhiChuMoi] = useState('');
  const [dangGuiGhiChu, setDangGuiGhiChu] = useState(false);

  const [moModalNhan, setMoModalNhan] = useState(false);
  const [tenNhanMoi, setTenNhanMoi] = useState('');
  const [dangTaoNhan, setDangTaoNhan] = useState(false);

  const laAdmin = nguoiDungHienTai?.vaiTro === 'quan_tri';
  const coQuyenChinhSua =
    laAdmin ||
    (!!hoiThoai && hoiThoai.nguoiPhuTrachId === nguoiDungHienTai?.id);

  useEffect(() => {
    if (id) {
      taiLichSu(id);
      taiHoiThoai(id);
      taiGhiChu(id);
    }
  }, [id]);

  // Polling: tự động lấy tin nhắn mới mỗi vài giây (chưa có WebSocket).
  useEffect(() => {
    if (!id) return;
    const bo = setInterval(() => {
      lamMoiTinNhanNgam(id);
    }, CHU_KY_LAM_MOI_MS);
    return () => clearInterval(bo);
  }, [id]);

  useEffect(() => {
    layDanhSachNhan().then(setNhanList).catch(() => undefined);
    if (laAdmin) {
      layDanhSachNhanVien().then(setNhanVienList).catch(() => undefined);
    }
  }, [laAdmin]);

  useEffect(() => {
    cuoiDanhSachRef.current?.scrollIntoView({ behavior: 'auto' });
  }, [tinNhans]);

  async function taiLichSu(hoiThoaiId: string) {
    setDangTai(true);
    setLoi(null);
    try {
      const data = await layLichSuTinNhan(hoiThoaiId);
      setTinNhans(data);
    } catch (err: any) {
      setLoi(
        err?.response?.data?.message ||
          'Không tải được lịch sử tin nhắn. Vui lòng thử lại.',
      );
    } finally {
      setDangTai(false);
    }
  }

  // Làm mới ngầm, không bật spinner, không hiện lỗi (tránh làm phiền người dùng).
  async function lamMoiTinNhanNgam(hoiThoaiId: string) {
    try {
      const data = await layLichSuTinNhan(hoiThoaiId);
      setTinNhans((truoc) => {
        const cuoiCu = truoc[truoc.length - 1]?.id;
        const cuoiMoi = data[data.length - 1]?.id;
        if (truoc.length === data.length && cuoiCu === cuoiMoi) {
          return truoc;
        }
        return data;
      });
    } catch {
      // bỏ qua lỗi polling ngầm
    }
  }

  // Không chặn luồng chat nếu phần thông tin hội thoại lỗi, nhưng vẫn phải
  // báo cho người dùng biết thay vì nuốt lỗi âm thầm.
  async function taiHoiThoai(hoiThoaiId: string) {
    try {
      const data = await layHoiThoai(hoiThoaiId);
      setHoiThoai(data);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
          'Không tải được thông tin hội thoại (trạng thái, người phụ trách, nhãn).',
      );
    }
  }

  async function taiGhiChu(hoiThoaiId: string) {
    try {
      const data = await layDanhSachGhiChu(hoiThoaiId);
      setGhiChuList(data);
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || 'Không tải được ghi chú nội bộ.',
      );
    }
  }

  async function xuLyGui() {
    if (!id || !noiDung.trim()) return;
    setDangGui(true);
    try {
      const tinNhanMoi = await guiTinNhan(id, noiDung.trim());
      setTinNhans((truoc) => [...truoc, tinNhanMoi]);
      setNoiDung('');
    } catch (err: any) {
      message.error(
        err?.response?.data?.message ||
          'Gửi tin nhắn thất bại. Vui lòng thử lại.',
      );
    } finally {
      setDangGui(false);
    }
  }

  function xuLyPhim(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      xuLyGui();
    }
  }

  async function xuLyDoiTrangThai(gia: TrangThaiHoiThoai) {
    if (!id) return;
    try {
      const ketQua = await doiTrangThai(id, gia);
      setHoiThoai(ketQua);
      message.success('Đã cập nhật trạng thái');
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || 'Cập nhật trạng thái thất bại',
      );
    }
  }

  async function xuLyDoiNguoiPhuTrach(nguoiPhuTrachId: string) {
    if (!id) return;
    try {
      const ketQua = await ganNguoiPhuTrach(id, nguoiPhuTrachId);
      setHoiThoai(ketQua);
      message.success('Đã gán người phụ trách');
    } catch (err: any) {
      message.error(
        err?.response?.data?.message || 'Gán người phụ trách thất bại',
      );
    }
  }

  async function xuLyDoiNhan(dsIdMoi: string[]) {
    if (!id || !hoiThoai) return;
    const dsIdCu = (hoiThoai.danhSachNhan ?? []).map((n) => n.id);
    const themVao = dsIdMoi.filter((nid) => !dsIdCu.includes(nid));
    const boRa = dsIdCu.filter((nid) => !dsIdMoi.includes(nid));
    try {
      // Gán nhãn mới và gỡ nhãn cũ song song (không phụ thuộc nhau), thay vì
      // await tuần tự từng nhãn một — sau đó tải lại hội thoại 1 lần để lấy
      // đúng trạng thái danh sách nhãn cuối cùng từ server.
      await Promise.all([
        ...themVao.map((nhanId) => ganNhan(id, nhanId)),
        ...boRa.map((nhanId) => goNhan(id, nhanId)),
      ]);
      await taiHoiThoai(id);
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Cập nhật nhãn thất bại');
      taiHoiThoai(id);
    }
  }

  async function xuLyThemGhiChu() {
    if (!id || !ghiChuMoi.trim()) return;
    setDangGuiGhiChu(true);
    try {
      const moi = await themGhiChu(id, ghiChuMoi.trim());
      setGhiChuList((truoc) => [...truoc, moi]);
      setGhiChuMoi('');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Thêm ghi chú thất bại');
    } finally {
      setDangGuiGhiChu(false);
    }
  }

  async function xuLyTaoNhan() {
    if (!tenNhanMoi.trim()) return;
    setDangTaoNhan(true);
    try {
      const moi = await taoNhan(tenNhanMoi.trim());
      setNhanList((truoc) => [...truoc, moi]);
      setTenNhanMoi('');
      setMoModalNhan(false);
      message.success('Đã tạo nhãn mới');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Tạo nhãn thất bại');
    } finally {
      setDangTaoNhan(false);
    }
  }

  return (
    <BoCucChinh>
      <Title level={4} style={{ marginBottom: 16 }}>
        Chi tiết hội thoại
      </Title>

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

      <Row gutter={[16, 16]}>
        <Col xs={24} md={16} lg={17}>
          <div
            style={{
              background: '#fff',
              border: '1px solid #f0f0f0',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              height: 'calc(100vh - 220px)',
            }}
          >
            <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
              {dangTai ? (
                <div style={{ textAlign: 'center', paddingTop: 48 }}>
                  <Spin />
                </div>
              ) : tinNhans.length === 0 ? (
                <Empty
                  description="Chưa có tin nhắn nào trong hội thoại này"
                  style={{ paddingTop: 48 }}
                />
              ) : (
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  {tinNhans.map((tn) => {
                    const laNhanVien = tn.loaiNguoiGui === 'nhan_vien';
                    return (
                      <div
                        key={tn.id}
                        style={{
                          display: 'flex',
                          justifyContent: laNhanVien ? 'flex-end' : 'flex-start',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            maxWidth: '70%',
                            flexDirection: laNhanVien ? 'row-reverse' : 'row',
                          }}
                        >
                          <Avatar
                            size="small"
                            icon={
                              laNhanVien ? <UserOutlined /> : <CustomerServiceOutlined />
                            }
                          />
                          <div>
                            <div
                              style={{
                                background: laNhanVien ? '#1677ff' : '#f0f0f0',
                                color: laNhanVien ? '#fff' : 'rgba(0,0,0,0.88)',
                                padding: '8px 12px',
                                borderRadius: 8,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                              }}
                            >
                              {tn.noiDung}
                            </div>
                            <Text
                              type="secondary"
                              style={{
                                fontSize: 12,
                                display: 'block',
                                marginTop: 2,
                                textAlign: laNhanVien ? 'right' : 'left',
                              }}
                            >
                              {dayjs(tn.ngayTao).format('HH:mm DD/MM')}
                              {tn.trangThai === 'loi' && ' · Gửi thất bại'}
                            </Text>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={cuoiDanhSachRef} />
                </Space>
              )}
            </div>

            <div
              style={{
                borderTop: '1px solid #f0f0f0',
                padding: 12,
                display: 'flex',
                gap: 8,
                alignItems: 'flex-end',
              }}
            >
              <TextArea
                value={noiDung}
                onChange={(e) => setNoiDung(e.target.value)}
                onKeyDown={xuLyPhim}
                placeholder="Nhập nội dung trả lời khách... (Enter để gửi, Shift+Enter xuống dòng)"
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={dangGui}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={xuLyGui}
                loading={dangGui}
                disabled={!noiDung.trim()}
              >
                Gửi
              </Button>
            </div>
          </div>
        </Col>

        <Col xs={24} md={8} lg={7}>
          <Card size="small" title="Thông tin hội thoại" style={{ marginBottom: 12 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Trạng thái
                </Text>
                <Select
                  style={{ width: '100%' }}
                  value={hoiThoai?.trangThai}
                  options={TUY_CHON_TRANG_THAI}
                  onChange={xuLyDoiTrangThai}
                  disabled={!hoiThoai || !coQuyenChinhSua}
                />
              </div>

              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Người phụ trách
                </Text>
                {laAdmin ? (
                  <Select
                    style={{ width: '100%' }}
                    value={hoiThoai?.nguoiPhuTrachId ?? undefined}
                    placeholder="Chưa gán"
                    options={nhanVienList.map((nv) => ({
                      value: nv.id,
                      label: nv.hoTen,
                    }))}
                    onChange={xuLyDoiNguoiPhuTrach}
                    disabled={!hoiThoai}
                  />
                ) : (
                  <Text>
                    {hoiThoai?.nguoiPhuTrachId ? 'Đã có người phụ trách' : 'Chưa gán'}
                  </Text>
                )}
              </div>

              <div>
                <Text type="secondary" style={{ display: 'block', marginBottom: 4 }}>
                  Nhãn
                </Text>
                <Select
                  mode="multiple"
                  style={{ width: '100%' }}
                  value={(hoiThoai?.danhSachNhan ?? []).map((n) => n.id)}
                  options={nhanList.map((n) => ({ value: n.id, label: n.ten }))}
                  onChange={xuLyDoiNhan}
                  disabled={!hoiThoai || !coQuyenChinhSua}
                  placeholder="Chưa có nhãn"
                />
                {laAdmin && (
                  <Button
                    type="link"
                    size="small"
                    style={{ paddingLeft: 0 }}
                    onClick={() => setMoModalNhan(true)}
                  >
                    + Thêm nhãn mới
                  </Button>
                )}
              </div>
            </Space>
          </Card>

          <Card size="small" title="Ghi chú nội bộ">
            <div style={{ maxHeight: 240, overflowY: 'auto', marginBottom: 12 }}>
              {ghiChuList.length === 0 ? (
                <Text type="secondary">Chưa có ghi chú nào</Text>
              ) : (
                <List
                  size="small"
                  dataSource={ghiChuList}
                  renderItem={(gc) => (
                    <List.Item style={{ display: 'block', padding: '8px 0' }}>
                      <Text style={{ display: 'block' }}>{gc.noiDung}</Text>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {gc.nguoiDung?.hoTen ?? 'Nhân viên'} ·{' '}
                        {dayjs(gc.ngayTao).format('HH:mm DD/MM')}
                      </Text>
                    </List.Item>
                  )}
                />
              )}
            </div>
            {coQuyenChinhSua && (
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={ghiChuMoi}
                  onChange={(e) => setGhiChuMoi(e.target.value)}
                  placeholder="Thêm ghi chú nội bộ..."
                  autoSize={{ minRows: 1, maxRows: 3 }}
                  disabled={dangGuiGhiChu}
                />
                <Button
                  type="primary"
                  onClick={xuLyThemGhiChu}
                  loading={dangGuiGhiChu}
                  disabled={!ghiChuMoi.trim()}
                >
                  Thêm
                </Button>
              </Space.Compact>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="Thêm nhãn mới"
        open={moModalNhan}
        onCancel={() => setMoModalNhan(false)}
        onOk={xuLyTaoNhan}
        confirmLoading={dangTaoNhan}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Input
          value={tenNhanMoi}
          onChange={(e) => setTenNhanMoi(e.target.value)}
          placeholder="Tên nhãn, ví dụ: Khiếu nại"
          onPressEnter={xuLyTaoNhan}
        />
      </Modal>
    </BoCucChinh>
  );
}
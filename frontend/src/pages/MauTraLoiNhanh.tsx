import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Typography,
  Space,
  Alert,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { BoCucChinh } from '../components/BoCucChinh';
import { layDanhSachMau, taoMau, suaMau, xoaMau } from '../api/mauTraLoiNhanh';
import type { MauTraLoiNhanh } from '../api/types';

const { Title } = Typography;
const { TextArea } = Input;

export function MauTraLoiNhanhTrang() {
  const [danhSach, setDanhSach] = useState<MauTraLoiNhanh[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);

  const [moModal, setMoModal] = useState(false);
  const [dangSuaId, setDangSuaId] = useState<string | null>(null);
  const [dangLuu, setDangLuu] = useState(false);
  const [form] = Form.useForm<{ tieuDe: string; noiDung: string }>();

  useEffect(() => {
    taiDanhSach();
  }, []);

  async function taiDanhSach() {
    setDangTai(true);
    setLoi(null);
    try {
      const data = await layDanhSachMau();
      setDanhSach(data);
    } catch (err: any) {
      setLoi(
        err?.response?.data?.message ||
          'Không tải được danh sách mẫu trả lời. Vui lòng thử lại.',
      );
    } finally {
      setDangTai(false);
    }
  }

  function moModalThem() {
    setDangSuaId(null);
    form.resetFields();
    setMoModal(true);
  }

  function moModalSua(mau: MauTraLoiNhanh) {
    setDangSuaId(mau.id);
    form.setFieldsValue({ tieuDe: mau.tieuDe, noiDung: mau.noiDung });
    setMoModal(true);
  }

  async function xuLyLuu() {
    try {
      const values = await form.validateFields();
      setDangLuu(true);
      if (dangSuaId) {
        const moi = await suaMau(dangSuaId, values.tieuDe, values.noiDung);
        setDanhSach((truoc) => truoc.map((m) => (m.id === moi.id ? moi : m)));
        message.success('Đã cập nhật mẫu trả lời');
      } else {
        const moi = await taoMau(values.tieuDe, values.noiDung);
        setDanhSach((truoc) => [...truoc, moi]);
        message.success('Đã thêm mẫu trả lời');
      }
      setMoModal(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Lưu mẫu trả lời thất bại');
    } finally {
      setDangLuu(false);
    }
  }

  async function xuLyXoa(id: string) {
    try {
      await xoaMau(id);
      setDanhSach((truoc) => truoc.filter((m) => m.id !== id));
      message.success('Đã xóa mẫu trả lời');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xóa mẫu trả lời thất bại');
    }
  }

  const columns = [
    { title: 'Tiêu đề', dataIndex: 'tieuDe', key: 'tieuDe', width: 220 },
    {
      title: 'Nội dung',
      dataIndex: 'noiDung',
      key: 'noiDung',
      render: (noiDung: string) => (
        <span style={{ whiteSpace: 'pre-wrap' }}>{noiDung}</span>
      ),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 140,
      render: (_: unknown, record: MauTraLoiNhanh) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => moModalSua(record)} />
          <Popconfirm
            title="Xóa mẫu trả lời này?"
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={() => xuLyXoa(record.id)}
          >
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
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
          Mẫu trả lời nhanh
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={moModalThem}>
          Thêm mẫu mới
        </Button>
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
        rowKey="id"
        loading={dangTai}
        columns={columns}
        dataSource={danhSach}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title={dangSuaId ? 'Sửa mẫu trả lời' : 'Thêm mẫu trả lời mới'}
        open={moModal}
        onCancel={() => setMoModal(false)}
        onOk={xuLyLuu}
        confirmLoading={dangLuu}
        okText="Lưu"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Tiêu đề"
            name="tieuDe"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}
          >
            <Input placeholder="Ví dụ: Chào khách mới" />
          </Form.Item>
          <Form.Item
            label="Nội dung"
            name="noiDung"
            rules={[{ required: true, message: 'Vui lòng nhập nội dung' }]}
          >
            <TextArea rows={4} placeholder="Nội dung tin nhắn mẫu..." />
          </Form.Item>
        </Form>
      </Modal>
    </BoCucChinh>
  );
}
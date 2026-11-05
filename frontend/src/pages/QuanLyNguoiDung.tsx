import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  Popconfirm,
  message,
  Typography,
  Alert,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { BoCucChinh } from '../components/BoCucChinh';
import { useAuth } from '../context/AuthContext';
import {
  layDanhSachNhanVien,
  taoNguoiDung,
  capNhatNguoiDung,
  xoaNguoiDung,
} from '../api/nguoiDung';
import type { NhanVien } from '../api/types';

const { Title } = Typography;

interface FormTao {
  hoTen: string;
  email: string;
  matKhau: string;
  vaiTro: 'quan_tri' | 'nhan_vien';
}

export function QuanLyNguoiDung() {
  const { nguoiDung } = useAuth();
  const [danhSach, setDanhSach] = useState<NhanVien[]>([]);
  const [dangTai, setDangTai] = useState(true);
  const [loi, setLoi] = useState<string | null>(null);
  const [moModal, setMoModal] = useState(false);
  const [dangLuu, setDangLuu] = useState(false);
  const [form] = Form.useForm<FormTao>();

  const laAdmin = nguoiDung?.vaiTro === 'quan_tri';

  useEffect(() => {
    taiDanhSach();
  }, []);

  async function taiDanhSach() {
    setDangTai(true);
    setLoi(null);
    try {
      setDanhSach(await layDanhSachNhanVien());
    } catch (err: any) {
      setLoi(err?.response?.data?.message || 'Không tải được danh sách người dùng.');
    } finally {
      setDangTai(false);
    }
  }

  function capNhatTrongDanhSach(moi: NhanVien) {
    setDanhSach((truoc) => truoc.map((nd) => (nd.id === moi.id ? moi : nd)));
  }

  async function xuLyTao() {
    try {
      const values = await form.validateFields();
      setDangLuu(true);
      const moi = await taoNguoiDung(values);
      setDanhSach((truoc) => [...truoc, moi]);
      message.success('Đã thêm người dùng');
      setMoModal(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.response?.data?.message || 'Thêm người dùng thất bại');
    } finally {
      setDangLuu(false);
    }
  }

  async function doiVaiTro(nd: NhanVien, vaiTro: 'quan_tri' | 'nhan_vien') {
    try {
      capNhatTrongDanhSach(await capNhatNguoiDung(nd.id, { vaiTro }));
      message.success('Đã đổi vai trò');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Đổi vai trò thất bại');
    }
  }

  async function xoa(nd: NhanVien) {
    try {
      await xoaNguoiDung(nd.id);
      setDanhSach((truoc) => truoc.filter((x) => x.id !== nd.id));
      message.success('Đã xoá tài khoản');
    } catch (err: any) {
      message.error(err?.response?.data?.message || 'Xoá tài khoản thất bại');
    }
  }

  const columns = [
    { title: 'Họ tên', dataIndex: 'hoTen', key: 'hoTen' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Vai trò',
      dataIndex: 'vaiTro',
      key: 'vaiTro',
      width: 180,
      render: (vaiTro: string, record: NhanVien) => (
        <Select
          size="small"
          value={vaiTro}
          style={{ width: 150 }}
          disabled={record.id === nguoiDung?.id}
          onChange={(v) => doiVaiTro(record, v as 'quan_tri' | 'nhan_vien')}
          options={[
            { value: 'quan_tri', label: 'Quản trị viên' },
            { value: 'nhan_vien', label: 'Nhân viên' },
          ]}
        />
      ),
    },
    {
      title: 'Hành động',
      key: 'hanhDong',
      width: 140,
      render: (_: unknown, record: NhanVien) => {
        if (record.id === nguoiDung?.id) return null;
        return (
          <Popconfirm
            title="Xoá tài khoản này?"
            description="Hội thoại đang giao cho người này sẽ về trạng thái chưa phân công."
            okText="Xoá"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
            onConfirm={() => xoa(record)}
          >
            <Button size="small" danger icon={<DeleteOutlined />}>
              Xoá
            </Button>
          </Popconfirm>
        );
      },
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
          Quản lý người dùng
        </Title>
        {laAdmin && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ vaiTro: 'nhan_vien' });
              setMoModal(true);
            }}
          >
            Thêm người dùng
          </Button>
        )}
      </div>

      {!laAdmin && (
        <Alert
          type="warning"
          showIcon
          message="Chỉ quản trị viên được thêm hoặc thay đổi người dùng."
          style={{ marginBottom: 16 }}
        />
      )}
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
        columns={laAdmin ? columns : columns.filter((c) => c.key !== 'hanhDong')}
        dataSource={danhSach}
        pagination={{ pageSize: 10, hideOnSinglePage: true }}
      />

      <Modal
        title="Thêm người dùng"
        open={moModal}
        onCancel={() => setMoModal(false)}
        onOk={xuLyTao}
        confirmLoading={dangLuu}
        okText="Tạo"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Họ tên"
            name="hoTen"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Mật khẩu"
            name="matKhau"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu' },
              { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label="Vai trò" name="vaiTro" rules={[{ required: true }]}>
            <Select
              options={[
                { value: 'nhan_vien', label: 'Nhân viên' },
                { value: 'quan_tri', label: 'Quản trị viên' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </BoCucChinh>
  );
}

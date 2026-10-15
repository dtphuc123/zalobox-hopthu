import React, { useState } from 'react';
import { Button, Card, Form, Input, Typography, Alert, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { dangNhap as dangNhapApi } from '../api/auth';
import { useAuth } from '../context/AuthContext';

const { Title, Text } = Typography;

interface FormValues {
  email: string;
  matKhau: string;
}

export function DangNhap() {
  const { dangNhap } = useAuth();
  const navigate = useNavigate();
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState<string | null>(null);

  async function xuLySubmit(values: FormValues) {
    setLoi(null);
    setDangTai(true);
    try {
      const ketQua = await dangNhapApi(values.email, values.matKhau);
      dangNhap(ketQua.accessToken, ketQua.nguoiDung);
      message.success(`Chào mừng trở lại, ${ketQua.nguoiDung.hoTen}!`);
      navigate('/hoi-thoai', { replace: true });
    } catch (err: any) {
      const thongBao =
        err?.response?.data?.message ||
        'Email hoặc mật khẩu không đúng. Vui lòng thử lại.';
      setLoi(Array.isArray(thongBao) ? thongBao.join(', ') : thongBao);
    } finally {
      setDangTai(false);
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f5f5f5',
      }}
    >
      <Card style={{ width: 380 }} styles={{ body: { padding: 32 } }}>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          ZaloBox Hộp Thư
        </Title>
        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
        >
          Đăng nhập để tiếp tục
        </Text>

        {loi && (
          <Alert
            type="error"
            message={loi}
            style={{ marginBottom: 16 }}
            showIcon
            closable
            onClose={() => setLoi(null)}
          />
        )}

        <Form layout="vertical" onFinish={xuLySubmit} disabled={dangTai}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Vui lòng nhập email' },
              { type: 'email', message: 'Email không hợp lệ' },
            ]}
          >
            <Input placeholder="ban@congty.com" autoComplete="username" />
          </Form.Item>

          <Form.Item
            label="Mật khẩu"
            name="matKhau"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
          >
            <Input.Password
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block loading={dangTai}>
              Đăng nhập
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
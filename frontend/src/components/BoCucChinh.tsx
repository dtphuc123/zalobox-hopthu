import React, { PropsWithChildren, useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, Typography, message } from 'antd';
import {
  MessageOutlined,
  UserOutlined,
  LogoutOutlined,
  FileTextOutlined,
  BarChartOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

export function BoCucChinh({ children }: PropsWithChildren) {
  const { nguoiDung, dangXuat } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [thuGon, setThuGon] = useState(false);

  const laAdmin = nguoiDung?.vaiTro === 'quan_tri';

  const menuItems = [
    {
      key: '/hoi-thoai',
      icon: <MessageOutlined />,
      label: 'Hội thoại',
    },
    {
      key: '/mau-tra-loi-nhanh',
      icon: <FileTextOutlined />,
      label: 'Mẫu trả lời nhanh',
    },
    ...(laAdmin
      ? [
          {
            key: '/bao-cao',
            icon: <BarChartOutlined />,
            label: 'Báo cáo hiệu suất',
          },
        ]
      : []),
  ];

  const selectedKey = menuItems.find((item) =>
    location.pathname.startsWith(item.key),
  )?.key;

  function xuLyDangXuat() {
    dangXuat();
    message.success('Đã đăng xuất');
    navigate('/dang-nhap', { replace: true });
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={220}
        collapsedWidth={64}
        collapsible
        collapsed={thuGon}
        onCollapse={setThuGon}
        breakpoint="lg"
        theme="light"
        style={{ borderRight: '1px solid #f0f0f0' }}
      >
        <div
          style={{
            height: 56,
            display: 'flex',
            alignItems: 'center',
            justifyContent: thuGon ? 'center' : 'flex-start',
            paddingLeft: thuGon ? 0 : 20,
            fontWeight: 600,
            fontSize: 16,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
          }}
        >
          {thuGon ? 'ZB' : 'ZaloBox Hộp Thư'}
        </div>
        <Menu
          mode="inline"
          inlineCollapsed={thuGon}
          selectedKeys={selectedKey ? [selectedKey] : []}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            background: '#fff',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            padding: '0 24px',
          }}
        >
          <Dropdown
            menu={{
              items: [
                {
                  key: 'dang-xuat',
                  icon: <LogoutOutlined />,
                  label: 'Đăng xuất',
                  onClick: xuLyDangXuat,
                },
              ],
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} size="small" />
              <Text>{nguoiDung?.hoTen ?? 'Người dùng'}</Text>
            </div>
          </Dropdown>
        </Header>
        <Content style={{ padding: 24, background: '#fafafa' }}>{children}</Content>
      </Layout>
    </Layout>
  );
}
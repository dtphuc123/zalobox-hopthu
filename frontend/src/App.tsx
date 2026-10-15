import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, message } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider } from './context/AuthContext';
import { RouteRiengTu } from './components/RouteRiengTu';
import { DangNhap } from './pages/DangNhap';
import { DanhSachHoiThoai } from './pages/DanhSachHoiThoai';
import { ChiTietHoiThoai } from './pages/ChiTietHoiThoai';
import { MauTraLoiNhanhTrang } from './pages/MauTraLoiNhanh';
import { BaoCaoHieuSuat } from './pages/BaoCaoHieuSuat';

export function App() {
  useEffect(() => {
    message.config({ top: 64, duration: 2.5, maxCount: 3 });
  }, []);

  return (
    <ConfigProvider locale={viVN} theme={{ token: { colorPrimary: '#1677ff' } }}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/dang-nhap" element={<DangNhap />} />
            <Route
              path="/hoi-thoai"
              element={
                <RouteRiengTu>
                  <DanhSachHoiThoai />
                </RouteRiengTu>
              }
            />
            <Route
              path="/hoi-thoai/:id"
              element={
                <RouteRiengTu>
                  <ChiTietHoiThoai />
                </RouteRiengTu>
              }
            />
            <Route
              path="/mau-tra-loi-nhanh"
              element={
                <RouteRiengTu>
                  <MauTraLoiNhanhTrang />
                </RouteRiengTu>
              }
            />
            <Route
              path="/bao-cao"
              element={
                <RouteRiengTu>
                  <BaoCaoHieuSuat />
                </RouteRiengTu>
              }
            />
            <Route path="*" element={<Navigate to="/hoi-thoai" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ConfigProvider>
  );
}
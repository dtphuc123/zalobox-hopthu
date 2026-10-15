import React, { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Bọc quanh các route cần đăng nhập mới xem được.
export function RouteRiengTu({ children }: PropsWithChildren) {
  const { nguoiDung } = useAuth();
  const coToken = Boolean(localStorage.getItem('token'));

  if (!nguoiDung || !coToken) {
    return <Navigate to="/dang-nhap" replace />;
  }
  return <>{children}</>;
}

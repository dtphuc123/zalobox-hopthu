import React, {
  createContext,
  useContext,
  useMemo,
  useState,
  PropsWithChildren,
} from 'react';
import type { NguoiDung } from '../api/types';

interface AuthContextValue {
  nguoiDung: NguoiDung | null;
  dangNhap: (token: string, nguoiDung: NguoiDung) => void;
  dangXuat: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

function docNguoiDungTuLocalStorage(): NguoiDung | null {
  const raw = localStorage.getItem('nguoiDung');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as NguoiDung;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [nguoiDung, setNguoiDung] = useState<NguoiDung | null>(
    docNguoiDungTuLocalStorage(),
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      nguoiDung,
      dangNhap: (token, nd) => {
        localStorage.setItem('token', token);
        localStorage.setItem('nguoiDung', JSON.stringify(nd));
        setNguoiDung(nd);
      },
      dangXuat: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('nguoiDung');
        setNguoiDung(null);
      },
    }),
    [nguoiDung],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải dùng trong AuthProvider');
  return ctx;
}

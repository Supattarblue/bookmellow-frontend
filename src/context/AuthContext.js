
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  login as loginAPI,
  register as registerAPI,
  getMe,
} from '../api/backend';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ตรวจสอบ Token เมื่อเปิดเว็บไซต์
  useEffect(() => {
    async function checkLogin() {
      const token = localStorage.getItem('bookmellow_token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const result = await getMe();
        setUser(result.user);
      } catch (error) {
        localStorage.removeItem('bookmellow_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    checkLogin();
  }, []);

  // เข้าสู่ระบบ
  async function login(email, password) {
    const result = await loginAPI(email, password);

    localStorage.setItem('bookmellow_token', result.token);
    setUser(result.user);

    return result;
  }

  // สมัครสมาชิก
  async function register(username, email, password) {
    return registerAPI(username, email, password);
  }

  // ออกจากระบบ
  function logout() {
    localStorage.removeItem('bookmellow_token');
    setUser(null);
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: Boolean(user),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// เรียกใช้ข้อมูลสมาชิกจากหน้าอื่น
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth ต้องใช้งานภายใน AuthProvider'
    );
  }

  return context;
}

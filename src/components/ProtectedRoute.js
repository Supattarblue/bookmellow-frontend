import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // รอตรวจสอบ Token ก่อน
  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-autumn-brown">
          กำลังตรวจสอบข้อมูลสมาชิก...
        </p>
      </div>
    );
  }

  // ยังไม่ได้เข้าสู่ระบบ
  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  // เข้าสู่ระบบแล้ว แต่ไม่มีสิทธิ์เข้าถึง
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/403" replace />;
  }

  return children;
}

export default ProtectedRoute;
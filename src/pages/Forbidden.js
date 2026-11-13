import { Link } from 'react-router-dom';

function Forbidden() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <p className="text-8xl font-bold text-autumn-copper">
        403
      </p>

      <h1 className="mt-4 text-2xl font-semibold text-autumn-chestnut">
        ไม่มีสิทธิ์เข้าถึงหน้านี้
      </h1>

      <p className="mt-3 max-w-md leading-7 text-autumn-brown">
        บัญชีของคุณไม่มีสิทธิ์เข้าถึงส่วนผู้ดูแลระบบ
        กรุณาติดต่อผู้ดูแลระบบหากคิดว่านี่เป็นข้อผิดพลาด
      </p>

      <Link
        to="/"
        className="mt-7 rounded-full bg-autumn-chestnut px-7 py-3 font-medium text-white transition hover:bg-autumn-copper"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}

export default Forbidden;

import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api/backend';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('ไม่พบรหัสยืนยัน กรุณาเปิดลิงก์จากอีเมลอีกครั้ง');
      return;
    }

    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);

      const result = await resetPassword(token, password);

      setMessage(result?.message || 'เปลี่ยนรหัสผ่านสำเร็จแล้ว');

      setPassword('');
      setConfirmPassword('');

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(
        err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้ ลิงก์อาจหมดอายุแล้ว'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-autumn-beige bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm tracking-widest text-autumn-copper">
            CREATE NEW PASSWORD
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut">
            ตั้งรหัสผ่านใหม่
          </h1>

          <p className="mt-3 text-sm text-autumn-brown">
            กรุณากำหนดรหัสผ่านใหม่สำหรับบัญชี BookMellow ของคุณ
          </p>
        </div>

        {!token ? (
          <div className="space-y-5">
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              ไม่พบรหัสยืนยัน กรุณาเปิดลิงก์จากอีเมลอีกครั้ง
            </p>

            <Link
              to="/forgot-password"
              className="block text-center text-sm font-medium text-autumn-copper hover:underline"
            >
              ขอ 링크รีเซ็ตรหัสผ่านใหม่
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
                รหัสผ่านใหม่
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
                ยืนยันรหัสผ่านใหม่
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="กรอกรหัสผ่านอีกครั้ง"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
              />
            </div>

            {error && (
              <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            {message && (
              <p className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !!message}
              className="w-full rounded-full bg-autumn-chestnut py-3 font-medium text-white transition hover:bg-autumn-brown disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'กำลังเปลี่ยนรหัสผ่าน...' : 'ยืนยันรหัสผ่านใหม่'}
            </button>
          </form>
        )}

        <div className="mt-7 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-autumn-copper transition hover:underline"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ResetPassword;

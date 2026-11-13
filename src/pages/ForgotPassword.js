
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { forgotPassword } from '../api/backend';

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim()) {
      setError('กรุณากรอกอีเมลสมาชิก');
      return;
    }

    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (password !== confirmPassword) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    try {
      setLoading(true);

      await forgotPassword(email.trim(), password);

      alert('เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message || 'ไม่สามารถเปลี่ยนรหัสผ่านได้');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-autumn-beige bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm tracking-widest text-autumn-copper">
            PASSWORD RECOVERY
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut">
            เปลี่ยนรหัสผ่าน
          </h1>

          <p className="mt-3 text-sm leading-6 text-autumn-brown">
            กรอกอีเมลสมาชิกและกำหนดรหัสผ่านใหม่ของคุณ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              อีเมลสมาชิก
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none focus:border-autumn-copper"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              รหัสผ่านใหม่
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none focus:border-autumn-copper"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              ยืนยันรหัสผ่านใหม่
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none focus:border-autumn-copper"
            />
          </div>

          {error && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-autumn-chestnut py-3 font-medium text-white transition hover:bg-autumn-brown disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'กำลังบันทึก...' : 'บันทึกรหัสผ่านใหม่'}
          </button>
        </form>

        <div className="mt-7 text-center">
          <Link
            to="/login"
            className="text-sm font-medium text-autumn-copper hover:underline"
          >
            ← กลับไปหน้าเข้าสู่ระบบ
          </Link>
        </div>
      </div>
    </section>
  );
}

export default ForgotPassword;

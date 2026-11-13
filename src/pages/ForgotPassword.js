
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../api/backend';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage('');
    setError('');

    if (!email.trim()) {
      setError('กรุณากรอกอีเมล');
      return;
    }

    try {
      setLoading(true);
      const result = await forgotPassword(email.trim());
      setMessage(result?.message || 'หากอีเมลนี้ลงทะเบียนไว้ ระบบจะส่งลิงก์รีเซ็ตรหัสผ่านให้');
    } catch (err) {
      setError(err.message || 'ไม่สามารถดำเนินการได้ กรุณาลองอีกครั้ง');
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
            ลืมรหัสผ่าน?
          </h1>

          <p className="mt-3 text-sm text-autumn-brown">
            กรอกอีเมลที่ใช้สมัครสมาชิก
            แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              อีเมล
            </label>

            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="กรอกอีเมลของคุณ"
              autoComplete="email"
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
            disabled={loading}
            className="w-full rounded-full bg-autumn-chestnut py-3 font-medium text-white transition hover:bg-autumn-brown disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'กำลังส่งคำขอ...' : 'ส่งลิงก์รีเซ็ตรหัสผ่าน'}
          </button>
        </form>

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

export default ForgotPassword;

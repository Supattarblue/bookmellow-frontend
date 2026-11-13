
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('กรุณากรอกอีเมลและรหัสผ่าน');
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'เข้าสู่ระบบไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-autumn-beige bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm tracking-widest text-autumn-copper">
            WELCOME BACK
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut">
            ยินดีต้อนรับกลับมา
          </h1>

          <p className="mt-3 text-sm text-autumn-brown">
            เข้าสู่ระบบเพื่อค้นพบหนังสือเล่มโปรดของคุณ
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
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              รหัสผ่าน
            </label>

            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="กรอกรหัสผ่าน"
              autoComplete="current-password"
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
            />

            <div className="mt-2 text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-autumn-copper transition hover:underline"
              >
                ลืมรหัสผ่าน?
              </Link>
            </div>
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
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-autumn-brown">
          ยังไม่มีบัญชีสมาชิกใช่ไหม?{' '}
          <Link
            to="/register"
            className="font-semibold text-autumn-copper hover:underline"
          >
            สมัครสมาชิก
          </Link>
        </p>

        <div className="mt-5 text-center">
          <Link
            to="/"
            className="text-sm text-autumn-brown transition hover:text-autumn-copper"
          >
            ← กลับหน้าหลัก
          </Link>
        </div>
      </div>
    </section>
  );
}

export default Login;

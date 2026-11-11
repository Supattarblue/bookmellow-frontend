
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setError('กรุณากรอกข้อมูลให้ครบทุกช่อง');
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

      await register(username.trim(), email.trim(), password);

      navigate('/login', {
        state: { message: 'สมัครสมาชิกสำเร็จ กรุณาเข้าสู่ระบบ' },
      });
    } catch (err) {
      setError(err.message || 'สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-6 py-16">
      <div className="w-full max-w-md rounded-3xl border border-autumn-beige bg-white p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <p className="mb-3 text-sm tracking-widest text-autumn-copper">
            JOIN BOOKMELLOW
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut">
            สมัครสมาชิก
          </h1>

          <p className="mt-3 text-sm text-autumn-brown">
            มาเริ่มต้นค้นพบหนังสือเล่มโปรดไปด้วยกัน
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              ชื่อผู้ใช้
            </label>

            <input
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="กรอกชื่อผู้ใช้"
              autoComplete="username"
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
            />
          </div>

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
              placeholder="อย่างน้อย 8 ตัวอักษร"
              autoComplete="new-password"
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-autumn-chestnut">
              ยืนยันรหัสผ่าน
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="กรอกรหัสผ่านอีกครั้ง"
              autoComplete="new-password"
              className="w-full rounded-xl border border-autumn-beige bg-autumn-cream px-4 py-3 outline-none transition focus:border-autumn-copper focus:ring-2 focus:ring-autumn-sand"
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
            {loading ? 'กำลังสมัครสมาชิก...' : 'สมัครสมาชิก'}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-autumn-brown">
          มีบัญชีอยู่แล้ว?{' '}
          <Link
            to="/login"
            className="font-semibold text-autumn-copper hover:underline"
          >
            เข้าสู่ระบบ
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

export default Register;

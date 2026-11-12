
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/backend';

function AdminDashboard() {
  const [stats, setStats] = useState({
    books: 0,
    members: 0,
    admins: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const result = await apiRequest('/api/admin/dashboard');
        setStats(result);
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  const cards = [
    { title: 'หนังสือทั้งหมด', value: stats.books },
    { title: 'สมาชิกทั้งหมด', value: stats.members },
    { title: 'ผู้ดูแลระบบ', value: stats.admins },
  ];

  return (
    <div className="min-h-screen bg-autumn-cream px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-autumn-dark">
              Admin Dashboard
            </h1>
            <p className="text-autumn-brown">
              ภาพรวมและจัดการระบบ BookMellow
            </p>
          </div>

          <Link
            to="/admin/books"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-autumn-dark px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            <span>＋</span>
            จัดการหนังสือ
          </Link>
        </div>

        {loading ? (
          <p>กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl bg-white p-6 shadow-sm"
              >
                <p className="text-autumn-brown">{card.title}</p>
                <p className="mt-2 text-3xl font-bold text-autumn-dark">
                  {card.value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;

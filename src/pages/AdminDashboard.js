
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

  const managementLinks = [
    {
      title: 'จัดการหนังสือ',
      description: 'เพิ่ม แก้ไข และจัดการหนังสือในระบบ',
      path: '/admin/books',
      icon: '📚',
    },
    {
      title: 'จัดการสมาชิก',
      description: 'ดูรายชื่อสมาชิกและเปลี่ยนสิทธิ์เป็น Admin หรือ Member',
      path: '/admin/members',
      icon: '👥',
    },
    {
      title: 'รีวิวทั้งหมด',
      description: 'ตรวจสอบรีวิวและความคิดเห็นของสมาชิกทั้งหมด',
      path: '/admin/reviews',
      icon: '⭐',
    },
  ];

  return (
    <div className="min-h-screen bg-autumn-cream px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-autumn-dark">
            Admin Dashboard
          </h1>
          <p className="text-autumn-brown">
            ภาพรวมและจัดการระบบ BookMellow
          </p>
        </div>

        {loading ? (
          <p className="text-autumn-brown">กำลังโหลดข้อมูล...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : (
          <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

        <div>
          <h2 className="mb-5 text-2xl font-bold text-autumn-dark">
            จัดการระบบ
          </h2>

          <div className="grid gap-5 md:grid-cols-3">
            {managementLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="group rounded-2xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="mb-4 text-4xl">{item.icon}</div>

                <h3 className="mb-2 text-xl font-bold text-autumn-dark transition group-hover:text-autumn-copper">
                  {item.title}
                </h3>

                <p className="mb-5 leading-7 text-autumn-brown">
                  {item.description}
                </p>

                <span className="font-semibold text-autumn-copper">
                  เข้าจัดการ →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

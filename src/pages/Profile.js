
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Profile() {
  const { user } = useAuth();

  return (
    <section className="mx-auto max-w-4xl px-6 py-16">
      <div className="overflow-hidden rounded-3xl border border-autumn-beige bg-white shadow-lg">

        <div className="bg-autumn-chestnut px-8 py-10 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-autumn-cream text-3xl font-semibold text-autumn-chestnut">
            {user?.username?.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-2xl font-semibold text-white">
            โปรไฟล์ของฉัน
          </h1>

          <p className="mt-2 text-sm text-white/80">
            ยินดีต้อนรับสู่ BookMellow
          </p>
        </div>

        <div className="space-y-6 p-8">
          <div>
            <p className="text-sm text-autumn-brown">
              ชื่อผู้ใช้
            </p>
            <p className="mt-1 font-medium text-autumn-chestnut">
              {user?.username}
            </p>
          </div>

          <div>
            <p className="text-sm text-autumn-brown">
              อีเมล
            </p>
            <p className="mt-1 font-medium text-autumn-chestnut">
              {user?.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-autumn-brown">
              ประเภทบัญชี
            </p>
            <p className="mt-1 font-medium text-autumn-chestnut">
              {user?.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิก'}
            </p>
          </div>

          <div className="border-t border-autumn-beige pt-6">
            <Link
              to="/"
              className="inline-block rounded-full bg-autumn-chestnut px-6 py-3 text-white transition hover:bg-autumn-brown"
            >
              กลับหน้าหลัก
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
}

export default Profile;

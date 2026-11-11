
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBooks } from '../api/backend';

function Header() {
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const books = await getBooks();

        const allCategories = [
          ...new Set(
            books.flatMap((book) => book.categories || [])
          ),
        ].sort();

        setCategories(allCategories);
      } catch (error) {
        console.error('ไม่สามารถโหลดหมวดหมู่ได้:', error);
      }
    }

    fetchCategories();
  }, []);

  function handleLogout() {
    setMenuOpen(false);
    logout();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-40 border-b border-autumn-beige bg-autumn-cream/95 backdrop-blur">

      {/* แถบเมนูด้านบน */}
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4">

        <Link
          to="/"
          className="shrink-0 text-2xl font-semibold tracking-wide text-autumn-chestnut"
        >
          BookMellow
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          <Link
            to="/"
            className="transition hover:text-autumn-copper"
          >
            หน้าแรก
          </Link>

          <Link
            to="/books"
            className="transition hover:text-autumn-copper"
          >
            หนังสือทั้งหมด
          </Link>

          <Link
            to="/recommendations"
            className="transition hover:text-autumn-copper"
          >
            หนังสือแนะนำ
          </Link>

          <Link
            to="/my-bookshelf"
            className="transition hover:text-autumn-copper"
          >
            ชั้นหนังสือของฉัน
          </Link>
        </div>

        {/* บัญชีสมาชิก */}
        <div className="relative">
          {!loading && (
            user ? (
              <>
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  aria-expanded={menuOpen}
                  aria-haspopup="true"
                  className="flex items-center gap-2 rounded-full border border-autumn-beige bg-white px-3 py-2 text-autumn-chestnut shadow-sm transition hover:border-autumn-copper hover:bg-autumn-beige/40"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-autumn-beige">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="8" r="4" />
                      <path d="M5 21a7 7 0 0 1 14 0" />
                    </svg>
                  </span>

                  <span className="hidden text-left sm:block">
                    <span className="block text-xs text-autumn-brown">
                      บัญชีของฉัน
                    </span>
                    <span className="block max-w-28 truncate text-sm font-semibold">
                      {user.username}
                    </span>
                  </span>

                  <span className="text-sm">⌄</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-60 overflow-hidden rounded-2xl border border-autumn-beige bg-white py-2 shadow-xl">
                    <div className="border-b border-autumn-beige px-4 py-3">
                      <p className="text-xs text-autumn-brown">
                        เข้าสู่ระบบในชื่อ
                      </p>
                      <p className="mt-1 truncate font-semibold text-autumn-chestnut">
                        {user.username}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 text-sm text-autumn-dark transition hover:bg-autumn-cream"
                    >
                      ดูโปรไฟล์ของฉัน
                    </Link>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block w-full px-4 py-3 text-left text-sm text-red-700 transition hover:bg-red-50"
                    >
                      ออกจากระบบ
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="rounded-full bg-autumn-chestnut px-5 py-2 text-sm text-white transition hover:bg-autumn-brown"
                >
                  เข้าสู่ระบบ
                </Link>

                <Link
                  to="/register"
                  className="hidden rounded-full border border-autumn-chestnut px-5 py-2 text-sm text-autumn-chestnut transition hover:bg-autumn-beige sm:inline-block"
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )
          )}
        </div>
      </nav>

      {/* แถบเมนูด้านล่าง */}
      <div className="border-t border-autumn-beige/80">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-3">

          {/* Dropdown หมวดหมู่ */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setCategoryOpen(!categoryOpen)}
              aria-expanded={categoryOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-full bg-autumn-beige px-5 py-2 text-sm font-medium text-autumn-chestnut transition hover:bg-autumn-sand"
            >
              <span>หมวดหมู่หนังสือ</span>
              <span className="text-xs">
                {categoryOpen ? '▲' : '▼'}
              </span>
            </button>

            {categoryOpen && (
              <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-autumn-beige bg-white p-2 shadow-xl">

                <Link
                  to="/books"
                  onClick={() => setCategoryOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm font-medium text-autumn-chestnut transition hover:bg-autumn-cream"
                >
                  หนังสือทุกหมวดหมู่
                </Link>

                <div className="my-1 border-t border-autumn-beige" />

                {categories.length > 0 ? (
                  categories.map((category) => (
                    <Link
                      key={category}
                      to={`/books?category=${encodeURIComponent(category)}`}
                      onClick={() => setCategoryOpen(false)}
                      className="block rounded-xl px-4 py-3 text-sm text-autumn-dark transition hover:bg-autumn-cream hover:text-autumn-copper"
                    >
                      {category}
                    </Link>
                  ))
                ) : (
                  <p className="px-4 py-3 text-sm text-autumn-brown">
                    กำลังโหลดหมวดหมู่...
                  </p>
                )}
              </div>
            )}
          </div>

          {/* เลือกตามความสนใจ */}
          <Link
            to="/interests"
            className="rounded-full border border-autumn-copper px-5 py-2 text-sm font-medium text-autumn-chestnut transition hover:bg-autumn-beige"
          >
            เลือกตามความสนใจ
          </Link>

        </div>
      </div>
    </header>
  );
}

export default Header;

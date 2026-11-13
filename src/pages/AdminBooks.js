
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

import {
  adminGetBooks,
  adminDeleteBook,
} from '../api/backend';

function normalize(value) {
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function AdminBooks() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [bookSearch, setBookSearch] = useState('');

  const [loading, setLoading] = useState(true);
  const [deletingBookId, setDeletingBookId] = useState(null);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const data = await adminGetBooks();

      const bookList = Array.isArray(data)
        ? data
        : data?.data || data?.books || [];

      setBooks(bookList);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดรายการหนังสือได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const visibleBooks = books.filter(
    (book) => book.is_visible !== false
  );

  const filteredBooks = books.filter((book) => {
    const search = normalize(bookSearch);

    if (!search) return true;

    return (
      normalize(book.title).includes(search) ||
      normalize(book.author).includes(search)
    );
  });

  const busy = loading || deletingBookId !== null;

  async function handleDeleteBook(book) {
    const confirmed = window.confirm(
      `ต้องการลบหนังสือ "${book.title}" ใช่หรือไม่?\n\nการลบนี้จะนำหนังสือออกจากฐานข้อมูล`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');
    setDeletingBookId(book.id);

    try {
      await adminDeleteBook(book.id);

      await loadData();

      setMessage(`ลบหนังสือ "${book.title}" เรียบร้อยแล้ว`);
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบหนังสือได้');
    } finally {
      setDeletingBookId(null);
    }
  }

  function handleEditBook(book) {
    navigate(`/admin/books/edit/${book.id}`);
  }

  function handleAddBook() {
    navigate('/admin/books/add');
  }

  return (
    <div className="min-h-screen bg-autumn-cream px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        {/* Back to Dashboard */}
        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2 font-medium text-autumn-dark shadow-sm transition hover:bg-autumn-cream"
          >
            ← กลับหน้า Dashboard
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-autumn-dark">
              จัดการหนังสือ
            </h1>

            <p className="mt-2 text-autumn-brown">
              จัดการรายการหนังสือทั้งหมดในระบบ BookMellow
            </p>
          </div>

          <button
            type="button"
            onClick={handleAddBook}
            className="rounded-xl bg-autumn-brown px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            ＋ เพิ่มหนังสือ
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-5 rounded-xl bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        {/* Book Statistics */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-autumn-brown">
            หนังสือที่แสดงในระบบ
          </p>

          <p className="mt-1 text-3xl font-bold text-autumn-dark">
            {visibleBooks.length} เล่ม
          </p>

          <p className="mt-1 text-sm text-gray-500">
            หนังสือทั้งหมดในฐานข้อมูล {books.length} เล่ม
          </p>
        </div>

        {/* Book List */}
        <div className="rounded-2xl border border-autumn-brown/20 bg-white p-5 shadow-sm">

          {/* List Header */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-autumn-dark">
                หนังสือในระบบ
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                พบ {filteredBooks.length} รายการ
              </p>
            </div>

            <button
              type="button"
              onClick={loadData}
              disabled={busy}
              className="rounded-lg border border-autumn-brown px-4 py-2 text-sm text-autumn-dark transition hover:bg-autumn-cream disabled:cursor-not-allowed disabled:opacity-50"
            >
              ↻ โหลดรายการใหม่
            </button>
          </div>

          {/* Search */}
          <input
            type="search"
            value={bookSearch}
            onChange={(event) => setBookSearch(event.target.value)}
            placeholder="ค้นหาจากชื่อหนังสือหรือชื่อผู้แต่ง..."
            className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-autumn-brown"
          />

          {/* Loading */}
          {loading && (
            <div className="py-12 text-center text-autumn-brown">
              กำลังโหลดรายการหนังสือ...
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredBooks.length === 0 && (
            <div className="mt-5 rounded-xl bg-autumn-cream/50 p-8 text-center">
              <p className="font-medium text-autumn-dark">
                {books.length === 0
                  ? 'ยังไม่มีหนังสือในระบบ'
                  : 'ไม่พบหนังสือที่ตรงกับคำค้นหา'}
              </p>

              {books.length === 0 && (
                <button
                  type="button"
                  onClick={handleAddBook}
                  className="mt-4 rounded-xl bg-autumn-brown px-5 py-2.5 font-semibold text-white transition hover:opacity-90"
                >
                  ＋ เพิ่มหนังสือเล่มแรก
                </button>
              )}
            </div>
          )}

          {/* Books */}
          {!loading && filteredBooks.length > 0 && (
            <div className="mt-5 space-y-3">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 transition hover:border-autumn-brown/40 sm:flex-row sm:items-center"
                >
                  {/* Book Information */}
                  <div className="flex min-w-0 flex-1 gap-4">
                    {book.cover_url ? (
                      <img
                        src={book.cover_url}
                        alt={book.title}
                        className="h-28 w-20 shrink-0 rounded-lg object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex h-28 w-20 shrink-0 items-center justify-center rounded-lg bg-autumn-cream text-xs text-gray-500">
                        ไม่มีปก
                      </div>
                    )}

                    <div className="min-w-0">
                      <h3 className="break-words font-bold text-autumn-dark">
                        {book.title}
                      </h3>

                      <p className="mt-1 text-sm text-autumn-brown">
                        ผู้แต่ง: {book.author || 'ไม่ระบุ'}
                      </p>

                      <p className="mt-1 text-sm text-gray-500">
                        ปีที่พิมพ์: {book.published_year || 'ไม่ระบุ'}
                      </p>

                      {book.is_visible === false && (
                        <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
                          ไม่แสดงในหน้าร้าน
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEditBook(book)}
                      disabled={busy}
                      className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      แก้ไข
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book)}
                      disabled={busy}
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {String(deletingBookId) === String(book.id)
                        ? 'กำลังลบ...'
                        : 'ลบ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add Book Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleAddBook}
            className="rounded-xl bg-autumn-brown px-6 py-3 font-semibold text-white shadow-sm transition hover:opacity-90"
          >
            ＋ เพิ่มหนังสือ
          </button>
        </div>

      </div>
    </div>
  );
}

export default AdminBooks;

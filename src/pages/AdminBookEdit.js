
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  adminGetBook,
  adminUpdateBook,
  getCategories,
} from '../api/backend';

function getBookCategoryIds(book) {
  const ids =
    book?.category_ids ??
    book?.categoryIds ??
    book?.categories ??
    book?.Categories;

  if (!Array.isArray(ids)) return [];

  return ids
    .map((category) => {
      if (typeof category === 'string' || typeof category === 'number') {
        return String(category);
      }

      return String(
        category?.id ??
        category?.category_id ??
        category?.categoryId ??
        ''
      );
    })
    .filter(Boolean);
}

function AdminBookEdit() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);
      setError('');

      try {
        const [detail, categoryData] = await Promise.all([
          adminGetBook(id),
          getCategories(),
        ]);

        if (!detail) {
          throw new Error('ไม่พบข้อมูลหนังสือ');
        }

        if (!active) return;

        setBook({
          title: detail.title || '',
          author: detail.author || '',
          description: detail.description || '',
          cover_url: detail.cover_url || '',
          published_year: detail.published_year ?? '',
          category_ids: getBookCategoryIds(detail),
        });

        setCategories(
          Array.isArray(categoryData) ? categoryData : []
        );
      } catch (err) {
        if (active) {
          setError(err.message || 'ไม่สามารถโหลดข้อมูลหนังสือได้');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [id]);

  function handleChange(event) {
    const { name, value } = event.target;

    setBook((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleCategory(categoryId) {
    const category = String(categoryId);

    setBook((previous) => {
      const exists = previous.category_ids.includes(category);

      return {
        ...previous,
        category_ids: exists
          ? previous.category_ids.filter(
              (item) => item !== category
            )
          : [...previous.category_ids, category],
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!book) return;

    setError('');
    setMessage('');

    if (!book.title.trim() || !book.author.trim()) {
      setError('กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง');
      return;
    }

    let publishedYear = null;

    if (String(book.published_year).trim()) {
      publishedYear = Number(book.published_year);

      if (
        !Number.isInteger(publishedYear) ||
        publishedYear < 1 ||
        publishedYear > 9999
      ) {
        setError('กรุณากรอกปีที่พิมพ์ให้ถูกต้อง');
        return;
      }
    }

    if (!window.confirm(
      `ยืนยันแก้ไขข้อมูลหนังสือ "${book.title.trim()}" หรือไม่?`
    )) return;

    setSaving(true);

    try {
      await adminUpdateBook(id, {
        ...book,
        published_year: publishedYear,
      });

      setMessage('แก้ไขข้อมูลหนังสือเรียบร้อยแล้ว');

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'ไม่สามารถแก้ไขหนังสือได้');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-autumn-cream px-4 py-16">
        <div className="mx-auto max-w-3xl rounded-2xl bg-white p-8 text-center text-autumn-brown shadow-sm">
          กำลังโหลดข้อมูลหนังสือ...
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-autumn-cream px-4 py-8">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/books"
            className="inline-flex rounded-xl bg-white px-4 py-2 text-autumn-dark shadow-sm hover:bg-autumn-cream"
          >
            ← กลับหน้าจัดการหนังสือ
          </Link>

          <div className="mt-6 rounded-xl bg-red-100 p-5 text-red-700">
            {error || 'ไม่พบข้อมูลหนังสือ'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-autumn-cream px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-3xl">

        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate('/admin/books')}
            className="inline-flex rounded-xl bg-white px-4 py-2 font-medium text-autumn-dark shadow-sm transition hover:bg-autumn-cream"
          >
            ← กลับหน้าจัดการหนังสือ
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-autumn-dark">
            แก้ไขหนังสือ
          </h1>
          <p className="mt-2 text-autumn-brown">
            แก้ไขรายละเอียดหนังสือที่เลือก
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-4 rounded-xl bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl bg-white p-5 shadow-sm sm:p-7"
        >
          {book.cover_url && (
            <div className="flex justify-center">
              <img
                src={book.cover_url}
                alt={book.title}
                className="h-52 w-36 rounded-lg object-cover shadow-sm"
                onError={(event) => {
                  event.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-autumn-dark">
              ชื่อหนังสือ *
            </label>
            <input
              type="text"
              name="title"
              value={book.title}
              onChange={handleChange}
              required
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-autumn-dark">
              ชื่อผู้แต่ง *
            </label>
            <input
              type="text"
              name="author"
              value={book.author}
              onChange={handleChange}
              required
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-autumn-dark">
              คำอธิบายหนังสือ
            </label>
            <textarea
              name="description"
              value={book.description}
              onChange={handleChange}
              rows={5}
              disabled={saving}
              className="w-full rounded-xl border border-gray-300 p-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                ปีที่พิมพ์
              </label>
              <input
                type="number"
                name="published_year"
                value={book.published_year}
                onChange={handleChange}
                min="1"
                max="9999"
                disabled={saving}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                URL รูปปกหนังสือ
              </label>
              <input
                type="url"
                name="cover_url"
                value={book.cover_url}
                onChange={handleChange}
                disabled={saving}
                placeholder="https://example.com/cover.jpg"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
              />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <p className="mb-3 text-sm font-semibold text-autumn-dark">
                เลือกหมวดหมู่หนังสือ
              </p>

              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <label
                    key={category.id}
                    className="flex items-center gap-2 rounded-lg bg-autumn-cream/60 px-3 py-2 text-sm text-autumn-brown"
                  >
                    <input
                      type="checkbox"
                      disabled={saving}
                      checked={book.category_ids.includes(
                        String(category.id)
                      )}
                      onChange={() => toggleCategory(category.id)}
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
            <button
              type="submit"
              disabled={saving}
              className="rounded-xl bg-autumn-brown px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/admin/books')}
              disabled={saving}
              className="rounded-xl border border-gray-300 px-6 py-3 text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AdminBookEdit;

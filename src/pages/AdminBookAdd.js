
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  adminGetBooks,
  searchGoogleBooks,
  adminCreateBook,
  adminBulkImportBooks,
  getCategories,
} from '../api/backend';

const genres = [
  { value: 'manga', label: 'มังงะ / การ์ตูนญี่ปุ่น' },
  { value: 'romance', label: 'นิยายรัก / โรแมนติก' },
  { value: 'healing', label: 'ฮีลใจ / Feel Good' },
  { value: 'fantasy', label: 'แฟนตาซี / Young Adult' },
  { value: 'mystery', label: 'สืบสวน / ลึกลับ / ระทึกขวัญ' },
  { value: 'psychology', label: 'จิตวิทยา' },
  { value: 'self-help', label: 'พัฒนาตัวเอง' },
  { value: 'english', label: 'เรียนภาษาอังกฤษฉบับภาษาไทย' },
  { value: 'lifestyle', label: 'แต่งบ้าน / ไลฟ์สไตล์' },
  { value: 'horror', label: 'สยองขวัญ' },
];

function normalize(value) {
  return String(value || '').trim().toLowerCase();
}

function hasThai(value) {
  return /[\u0E00-\u0E7F]/.test(String(value || ''));
}

function getBookList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.books)) return response.books;
  if (Array.isArray(response?.items)) return response.items;
  return [];
}

function getGoogleBookId(book) {
  return (
    book?.google_books_id ||
    book?.googleBooksId ||
    book?.id ||
    ''
  );
}

function getGoogleBookCategories(book) {
  const categories = book?.categories || book?.category_ids || [];

  if (!Array.isArray(categories)) return [];

  return categories
    .map((category) => {
      if (typeof category === 'object') {
        return category.id || category.category_id || category.value;
      }

      return category;
    })
    .filter(Boolean);
}

function getGoogleBookCover(book) {
  return (
    book?.cover_url ||
    book?.thumbnail ||
    book?.imageLinks?.thumbnail ||
    book?.imageLinks?.smallThumbnail ||
    ''
  );
}

function getGoogleBookYear(book) {
  const publishedDate =
    book?.published_year ||
    book?.publishedDate ||
    book?.published_date ||
    '';

  const match = String(publishedDate).match(/\d{4}/);
  return match ? Number(match[0]) : '';
}

function getGoogleBookDescription(book) {
  return (
    book?.description ||
    book?.volumeInfo?.description ||
    ''
  );
}

function getGoogleBookTitle(book) {
  return (
    book?.title ||
    book?.volumeInfo?.title ||
    ''
  );
}

function getGoogleBookAuthors(book) {
  const authors =
    book?.authors ||
    book?.author ||
    book?.volumeInfo?.authors ||
    [];

  if (Array.isArray(authors)) return authors.join(', ');
  return String(authors || '');
}

export default function AdminBookAdd() {
  const navigate = useNavigate();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    published_year: '',
    category_ids: [],
  });

  const [importQuery, setImportQuery] = useState('');
  const [importGenre, setImportGenre] = useState('');
  const [searching, setSearching] = useState(false);
  const [googleBooks, setGoogleBooks] = useState([]);
  const [selectedBooks, setSelectedBooks] = useState([]);

  const [bulkGenre, setBulkGenre] = useState('manga');
  const [bulkAmount, setBulkAmount] = useState(20);
  const [bulkLoading, setBulkLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [bookResponse, categoryResponse] = await Promise.all([
        adminGetBooks(),
        getCategories(),
      ]);

      setBooks(getBookList(bookResponse));

      const categoryList = getBookList(categoryResponse);
      setCategories(categoryList);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateForm = (field, value) => {
    setBookForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleCategory = (categoryId) => {
    setBookForm((previous) => {
      const current = previous.category_ids || [];

      const exists = current.some(
        (id) => String(id) === String(categoryId)
      );

      return {
        ...previous,
        category_ids: exists
          ? current.filter((id) => String(id) !== String(categoryId))
          : [...current, categoryId],
      };
    });
  };

  const handleCreateBook = async (event) => {
    event.preventDefault();

    setError('');
    setSuccess('');

    if (!bookForm.title.trim() || !bookForm.author.trim()) {
      setError('กรุณากรอกชื่อหนังสือและผู้เขียน');
      return;
    }

    setSaving(true);

    try {
      await adminCreateBook({
        title: bookForm.title.trim(),
        author: bookForm.author.trim(),
        description: bookForm.description.trim(),
        cover_url: bookForm.cover_url.trim(),
        published_year: bookForm.published_year
          ? Number(bookForm.published_year)
          : null,
        category_ids: bookForm.category_ids,
      });

      setSuccess('เพิ่มหนังสือเรียบร้อยแล้ว');

      setBookForm({
        title: '',
        author: '',
        description: '',
        cover_url: '',
        published_year: '',
        category_ids: [],
      });

      await loadData();
    } catch (err) {
      setError(err.message || 'ไม่สามารถเพิ่มหนังสือได้');
    } finally {
      setSaving(false);
    }
  };

  const handleGoogleSearch = async (event) => {
    event.preventDefault();

    if (!importQuery.trim()) {
      setError('กรุณากรอกคำค้นหาหนังสือ');
      return;
    }

    setError('');
    setSuccess('');
    setSearching(true);
    setGoogleBooks([]);
    setSelectedBooks([]);

    try {
      const response = await searchGoogleBooks(importQuery.trim(), {
        lang: 'th',
        genre: importGenre,
      });

      const results = getBookList(response);

      const existingIds = new Set(
        books
          .map((book) =>
            normalize(
              book.google_books_id ||
              book.googleBooksId ||
              book.title
            )
          )
          .filter(Boolean)
      );

      const filteredBooks = results.filter((book) => {
        const title = getGoogleBookTitle(book);
        const author = getGoogleBookAuthors(book);
        const cover = getGoogleBookCover(book);
        const googleId = getGoogleBookId(book);

        const isThai = hasThai(title) || hasThai(author);
        const hasCover = Boolean(cover);
        const isDuplicate = existingIds.has(
          normalize(googleId || title)
        );

        return title && isThai && hasCover && !isDuplicate;
      });

      setGoogleBooks(filteredBooks);

      if (filteredBooks.length === 0) {
        setError('ไม่พบหนังสือภาษาไทยที่ยังไม่มีในระบบ');
      }
    } catch (err) {
      setError(err.message || 'ค้นหาหนังสือไม่สำเร็จ');
    } finally {
      setSearching(false);
    }
  };

  const toggleGoogleBook = (book) => {
    const googleId = getGoogleBookId(book);

    setSelectedBooks((previous) => {
      const exists = previous.some(
        (item) =>
          String(getGoogleBookId(item)) === String(googleId)
      );

      return exists
        ? previous.filter(
            (item) =>
              String(getGoogleBookId(item)) !== String(googleId)
          )
        : [...previous, book];
    });
  };

  const toggleSelectAll = () => {
    if (selectedBooks.length === googleBooks.length) {
      setSelectedBooks([]);
    } else {
      setSelectedBooks([...googleBooks]);
    }
  };

  const handleImportSelected = async () => {
    if (selectedBooks.length === 0) {
      setError('กรุณาเลือกหนังสือที่ต้องการนำเข้า');
      return;
    }

    setError('');
    setSuccess('');
    setSaving(true);

    try {
      let imported = 0;
      let failed = 0;

      for (const book of selectedBooks) {
        try {
          await adminCreateBook({
            title: getGoogleBookTitle(book),
            author: getGoogleBookAuthors(book),
            description: getGoogleBookDescription(book),
            cover_url: getGoogleBookCover(book),
            published_year: getGoogleBookYear(book) || null,
            google_books_id: getGoogleBookId(book),
            category_ids: getGoogleBookCategories(book),
          });

          imported += 1;
        } catch {
          failed += 1;
        }
      }

      setSuccess(
        `นำเข้าสำเร็จ ${imported} รายการ` +
        (failed > 0 ? ` และไม่สำเร็จ ${failed} รายการ` : '')
      );

      setSelectedBooks([]);
      await loadData();
    } catch (err) {
      setError(err.message || 'นำเข้าหนังสือไม่สำเร็จ');
    } finally {
      setSaving(false);
    }
  };

  const handleBulkImport = async () => {
    setError('');
    setSuccess('');
    setBulkLoading(true);

    try {
      const response = await adminBulkImportBooks({
        genre: bulkGenre,
        limit: Number(bulkAmount),
        amount: Number(bulkAmount),
      });

      const imported =
        response?.imported ??
        response?.count ??
        response?.total ??
        0;

      setSuccess(
        `ดำเนินการนำเข้าหนังสือเรียบร้อยแล้ว ${
          imported ? `${imported} รายการ` : ''
        }`
      );

      await loadData();
    } catch (err) {
      setError(err.message || 'Bulk Import ไม่สำเร็จ');
    } finally {
      setBulkLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-autumn-dark">
            เพิ่มหนังสือ
          </h1>
          <p className="text-gray-500 mt-2">
            เพิ่มหนังสือด้วยตนเอง หรือค้นหาและนำเข้าจาก Google Books
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin/books')}
          className="px-5 py-2 rounded-lg border border-gray-300 hover:bg-gray-100"
        >
          ← กลับหน้าจัดการหนังสือ
        </button>
      </div>

      {error && (
        <div className="mb-5 p-4 rounded-lg bg-red-100 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-5 p-4 rounded-lg bg-green-100 text-green-700">
          {success}
        </div>
      )}

      <div className="mb-8 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-5">
          เพิ่มหนังสือด้วยตนเอง
        </h2>

        <form onSubmit={handleCreateBook} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">
              ชื่อหนังสือ *
            </label>
            <input
              type="text"
              value={bookForm.title}
              onChange={(event) =>
                updateForm('title', event.target.value)
              }
              required
              className="w-full border rounded-lg px-4 py-2"
              placeholder="กรอกชื่อหนังสือ"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              ผู้เขียน *
            </label>
            <input
              type="text"
              value={bookForm.author}
              onChange={(event) =>
                updateForm('author', event.target.value)
              }
              required
              className="w-full border rounded-lg px-4 py-2"
              placeholder="กรอกชื่อผู้เขียน"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              คำอธิบาย
            </label>
            <textarea
              value={bookForm.description}
              onChange={(event) =>
                updateForm('description', event.target.value)
              }
              rows={4}
              className="w-full border rounded-lg px-4 py-2"
              placeholder="รายละเอียดหนังสือ"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              URL รูปปก
            </label>
            <input
              type="url"
              value={bookForm.cover_url}
              onChange={(event) =>
                updateForm('cover_url', event.target.value)
              }
              className="w-full border rounded-lg px-4 py-2"
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              ปีที่พิมพ์
            </label>
            <input
              type="number"
              value={bookForm.published_year}
              onChange={(event) =>
                updateForm('published_year', event.target.value)
              }
              className="w-full border rounded-lg px-4 py-2"
              placeholder="เช่น 2024"
            />
          </div>

          <div>
            <label className="block font-medium mb-3">
              หมวดหมู่หนังสือ
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {(categories.length > 0 ? categories : genres).map(
                (category) => {
                  const id = category.id ?? category.value;
                  const label =
                    category.name ||
                    category.label ||
                    category.value;

                  const checked = bookForm.category_ids.some(
                    (item) => String(item) === String(id)
                  );

                  return (
                    <label
                      key={id}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleCategory(id)}
                      />
                      <span>{label}</span>
                    </label>
                  );
                }
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-lg bg-autumn-dark text-white hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'กำลังบันทึก...' : 'เพิ่มหนังสือ'}
          </button>
        </form>
      </div>

      <div className="mb-8 p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-5">
          ค้นหาหนังสือจาก Google Books
        </h2>

        <form
          onSubmit={handleGoogleSearch}
          className="grid grid-cols-1 md:grid-cols-3 gap-3"
        >
          <input
            type="text"
            value={importQuery}
            onChange={(event) => setImportQuery(event.target.value)}
            placeholder="ชื่อหนังสือหรือผู้เขียน"
            className="border rounded-lg px-4 py-2 md:col-span-2"
          />

          <select
            value={importGenre}
            onChange={(event) => setImportGenre(event.target.value)}
            className="border rounded-lg px-4 py-2"
          >
            <option value="">ทุกหมวดหมู่</option>
            {genres.map((genre) => (
              <option key={genre.value} value={genre.value}>
                {genre.label}
              </option>
            ))}
          </select>

          <button
            type="submit"
            disabled={searching}
            className="md:col-span-3 px-6 py-3 rounded-lg bg-autumn-dark text-white disabled:opacity-50"
          >
            {searching ? 'กำลังค้นหา...' : 'ค้นหาหนังสือ'}
          </button>
        </form>

        {googleBooks.length > 0 && (
          <div className="mt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <p className="font-semibold">
                  พบหนังสือ {googleBooks.length} รายการ
                </p>
                <p className="text-sm text-gray-500">
                  เลือกแล้ว {selectedBooks.length} รายการ
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  {selectedBooks.length === googleBooks.length
                    ? 'ยกเลิกทั้งหมด'
                    : 'เลือกทั้งหมด'}
                </button>

                <button
                  type="button"
                  onClick={handleImportSelected}
                  disabled={saving || selectedBooks.length === 0}
                  className="px-4 py-2 rounded-lg bg-green-700 text-white disabled:opacity-50"
                >
                  {saving
                    ? 'กำลังนำเข้า...'
                    : `นำเข้าที่เลือก (${selectedBooks.length})`}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {googleBooks.map((book, index) => {
                const googleId = getGoogleBookId(book);
                const selected = selectedBooks.some(
                  (item) =>
                    String(getGoogleBookId(item)) ===
                    String(googleId)
                );

                return (
                  <label
                    key={googleId || index}
                    className={`flex gap-3 p-4 border rounded-xl cursor-pointer ${
                      selected
                        ? 'border-green-600 bg-green-50'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => toggleGoogleBook(book)}
                      className="mt-1"
                    />

                    <img
                      src={getGoogleBookCover(book)}
                      alt={getGoogleBookTitle(book)}
                      className="w-20 h-28 object-cover rounded"
                    />

                    <div className="min-w-0">
                      <p className="font-semibold line-clamp-3">
                        {getGoogleBookTitle(book)}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {getGoogleBookAuthors(book)}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {getGoogleBookYear(book) || 'ไม่ระบุปี'}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white rounded-xl shadow">
        <h2 className="text-xl font-bold mb-2">
          Bulk Import
        </h2>

        <p className="text-gray-500 mb-5">
          นำเข้าหนังสือจำนวนหลายรายการตามหมวดหมู่ที่เลือก
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block font-medium mb-1">
              หมวดหมู่
            </label>
            <select
              value={bulkGenre}
              onChange={(event) => setBulkGenre(event.target.value)}
              className="w-full border rounded-lg px-4 py-2"
            >
              {genres.map((genre) => (
                <option key={genre.value} value={genre.value}>
                  {genre.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">
              จำนวนหนังสือ
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={bulkAmount}
              onChange={(event) =>
                setBulkAmount(Number(event.target.value))
              }
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={handleBulkImport}
              disabled={bulkLoading || loading}
              className="w-full px-5 py-2 rounded-lg bg-autumn-dark text-white disabled:opacity-50"
            >
              {bulkLoading
                ? 'กำลังนำเข้า...'
                : 'เริ่ม Bulk Import'}
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        {loading
          ? 'กำลังโหลดข้อมูลหนังสือ...'
          : `จำนวนหนังสือในระบบปัจจุบัน ${books.length} เล่ม`}
      </div>
    </div>
  );
}

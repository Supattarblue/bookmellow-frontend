
import { useEffect, useState } from 'react';
import {
  adminGetBooks,
  searchGoogleBooks,
  adminCreateBook,
  adminBulkImportBooks,
  getCategories,
} from '../api/backend';

const genres = [
  { value: 'manga', label: 'มังงะ / การ์ตูน' },
  { value: 'romance', label: 'นิยายรัก' },
  { value: 'healing', label: 'ฮีลใจ / Feel Good' },
  { value: 'fantasy', label: 'แฟนตาซี' },
  { value: 'mystery', label: 'สืบสวน / ลึกลับ' },
  { value: 'psychology', label: 'จิตวิทยา' },
  { value: 'self-help', label: 'พัฒนาตัวเอง' },
];

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);

  const [query, setQuery] = useState('');
  const [language, setLanguage] = useState('th');
  const [genre, setGenre] = useState('romance');

  const [descriptions, setDescriptions] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState('');
  const [bulkImporting, setBulkImporting] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);
  const [bulkResult, setBulkResult] = useState(null);

  async function loadData() {
    try {
      const [bookData, categoryData] = await Promise.all([
        adminGetBooks(),
        getCategories(),
      ]);

      setBooks(bookData);
      setCategories(categoryData);

      return bookData;
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
      throw err;
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function normalize(value) {
    return (value || '')
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ');
  }

  function findExistingBook(book) {
    return books.find(
      (item) =>
        normalize(item.title) === normalize(book.title) &&
        normalize(item.author) === normalize(book.author)
    );
  }

  async function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      setError('กรุณากรอกชื่อหนังสือหรือคำค้นหา');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');
    setBulkResult(null);
    setResults([]);
    setSearched(false);
    setDescriptions({});
    setSelectedCategories({});

    try {
      const data = await searchGoogleBooks(query.trim(), {
        lang: language,
        genre,
      });

      setResults(data);

      const initialDescriptions = {};

      data.forEach((book) => {
        initialDescriptions[book.google_books_id] =
          book.description || '';
      });

      setDescriptions(initialDescriptions);
      setSearched(true);
    } catch (err) {
      setError(err.message || 'ค้นหาหนังสือไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(bookId, categoryId) {
    setSelectedCategories((previous) => {
      const current = previous[bookId] || [];
      const exists = current.includes(categoryId);

      return {
        ...previous,
        [bookId]: exists
          ? current.filter((id) => id !== categoryId)
          : [...current, categoryId],
      };
    });
  }

  async function handleImport(book) {
    const bookId = book.google_books_id;
    const existing = findExistingBook(book);

    if (existing) {
      setError(`"${book.title}" มีอยู่ในระบบแล้ว`);
      return;
    }

    const description = (descriptions[bookId] || '').trim();

    if (!description) {
      setError('กรุณาใส่คำอธิบายหนังสือก่อนนำเข้า');
      return;
    }

    if (books.length >= 100) {
      setError('มีหนังสือครบ 100 เล่มแล้ว');
      return;
    }

    setImporting(bookId);
    setError('');
    setMessage('');
    setBulkResult(null);

    try {
      await adminCreateBook({
        title: book.title,
        author: book.author,
        description,
        cover_url: book.cover_url,
        published_year: book.published_year || null,
        category_ids: selectedCategories[bookId] || [],
      });

      await loadData();

      setMessage(`เพิ่ม "${book.title}" ลงในระบบเรียบร้อยแล้ว`);
    } catch (err) {
      setError(err.message || 'ไม่สามารถเพิ่มหนังสือได้');
    } finally {
      setImporting('');
    }
  }

  async function handleBulkImport() {
    if (books.length >= 100) {
      setError('มีหนังสือครบ 100 เล่มแล้ว');
      return;
    }

    if (bulkImporting || importing || loading) {
      return;
    }

    const confirmed = window.confirm(
      'ระบบจะค้นหาและนำเข้าหนังสือจาก Google Books ทันที โดยไม่สามารถตรวจสอบรายการทั้งหมดก่อนบันทึกได้ ต้องการดำเนินการต่อหรือไม่?'
    );

    if (!confirmed) return;

    setBulkImporting(true);
    setError('');
    setMessage('');
    setBulkResult(null);
    setResults([]);
    setSearched(false);

    try {
      const result = await adminBulkImportBooks();

      setBulkResult(result);

      await loadData();

      setMessage(
        result.message || 'ดำเนินการนำเข้าหนังสือเรียบร้อยแล้ว'
      );
    } catch (err) {
      setError(err.message || 'ไม่สามารถนำเข้าหนังสือเป็นชุดได้');
    } finally {
      setBulkImporting(false);
    }
  }

  const remaining = Math.max(0, 100 - books.length);

  return (
    <div className="min-h-screen bg-autumn-cream px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-autumn-dark">
            จัดการหนังสือ
          </h1>

          <p className="mt-2 text-autumn-brown">
            ค้นหาและคัดเลือกหนังสือที่น่าอ่านสำหรับ BookMellow
          </p>
        </div>

        {/* จำนวนหนังสือในระบบ */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm text-autumn-brown">
                หนังสือในระบบขณะนี้
              </p>

              <p className="text-3xl font-bold text-autumn-dark">
                {books.length} / 100 เล่ม
              </p>

              <p className="mt-1 text-sm text-gray-500">
                ยังเพิ่มได้อีก {remaining} เล่ม
              </p>
            </div>

            <div className="h-3 w-full overflow-hidden rounded-full bg-gray-200 sm:max-w-xs">
              <div
                className="h-full rounded-full bg-autumn-brown transition-all"
                style={{
                  width: `${Math.min(books.length, 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Bulk Import */}
          <div className="border-t border-gray-100 pt-5">
            <h2 className="font-semibold text-autumn-dark">
              นำเข้าหนังสืออัตโนมัติ
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              ค้นหาและนำเข้าหนังสือจาก Google Books เป็นชุด
              โดยระบบ Backend จะคัดกรองและตรวจสอบหนังสือซ้ำ
            </p>

            <button
              type="button"
              onClick={handleBulkImport}
              disabled={
                bulkImporting ||
                loading ||
                Boolean(importing) ||
                books.length >= 100
              }
              className="mt-4 w-full rounded-xl bg-autumn-brown px-5 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {bulkImporting
                ? 'กำลังค้นหาและนำเข้าหนังสือ...'
                : books.length >= 100
                  ? 'มีหนังสือครบ 100 เล่มแล้ว'
                  : 'นำเข้าหนังสืออัตโนมัติ'}
            </button>

            <p className="mt-2 text-xs text-amber-700">
              หมายเหตุ: การนำเข้าแบบชุดจะบันทึกข้อมูลทันที
              ควรตรวจสอบคุณภาพข้อมูลก่อนใช้งานจริง
            </p>
          </div>
        </div>

        {/* ผลการนำเข้า */}
        {bulkResult && (
          <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-bold text-autumn-dark">
              ผลการนำเข้าหนังสือ
            </h2>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-sm text-gray-500">พบหนังสือ</p>
                <p className="text-2xl font-bold text-autumn-dark">
                  {bulkResult.found ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">เพิ่มสำเร็จ</p>
                <p className="text-2xl font-bold text-green-600">
                  {bulkResult.inserted ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">ข้าม</p>
                <p className="text-2xl font-bold text-amber-600">
                  {bulkResult.skipped ?? 0}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">ยังขาด</p>
                <p className="text-2xl font-bold text-autumn-dark">
                  {bulkResult.remaining ?? remaining}
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-gray-500">
              จำนวนหนังสือในระบบหลังนำเข้า: {bulkResult.total ?? books.length} / 100 เล่ม
            </p>
          </div>
        )}

        {/* ค้นหาหนังสือ */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">

          <form onSubmit={handleSearch} className="space-y-4">

            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                ค้นหาหนังสือ
              </label>

              <input
                type="text"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setResults([]);
                  setSearched(false);
                  setError('');
                  setMessage('');
                  setBulkResult(null);
                }}
                placeholder="เช่น นิยายรักวัยรุ่น, มังงะ, หนังสือฮีลใจ..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">

              <div>
                <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                  ภาษา
                </label>

                <select
                  value={language}
                  onChange={(event) => setLanguage(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-autumn-brown"
                >
                  <option value="th">ภาษาไทย</option>
                  <option value="en">ภาษาอังกฤษ</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                  แนวหนังสือ
                </label>

                <select
                  value={genre}
                  onChange={(event) => setGenre(event.target.value)}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-autumn-brown"
                >
                  {genres.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <button
              type="submit"
              disabled={
                loading ||
                bulkImporting ||
                Boolean(importing) ||
                books.length >= 100
              }
              className="w-full rounded-xl bg-autumn-dark px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหาหนังสือ'}
            </button>

          </form>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Success */}
        {message && (
          <div className="mb-4 rounded-xl bg-green-100 p-4 text-green-700">
            {message}
          </div>
        )}

        {results.length > 0 && (
          <p className="mb-4 text-sm text-autumn-brown">
            พบหนังสือ {results.length} รายการจาก Google Books
          </p>
        )}

        {searched && results.length === 0 && (
          <div className="mb-5 rounded-xl bg-white p-6 text-center text-autumn-brown">
            ไม่พบหนังสือที่ตรงกับคำค้นหา ลองเปลี่ยนคำค้นหาหรือแนวหนังสือดูนะคะ
          </div>
        )}

        {/* รายการหนังสือจาก Google Books */}
        <div className="space-y-5">

          {results.map((book) => {
            const existing = findExistingBook(book);
            const bookId = book.google_books_id;

            return (
              <div
                key={bookId}
                className="grid gap-5 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-[150px_1fr]"
              >

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

                <div className="min-w-0">

                  <h2 className="text-xl font-bold text-autumn-dark">
                    {book.title}
                  </h2>

                  <p className="mt-1 text-sm text-autumn-brown">
                    ผู้แต่ง: {book.author}
                  </p>

                  <p className="mt-1 text-sm text-gray-500">
                    ปีที่พิมพ์: {book.published_year || 'ไม่ระบุ'}
                  </p>

                  {book.google_categories?.length > 0 && (
                    <p className="mt-2 text-sm text-gray-500">
                      หมวดหมู่จาก Google: {book.google_categories.join(', ')}
                    </p>
                  )}

                  <label className="mt-4 block text-sm font-semibold text-autumn-dark">
                    คำอธิบายหนังสือ (แก้ไขเป็นภาษาไทยได้)
                  </label>

                  <textarea
                    rows={4}
                    value={descriptions[bookId] ?? ''}
                    onChange={(event) =>
                      setDescriptions((previous) => ({
                        ...previous,
                        [bookId]: event.target.value,
                      }))
                    }
                    className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-autumn-brown"
                    placeholder="เขียนคำอธิบายหนังสือเป็นภาษาไทย..."
                  />

                  {categories.length > 0 && (
                    <div className="mt-4">
                      <p className="mb-2 text-sm font-semibold text-autumn-dark">
                        เลือกหมวดหมู่
                      </p>

                      <div className="flex flex-wrap gap-3">
                        {categories.map((category) => (
                          <label
                            key={category.id}
                            className="flex items-center gap-2 text-sm text-autumn-brown"
                          >
                            <input
                              type="checkbox"
                              checked={(selectedCategories[bookId] || []).includes(category.id)}
                              onChange={() =>
                                toggleCategory(bookId, category.id)
                              }
                            />

                            {category.name}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex flex-wrap items-center gap-3">

                    {existing ? (
                      <span className="rounded-lg bg-amber-100 px-4 py-2 text-sm text-amber-800">
                        มีหนังสือเล่มนี้ในระบบแล้ว
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleImport(book)}
                        disabled={
                          importing === bookId ||
                          bulkImporting ||
                          books.length >= 100
                        }
                        className="rounded-xl bg-autumn-dark px-5 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
                      >
                        {importing === bookId
                          ? 'กำลังเพิ่มหนังสือ...'
                          : 'เพิ่มหนังสือเข้าระบบ'}
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}

export default AdminBooks;

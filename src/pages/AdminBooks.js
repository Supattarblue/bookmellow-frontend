import { useEffect, useState } from 'react';
import {
  adminGetBooks,
  searchGoogleBooks,
  adminCreateBook,
  getCategories,
} from '../api/backend';

const TARGET = 100;

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
  return (value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');
}

function hasThai(value) {
  return /[\u0E00-\u0E7F]/.test(value || '');
}

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);

  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('self-help');

  const [selected, setSelected] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // โหลดหนังสือและหมวดหมู่จากระบบ
  async function loadData() {
    const [bookData, categoryData] = await Promise.all([
      adminGetBooks(),
      getCategories(),
    ]);

    setBooks(Array.isArray(bookData) ? bookData : []);
    setCategories(Array.isArray(categoryData) ? categoryData : []);
  }

  useEffect(() => {
    loadData().catch((err) => {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    });
  }, []);

  // ตรวจซ้ำกับหนังสือทั้งหมดที่ API ส่งกลับมา
  // การตรวจซ้ำขั้นสุดท้ายจะทำที่ฐานข้อมูลอีกครั้ง
  function findExistingBook(book) {
    return books.find(
      (item) =>
        normalize(item.title) === normalize(book.title) &&
        normalize(item.author) === normalize(book.author)
    );
  }

  // นับเฉพาะหนังสือที่เปิดแสดง
  // หาก API ส่งหนังสือที่ซ่อนมาด้วย ต้องมี is_visible: false
  const visibleBooks = books.filter(
    (book) => book.is_visible !== false
  );

  const visibleCount = visibleBooks.length;
  const remaining = Math.max(0, TARGET - visibleCount);

  const selectedBooks = results.filter(
    (book) => selected[book.google_books_id]
  );

  const selectedCount = selectedBooks.length;

  function handleSearch(event) {
    event.preventDefault();

    if (!query.trim()) {
      setError('กรุณากรอกชื่อหนังสือหรือคำค้นหา');
      return;
    }

    performSearch();
  }

  async function performSearch() {
    setLoading(true);
    setError('');
    setMessage('');
    setResults([]);
    setSelected({});
    setDescriptions({});
    setSelectedCategories({});
    setSearched(false);
    setImportResult(null);

    try {
      const data = await searchGoogleBooks(query.trim(), {
        lang: 'th',
        genre,
      });

      const thaiBooks = (Array.isArray(data) ? data : []).filter(
        (book) =>
          book.google_books_id &&
          hasThai(book.title) &&
          book.author &&
          book.cover_url
      );

      setResults(thaiBooks);

      const initialDescriptions = {};

      thaiBooks.forEach((book) => {
        initialDescriptions[book.google_books_id] =
          book.description || '';
      });

      setDescriptions(initialDescriptions);
      setSearched(true);

      if (thaiBooks.length === 0) {
        setMessage(
          'ไม่พบหนังสือภาษาไทยที่ผ่านเงื่อนไข ลองเปลี่ยนคำค้นหาได้ค่ะ'
        );
      }
    } catch (err) {
      setError(err.message || 'ค้นหาหนังสือไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }

  function toggleBook(bookId) {
    const book = results.find(
      (item) => item.google_books_id === bookId
    );

    if (!book || findExistingBook(book)) {
      return;
    }

    setSelected((previous) => {
      const isCurrentlySelected = Boolean(previous[bookId]);

      if (!isCurrentlySelected && selectedCount >= remaining) {
        return previous;
      }

      return {
        ...previous,
        [bookId]: !isCurrentlySelected,
      };
    });
  }

  function toggleAll() {
    const available = results.filter(
      (book) => !findExistingBook(book)
    );

    if (available.length === 0 || remaining === 0) {
      return;
    }

    const allAvailableSelected =
      available.every((book) => selected[book.google_books_id]);

    if (allAvailableSelected) {
      setSelected({});
      return;
    }

    const next = {};
    let count = 0;

    for (const book of available) {
      if (count >= remaining) {
        break;
      }

      next[book.google_books_id] = true;
      count++;
    }

    setSelected(next);
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

  async function handleImportSelected() {
    if (selectedCount === 0) {
      setError('กรุณาเลือกหนังสือที่ต้องการนำเข้าก่อน');
      return;
    }

    if (selectedCount > remaining) {
      setError(`เลือกเกินจำนวนที่เหลือ ${remaining} เล่ม`);
      return;
    }

    const invalidDescription = selectedBooks.find(
      (book) => !(descriptions[book.google_books_id] || '').trim()
    );

    if (invalidDescription) {
      setError(
        `กรุณาใส่คำอธิบายของ "${invalidDescription.title}" ก่อนนำเข้า`
      );
      return;
    }

    const invalidBook = selectedBooks.find(
      (book) =>
        !hasThai(book.title) ||
        !book.author?.trim() ||
        !book.cover_url
    );

    if (invalidBook) {
      setError(
        `ข้อมูลหนังสือ "${invalidBook.title}" ไม่ครบหรือไม่ผ่านเงื่อนไข`
      );
      return;
    }

    const confirmed = window.confirm(
      `ยืนยันนำเข้าหนังสือภาษาไทย ${selectedCount} เล่มหรือไม่?`
    );

    if (!confirmed) {
      return;
    }

    setImporting(true);
    setError('');
    setMessage('');
    setImportResult(null);

    let success = 0;
    const failed = [];

    try {
      for (const book of selectedBooks) {
        if (success >= remaining) {
          failed.push(`${book.title}: จำนวนหนังสือครบ 100 เล่มแล้ว`);
          continue;
        }

        if (findExistingBook(book)) {
          failed.push(`${book.title}: มีอยู่ในระบบแล้ว`);
          continue;
        }

        try {
          await adminCreateBook({
            title: book.title,
            author: book.author,
            description: descriptions[book.google_books_id].trim(),
            cover_url: book.cover_url,
            published_year: book.published_year || null,
            category_ids:
              selectedCategories[book.google_books_id] || [],
          });

          success++;
        } catch (err) {
          failed.push(`${book.title}: ${err.message}`);
        }
      }

      await loadData();

      setImportResult({
        success,
        failed,
      });

      setSelected({});
      setSelectedCategories({});

      setMessage(
        `นำเข้าสำเร็จ ${success} เล่ม` +
        (failed.length ? ` และข้าม ${failed.length} เล่ม` : '')
      );
    } catch (err) {
      setError(
        err.message || 'ไม่สามารถโหลดข้อมูลหลังนำเข้าได้'
      );
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-autumn-cream px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-autumn-dark">
            จัดการหนังสือ
          </h1>

          <p className="mt-2 text-autumn-brown">
            คัดเลือกหนังสือภาษาไทยที่น่าอ่านสำหรับ BookMellow
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-autumn-brown">
            หนังสือที่แสดงในระบบ
          </p>

          <p className="mt-1 text-3xl font-bold text-autumn-dark">
            {visibleCount} / {TARGET} เล่ม
          </p>

          <p className="mt-1 text-sm text-gray-500">
            ยังเพิ่มได้อีก {remaining} เล่ม
          </p>

          <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full rounded-full bg-autumn-brown transition-all"
              style={{
                width: `${Math.min((visibleCount / TARGET) * 100, 100)}%`,
              }}
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-autumn-dark">
            ค้นหาหนังสือภาษาไทย
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                ชื่อหนังสือหรือคำค้นหา
              </label>

              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="เช่น Good Vibes, Good Life, นิยายสืบสวนญี่ปุ่น..."
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                แนวหนังสือ
              </label>

              <select
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3"
              >
                {genres.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="submit"
              disabled={loading || importing || remaining === 0}
              className="w-full rounded-xl bg-autumn-dark px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหาหนังสือ'}
            </button>

            {remaining === 0 && (
              <p className="text-sm text-amber-700">
                แคตตาล็อกมีหนังสือครบ 100 เล่มแล้ว
              </p>
            )}
          </form>
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

        {importResult && (
          <div className="mb-6 rounded-xl bg-white p-5 shadow-sm">
            <h2 className="font-bold text-autumn-dark">
              ผลการนำเข้า
            </h2>

            <p className="mt-2 text-green-700">
              เพิ่มสำเร็จ {importResult.success} เล่ม
            </p>

            {importResult.failed.length > 0 && (
              <div className="mt-3 text-sm text-amber-700">
                <p>รายการที่ข้าม:</p>

                {importResult.failed.map((item, index) => (
                  <p key={`${index}-${item}`}>{item}</p>
                ))}
              </div>
            )}
          </div>
        )}

        {searched && results.length > 0 && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4 shadow-sm">
              <div>
                <p className="font-semibold text-autumn-dark">
                  พบหนังสือภาษาไทย {results.length} รายการ
                </p>

                <p className="text-sm text-gray-500">
                  เลือกแล้ว {selectedCount} เล่ม
                </p>
              </div>

              <button
                type="button"
                onClick={toggleAll}
                disabled={remaining === 0 || importing}
                className="rounded-lg border border-autumn-brown px-4 py-2 text-sm text-autumn-dark disabled:opacity-50"
              >
                เลือก / ยกเลิกทั้งหมด
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-autumn-brown">
                เลือกแล้ว {selectedCount} เล่ม · ยังเพิ่มได้อีก {remaining} เล่ม
              </p>

              <button
                type="button"
                onClick={handleImportSelected}
                disabled={
                  importing ||
                  loading ||
                  selectedCount === 0 ||
                  selectedCount > remaining
                }
                className="mt-3 w-full rounded-xl bg-autumn-brown px-5 py-3 font-semibold text-white disabled:opacity-50 sm:w-auto"
              >
                {importing
                  ? 'กำลังนำเข้าหนังสือ...'
                  : `นำเข้าหนังสือที่เลือก (${selectedCount} เล่ม)`}
              </button>
            </div>

            <div className="space-y-5">
              {results.map((book) => {
                const bookId = book.google_books_id;
                const existing = findExistingBook(book);
                const isSelected = Boolean(selected[bookId]);

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
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={
                            importing ||
                            existing ||
                            (!isSelected && selectedCount >= remaining)
                          }
                          onChange={() => toggleBook(bookId)}
                          className="mt-2 h-5 w-5"
                        />

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
                        </div>
                      </div>

                      {existing && (
                        <p className="mt-3 text-sm text-amber-700">
                          หนังสือเล่มนี้มีอยู่ในฐานข้อมูลแล้ว
                        </p>
                      )}

                      {book.google_categories?.length > 0 && (
                        <p className="mt-2 text-sm text-gray-500">
                          หมวดหมู่จาก Google:{' '}
                          {book.google_categories.join(', ')}
                        </p>
                      )}

                      <label className="mt-4 block text-sm font-semibold text-autumn-dark">
                        คำอธิบายหนังสือ
                      </label>

                      <textarea
                        rows={4}
                        value={descriptions[bookId] ?? ''}
                        disabled={importing}
                        onChange={(event) =>
                          setDescriptions((previous) => ({
                            ...previous,
                            [bookId]: event.target.value,
                          }))
                        }
                        className="mt-2 w-full rounded-xl border border-gray-300 p-3 text-sm"
                        placeholder="คำอธิบายภาษาไทย..."
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
                                  disabled={importing}
                                  checked={(
                                    selectedCategories[bookId] || []
                                  ).includes(category.id)}
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
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {searched && results.length === 0 && (
          <div className="rounded-xl bg-white p-6 text-center text-autumn-brown">
            ไม่พบหนังสือภาษาไทยที่ตรงกับคำค้นหา ลองค้นหาด้วยชื่อหนังสืออื่นค่ะ
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminBooks;
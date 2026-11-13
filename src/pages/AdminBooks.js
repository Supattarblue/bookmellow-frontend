
import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  adminGetBooks,
  adminGetBook,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  searchGoogleBooks,
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
  return (value || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function hasThai(value) {
  return /[\u0E00-\u0E7F]/.test(value || '');
}

function getBookCategoryIds(book) {
  const ids = book?.category_ids ??
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

function AdminBooks() {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);

  const [query, setQuery] = useState('');
  const [genre, setGenre] = useState('self-help');
  const [bookSearch, setBookSearch] = useState('');

  const [selected, setSelected] = useState({});
  const [descriptions, setDescriptions] = useState({});
  const [selectedCategories, setSelectedCategories] = useState({});

  const [manualBook, setManualBook] = useState({
    title: '',
    author: '',
    description: '',
    cover_url: '',
    published_year: '',
    category_ids: [],
  });

  const [editingBookId, setEditingBookId] = useState(null);
  const [editBook, setEditBook] = useState(null);

  const [manualAdding, setManualAdding] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [deletingBookId, setDeletingBookId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [autoImporting, setAutoImporting] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [searched, setSearched] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [autoImportResult, setAutoImportResult] = useState(null);

  const loadData = useCallback(async () => {
    const [bookData, categoryData] = await Promise.all([
      adminGetBooks(),
      getCategories(),
    ]);

    setBooks(Array.isArray(bookData) ? bookData : []);
    setCategories(Array.isArray(categoryData) ? categoryData : []);
  }, []);

  useEffect(() => {
    loadData().catch((err) => {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลได้');
    });
  }, [loadData]);

  function findExistingBook(book, excludedId = null) {
    return books.find(
      (item) =>
        String(item.id) !== String(excludedId) &&
        normalize(item.title) === normalize(book.title) &&
        normalize(item.author) === normalize(book.author)
    );
  }

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

  const selectedBooks = results.filter(
    (book) => selected[book.google_books_id]
  );

  const selectedCount = selectedBooks.length;

  const busy =
    loading ||
    importing ||
    autoImporting ||
    manualAdding ||
    editLoading ||
    editSaving ||
    deletingBookId !== null;

  function handleManualChange(event) {
    const { name, value } = event.target;

    setManualBook((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleManualCategory(categoryId) {
    setManualBook((previous) => {
      const id = String(categoryId);
      const current = previous.category_ids.map(String);
      const exists = current.includes(id);

      return {
        ...previous,
        category_ids: exists
          ? current.filter((item) => item !== id)
          : [...current, id],
      };
    });
  }

  function handleEditChange(event) {
    const { name, value } = event.target;

    setEditBook((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function toggleEditCategory(categoryId) {
    setEditBook((previous) => {
      const id = String(categoryId);
      const exists = previous.category_ids.includes(id);

      return {
        ...previous,
        category_ids: exists
          ? previous.category_ids.filter((item) => item !== id)
          : [...previous.category_ids, id],
      };
    });
  }

  async function handleManualCreate(event) {
    event.preventDefault();

    setError('');
    setMessage('');

    if (!manualBook.title.trim() || !manualBook.author.trim()) {
      setError('กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง');
      return;
    }

    if (findExistingBook(manualBook)) {
      setError('หนังสือชื่อนี้และผู้แต่งคนนี้มีอยู่ในระบบแล้ว');
      return;
    }

    let publishedYear = null;

    if (manualBook.published_year.trim()) {
      publishedYear = Number(manualBook.published_year);

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
      `ยืนยันเพิ่มหนังสือ "${manualBook.title.trim()}" หรือไม่?`
    )) return;

    setManualAdding(true);

    try {
      await adminCreateBook({
        ...manualBook,
        published_year: publishedYear,
      });

      await loadData();

      setManualBook({
        title: '',
        author: '',
        description: '',
        cover_url: '',
        published_year: '',
        category_ids: [],
      });

      setMessage('เพิ่มหนังสือเรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message || 'ไม่สามารถเพิ่มหนังสือได้');
    } finally {
      setManualAdding(false);
    }
  }

  async function handleStartEdit(book) {
    setError('');
    setMessage('');
    setEditLoading(true);

    try {
      const detail = await adminGetBook(book.id);

      if (!detail) {
        throw new Error('ไม่พบข้อมูลหนังสือ');
      }

      const detailCategoryIds = getBookCategoryIds(detail);
      const listCategoryIds = getBookCategoryIds(book);

      setEditingBookId(book.id);
      setEditBook({
        title: detail.title ?? book.title ?? '',
        author: detail.author ?? book.author ?? '',
        description: detail.description ?? book.description ?? '',
        cover_url: detail.cover_url ?? book.cover_url ?? '',
        published_year:
          detail.published_year ?? book.published_year ?? '',
        category_ids:
          detailCategoryIds.length > 0
            ? detailCategoryIds
            : listCategoryIds,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลหนังสือได้');
    } finally {
      setEditLoading(false);
    }
  }

  function cancelEdit() {
    setEditingBookId(null);
    setEditBook(null);
  }

  async function handleUpdateBook(event) {
    event.preventDefault();

    if (!editBook || !editingBookId) return;

    setError('');
    setMessage('');

    if (!editBook.title.trim() || !editBook.author.trim()) {
      setError('กรุณากรอกชื่อหนังสือและชื่อผู้แต่ง');
      return;
    }

    if (findExistingBook(editBook, editingBookId)) {
      setError('มีหนังสือชื่อและผู้แต่งนี้อยู่ในระบบแล้ว');
      return;
    }

    let publishedYear = null;

    if (String(editBook.published_year).trim()) {
      publishedYear = Number(editBook.published_year);

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
      `ยืนยันแก้ไขข้อมูลหนังสือ "${editBook.title.trim()}" หรือไม่?`
    )) return;

    setEditSaving(true);

    try {
      await adminUpdateBook(editingBookId, {
        ...editBook,
        published_year: publishedYear,
      });

      await loadData();
      cancelEdit();
      setMessage('แก้ไขข้อมูลหนังสือเรียบร้อยแล้ว');
    } catch (err) {
      setError(err.message || 'ไม่สามารถแก้ไขหนังสือได้');
    } finally {
      setEditSaving(false);
    }
  }

  async function handleDeleteBook(book) {
    if (!window.confirm(
      `ต้องการลบหนังสือ "${book.title}" ใช่หรือไม่?\n\nการลบนี้จะนำหนังสือออกจากฐานข้อมูล`
    )) return;

    setError('');
    setMessage('');
    setDeletingBookId(book.id);

    try {
      await adminDeleteBook(book.id);

      if (String(editingBookId) === String(book.id)) {
        cancelEdit();
      }

      await loadData();
      setMessage(`ลบหนังสือ "${book.title}" เรียบร้อยแล้ว`);
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบหนังสือได้');
    } finally {
      setDeletingBookId(null);
    }
  }

  async function handleAutoImport() {
    if (!window.confirm(
      'ต้องการให้ระบบค้นหาและนำเข้าหนังสือภาษาไทยโดยอัตโนมัติหรือไม่?'
    )) return;

    setAutoImporting(true);
    setError('');
    setMessage('');
    setAutoImportResult(null);
    setImportResult(null);

    try {
      const result = await adminBulkImportBooks();
      await loadData();

      setAutoImportResult(result);

      const inserted = Number(result?.inserted || 0);
      const skipped = Number(result?.skipped || 0);
      const total = Number(
        result?.total_books_in_database ??
        result?.total ??
        0
      );

      setMessage(
        `นำเข้าอัตโนมัติเสร็จแล้ว เพิ่มสำเร็จ ${inserted} เล่ม` +
        (skipped > 0 ? ` ข้าม ${skipped} เล่ม` : '') +
        (total > 0 ? ` · จำนวนในฐานข้อมูลทั้งหมด ${total} เล่ม` : '')
      );
    } catch (err) {
      setError(err.message || 'ไม่สามารถนำเข้าหนังสืออัตโนมัติได้');
    } finally {
      setAutoImporting(false);
    }
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

    if (!book || findExistingBook(book)) return;

    setSelected((previous) => ({
      ...previous,
      [bookId]: !previous[bookId],
    }));
  }

  function toggleAll() {
    const available = results.filter(
      (book) => !findExistingBook(book)
    );

    if (available.length === 0) return;

    const allSelected = available.every(
      (book) => selected[book.google_books_id]
    );

    if (allSelected) {
      setSelected({});
      return;
    }

    const next = {};

    available.forEach((book) => {
      next[book.google_books_id] = true;
    });

    setSelected(next);
  }

  function toggleCategory(bookId, categoryId) {
    setSelectedCategories((previous) => {
      const current = previous[bookId] || [];
      const id = String(categoryId);
      const exists = current.map(String).includes(id);

      return {
        ...previous,
        [bookId]: exists
          ? current.filter((item) => String(item) !== id)
          : [...current, id],
      };
    });
  }

  async function handleImportSelected() {
    if (selectedCount === 0) {
      setError('กรุณาเลือกหนังสือที่ต้องการนำเข้าก่อน');
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

    if (!window.confirm(
      `ยืนยันนำเข้าหนังสือภาษาไทย ${selectedCount} เล่มหรือไม่?`
    )) return;

    setImporting(true);
    setError('');
    setMessage('');
    setImportResult(null);

    let success = 0;
    const failed = [];

    try {
      for (const book of selectedBooks) {
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

      setImportResult({ success, failed });
      setSelected({});
      setSelectedCategories({});

      setMessage(
        `นำเข้าสำเร็จ ${success} เล่ม` +
        (failed.length ? ` และข้าม ${failed.length} เล่ม` : '')
      );
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดข้อมูลหลังนำเข้าได้');
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="min-h-screen bg-autumn-cream px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-6xl">

        <div className="mb-6">
          <Link
            to="/admin"
            className="inline-flex items-center rounded-xl bg-white px-4 py-2 font-medium text-autumn-dark shadow-sm transition hover:bg-autumn-cream"
          >
            ← กลับหน้า Dashboard
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-autumn-dark">
            จัดการหนังสือ
          </h1>
          <p className="mt-2 text-autumn-brown">
            คัดเลือกหนังสือภาษาไทยที่น่าอ่านและทันสมัยสำหรับ BookMellow
          </p>
        </div>

        {/* จำนวนหนังสือ */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-autumn-brown">
            หนังสือที่แสดงในระบบ
          </p>
          <p className="mt-1 text-3xl font-bold text-autumn-dark">
            {visibleBooks.length} เล่ม
          </p>
          <p className="mt-1 text-sm text-gray-500">
            สามารถเพิ่มหนังสือได้โดยไม่จำกัดจำนวน
          </p>
        </div>

        {/* รายการหนังสือในระบบ */}
        <div className="mb-6 rounded-2xl border border-autumn-brown/20 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-autumn-dark">
                หนังสือในระบบ
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                หนังสือทั้งหมด {books.length} เล่ม
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadData().catch((err) =>
                setError(err.message || 'ไม่สามารถโหลดข้อมูลได้')
              )}
              disabled={busy}
              className="rounded-lg border border-autumn-brown px-4 py-2 text-sm text-autumn-dark hover:bg-autumn-cream disabled:opacity-50"
            >
              ↻ โหลดรายการใหม่
            </button>
          </div>

          <input
            type="search"
            value={bookSearch}
            onChange={(event) => setBookSearch(event.target.value)}
            placeholder="ค้นหาจากชื่อหนังสือหรือชื่อผู้แต่ง..."
            className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown"
          />

          {filteredBooks.length === 0 ? (
            <div className="mt-5 rounded-xl bg-autumn-cream/50 p-6 text-center text-sm text-autumn-brown">
              {books.length === 0
                ? 'ยังไม่มีหนังสือในระบบ'
                : 'ไม่พบหนังสือที่ตรงกับคำค้นหา'}
            </div>
          ) : (
            <div className="mt-5 space-y-3">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center"
                >
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

                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => handleStartEdit(book)}
                      disabled={busy}
                      className="rounded-lg bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-200 disabled:opacity-50"
                    >
                      {editLoading ? 'กำลังโหลด...' : 'แก้ไข'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteBook(book)}
                      disabled={busy}
                      className="rounded-lg bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200 disabled:opacity-50"
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

        {/* ฟอร์มแก้ไข */}
        {editingBookId && editBook && (
          <div className="mb-6 rounded-2xl border-2 border-amber-300 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-autumn-dark">
                แก้ไขข้อมูลหนังสือ
              </h2>
              <button
                type="button"
                onClick={cancelEdit}
                disabled={editSaving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
            </div>

            <form onSubmit={handleUpdateBook} className="mt-5 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                  ชื่อหนังสือ *
                </label>
                <input
                  type="text"
                  name="title"
                  value={editBook.title}
                  onChange={handleEditChange}
                  required
                  disabled={editSaving}
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
                  value={editBook.author}
                  onChange={handleEditChange}
                  required
                  disabled={editSaving}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                  คำอธิบายหนังสือ
                </label>
                <textarea
                  name="description"
                  value={editBook.description}
                  onChange={handleEditChange}
                  rows={4}
                  disabled={editSaving}
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
                    value={editBook.published_year}
                    onChange={handleEditChange}
                    min="1"
                    max="9999"
                    disabled={editSaving}
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
                    value={editBook.cover_url}
                    onChange={handleEditChange}
                    disabled={editSaving}
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
                          disabled={editSaving}
                          checked={editBook.category_ids.includes(
                            String(category.id)
                          )}
                          onChange={() => toggleEditCategory(category.id)}
                        />
                        {category.name}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={editSaving}
                  className="rounded-xl bg-autumn-brown px-6 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-50"
                >
                  {editSaving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={editSaving}
                  className="rounded-xl border border-gray-300 px-6 py-3 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        )}

        {/* เพิ่มหนังสือด้วยตนเอง */}
        <div className="mb-6 rounded-2xl border border-autumn-brown/20 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-autumn-dark">
            เพิ่มหนังสือด้วยตนเอง
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            กรอกข้อมูลหนังสือที่ต้องการเพิ่มได้โดยตรง
            ไม่จำเป็นต้องค้นหาจาก Google Books
          </p>

          <form onSubmit={handleManualCreate} className="mt-5 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                ชื่อหนังสือ *
              </label>
              <input
                type="text"
                name="title"
                value={manualBook.title}
                onChange={handleManualChange}
                required
                disabled={busy}
                placeholder="กรอกชื่อหนังสือ"
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
                value={manualBook.author}
                onChange={handleManualChange}
                required
                disabled={busy}
                placeholder="กรอกชื่อผู้แต่ง"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-autumn-brown disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-autumn-dark">
                คำอธิบายหนังสือ
              </label>
              <textarea
                name="description"
                value={manualBook.description}
                onChange={handleManualChange}
                rows={4}
                disabled={busy}
                placeholder="รายละเอียดหรือเรื่องย่อของหนังสือ"
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
                  value={manualBook.published_year}
                  onChange={handleManualChange}
                  min="1"
                  max="9999"
                  disabled={busy}
                  placeholder="เช่น 2025"
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
                  value={manualBook.cover_url}
                  onChange={handleManualChange}
                  disabled={busy}
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
                        disabled={busy}
                        checked={manualBook.category_ids.includes(
                          String(category.id)
                        )}
                        onChange={() => toggleManualCategory(category.id)}
                      />
                      {category.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-xl bg-autumn-brown px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {manualAdding ? 'กำลังบันทึกหนังสือ...' : '＋ เพิ่มหนังสือ'}
            </button>
          </form>
        </div>

        {/* เพิ่มหนังสืออัตโนมัติ */}
        <div className="mb-6 rounded-2xl border border-autumn-brown/20 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-autumn-dark">
            เพิ่มหนังสืออัตโนมัติ
          </h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            ให้ระบบค้นหาหนังสือภาษาไทยจาก Google Books ตามแนวหนังสือที่กำหนด
            ตรวจสอบข้อมูลและรายการซ้ำ ก่อนบันทึกลงฐานข้อมูล
          </p>

          <button
            type="button"
            onClick={handleAutoImport}
            disabled={busy}
            className="mt-4 w-full rounded-xl bg-autumn-dark px-6 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {autoImporting
              ? 'กำลังค้นหาและเพิ่มหนังสืออัตโนมัติ...'
              : 'เพิ่มหนังสืออัตโนมัติ'}
          </button>

          {autoImporting && (
            <p className="mt-3 text-sm text-autumn-brown">
              กรุณารอจนกว่าระบบจะค้นหาและบันทึกหนังสือเสร็จ
              อย่าปิดหรือรีเฟรชหน้านี้ระหว่างทำรายการ
            </p>
          )}

          {autoImportResult && (
            <div className="mt-4 rounded-xl bg-gray-50 p-4">
              <p className="font-semibold text-autumn-dark">
                ผลการนำเข้าอัตโนมัติ
              </p>
              <div className="mt-2 grid gap-2 text-sm sm:grid-cols-3">
                <p>
                  เพิ่มสำเร็จ: <strong>{autoImportResult.inserted ?? 0}</strong> เล่ม
                </p>
                <p>
                  ข้ามรายการ: <strong>{autoImportResult.skipped ?? 0}</strong> เล่ม
                </p>
                <p>
                  พบรายการ: <strong>{autoImportResult.found ?? 0}</strong> เล่ม
                </p>
              </div>
              {autoImportResult.message && (
                <p className="mt-2 text-sm text-gray-600">
                  {autoImportResult.message}
                </p>
              )}
              {autoImportResult.skip_reasons && (
                <div className="mt-3 text-xs text-gray-500">
                  <p className="font-semibold">รายละเอียดรายการที่ข้าม</p>
                  {Object.entries(autoImportResult.skip_reasons).map(
                    ([key, value]) => (
                      <p key={key}>{key}: {value}</p>
                    )
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ค้นหา Google Books */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-autumn-dark">
            ค้นหาและเลือกหนังสือจาก Google Books
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
                placeholder="เช่น Good Vibes, นิยายสืบสวนญี่ปุ่น, จิตวิทยา..."
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
              disabled={busy}
              className="w-full rounded-xl bg-autumn-dark px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-50 sm:w-auto"
            >
              {loading ? 'กำลังค้นหา...' : 'ค้นหาหนังสือ'}
            </button>
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
              ผลการนำเข้าด้วยตนเอง
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
                disabled={busy}
                className="rounded-lg border border-autumn-brown px-4 py-2 text-sm text-autumn-dark disabled:opacity-50"
              >
                เลือก / ยกเลิกทั้งหมด
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-white p-4 shadow-sm">
              <p className="text-sm text-autumn-brown">
                เลือกแล้ว {selectedCount} เล่ม
              </p>
              <button
                type="button"
                onClick={handleImportSelected}
                disabled={busy || selectedCount === 0}
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
                          disabled={busy || existing}
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
                        disabled={busy}
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
                                  disabled={busy}
                                  checked={(
                                    selectedCategories[bookId] || []
                                  ).map(String).includes(String(category.id))}
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


import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import VoteSection from './VoteSection';

function BookModal({ book, onClose }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [isSaved, setIsSaved] = useState(false);

  // ตรวจสอบว่าหนังสือถูกบันทึกไว้หรือยัง
  useEffect(() => {
    if (!book || !user) {
      setIsSaved(false);
      return;
    }

    const storageKey = `bookmellow_shelf_${user.id}`;
    const savedBooks = JSON.parse(
      localStorage.getItem(storageKey) || '[]'
    );

    setIsSaved(savedBooks.some((item) => item.id === book.id));
  }, [book, user]);

  if (!book) {
    return null;
  }

  // เพิ่มหรือนำหนังสือออกจากชั้นหนังสือ
  function handleSaveBook() {
    if (!user) {
      onClose();
      navigate('/login');
      return;
    }

    const storageKey = `bookmellow_shelf_${user.id}`;
    const savedBooks = JSON.parse(
      localStorage.getItem(storageKey) || '[]'
    );

    let updatedBooks;

    if (isSaved) {
      updatedBooks = savedBooks.filter(
        (item) => item.id !== book.id
      );
    } else {
      updatedBooks = [...savedBooks, book];
    }

    localStorage.setItem(storageKey, JSON.stringify(updatedBooks));
    setIsSaved(!isSaved);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="book-detail-title"
        className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-autumn-cream p-8 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* ปุ่มปิด */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-4 text-2xl text-autumn-brown hover:text-autumn-copper"
          aria-label="ปิดหน้าต่าง"
        >
          ×
        </button>

        {/* รูปปกหนังสือ */}
        <div className="mb-6 flex h-48 items-center justify-center rounded-2xl bg-autumn-beige p-5">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="h-full rounded-lg object-contain"
            />
          ) : (
            <span className="text-6xl">📖</span>
          )}
        </div>

        <p className="mb-2 text-sm tracking-widest text-autumn-copper">
          รายละเอียดหนังสือ
        </p>

        <h3
          id="book-detail-title"
          className="mb-3 text-2xl font-semibold text-autumn-chestnut"
        >
          {book.title}
        </h3>

        <p className="mb-5 text-autumn-brown">
          ผู้เขียน: {book.author}
        </p>

        {/* เรื่องย่อ */}
        <div className="mb-5">
          <h4 className="mb-2 font-semibold text-autumn-chestnut">
            เรื่องย่อ
          </h4>

          <p className="leading-7 text-autumn-dark">
            {book.description || 'ยังไม่มีคำอธิบายหนังสือ'}
          </p>
        </div>

        {/* หมวดหมู่ */}
        <div className="mb-5">
          <h4 className="mb-2 font-semibold text-autumn-chestnut">
            หมวดหมู่
          </h4>

          <div className="flex flex-wrap gap-2">
            {(book.categories || []).map((category) => (
              <span
                key={category}
                className="rounded-full bg-autumn-beige px-3 py-1 text-sm text-autumn-chestnut"
              >
                {category}
              </span>
            ))}
          </div>
        </div>

        <p className="text-sm text-autumn-brown">
          ปีที่ตีพิมพ์: {book.published_year || '-'}
        </p>

        {/* ระบบให้คะแนนหนังสือ */}
        <VoteSection bookId={book.id} />

        {/* ปุ่มเพิ่มลงชั้นหนังสือ */}
        <button
          type="button"
          onClick={handleSaveBook}
          className={`mt-7 w-full rounded-full border px-6 py-3 font-medium transition ${
            isSaved
              ? 'border-autumn-copper bg-autumn-beige text-autumn-chestnut hover:bg-autumn-sand'
              : 'border-autumn-chestnut bg-autumn-chestnut text-white hover:bg-autumn-copper'
          }`}
        >
          {isSaved
            ? 'นำออกจากชั้นหนังสือของฉัน'
            : 'เพิ่มลงชั้นหนังสือของฉัน'}
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 w-full rounded-full px-6 py-3 font-medium text-autumn-brown transition hover:bg-autumn-beige"
        >
          ปิดรายละเอียด
        </button>
      </div>
    </div>
  );
}

export default BookModal;

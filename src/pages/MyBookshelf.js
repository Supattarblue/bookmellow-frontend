
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';

function MyBookshelf() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  // โหลดหนังสือที่สมาชิกบันทึกไว้
  function loadSavedBooks() {
    if (!user) {
      setBooks([]);
      return;
    }

    const storageKey = `bookmellow_shelf_${user.id}`;

    try {
      const savedBooks = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );

      setBooks(savedBooks);
    } catch (error) {
      console.error('ไม่สามารถโหลดชั้นหนังสือได้:', error);
      setBooks([]);
    }
  }

  useEffect(() => {
    loadSavedBooks();
  }, [user]);

  return (
    <div className="min-h-screen bg-autumn-cream">
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">

        {/* หัวข้อ */}
        <div className="mb-12">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-autumn-copper">
            MY COLLECTION
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut md:text-4xl">
            ชั้นหนังสือของฉัน
          </h1>

          <p className="mt-3 text-autumn-brown">
            หนังสือที่คุณเลือกเก็บไว้ในชั้นส่วนตัว
          </p>

          <p className="mt-4 text-sm text-autumn-brown">
            หนังสือที่บันทึกไว้ทั้งหมด {books.length} เล่ม
          </p>
        </div>

        {/* รายการหนังสือ */}
        {books.length > 0 ? (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onSelect={setSelectedBook}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white px-6 py-20 text-center shadow-sm">
            <div className="text-5xl">📚</div>

            <h2 className="mt-5 text-xl font-semibold text-autumn-chestnut">
              ชั้นหนังสือของคุณยังว่างอยู่
            </h2>

            <p className="mt-3 text-autumn-brown">
              ลองเลือกหนังสือที่สนใจ แล้วเพิ่มลงในชั้นหนังสือของคุณนะคะ
            </p>
          </div>
        )}
      </section>

      {/* รายละเอียดหนังสือ */}
      <BookModal
        book={selectedBook}
        onClose={() => {
          setSelectedBook(null);
          loadSavedBooks();
        }}
      />
    </div>
  );
}

export default MyBookshelf;


import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { getBooks } from '../api/backend';
import BookModal from '../components/BookModal';

function Books() {
  const [searchParams] = useSearchParams();

  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);

  const selectedCategory = searchParams.get('category') || 'ทั้งหมด';

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);
        setError('');

        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดข้อมูลหนังสือได้');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const filteredBooks = books.filter((book) => (
    selectedCategory === 'ทั้งหมด' ||
    (book.categories || []).includes(selectedCategory)
  ));

  return (
    <main className="min-h-screen bg-autumn-cream">
      <section className="mx-auto max-w-7xl px-6 py-10 md:py-14">

        {loading && (
          <div className="py-24 text-center text-autumn-brown">
            กำลังโหลดหนังสือ...
          </div>
        )}

        {!loading && error && (
          <div className="py-24 text-center">
            <p className="text-autumn-brown">{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-autumn-brown px-6 py-2 text-white transition hover:bg-autumn-chestnut"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-6 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {filteredBooks.map((book) => (
              <button
                key={book.id}
                type="button"
                onClick={() => setSelectedBook(book)}
                className="group overflow-hidden rounded-2xl bg-white text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="aspect-[3/4] w-full overflow-hidden bg-autumn-beige">
                  {book.cover_url ? (
                    <img
                      src={book.cover_url}
                      alt={book.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center p-4 text-center text-autumn-brown">
                      <div>
                        <svg
                          className="mx-auto mb-3 h-10 w-10 opacity-50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 6.5c-2-1.5-5-2-8-1.5v13c3-.5 6 0 8 1.5m0-13c2-1.5 5-2 8-1.5v13c-3-.5-6 0-8 1.5m0-13v13"
                          />
                        </svg>
                        <p className="text-sm">ไม่มีรูปปก</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-3 sm:p-4">
                  <h2 className="line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-autumn-chestnut sm:text-base">
                    {book.title}
                  </h2>

                  <p className="mt-1 truncate text-xs text-autumn-brown sm:text-sm">
                    {book.author || 'ไม่ระบุผู้แต่ง'}
                  </p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {(book.categories || []).slice(0, 2).map((category) => (
                      <span
                        key={category}
                        className="rounded-full bg-autumn-cream px-2 py-1 text-[10px] text-autumn-brown sm:text-xs"
                      >
                        {category}
                      </span>
                    ))}
                  </div>

                  <p className="mt-2 line-clamp-2 text-xs leading-5 text-gray-500">
                    {book.description || 'ยังไม่มีคำโปรยสำหรับหนังสือเล่มนี้'}
                  </p>

                  <p className="mt-3 text-xs font-medium text-autumn-copper">
                    คลิกเพื่อดูรายละเอียด
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="py-24 text-center text-autumn-brown">
            ไม่พบหนังสือในหมวดหมู่นี้
          </div>
        )}
      </section>

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </main>
  );
}

export default Books;

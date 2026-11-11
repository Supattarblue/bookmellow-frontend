
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBooks } from '../api/backend';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';

function Recommendations() {
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [interests, setInterests] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const storageKey = user
    ? `bookmellow_interests_${user.id}`
    : null;

  useEffect(() => {
    async function loadRecommendations() {
      try {
        setLoading(true);
        setError('');

        const savedInterests = JSON.parse(
          localStorage.getItem(storageKey) || '[]'
        );

        setInterests(
          Array.isArray(savedInterests) ? savedInterests : []
        );

        const data = await getBooks();
        setBooks(data);
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดหนังสือแนะนำได้');
      } finally {
        setLoading(false);
      }
    }

    if (storageKey) {
      loadRecommendations();
    }
  }, [storageKey]);

  const recommendedBooks = books
    .map((book) => {
      const matchedCategories = (book.categories || []).filter(
        (category) => interests.includes(category)
      );

      return {
        ...book,
        matchedCategories,
      };
    })
    .filter((book) => book.matchedCategories.length > 0);

  return (
    <main className="min-h-screen bg-autumn-cream">
      <section className="mx-auto max-w-7xl px-6 py-14 md:py-20">

        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-autumn-copper">
            BOOKS FOR YOU
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut md:text-4xl">
            หนังสือที่เราเลือกมาให้คุณ
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-autumn-brown">
            ค้นพบหนังสือที่ตรงกับความสนใจของคุณ
            เผื่อจะได้เจอเล่มโปรดเล่มใหม่
          </p>
        </div>

        {loading && (
          <div className="py-24 text-center text-autumn-brown">
            กำลังค้นหาหนังสือที่เหมาะกับคุณ...
          </div>
        )}

        {!loading && error && (
          <div className="py-20 text-center text-autumn-brown">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-autumn-brown px-6 py-2 text-white hover:bg-autumn-chestnut"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {!loading && !error && interests.length === 0 && (
          <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
            <h2 className="text-xl font-semibold text-autumn-chestnut">
              ยังไม่ได้เลือกความสนใจ
            </h2>

            <p className="mt-3 text-autumn-brown">
              เลือกแนวหนังสือที่คุณชอบก่อน
              เพื่อให้เราช่วยค้นหาหนังสือที่เหมาะกับคุณ
            </p>

            <Link
              to="/interests"
              className="mt-6 inline-block rounded-full bg-autumn-brown px-8 py-3 font-medium text-white transition hover:bg-autumn-chestnut"
            >
              เลือกความสนใจ
            </Link>
          </div>
        )}

        {!loading && !error && interests.length > 0 && (
          <>
            <div className="mb-8 rounded-2xl border border-autumn-beige bg-white p-5">
              <p className="mb-3 font-medium text-autumn-chestnut">
                ความสนใจของคุณ
              </p>

              <div className="flex flex-wrap gap-2">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="rounded-full bg-autumn-cream px-4 py-2 text-sm text-autumn-brown"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <Link
                to="/interests"
                className="mt-4 inline-block text-sm font-medium text-autumn-copper hover:underline"
              >
                แก้ไขความสนใจ
              </Link>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold text-autumn-chestnut">
                หนังสือที่แนะนำสำหรับคุณ
              </h2>

              <p className="mt-2 text-sm text-autumn-brown">
                พบหนังสือที่ตรงกับความสนใจ {recommendedBooks.length} เล่ม
              </p>
            </div>

            {recommendedBooks.length > 0 ? (
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {recommendedBooks.map((book) => (
                  <div
                    key={book.id}
                    className="rounded-2xl bg-white p-3 shadow-sm"
                  >
                    <BookCard
                      book={book}
                      onSelect={setSelectedBook}
                    />

                    <div className="mt-4 rounded-xl bg-autumn-cream p-4">
                      <p className="text-sm font-semibold text-autumn-chestnut">
                        ทำไมถึงแนะนำเล่มนี้?
                      </p>

                      <p className="mt-2 text-sm leading-6 text-autumn-brown">
                        หนังสือเล่มนี้อยู่ในหมวดหมู่{' '}
                        {book.matchedCategories.join(', ')}
                        {' '}ซึ่งตรงกับความสนใจที่คุณเลือกไว้
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-3xl bg-white px-6 py-16 text-center shadow-sm">
                <h2 className="text-xl font-semibold text-autumn-chestnut">
                  ยังไม่พบหนังสือที่ตรงกับความสนใจ
                </h2>

                <p className="mt-3 text-autumn-brown">
                  ลองเลือกหมวดหมู่เพิ่มเติมเพื่อค้นหาหนังสือเล่มอื่น ๆ
                </p>

                <Link
                  to="/interests"
                  className="mt-6 inline-block rounded-full bg-autumn-brown px-8 py-3 text-white hover:bg-autumn-chestnut"
                >
                  แก้ไขความสนใจ
                </Link>
              </div>
            )}
          </>
        )}
      </section>

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </main>
  );
}

export default Recommendations;


import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

import {
  getBooks,
  getDiscoverBooks,
} from '../api/backend';

import { useAuth } from '../context/AuthContext';
import BookCard from '../components/BookCard';
import BookModal from '../components/BookModal';
import SearchBar from '../components/SearchBar';

function normalizeBookKey(book) {
  return `${(book.title || '').trim().toLowerCase()}|${(book.author || '').trim().toLowerCase()}`;
}

function getBookRenderKey(book) {
  return `${book.source || 'database'}-${book.id}`;
}

function hasCover(book) {
  return typeof book?.cover_url === 'string' &&
    book.cover_url.trim().length > 0;
}

function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [books, setBooks] = useState([]);
  const [interests, setInterests] = useState([]);
  const [failedCoverKeys, setFailedCoverKeys] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBook, setSelectedBook] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const selectedCategory = searchParams.get('category') || 'ทั้งหมด';

  // แจ้งเมื่อรูปหนังสือโหลดไม่สำเร็จ
  const handleImageError = (book) => {
    const key = getBookRenderKey(book);

    setFailedCoverKeys((previous) => {
      const next = new Set(previous);
      next.add(key);
      return next;
    });

    setSelectedBook((current) => {
      if (current && getBookRenderKey(current) === key) {
        return null;
      }
      return current;
    });
  };

  // โหลดหนังสือจาก Supabase และ Google Books
  useEffect(() => {
    let cancelled = false;

    async function fetchBooks() {
      setLoading(true);
      setError('');
      setFailedCoverKeys(new Set());

      const [databaseResult, externalResult] = await Promise.allSettled([
        getBooks(),
        getDiscoverBooks(),
      ]);

      if (cancelled) return;

      const databaseBooks =
        databaseResult.status === 'fulfilled' &&
        Array.isArray(databaseResult.value)
          ? databaseResult.value
          : [];

      // รองรับทั้ง API ที่ส่ง Array โดยตรง
      // และ API ที่ส่งข้อมูลในรูปแบบ { data: [...] }
      const externalResponse =
        externalResult.status === 'fulfilled'
          ? externalResult.value
          : [];

      const externalBooks = Array.isArray(externalResponse)
        ? externalResponse
        : Array.isArray(externalResponse?.data)
          ? externalResponse.data
          : [];

      if (
        databaseResult.status === 'rejected' &&
        externalResult.status === 'rejected'
      ) {
        setError('ไม่สามารถโหลดหนังสือจากระบบได้ กรุณาลองอีกครั้ง');
        setBooks([]);
        setLoading(false);
        return;
      }

      // เก็บหนังสือเดิมจากฐานข้อมูลที่มีรูปปก
      const validDatabaseBooks = databaseBooks.filter(hasCover);

      const mergedBooks = [...validDatabaseBooks];

      // ป้องกันหนังสือซ้ำจากฐานข้อมูล
      const seen = new Set(
        validDatabaseBooks.map(normalizeBookKey)
      );

      // เพิ่มหนังสือจาก Google Books ได้สูงสุด 100 เล่ม
      // โดยไม่จำกัดจำนวนรวมของหนังสือเดิมในฐานข้อมูล
      let externalCount = 0;

      for (const book of externalBooks) {
        if (
          !book.id ||
          !book.title ||
          !book.author ||
          !hasCover(book)
        ) {
          continue;
        }

        const key = normalizeBookKey(book);

        if (seen.has(key)) continue;

        seen.add(key);

        mergedBooks.push({
          ...book,
          source: 'google_books',
          categories: Array.isArray(book.categories)
            ? book.categories
            : [],
        });

        externalCount++;

        if (externalCount >= 100) break;
      }

      if (!cancelled) {
        // ไม่ตัดหนังสือเดิมและหนังสือภายนอกให้เหลือ 100 เล่มรวม
        setBooks(mergedBooks);

        if (
          databaseResult.status === 'rejected' ||
          externalResult.status === 'rejected'
        ) {
          console.warn(
            'โหลดหนังสือได้เพียงบางแหล่ง',
            databaseResult.status === 'rejected'
              ? databaseResult.reason
              : '',
            externalResult.status === 'rejected'
              ? externalResult.reason
              : ''
          );
        }

        console.log('BookMellow database books:', validDatabaseBooks.length);
        console.log('Google Books discovered:', externalBooks.length);
        console.log('Google Books added:', externalCount);
        console.log('Total books displayed:', mergedBooks.length);

        setLoading(false);
      }
    }

    fetchBooks();

    return () => {
      cancelled = true;
    };
  }, []);

  // โหลดความสนใจของสมาชิก
  useEffect(() => {
    if (!user) {
      setInterests([]);
      return;
    }

    try {
      const storageKey = `bookmellow_interests_${user.id}`;
      const savedInterests = JSON.parse(
        localStorage.getItem(storageKey) || '[]'
      );

      setInterests(
        Array.isArray(savedInterests) ? savedInterests : []
      );
    } catch (err) {
      console.error('ไม่สามารถโหลดความสนใจได้:', err);
      setInterests([]);
    }
  }, [user]);

  // ตัดหนังสือที่รูปโหลดไม่สำเร็จออก
  const visibleBooks = useMemo(() => {
    return books.filter((book) => {
      return (
        hasCover(book) &&
        !failedCoverKeys.has(getBookRenderKey(book))
      );
    });
  }, [books, failedCoverKeys]);

  // ค้นหาและกรองจากหนังสือที่มีรูปใช้งานได้
  const filteredBooks = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();

    return visibleBooks.filter((book) => {
      const matchesSearch =
        !keyword ||
        book.title?.toLowerCase().includes(keyword) ||
        book.author?.toLowerCase().includes(keyword) ||
        book.description?.toLowerCase().includes(keyword);

      const matchesCategory =
        selectedCategory === 'ทั้งหมด' ||
        (book.categories || []).some(
          (category) =>
            category.toLowerCase() === selectedCategory.toLowerCase()
        );

      return matchesSearch && matchesCategory;
    });
  }, [visibleBooks, searchTerm, selectedCategory]);

  // หนังสือแนะนำตามความสนใจ เฉพาะเล่มที่มีรูป
  const recommendedBooks = useMemo(() => {
    return visibleBooks
      .map((book) => {
        const matchedCategories = (book.categories || []).filter(
          (category) => interests.includes(category)
        );

        return {
          ...book,
          matchedCategories,
        };
      })
      .filter((book) => book.matchedCategories.length > 0)
      .slice(0, 4);
  }, [visibleBooks, interests]);

  const clearFilters = () => {
    setSearchTerm('');
    setSearchParams({});
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-autumn-beige"
      >
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 py-16 md:grid-cols-2 md:py-24">
          <div>
            <p className="mb-4 text-sm font-medium tracking-[0.25em] text-autumn-copper">
              WELCOME TO BOOKMELLOW
            </p>

            <h1 className="mb-6 text-4xl font-semibold leading-tight text-autumn-chestnut md:text-6xl">
              ค้นพบหนังสือเล่มโปรด
              <br />
              ในมุมเล็ก ๆ ของคุณ
            </h1>

            <p className="mb-8 max-w-lg text-base leading-8 text-autumn-brown">
              พื้นที่สำหรับคนรักการอ่าน
              มาค้นพบเรื่องราวใหม่ ๆ
              และเลือกหนังสือที่เหมาะกับช่วงเวลาของคุณ
            </p>

            <a
              href="#books"
              className="inline-block rounded-full bg-autumn-chestnut px-8 py-3 font-medium text-white transition hover:bg-autumn-copper"
            >
              ค้นหาหนังสือ
            </a>
          </div>

          <div className="flex justify-center">
            <img
              src="/images/bookmellow-hero.png"
              alt="BookMellow bookstore"
              className="w-full max-w-lg rounded-3xl object-cover shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* Personalized Recommendations */}
      {user && (
        <section className="mx-auto max-w-7xl px-6 py-14 md:py-16">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-3 text-sm font-medium tracking-[0.2em] text-autumn-copper">
                JUST FOR YOU
              </p>

              <h2 className="text-2xl font-semibold text-autumn-chestnut md:text-3xl">
                หนังสือแนะนำสำหรับคุณ
              </h2>

              <p className="mt-3 text-sm leading-6 text-autumn-brown">
                หนังสือที่คัดสรรจากความสนใจในการอ่านของคุณ
              </p>
            </div>

            {interests.length > 0 && (
              <Link
                to="/recommendations"
                className="text-sm font-medium text-autumn-copper transition hover:text-autumn-chestnut hover:underline"
              >
                ดูหนังสือแนะนำทั้งหมด →
              </Link>
            )}
          </div>

          {interests.length === 0 ? (
            <div className="rounded-3xl border border-autumn-beige bg-white px-6 py-10 text-center shadow-sm">
              <h3 className="text-xl font-semibold text-autumn-chestnut">
                มาค้นหาหนังสือที่เหมาะกับคุณกันเถอะ
              </h3>

              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-autumn-brown">
                เลือกแนวหนังสือที่คุณชื่นชอบ
                แล้วเราจะช่วยคัดสรรหนังสือที่ตรงกับความสนใจมาให้
              </p>

              <Link
                to="/interests"
                className="mt-6 inline-block rounded-full bg-autumn-brown px-8 py-3 font-medium text-white transition hover:bg-autumn-chestnut"
              >
                เลือกความสนใจของฉัน
              </Link>
            </div>
          ) : recommendedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-4">
                {recommendedBooks.map((book) => (
                  <div key={getBookRenderKey(book)}>
                    <BookCard
                      book={book}
                      onSelect={setSelectedBook}
                      onImageError={handleImageError}
                    />

                    <div className="mt-3 rounded-xl bg-autumn-beige/50 p-4">
                      <p className="text-sm font-semibold text-autumn-chestnut">
                        ทำไมถึงแนะนำเล่มนี้?
                      </p>

                      <p className="mt-2 text-sm leading-6 text-autumn-brown">
                        เพราะอยู่ในหมวดหมู่{' '}
                        {book.matchedCategories.join(', ')}
                        {' '}ที่คุณสนใจค่ะ
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <Link
                  to="/recommendations"
                  className="inline-block rounded-full border border-autumn-brown px-8 py-3 font-medium text-autumn-brown transition hover:bg-autumn-brown hover:text-white"
                >
                  ดูหนังสือแนะนำทั้งหมด
                </Link>
              </div>
            </>
          ) : (
            <div className="rounded-3xl border border-autumn-beige bg-white px-6 py-10 text-center shadow-sm">
              <h3 className="text-lg font-semibold text-autumn-chestnut">
                ยังไม่พบหนังสือที่ตรงกับความสนใจ
              </h3>

              <p className="mt-3 text-sm text-autumn-brown">
                ลองเลือกหมวดหมู่เพิ่มเติมเพื่อค้นหาหนังสือเล่มอื่น ๆ
              </p>

              <Link
                to="/interests"
                className="mt-6 inline-block rounded-full bg-autumn-brown px-8 py-3 font-medium text-white transition hover:bg-autumn-chestnut"
              >
                แก้ไขความสนใจ
              </Link>
            </div>
          )}
        </section>
      )}

      {/* Books Section */}
      <section
        id="books"
        className="mx-auto max-w-7xl px-6 py-16 md:py-20"
      >
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-autumn-copper">
            OUR COLLECTION
          </p>

          <h2 className="mb-4 text-3xl font-semibold text-autumn-chestnut md:text-4xl">
            หนังสือทั้งหมด
          </h2>

          <p className="text-autumn-brown">
            เลือกค้นหาหนังสือที่คุณสนใจได้ที่นี่
          </p>
        </div>

        <div
          id="search"
          className="mb-10 rounded-3xl bg-white p-6 shadow-sm md:p-8"
        >
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-autumn-brown">
              {selectedCategory !== 'ทั้งหมด' && (
                <span>หมวดหมู่: {selectedCategory} · </span>
              )}

              พบหนังสือทั้งหมด{' '}
              <span className="font-semibold text-autumn-chestnut">
                {filteredBooks.length}
              </span>{' '}
              เล่ม
            </p>

            {(searchTerm || selectedCategory !== 'ทั้งหมด') && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-autumn-copper transition hover:text-autumn-chestnut"
              >
                ล้างตัวกรอง
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="py-20 text-center">
            <p className="text-lg text-autumn-brown">
              กำลังโหลดหนังสือจาก BookMellow และ Google Books...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-red-50 px-6 py-10 text-center">
            <p className="mb-3 text-lg font-medium text-red-700">
              ไม่สามารถโหลดหนังสือจากระบบได้
            </p>

            <p className="text-sm text-red-600">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-full bg-autumn-chestnut px-6 py-2 text-white"
            >
              ลองอีกครั้ง
            </button>
          </div>
        )}

        {!loading && !error && filteredBooks.length > 0 && (
          <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={getBookRenderKey(book)}
                book={book}
                onSelect={setSelectedBook}
                onImageError={handleImageError}
              />
            ))}
          </div>
        )}

        {!loading && !error && filteredBooks.length === 0 && (
          <div className="rounded-2xl bg-autumn-beige/50 py-16 text-center">
            <span className="text-5xl">🔎</span>

            <h3 className="mt-5 text-xl font-semibold text-autumn-chestnut">
              ไม่พบหนังสือที่ค้นหา
            </h3>

            <p className="mt-2 text-sm text-autumn-brown">
              ลองเปลี่ยนคำค้นหาหรือเลือกหมวดหมู่อื่นดูนะคะ
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-autumn-chestnut px-6 py-3 text-white"
            >
              ดูหนังสือทั้งหมด
            </button>
          </div>
        )}
      </section>

      <BookModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
      />
    </div>
  );
}

export default Home;

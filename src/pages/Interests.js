
import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getBooks } from '../api/backend';

function Interests() {
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const successRef = useRef(null);

  const storageKey = user
    ? `bookmellow_interests_${user.id}`
    : null;

  useEffect(() => {
    async function loadInterests() {
      try {
        setLoading(true);
        setError('');

        const books = await getBooks();

        const allCategories = [
          ...new Set(
            books.flatMap((book) => book.categories || [])
          ),
        ].sort((a, b) => a.localeCompare(b));

        setCategories(allCategories);

        if (storageKey) {
          const savedInterests = JSON.parse(
            localStorage.getItem(storageKey) || '[]'
          );

          setSelectedInterests(
            Array.isArray(savedInterests) ? savedInterests : []
          );
        }
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดหมวดหมู่หนังสือได้');
      } finally {
        setLoading(false);
      }
    }

    loadInterests();
  }, [storageKey]);

  useEffect(() => {
    if (saved && successRef.current) {
      successRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }, [saved]);

  function toggleInterest(category) {
    setSelectedInterests((current) => {
      if (current.includes(category)) {
        return current.filter((item) => item !== category);
      }

      return [...current, category];
    });

    setSaved(false);
  }

  function saveInterests() {
    if (!storageKey || selectedInterests.length === 0) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify(selectedInterests)
    );

    setSaved(true);
  }

  return (
    <main className="min-h-screen bg-autumn-cream">
      <section className="mx-auto max-w-5xl px-6 py-14 md:py-20">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-medium tracking-[0.2em] text-autumn-copper">
            YOUR READING INTERESTS
          </p>

          <h1 className="text-3xl font-semibold text-autumn-chestnut md:text-4xl">
            คุณชอบอ่านหนังสือแนวไหน?
          </h1>

          <p className="mx-auto mt-4 max-w-2xl leading-7 text-autumn-brown">
            เลือกแนวหนังสือที่คุณสนใจได้หลายหมวดหมู่
            เพื่อให้เราคัดสรรหนังสือที่เหมาะกับคุณ
          </p>
        </div>

        {loading && (
          <div className="py-20 text-center text-autumn-brown">
            กำลังโหลดหมวดหมู่หนังสือ...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl bg-white p-8 text-center text-autumn-brown shadow-sm">
            {error}
          </div>
        )}

        {!loading && !error && categories.length > 0 && (
          <>
            <div className="mb-5 flex items-center justify-between">
              <p className="font-medium text-autumn-chestnut">
                หมวดหมู่หนังสือ
              </p>

              <p className="text-sm text-autumn-brown">
                เลือกแล้ว {selectedInterests.length} หมวดหมู่
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {categories.map((category) => {
                const isSelected = selectedInterests.includes(category);

                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => toggleInterest(category)}
                    className={`rounded-2xl border px-4 py-5 text-sm font-medium transition ${
                      isSelected
                        ? 'border-autumn-brown bg-autumn-brown text-white shadow-md'
                        : 'border-autumn-beige bg-white text-autumn-brown hover:border-autumn-copper hover:bg-autumn-beige'
                    }`}
                  >
                    <span className="flex items-center justify-center gap-2">
                      {isSelected && <span>✓</span>}
                      {category}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="mt-10 text-center">
              <button
                type="button"
                onClick={saveInterests}
                disabled={selectedInterests.length === 0}
                className="rounded-full bg-autumn-brown px-10 py-3 font-medium text-white transition hover:bg-autumn-chestnut disabled:cursor-not-allowed disabled:opacity-40"
              >
                บันทึกความสนใจ
              </button>

              {saved && (
                <div
                  ref={successRef}
                  className="mx-auto mt-8 max-w-lg rounded-2xl border border-autumn-beige bg-white p-6 shadow-sm"
                >
                  <div className="text-2xl text-green-700">
                    ✓
                  </div>

                  <h2 className="mt-2 text-lg font-semibold text-autumn-chestnut">
                    บันทึกความสนใจเรียบร้อยแล้ว!
                  </h2>

                  <p className="mt-2 text-sm leading-6 text-autumn-brown">
                    เราคัดสรรหนังสือที่ตรงกับแนวที่คุณชอบไว้ให้แล้ว
                    ลองไปดูหนังสือแนะนำของคุณกันเลย
                  </p>

                  <Link
                    to="/recommendations"
                    className="mt-5 inline-block rounded-full bg-autumn-brown px-8 py-3 font-medium text-white transition hover:bg-autumn-chestnut"
                  >
                    ดูหนังสือแนะนำของฉัน
                  </Link>
                </div>
              )}
            </div>
          </>
        )}

        {!loading && !error && categories.length === 0 && (
          <p className="py-20 text-center text-autumn-brown">
            ยังไม่มีหมวดหมู่หนังสือให้เลือก
          </p>
        )}
      </section>
    </main>
  );
}

export default Interests;

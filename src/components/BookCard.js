
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/backend';

function BookCard({ book, onSelect }) {
  const [voteSummary, setVoteSummary] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadVote() {
      try {
        const data = await apiRequest(`/api/books/${book.id}/vote`);

        if (active) {
          setVoteSummary(data.summary);
        }
      } catch (error) {
        if (active) {
          setVoteSummary(null);
        }
      }
    }

    if (book?.id) {
      loadVote();
    }

    return () => {
      active = false;
    };
  }, [book.id]);

  return (
    <article
      onClick={() => onSelect(book)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onSelect(book);
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`ดูรายละเอียด ${book.title}`}
      className="cursor-pointer overflow-hidden rounded-2xl bg-autumn-cream shadow-sm transition hover:-translate-y-1 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-autumn-copper"
    >
      {/* รูปปกหนังสือ */}
      <div className="flex h-64 items-center justify-center bg-autumn-beige p-6">
        {book.cover_url ? (
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <div className="text-center">
            <span className="text-5xl">📖</span>
            <p className="mt-3 text-sm text-autumn-brown">
              BookMellow
            </p>
          </div>
        )}
      </div>

      {/* ข้อมูลหนังสือ */}
      <div className="p-5">
        <h4 className="mb-2 text-lg font-semibold text-autumn-chestnut">
          {book.title}
        </h4>

        <p className="mb-3 text-sm text-autumn-brown">
          ผู้เขียน: {book.author}
        </p>

        {/* คะแนนจากผู้อ่าน */}
        {voteSummary && voteSummary.total_votes > 0 && (
          <p className="mb-3 text-sm font-medium text-amber-700">
            ★ {Number(voteSummary.average_rating).toFixed(1)} / 5
            <span className="ml-2 text-xs font-normal text-autumn-brown">
              ({voteSummary.total_votes} คะแนน)
            </span>
          </p>
        )}

        <p className="mb-4 line-clamp-2 text-sm leading-6 text-autumn-dark">
          {book.description || 'ยังไม่มีคำอธิบายหนังสือ'}
        </p>

        <div className="flex flex-wrap gap-2">
          {(book.categories || []).map((category) => (
            <span
              key={category}
              className="rounded-full bg-autumn-beige px-3 py-1 text-xs text-autumn-chestnut"
            >
              {category}
            </span>
          ))}
        </div>

        <p className="mt-4 text-xs text-autumn-brown">
          ปีที่ตีพิมพ์: {book.published_year || '-'}
        </p>

        <p className="mt-4 text-sm font-medium text-autumn-copper">
          คลิกเพื่อดูรายละเอียด →
        </p>
      </div>
    </article>
  );
}

export default BookCard;


import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../api/backend';

function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadReviews() {
      try {
        const result = await apiRequest('/api/admin/reviews');
        setReviews(Array.isArray(result.data) ? result.data : []);
      } catch (err) {
        setError(err.message || 'ไม่สามารถโหลดรีวิวได้');
      } finally {
        setLoading(false);
      }
    }

    loadReviews();
  }, []);

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
            รีวิวทั้งหมด
          </h1>
          <p className="mt-2 text-autumn-brown">
            ตรวจสอบคะแนนและความคิดเห็นจากสมาชิก BookMellow
          </p>
        </div>

        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-autumn-brown">
            รีวิวทั้งหมดในระบบ
          </p>
          <p className="mt-2 text-3xl font-bold text-autumn-dark">
            {reviews.length}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-xl bg-red-100 p-4 text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-center text-autumn-brown shadow-sm">
            กำลังโหลดรีวิว...
          </div>
        ) : reviews.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <p className="text-4xl">⭐</p>
            <h2 className="mt-4 text-lg font-bold text-autumn-dark">
              ยังไม่มีรีวิว
            </h2>
            <p className="mt-2 text-autumn-brown">
              เมื่อสมาชิกเริ่มเขียนรีวิว ความคิดเห็นจะแสดงที่หน้านี้
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div
                key={review.id}
                className="rounded-2xl bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <h2 className="text-lg font-bold text-autumn-dark">
                      {review.book_title || 'ไม่ทราบชื่อหนังสือ'}
                    </h2>

                    <p className="mt-1 text-sm text-autumn-brown">
                      รีวิวโดย {review.username || 'สมาชิก'}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, index) => (
                      <span
                        key={index}
                        className={
                          index < review.rating
                            ? 'text-amber-500'
                            : 'text-gray-300'
                        }
                      >
                        ★
                      </span>
                    ))}
                    <span className="ml-2 text-sm text-gray-500">
                      {review.rating}/5
                    </span>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-autumn-cream/60 p-4">
                  <p className="whitespace-pre-wrap leading-7 text-gray-700">
                    {review.comment || 'ไม่มีความคิดเห็นเพิ่มเติม'}
                  </p>
                </div>

                <p className="mt-3 text-right text-xs text-gray-400">
                  รีวิวเมื่อ:{' '}
                  {review.created_at
                    ? new Date(review.created_at).toLocaleString('th-TH')
                    : '-'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminReviews;

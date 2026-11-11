
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api/backend';

function ReviewSection({ bookId }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function loadReviews() {
    try {
      setLoading(true);
      setError('');

      const result = await apiRequest(
        `/api/books/${bookId}/reviews`
      );

      setReviews(result.reviews || []);
    } catch (err) {
      setError(err.message || 'ไม่สามารถโหลดรีวิวได้');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (bookId) {
      loadReviews();
    }
  }, [bookId]);

  const averageRating = reviews.length
    ? (
        reviews.reduce((total, review) => total + review.rating, 0) /
        reviews.length
      ).toFixed(1)
    : '0.0';

  const myReview = reviews.find(
    (review) => review.user_id === user?.id
  );

  function handleEdit(review) {
    setEditingId(review.id);
    setRating(review.rating);
    setComment(review.comment || '');
    setError('');
  }

  function resetForm() {
    setEditingId(null);
    setRating(5);
    setComment('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (editingId) {
        await apiRequest(`/api/reviews/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify({ rating, comment }),
        });
      } else {
        await apiRequest(`/api/books/${bookId}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ rating, comment }),
        });
      }

      resetForm();
      await loadReviews();
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกรีวิวได้');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId) {
    const confirmed = window.confirm('ต้องการลบรีวิวนี้ใช่หรือไม่?');

    if (!confirmed) return;

    try {
      setError('');

      await apiRequest(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      resetForm();
      await loadReviews();
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบรีวิวได้');
    }
  }

  return (
    <section className="mt-8 border-t border-autumn-beige pt-6">
      <h4 className="mb-3 text-xl font-semibold text-autumn-chestnut">
        รีวิวจากผู้อ่าน
      </h4>

      <div className="mb-6 rounded-2xl bg-autumn-beige p-4">
        <p className="text-3xl font-semibold text-autumn-chestnut">
          {averageRating} / 5
        </p>

        <p className="mt-1 text-sm text-autumn-brown">
          คะแนนเฉลี่ยจาก {reviews.length} รีวิว
        </p>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-100 p-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="py-4 text-center text-autumn-brown">
          กำลังโหลดรีวิว...
        </p>
      ) : (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="py-4 text-center text-autumn-brown">
              ยังไม่มีรีวิว เป็นคนแรกที่รีวิวหนังสือเล่มนี้ได้เลย
            </p>
          ) : (
            reviews.map((review) => (
              <article
                key={review.id}
                className="rounded-2xl border border-autumn-beige bg-white/60 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-autumn-chestnut">
                    {review.username || 'สมาชิก BookMellow'}
                  </p>

                  <span className="text-sm text-autumn-copper">
                    {'★'.repeat(review.rating)}
                    {'☆'.repeat(5 - review.rating)}
                  </span>
                </div>

                <p className="mt-3 whitespace-pre-wrap leading-7 text-autumn-dark">
                  {review.comment || 'ไม่ได้เขียนความคิดเห็นเพิ่มเติม'}
                </p>

                {user?.id === review.user_id && (
                  <div className="mt-3 flex gap-4 text-sm">
                    <button
                      type="button"
                      onClick={() => handleEdit(review)}
                      className="text-autumn-copper hover:underline"
                    >
                      แก้ไข
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(review.id)}
                      className="text-red-700 hover:underline"
                    >
                      ลบ
                    </button>
                  </div>
                )}
              </article>
            ))
          )}
        </div>
      )}

      <div className="mt-6 rounded-2xl bg-autumn-beige/60 p-5">
        <h5 className="mb-4 font-semibold text-autumn-chestnut">
          {editingId ? 'แก้ไขรีวิวของคุณ' : 'เขียนรีวิวหนังสือเล่มนี้'}
        </h5>

        {!user ? (
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full rounded-full bg-autumn-chestnut px-5 py-3 text-white hover:bg-autumn-copper"
          >
            เข้าสู่ระบบเพื่อเขียนรีวิว
          </button>
        ) : myReview && !editingId ? (
          <p className="text-sm text-autumn-brown">
            คุณรีวิวหนังสือเล่มนี้แล้ว สามารถแก้ไขรีวิวเดิมได้
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm font-medium text-autumn-brown">
              ให้คะแนนหนังสือ
            </label>

            <div className="mb-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating
                      ? 'text-autumn-copper'
                      : 'text-autumn-sand'
                  }`}
                  aria-label={`ให้คะแนน ${star} ดาว`}
                >
                  ★
                </button>
              ))}
            </div>

            <label
              htmlFor="review-comment"
              className="mb-2 block text-sm font-medium text-autumn-brown"
            >
              ความคิดเห็น
            </label>

            <textarea
              id="review-comment"
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              rows={4}
              placeholder="แบ่งปันความคิดเห็นเกี่ยวกับหนังสือเล่มนี้..."
              className="w-full rounded-xl border border-autumn-sand bg-white p-3 text-autumn-dark outline-none focus:border-autumn-copper"
            />

            <button
              type="submit"
              disabled={submitting}
              className="mt-4 w-full rounded-full bg-autumn-chestnut px-5 py-3 font-medium text-white transition hover:bg-autumn-copper disabled:opacity-50"
            >
              {submitting
                ? 'กำลังบันทึก...'
                : editingId
                  ? 'บันทึกการแก้ไข'
                  : 'ส่งรีวิว'}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="mt-2 w-full rounded-full px-5 py-2 text-autumn-brown hover:bg-autumn-beige"
              >
                ยกเลิกการแก้ไข
              </button>
            )}
          </form>
        )}
      </div>
    </section>
  );
}

export default ReviewSection;

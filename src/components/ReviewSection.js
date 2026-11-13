
import { useCallback, useEffect, useState } from 'react';
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

  const loadReviews = useCallback(async () => {
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
  }, [bookId]);

  useEffect(() => {
    if (bookId) {
      loadReviews();
    }
  }, [bookId, loadReviews]);

  const myReview = reviews.find(
    (review) => String(review.user_id) === String(user?.id)
  );

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce(
            (total, review) => total + Number(review.rating),
            0
          ) / reviews.length
        ).toFixed(1)
      : '0.0';

  function handleStartEdit(review) {
    setEditingId(review.id);
    setRating(Number(review.rating));
    setComment(review.comment || '');
    setError('');
  }

  function handleCancelEdit() {
    setEditingId(null);
    setRating(5);
    setComment('');
    setError('');
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!user) {
      navigate('/login');
      return;
    }

    if (rating < 1 || rating > 5) {
      setError('กรุณาเลือกคะแนน 1–5 ดาว');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        rating: Number(rating),
        comment: comment.trim(),
      };

      if (editingId) {
        await apiRequest(`/api/reviews/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiRequest(`/api/books/${bookId}/reviews`, {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }

      handleCancelEdit();
      await loadReviews();
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกรีวิวได้');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(reviewId) {
    const confirmed = window.confirm(
      'คุณต้องการลบรีวิวนี้ใช่หรือไม่?'
    );

    if (!confirmed) return;

    try {
      setError('');

      await apiRequest(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });

      if (editingId === reviewId) {
        handleCancelEdit();
      }

      await loadReviews();
    } catch (err) {
      setError(err.message || 'ไม่สามารถลบรีวิวได้');
    }
  }

  function renderStars(value) {
    return (
      <span className="text-lg tracking-wider text-amber-500">
        {'★'.repeat(Number(value))}
        <span className="text-gray-300">
          {'★'.repeat(5 - Number(value))}
        </span>
      </span>
    );
  }

  return (
    <section className="mt-8 border-t border-autumn-beige pt-6">
      <h4 className="mb-4 text-xl font-semibold text-autumn-chestnut">
        รีวิวจากผู้อ่าน
      </h4>

      <div className="mb-6 rounded-2xl bg-autumn-beige p-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold text-autumn-chestnut">
            {averageRating}
          </span>

          <div>
            {renderStars(Math.round(Number(averageRating)))}
            <p className="text-sm text-autumn-brown">
              จาก {reviews.length} รีวิว
            </p>
          </div>
        </div>
      </div>

      {user ? (
        myReview && !editingId ? (
          <div className="mb-6 rounded-2xl border border-autumn-beige p-4">
            <p className="mb-2 font-semibold text-autumn-chestnut">
              คุณรีวิวหนังสือเล่มนี้แล้ว
            </p>

            {renderStars(myReview.rating)}

            <p className="mt-2 whitespace-pre-wrap text-autumn-dark">
              {myReview.comment || 'ไม่ได้เขียนความคิดเห็น'}
            </p>

            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={() => handleStartEdit(myReview)}
                className="rounded-full bg-autumn-beige px-4 py-2 text-sm text-autumn-chestnut hover:bg-autumn-sand"
              >
                แก้ไขรีวิว
              </button>

              <button
                type="button"
                onClick={() => handleDelete(myReview.id)}
                className="rounded-full bg-red-50 px-4 py-2 text-sm text-red-600 hover:bg-red-100"
              >
                ลบรีวิว
              </button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mb-6 rounded-2xl border border-autumn-beige p-4"
          >
            <h5 className="mb-3 font-semibold text-autumn-chestnut">
              {editingId ? 'แก้ไขรีวิวของคุณ' : 'เขียนรีวิวหนังสือเล่มนี้'}
            </h5>

            <p className="mb-2 text-sm text-autumn-brown">
              ให้คะแนนหนังสือ
            </p>

            <div className="mb-4 flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  aria-label={`ให้ ${star} ดาว`}
                  className={`text-3xl transition ${
                    star <= rating
                      ? 'text-amber-500'
                      : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={comment}
              onChange={(event) => setComment(event.target.value)}
              placeholder="แบ่งปันความคิดเห็นเกี่ยวกับหนังสือเล่มนี้..."
              rows={4}
              maxLength={2000}
              className="w-full rounded-xl border border-autumn-beige bg-white p-3 text-autumn-dark outline-none focus:border-autumn-copper"
            />

            <p className="mt-1 text-right text-xs text-autumn-brown">
              {comment.length}/2000 ตัวอักษร
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-autumn-chestnut px-6 py-2 text-sm font-medium text-white hover:bg-autumn-copper disabled:opacity-50"
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
                  onClick={handleCancelEdit}
                  className="rounded-full bg-autumn-beige px-6 py-2 text-sm text-autumn-chestnut hover:bg-autumn-sand"
                >
                  ยกเลิก
                </button>
              )}
            </div>
          </form>
        )
      ) : (
        <div className="mb-6 rounded-2xl bg-autumn-beige p-4 text-center">
          <p className="mb-3 text-sm text-autumn-brown">
            เข้าสู่ระบบเพื่อเขียนรีวิวหนังสือเล่มนี้
          </p>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="rounded-full bg-autumn-chestnut px-6 py-2 text-sm text-white hover:bg-autumn-copper"
          >
            เข้าสู่ระบบ
          </button>
        </div>
      )}

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="space-y-4">
        <h5 className="font-semibold text-autumn-chestnut">
          ความคิดเห็นจากสมาชิก
        </h5>

        {loading ? (
          <p className="py-4 text-center text-sm text-autumn-brown">
            กำลังโหลดรีวิว...
          </p>
        ) : reviews.length === 0 ? (
          <p className="rounded-xl bg-autumn-beige p-4 text-center text-sm text-autumn-brown">
            ยังไม่มีรีวิว มาเป็นคนแรกที่รีวิวหนังสือเล่มนี้กันเถอะ!
          </p>
        ) : (
          reviews.map((review) => (
            <article
              key={review.id}
              className="rounded-2xl border border-autumn-beige p-4"
            >
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-autumn-chestnut">
                  {review.username || 'สมาชิก BookMellow'}
                </p>

                {renderStars(review.rating)}
              </div>

              <p className="whitespace-pre-wrap leading-7 text-autumn-dark">
                {review.comment || 'ไม่ได้เขียนความคิดเห็น'}
              </p>

              {review.created_at && (
                <p className="mt-3 text-xs text-autumn-brown">
                  {new Date(review.created_at).toLocaleDateString('th-TH')}
                </p>
              )}

              {String(review.user_id) === String(user?.id) && (
                <div className="mt-3 flex gap-3">
                  <button
                    type="button"
                    onClick={() => handleStartEdit(review)}
                    className="text-sm text-autumn-copper hover:underline"
                  >
                    แก้ไข
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(review.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    ลบ
                  </button>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  );
}

export default ReviewSection;

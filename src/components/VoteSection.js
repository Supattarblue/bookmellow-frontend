
import { useEffect, useState } from 'react';
import { apiRequest } from '../api/backend';
import { useAuth } from '../context/AuthContext';

function VoteSection({ bookId }) {
  const { user } = useAuth();

  const [summary, setSummary] = useState({
    average_rating: 0,
    total_votes: 0,
  });

  const [userVote, setUserVote] = useState(null);
  const [selectedRating, setSelectedRating] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let active = true;

    async function loadVote() {
      try {
        setLoading(true);
        setError('');

        const data = await apiRequest(`/api/books/${bookId}/vote`);

        if (!active) return;

        setSummary(data.summary || {
          average_rating: 0,
          total_votes: 0,
        });

        setUserVote(data.user_vote || null);
        setSelectedRating(data.user_vote?.rating || 0);
      } catch (err) {
        if (active) {
          setError(err.message || 'ไม่สามารถโหลดคะแนนได้');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (bookId) {
      loadVote();
    }

    return () => {
      active = false;
    };
  }, [bookId]);

  const handleVote = async () => {
    if (!user) {
      setMessage('กรุณาเข้าสู่ระบบก่อนให้คะแนนหนังสือ');
      return;
    }

    if (selectedRating < 1 || selectedRating > 5) {
      setMessage('กรุณาเลือกคะแนน 1–5 ดาว');
      return;
    }

    try {
      setSaving(true);
      setError('');
      setMessage('');

      const data = await apiRequest(`/api/books/${bookId}/vote`, {
        method: 'PUT',
        body: JSON.stringify({
          rating: selectedRating,
        }),
      });

      setUserVote(data.vote);
      setMessage('บันทึกคะแนนเรียบร้อยแล้ว');

      const updated = await apiRequest(`/api/books/${bookId}/vote`);

      setSummary(updated.summary);
      setUserVote(updated.user_vote || data.vote);
    } catch (err) {
      setError(err.message || 'ไม่สามารถบันทึกคะแนนได้');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>กำลังโหลดคะแนน...</p>;
  }

  return (
    <section className="vote-section">
      <h3>คะแนนจากผู้อ่าน</h3>

      <div className="vote-summary">
        <span className="vote-average">
          {Number(summary.average_rating || 0).toFixed(1)}
        </span>
        <span> / 5 ดาว</span>
        <p>จากผู้โหวต {summary.total_votes || 0} คน</p>
      </div>

      <div className="vote-input">
        <p>
          {userVote
            ? 'คะแนนที่คุณเคยให้'
            : 'คุณให้คะแนนหนังสือเล่มนี้เท่าไร?'}
        </p>

        <div className="vote-stars">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              className={rating <= selectedRating ? 'active' : ''}
              onClick={() => setSelectedRating(rating)}
              disabled={!user || saving}
              aria-label={`ให้ ${rating} ดาว`}
            >
              ★
            </button>
          ))}
        </div>

        {user ? (
          <button
            type="button"
            className="vote-submit"
            onClick={handleVote}
            disabled={saving || selectedRating === 0}
          >
            {saving
              ? 'กำลังบันทึก...'
              : userVote
                ? 'แก้ไขคะแนน'
                : 'ส่งคะแนน'}
          </button>
        ) : (
          <p className="vote-login-message">
            เข้าสู่ระบบเพื่อให้คะแนนหนังสือ
          </p>
        )}
      </div>

      {message && <p className="vote-message">{message}</p>}
      {error && <p className="vote-error">{error}</p>}
    </section>
  );
}

export default VoteSection;

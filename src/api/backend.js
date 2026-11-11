
const API_URL = process.env.REACT_APP_API_URL;

export async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('bookmellow_token');

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const contentType = response.headers.get('content-type');

  const result = contentType?.includes('application/json')
    ? await response.json()
    : null;

  if (!response.ok) {
    throw new Error(
      result?.error ||
      result?.message ||
      `เกิดข้อผิดพลาด (${response.status})`
    );
  }

  return result;
}

// ดึงรายการหนังสือ
export async function getBooks() {
  const result = await apiRequest('/api/books');
  return result.data || [];
}

// ดึงหมวดหมู่หนังสือ
export async function getCategories() {
  const result = await apiRequest('/api/categories');
  return result.data || [];
}

// เข้าสู่ระบบ
export async function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

// สมัครสมาชิก
export async function register(username, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      username,
      email,
      password,
    }),
  });
}

// ตรวจสอบข้อมูลสมาชิกที่เข้าสู่ระบบอยู่
export async function getMe() {
  return apiRequest('/api/auth/me');
}
// ดึงรีวิวของหนังสือ
export async function getBookReviews(bookId) {
  const result = await apiRequest(`/api/books/${bookId}/reviews`);
  return result.reviews || [];
}

// เพิ่มรีวิว
export async function createBookReview(bookId, rating, comment) {
  return apiRequest(`/api/books/${bookId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}

// แก้ไขรีวิว
export async function updateBookReview(reviewId, rating, comment) {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify({ rating, comment }),
  });
}

// ลบรีวิว
export async function deleteBookReview(reviewId) {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}
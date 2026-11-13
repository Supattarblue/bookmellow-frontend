
const API_URL = process.env.REACT_APP_API_URL;

export async function apiRequest(path, options = {}) {
  if (!API_URL) {
    throw new Error('ไม่พบ REACT_APP_API_URL ใน Environment Variables');
  }

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

// หนังสือจาก Supabase
export async function getBooks(options = {}) {
  const params = new URLSearchParams();

  const search = options.search?.trim() || '';
  const category = options.category?.trim() || '';

  if (search) params.set('search', search);
  if (category && category !== 'ทั้งหมด') {
    params.set('category', category);
  }

  const query = params.toString();
  const result = await apiRequest(
    `/api/books${query ? `?${query}` : ''}`
  );

  return Array.isArray(result?.data) ? result.data : [];
}

// หนังสือเพิ่มเติมจาก Google Books สำหรับหน้า Home
export async function getDiscoverBooks() {
  const result = await apiRequest('/api/books/discover');

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.books)) return result.books;

  console.warn('รูปแบบข้อมูล Discover ไม่ถูกต้อง:', result);
  return [];
}

export async function getCategories() {
  const result = await apiRequest('/api/categories');
  return Array.isArray(result?.data) ? result.data : [];
}

export async function login(email, password) {
  return apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(username, email, password) {
  return apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

// ขออีเมลสำหรับรีเซ็ตรหัสผ่าน
export async function forgotPassword(email) {
  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

// ตั้งรหัสผ่านใหม่
export async function resetPassword(token, newPassword) {
  return apiRequest('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({
      token,
      new_password: newPassword,
    }),
  });
}

export async function getMe() {
  return apiRequest('/api/auth/me');
}

export async function getBookReviews(bookId) {
  const result = await apiRequest(`/api/books/${bookId}/reviews`);
  return Array.isArray(result?.reviews) ? result.reviews : [];
}

export async function createBookReview(bookId, rating, comment) {
  return apiRequest(`/api/books/${bookId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}

export async function updateBookReview(reviewId, rating, comment) {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify({ rating, comment }),
  });
}

export async function deleteBookReview(reviewId) {
  return apiRequest(`/api/reviews/${reviewId}`, {
    method: 'DELETE',
  });
}

// หนังสือสำหรับหน้า Admin
export async function adminGetBooks() {
  const result = await apiRequest('/api/admin/books');
  return Array.isArray(result?.data) ? result.data : [];
}

// ค้นหาหนังสือภาษาไทยจาก Google Books เพื่อให้แอดมินเลือกเอง
export async function searchGoogleBooks(query, options = {}) {
  const params = new URLSearchParams();
  params.set('q', query);

  if (options.lang) params.set('lang', options.lang);
  if (options.genre) params.set('genre', options.genre);

  const result = await apiRequest(
    `/api/admin/external-books?${params.toString()}`
  );

  return Array.isArray(result?.data) ? result.data : [];
}

// เพิ่มหนังสือที่แอดมินเลือกเอง หรือกรอกข้อมูลด้วยตนเอง
export async function adminCreateBook(book) {
  if (!book?.title?.trim()) {
    throw new Error('กรุณาระบุชื่อหนังสือ');
  }

  if (!book?.author?.trim()) {
    throw new Error('กรุณาระบุชื่อผู้แต่ง');
  }

  return apiRequest('/api/admin/books', {
    method: 'POST',
    body: JSON.stringify({
      title: book.title.trim(),
      author: book.author.trim(),
      description: (book.description || '').trim(),
      cover_url: book.cover_url?.trim() || null,
      published_year: book.published_year || null,
      category_ids: Array.isArray(book.category_ids)
        ? book.category_ids
        : [],
    }),
  });
}

// นำเข้าหนังสืออัตโนมัติจาก Google Books แล้วบันทึกลง Supabase
export async function adminBulkImportBooks() {
  return apiRequest('/api/admin/books/bulk-import', {
    method: 'POST',
  });
}

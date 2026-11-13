
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

  const responseText = await response.text();

  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch {
      result = { message: responseText };
    }
  }

  if (!response.ok) {
    throw new Error(
      result?.error ||
      result?.message ||
      `เกิดข้อผิดพลาด (${response.status})`
    );
  }

  return result;
}

// ========================================
// BOOKS
// ========================================

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

export async function getDiscoverBooks() {
  const result = await apiRequest('/api/books/discover');

  if (Array.isArray(result)) return result;
  if (Array.isArray(result?.data)) return result.data;
  if (Array.isArray(result?.data?.data)) return result.data.data;
  if (Array.isArray(result?.books)) return result.books;

  console.warn('รูปแบบข้อมูล Discover ไม่ถูกต้อง:', result);
  return [];
}

// ========================================
// CATEGORIES
// ========================================

export async function getCategories() {
  const result = await apiRequest('/api/categories');

  return Array.isArray(result?.data) ? result.data : [];
}

// ========================================
// AUTHENTICATION
// ========================================

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

// เปลี่ยนรหัสผ่านด้วยอีเมลสมาชิก
export async function forgotPassword(email, newPassword) {
  if (!email?.trim() || !newPassword) {
    throw new Error('กรุณากรอกอีเมลและรหัสผ่านใหม่');
  }

  return apiRequest('/api/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({
      email: email.trim(),
      new_password: newPassword,
    }),
  });
}

export async function getMe() {
  return apiRequest('/api/auth/me');
}

// ========================================
// REVIEWS
// ========================================

export async function getBookReviews(bookId) {
  const result = await apiRequest(
    `/api/books/${encodeURIComponent(bookId)}/reviews`
  );

  return Array.isArray(result?.reviews) ? result.reviews : [];
}

export async function createBookReview(bookId, rating, comment) {
  return apiRequest(
    `/api/books/${encodeURIComponent(bookId)}/reviews`,
    {
      method: 'POST',
      body: JSON.stringify({ rating, comment }),
    }
  );
}

export async function updateBookReview(reviewId, rating, comment) {
  return apiRequest(
    `/api/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'PUT',
      body: JSON.stringify({ rating, comment }),
    }
  );
}

export async function deleteBookReview(reviewId) {
  return apiRequest(
    `/api/reviews/${encodeURIComponent(reviewId)}`,
    {
      method: 'DELETE',
    }
  );
}

// ========================================
// ADMIN - BOOK MANAGEMENT
// ========================================

export async function adminGetBooks() {
  const result = await apiRequest('/api/admin/books');

  return Array.isArray(result?.data) ? result.data : [];
}

export async function adminGetBook(bookId) {
  const result = await apiRequest(
    `/api/admin/books/${encodeURIComponent(bookId)}`
  );

  return result?.book || result?.data || result;
}

export async function searchGoogleBooks(query, options = {}) {
  const keyword = query?.trim();

  if (!keyword) {
    throw new Error('กรุณาระบุชื่อหนังสือที่ต้องการค้นหา');
  }

  const params = new URLSearchParams();
  params.set('q', keyword);

  if (options.lang) {
    params.set('lang', options.lang);
  }

  if (options.genre) {
    params.set('genre', options.genre);
  }

  const result = await apiRequest(
    `/api/admin/external-books?${params.toString()}`
  );

  return Array.isArray(result?.data) ? result.data : [];
}

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

export async function adminUpdateBook(bookId, book) {
  if (!book?.title?.trim()) {
    throw new Error('กรุณาระบุชื่อหนังสือ');
  }

  if (!book?.author?.trim()) {
    throw new Error('กรุณาระบุชื่อผู้แต่ง');
  }

  return apiRequest(
    `/api/admin/books/${encodeURIComponent(bookId)}`,
    {
      method: 'PUT',
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
    }
  );
}

export async function adminDeleteBook(bookId) {
  return apiRequest(
    `/api/admin/books/${encodeURIComponent(bookId)}`,
    {
      method: 'DELETE',
    }
  );
}

export async function adminBulkImportBooks() {
  return apiRequest('/api/admin/books/bulk-import', {
    method: 'POST',
  });
}


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

// ดึงหนังสือจาก Backend พร้อมค้นหาและกรองหมวดหมู่
export async function getBooks(options = {}) {
  const params = new URLSearchParams();

  const search = options.search?.trim() || '';
  const category = options.category?.trim() || '';

  if (search) {
    params.set('search', search);
  }

  if (category && category !== 'ทั้งหมด') {
    params.set('category', category);
  }

  const query = params.toString();

  const result = await apiRequest(
    `/api/books${query ? `?${query}` : ''}`
  );

  return result.data || [];
}

export async function getCategories() {
  const result = await apiRequest('/api/categories');
  return result.data || [];
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

export async function getMe() {
  return apiRequest('/api/auth/me');
}

export async function getBookReviews(bookId) {
  const result = await apiRequest(`/api/books/${bookId}/reviews`);
  return result.reviews || [];
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

export async function adminGetBooks() {
  const result = await apiRequest('/api/admin/books');
  return result.data || [];
}

export async function searchGoogleBooks(query, options = {}) {
  const params = new URLSearchParams();

  params.set('q', query);

  if (options.lang) {
    params.set('lang', options.lang);
  }

  if (options.genre) {
    params.set('genre', options.genre);
  }

  const result = await apiRequest(
    `/api/admin/external-books?${params.toString()}`
  );

  return result.data || [];
}

export async function adminCreateBook(book) {
  return apiRequest('/api/admin/books', {
    method: 'POST',
    body: JSON.stringify({
      title: book.title,
      author: book.author,
      description: book.description,
      cover_url: book.cover_url,
      published_year: book.published_year,
      category_ids: book.category_ids || [],
    }),
  });
}

export async function adminBulkImportBooks() {
  return apiRequest('/api/admin/books/bulk-import', {
    method: 'POST',
  });
}

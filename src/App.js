
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import { AuthProvider } from './context/AuthContext';

// General pages
import Home from './pages/Home';
import Books from './pages/Books';

// Authentication pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Member pages
import Profile from './pages/Profile';
import MyBookshelf from './pages/MyBookshelf';
import Interests from './pages/Interests';
import Recommendations from './pages/Recommendations';

// Admin pages
import AdminDashboard from './pages/AdminDashboard';
import AdminBooks from './pages/AdminBooks';
import AdminBookAdd from './pages/AdminBookAdd';
import AdminBookEdit from './pages/AdminBookEdit';
import AdminMembers from './pages/AdminMembers';
import AdminReviews from './pages/AdminReviews';

// Error pages
import Forbidden from './pages/Forbidden';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="flex min-h-screen flex-col bg-autumn-cream text-autumn-dark">
          <Header />

          <main className="flex-1">
            <Routes>
              {/* General */}
              <Route path="/" element={<Home />} />
              <Route path="/books" element={<Books />} />

              {/* Authentication */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route
                path="/forgot-password"
                element={<ForgotPassword />}
              />
              <Route
                path="/reset-password"
                element={<ResetPassword />}
              />

              {/* Error */}
              <Route path="/403" element={<Forbidden />} />

              {/* Member pages */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/my-bookshelf"
                element={
                  <ProtectedRoute>
                    <MyBookshelf />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/interests"
                element={
                  <ProtectedRoute>
                    <Interests />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/recommendations"
                element={
                  <ProtectedRoute>
                    <Recommendations />
                  </ProtectedRoute>
                }
              />

              {/* Admin Dashboard */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Book Management */}
              <Route
                path="/admin/books"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBooks />
                  </ProtectedRoute>
                }
              />

              {/* Add Book */}
              <Route
                path="/admin/books/add"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBookAdd />
                  </ProtectedRoute>
                }
              />

              {/* Edit Book */}
              <Route
                path="/admin/books/edit/:id"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminBookEdit />
                  </ProtectedRoute>
                }
              />

              {/* Admin Member Management */}
              <Route
                path="/admin/members"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminMembers />
                  </ProtectedRoute>
                }
              />

              {/* Admin Review Management */}
              <Route
                path="/admin/reviews"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminReviews />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>

          <Footer />
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

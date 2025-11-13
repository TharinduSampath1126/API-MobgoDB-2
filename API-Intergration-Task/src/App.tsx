// DemoPage was previously used directly; routes now point to UsersTable and NewlyAddedUsersTable
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewlyAddedUsersTable from './pages/pageA/users';
import UsersTable from './pages/pageB/products';
import AdminDashboard from './pages/admin/Dashboard';
import Layout from './components/layout/layout';
import NotFound from './pages/NotFound/NotFound';
import LoginPage from './pages/auth/loging';
import SignupPage from './pages/auth/signup';
import UserProfile from './components/user-profile/profile';
import ErrorBoundary from './components/ErrorBoundary';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PublicRoute } from './components/auth/PublicRoute';
import { Toaster } from 'sonner';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <Toaster
            position="bottom-right"
            duration={4000}
            toastOptions={{
              style: {
                padding: '16px',
                fontSize: '14px',
              },
            }}
          />

          <Routes>
            <Route 
              path="/" 
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <PublicRoute>
                  <SignupPage />
                </PublicRoute>
              } 
            />

            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="mx-5">
                      <br />
                      <AdminDashboard />
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="mx-5">
                      <br />
                      <UsersTable />
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute>
                  <Layout>
                    <div className="mx-5">
                      <br />
                      <NewlyAddedUsersTable />
                    </div>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <UserProfile />
                  </Layout>
                </ProtectedRoute>
              }
            />
            {/* Catch-all route for 404 errors */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;

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
import ErrorBoundary from './components/ErrorBoundary';
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
          <Route path="/" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <Layout>
                <div className="mx-5">
                  <br />
                  <AdminDashboard />
                </div>
              </Layout>
            }
          />
          <Route
            path="/products"
            element={
              <Layout>
                <div className="mx-5">
                  <br />
                  <UsersTable />
                </div>
              </Layout>
            }
          />
          <Route
            path="/users"
            element={
              <Layout>
                <div className="mx-5">
                  <br />
                  <NewlyAddedUsersTable />
                </div>
              </Layout>
            }
          />
          {/* Catch-all route for 404 errors */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;

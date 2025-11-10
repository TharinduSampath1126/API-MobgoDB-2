// DemoPage was previously used directly; routes now point to UsersTable and NewlyAddedUsersTable
import { Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import NewlyAddedUsersTable from './pages/pageA/users';
import UsersTable from './pages/pageB/products';
import AdminDashboard from './pages/admin/Dashboard';
import Layout from './components/layout/layout';
import { Toaster, toast } from 'sonner'

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
    
    <QueryClientProvider client={queryClient}>
      <Layout>
        <div className='mx-5 '>
          <Toaster />
          <br />

          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/products" element={<UsersTable />} />
            <Route path="/users" element={<NewlyAddedUsersTable />} />
          </Routes>

        </div>
      </Layout>
    </QueryClientProvider>
  );
}

export default App;

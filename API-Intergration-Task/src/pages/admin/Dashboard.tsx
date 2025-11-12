import * as React from 'react';
import { Users, BarChart2, Zap, Package, TrendingUp, Activity, User, Eye } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useUsers } from '@/hooks/useUserQueries';
import { useProducts } from '@/hooks/useProductQueries';
import { usePostStore } from '@/store/postStore';
import { Button } from '@/components/ui/button';


// Chart imports
import 'chart.js/auto';
import { Bar, Doughnut } from 'react-chartjs-2';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: users = [], isLoading } = useUsers();
  const { data: products = [] } = useProducts();
  const newPosts = usePostStore((s) => s.newPosts);

  // Combine persisted newly-added users (from local store) with fetched users,
  // placing newly-added users first and avoiding duplicates by id.
  const combinedUsers = React.useMemo(() => {
    if (!users) return newPosts ?? [];
    const existingIds = new Set((newPosts || []).map((p) => p.id));
    const others = (users || []).filter((u: any) => !existingIds.has(u.id));
    return [...(newPosts || []), ...others];
  }, [users, newPosts]);

  // Chart data generation helpers

  // Products by category chart data
  const productCategoryData = React.useMemo(() => {
    if (!products || products.length === 0) {
      // Fallback data when no products loaded
      return {
        labels: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Other'],
        datasets: [
          {
            data: [25, 20, 15, 12, 10, 8],
            backgroundColor: [
              'rgba(59,130,246,0.8)',
              'rgba(16,185,129,0.8)', 
              'rgba(245,158,11,0.8)',
              'rgba(239,68,68,0.8)',
              'rgba(139,92,246,0.8)',
              'rgba(156,163,175,0.8)',
            ],
            borderWidth: 0,
          },
        ],
      };
    }

    // Group products by category
    const categoryCount = products.reduce((acc: any, product: any) => {
      const category = product.category || 'Other';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    const categories = Object.keys(categoryCount);
    const counts = Object.values(categoryCount);
    const colors = [
      'rgba(59,130,246,0.8)', 'rgba(16,185,129,0.8)', 'rgba(245,158,11,0.8)',
      'rgba(239,68,68,0.8)', 'rgba(139,92,246,0.8)', 'rgba(156,163,175,0.8)',
      'rgba(236,72,153,0.8)', 'rgba(14,165,233,0.8)'
    ];

    return {
      labels: categories,
      datasets: [
        {
          data: counts,
          backgroundColor: colors.slice(0, categories.length),
          borderWidth: 0,
        },
      ],
    };
  }, [products]);

  // Product price ranges chart data
  const productPriceData = React.useMemo(() => {
    if (!products || products.length === 0) {
      return {
        labels: ['$0-50', '$50-100', '$100-200', '$200-500', '$500+'],
        datasets: [
          {
            label: 'Products Count',
            data: [15, 25, 30, 20, 10],
            backgroundColor: 'rgba(16,185,129,0.8)',
            borderColor: 'rgba(16,185,129,1)',
            borderWidth: 1,
          },
        ],
      };
    }

    const priceRanges = {
      '$0-50': 0,
      '$50-100': 0, 
      '$100-200': 0,
      '$200-500': 0,
      '$500+': 0,
    };

    products.forEach((product: any) => {
      const price = product.price || 0;
      if (price <= 50) priceRanges['$0-50']++;
      else if (price <= 100) priceRanges['$50-100']++;
      else if (price <= 200) priceRanges['$100-200']++;
      else if (price <= 500) priceRanges['$200-500']++;
      else priceRanges['$500+']++;
    });

    return {
      labels: Object.keys(priceRanges),
      datasets: [
        {
          label: 'Products Count',
          data: Object.values(priceRanges),
          backgroundColor: 'rgba(16,185,129,0.8)',
          borderColor: 'rgba(16,185,129,1)',
          borderWidth: 1,
        },
      ],
    };
  }, [products]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(15,23,42,0.04)',
        },
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-black bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-2 text-lg">Welcome back! Here's what's happening with your data</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => navigate('/products')}
            className="hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Products
          </Button>
          <Button 
            onClick={() => navigate('/users')}
            className=" hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <User className="w-4 h-4 mr-2" />
            View Users
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">
                {isLoading ? '...' : combinedUsers.length}
              </p>
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Products</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">150+</p>
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +8% this week
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Active Sessions</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">24</p>
              <p className="text-blue-600 text-sm mt-1 flex items-center">
                <Activity className="w-3 h-3 mr-1" />
                Live now
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-lg">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border-0 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-600 text-sm font-medium">Performance</p>
              <p className="text-3xl font-bold text-slate-800 mt-1">98.5%</p>
              <p className="text-green-600 text-sm mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                Excellent
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl shadow-lg">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              Product Categories
            </h3>
            <p className="text-sm text-slate-500">Distribution</p>
          </div>
          <div className="h-64">
            <Doughnut data={productCategoryData} options={doughnutOptions} />
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl w-full mx-auto ">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-slate-800 flex items-center">
              <BarChart2 className="w-5 h-5 mr-2 text-green-600" />
              Product Price Ranges
            </h3>
            <p className="text-sm text-slate-500">Price distribution</p>
          </div>
          <div className="h-64">
            <Bar data={productPriceData} options={chartOptions} />
          </div>
        </div>
      </div>

      

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-500" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
                className="h-16 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300 transition-all duration-200"
              >
                <Package className="w-5 h-5 text-blue-600" />
                <span>Manage Products</span>
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/newly-added')}
                className="h-16 flex-col gap-2 hover:bg-green-50 hover:border-green-300 transition-all duration-200"
              >
                <Users className="w-5 h-5 text-green-600" />
                <span>Manage Users</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300 transition-all duration-200"
              >
                <BarChart2 className="w-5 h-5 text-purple-600" />
                <span>View Analytics</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-16 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300 transition-all duration-200"
              >
                <Activity className="w-5 h-5 text-orange-600" />
                <span>System Status</span>
              </Button>
            </div>
          </div>
        </div>

        {/* <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-6 text-white">
          <h3 className="text-xl font-semibold mb-4">System Health</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Server Status</span>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Online</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">Database</span>
              <span className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">Healthy</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-100">API Response</span>
              <span className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">125ms</span>
            </div>
          </div>
        </div> */}
      </div>

      

      {/* Recent Users */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-semibold text-slate-800 flex items-center">
            <Users className="w-5 h-5 mr-2 text-blue-600" />
            Recent Users
          </h2>
          <p className="text-slate-600 mt-1">Latest registered users in your system</p>
        </div>
        <div className="p-6">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                    <div className="h-3 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {(combinedUsers || []).slice(0, 6).map((u: any, index) => (
                <div key={u.id} className="flex items-center gap-4 p-4 rounded-lg hover:bg-slate-50 transition-colors duration-200">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold shadow-lg">
                    {((u.firstName || '').charAt(0) + (u.lastName || '').charAt(0)).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-800">{u.firstName} {u.lastName}</div>
                    <div className="text-slate-600 text-sm">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-slate-800">ID: {u.id}</div>
                    <div className="text-xs text-slate-500">
                      {index < 2 ? 'New' : 'Active'}
                    </div>
                  </div>
                </div>
              ))}
              {(!users || users.length === 0) && (
                <div className="text-center py-8 text-slate-500">
                  <Users className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                  <p>No users available</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

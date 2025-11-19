import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { ServerPagination } from '@/components/customUi/server-pagination';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Product {
  id: number;
  title: string;
  price: number;
  category: string;
  brand: string;
  stock: number;
  rating: number;
  thumbnail: string;
}

interface ApiResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export default function ProductsTable() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchProducts = async (page: number, limit: number, search = '') => {
    setLoading(true);
    try {
      const skip = (page - 1) * limit;
      let url = `https://dummyjson.com/products?limit=${limit}&skip=${skip}`;
      
      if (search) {
        url = `https://dummyjson.com/products/search?q=${search}&limit=${limit}&skip=${skip}`;
      }
      
      const response = await fetch(url);
      const data: ApiResponse = await response.json();
      
      setProducts(data.products);
      setTotal(data.total);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(currentPage, pageSize, searchQuery);
  }, [currentPage, pageSize, searchQuery]);

  // Arrow key navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && currentPage > 1) {
        setCurrentPage(prev => prev - 1);
      } else if (e.key === 'ArrowRight' && currentPage < Math.ceil(total / pageSize)) {
        setCurrentPage(prev => prev + 1);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentPage, total, pageSize]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Products (Use ← → arrow keys to navigate)</h2>
      
      <div className="mb-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
          className="max-w-sm"
        />
      </div>

      {loading && <div className="text-center py-4">Loading...</div>}
      
      <div className="border rounded-lg mb-6">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Image</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Brand</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <img 
                    src={product.thumbnail} 
                    alt={product.title}
                    className="w-12 h-12 object-cover rounded"
                  />
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{product.id}</td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs truncate">{product.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">${product.price}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ServerPagination
        page={currentPage}
        pages={totalPages}
        total={total}
        limit={pageSize}
        hasNext={currentPage < totalPages}
        hasPrev={currentPage > 1}
        onPageChange={setCurrentPage}
        onLimitChange={(limit) => {
          setPageSize(limit);
          setCurrentPage(1);
        }}
        loading={loading}
      />
    </div>
  );
}

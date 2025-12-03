import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ProductDialog } from '@/components/form/product-dialog';
import { ProductViewDialog } from '@/components/form/product-view-dialog';
import { Trash2, Edit2, Plus, Eye } from 'lucide-react';
import axios from 'axios';

interface Product {
  _id?: string;
  id?: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  description: string;
  image?: string;
}

const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const API_URL = RAW_API_BASE.endsWith('/products')
  ? RAW_API_BASE
  : `${RAW_API_BASE.replace(/\/+$/,'')}/products`;

export default function ManualProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_URL);
      setProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProduct = async (formData: any) => {
    try {
      let payload = { ...formData };

      // If image is a File, upload it to backend first and replace with returned URL
      if (formData.image && typeof formData.image !== 'string') {
        try {
          const uploadForm = new FormData();
          uploadForm.append('image', formData.image as File);

          const uploadUrl = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'}/images/upload`;
          const uploadResp = await axios.post(uploadUrl, uploadForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (uploadResp.data?.success && uploadResp.data?.url) {
            payload.image = uploadResp.data.url;
          } else {
            console.error('Image upload failed:', uploadResp.data);
            alert('Failed to upload image');
            return;
          }
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
          alert('Failed to upload image');
          return;
        }
      }

      const response = await axios.post(API_URL, payload);
      setProducts([...products, response.data.product]);
    } catch (error) {
      console.error('Error adding product:', error);
      alert('Failed to add product');
    }
  };

  const handleEditProduct = async (formData: any) => {
    if (editingProduct?._id) {
      try {
        const response = await axios.put(`${API_URL}/${editingProduct._id}`, formData);
        setProducts(products.map(p => p._id === editingProduct._id ? response.data.product : p));
        setEditingProduct(undefined);
      } catch (error) {
        console.error('Error updating product:', error);
        alert('Failed to update product');
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setProducts(products.filter(p => p._id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const openAddDialog = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const openViewDialog = (product: Product) => {
    setViewingProduct(product);
    setViewDialogOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manually Added Products</h2>
        <Button onClick={openAddDialog} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      <ProductDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={editingProduct ? handleEditProduct : handleAddProduct}
        initialData={editingProduct}
      />

      <ProductViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        product={viewingProduct}
      />

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : products.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p>No products added yet. Click "Add Product" to get started.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Image</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Brand</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Price</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stock</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    {product.image && (
                      <img src={product.image} alt={product.title} className="w-12 h-12 object-cover rounded" />
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{product.title}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.brand}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">${product.price}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.stock}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{product.rating}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(product)}
                        className="gap-1"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(product)}
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => product._id && handleDeleteProduct(product._id)}
                        className="gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

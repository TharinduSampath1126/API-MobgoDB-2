import axios from 'axios';

// Product type definition to match DummyJSON products structure
export interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
  rating: number;
  stock: number;
  description: string;
}

// Base API configuration from secret environment variables
const API_BASE_URL = import.meta.env.VITE_SECRET_API_BASE_URL || 'https://dummyjson.com';

// Debug: Secret URL එක console එකේ පේනවා!
console.log('🔍 Secret API URL:', API_BASE_URL);

// Product API functions
export async function fetchProducts(): Promise<Product[]> {
  try {
    const productsEndpoint = API_BASE_URL.endsWith('/products')
      ? API_BASE_URL
      : `${API_BASE_URL.replace(/\/+$/,'')}/products`;

    const res = await axios.get(productsEndpoint);
    const rawProducts = Array.isArray(res?.data?.products) ? res.data.products : [];
    const products: Product[] = rawProducts.map((product: any) => ({
      id: product.id,
      title: product.title || 'N/A',
      brand: product.brand || 'N/A',
      category: product.category || 'N/A',
      price: product.price || 0,
      rating: product.rating || 0,
      stock: product.stock || 0,
      description: product.description || 'N/A',
    }));
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductById(id: number): Promise<Product | null> {
  try {
    const productEndpoint = API_BASE_URL.endsWith('/products')
      ? `${API_BASE_URL}/${id}`
      : `${API_BASE_URL.replace(/\/+$/,'')}/products/${id}`;

    const res = await axios.get(productEndpoint);
    const data = res?.data ?? {};
    return {
      id: data.id,
      title: data.title || 'N/A',
      brand: data.brand || 'N/A',
      category: data.category || 'N/A',
      price: data.price || 0,
      rating: data.rating || 0,
      stock: data.stock || 0,
      description: data.description || 'N/A',
    };
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Export individual functions for React Query hooks
export const productApi = {
  fetchProducts,
  fetchProductById,
};

export default fetchProducts;
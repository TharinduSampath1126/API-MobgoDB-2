import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

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

interface ProductViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export function ProductViewDialog({ open, onOpenChange, product }: ProductViewDialogProps) {
  if (!product) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {product.image && (
            <img src={product.image} alt={product.title} className="w-full h-48 object-cover rounded" />
          )}

          <div>
            <p className="text-sm font-medium text-gray-600">Brand</p>
            <p className="text-sm text-gray-900">{product.brand}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Category</p>
            <p className="text-sm text-gray-900">{product.category}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Price</p>
              <p className="text-sm font-semibold text-gray-900">${product.price}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Stock</p>
              <p className="text-sm text-gray-900">{product.stock}</p>
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Rating</p>
            <p className="text-sm text-gray-900">{product.rating}/5</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600">Description</p>
            <p className="text-sm text-gray-900">{product.description || 'N/A'}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

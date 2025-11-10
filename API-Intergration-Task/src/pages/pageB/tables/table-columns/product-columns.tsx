import { ColumnDef } from '@tanstack/react-table';
import { Eye, Package, DollarSign, Star, Archive } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Product } from '@/apis/product';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

function ProductActionsCell({ product }: { product: Product }) {
  const [showDialog, setShowDialog] = useState(false);

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Eye className="h-4 w-4" />
        </Button>
        {/* <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-red-600 hover:text-red-800"
        >
          <Trash2 className="h-4 w-4" />
        </Button> */}
      </div>

      {/* Product Details Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Product Details
            </DialogTitle>
            <DialogDescription>
              Complete information about this product
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Product ID</label>
                <p className="text-sm font-mono bg-gray-100 p-2 rounded">{product.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Category</label>
                <p className="text-sm bg-gray-100 p-2 rounded">{product.category}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Product Name</label>
              <p className="text-sm font-semibold bg-gray-100 p-2 rounded">{product.title}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Brand</label>
              <p className="text-sm bg-gray-100 p-2 rounded">{product.brand}</p>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  Price
                </label>
                <p className="text-lg font-bold text-green-600 bg-gray-100 p-2 rounded">${product.price}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Rating
                </label>
                <p className="text-sm bg-gray-100 p-2 rounded">{product.rating}/5</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                  <Archive className="h-3 w-3" />
                  Stock
                </label>
                <p className="text-sm bg-gray-100 p-2 rounded">{product.stock}</p>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-600">Description</label>
              <p className="text-sm bg-gray-100 p-3 rounded leading-relaxed">{product.description}</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const productColumns: ColumnDef<Product>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
  },
  {
    accessorKey: 'title',
    header: 'Product Name',
  },
  {
    accessorKey: 'brand',
    header: 'Brand',
  },
  {
    accessorKey: 'category',
    header: 'Category',
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => `$${row.original.price}`,
  },
  {
    accessorKey: 'rating',
    header: 'Rating',
    cell: ({ row }) => `${row.original.rating}/5`,
  },
  {
    accessorKey: 'stock',
    header: 'Stock',
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => <ProductActionsCell product={row.original} />,
  },
];

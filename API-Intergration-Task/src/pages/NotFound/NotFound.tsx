import { Button } from '@/components/ui/button';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, ArrowLeft, AlertTriangle, RefreshCw } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        {/* Error Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-black rounded-full flex items-center justify-center shadow-lg">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Error Code */}
        <div className="mb-4">
          <h1 className="text-6xl font-bold bg-black bg-clip-text text-transparent">
            404
          </h1>
        </div>

        {/* Error Title */}
        <h2 className="text-2xl font-semibold text-slate-800 mb-3">
          Page Not Found
        </h2>

        {/* Error Description */}
        <p className="text-slate-600 mb-6 leading-relaxed">
          Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
        </p>

        {/* Current Path Info */}
        <div className="bg-slate-100 rounded-lg p-3 mb-6">
          <p className="text-sm text-slate-600">
            <strong>Current Path:</strong> 
            <code className="ml-1 bg-white px-2 py-1 rounded text-red-600">
              {location.pathname}
            </code>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="outline"
            className="flex-1 hover:bg-slate-50 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
          
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            className="flex-1 hover:bg-slate-50 transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          {/* <Button
            onClick={() => navigate('/')}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-4 h-4 mr-2" />
            Go Home
          </Button> */}
        </div>

        {/* Available Routes */}
        {/* <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm font-medium text-slate-700 mb-3">Available Pages:</p>
          <div className="space-y-2">
            <button
              onClick={() => navigate('/')}
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              🏠 Dashboard - <code>/</code>
            </button>
            <button
              onClick={() => navigate('/users')}
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              👥 Users - <code>/users</code>
            </button>
            <button
              onClick={() => navigate('/products')}
              className="block w-full text-left px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              📦 Products - <code>/products</code>
            </button>
          </div>
        </div> */}
      </div>
    </div>
  );
}
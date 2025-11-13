import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  User, 
  Mail, 
  Edit3, 
  Save, 
  X, 
  Shield, 
  Clock,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

const UserProfile: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [editForm, setEditForm] = useState({
    name: '',
  });

  // Update current time every second for real-time token expiration
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Fetch profile data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get token data from localStorage
      const tokenData = authService.getTokenData();
      
      if (tokenData && tokenData.userId && tokenData.name && tokenData.email) {
        // Use data from decoded token
        const profile = {
          id: tokenData.userId,
          name: tokenData.name,
          email: tokenData.email,
          createdAt: new Date(tokenData.iat * 1000).toISOString() // Convert timestamp to date
        };
        
        setProfileData(profile);
        setEditForm({
          name: profile.name || '',
        });
      } else {
        // Fallback to context user data if token data is not available
        if (user) {
          setProfileData({
            id: user.id,
            name: user.name,
            email: user.email,
          });
          setEditForm({
            name: user.name || '',
          });
        } else {
          throw new Error('No user data available');
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to load profile';
      setError(errorMessage);
      console.error('Profile loading error:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError(null);
    setSuccessMessage(null);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      name: profileData?.name || '',
    });
    setError(null);
    setSuccessMessage(null);
  };

  const handleSave = async () => {
    try {
      setSaveLoading(true);
      setError(null);
      
      // Validate name
      if (!editForm.name.trim()) {
        setError('Name is required');
        return;
      }

      // Update local state only (since we're using token-based data)
      setProfileData(prev => prev ? {
        ...prev,
        name: editForm.name.trim(),
      } : null);
      
      // Update token data in localStorage with new name
      const tokenData = authService.getTokenData();
      if (tokenData) {
        tokenData.name = editForm.name.trim();
        authService.setTokenData(tokenData);
      }
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully! (Local changes only)');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
      
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not available';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
          <p className="text-gray-500">Please log in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-gray-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold">
                {profileData?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold">{profileData?.name || 'User Profile'}</h1>
              <p className="text-blue-100">Welcome to your profile dashboard</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm opacity-90">Member since</div>
            <div className="font-semibold">
              {formatDate(profileData?.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-700">{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Profile Information Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center space-x-2">
            <User className="w-6 h-6 text-blue-600" />
            <span>Profile Information</span>
            <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded-full ml-2">
              📱 From JWT Token
            </span>
          </h2>
          
          {!isEditing ? (
            <Button 
              onClick={handleEdit}
              variant="outline" 
              className="flex items-center space-x-2 hover:bg-blue-50"
            >
              <Edit3 className="w-4 h-4" />
              <span>Edit Profile</span>
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={handleSave}
                disabled={saveLoading}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                {saveLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                disabled={saveLoading}
                className="flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </Button>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <User className="w-4 h-4" />
              <span>Full Name</span>
            </label>
            {isEditing ? (
              <Input
                name="name"
                value={editForm.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className="w-full"
                error={error && !editForm.name.trim() ? 'Name is required' : undefined}
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg border">
                <p className="text-gray-900">{profileData?.name || 'Not provided'}</p>
              </div>
            )}
          </div>

          {/* Email Field (Read-only) */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Mail className="w-4 h-4" />
              <span>Email Address</span>
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900">{profileData?.email || 'Not provided'}</p>
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
          </div>

          {/* User ID (Read-only) */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Shield className="w-4 h-4" />
              <span>User ID</span>
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900 font-mono text-sm">{profileData?.id || 'Not available'}</p>
            </div>
          </div>

          {/* Member Since (Read-only) */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Clock className="w-4 h-4" />
              <span>Member Since</span>
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <p className="text-gray-900">{formatDate(profileData?.createdAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* JWT Token Information Card */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-green-600" />
          <span>JWT Token Information</span>
        </h2>
        
        <div className="space-y-4">
          {(() => {
            const tokenData = authService.getTokenData();
            if (tokenData) {
              return (
                <div className="bg-gray-50 rounded-lg p-4 border">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">User ID (from token)</label>
                      <div className="p-2 bg-white rounded border text-sm font-mono">
                        {tokenData.userId}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Email (from token)</label>
                      <div className="p-2 bg-white rounded border text-sm">
                        {tokenData.email}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Name (from token)</label>
                      <div className="p-2 bg-white rounded border text-sm">
                        {tokenData.name}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Token Issued At</label>
                      <div className="p-2 bg-white rounded border text-sm">
                        {new Date(tokenData.iat * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Token Expires At</label>
                      <div className="p-2 bg-white rounded border text-sm">
                        {new Date(tokenData.exp * 1000).toLocaleString()}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">Token Status</label>
                      <div className={`p-2 rounded border text-sm font-medium ${
                        tokenData.exp > currentTime / 1000 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tokenData.exp > currentTime / 1000 ? '✅ Valid' : '❌ Expired'}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <label className="text-sm font-medium text-gray-700">Time Remaining</label>
                    <div className="p-2 bg-white rounded border text-sm font-mono">
                      {(() => {
                        const remaining = Math.max(0, tokenData.exp - currentTime / 1000);
                        const minutes = Math.floor(remaining / 60);
                        const seconds = Math.floor(remaining % 60);
                        return `${minutes}m ${seconds}s`;
                      })()}
                    </div>
                  </div>
                </div>
              );
            } else {
              return (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600" />
                  <span className="text-red-700">No JWT token data found</span>
                </div>
              );
            }
          })()}
        </div>
      </div>

      {/* Account Security Card */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center space-x-2">
          <Shield className="w-6 h-6 text-blue-600" />
          <span>Account Security</span>
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Account Verified</h3>
                <p className="text-sm text-green-600">Your account is secure and verified</p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Mail className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-medium text-blue-800">Email Notifications</h3>
                <p className="text-sm text-blue-600">Receive important updates via email</p>
              </div>
            </div>
            <div className="text-blue-600 font-medium">Enabled</div>
          </div>
        </div>
      </div> */}

      {/* Quick Actions */}
      {/* <div className="bg-white rounded-xl shadow-sm border p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-auto p-4 flex-col space-y-2 hover:bg-blue-50"
            onClick={() => window.location.reload()}
          >
            <User className="w-6 h-6 text-blue-600" />
            <span>Refresh Profile</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex-col space-y-2 hover:bg-green-50"
            onClick={() => setSuccessMessage('Feature coming soon!')}
          >
            <Mail className="w-6 h-6 text-green-600" />
            <span>Update Email</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto p-4 flex-col space-y-2 hover:bg-purple-50"
            onClick={() => setSuccessMessage('Feature coming soon!')}
          >
            <Shield className="w-6 h-6 text-purple-600" />
            <span>Security Settings</span>
          </Button>
        </div>
      </div> */}
    </div>
  );
};

export default UserProfile;

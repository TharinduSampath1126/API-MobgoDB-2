import React, { useState, useEffect } from 'react';

interface AuthStatusCheckerProps {
  onAuthLost?: () => void;
}

/**
 * Real-time Authentication Status Checker
 * Continuously monitors if auth_token cookie exists and is valid
 * Auto-triggers logout when token is missing or invalid
 */
export const AuthStatusChecker: React.FC<AuthStatusCheckerProps> = ({ onAuthLost }) => {
  const [status, setStatus] = useState<'checking' | 'authenticated' | 'unauthenticated'>('checking');
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [checkCount, setCheckCount] = useState(0);

  // Function to check authentication status via API call
  const checkAuthStatus = async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:5000/api/protected/profile', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const isAuthenticated = response.status === 200;
      setStatus(isAuthenticated ? 'authenticated' : 'unauthenticated');
      setLastCheck(new Date());
      setCheckCount(prev => prev + 1);

      // If authentication lost, trigger callback
      if (!isAuthenticated && onAuthLost) {
        console.log('🚨 AuthStatusChecker: Authentication lost - triggering callback');
        onAuthLost();
      }

      return isAuthenticated;
    } catch (error) {
      console.log('🔍 AuthStatusChecker: Network error during auth check:', error);
      // Don't change status on network errors
      setLastCheck(new Date());
      return false;
    }
  };

  // Auto-check authentication status
  useEffect(() => {
    // Initial check
    checkAuthStatus();

    // Set up regular checks every 5 seconds
    const interval = setInterval(checkAuthStatus, 5000);

    // Check on window focus
    const handleWindowFocus = () => {
      console.log('🔍 AuthStatusChecker: Window focused - checking auth');
      checkAuthStatus();
    };

    // Check on visibility change
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔍 AuthStatusChecker: Page visible - checking auth');
        checkAuthStatus();
      }
    };

    window.addEventListener('focus', handleWindowFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'authenticated': return 'bg-green-100 text-green-800 border-green-200';
      case 'unauthenticated': return 'bg-red-100 text-red-800 border-red-200';
      case 'checking': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'authenticated': return '🟢';
      case 'unauthenticated': return '🔴';
      case 'checking': return '🟡';
      default: return '⚪';
    }
  };

  const handleManualCheck = () => {
    console.log('🔍 AuthStatusChecker: Manual check triggered');
    checkAuthStatus();
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className={`border rounded-lg p-3 shadow-lg ${getStatusColor()}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <div>
              <div className="font-semibold text-sm">
                Auth Status: {status === 'authenticated' ? 'Active' : status === 'unauthenticated' ? 'Lost' : 'Checking'}
              </div>
              {lastCheck && (
                <div className="text-xs opacity-75">
                  Last checked: {lastCheck.toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>
          <button
            onClick={handleManualCheck}
            className="ml-2 px-2 py-1 bg-white bg-opacity-50 rounded text-xs hover:bg-opacity-75 transition-colors"
            title="Manual check"
          >
            🔄
          </button>
        </div>
        
        <div className="mt-2 text-xs space-y-1 opacity-90">
          <div>✅ Real-time monitoring: Active</div>
          <div>🔄 Checks every 5 seconds</div>
          <div>👁️ Checks on window focus</div>
          <div>📊 Total checks: {checkCount}</div>
        </div>

        {status === 'unauthenticated' && (
          <div className="mt-2 text-xs bg-red-50 border border-red-200 rounded p-2">
            <strong>⚠️ Cookie Missing:</strong><br />
            auth_token cookie has been deleted or expired.
            User should be logged out automatically.
          </div>
        )}
      </div>
    </div>
  );
};
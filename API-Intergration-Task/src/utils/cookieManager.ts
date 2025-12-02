// Cookie monitoring utility for detecting manual cookie deletion
export class CookieManager {
  private static instance: CookieManager;
  private cookieCheckInterval: NodeJS.Timeout | null = null;
  private onCookieDeletedCallback: (() => void) | null = null;

  private constructor() {}

  static getInstance(): CookieManager {
    if (!CookieManager.instance) {
      CookieManager.instance = new CookieManager();
    }
    return CookieManager.instance;
  }

  // Check if auth cookie exists
  hasAuthCookie(): boolean {
    return document.cookie.split(';').some(cookie => 
      cookie.trim().startsWith('auth_token=')
    );
  }

  // Start monitoring cookies for deletion via API validation
  // Since httpOnly cookies can't be read directly, we'll use API calls to detect cookie removal
  startCookieMonitoring(onCookieDeleted: () => void): void {
    this.onCookieDeletedCallback = onCookieDeleted;
    
    // Check every 10 seconds via API call to validate cookie existence
    this.cookieCheckInterval = setInterval(async () => {
      const hasToken = localStorage.getItem('token_data');
      
      if (hasToken) {
        try {
          // Make a quick API call to check if the cookie is valid
          const response = await fetch('http://localhost:5000/api/protected/profile', {
            method: 'GET',
            credentials: 'include'
          });
          
          // If API returns 401, cookie was removed or expired
          if (response.status === 401) {
            console.log('Cookie validation failed - cookie removed or expired');
            this.onCookieDeletedCallback?.();
          }
        } catch (error) {
          // Network error, don't trigger logout
          console.log('Network error during cookie validation:', error);
        }
      }
    }, 60 * 1000); // Check every 60 seconds
  }

  // Stop monitoring
  stopCookieMonitoring(): void {
    if (this.cookieCheckInterval) {
      clearInterval(this.cookieCheckInterval);
      this.cookieCheckInterval = null;
    }
    this.onCookieDeletedCallback = null;
  }
}

export const cookieManager = CookieManager.getInstance();
// Simple user storage for demo purposes
interface StoredUser {
  name: string;
  email: string;
  password: string;
}

class UserStorage {
  private storageKey = 'demo_users';

  // Get all registered users
  getUsers(): StoredUser[] {
    const users = localStorage.getItem(this.storageKey);
    return users ? JSON.parse(users) : [];
  }

  // Add a new user
  addUser(user: StoredUser): boolean {
    const users = this.getUsers();
    
    // Check if email already exists
    const existingUser = users.find(u => u.email.toLowerCase() === user.email.toLowerCase());
    if (existingUser) {
      throw new Error('Email already exists');
    }

    users.push(user);
    localStorage.setItem(this.storageKey, JSON.stringify(users));
    return true;
  }

  // Verify user credentials
  verifyUser(email: string, password: string): StoredUser | null {
    const users = this.getUsers();
    const user = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    return user || null;
  }

  // Check if email exists
  emailExists(email: string): boolean {
    const users = this.getUsers();
    return users.some(u => u.email.toLowerCase() === email.toLowerCase());
  }
}

export const userStorage = new UserStorage();
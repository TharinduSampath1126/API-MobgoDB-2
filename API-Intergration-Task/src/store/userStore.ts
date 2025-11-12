import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LoggedInUser {
  name: string;
  email: string;
}

interface UserStore {
  loggedInUser: LoggedInUser | null;
  setLoggedInUser: (user: LoggedInUser) => void;
  clearLoggedInUser: () => void;
  getFirstName: () => string;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      loggedInUser: null,
      setLoggedInUser: (user) => set({ loggedInUser: user }),
      clearLoggedInUser: () => set({ loggedInUser: null }),
      getFirstName: () => {
        const user = get().loggedInUser;
        if (!user || !user.name) return 'User';
        return user.name.split(' ')[0];
      },
    }),
    {
      name: 'logged-in-user-storage',
      storage: {
        getItem: (name) => {
          const str = sessionStorage.getItem(name);
          return str ? JSON.parse(str) : null;
        },
        setItem: (name, value) => {
          sessionStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => sessionStorage.removeItem(name),
      },
    }
  )
);
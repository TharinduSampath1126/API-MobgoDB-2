import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserSchema } from '@/components/data-table/columns';

interface UserStore {
  newPosts: User[];
  addPost: (user: User) => void;
  updatePost: (user: User) => void;
  removePost: (id: number) => void;
  clearPosts: () => void;
  // transient: last deleted item (not persisted)
  lastDeleted?: User | null;
  clearLastDeleted?: () => void;
}

export const usePostStore = create<UserStore>()(
  persist(
    (set, get) => ({
      newPosts: [],
      addPost: (user) => {
        try {
          const validatedUser = UserSchema.parse(user);
          set((state) => ({
            newPosts: [validatedUser, ...state.newPosts],
          }));
        } catch (error) {
          console.error('Invalid user data:', error);
        }
      },
      updatePost: (user) => {
        try {
          const validatedUser = UserSchema.parse(user);
          set((state) => ({
            newPosts: state.newPosts.map((p) => (p.id === validatedUser.id ? validatedUser : p)),
          }));
        } catch (error) {
          console.error('Invalid user data for update:', error);
        }
      },
      removePost: (id) => {
        // capture removed user so callers can show feedback even if row unmounts
        const removed = get().newPosts.find((p) => p.id === id) || null;
        set((state) => ({ newPosts: state.newPosts.filter((p) => p.id !== id) }));
        // set a transient value on the store (not persisted) by writing to state
        set({ lastDeleted: removed });
      },
      clearPosts: () => set({ newPosts: [] }),
      // transient helper: last deleted item and clear function
      lastDeleted: null,
      clearLastDeleted: () => set({ lastDeleted: null }),
    }),
    {
      name: 'new-users-storage',
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
      // only persist newPosts; do not persist lastDeleted or helpers
  partialize: (state) => ({ newPosts: state.newPosts } as any),
    }
  )
);

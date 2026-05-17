import { create } from 'zustand';

export type UserRole = 'admin' | 'user';

interface UserStoreState {
  role: UserRole;
  email: string | null;
  phoneNumber: string | null;
  setRole: (role: UserRole) => void;
  setCredentials: (email: string, phoneNumber: string) => void;
  clear: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  role: 'user', // Defaults to user
  email: null,
  phoneNumber: null,
  setRole: (role) => set({ role }),
  setCredentials: (email, phoneNumber) => set({ email, phoneNumber }),
  clear: () => set({ role: 'user', email: null, phoneNumber: null }),
}));

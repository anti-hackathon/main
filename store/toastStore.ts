import { create } from 'zustand';

export interface ToastConfig {
  type: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  visible: boolean;
}

interface ToastStore {
  toast: ToastConfig;
  showToast: (message: string, type?: 'success' | 'error' | 'info', title?: string) => void;
  hideToast: () => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toast: {
    type: 'info',
    message: '',
    visible: false,
  },
  showToast: (message, type = 'info', title) => {
    set({ toast: { type, message, visible: true, title } });
    
    // Auto-hide toast after 3.5 seconds
    setTimeout(() => {
      set((state) => ({ toast: { ...state.toast, visible: false } }));
    }, 3500);
  },
  hideToast: () => set((state) => ({ toast: { ...state.toast, visible: false } })),
}));

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: Toast[];
  add: (message: string, type?: ToastType) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],

  add: (message, type = 'success') => {
    const id = Math.random().toString(36).slice(2);
    set(s => ({ toasts: [...s.toasts, { id, message, type }] }));
    // Auto-dismiss after 3.5s
    setTimeout(() => {
      set(s => ({ toasts: s.toasts.filter(t => t.id !== id) }));
    }, 3500);
  },

  remove: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}));

// Convenience helpers
export const toast = {
  success: (msg: string) => useToastStore.getState().add(msg, 'success'),
  error:   (msg: string) => useToastStore.getState().add(msg, 'error'),
  info:    (msg: string) => useToastStore.getState().add(msg, 'info'),
};

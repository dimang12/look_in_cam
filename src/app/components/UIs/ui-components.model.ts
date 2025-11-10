// Shared UI types used by the UIComponentsService

export type ToastLevel = 'info' | 'success' | 'warning' | 'error';

export interface Toast {
  id: string;
  message: string;
  level?: ToastLevel;
  durationMs?: number; // if provided, the toast service may auto-dismiss
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

export interface DrawerState {
  id: string;
  open: boolean;
  payload?: any;
}

export interface UIState {
  toasts: Toast[];
  loadingCount: number;
  drawers: DrawerState[];
}

